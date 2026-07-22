import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Tag, Send, Plus, CornerDownRight, MessagesSquare, ArrowLeft, User as UserIcon } from 'lucide-react-native';
import { useZoriTheme, font, fontSize, fontWeight, spacing, radius } from '@/src/design/useTheme';
import { Card, Button, Input, Textarea, EmptyState, Badge, toast } from '@/src/ui';
import { formatRelativeTime } from '@/src/utils/time';
import { ProfileViewModal } from '@/src/screens/ProfileViewModal';

const CATEGORIES = ['GENERAL', 'INTREBARI', 'SFATURI', 'AJUTOR'];
const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General',
  INTREBARI: 'Întrebări',
  SFATURI: 'Sfaturi',
  AJUTOR: 'Ajutor',
};

interface AuthorInfo {
  id: string;
  name: string;
  avatar_url: string | null;
}

export default function ForumScreen() {
  const t = useZoriTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('GENERAL');
  const [publishing, setPublishing] = useState(false);

  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  const [dbUserId, setDbUserId] = useState<string | null>(null);

  // Profile view modal
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

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
        .maybeSingle();
      if (userRow) setDbUserId(userRow.id);
    }
  }

  function openProfile(userId: string) {
    setViewingProfileId(userId);
    setProfileModalVisible(true);
  }

  async function resolveAuthors(authorIds: string[]): Promise<Record<string, AuthorInfo>> {
    if (authorIds.length === 0) return {};
    const { data: users } = await supabase
      .from('users')
      .select('id, avatar_url')
      .in('id', authorIds);
    const { data: workers } = await supabase
      .from('worker_profiles')
      .select('user_id, full_name')
      .in('user_id', authorIds);
    const { data: employers } = await supabase
      .from('employer_profiles')
      .select('user_id, company_name')
      .in('user_id', authorIds);

    const result: Record<string, AuthorInfo> = {};
    for (const id of authorIds) {
      const worker = workers?.find(w => w.user_id === id);
      const employer = employers?.find(e => e.user_id === id);
      const user = users?.find(u => u.id === id);
      result[id] = {
        id,
        name: worker?.full_name || employer?.company_name || 'Utilizator',
        avatar_url: user?.avatar_url || null,
      };
    }
    return result;
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

      const authorIds = [...new Set(postsData.map(p => p.author_id))];
      const authors = await resolveAuthors(authorIds);

      const mappedPosts = postsData.map(post => ({
        ...post,
        author_name: authors[post.author_id]?.name || 'Utilizator',
        author_avatar: authors[post.author_id]?.avatar_url || null,
        comment_count: post.forum_comments?.[0]?.count || 0,
      }));

      setPosts(mappedPosts);
    } catch (e: any) {
      console.error(e);
      toast.error('Nu am putut încărca postările.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePost() {
    if (!newTitle || !newContent) {
      toast.warning('Te rugăm să completezi titlul și conținutul.');
      return;
    }
    if (!dbUserId) {
      toast.error('Trebuie să fii conectat.');
      return;
    }

    setPublishing(true);
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
      setNewCategory('GENERAL');
      setShowCreateModal(false);
      fetchPosts();
      toast.success('Subiectul tău de discuție a fost creat!');
    } catch (e: any) {
      toast.error(e.message || 'Nu am putut crea postarea.');
    } finally {
      setPublishing(false);
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
      const authors = await resolveAuthors(authorIds);

      const mappedComments = commentsData.map(c => ({
        ...c,
        author_name: authors[c.author_id]?.name || 'Utilizator',
        author_avatar: authors[c.author_id]?.avatar_url || null,
      }));

      setComments(mappedComments);
    } catch (e) {
      console.error(e);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleAddComment() {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    if (!dbUserId || !selectedPost) return;

    setSendingComment(true);
    try {
      const { error } = await supabase.from('forum_comments').insert({
        post_id: selectedPost.id,
        author_id: dbUserId,
        content: trimmed,
      });

      if (error) throw error;

      setNewComment('');
      fetchComments(selectedPost.id);

      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === selectedPost.id) {
          return { ...p, comment_count: p.comment_count + 1 };
        }
        return p;
      }));
    } catch (e: any) {
      toast.error(e.message || 'Nu am putut adăuga comentariul.');
    } finally {
      setSendingComment(false);
    }
  }

  function handleSelectPost(post: any) {
    setSelectedPost(post);
    fetchComments(post.id);
  }

  const filteredPosts = activeCategory
    ? posts.filter(p => p.category === activeCategory)
    : posts;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: t.background }}
      keyboardVerticalOffset={90}
    >
      {selectedPost ? (
        <View style={{ flex: 1 }}>
          <Pressable
            style={[styles.backButton, { backgroundColor: t.background, borderBottomColor: t.border }]}
            onPress={() => setSelectedPost(null)}
            accessibilityRole="button"
          >
            <ArrowLeft color={t.primary} size={18} strokeWidth={2} />
            <Text style={{ color: t.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans, marginLeft: spacing.sm }}>
              Înapoi la Forum
            </Text>
          </Pressable>

          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
            <Card padding="lg" style={{ marginBottom: spacing.xl }}>
              <View style={styles.detailMetaRow}>
                <Badge variant="ghost">{CATEGORY_LABELS[selectedPost.category]}</Badge>
                <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontFamily: font.sans }}>
                  {formatRelativeTime(selectedPost.created_at)}
                </Text>
              </View>

              {/* Author row with avatar — clickable */}
              <Pressable
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.sm, marginBottom: spacing.xs }}
                onPress={() => openProfile(selectedPost.author_id)}
                accessibilityRole="button"
                accessibilityLabel={`Vezi profilul lui ${selectedPost.author_name}`}
              >
                <AvatarCircle avatarUrl={selectedPost.author_avatar} name={selectedPost.author_name} size={32} t={t} />
                <Text style={{ color: t.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
                  {selectedPost.author_name}
                </Text>
              </Pressable>

              <Text style={{
                color: t.foreground,
                fontSize: fontSize.lg,
                fontWeight: fontWeight.bold,
                fontFamily: font.heading,
                lineHeight: 24,
                marginTop: spacing.xs,
              }}>
                {selectedPost.title}
              </Text>
              <Text style={{
                color: t.cardForeground,
                fontSize: fontSize.base,
                lineHeight: 22,
                fontFamily: font.sans,
                marginTop: spacing.sm,
              }}>
                {selectedPost.content}
              </Text>
            </Card>

            <Text style={{
              color: t.foreground,
              fontSize: fontSize.base,
              fontWeight: fontWeight.bold,
              fontFamily: font.heading,
              marginBottom: spacing.sm,
              paddingHorizontal: spacing.xs,
            }}>
              Răspunsuri ({comments.length})
            </Text>

            {commentsLoading ? (
              <ActivityIndicator color={t.primary} style={{ marginVertical: spacing.lg }} />
            ) : comments.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Fără răspunsuri"
                description="Nu există comentarii la acest subiect. Începe discuția!"
              />
            ) : (
              comments.map(comment => (
                <View key={comment.id} style={{
                  backgroundColor: t.muted,
                  borderLeftWidth: 3,
                  borderLeftColor: t.primary,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  marginLeft: spacing.sm,
                }}>
                  {/* Comment author with avatar — clickable */}
                  <View style={[styles.commentHeader, { marginBottom: 8 }]}>
                    <Pressable
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}
                      onPress={() => openProfile(comment.author_id)}
                      accessibilityRole="button"
                    >
                      <AvatarCircle avatarUrl={comment.author_avatar} name={comment.author_name} size={24} t={t} />
                      <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
                        {comment.author_name}
                      </Text>
                    </Pressable>
                    <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontFamily: font.sans }}>
                      {formatRelativeTime(comment.created_at)}
                    </Text>
                  </View>
                  <Text style={{
                    color: t.cardForeground,
                    fontSize: fontSize.sm,
                    lineHeight: 18,
                    fontFamily: font.sans,
                    paddingLeft: 32,
                  }}>
                    {comment.content}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={[styles.commentInputContainer, { backgroundColor: t.card, borderTopColor: t.border }]}>
            <TextInput
              style={{
                flex: 1, height: 40, backgroundColor: t.input,
                borderWidth: 1, borderColor: t.border, borderRadius: radius.full,
                paddingHorizontal: spacing.md, color: t.foreground,
                fontSize: fontSize.sm, fontFamily: font.sans,
              }}
              placeholder="Adaugă un răspuns..."
              placeholderTextColor={t.mutedForeground}
              value={newComment}
              onChangeText={setNewComment}
            />
            <Pressable
              style={{
                width: 40, height: 40, borderRadius: radius.full,
                backgroundColor: t.primaryStrong,
                justifyContent: 'center', alignItems: 'center',
                opacity: sendingComment ? 0.6 : 1,
              }}
              onPress={handleAddComment}
              disabled={sendingComment}
              accessibilityRole="button"
              accessibilityLabel="Trimite comentariu"
            >
              {sendingComment
                ? <ActivityIndicator color={t.primaryForeground} size="small" />
                : <Send size={16} color={t.primaryForeground} strokeWidth={2} />}
            </Pressable>
          </View>
        </View>
      ) : showCreateModal ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: t.background }}
        >
          <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
            <View style={styles.createHeader}>
              <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: t.foreground, fontFamily: font.heading }}>
                Subiect Nou
              </Text>
              <Pressable onPress={() => setShowCreateModal(false)} accessibilityRole="button" hitSlop={8}>
                <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.sans }}>Închide</Text>
              </Pressable>
            </View>

            <View>
              <Text style={{ color: t.mutedForeground, fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.sm }}>
                CATEGORIE
              </Text>
              <View style={styles.categoryPicker}>
                {CATEGORIES.map(cat => (
                  <Pressable
                    key={cat}
                    style={[styles.categoryBtn, {
                      backgroundColor: newCategory === cat ? t.primaryStrong : t.muted,
                      borderColor: newCategory === cat ? t.primaryStrong : t.border,
                    }]}
                    onPress={() => setNewCategory(cat)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: newCategory === cat }}
                  >
                    <Text style={{
                      color: newCategory === cat ? t.primaryForeground : t.mutedForeground,
                      fontSize: fontSize.xs, fontWeight: fontWeight.medium, fontFamily: font.sans,
                    }}>
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Input label="Titlu discuție" placeholder="Despre ce dorești să vorbești?" value={newTitle} onChangeText={setNewTitle} />
            <Textarea label="Mesaj / detalii" placeholder="Scrie detaliile aici..." value={newContent} onChangeText={setNewContent} rows={6} />

            <View style={styles.formActions}>
              <Button variant="outline" size="md" onPress={() => setShowCreateModal(false)}>Anulare</Button>
              <Button variant="primary" size="md" loading={publishing} onPress={handleCreatePost}>Publică</Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={[styles.filterBar, { backgroundColor: t.background, borderBottomColor: t.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              <Pressable
                style={[styles.filterChip, { backgroundColor: !activeCategory ? t.primaryStrong : t.muted, borderColor: !activeCategory ? t.primaryStrong : t.border }]}
                onPress={() => setActiveCategory(null)}
                accessibilityRole="button"
                accessibilityState={{ selected: !activeCategory }}
              >
                <Text style={{ color: !activeCategory ? t.primaryForeground : t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.medium, fontFamily: font.sans }}>Toate</Text>
              </Pressable>
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat}
                  style={[styles.filterChip, { backgroundColor: activeCategory === cat ? t.primaryStrong : t.muted, borderColor: activeCategory === cat ? t.primaryStrong : t.border }]}
                  onPress={() => setActiveCategory(cat)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activeCategory === cat }}
                >
                  <Text style={{ color: activeCategory === cat ? t.primaryForeground : t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.medium, fontFamily: font.sans }}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={t.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredPosts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80, gap: spacing.md }}
              renderItem={({ item }) => (
                <Card padding="md" onPress={() => handleSelectPost(item)}>
                  <View style={styles.threadHeader}>
                    <View style={[styles.categoryLabel, { backgroundColor: t.muted }]}>
                      <Tag color={t.mutedForeground} size={12} style={{ marginRight: 4 }} />
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
                        {CATEGORY_LABELS[item.category]}
                      </Text>
                    </View>
                    <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontFamily: font.sans }}>
                      {formatRelativeTime(item.created_at)}
                    </Text>
                  </View>

                  <Text style={{
                    color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold,
                    fontFamily: font.heading, marginTop: spacing.sm, marginBottom: spacing.xs,
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{
                    color: t.mutedForeground, fontSize: fontSize.sm, lineHeight: 18,
                    fontFamily: font.sans, marginBottom: spacing.sm,
                  }} numberOfLines={2}>
                    {item.content}
                  </Text>

                  {/* Author row with avatar — clickable */}
                  <View style={[styles.threadFooter, { borderTopColor: t.border }]}>
                    <Pressable
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                      onPress={() => openProfile(item.author_id)}
                      accessibilityRole="button"
                    >
                      <AvatarCircle avatarUrl={item.author_avatar} name={item.author_name} size={20} t={t} />
                      <Text style={{ color: t.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
                        {item.author_name}
                      </Text>
                    </Pressable>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MessageSquare color={t.primary} size={13} style={{ marginRight: 4 }} />
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontWeight: fontWeight.medium, fontFamily: font.sans }}>
                        {item.comment_count} răspunsuri
                      </Text>
                    </View>
                  </View>
                </Card>
              )}
              ListEmptyComponent={
                <EmptyState
                  icon={MessagesSquare}
                  title="Forumul este gol"
                  description="Nu am găsit nicio discuție activă. Fii primul care pornește o conversație!"
                  action={{ label: 'Deschide o discuție', onPress: () => setShowCreateModal(true) }}
                />
              }
            />
          )}

          <Pressable
            style={[styles.fab, { backgroundColor: t.primaryStrong }]}
            onPress={() => setShowCreateModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Creează subiect nou"
          >
            <Plus color={t.primaryForeground} size={24} strokeWidth={2.5} />
          </Pressable>
        </View>
      )}

      {/* Profile view modal */}
      <ProfileViewModal
        userId={viewingProfileId}
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

/** Avatar circle — shows image if available, initials otherwise */
function AvatarCircle({ avatarUrl, name, size, t }: { avatarUrl: string | null; name: string; size: number; t: any }) {
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: t.primary, justifyContent: 'center', alignItems: 'center',
    }}>
      <Text style={{ color: t.primaryForeground, fontSize: size * 0.4, fontWeight: '700', fontFamily: font.heading }}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1 },
  detailMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentInputContainer: { flexDirection: 'row', padding: spacing.md, borderTopWidth: 1, alignItems: 'center', gap: spacing.sm },
  createHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryBtn: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 6 },
  filterBar: { padding: spacing.md, borderBottomWidth: 1 },
  filterChip: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 5 },
  threadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryLabel: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  threadFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 10 },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.md },
});
