import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DiffViewer } from './diff-viewer'

describe('DiffViewer', () => {
  it('renders the diff header', () => {
    render(<DiffViewer oldContent="a" newContent="b" />)
    expect(screen.getByText('Diff Viewer')).toBeInTheDocument()
  })

  it('shows old and new labels', () => {
    render(<DiffViewer oldContent="a" newContent="b" oldLabel="v1" newLabel="v2" />)
    expect(screen.getByText('v1')).toBeInTheDocument()
    expect(screen.getByText('v2')).toBeInTheDocument()
  })

  it('shows default labels when not provided', () => {
    render(<DiffViewer oldContent="a" newContent="b" />)
    expect(screen.getByText('Old')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders added lines in green', () => {
    render(<DiffViewer oldContent="" newContent="new line" />)
    expect(screen.getByText('new line')).toBeInTheDocument()
  })

  it('renders removed lines in red', () => {
    render(<DiffViewer oldContent="removed line" newContent="" />)
    expect(screen.getByText('removed line')).toBeInTheDocument()
  })

  it('renders unchanged lines in both sides', () => {
    render(<DiffViewer oldContent="same line" newContent="same line" />)
    const matches = screen.getAllByText('same line')
    expect(matches.length).toBe(2)
  })

  it('shows diff stats for added content', () => {
    render(<DiffViewer oldContent="old" newContent="old\nnew line" />)
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('shows diff stats for removed content', () => {
    render(<DiffViewer oldContent="old\nremoved" newContent="old" />)
    expect(screen.getByText('-1')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<DiffViewer oldContent="a" newContent="b" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('handles identical content', () => {
    render(<DiffViewer oldContent="same" newContent="same" />)
    expect(screen.getAllByText('same').length).toBeGreaterThanOrEqual(1)
  })

  it('handles multi-line content', () => {
    const old = 'line1\nline2\nline3'
    const new_ = 'line1\nmodified\nline3'
    render(<DiffViewer oldContent={old} newContent={new_} />)
    expect(screen.getAllByText('line1').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('modified')).toBeInTheDocument()
  })
})
