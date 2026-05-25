'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  WORKER: 'bg-blue-50 text-blue-700 border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded',
  EMPLOYER: 'bg-purple-50 text-purple-700 border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded',
  ADMIN: 'bg-red-50 text-red-700 border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded',
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
        <h1 className="text-2xl font-bold tracking-tight font-heading text-primary">Utilizatori</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Gestionează toți utilizatorii platformei — {initialUsers.length} înregistrați
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: initialUsers.length, color: 'text-primary' },
          { label: 'Lucrători', value: initialUsers.filter(u => u.role === 'WORKER').length, color: 'text-blue-700' },
          { label: 'Angajatori', value: initialUsers.filter(u => u.role === 'EMPLOYER').length, color: 'text-purple-700' },
          { label: 'Verificați', value: initialUsers.filter(u => u.verified).length, color: 'text-emerald-700' },
        ].map((s) => (
          <Card key={s.label} className="border border-border bg-card shadow-sm rounded">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 font-heading ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 sm:max-w-xs space-y-1.5">
          <Label className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Caută utilizator</Label>
          <Input
            placeholder="Caută după nume sau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all rounded h-10 text-sm"
          />
        </div>
        <div className="sm:w-[180px] space-y-1.5">
          <Label className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Filtrează după Rol</Label>
          <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val ?? 'ALL')}>
            <SelectTrigger className="w-full bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all rounded h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border rounded shadow-md">
              <SelectItem value="ALL">Toate rolurile</SelectItem>
              <SelectItem value="WORKER">Lucrători</SelectItem>
              <SelectItem value="EMPLOYER">Angajatori</SelectItem>
              <SelectItem value="ADMIN">Admini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="border border-border bg-card shadow-sm rounded overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f8fafc] border-b border-border">
            <TableRow>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Utilizator</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Rol</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Locație</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">ID Verificat</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Înregistrat</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3 text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id} className="group hover:bg-[#f8f9ff] transition-colors border-b border-border/50 last:border-b-0">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback className="text-2xs font-bold bg-[#eff4ff] text-primary">
                        {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-on-background font-sans">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-sans">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={roleColors[user.role]} variant="outline">
                    {getLabel(roleLabels, user.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-sans">{user.city}</TableCell>
                <TableCell>
                  {user.verified
                    ? <Badge className="bg-emerald-50 text-emerald-700 border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded" variant="outline">✓ Da</Badge>
                    : <Badge className="bg-slate-50 text-slate-700 border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded" variant="outline">Nu</Badge>
                  }
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">{user.created}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded p-0 text-muted-foreground hover:text-primary">•••</Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-sans">
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
