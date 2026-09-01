import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SidebarSkeleton, EditorSkeleton, CollaborationSkeleton, PageSkeleton } from './loading-skeleton'

describe('Loading Skeletons', () => {
  it('renders SidebarSkeleton', () => {
    const { container } = render(<SidebarSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders EditorSkeleton', () => {
    const { container } = render(<EditorSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders CollaborationSkeleton', () => {
    const { container } = render(<CollaborationSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders PageSkeleton', () => {
    const { container } = render(<PageSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })

  it('PageSkeleton contains all three sub-skeletons', () => {
    const { container } = render(<PageSkeleton />)
    // Should have sidebar, editor, and collaboration sections
    const children = container.firstChild as HTMLElement
    expect(children.children.length).toBe(3)
  })
})
