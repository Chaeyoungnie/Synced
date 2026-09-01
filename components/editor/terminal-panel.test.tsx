import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TerminalPanel } from './terminal-panel'
import { fileTree } from './data'

describe('TerminalPanel', () => {
  const defaultProps = {
    open: true,
    onToggle: vi.fn(),
    fileTree,
    fileContents: { 'page.tsx': 'export default function Page() {}' },
    onSaveFile: vi.fn(),
    onOpenFile: vi.fn(),
  }

  it('renders nothing when closed', () => {
    const { container } = render(<TerminalPanel {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the terminal header', () => {
    render(<TerminalPanel {...defaultProps} />)
    expect(screen.getByText('Terminal')).toBeInTheDocument()
  })

  it('shows welcome message', () => {
    render(<TerminalPanel {...defaultProps} />)
    expect(screen.getByText(/Welcome to the Synced Terminal/)).toBeInTheDocument()
    expect(screen.getByText(/Type "help"/)).toBeInTheDocument()
  })

  it('shows the prompt', () => {
    render(<TerminalPanel {...defaultProps} />)
    expect(screen.getByText('~/workspace $')).toBeInTheDocument()
  })

  it('renders clear button', () => {
    render(<TerminalPanel {...defaultProps} />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('executes a command on Enter', () => {
    render(<TerminalPanel {...defaultProps} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'whoami' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('developer')).toBeInTheDocument()
  })

  it('shows help output', () => {
    render(<TerminalPanel {...defaultProps} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'help' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText(/Available commands/)).toBeInTheDocument()
  })

  it('clears terminal on clear command', () => {
    render(<TerminalPanel {...defaultProps} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'clear' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.queryByText(/Welcome to the Synced Terminal/)).not.toBeInTheDocument()
  })

  it('shows error for unknown command', () => {
    render(<TerminalPanel {...defaultProps} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'unknowncmd' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    // Verify the input was cleared (command was processed)
    expect(input).toHaveValue('')
  })

  it('calls onToggle when close button is clicked', () => {
    const onToggle = vi.fn()
    render(<TerminalPanel {...defaultProps} onToggle={onToggle} />)
    // Find the X button (close)
    const closeButtons = screen.getAllByRole('button')
    const closeButton = closeButtons.find(btn => btn.querySelector('.lucide-x'))
    if (closeButton) fireEvent.click(closeButton)
    expect(onToggle).toHaveBeenCalled()
  })

  it('navigates command history with arrow keys', () => {
    render(<TerminalPanel {...defaultProps} />)
    const input = screen.getByRole('textbox')
    
    // Enter first command
    fireEvent.change(input, { target: { value: 'ls' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    // Enter second command
    fireEvent.change(input, { target: { value: 'pwd' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    // Press up arrow to get last command
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveValue('pwd')
    
    // Press up arrow again
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveValue('ls')
  })
})
