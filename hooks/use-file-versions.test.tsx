import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFileVersions } from './use-file-versions'

let mockSupabase: any

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
  isSupabaseConfigured: vi.fn(() => true),
}))

describe('useFileVersions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }
  })

  it('returns demo versions when no fileId provided', async () => {
    const { result } = renderHook(() => useFileVersions(null, 'page.tsx'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isDemo).toBe(true)
    expect(result.current.versions.length).toBe(3)
    expect(result.current.versions[0].version_number).toBe(3)
    expect(result.current.versions[2].version_number).toBe(1)
  })

  it('returns demo versions for empty fileId', async () => {
    const { result } = renderHook(() => useFileVersions('', 'test.ts'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isDemo).toBe(true)
    expect(result.current.versions.length).toBe(3)
  })

  it('returns empty versions when no fileId and no fileName', async () => {
    const { result } = renderHook(() => useFileVersions(null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.versions).toEqual([])
  })

  it('restores version content', async () => {
    const { result } = renderHook(() => useFileVersions(null, 'page.tsx'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const content = await result.current.restoreVersion(result.current.versions[0])
    expect(content).toBe(result.current.versions[0].content)
  })

  it('returns callable saveVersion and refresh', async () => {
    const { result } = renderHook(() => useFileVersions(null, 'page.tsx'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.saveVersion).toBe('function')
    expect(typeof result.current.refresh).toBe('function')
  })
})
