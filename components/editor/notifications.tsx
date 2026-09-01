'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, X, FileCode2, MessageSquare, UserPlus, GitCommit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  type: 'file_edit' | 'comment' | 'join' | 'commit'
  user: string
  message: string
  file?: string
  timestamp: Date
  read: boolean
}

const DEMO_NOTIFICATIONS: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
  { type: 'file_edit', user: 'Sarah Chen', message: 'Updated imports in', file: 'page.tsx' },
  { type: 'comment', user: 'Alex Morgan', message: 'Left a comment on', file: 'globals.css' },
  { type: 'join', user: 'Maya Patel', message: 'Joined the workspace' },
  { type: 'commit', user: 'Sarah Chen', message: 'Committed changes to', file: 'editor-shell.tsx' },
]

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'file_edit': return <FileCode2 className="size-3.5 text-amber-400" />
    case 'comment': return <MessageSquare className="size-3.5 text-blue-400" />
    case 'join': return <UserPlus className="size-3.5 text-emerald-400" />
    case 'commit': return <GitCommit className="size-3.5 text-violet-400" />
  }
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return minutes + 'm ago'
  return Math.floor(minutes / 60) + 'h ago'
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hasNew, setHasNew] = useState(false)

  // Simulate incoming notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      const initial = DEMO_NOTIFICATIONS.slice(0, 2).map((n, i) => ({
        ...n,
        id: `n-${i}`,
        timestamp: new Date(Date.now() - (i + 1) * 120000),
        read: false,
      }))
      setNotifications(initial)
      setHasNew(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Simulate periodic notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const random = DEMO_NOTIFICATIONS[Math.floor(Math.random() * DEMO_NOTIFICATIONS.length)]
      const newNotif: Notification = {
        ...random,
        id: `n-${Date.now()}`,
        timestamp: new Date(),
        read: false,
      }
      setNotifications(prev => [newNotif, ...prev].slice(0, 20))
      setHasNew(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setHasNew(false)
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllRead() }}
        className="relative"
      >
        <Bell className="size-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-border bg-popover shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-xs font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={markAllRead}>
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="mx-auto size-6 text-muted-foreground/30" />
                  <p className="mt-2 text-xs text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-accent/50',
                      !n.read && 'bg-primary/5',
                    )}
                  >
                    <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-relaxed">
                        <span className="font-medium">{n.user}</span>{' '}
                        <span className="text-muted-foreground">{n.message}</span>{' '}
                        {n.file && <span className="font-medium text-primary">{n.file}</span>}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60">{formatTimeAgo(n.timestamp)}</span>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="mt-0.5 rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
