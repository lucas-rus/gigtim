'use client'

import { useState, useRef } from 'react'
import { updateUserAvatar } from '@/lib/romarg-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userId: string
  fallbackText: string
}

export function AvatarUpload({ currentAvatarUrl, _userId, fallbackText }: AvatarUploadProps & { _userId?: string }) {
  const [isUploading, setIsUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Fișierul este prea mare. Dimensiunea maximă este de 5MB.')
      return
    }

    setIsUploading(true)

    try {
      // Read and resize image as Base64 Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const maxDim = 300
            let { width, height } = img
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width)
                width = maxDim
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height)
                height = maxDim
              }
            }
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height)
              resolve(canvas.toDataURL('image/jpeg', 0.85))
            } else {
              resolve(e.target?.result as string)
            }
          }
          img.onerror = reject
          img.src = e.target?.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await updateUserAvatar(dataUrl)
      if (res?.error) {
        throw new Error(res.error)
      }

      setAvatarUrl(dataUrl)
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      alert('A apărut o eroare la salvarea imaginii: ' + (error?.message || 'necunoscută'))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <Avatar className="h-24 w-24 border-4 border-background shadow-xl rounded-2xl overflow-hidden">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />}
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
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
