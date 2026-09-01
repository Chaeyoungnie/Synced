import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrialBanner } from './trial-banner'
import * as features from '@/lib/features'
import Link from 'next/link'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe('TrialBanner', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders on web platform', () => {
    vi.spyOn(features, 'features').mockReturnValue({
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
    })

    render(<TrialBanner />)
    expect(screen.getByText(/free web trial/i)).toBeInTheDocument()
    expect(screen.getByText(/limited to 5 files/i)).toBeInTheDocument()
  })

  it('does not render on desktop platform', () => {
    vi.spyOn(features, 'features').mockReturnValue({
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
    })

    const { container } = render(<TrialBanner />)
    expect(container.innerHTML).toBe('')
  })

  it('shows download link', () => {
    vi.spyOn(features, 'features').mockReturnValue({
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
    })

    render(<TrialBanner />)
    expect(screen.getByText(/Get Desktop App/)).toBeInTheDocument()
  })

  it('dismisses when X is clicked', async () => {
    vi.spyOn(features, 'features').mockReturnValue({
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
    })

    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    const { container } = render(<TrialBanner />)
    
    const dismissButton = screen.getByLabelText('Dismiss')
    await user.click(dismissButton)
    
    expect(container.innerHTML).toBe('')
  })
})
