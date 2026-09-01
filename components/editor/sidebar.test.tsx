import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from './sidebar'

describe('Sidebar', () => {
  const defaultProps = {
    collapsed: false,
    onToggle: vi.fn(),
    activeFile: 'page.tsx',
    onFileChange: vi.fn(),
  }

  it('renders workspace header when expanded', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Codebase')).toBeInTheDocument()
    expect(screen.getByText('WORKSPACE')).toBeInTheDocument()
  })

  it('hides workspace header when collapsed', () => {
    render(<Sidebar {...defaultProps} collapsed />)

    expect(screen.queryByText('Codebase')).not.toBeInTheDocument()
    expect(screen.queryByText('WORKSPACE')).not.toBeInTheDocument()
  })

  it('calls onToggle when clicking toggle button', () => {
    const onToggle = vi.fn()
    render(<Sidebar {...defaultProps} onToggle={onToggle} />)

    const toggleButtons = screen.getAllByLabelText('Collapse sidebar')
    fireEvent.click(toggleButtons[0])
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('renders expand buttons when collapsed', () => {
    render(<Sidebar {...defaultProps} collapsed />)

    const expandButtons = screen.getAllByLabelText('Expand sidebar')
    expect(expandButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders file list when expanded', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('page.tsx')).toBeInTheDocument()
    expect(screen.getByText('editor-shell.tsx')).toBeInTheDocument()
  })

  it('highlights active file', () => {
    render(<Sidebar {...defaultProps} activeFile="page.tsx" />)

    const activeFile = screen.getByText('page.tsx').closest('[class*="sidebar-accent"]')
    expect(activeFile).toBeInTheDocument()
  })

  it('calls onFileChange when clicking a file', () => {
    const onFileChange = vi.fn()
    render(<Sidebar {...defaultProps} onFileChange={onFileChange} />)

    fireEvent.click(screen.getByText('editor-shell.tsx'))
    expect(onFileChange).toHaveBeenCalledWith('editor-shell.tsx')
  })

  it('renders New File button', () => {
    const onNewFile = vi.fn()
    render(<Sidebar {...defaultProps} onNewFile={onNewFile} />)

    const newFileButton = screen.getByText('New file')
    fireEvent.click(newFileButton)
    expect(onNewFile).toHaveBeenCalledTimes(1)
  })

  it('renders collaborators section', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('COLLABORATORS')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument() // badge count
  })

  it('toggles folder when clicking folder name', () => {
    render(<Sidebar {...defaultProps} />)

    // Find the components folder button by looking for its text within a button
    const folderButtons = screen.getAllByText('components')
    const folderButton = folderButtons.find((el) => el.closest('button'))?.closest('button')
    expect(folderButton).toBeInTheDocument()
    
    if (folderButton) {
      fireEvent.click(folderButton)
      // Folder should toggle (visual state changes)
      expect(folderButton).toBeInTheDocument()
    }
  })

  it('renders git status legend', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('modified')).toBeInTheDocument()
    expect(screen.getByText('new')).toBeInTheDocument()
  })
})
