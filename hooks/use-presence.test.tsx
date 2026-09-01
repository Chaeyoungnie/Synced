import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePresence } from './use-presence'

// Mock useUser
vi.mock('@/hooks/use-user', () => ({
  useUser: vi.fn(() => ({
    user: { id: 'u1', email: 'a@b.com', user_metadata: { full_name: 'Test User' } },
    loading: false,
    signOut: vi.fn(),
  })),
}))

// Mock supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockImplementation((cb) => {
        if (typeof cb === 'function') cb('SUBSCRIBED')
        return Promise.resolve('SUBSCRIBED')
      }),
      track: vi.fn().mockResolvedValue('ok'),
      presenceState: vi.fn().mockReturnValue({}),
    }),
    removeChannel: vi.fn().mockResolvedValue('ok'),
  })),
  isSupabaseConfigured: vi.fn(() => true),
}))

describe('usePresence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns demo presence data when no workspaceId', () => {
    const { result } = usePresenceHelper(null)

    expect(result.current.onlineUsers.length).toBeGreaterThan(0)
    expect(result.current.onlineUsers[0].name).toBeDefined()
    expect(result.current.onlineUsers[0].initials).toBeDefined()
  })

  it('includes status and role for each user', () => {
    const { result } = usePresenceHelper(null)

    result.current.onlineUsers.forEach((user: any) => {
      expect(user.name).toBeTruthy()
      expect(user.initials).toBeTruthy()
      expect(user.role).toBeTruthy()
      expect(user.status).toBeTruthy()
    })
  })

  it('provides setActiveFile function', () => {
    const { result } = usePresenceHelper(null)

    expect(typeof result.current.setActiveFile).toBe('function')
  })

  it('provides setCursorPosition function', () => {
    const { result } = usePresenceHelper(null)

    expect(typeof result.current.setCursorPosition).toBe('function')
  })

  it('demo users have expected names', () => {
    const { result } = usePresenceHelper(null)

    const names = result.current.onlineUsers.map((u: any) => u.name)
    expect(names).toContain('Sarah Chen')
    expect(names).toContain('Alex Morgan')
    expect(names).toContain('Maya Patel')
  })

  it('demo users have color for avatar', () => {
    const { result } = usePresenceHelper(null)

    result.current.onlineUsers.forEach((user: any) => {
      expect(user.color).toBeTruthy()
      expect(user.color.startsWith('#')).toBe(true)
    })
  })
})

// Helper to render usePresence
function usePresenceHelper(workspaceId: string | null) {
  const { renderHook } = require('@testing-library/react')
  return renderHook(() => usePresence(workspaceId))
}
