import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FileContextMenu } from './file-context-menu'

describe('FileContextMenu', () => {
  it('renders children', () => {
    render(
      <FileContextMenu fileName="test.tsx" onRename={vi.fn()}>
        <button>Click me</button>
      </FileContextMenu>,
    )

    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('shows context menu on right-click', () => {
    render(
      <FileContextMenu fileName="test.tsx" onRename={vi.fn()}>
        <button>Click me</button>
      </FileContextMenu>,
    )

    const trigger = screen.getByText('Click me')
    fireEvent.contextMenu(trigger)

    expect(screen.getByText('Rename')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Copy Path')).toBeInTheDocument()
    expect(screen.getByText('New File')).toBeInTheDocument()
    expect(screen.getByText('New Folder')).toBeInTheDocument()
  })

  it('calls onRename when clicking Rename', () => {
    const onRename = vi.fn()
    render(
      <FileContextMenu fileName="test.tsx" onRename={onRename}>
        <button>Click me</button>
      </FileContextMenu>,
    )

    fireEvent.contextMenu(screen.getByText('Click me'))
    fireEvent.click(screen.getByText('Rename'))

    expect(onRename).toHaveBeenCalledWith('test.tsx')
  })

  it('calls onDelete when clicking Delete', () => {
    const onDelete = vi.fn()
    render(
      <FileContextMenu fileName="test.tsx" onDelete={onDelete}>
        <button>Click me</button>
      </FileContextMenu>,
    )

    fireEvent.contextMenu(screen.getByText('Click me'))
    fireEvent.click(screen.getByText('Delete'))

    expect(onDelete).toHaveBeenCalledWith('test.tsx')
  })

  it('calls onCopyPath when clicking Copy Path', () => {
    const onCopyPath = vi.fn()
    render(
      <FileContextMenu fileName="test.tsx" onCopyPath={onCopyPath}>
        <button>Click me</button>
      </FileContextMenu>,
    )

    fireEvent.contextMenu(screen.getByText('Click me'))
    fireEvent.click(screen.getByText('Copy Path'))

    expect(onCopyPath).toHaveBeenCalledWith('test.tsx')
  })

  it('shows keyboard shortcuts', () => {
    render(
      <FileContextMenu fileName="test.tsx">
        <button>Click me</button>
      </FileContextMenu>,
    )

    fireEvent.contextMenu(screen.getByText('Click me'))

    expect(screen.getByText('⌘N')).toBeInTheDocument() // New File shortcut
    expect(screen.getByText('F2')).toBeInTheDocument() // Rename shortcut
  })

  it('closes menu when pressing Escape', () => {
    render(
      <FileContextMenu fileName="test.tsx">
        <button>Click me</button>
      </FileContextMenu>,
    )

    fireEvent.contextMenu(screen.getByText('Click me'))
    expect(screen.getByText('Rename')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('Rename')).not.toBeInTheDocument()
  })

  it('closes menu when clicking outside', () => {
    render(
      <FileContextMenu fileName="test.tsx">
        <button>Click me</button>
      </FileContextMenu>,
    )

    fireEvent.contextMenu(screen.getByText('Click me'))
    expect(screen.getByText('Rename')).toBeInTheDocument()

    // Click outside the menu
    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('Rename')).not.toBeInTheDocument()
  })

  it('does not show context menu on left-click', () => {
    render(
      <FileContextMenu fileName="test.tsx">
        <button>Click me</button>
      </FileContextMenu>,
    )

    fireEvent.click(screen.getByText('Click me'))
    expect(screen.queryByText('Rename')).not.toBeInTheDocument()
  })

  it('shows destructive style for Delete button', () => {
    render(
      <FileContextMenu fileName="test.tsx">
        <button>Click me</button>
      </FileContextMenu>,
    )

    fireEvent.contextMenu(screen.getByText('Click me'))
    const deleteButton = screen.getByText('Delete')
    expect(deleteButton.closest('button')).toHaveClass('text-destructive')
  })
})
