import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TitleBar } from './titlebar'

describe('TitleBar', () => {
  beforeEach(() => {
    delete (window as any).electronAPI
    delete (window as any).__DESKTOP_APP__
  })

  it('renders minimize, maximize, and close buttons on Windows', async () => {
    ;(window as any).electronAPI = {
      getPlatform: () => Promise.resolve('win32'),
      minimize: vi.fn(),
      maximize: vi.fn(),
      close: vi.fn(),
    }

    render(<TitleBar />)

    await waitFor(() => {
      expect(screen.getByLabelText('Minimize')).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Maximize')).toBeInTheDocument()
    expect(screen.getByLabelText('Close')).toBeInTheDocument()
  })

  it('renders traffic light spacing on macOS', async () => {
    ;(window as any).electronAPI = {
      getPlatform: () => Promise.resolve('darwin'),
    }

    const { container } = render(<TitleBar />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Minimize')).not.toBeInTheDocument()
    })
    expect(screen.queryByLabelText('Maximize')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument()

    const spacer = container.querySelector('.w-20')
    expect(spacer).toBeInTheDocument()
  })

  it('calls minimize when minimize button clicked', async () => {
    const minimize = vi.fn()
    ;(window as any).electronAPI = {
      getPlatform: () => Promise.resolve('win32'),
      minimize,
      maximize: vi.fn(),
      close: vi.fn(),
    }

    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(<TitleBar />)

    await waitFor(() => {
      expect(screen.getByLabelText('Minimize')).toBeInTheDocument()
    })
    await user.click(screen.getByLabelText('Minimize'))
    expect(minimize).toHaveBeenCalledOnce()
  })

  it('calls close when close button clicked', async () => {
    const close = vi.fn()
    ;(window as any).electronAPI = {
      getPlatform: () => Promise.resolve('win32'),
      minimize: vi.fn(),
      maximize: vi.fn(),
      close,
    }

    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(<TitleBar />)

    await waitFor(() => {
      expect(screen.getByLabelText('Close')).toBeInTheDocument()
    })
    await user.click(screen.getByLabelText('Close'))
    expect(close).toHaveBeenCalledOnce()
  })

  it('renders draggable region', async () => {
    ;(window as any).electronAPI = {
      getPlatform: () => Promise.resolve('win32'),
    }

    render(<TitleBar />)
    await waitFor(() => {
      expect(screen.getByLabelText('Minimize')).toBeInTheDocument()
    })
    const dragRegion = document.querySelector('[data-tauri-drag-region]')
    expect(dragRegion).toBeInTheDocument()
  })

  it('window control buttons are outside drag region', async () => {
    ;(window as any).electronAPI = {
      getPlatform: () => Promise.resolve('win32'),
    }

    render(<TitleBar />)
    await waitFor(() => {
      expect(screen.getByLabelText('Minimize')).toBeInTheDocument()
    })
    const minimizeBtn = screen.getByLabelText('Minimize')
    expect(minimizeBtn.closest('[data-tauri-drag-region]')).toBeNull()
  })
})
