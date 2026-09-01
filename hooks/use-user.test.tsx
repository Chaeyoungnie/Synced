import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUser } from './use-user'

// Mock supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'u1', email: 'a@b.com', user_metadata: { full_name: 'Test User' } } },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
  isSupabaseConfigured: vi.fn(() => true),
}))

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads user on mount', async () => {
    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeTruthy()
    expect(result.current.user?.email).toBe('a@b.com')
  })

  it('provides signOut function', async () => {
    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.signOut).toBe('function')

    await act(async () => {
      await result.current.signOut()
    })
  })

  it('stays in demo mode when Supabase not configured', async () => {
    vi.mocked(await import('@/lib/supabase/client')).isSupabaseConfigured = vi.fn(() => false)

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })
})
