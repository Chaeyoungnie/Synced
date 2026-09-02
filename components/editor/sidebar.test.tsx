import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from './sidebar'
import type { FolderNode } from './data'

const testFileTree: FolderNode = {
  name: 'workspace',
  open: true,
  children: [
    { name: 'page.tsx', type: 'code', status: 'committed' },
    { name: 'editor-shell.tsx', type: 'code', status: 'modified' },
    { name: 'globals.css', type: 'css', status: 'committed' },
    {
      name: 'components',
      open: true,
      children: [
        { name: 'sidebar.tsx', type: 'code', status: 'committed' },
      ],
    },
  ],
}

describe('Sidebar', () => {
  const defaultProps = {
    collapsed: false,
    onToggle: vi.fn(),
    activeFile: 'page.tsx',
    onFileChange: vi.fn(),
    fileTree: testFileTree,
  }

  it('renders workspace header when expanded', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Synced')).toBeInTheDocument()
    expect(screen.getByText('WORKSPACE')).toBeInTheDocument()
  })

  it('hides workspace header when collapsed', () => {
    render(<Sidebar {...defaultProps} collapsed />)

    expect(screen.queryByText('Synced')).not.toBeInTheDocument()
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
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('toggles folder when clicking folder name', () => {
    render(<Sidebar {...defaultProps} />)

    const folderButtons = screen.getAllByText('components')
    const folderButton = folderButtons.find((el) => el.closest('button'))?.closest('button')
    expect(folderButton).toBeInTheDocument()

    if (folderButton) {
      fireEvent.click(folderButton)
      expect(folderButton).toBeInTheDocument()
    }
  })

  it('renders git status legend', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('modified')).toBeInTheDocument()
    expect(screen.getByText('new')).toBeInTheDocument()
  })

  it('shows no files message when fileTree is empty', () => {
    const emptyTree: FolderNode = { name: 'workspace', open: true, children: [] }
    render(<Sidebar {...defaultProps} fileTree={emptyTree} />)

    expect(screen.getByText('No files yet')).toBeInTheDocument()
  })
})
