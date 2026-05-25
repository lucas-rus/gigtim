import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { supabase } from '@/lib/supabase';
import { MessageCircle, Send, User, Building, ArrowLeft } from 'lucide-react-native';

export default function ChatScreen() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [dbUserId, setDbUserId] = useState<string | null>(null);

  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    fetchUserAndRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;

    // Set up real-time listener for new messages
    const channel = supabase
      .channel(`room:${selectedRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoom.id}`,
        },
        async () => {
          // Refresh message list on new message insertion
          fetchMessages(selectedRoom.id, false);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [selectedRoom]);

  async function fetchUserAndRooms() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userRow) return;
      setDbUserId(userRow.id);

      // Get rooms user is a member of
      const { data: memberships } = await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', userRow.id);

      if (!memberships || memberships.length === 0) {
        setRooms([]);
        setLoading(false);
        return;
      }
      const roomIds = memberships.map(m => m.room_id);

      const { data: chatRooms, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .in('id', roomIds);

      if (error) throw error;

      if (!chatRooms || chatRooms.length === 0) {
        setRooms([]);
        setLoading(false);
        return;
      }

      // Resolve last message details
      const resolvedRooms = await Promise.all(chatRooms.map(async (room) => {
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('content, created_at, sender_id')
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const lastMsg = msgs?.[0] || null;
        return {
          ...room,
          last_message: lastMsg?.content || null,
          last_message_at: lastMsg?.created_at || room.created_at,
          last_sender_is_me: lastMsg?.sender_id === userRow.id,
        };
      }));

      // Sort by last message timestamp desc
      resolvedRooms.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      setRooms(resolvedRooms);
    } catch (e) {
      console.error(e);
      Alert.alert('Eroare', 'Nu am putut încărca camerele de chat.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(roomId: string, showLoader = true) {
    if (showLoader) setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        setMessages([]);
        return;
      }

      // Resolve sender names
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: workers } = await supabase.from('worker_profiles').select('user_id, full_name').in('user_id', senderIds);
      const { data: employers } = await supabase.from('employer_profiles').select('user_id, company_name').in('user_id', senderIds);

      const mappedMsgs = data.map(m => ({
        ...m,
        sender_name: workers?.find(w => w.user_id === m.sender_id)?.full_name
          || employers?.find(e => e.user_id === m.sender_id)?.company_name
          || 'Utilizator',
      }));

      setMessages(mappedMsgs);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoader) setMessagesLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedRoom || !dbUserId) return;
    const msgText = newMessage;
    setNewMessage('');

    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: selectedRoom.id,
        sender_id: dbUserId,
        content: msgText,
      });

      if (error) {
        setNewMessage(msgText); // Restore input text on error
        throw error;
      }
      fetchMessages(selectedRoom.id, false);
    } catch (e: any) {
      Alert.alert('Eroare', 'Nu s-a putut trimite mesajul: ' + e.message);
    }
  }

  function handleSelectRoom(room: any) {
    setSelectedRoom(room);
    fetchMessages(room.id);
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'acum';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}z`;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      {selectedRoom ? (
        // Detailed conversation window
        <View style={{ flex: 1 }}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedRoom(null)} style={styles.backButton}>
              <ArrowLeft size={20} color="#e5c158" />
            </TouchableOpacity>
            <Text style={styles.chatHeaderTitle} numberOfLines={1}>
              {selectedRoom.name || 'Chat Angajator'}
            </Text>
          </View>

          {messagesLoading ? (
            <View style={styles.messagesLoaderContainer}>
              <ActivityIndicator color="#e5c158" />
            </View>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              renderItem={({ item }) => {
                const isMe = item.sender_id === dbUserId;
                return (
                  <View style={[styles.messageBubbleContainer, isMe ? styles.myMessageContainer : styles.otherMessageContainer]}>
                    {!isMe && <Text style={styles.senderName}>{item.sender_name}</Text>}
                    <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.otherMessageBubble]}>
                      <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                        {item.content}
                      </Text>
                    </View>
                    <Text style={styles.messageTime}>{new Date(item.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyMessagesContainer}>
                  <Text style={styles.emptyMessagesText}>Nu există mesaje în această cameră.</Text>
                </View>
              }
            />
          )}

          {/* Chat Message Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Scrie un mesaj..."
              placeholderTextColor="#94a3b8"
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Send size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Inbox thread list view
        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#e5c158" />
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.emptyInboxContainer}>
              <MessageCircle size={48} color="#475569" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyInboxText}>Nicio conversație activă încă.</Text>
              <Text style={styles.emptyInboxSubtext}>Camerele de chat se deschid automat când aplicația ta la o tură este acceptată.</Text>
            </View>
          ) : (
            <FlatList
              data={rooms}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.roomsList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.roomItem} onPress={() => handleSelectRoom(item)}>
                  <View style={styles.roomHeader}>
                    <View style={styles.roomTitleRow}>
                      <Building size={16} color="#e5c158" style={{ marginRight: 6 }} />
                      <Text style={styles.roomName} numberOfLines={1}>{item.name || 'Chat'}</Text>
                    </View>
                    <Text style={styles.roomTime}>{timeAgo(item.last_message_at)}</Text>
                  </View>
                  
                  {item.last_message && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {item.last_sender_is_me ? 'Tu: ' : ''}{item.last_message}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomsList: {
    padding: 16,
    gap: 12,
  },
  roomItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomName: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
  roomTime: {
    color: '#64748b',
    fontSize: 11,
  },
  lastMessage: {
    color: '#cbd5e1',
    fontSize: 12.5,
    lineHeight: 16,
    paddingLeft: 22,
  },
  emptyInboxContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyInboxText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyInboxSubtext: {
    color: '#64748b',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0a0f1d',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  messagesLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    gap: 16,
  },
  messageBubbleContainer: {
    maxWidth: '80%',
    marginBottom: 4,
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '500',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myMessageBubble: {
    backgroundColor: '#002b7f',
    borderTopRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#cbd5e1',
  },
  messageTime: {
    color: '#475569',
    fontSize: 9,
    marginTop: 4,
  },
  emptyMessagesContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyMessagesText: {
    color: '#64748b',
    fontSize: 13.5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#0a0f1d',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 13.5,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#002b7f',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
