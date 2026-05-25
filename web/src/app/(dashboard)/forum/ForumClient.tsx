'use client'

import { useState, useTransition, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { createForumPost, getForumComments, createForumComment } from '@/lib/supabase/data-actions'
import type { ForumCategory } from '@/lib/types/database'

const categoryLabels: Record<ForumCategory, string> = {
  GENERAL: 'General',
  TIPS: 'Sfaturi',
  JOBS: 'Joburi',
  LEGAL: 'Legal',
}

function useCurrentTime() {
  const [time, setTime] = useState<number>(0)
  useEffect(() => {
    setTime(Date.now())
    const interval = setInterval(() => setTime(Date.now()), 10000)
    return () => clearInterval(interval)
  }, [])
  return time
}

interface ForumClientProps {
  initialPosts: any[]
  _userId: string | null
}

export function ForumClient({ initialPosts, _userId }: ForumClientProps) {
  const [tab, setTab] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const now = useCurrentTime()

  // New post form
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<string>('GENERAL')

  // Comments
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [commentText, setCommentText] = useState('')

  const tabs = ['ALL', 'GENERAL', 'TIPS', 'JOBS', 'LEGAL'] as const
  const filteredPosts = tab === 'ALL' ? initialPosts : initialPosts.filter(p => p.category === tab)

  function handlePost() {
    setMessage(null)
    const formData = new FormData()
    formData.set('title', title)
    formData.set('content', content)
    formData.set('category', category)

    startTransition(async () => {
      const result = await createForumPost(formData)
      if (result.error) {
        setMessage(result.error)
      } else {
        setDialogOpen(false)
        setTitle('')
        setContent('')
        window.location.reload()
      }
    })
  }

  function handleLoadComments(postId: string) {
    if (expandedPost === postId) {
      setExpandedPost(null)
      return
    }
    setExpandedPost(postId)
    startTransition(async () => {
      const result = await getForumComments(postId)
      setComments(prev => ({ ...prev, [postId]: result }))
    })
  }

  function handleComment(postId: string) {
    if (!commentText.trim()) return
    startTransition(async () => {
      const result = await createForumComment(postId, commentText.trim())
      if (!result.error) {
        setCommentText('')
        const updated = await getForumComments(postId)
        setComments(prev => ({ ...prev, [postId]: updated }))
      }
    })
  }

  function timeAgo(iso: string) {
    if (now === 0) return '...'
    const diff = now - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'acum'
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}z`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-heading text-primary">Forum</h1>
          <p className="text-sm text-muted-foreground font-sans mt-0.5">Discuții, sfaturi și anunțuri pentru comunitate</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={
            <Button className="h-10 px-5 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:brightness-110 text-primary-foreground shadow-md shadow-primary/10 transition-all duration-300">＋ Postare nouă</Button>
          } />
          <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-md dark:bg-card border border-border/60 rounded-2xl shadow-xl p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
              <DialogTitle className="text-xl font-semibold font-heading text-foreground">Postare nouă</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 px-6 py-5">
              <div className="grid gap-1.5">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Titlu</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titlul postării..." className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 font-sans text-sm" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Categorie</Label>
                <Select value={category} onValueChange={(val) => setCategory(val ?? 'GENERAL')}>
                  <SelectTrigger className="w-full bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 font-sans text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover dark:bg-popover border border-border/60 rounded-xl shadow-lg">
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="font-sans">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Conținut</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Scrie conținutul postării..." className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl p-3 text-sm resize-none font-sans" />
              </div>
            </div>
            <DialogFooter className="px-6 pb-6 pt-4 border-t border-border/60 gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-10 px-4 rounded-xl border border-border/80 bg-transparent hover:bg-muted text-foreground transition-colors text-xs font-semibold font-sans">Anulare</Button>
              <Button onClick={handlePost} disabled={isPending || !title.trim()} className="h-10 px-5 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:brightness-110 text-primary-foreground transition-all duration-200">
                {isPending ? 'Se publică...' : 'Publică'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <div className="text-sm px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive font-sans">{message}</div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {tabs.map((t) => {
          const isActive = tab === t
          return (
            <button 
              key={t} 
              onClick={() => setTab(t)} 
              className={`shrink-0 h-9 rounded-xl px-4 font-sans text-xs capitalize transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground' 
                  : 'border border-border/80 hover:bg-accent text-muted-foreground bg-transparent'
              }`}
            >
              {t === 'ALL' ? `Toate (${initialPosts.length})` : `${categoryLabels[t as ForumCategory]} (${initialPosts.filter(p => p.category === t).length})`}
            </button>
          )
        })}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground font-sans border border-dashed border-border/60 rounded-2xl bg-card/30 p-6">
            {initialPosts.length === 0
              ? 'Nu există postări încă. Fii primul care postează!'
              : 'Nicio postare în această categorie.'}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="border border-border/60 bg-card dark:bg-card/40 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:-translate-y-0.5">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border rounded-xl">
                      <AvatarFallback className="text-xs font-bold bg-primary/5 text-primary dark:bg-muted dark:text-primary font-sans rounded-xl">
                        {(post.author_name || '?').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold font-heading text-foreground">{post.title}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground font-sans mt-0.5">
                        {post.author_name} · <span className="font-sans text-[10px]">{timeAgo(post.created_at)}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-fixed-dim border-none rounded-lg px-2.5 py-0.5 text-[10px] font-sans font-semibold shrink-0 capitalize tracking-wide">
                    {categoryLabels[post.category as ForumCategory] || post.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-5 px-5">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{post.content}</p>
                
                <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                  <button 
                    onClick={() => handleLoadComments(post.id)}
                    className="text-xs font-semibold text-primary dark:text-primary-fixed-dim font-sans hover:underline flex items-center gap-1.5 cursor-pointer capitalize"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> {post.comment_count || 0} comentarii
                  </button>
                </div>

                {/* Comments section */}
                {expandedPost === post.id && (
                  <div className="border border-border/60 bg-muted/20 dark:bg-muted/10 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-3 divide-y divide-border/40">
                      {(comments[post.id] || []).length === 0 ? (
                        <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">Niciun comentariu adăugat.</p>
                      ) : (
                        (comments[post.id] || []).map((c: any, index: number) => (
                          <div key={c.id} className={`flex gap-3 text-xs ${index > 0 ? 'pt-3' : ''}`}>
                            <Avatar className="h-7 w-7 border border-border rounded-lg">
                              <AvatarFallback className="text-[10px] font-semibold bg-muted dark:bg-accent text-foreground font-sans rounded-lg">
                                {(c.author_name || '?')[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground font-sans">{c.author_name}</span>
                                <span className="text-muted-foreground text-[10px] font-sans">{timeAgo(c.created_at)}</span>
                              </div>
                              <p className="text-muted-foreground/90 text-xs font-sans leading-normal">{c.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-border/60">
                      <Input
                        placeholder="Scrie un comentariu..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                        className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-xs flex-1 font-sans"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleComment(post.id)} 
                        disabled={isPending}
                        className="h-10 px-4 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:brightness-110 text-primary-foreground transition-all duration-200 shrink-0"
                      >
                        Trimite
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
