import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWorkspace } from './use-workspace'

const mockFiles = [
  { id: 'f1', name: 'page.tsx', path: '/page.tsx', type: 'code', content: 'export default function Page() {}', git_status: 'committed', parent_id: null, workspace_id: 'w1', created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'f2', name: 'styles.css', path: '/styles.css', type: 'css', content: 'body { color: red; }', git_status: 'modified', parent_id: null, workspace_id: 'w1', created_at: '2026-01-01', updated_at: '2026-01-01' },
]

let mockSupabase: any

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
  isSupabaseConfigured: vi.fn(() => true),
}))

describe('useWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: 'a@b.com' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn(),
      }),
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      }),
      removeChannel: vi.fn(),
    }
  })

  it('loads demo data when no workspaceId provided', async () => {
    const { result } = renderHook(() => useWorkspace(null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isDemo).toBe(true)
    expect(result.current.fileTree).toBeDefined()
    expect(result.current.fileContents).toBeDefined()
    expect(Object.keys(result.current.fileContents).length).toBeGreaterThan(0)
  })

  it('updates file contents locally', async () => {
    const { result } = renderHook(() => useWorkspace(null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.saveFile('page.tsx', 'new content')
    })

    expect(result.current.fileContents['page.tsx']).toBe('new content')
  })

  it('adds new file in demo mode', async () => {
    const { result } = renderHook(() => useWorkspace(null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialCount = result.current.fileTree.children.length

    act(() => {
      result.current.createFile('new-file.tsx', 'code')
    })

    expect(result.current.fileContents['new-file.tsx']).toBe('')
    expect(result.current.fileTree.children.length).toBe(initialCount + 1)
  })

  it('returns collaborators in demo mode', async () => {
    const { result } = renderHook(() => useWorkspace(null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.collaborators.length).toBeGreaterThan(0)
    expect(result.current.collaborators[0].name).toBeDefined()
    expect(result.current.collaborators[0].initials).toBeDefined()
  })

  it('loads workspace from Supabase when workspaceId provided', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockOrder = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'w1', name: 'Test WS', description: 'desc', is_public: false }, error: null })

    // Second from() call returns files
    let callCount = 0
    mockSupabase.from = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // workspaces query
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: mockSingle }
      }
      if (callCount === 2) {
        // files query
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: mockFiles, error: null }) }
      }
      // collaborators query
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) }
    })

    const { result } = renderHook(() => useWorkspace('w1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isDemo).toBe(false)
    expect(result.current.workspace?.name).toBe('Test WS')
  })
})
