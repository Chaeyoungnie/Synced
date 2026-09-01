'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarBadge } from '@/components/ui/avatar'

export function PresenceAvatar({
  initials,
  color,
  className,
}: {
  initials: string
  color: string
  className?: string
}) {
  return (
    <Avatar size="sm" className={cn('border-2 border-background', className)}>
      <AvatarFallback className={cn('text-[10px] font-bold text-white', color)}>
        {initials}
      </AvatarFallback>
      <AvatarBadge className="bg-emerald-400" />
    </Avatar>
  )
}
