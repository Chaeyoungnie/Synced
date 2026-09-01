import { describe, it, expect, beforeEach } from 'vitest'
import { getFeatureFlags, features, hasFeature, resetFeatureFlags } from './features'

describe('features', () => {
  beforeEach(() => {
    resetFeatureFlags()
    // Reset the desktop app flag
    delete (window as any).__DESKTOP_APP__
  })

  it('returns web flags by default (no __DESKTOP_APP__ flag)', () => {
    const flags = getFeatureFlags()
    expect(flags.platform).toBe('web')
    expect(flags.collaboration).toBe(false)
    expect(flags.cloudSync).toBe(false)
    expect(flags.gitIntegration).toBe(false)
    expect(flags.versionHistory).toBe(false)
    expect(flags.inviteCollaborators).toBe(false)
    expect(flags.unlimitedFiles).toBe(false)
    expect(flags.nativeTerminal).toBe(false)
    expect(flags.autoUpdates).toBe(false)
    expect(flags.maxFiles).toBe(5)
  })

  it('returns desktop flags when __DESKTOP_APP__ is set', () => {
    ;(window as any).__DESKTOP_APP__ = true
    const flags = getFeatureFlags()
    expect(flags.platform).toBe('desktop')
    expect(flags.collaboration).toBe(true)
    expect(flags.cloudSync).toBe(true)
    expect(flags.gitIntegration).toBe(true)
    expect(flags.versionHistory).toBe(true)
    expect(flags.unlimitedFiles).toBe(true)
    expect(flags.nativeTerminal).toBe(true)
    expect(flags.autoUpdates).toBe(true)
    expect(flags.maxFiles).toBe(Infinity)
  })

  it('caches flags after first call', () => {
    const first = features()
    const second = features()
    expect(first).toBe(second)
  })

  it('resetFeatureFlags clears cache', () => {
    const first = features()
    resetFeatureFlags()
    const second = features()
    expect(first).not.toBe(second)
  })

  it('hasFeature returns correct values', () => {
    // Web mode - collaboration is disabled
    expect(hasFeature('collaboration')).toBe(false)
    // Web mode - platform is always defined
    expect(hasFeature('platform')).toBe(true)
  })
})
