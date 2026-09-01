import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useChat } from './use-chat'
import { isSupabaseConfigured } from '@/lib/supabase/client'

let mockSupabase: any

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
  isSupabaseConfigured: vi.fn(() => true),
}))

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(isSupabaseConfigured).mockReturnValue(true)
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: 'a@b.com', user_metadata: { full_name: 'Test User' } } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      }),
      removeChannel: vi.fn(),
    }
  })

  it('returns demo messages when no workspaceId', async () => {
    const { result } = renderHook(() => useChat(null))

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0)
    })

    expect(result.current.isDemo).toBe(true)
    expect(result.current.messages.length).toBe(3)
    expect(result.current.messages[0].sender).toBe('Sarah')
  })

  it('returns demo messages when Supabase not configured', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false)

    const { result } = renderHook(() => useChat('w1'))

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0)
    })

    expect(result.current.isDemo).toBe(true)
    expect(result.current.messages.length).toBe(3)
  })

  it('sends message optimistically in demo mode', async () => {
    const { result } = renderHook(() => useChat(null))

    await waitFor(() => {
      expect(result.current.messages.length).toBe(3)
    })

    act(() => { result.current.sendMessage('Hello world!') })

    await waitFor(() => {
      expect(result.current.messages.length).toBe(4)
    })
    expect(result.current.messages[0].text).toBe('Hello world!')
    expect(result.current.messages[0].sender).toBe('You')
    expect(result.current.messages[0].time).toBe('just now')
  })

  it('does not send empty messages', async () => {
    const { result } = renderHook(() => useChat(null))

    await waitFor(() => {
      expect(result.current.messages.length).toBe(3)
    })

    result.current.sendMessage('')
    result.current.sendMessage('   ')

    expect(result.current.messages.length).toBe(3)
  })

  it('returns callable refresh function', async () => {
    const { result } = renderHook(() => useChat(null))

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0)
    })

    expect(typeof result.current.refresh).toBe('function')
  })

  it('loads messages from Supabase when workspaceId provided', async () => {
    const mockMessages = [
      { id: 'm1', workspace_id: 'w1', user_id: 'u1', content: 'Hello from DB', file_reference: null, created_at: new Date().toISOString() },
      { id: 'm2', workspace_id: 'w1', user_id: 'u2', content: 'Reply from DB', file_reference: 'page.tsx', created_at: new Date().toISOString() },
    ]
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
    })

    const { result } = renderHook(() => useChat('w1', 'Test User'))

    await waitFor(() => {
      expect(result.current.messages.length).toBe(2)
    })

    expect(result.current.isDemo).toBe(false)
    expect(result.current.messages[0].text).toBe('Hello from DB')
    expect(result.current.messages[1].file).toBe('page.tsx')
  })

  it('sends message to Supabase when workspaceId provided', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: insertMock,
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })

    const { result } = renderHook(() => useChat('w1', 'Test User'))

    await waitFor(() => {
      expect(result.current.isDemo).toBe(false)
    })

    result.current.sendMessage('New message')

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalled()
    })
  })
})
