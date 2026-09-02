'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  ArrowLeft,
  MapPin,
  Link as LinkIcon,
  Calendar,
  FileCode2,
  Folder,
  Flame,
  TrendingUp,
  Pencil,
  Check,
  X,
} from 'lucide-react'

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/hooks/use-user'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

interface Profile {
  fullName: string
  bio: string
  github: string
  website: string
  location: string
  avatarColor: string
  joinDate: string
}

const DEFAULT_PROFILE: Profile = {
  fullName: '',
  bio: 'Building cool stuff with code ✨',
  github: '',
  website: '',
  location: '',
  avatarColor: '#6366f1',
  joinDate: new Date().toISOString(),
}

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6b7280', '#1e293b',
]

export interface HeatmapCell {
  count: number
  level: number
  date: string
  dateObj: Date
}

// Build heatmap from real activity data — returns actual counts per day
function buildHeatmap(activities: { created_at: string }[]): HeatmapCell[][] {
  const now = new Date()
  const weeks: HeatmapCell[][] = []
  
  // Count activities per day for last 12 weeks (84 days)
  const dayCounts: Record<string, number> = {}
  for (const a of activities) {
    const day = new Date(a.created_at).toDateString()
    dayCounts[day] = (dayCounts[day] || 0) + 1
  }
  
  // Build 12 weeks x 7 days grid
  for (let w = 11; w >= 0; w--) {
    const week: HeatmapCell[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(now)
      date.setDate(date.getDate() - (w * 7 + (6 - d)))
      const dayStr = date.toDateString()
      const count = dayCounts[dayStr] || 0
      // Map count to visual level 0-4
      let level = 0
      if (count > 0 && count <= 2) level = 1
      else if (count <= 5) level = 2
      else if (count <= 10) level = 3
      else if (count > 10) level = 4
      const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      week.push({ count, level, date: dateFormatted, dateObj: date })
    }
    weeks.push(week)
  }
  return weeks
}

