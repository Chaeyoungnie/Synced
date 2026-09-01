import { describe, it, expect, beforeEach } from 'vitest'
import { getFeatureFlags, features, hasFeature, resetFeatureFlags, type FeatureFlags } from './features'

describe('features', () => {
  beforeEach(() => {
    resetFeatureFlags()
    // Reset navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true,
      configurable: true,
    })
  })

  it('returns web flags by default (no Electron in user agent)', () => {
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

  it('returns desktop flags when Electron detected', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Electron/25.0.0',
      writable: true,
      configurable: true,
    })
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

  it('hasFeature returns true for enabled features', () => {
    // Web mode - collaboration is disabled
    expect(hasFeature('collaboration')).toBe(false)
    // Web mode - platform is always defined
    expect(hasFeature('platform')).toBe(true)
  })
})
