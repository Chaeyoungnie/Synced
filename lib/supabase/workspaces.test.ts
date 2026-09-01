import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWorkspace, getWorkspaces, deleteWorkspace } from './workspaces'

const mockUser = { id: 'u1', email: 'a@b.com' }

function createChain(resolveWith: any = { data: [], error: null }) {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolveWith),
  }
  chain.then = (resolve: any) => Promise.resolve(resolveWith).then(resolve)
  return chain
}

let mockFrom: any

const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
  },
  get from() { return mockFrom },
}

vi.mock('./client', () => ({
  createClient: vi.fn(() => mockSupabase),
  isSupabaseConfigured: vi.fn(() => true),
}))

describe('Workspace API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom = vi.fn().mockReturnValue(createChain())
  })

  it('createWorkspace inserts workspace', async () => {
    const result = await createWorkspace('My Project', 'A project')
    expect(mockSupabase.from).toHaveBeenCalledWith('workspaces')
    expect(result.error).toBeFalsy()
  })

  it('createWorkspace throws when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    await expect(createWorkspace('Test')).rejects.toThrow('Not authenticated')
  })

  it('getWorkspaces fetches user workspaces', async () => {
    const result = await getWorkspaces()
    expect(mockSupabase.from).toHaveBeenCalledWith('workspaces')
    expect(result.error).toBeFalsy()
  })

  it('getWorkspaces throws when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    await expect(getWorkspaces()).rejects.toThrow('Not authenticated')
  })

  it('deleteWorkspace removes workspace', async () => {
    mockFrom.mockReturnValue(createChain({ error: null }))
    const result = await deleteWorkspace('w1')
    expect(mockSupabase.from).toHaveBeenCalledWith('workspaces')
    expect(result.error).toBeFalsy()
  })
})