// Calculate consecutive day streak
function calculateStreak(activities: { created_at: string }[]): number {
  if (!activities.length) return 0
  const days = new Set(activities.map(a => new Date(a.created_at).toDateString()))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    if (days.has(date.toDateString())) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

// Generate mock activity for offline mode
function generateActivity(): HeatmapCell[][] {
  const now = new Date()
  const weeks: HeatmapCell[][] = []
  for (let w = 11; w >= 0; w--) {
    const week: HeatmapCell[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(now)
      date.setDate(date.getDate() - (w * 7 + (6 - d)))
      const rand = Math.random()
      const count = rand < 0.4 ? 0 : rand < 0.7 ? 1 : rand < 0.9 ? 3 : 7
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4
      const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      week.push({ count, level, date: dateFormatted, dateObj: date })
    }
    weeks.push(week)
  }
  return weeks
}

function ActivityHeatmap({ activity }: { activity: HeatmapCell[][] }) {
  const levels = [
    'bg-muted/30',
    'bg-emerald-500/20',
    'bg-emerald-500/40',
    'bg-emerald-500/60',
    'bg-emerald-500/80',
  ]
  const days = ['Mon', '', 'Wed', '', 'Fri', '', '']

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        {days.map((d, i) => (
          <span key={i} className="w-3 text-center">{d}</span>
        ))}
      </div>
      <div className="flex gap-1">
        {activity.map((week, w) => (
          <div key={w} className="flex flex-col gap-1">
            {week.map((cell, d) => (
              <div
                key={d}
                className={`size-3 rounded-sm ${levels[cell.level]}`}
                title={cell.count === 0 ? `No contributions on ${cell.date}` : `${cell.count} contribution${cell.count === 1 ? '' : 's'} on ${cell.date}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
        <span>Less</span>
        {levels.map((l, i) => (
          <div key={i} className={`size-3 rounded-sm ${l}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, signOut } = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [activity, setActivity] = useState<HeatmapCell[][]>([])
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    workspaces: 0,
    files: 0,
    streak: 0,
    todayFiles: 0,
    todayLines: 0,
  })

  // Load profile from Supabase + localStorage
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Developer',
        joinDate: user.created_at || new Date().toISOString(),
      }))

      // Load saved profile from localStorage
      const saved = localStorage.getItem('profile')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setProfile(prev => ({ ...prev, ...parsed, fullName: user.user_metadata?.full_name || parsed.fullName }))
        } catch {}
      }

      // Fetch real stats from Supabase
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const loadStats = async () => {
          const { count: wsCount } = await supabase.from('workspaces').select('*', { count: 'exact', head: true }).eq('owner_id', user.id)
          const { count: fileCount } = await supabase.from('files').select('*', { count: 'exact', head: true }).eq('created_by', user.id)
          
          // Get activities for heatmap
          const { data: activities } = await supabase.from('activities').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200)
          
          // Build heatmap from activities
          const heatmap = buildHeatmap(activities || [])
          setActivity(heatmap)
          
          // Calculate streak
          const streak = calculateStreak(activities || [])
          
          // Today's stats
          const today = new Date().toDateString()
          const todayActivities = (activities || []).filter(a => new Date(a.created_at).toDateString() === today)
          
          setStats({
            workspaces: wsCount || 0,
            files: fileCount || 0,
            streak,
            todayFiles: todayActivities.length,
            todayLines: todayActivities.length * 12, // approximate
          })
        }
        loadStats()
      } else {
        // Offline mode: load from localStorage
        const savedStats = localStorage.getItem('profile-stats')
        if (savedStats) {
          try { setStats(JSON.parse(savedStats)) } catch {}
        }
        setActivity(generateActivity())
      }
    }
  }, [user])

  const handleSave = async (field: string, value: string) => {
    const updated = { ...profile, [field]: value }
    setProfile(updated)
    setEditing(null)
    setSaving(true)
    localStorage.setItem('profile', JSON.stringify(updated))
    await new Promise(r => setTimeout(r, 200))
    setSaving(false)
  }

  const startEdit = (field: string, currentValue: string) => {
    setEditing(field)
    setEditValue(currentValue)
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditValue('')
  }

  const dn = profile.fullName || user?.email?.split('@')[0] || 'Developer'
  const initials = dn.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const memberSince = new Date(profile.joinDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground hover:opacity-80">
            <ArrowLeft className="size-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <span className="text-sm font-semibold">Synced</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          {/* Avatar */}
          <div className="relative group">
            <div
              className="flex size-24 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: profile.avatarColor }}
            >
              {initials}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Pencil className="size-5 text-white" />
            </div>
          </div>

          {/* Name & Bio */}
          <div className="flex-1 space-y-2">
            {/* Full Name */}
            {editing === 'fullName' ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-2xl font-bold h-10"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave('fullName', editValue)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                />
                <Button size="icon-sm" onClick={() => handleSave('fullName', editValue)}><Check className="size-4" /></Button>
                <Button size="icon-sm" variant="ghost" onClick={cancelEdit}><X className="size-4" /></Button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => startEdit('fullName', profile.fullName)}
              >
                {dn}
                <Pencil className="size-4 opacity-0 group-hover:opacity-100 text-muted-foreground" />
              </h1>
            )}

            {/* Bio */}
            {editing === 'bio' ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Tell us about yourself..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave('bio', editValue)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                />
                <Button size="icon-sm" onClick={() => handleSave('bio', editValue)}><Check className="size-4" /></Button>
                <Button size="icon-sm" variant="ghost" onClick={cancelEdit}><X className="size-4" /></Button>
              </div>
            ) : (
              <p
                className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => startEdit('bio', profile.bio)}
              >
                {profile.bio || 'Click to add a bio...'}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {/* Location */}
              {editing === 'location' ? (
                <div className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Location"
                    className="h-6 text-xs w-32"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave('location', editValue)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <Button size="icon" className="h-5 w-5" onClick={() => handleSave('location', editValue)}><Check className="size-3" /></Button>
                </div>
              ) : (
                <span
                  className="flex items-center gap-1 cursor-pointer hover:text-foreground"
                  onClick={() => startEdit('location', profile.location)}
                >
                  <MapPin className="size-3" />
                  {profile.location || 'Add location'}
                </span>
              )}

              {/* GitHub */}
              {editing === 'github' ? (
                <div className="flex items-center gap-1">
                  <GithubIcon className="size-3" />
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="username"
                    className="h-6 text-xs w-32"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave('github', editValue)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <Button size="icon" className="h-5 w-5" onClick={() => handleSave('github', editValue)}><Check className="size-3" /></Button>
                </div>
              ) : (
                <span
                  className="flex items-center gap-1 cursor-pointer hover:text-foreground"
                  onClick={() => startEdit('github', profile.github)}
                >
                  <GithubIcon className="size-3" />
                  {profile.github || 'Add GitHub'}
                </span>
              )}

              {/* Website */}
              {editing === 'website' ? (
                <div className="flex items-center gap-1">
                  <LinkIcon className="size-3" />
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="yoursite.com"
                    className="h-6 text-xs w-40"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave('website', editValue)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <Button size="icon" className="h-5 w-5" onClick={() => handleSave('website', editValue)}><Check className="size-3" /></Button>
                </div>
              ) : (
                <span
                  className="flex items-center gap-1 cursor-pointer hover:text-foreground"
                  onClick={() => startEdit('website', profile.website)}
                >
                  <LinkIcon className="size-3" />
                  {profile.website || 'Add website'}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                Joined {memberSince}
              </span>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Folder className="size-4" />
              <span className="text-xs font-medium">Workspaces</span>
            </div>
            <p className="text-2xl font-bold">{stats.workspaces}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <FileCode2 className="size-4" />
              <span className="text-xs font-medium">Total Files</span>
            </div>
            <p className="text-2xl font-bold">{stats.files}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Flame className="size-4 text-orange-500" />
              <span className="text-xs font-medium">Day Streak</span>
            </div>
            <p className="text-2xl font-bold">{stats.streak} <span className="text-sm font-normal text-muted-foreground">days</span></p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="size-4" />
              <span className="text-xs font-medium">Today</span>
            </div>
            <p className="text-2xl font-bold">{stats.todayFiles} <span className="text-sm font-normal text-muted-foreground">files</span></p>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Activity</h2>
            <Badge variant="secondary" className="text-[10px]">
              {stats.todayLines} lines today
            </Badge>
          </div>
          <ActivityHeatmap activity={activity} />
        </div>

        {/* Avatar Color Picker */}
        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          <h2 className="text-sm font-semibold mb-4">Avatar Color</h2>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map(color => (
              <button
                key={color}
                onClick={() => {
                  setProfile(prev => ({ ...prev, avatarColor: color }))
                  localStorage.setItem('profile', JSON.stringify({ ...profile, avatarColor: color }))
                }}
                className={`size-8 rounded-lg transition-transform hover:scale-110 ${profile.avatarColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{user?.email || 'Not signed in'}</span>
            </div>
            <Separator />
            <Button variant="destructive" size="sm" onClick={async () => { await signOut(); router.push('/') }}>
              Sign out
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
