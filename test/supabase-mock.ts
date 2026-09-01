import { vi } from 'vitest'

// Mock user object
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00Z',
}

export const mockSession = {
  user: mockUser,
  access_token: 'mock-token',
}

// Create a mock Supabase client
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signUp: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: 'https://mock-oauth.com' }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue('SUBSCRIBED'),
      track: vi.fn().mockResolvedValue('ok'),
      presenceState: vi.fn().mockReturnValue({}),
    }),
    removeChannel: vi.fn().mockResolvedValue('ok'),
  }
}

// Mock the client module
export function setupSupabaseMock() {
  const mockClient = createMockSupabaseClient()
  
  vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => mockClient),
    isSupabaseConfigured: vi.fn(() => true),
  }))

  return mockClient
}

// Mock with Supabase not configured
export function setupSupabaseNotConfigured() {
  vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => createMockSupabaseClient()),
    isSupabaseConfigured: vi.fn(() => false),
  }))
}
