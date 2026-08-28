import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { MessageCircle, Send, ArrowLeft, Building } from 'lucide-react-native';
import {
  useZoriTheme,
  font,
  fontSize,
  fontWeight,
  spacing,
  radius,
} from '@/src/design/useTheme';
import { Card, Button, EmptyState, Badge, Avatar, toast } from '@/src/ui';

export default function ChatScreen() {
  const t = useZoriTheme();

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
      toast.error('Nu am putut încărca camerele de chat.');
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
      toast.error('Nu s-a putut trimite mesajul: ' + e.message);
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
      style={[styles.container, { backgroundColor: t.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      {selectedRoom ? (
        // Detailed conversation window
        <View style={{ flex: 1 }}>
          <View style={[styles.chatHeader, { backgroundColor: t.background, borderBottomColor: t.border }]}>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => setSelectedRoom(null)}
              leftIcon={ArrowLeft}
              accessibilityLabel="Înapoi la conversații"
            >
              {' '}
            </Button>
            <Text
              style={[styles.chatHeaderTitle, { color: t.foreground }]}
              numberOfLines={1}
            >
              {selectedRoom.name || 'Chat Angajator'}
            </Text>
          </View>

          {messagesLoading ? (
            <View style={styles.messagesLoaderContainer}>
              <ActivityIndicator color={t.primary} />
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
                    {!isMe && (
                      <Text style={[styles.senderName, { color: t.mutedForeground }]}>
                        {item.sender_name}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isMe
                          ? { backgroundColor: t.primary, borderTopRightRadius: radius.sm }
                          : { backgroundColor: t.muted, borderColor: t.border, borderWidth: 1, borderTopLeftRadius: radius.sm },
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          {
                            color: isMe ? t.primaryForeground : t.foreground,
                          },
                        ]}
                      >
                        {item.content}
                      </Text>
                    </View>
                    <Text style={[styles.messageTime, { color: t.mutedForeground }]}>
                      {new Date(item.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              }}
              ListEmptyComponent={
                <EmptyState
                  icon={MessageCircle}
                  title="Niciun mesaj încă"
                  description="Trimite primul mesaj pentru a începe conversația."
                />
              }
            />
          )}

          {/* Chat Message Input Box */}
          <View style={[styles.inputContainer, { backgroundColor: t.background, borderTopColor: t.border }]}>
            <TextInput
              style={[
                styles.composerInput,
                {
                  backgroundColor: t.input,
                  borderColor: t.border,
                  color: t.foreground,
                  fontFamily: font.sans,
                  fontSize: fontSize.sm,
                },
              ]}
              placeholder="Scrie un mesaj..."
              placeholderTextColor={t.mutedForeground}
              value={newMessage}
              onChangeText={setNewMessage}
              accessibilityLabel="Mesaj nou"
            />
            <Button
              variant="primary"
              size="icon"
              onPress={handleSendMessage}
              leftIcon={Send}
              accessibilityLabel="Trimite mesaj"
            >
              {' '}
            </Button>
          </View>
        </View>
      ) : (
        // Inbox thread list view
        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={t.primary} />
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.emptyInboxContainer}>
              <EmptyState
                icon={MessageCircle}
                title="Nicio conversație"
                description="Conversațiile se deschid automat când aplicația ta la o tură este acceptată."
              />
            </View>
          ) : (
            <FlatList
              data={rooms}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.roomsList}
              renderItem={({ item }) => (
                <Card onPress={() => handleSelectRoom(item)} padding="md" style={styles.roomItem}>
                  <View style={styles.roomHeader}>
                    <View style={styles.roomTitleRow}>
                      <Avatar name={item.name || 'Chat'} size="sm" />
                      <Text
                        style={[styles.roomName, { color: t.foreground }]}
                        numberOfLines={1}
                      >
                        {item.name || 'Chat'}
                      </Text>
                    </View>
                    <Text style={[styles.roomTime, { color: t.mutedForeground }]}>
                      {timeAgo(item.last_message_at)}
                    </Text>
                  </View>

                  <View style={styles.roomMetaRow}>
                    <Building size={14} color={t.primary} />
                    <Badge variant="outline" size="sm">
                      Chat
                    </Badge>
                  </View>

                  {item.last_message ? (
                    <Text
                      style={[styles.lastMessage, { color: t.mutedForeground }]}
                      numberOfLines={1}
                    >
                      {item.last_sender_is_me ? 'Tu: ' : ''}
                      {item.last_message}
                    </Text>
                  ) : null}
                </Card>
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
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomsList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  roomItem: {
    gap: spacing.xs,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  roomName: {
    fontFamily: font.heading,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  roomTime: {
    fontFamily: font.sans,
    fontSize: fontSize.xs,
  },
  roomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  lastMessage: {
    fontFamily: font.sans,
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  emptyInboxContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  chatHeaderTitle: {
    fontFamily: font.heading,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  messagesLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  messageBubbleContainer: {
    maxWidth: '80%',
    marginBottom: spacing.xs,
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
    fontFamily: font.sans,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  messageBubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageText: {
    fontFamily: font.sans,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  messageTime: {
    fontFamily: font.sans,
    fontSize: 9,
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.sm,
    alignItems: 'flex-end',
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius['2xl'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});