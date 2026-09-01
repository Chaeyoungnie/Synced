import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VersionHistoryPanel } from './version-history-panel'
import type { FileVersion } from '@/hooks/use-file-versions'

const mockVersions: FileVersion[] = [
  {
    id: 'v-3',
    file_id: 'f1',
    content: '// Current version\nfunction hello() {}',
    version_number: 3,
    created_by: 'u1',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'v-2',
    file_id: 'f1',
    content: '// Previous version\nfunction hello() { console.log("hi") }',
    version_number: 2,
    created_by: 'u1',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'v-1',
    file_id: 'f1',
    content: '// Initial version',
    version_number: 1,
    created_by: 'u1',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

describe('VersionHistoryPanel', () => {
  const defaultProps = {
    open: true,
    onToggle: vi.fn(),
    versions: mockVersions,
    loading: false,
    currentFileName: 'page.tsx',
    currentContent: '// Current version',
    onRestore: vi.fn(),
  }

  it('renders nothing when closed', () => {
    const { container } = render(<VersionHistoryPanel {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the panel header with version count', () => {
    render(<VersionHistoryPanel {...defaultProps} />)
    expect(screen.getByText('Version History')).toBeInTheDocument()
    expect(screen.getByText('3 versions')).toBeInTheDocument()
  })

  it('displays all version numbers', () => {
    render(<VersionHistoryPanel {...defaultProps} />)
    expect(screen.getByText('v3')).toBeInTheDocument()
    expect(screen.getByText('v2')).toBeInTheDocument()
    expect(screen.getByText('v1')).toBeInTheDocument()
  })

  it('marks the latest version as CURRENT', () => {
    render(<VersionHistoryPanel {...defaultProps} />)
    expect(screen.getByText('CURRENT')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<VersionHistoryPanel {...defaultProps} loading={true} versions={[]} />)
    expect(screen.getByText('Loading versions...')).toBeInTheDocument()
  })

  it('shows empty state when no versions', () => {
    render(<VersionHistoryPanel {...defaultProps} versions={[]} />)
    expect(screen.getByText('No versions yet')).toBeInTheDocument()
  })

  it('shows the current file name', () => {
    render(<VersionHistoryPanel {...defaultProps} />)
    expect(screen.getByText('page.tsx')).toBeInTheDocument()
  })

  it('shows preview button when version is selected', () => {
    render(<VersionHistoryPanel {...defaultProps} />)
    // Click on the first version entry (v3)
    fireEvent.click(screen.getByText('v3'))
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('does not show restore button for current version', () => {
    render(<VersionHistoryPanel {...defaultProps} />)
    fireEvent.click(screen.getByText('v3'))
    expect(screen.queryByText('Restore')).not.toBeInTheDocument()
  })

  it('shows restore button for non-current versions', () => {
    render(<VersionHistoryPanel {...defaultProps} />)
    fireEvent.click(screen.getByText('v2'))
    expect(screen.getByText('Restore')).toBeInTheDocument()
  })

  it('calls onRestore with version content when restore is clicked', () => {
    const onRestore = vi.fn()
    render(<VersionHistoryPanel {...defaultProps} onRestore={onRestore} />)
    fireEvent.click(screen.getByText('v2'))
    fireEvent.click(screen.getByText('Restore'))
    expect(onRestore).toHaveBeenCalledWith(mockVersions[1].content)
  })

  it('shows preview content when preview button is clicked', () => {
    render(<VersionHistoryPanel {...defaultProps} />)
    fireEvent.click(screen.getByText('v2'))
    fireEvent.click(screen.getByText('Preview'))
    expect(screen.getByText('Preview', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText(/Previous version/)).toBeInTheDocument()
  })

  it('shows expand/collapse button', () => {
    render(<VersionHistoryPanel {...defaultProps} />)
    fireEvent.click(screen.getByText('v2'))
    expect(screen.getByText('More')).toBeInTheDocument()
    fireEvent.click(screen.getByText('More'))
    expect(screen.getByText('Less')).toBeInTheDocument()
  })
})
