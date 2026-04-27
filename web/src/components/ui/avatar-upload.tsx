'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateUserAvatar } from '@/lib/supabase/auth-actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userId: string
  fallbackText: string
}

export function AvatarUpload({ currentAvatarUrl, userId, fallbackText }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Create a unique file path: userId/timestamp.ext
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Save to database via Server Action
      const dbResult = await updateUserAvatar(publicUrl)
      if (dbResult.error) {
        throw new Error(dbResult.error)
      }

      setAvatarUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('A apărut o eroare la încărcarea imaginii.')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />}
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs font-medium text-center px-2">
            {isUploading ? 'Se încarcă...' : 'Schimbă poza'}
          </span>
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  )
}
