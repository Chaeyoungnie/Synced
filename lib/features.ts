// Feature flags for Web Trial vs Desktop Full Experience

export type AppPlatform = 'web' | 'desktop'

export interface FeatureFlags {
  platform: AppPlatform
  collaboration: boolean
  cloudSync: boolean
  gitIntegration: boolean
  versionHistory: boolean
  inviteCollaborators: boolean
  unlimitedFiles: boolean
  nativeTerminal: boolean
  autoUpdates: boolean
  maxFiles: number
}

export function getPlatform(): AppPlatform {
  if (typeof window === 'undefined') return 'web'
  // Check for a global flag set by the Electron preload script.
  // We do NOT use navigator.userAgent because the dev environment itself
  // runs inside Electron (Freebuff), so every page would appear as 'desktop'.
  const isDesktopApp = !!(window as any).__DESKTOP_APP__
  return isDesktopApp ? 'desktop' : 'web'
}

export function getFeatureFlags(): FeatureFlags {
  const platform = getPlatform()
  
  if (platform === 'desktop') {
    return {
      platform: 'desktop',
      collaboration: true,
      cloudSync: true,
      gitIntegration: true,
      versionHistory: true,
      inviteCollaborators: true,
      unlimitedFiles: true,
      nativeTerminal: true,
      autoUpdates: true,
      maxFiles: Infinity,
    }
  }

  // Web trial mode - limited features
  return {
    platform: 'web',
    collaboration: false,
    cloudSync: false,
    gitIntegration: false,
    versionHistory: false,
    inviteCollaborators: false,
    unlimitedFiles: false,
    nativeTerminal: false,
    autoUpdates: false,
    maxFiles: 5,
  }
}

// Singleton flag instance (computed once)
let cachedFlags: FeatureFlags | null = null

export function features(): FeatureFlags {
  if (!cachedFlags) {
    cachedFlags = getFeatureFlags()
  }
  return cachedFlags
}

// Check if a specific feature is available
export function hasFeature(feature: keyof FeatureFlags): boolean {
  const flags = features()
  return Boolean(flags[feature])
}

// Reset cache (useful for testing)
export function resetFeatureFlags(): void {
  cachedFlags = null
}
