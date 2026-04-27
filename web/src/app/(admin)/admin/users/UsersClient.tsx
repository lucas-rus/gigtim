'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { roleLabels, getLabel } from '@/lib/labels'
import type { UserRole } from '@/lib/types/database'

const roleColors: Record<UserRole, string> = {
  WORKER: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  EMPLOYER: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  ADMIN: 'bg-red-500/15 text-red-400 border-red-500/20',
}

export type AdminUser = {
  id: string
  email: string
  role: UserRole
  name: string
  city: string
  verified: boolean
  created: string
}

export function UsersClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  const filtered = initialUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Utilizatori</h1>
        <p className="text-sm text-muted-foreground">
          Gestionează toți utilizatorii platformei — {initialUsers.length} înregistrați
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: initialUsers.length, color: 'text-foreground' },
          { label: 'Lucrători', value: initialUsers.filter(u => u.role === 'WORKER').length, color: 'text-blue-400' },
          { label: 'Angajatori', value: initialUsers.filter(u => u.role === 'EMPLOYER').length, color: 'text-purple-400' },
          { label: 'Verificați', value: initialUsers.filter(u => u.verified).length, color: 'text-emerald-400' },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Caută după nume sau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val ?? 'ALL')}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toate rolurile</SelectItem>
            <SelectItem value="WORKER">Lucrători</SelectItem>
            <SelectItem value="EMPLOYER">Angajatori</SelectItem>
            <SelectItem value="ADMIN">Admini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilizator</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Locație</TableHead>
              <TableHead>ID Verificat</TableHead>
              <TableHead>Înregistrat</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                        {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`border ${roleColors[user.role]}`} variant="outline">
                    {getLabel(roleLabels, user.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.city}</TableCell>
                <TableCell>
                  {user.verified
                    ? <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20" variant="outline">✓ Da</Badge>
                    : <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/20" variant="outline">Nu</Badge>
                  }
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.created}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">•••</Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Niciun utilizator găsit.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
