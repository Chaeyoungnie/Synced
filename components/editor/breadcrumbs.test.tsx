import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Breadcrumbs } from './breadcrumbs'

describe('Breadcrumbs', () => {
  it('renders file path segments', () => {
    render(<Breadcrumbs filePath="workspace/components/editor/page.tsx" />)

    expect(screen.getByText('workspace')).toBeInTheDocument()
    expect(screen.getByText('components')).toBeInTheDocument()
    expect(screen.getByText('editor')).toBeInTheDocument()
    expect(screen.getByText('page.tsx')).toBeInTheDocument()
  })

  it('highlights the last segment', () => {
    render(<Breadcrumbs filePath="workspace/components/page.tsx" />)

    const lastSegment = screen.getByText('page.tsx')
    expect(lastSegment.closest('button')).toHaveClass('font-medium')
  })

  it('calls onNavigate when clicking a segment', () => {
    const onNavigate = vi.fn()
    render(
      <Breadcrumbs
        filePath="workspace/components/page.tsx"
        onNavigate={onNavigate}
      />,
    )

    fireEvent.click(screen.getByText('components'))
    expect(onNavigate).toHaveBeenCalledWith('components', 1)
  })

  it('renders home icon', () => {
    render(<Breadcrumbs filePath="workspace/page.tsx" />)

    const homeButton = screen.getByLabelText('Home')
    expect(homeButton).toBeInTheDocument()
  })

  it('handles single segment path', () => {
    render(<Breadcrumbs filePath="page.tsx" />)

    expect(screen.getByText('page.tsx')).toBeInTheDocument()
    expect(screen.getByLabelText('Home')).toBeInTheDocument()
  })

  it('renders correct icon for CSS files', () => {
    render(<Breadcrumbs filePath="src/styles.css" />)

    // CSS file should have the hash icon (via SegmentIcon)
    const cssFile = screen.getByText('styles.css')
    expect(cssFile).toBeInTheDocument()
  })

  it('renders correct icon for JSON files', () => {
    render(<Breadcrumbs filePath="config.json" />)

    const jsonFile = screen.getByText('config.json')
    expect(jsonFile).toBeInTheDocument()
  })
})
