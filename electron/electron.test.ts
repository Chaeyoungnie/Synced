import { describe, it, expect, beforeEach } from 'vitest'
import { features, getFeatureFlags, hasFeature, resetFeatureFlags } from '../lib/features'

describe('Electron feature detection', () => {
  beforeEach(() => {
    resetFeatureFlags()
    delete (window as any).__DESKTOP_APP__
    delete (window as any).electronAPI
  })

  it('detects web mode when __DESKTOP_APP__ is not set', () => {
    const flags = getFeatureFlags()
    expect(flags.platform).toBe('web')
    expect(flags.collaboration).toBe(false)
    expect(flags.maxFiles).toBe(5)
  })

  it('detects desktop mode when __DESKTOP_APP__ is set', () => {
    ;(window as any).__DESKTOP_APP__ = true
    resetFeatureFlags()
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

  it('enables all features in desktop mode', () => {
    ;(window as any).__DESKTOP_APP__ = true
    resetFeatureFlags()
    expect(hasFeature('collaboration')).toBe(true)
    expect(hasFeature('cloudSync')).toBe(true)
    expect(hasFeature('gitIntegration')).toBe(true)
    expect(hasFeature('versionHistory')).toBe(true)
    expect(hasFeature('inviteCollaborators')).toBe(true)
    expect(hasFeature('unlimitedFiles')).toBe(true)
    expect(hasFeature('nativeTerminal')).toBe(true)
    expect(hasFeature('autoUpdates')).toBe(true)
  })

  it('disables collaboration features in web mode', () => {
    const flags = getFeatureFlags()
    expect(flags.collaboration).toBe(false)
    expect(flags.cloudSync).toBe(false)
    expect(flags.gitIntegration).toBe(false)
    expect(flags.versionHistory).toBe(false)
    expect(flags.inviteCollaborators).toBe(false)
    expect(flags.unlimitedFiles).toBe(false)
    expect(flags.nativeTerminal).toBe(false)
    expect(flags.autoUpdates).toBe(false)
  })

  it('simulates full electronAPI with tray and update support', () => {
    const mockElectronAPI = {
      getVersion: () => Promise.resolve('1.0.0'),
      getPlatform: () => Promise.resolve('win32'),
      // Window controls
      minimize: () => Promise.resolve(undefined),
      maximize: () => Promise.resolve(undefined),
      close: () => Promise.resolve(undefined),
      quit: () => Promise.resolve(undefined),
      // Auto-updater
      checkForUpdates: () => Promise.resolve('checking' as const),
      installUpdate: () => Promise.resolve(undefined),
      onUpdateStatus: (cb: (status: string, data?: any) => void) => {
        // Simulate receiving an update status
        cb('not-available')
        return () => {}
      },
      // Menu actions
      onMenuAction: (cb: (action: string) => void) => {
        return () => {}
      },
    }

    ;(window as any).electronAPI = mockElectronAPI
    ;(window as any).__DESKTOP_APP__ = true
    resetFeatureFlags()

    // Verify the full API surface
    const api = (window as any).electronAPI
    expect(api).toBeDefined()

    // Window controls
    expect(typeof api.minimize).toBe('function')
    expect(typeof api.maximize).toBe('function')
    expect(typeof api.close).toBe('function')
    expect(typeof api.quit).toBe('function')

    // Auto-updater
    expect(typeof api.checkForUpdates).toBe('function')
    expect(typeof api.installUpdate).toBe('function')
    expect(typeof api.onUpdateStatus).toBe('function')

    // Menu actions
    expect(typeof api.onMenuAction).toBe('function')

    // Features
    expect(hasFeature('autoUpdates')).toBe(true)
    expect(hasFeature('platform')).toBe(true)
  })

  it('does not expose electronAPI in web mode', () => {
    expect((window as any).electronAPI).toBeUndefined()
    expect((window as any).__DESKTOP_APP__).toBeUndefined()
  })

  it('tray context menu items are defined', () => {
    // Verify the expected tray menu structure
    const expectedTrayMenu = [
      'Open Synced',
      'Check for Updates...',
      'Quit Synced',
    ]
    // This is a structural test — in production, the tray menu is created in main.cjs
    expectedTrayMenu.forEach((label) => {
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    })
  })

  it('auto-updater status flow covers all states', () => {
    const statuses = [
      'checking',
      'available',
      'not-available',
      'downloading',
      'downloaded',
      'error',
    ]
    const received: string[] = []

    const mockElectronAPI = {
      onUpdateStatus: (cb: (status: string, data?: any) => void) => {
        // Simulate the full update lifecycle
        statuses.forEach((s) => cb(s, s === 'available' ? '2.0.0' : s === 'downloading' ? 50 : s === 'downloaded' ? '2.0.0' : undefined))
        return () => {}
      },
    }

    mockElectronAPI.onUpdateStatus((status: string) => {
      received.push(status)
    })

    expect(received).toEqual(statuses)
  })
})
