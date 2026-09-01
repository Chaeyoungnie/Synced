import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useGit } from './use-git'

describe('useGit', () => {
  it('initializes with demo branches', () => {
    const { result } = renderHook(() => useGit())
    expect(result.current.branches.length).toBe(3)
    expect(result.current.currentBranch).toBe('main')
  })

  it('initializes with demo commits', () => {
    const { result } = renderHook(() => useGit())
    expect(result.current.commits.length).toBeGreaterThan(0)
  })

  it('initializes with demo changes', () => {
    const { result } = renderHook(() => useGit())
    expect(result.current.changes.length).toBe(4)
  })

  it('switches branches', () => {
    const { result } = renderHook(() => useGit())
    act(() => result.current.switchBranch('develop'))
    expect(result.current.currentBranch).toBe('develop')
    expect(result.current.branches.find(b => b.name === 'develop')?.isCurrent).toBe(true)
    expect(result.current.branches.find(b => b.name === 'main')?.isCurrent).toBe(false)
  })

  it('creates a new branch', () => {
    const { result } = renderHook(() => useGit())
    act(() => result.current.createBranch('feature/test'))
    expect(result.current.branches.length).toBe(4)
    expect(result.current.branches.find(b => b.name === 'feature/test')).toBeDefined()
  })

  it('stages a file', () => {
    const { result } = renderHook(() => useGit())
    act(() => result.current.stageFile('diff-viewer.tsx'))
    expect(result.current.changes.find(c => c.file === 'diff-viewer.tsx')?.staged).toBe(true)
    expect(result.current.stageCount).toBe(2)
  })

  it('unstages a file', () => {
    const { result } = renderHook(() => useGit())
    act(() => result.current.unstageFile('version-history-panel.tsx'))
    expect(result.current.changes.find(c => c.file === 'version-history-panel.tsx')?.staged).toBe(false)
    expect(result.current.stageCount).toBe(0)
  })

  it('stages all files', () => {
    const { result } = renderHook(() => useGit())
    act(() => result.current.stageAll())
    expect(result.current.stageCount).toBe(4)
    expect(result.current.unstageCount).toBe(0)
  })

  it('unstages all files', () => {
    const { result } = renderHook(() => useGit())
    act(() => result.current.stageAll())
    act(() => result.current.unstageAll())
    expect(result.current.stageCount).toBe(0)
    expect(result.current.unstageCount).toBe(4)
  })

  it('creates a commit from staged files', () => {
    const { result } = renderHook(() => useGit())
    act(() => result.current.stageFile('diff-viewer.tsx'))
    act(() => result.current.commit('feat: add diff viewer'))
    expect(result.current.commits[0].message).toBe('feat: add diff viewer')
    expect(result.current.commits[0].files).toContain('diff-viewer.tsx')
    expect(result.current.changes.find(c => c.file === 'diff-viewer.tsx')).toBeUndefined()
  })

  it('does not commit with empty message', () => {
    const { result } = renderHook(() => useGit())
    act(() => result.current.stageFile('diff-viewer.tsx'))
    const initialCount = result.current.commits.length
    act(() => result.current.commit(''))
    expect(result.current.commits.length).toBe(initialCount)
  })

  it('does not commit with no staged files', () => {
    const { result } = renderHook(() => useGit())
    act(() => result.current.unstageAll())
    const initialCount = result.current.commits.length
    act(() => result.current.commit('test'))
    expect(result.current.commits.length).toBe(initialCount)
  })

  it('discards changes', () => {
    const { result } = renderHook(() => useGit())
    act(() => result.current.discardChanges('diff-viewer.tsx'))
    expect(result.current.changes.find(c => c.file === 'diff-viewer.tsx')).toBeUndefined()
  })

  it('formats dates correctly', () => {
    const { result } = renderHook(() => useGit())
    const now = new Date().toISOString()
    expect(result.current.formatDate(now)).toBe('just now')
  })
})
