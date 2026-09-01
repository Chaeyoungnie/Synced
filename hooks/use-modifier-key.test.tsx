import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useModifierKey } from './use-modifier-key'

describe('useModifierKey', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns Ctrl on Windows', () => {
    vi.stubGlobal('navigator', {
      platform: 'Win32',
    })

    const { result } = renderHook(() => useModifierKey())

    expect(result.current).toBe('Ctrl')
  })

  it('returns ⌘ on Mac', () => {
    vi.stubGlobal('navigator', {
      platform: 'MacIntel',
    })

    const { result } = renderHook(() => useModifierKey())

    expect(result.current).toBe('⌘')
  })

  it('returns ⌘ on iPhone', () => {
    vi.stubGlobal('navigator', {
      platform: 'iPhone',
    })

    const { result } = renderHook(() => useModifierKey())

    expect(result.current).toBe('⌘')
  })

  it('returns Ctrl on Linux', () => {
    vi.stubGlobal('navigator', {
      platform: 'Linux x86_64',
    })

    const { result } = renderHook(() => useModifierKey())

    expect(result.current).toBe('Ctrl')
  })
})
