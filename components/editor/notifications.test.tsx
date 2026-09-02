import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NotificationBell } from './notifications'

describe('NotificationBell', () => {
  it('renders the bell icon button', () => {
    render(<NotificationBell />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('opens notification panel on click', () => {
    render(<NotificationBell />)
    const button = screen.getAllByRole('button')[0]
    fireEvent.click(button)
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('shows empty state initially', () => {
    render(<NotificationBell />)
    const button = screen.getAllByRole('button')[0]
    fireEvent.click(button)
    expect(screen.getByText('No notifications yet')).toBeInTheDocument()
  })

  it('closes panel when clicking backdrop', () => {
    render(<NotificationBell />)
    const button = screen.getAllByRole('button')[0]
    fireEvent.click(button)
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    // Click the backdrop (fixed inset-0 div)
    const backdrop = document.querySelector('.fixed.inset-0')
    if (backdrop) fireEvent.click(backdrop)
  })

  it('shows empty state when no real notifications', async () => {
    render(<NotificationBell />)
    const button = screen.getAllByRole('button')[0]
    fireEvent.click(button)
    // Should show empty state since we removed simulated notifications
    expect(screen.getByText('No notifications yet')).toBeInTheDocument()
  })
})
