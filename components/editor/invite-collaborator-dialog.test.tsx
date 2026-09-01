import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { InviteCollaboratorDialog } from './invite-collaborator-dialog'

describe('InviteCollaboratorDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onInvite: vi.fn().mockResolvedValue(undefined),
  }

  it('renders nothing when closed', () => {
    const { container } = render(<InviteCollaboratorDialog {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the dialog when open', () => {
    render(<InviteCollaboratorDialog {...defaultProps} />)
    expect(screen.getByText('Invite Collaborator')).toBeInTheDocument()
    expect(screen.getByText(/Add a team member/)).toBeInTheDocument()
  })

  it('renders email input', () => {
    render(<InviteCollaboratorDialog {...defaultProps} />)
    expect(screen.getByPlaceholderText('colleague@example.com')).toBeInTheDocument()
  })

  it('renders role selector with all three roles', () => {
    render(<InviteCollaboratorDialog {...defaultProps} />)
    expect(screen.getByText('Viewer')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('defaults to Editor role', () => {
    render(<InviteCollaboratorDialog {...defaultProps} />)
    const editorBtn = screen.getByText('Editor').closest('button')!
    expect(editorBtn.className).toContain('border-primary')
  })

  it('allows selecting a different role', () => {
    render(<InviteCollaboratorDialog {...defaultProps} />)
    fireEvent.click(screen.getByText('Viewer'))
    const viewerBtn = screen.getByText('Viewer').closest('button')!
    expect(viewerBtn.className).toContain('border-primary')
  })

  it('calls onInvite with email and role on submit', async () => {
    const onInvite = vi.fn().mockResolvedValue(undefined)
    render(<InviteCollaboratorDialog {...defaultProps} onInvite={onInvite} />)

    fireEvent.change(screen.getByPlaceholderText('colleague@example.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByText('Viewer'))
    fireEvent.click(screen.getByText('Send Invite'))

    await waitFor(() => {
      expect(onInvite).toHaveBeenCalledWith('test@example.com', 'viewer')
    })
  })

  it('shows success message after invite', async () => {
    render(<InviteCollaboratorDialog {...defaultProps} />)

    fireEvent.change(screen.getByPlaceholderText('colleague@example.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByText('Send Invite'))

    await waitFor(() => {
      expect(screen.getByText('Invitation sent!')).toBeInTheDocument()
    })
  })

  it('shows error message on failure', async () => {
    const onInvite = vi.fn().mockRejectedValue(new Error('User not found'))
    render(<InviteCollaboratorDialog {...defaultProps} onInvite={onInvite} />)

    fireEvent.change(screen.getByPlaceholderText('colleague@example.com'), {
      target: { value: 'unknown@example.com' },
    })
    fireEvent.click(screen.getByText('Send Invite'))

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument()
    })
  })

  it('closes dialog on cancel', () => {
    const onOpenChange = vi.fn()
    render(<InviteCollaboratorDialog {...defaultProps} onOpenChange={onOpenChange} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables submit when email is empty', () => {
    render(<InviteCollaboratorDialog {...defaultProps} />)
    const submitBtn = screen.getByText('Send Invite')
    expect(submitBtn.closest('button')!.disabled).toBe(true)
  })

  it('enables submit when email is provided', () => {
    render(<InviteCollaboratorDialog {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('colleague@example.com'), {
      target: { value: 'test@example.com' },
    })
    const submitBtn = screen.getByText('Send Invite')
    expect(submitBtn.closest('button')!.disabled).toBe(false)
  })

  it('resets form when cancel is clicked', () => {
    render(<InviteCollaboratorDialog {...defaultProps} />)
    const input = screen.getByPlaceholderText('colleague@example.com')
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    expect(input).toHaveValue('test@example.com')
    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })
})
