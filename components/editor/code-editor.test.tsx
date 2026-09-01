import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CodeEditor, EmptyState } from './code-editor'

// Mock CodeMirror since it needs a DOM with specific features
vi.mock('./code-mirror-editor', () => ({
  CodeMirrorEditor: ({ value, filename }: { value: string; filename: string }) => (
    <div data-testid="codemirror-editor" data-filename={filename}>
      {value}
    </div>
  ),
}))

const mockContents: Record<string, string> = {
  'page.tsx': 'export default function Page() { return <div>Hello</div> }',
  'styles.css': 'body { margin: 0; }',
  'config.json': '{"name": "test"}',
}

describe('CodeEditor', () => {
  it('renders the editor with file content', () => {
    render(
      <CodeEditor
        activeFile="page.tsx"
        fileContents={mockContents}
      />,
    )

    expect(screen.getByText('page.tsx')).toBeInTheDocument()
    expect(screen.getByTestId('codemirror-editor')).toBeInTheDocument()
  })

  it('shows language badge', () => {
    render(
      <CodeEditor
        activeFile="page.tsx"
        fileContents={mockContents}
      />,
    )

    // Language appears in both the file header badge and status bar
    const tsElements = screen.getAllByText('TypeScript')
    expect(tsElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows CSS language for CSS files', () => {
    render(
      <CodeEditor
        activeFile="styles.css"
        fileContents={mockContents}
      />,
    )

    // CSS appears in the status bar and file header
    const cssElements = screen.getAllByText('CSS')
    expect(cssElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows JSON language for JSON files', () => {
    render(
      <CodeEditor
        activeFile="config.json"
        fileContents={mockContents}
      />,
    )

    // JSON appears in the status bar and file header
    const jsonElements = screen.getAllByText('JSON')
    expect(jsonElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows status bar with file info', () => {
    render(
      <CodeEditor
        activeFile="page.tsx"
        fileContents={mockContents}
      />,
    )

    expect(screen.getByText('Ready')).toBeInTheDocument()
    expect(screen.getByText('UTF-8')).toBeInTheDocument()
    expect(screen.getByText(/Spaces: 2/)).toBeInTheDocument()
  })

  it('shows cursor position', () => {
    render(
      <CodeEditor
        activeFile="page.tsx"
        fileContents={mockContents}
      />,
    )

    expect(screen.getByText(/Ln 1, Col 1/)).toBeInTheDocument()
  })

  it('calls onCloseFile when clicking close button', () => {
    const onCloseFile = vi.fn()
    render(
      <CodeEditor
        activeFile="page.tsx"
        fileContents={mockContents}
        onCloseFile={onCloseFile}
      />,
    )

    const closeButton = screen.getByLabelText('Close file')
    closeButton.click()
    expect(onCloseFile).toHaveBeenCalledTimes(1)
  })

  it('passes file content to CodeMirror', () => {
    render(
      <CodeEditor
        activeFile="page.tsx"
        fileContents={mockContents}
      />,
    )

    const editor = screen.getByTestId('codemirror-editor')
    expect(editor).toHaveTextContent(mockContents['page.tsx'])
  })
})

describe('EmptyState', () => {
  it('renders when no file is open', () => {
    render(<EmptyState />)

    expect(screen.getByText('No file open')).toBeInTheDocument()
    expect(screen.getByText(/Select a file from the sidebar/)).toBeInTheDocument()
  })

  it('shows New file button', () => {
    render(<EmptyState />)

    expect(screen.getByText('New file')).toBeInTheDocument()
  })

  it('shows Ctrl+P hint', () => {
    render(<EmptyState />)

    expect(screen.getByText('Ctrl+P')).toBeInTheDocument()
  })

  it('calls onNewFile when clicking New file button', () => {
    const onNewFile = vi.fn()
    render(<EmptyState onNewFile={onNewFile} />)

    const newFileButton = screen.getByText('New file')
    newFileButton.click()
    expect(onNewFile).toHaveBeenCalledTimes(1)
  })
})
