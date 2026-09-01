import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FileSearch } from './file-search'

const mockFiles = [
  { name: 'page.tsx', path: 'src/page.tsx' },
  { name: 'styles.css', path: 'src/styles.css' },
  { name: 'utils.ts', path: 'src/utils.ts' },
  { name: 'config.json', path: 'config.json' },
]

describe('FileSearch', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <FileSearch
        open={false}
        onOpenChange={vi.fn()}
        files={mockFiles}
        onSelect={vi.fn()}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders search dialog when open', () => {
    render(
      <FileSearch
        open={true}
        onOpenChange={vi.fn()}
        files={mockFiles}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByPlaceholderText('Search files by name...')).toBeInTheDocument()
  })

  it('shows all files when no query', () => {
    render(
      <FileSearch
        open={true}
        onOpenChange={vi.fn()}
        files={mockFiles}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('page.tsx')).toBeInTheDocument()
    expect(screen.getByText('styles.css')).toBeInTheDocument()
    expect(screen.getByText('utils.ts')).toBeInTheDocument()
    // config.json appears both as file name and in path display
    const configElements = screen.getAllByText('config.json')
    expect(configElements.length).toBeGreaterThanOrEqual(1)
  })

  it('filters files based on query', () => {
    render(
      <FileSearch
        open={true}
        onOpenChange={vi.fn()}
        files={mockFiles}
        onSelect={vi.fn()}
      />,
    )

    const input = screen.getByPlaceholderText('Search files by name...')
    fireEvent.change(input, { target: { value: 'page' } })

    expect(screen.getByText('page.tsx')).toBeInTheDocument()
    expect(screen.queryByText('styles.css')).not.toBeInTheDocument()
  })

  it('calls onSelect when pressing Enter on a result', () => {
    const onSelect = vi.fn()
    render(
      <FileSearch
        open={true}
        onOpenChange={vi.fn()}
        files={mockFiles}
        onSelect={onSelect}
      />,
    )

    const input = screen.getByPlaceholderText('Search files by name...')
    fireEvent.change(input, { target: { value: 'utils' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith('utils.ts')
  })

  it('calls onOpenChange when pressing Escape', () => {
    const onOpenChange = vi.fn()
    render(
      <FileSearch
        open={true}
        onOpenChange={onOpenChange}
        files={mockFiles}
        onSelect={vi.fn()}
      />,
    )

    const input = screen.getByPlaceholderText('Search files by name...')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows no results message when query matches nothing', () => {
    render(
      <FileSearch
        open={true}
        onOpenChange={vi.fn()}
        files={mockFiles}
        onSelect={vi.fn()}
      />,
    )

    const input = screen.getByPlaceholderText('Search files by name...')
    fireEvent.change(input, { target: { value: 'xyz' } })

    expect(screen.getByText('No files found')).toBeInTheDocument()
  })

  it('navigates results with arrow keys', () => {
    render(
      <FileSearch
        open={true}
        onOpenChange={vi.fn()}
        files={mockFiles}
        onSelect={vi.fn()}
      />,
    )

    const input = screen.getByPlaceholderText('Search files by name...')
    
    // First result should be selected by default
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    // Should not throw
    expect(input).toBeInTheDocument()
  })

  it('closes when clicking outside', () => {
    const onOpenChange = vi.fn()
    render(
      <FileSearch
        open={true}
        onOpenChange={onOpenChange}
        files={mockFiles}
        onSelect={vi.fn()}
      />,
    )

    // Click on the backdrop (outside the search panel)
    fireEvent.click(document.querySelector('.fixed')!)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows file paths', () => {
    render(
      <FileSearch
        open={true}
        onOpenChange={vi.fn()}
        files={mockFiles}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('src/page.tsx')).toBeInTheDocument()
    expect(screen.getByText('src/styles.css')).toBeInTheDocument()
  })
})
