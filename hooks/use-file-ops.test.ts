import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFileOps } from './use-file-ops'
import { resetFeatureFlags } from '@/lib/features'

describe('useFileOps', () => {
  beforeEach(() => {
    resetFeatureFlags()
    delete (window as any).__DESKTOP_APP__
    delete (window as any).electronAPI
  })

  it('returns isDesktop=false in web mode', () => {
    const { result } = renderHook(() => useFileOps())
    expect(result.current.isDesktop).toBe(false)
  })

  it('returns isDesktop=true in desktop mode', () => {
    ;(window as any).__DESKTOP_APP__ = true
    resetFeatureFlags()
    const { result } = renderHook(() => useFileOps())
    expect(result.current.isDesktop).toBe(true)
  })

  it('openFileDialog returns null in web mode', async () => {
    const { result } = renderHook(() => useFileOps())
    const file = await result.current.openFileDialog()
    expect(file).toBeNull()
  })

  it('openFileDialog calls electronAPI in desktop mode', async () => {
    ;(window as any).__DESKTOP_APP__ = true
    resetFeatureFlags()
    ;(window as any).electronAPI = {
      openFileDialog: () => Promise.resolve({ filePath: '/test/file.ts', name: 'file.ts', content: 'test' }),
    }
    const { result } = renderHook(() => useFileOps())
    const file = await result.current.openFileDialog()
    expect(file).toEqual({ filePath: '/test/file.ts', name: 'file.ts', content: 'test' })
  })

  it('saveFileDialog returns null in web mode', async () => {
    const { result } = renderHook(() => useFileOps())
    const result2 = await result.current.saveFileDialog('test.ts', 'content')
    expect(result2).toBeNull()
  })

  it('saveFileDialog calls electronAPI in desktop mode', async () => {
    ;(window as any).__DESKTOP_APP__ = true
    resetFeatureFlags()
    ;(window as any).electronAPI = {
      saveFileDialog: () => Promise.resolve({ filePath: '/saved/file.ts', saved: true }),
    }
    const { result } = renderHook(() => useFileOps())
    const res = await result.current.saveFileDialog('test.ts', 'content')
    expect(res).toEqual({ filePath: '/saved/file.ts', saved: true })
  })

  it('readLocalFile returns null in web mode', async () => {
    const { result } = renderHook(() => useFileOps())
    const file = await result.current.readLocalFile('/some/path')
    expect(file).toBeNull()
  })

  it('saveLocalFile returns false in web mode', async () => {
    const { result } = renderHook(() => useFileOps())
    const saved = await result.current.saveLocalFile('/some/path', 'content')
    expect(saved).toBe(false)
  })

  it('handles electronAPI errors gracefully', async () => {
    ;(window as any).__DESKTOP_APP__ = true
    resetFeatureFlags()
    ;(window as any).electronAPI = {
      openFileDialog: () => Promise.reject(new Error('IPC failed')),
    }
    const { result } = renderHook(() => useFileOps())
    const file = await result.current.openFileDialog()
    expect(file).toBeNull()
  })
})
