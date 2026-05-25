import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { supabase } from '@/lib/supabase';
import { MessageSquare, User, Tag, Send, Plus, CornerDownRight } from 'lucide-react-native';

const CATEGORIES = ['GENERAL', 'INTREBARI', 'SFATURI', 'AJUTOR'];
const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General',
  INTREBARI: 'Întrebări',
  SFATURI: 'Sfaturi',
  AJUTOR: 'Ajutor',
};

export default function ForumScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Create Post state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('GENERAL');
  
  // Selected Post details state
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [dbUserId, setDbUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      if (userRow) setDbUserId(userRow.id);
    }
  }

  async function fetchPosts() {
    setLoading(true);
    try {
      const { data: postsData, error } = await supabase
        .from('forum_posts')
        .select('*, forum_comments(count)')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Resolve author names
      const authorIds = [...new Set(postsData.map(p => p.author_id))];
      const { data: workers } = await supabase.from('worker_profiles').select('user_id, full_name').in('user_id', authorIds);
      const { data: employers } = await supabase.from('employer_profiles').select('user_id, company_name').in('user_id', authorIds);

      const mappedPosts = postsData.map(post => {
        const worker = workers?.find(w => w.user_id === post.author_id);
        const employer = employers?.find(e => e.user_id === post.author_id);
        return {
          ...post,
          author_name: worker?.full_name || employer?.company_name || 'Utilizator Anonim',
          comment_count: post.forum_comments?.[0]?.count || 0,
        };
      });

      setPosts(mappedPosts);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Eroare', 'Nu am putut încărca postările.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePost() {
    if (!newTitle || !newContent) {
      Alert.alert('Atenție', 'Te rugăm să completezi titlul și conținutul.');
      return;
    }
    if (!dbUserId) {
      Alert.alert('Eroare', 'Trebuie să fii conectat.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('forum_posts').insert({
        author_id: dbUserId,
        title: newTitle,
        content: newContent,
        category: newCategory,
      });

      if (error) throw error;

      setNewTitle('');
      setNewContent('');
      setShowCreateModal(false);
      fetchPosts();
      Alert.alert('Succes', 'Subiectul tău de discuție a fost creat!');
    } catch (e: any) {
      Alert.alert('Eroare', e.message || 'Nu am putut crea postarea.');
      setLoading(false);
    }
  }

  async function fetchComments(postId: string) {
    setCommentsLoading(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      const authorIds = [...new Set(commentsData.map(c => c.author_id))];
      const { data: workers } = await supabase.from('worker_profiles').select('user_id, full_name').in('user_id', authorIds);
      const { data: employers } = await supabase.from('employer_profiles').select('user_id, company_name').in('user_id', authorIds);

      const mappedComments = commentsData.map(c => {
        const worker = workers?.find(w => w.user_id === c.author_id);
        const employer = employers?.find(e => e.user_id === c.author_id);
        return {
          ...c,
          author_name: worker?.full_name || employer?.company_name || 'Utilizator Anonim',
        };
      });

      setComments(mappedComments);
    } catch (e) {
      console.error(e);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleAddComment() {
    if (!newComment) return;
    if (!dbUserId || !selectedPost) return;

    try {
      const { error } = await supabase.from('forum_comments').insert({
        post_id: selectedPost.id,
        author_id: dbUserId,
        content: newComment,
      });

      if (error) throw error;

      setNewComment('');
      fetchComments(selectedPost.id);
      
      // Update comment count locally in post list
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === selectedPost.id) {
          return { ...p, comment_count: p.comment_count + 1 };
        }
        return p;
      }));
    } catch (e: any) {
      Alert.alert('Eroare', e.message || 'Nu am putut adăuga comentariul.');
    }
  }

  function handleSelectPost(post: any) {
    setSelectedPost(post);
    fetchComments(post.id);
  }

  function formatDate(isoString: string) {
    const d = new Date(isoString);
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  const filteredPosts = activeCategory 
    ? posts.filter(p => p.category === activeCategory)
    : posts;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      {selectedPost ? (
        // Detailed Thread view
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedPost(null)}>
            <Text style={styles.backButtonText}>← Înapoi la Forum</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.postDetailContainer}>
            <View style={styles.postDetailCard}>
              <View style={styles.detailMetaRow}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>{CATEGORY_LABELS[selectedPost.category]}</Text>
                </View>
                <Text style={styles.detailTime}>{formatDate(selectedPost.created_at)}</Text>
              </View>
              
              <Text style={styles.detailTitle}>{selectedPost.title}</Text>
              <Text style={styles.detailAuthor}>Publicat de: {selectedPost.author_name}</Text>
              <Text style={styles.detailContent}>{selectedPost.content}</Text>
            </View>

            <Text style={styles.commentsHeading}>Răspunsuri ({comments.length})</Text>

            {commentsLoading ? (
              <ActivityIndicator color="#e5c158" style={{ marginVertical: 16 }} />
            ) : comments.length === 0 ? (
              <Text style={styles.noCommentsText}>Nu există comentarii la acest subiect. Începe discuția!</Text>
            ) : (
              comments.map(comment => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAuthorRow}>
                      <CornerDownRight size={14} color="#64748b" style={{ marginRight: 6 }} />
                      <User size={12} color="#cbd5e1" style={{ marginRight: 4 }} />
                      <Text style={styles.commentAuthor}>{comment.author_name}</Text>
                    </View>
                    <Text style={styles.commentTime}>{formatDate(comment.created_at)}</Text>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              ))
            )}
          </ScrollView>

          {/* New Comment Input Box */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Adaugă un răspuns..."
              placeholderTextColor="#94a3b8"
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity style={styles.sendCommentButton} onPress={handleAddComment}>
              <Send size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : showCreateModal ? (
        // Create Thread view
        <ScrollView contentContainerStyle={styles.createFormContainer}>
          <Text style={styles.formTitle}>Subiect Nou</Text>

          <Text style={styles.label}>CATEGORIE</Text>
          <View style={styles.categoryPicker}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, newCategory === cat && styles.categoryBtnActive]}
                onPress={() => setNewCategory(cat)}
              >
                <Text style={[styles.categoryBtnText, newCategory === cat && styles.categoryBtnTextActive]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>TITLU DISCUȚIE</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Despre ce dorești să vorbești?"
            placeholderTextColor="#64748b"
            value={newTitle}
            onChangeText={setNewTitle}
          />

          <Text style={styles.label}>MESAJ/DETALII</Text>
          <TextInput
            style={[styles.formInput, styles.formTextarea]}
            placeholder="Scrie detaliile aici..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={6}
            value={newContent}
            onChangeText={setNewContent}
          />

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelBtnText}>Anulare</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleCreatePost}>
              <Text style={styles.saveBtnText}>Publică</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        // Thread list view
        <View style={{ flex: 1 }}>
          {/* Categories bar */}
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity
                style={[styles.filterChip, !activeCategory && styles.filterChipActive]}
                onPress={() => setActiveCategory(null)}
              >
                <Text style={[styles.filterChipText, !activeCategory && styles.filterChipTextActive]}>Toate</Text>
              </TouchableOpacity>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#e5c158" />
            </View>
          ) : (
            <FlatList
              data={filteredPosts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.threadCard} onPress={() => handleSelectPost(item)}>
                  <View style={styles.threadHeader}>
                    <View style={styles.categoryLabel}>
                      <Tag size={12} color="#cbd5e1" style={{ marginRight: 4 }} />
                      <Text style={styles.categoryLabelText}>{CATEGORY_LABELS[item.category]}</Text>
                    </View>
                    <Text style={styles.threadTime}>{formatDate(item.created_at)}</Text>
                  </View>

                  <Text style={styles.threadTitle}>{item.title}</Text>
                  <Text style={styles.threadSnippet} numberOfLines={2}>{item.content}</Text>

                  <View style={styles.threadFooter}>
                    <View style={styles.authorRow}>
                      <User size={12} color="#64748b" style={{ marginRight: 4 }} />
                      <Text style={styles.threadAuthor}>{item.author_name}</Text>
                    </View>

                    <View style={styles.commentCountRow}>
                      <MessageSquare size={13} color="#e5c158" style={{ marginRight: 4 }} />
                      <Text style={styles.commentCountText}>{item.comment_count} răspunsuri</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Nu am găsit nicio discuție activă.</Text>
                </View>
              }
            />
          )}

          {/* Floating Action Button for Thread Creation */}
          <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
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
  filterBar: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0a0f1d',
  },
  filterChip: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterChipActive: {
    backgroundColor: '#002b7f',
    borderColor: '#002b7f',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
    gap: 12,
  },
  threadCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryLabelText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
  },
  threadTime: {
    color: '#64748b',
    fontSize: 11,
  },
  threadTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  threadSnippet: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  threadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threadAuthor: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  commentCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCountText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#002b7f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#002b7f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0a0f1d',
  },
  backButtonText: {
    color: '#e5c158',
    fontSize: 13,
    fontWeight: '600',
  },
  postDetailContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  postDetailCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  detailMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaBadgeText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  detailTime: {
    color: '#64748b',
    fontSize: 11.5,
  },
  detailTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 24,
  },
  detailAuthor: {
    color: '#cbd5e1',
    fontSize: 12.5,
    marginBottom: 16,
    fontWeight: '500',
  },
  detailContent: {
    color: '#cbd5e1',
    fontSize: 14.5,
    lineHeight: 22,
  },
  commentsHeading: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  noCommentsText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 24,
  },
  commentCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#002b7f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginLeft: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAuthor: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  commentTime: {
    color: '#64748b',
    fontSize: 10.5,
  },
  commentContent: {
    color: '#cbd5e1',
    fontSize: 13.5,
    lineHeight: 18,
    paddingLeft: 18,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#0a0f1d',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
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
  sendCommentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#002b7f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createFormContainer: {
    padding: 24,
    gap: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryBtn: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBtnActive: {
    backgroundColor: '#002b7f',
    borderColor: '#002b7f',
  },
  categoryBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '500',
  },
  categoryBtnTextActive: {
    color: '#ffffff',
  },
  formInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontSize: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 6,
    letterSpacing: 1,
    marginTop: 8,
  },
  formTextarea: {
    height: 120,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    height: 40,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    height: 40,
    paddingHorizontal: 22,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#002b7f',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
