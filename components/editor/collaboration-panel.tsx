'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  PanelRight,
  Send,
  SmilePlus,
  Paperclip,
  AtSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { PresenceAvatar } from './presence-avatar'

import { useChat, type ChatMessage } from '@/hooks/use-chat'



function CollapsibleSection({
  title,
  count,
  badge,
  defaultOpen = true,
  className,
  children,
}: {
  title: string
  count?: number
  badge?: string
  defaultOpen?: boolean
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        className="flex w-full items-center gap-2 px-0 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        <span>{title}</span>
        {count !== undefined && (
          <Badge variant="secondary" className="ml-1 h-4 rounded-full px-1.5 text-[9px]">
            {count}
          </Badge>
        )}
        {badge && (
          <span className="ml-1 text-primary">{badge}</span>
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'opacity-100' : 'max-h-0 opacity-0',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function CollaborationPanel({
  collaboratorList,
  open,
  onToggle,
  workspaceId,
  userName,
}: {
  collaboratorList?: { name: string; initials: string; color: string; role: string; status: string }[]
  open: boolean
  onToggle: () => void
  workspaceId?: string | null
  userName?: string
}) {
  const activeCollaborators = collaboratorList || []
  const [message, setMessage] = useState('')
  const { messages: chatMessages, sendMessage: sendChatMessage } = useChat(workspaceId, userName)

  const handleSendMessage = () => {
    if (!message.trim()) return
    sendChatMessage(message.trim())
    setMessage('')
  }

  const onlineCount = activeCollaborators.filter((c) => c.role !== 'Viewer').length

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-sidebar overflow-hidden min-w-0 w-full',
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col p-4">
          {/* People section */}
          <CollapsibleSection title="People" count={activeCollaborators.length} badge={`${onlineCount} online`}>
            <div className="flex flex-col gap-3 pb-2">
              {activeCollaborators.map((person) => (
                <div key={person.name} className="flex items-center gap-2.5 group">
                  <div className="relative">
                    <PresenceAvatar initials={person.initials} color={person.color} />
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-medium">{person.name}</p>
                      {person.name === 'You' && (
                        <Badge variant="secondary" className="h-3.5 px-1 text-[8px]">you</Badge>
                      )}
                    </div>
                    <p className="truncate text-[10px] text-muted-foreground">{person.status}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'h-auto px-1.5 py-0.5 text-[9px] shrink-0',
                      person.role === 'Admin' && 'border-primary/30 text-primary',
                      person.role === 'Editor' && 'border-emerald-500/30 text-emerald-400',
                      person.role === 'Viewer' && 'border-muted-foreground/30',
                    )}
                  >
                    {person.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <Separator className="my-2" />

          {/* Activity section */}
          <CollapsibleSection title="Activity" defaultOpen={true} className="flex-1 flex flex-col min-h-0">
            <div className="flex flex-col gap-3 pb-2 overflow-y-auto flex-1">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="group">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
                        {msg.initials}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-foreground">{msg.sender}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{msg.text}</p>
                      {msg.file && (
                        <span className="inline-flex items-center gap-1 mt-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary font-medium">
                          <MessageSquare className="size-2.5" /> {msg.file}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Chat input */}
          <div className="mt-auto pt-2 shrink-0">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                    handleSendMessage()
                  }
                }}
                placeholder="Message the team..."
                aria-label="Message the team"
                className="pr-20"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Add emoji"
                >
                  <SmilePlus className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Attach file"
                >
                  <Paperclip className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Mention someone"
                >
                  <AtSign className="size-3" />
                </Button>
                <Button
                  size="icon-xs"
                  className={cn(
                    'transition-colors',
                    message.trim()
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  disabled={!message.trim()}
                  onClick={handleSendMessage}
                  aria-label="Send message"
                >
                  <Send className="size-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
    </aside>
  )
}
