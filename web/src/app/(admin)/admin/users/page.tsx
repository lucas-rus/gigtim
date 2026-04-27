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
import type { UserRole } from '@/lib/types/database'

const roleColors: Record<UserRole, string> = {
  WORKER: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  EMPLOYER: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  ADMIN: 'bg-red-500/15 text-red-400 border-red-500/20',
}

const demoUsers = [
  { id: '1', email: 'andrei.popescu@email.com', role: 'WORKER' as UserRole, name: 'Andrei Popescu', city: 'Cluj-Napoca', verified: true, created: '27 Apr 2026' },
  { id: '2', email: 'maria.ionescu@email.com', role: 'WORKER' as UserRole, name: 'Maria Ionescu', city: 'Timișoara', verified: true, created: '26 Apr 2026' },
  { id: '3', email: 'coffelab@firma.ro', role: 'EMPLOYER' as UserRole, name: 'Coffee Lab SRL', city: 'București', verified: false, created: '25 Apr 2026' },
  { id: '4', email: 'admin@gigtim.ro', role: 'ADMIN' as UserRole, name: 'Admin GigTim', city: '—', verified: true, created: '01 Apr 2026' },
  { id: '5', email: 'ion.dumitrescu@email.com', role: 'WORKER' as UserRole, name: 'Ion Dumitrescu', city: 'București', verified: false, created: '24 Apr 2026' },
]

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  const filtered = demoUsers.filter((u) => {
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
          Gestionează toți utilizatorii platformei — {demoUsers.length} înregistrați
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: 5, color: 'text-foreground' },
          { label: 'Lucrători', value: 3, color: 'text-blue-400' },
          { label: 'Angajatori', value: 1, color: 'text-purple-400' },
          { label: 'Verificați', value: 3, color: 'text-emerald-400' },
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
            <SelectValue placeholder="Filtrează după rol" />
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
                      <AvatarFallback className="text-xs font-bold">
                        {user.name.split(' ').map((n) => n[0]).join('')}
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
                    {user.role}
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
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
