'use client'

import Link from 'next/link'
import { logout } from '@/lib/supabase/auth-actions'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopHeaderProps {
  avatarUrl?: string | null
  fallbackText: string
  userName: string
}

export function TopHeader({ avatarUrl, fallbackText, userName }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b bg-background/95 px-6 backdrop-blur-sm shadow-sm">
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-primary/20 transition-all hover:border-primary/50 cursor-pointer shadow-sm">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />}
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {fallbackText}
              </AvatarFallback>
            </Avatar>
          </Button>
        } />
        <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
          <DropdownMenuGroup>
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground mt-1">
                GigTim Cont
              </p>
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={
            <Link href="/profile" className="cursor-pointer w-full flex items-center gap-2">
              <span>👤</span> Profil
            </Link>
          } />
          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-0">
            <form action={logout} className="w-full">
              <button type="submit" className="w-full flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer text-red-400 hover:text-red-500 transition-colors rounded-sm">
                <span>🚪</span> Deconectare
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
