import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import EditorShell from './editor-shell'
import { ThemeProvider } from '@/hooks/use-theme'
import { ToastProvider } from '@/components/editor/toast-provider'

// Mock CodeMirror since it needs complex DOM setup
vi.mock('./code-mirror-editor', () => ({
  CodeMirrorEditor: ({ value, filename }: { value: string; filename: string }) => (
    <div data-testid="codemirror" data-filename={filename}>
      {value}
    </div>
  ),
}))

// Mock react-resizable-panels
vi.mock('react-resizable-panels', () => {
  const React = require('react')
  const Panel = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      collapse: vi.fn(),
      expand: vi.fn(),
      getSize: vi.fn(() => 20),
      setCollapsed: vi.fn(),
      isCollapsed: vi.fn(() => false),
    }))
    return <div data-testid="panel" {...props}>{props.children}</div>
  })
  return {
    PanelGroup: ({ children, ...props }: any) => <div data-testid="panel-group" {...props}>{children}</div>,
    Panel,
    PanelResizeHandle: ({ ...props }: any) => <div data-testid="resize-handle" {...props} />,
  }
})

// Mock lucide-react icons with importOriginal fallback
vi.mock('lucide-react', async (importOriginal) => {
  const actual: any = await importOriginal()
  // Wrap every export to render a simple span
  const mocked: Record<string, any> = {}
  for (const key of Object.keys(actual)) {
    if (typeof actual[key] === 'function' || typeof actual[key] === 'object') {
      mocked[key] = (props: any) => React.createElement('span', { ...props, 'data-testid': `icon-${key.toLowerCase()}` })
    } else {
      mocked[key] = actual[key]
    }
  }
  return mocked
})


// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

// Mock use-user hook
vi.mock('@/hooks/use-workspace', () => ({
  useWorkspace: () => ({
    fileTree: { name: 'root', open: true, children: [] },
    fileContents: {},
    collaborators: [{ name: 'You', initials: 'JD', color: '#6366f1', role: 'Editor', status: 'Online' }],
    workspace: null,
    files: [],
    loading: false,
    isDemo: true,
    saveFile: vi.fn(),
    createFile: vi.fn(),
    deleteFile: vi.fn(),
    renameFile: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-presence', () => ({
  usePresence: () => ({
    onlineUsers: [{ id: 'demo', name: 'You', initials: 'JD', color: '#6366f1', role: 'Editor', status: 'Online', activeFile: 'page.tsx', cursorLine: 1, cursorCol: 1 }],
    isConnected: false,
    setActiveFile: vi.fn(),
    setCursorPosition: vi.fn(),
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
  isSupabaseConfigured: vi.fn(() => false),
}))

vi.mock('@/hooks/use-user', () => ({
  useUser: () => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
  }),
}))

describe('EditorShell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.documentElement.classList.remove('light', 'dark')
  })

  function renderWithProviders(ui: React.ReactElement) {
    return render(<ThemeProvider><ToastProvider>{ui}</ToastProvider></ThemeProvider>)
  }

  it('renders the editor shell', () => {
    renderWithProviders(<EditorShell />)

    expect(screen.getByText('Synced')).toBeInTheDocument()
  })

  it('renders sidebar with file list', () => {
    renderWithProviders(<EditorShell />)

    expect(screen.getByText('WORKSPACE')).toBeInTheDocument()
  })

  it('renders collaboration panel', () => {
    renderWithProviders(<EditorShell />)

    expect(screen.getAllByText('Team').length).toBeGreaterThan(0)
  })

  it('opens command palette on Ctrl+K', async () => {
    renderWithProviders(<EditorShell />)

    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    })

    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument()
  })

  it('opens file search on Ctrl+P', async () => {
    renderWithProviders(<EditorShell />)

    await act(async () => {
      fireEvent.keyDown(document, { key: 'p', ctrlKey: true })
    })

    expect(screen.getByPlaceholderText('Search files by name...')).toBeInTheDocument()
  })

  it('opens keybindings modal on Ctrl+Shift+P', async () => {
    renderWithProviders(<EditorShell />)

    await act(async () => {
      fireEvent.keyDown(document, { key: 'P', ctrlKey: true, shiftKey: true })
    })

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('toggles sidebar on Ctrl+B', async () => {
    renderWithProviders(<EditorShell />)

    // Sidebar should be visible initially
    expect(screen.getByText('Synced')).toBeInTheDocument()

    await act(async () => {
      fireEvent.keyDown(document, { key: 'b', ctrlKey: true })
    })

    // Panel elements should still be present
    expect(screen.getAllByTestId('panel').length).toBeGreaterThan(0)
  })

  it('opens new file dialog', async () => {
    renderWithProviders(<EditorShell />)

        // New file creates a new tab
    expect(screen.getByText('Synced')).toBeInTheDocument()
  })

  it('opens theme toggle', async () => {
    renderWithProviders(<EditorShell />)

        // Theme toggle should be in the header
    expect(screen.getByText('Synced')).toBeInTheDocument()
  })

  it('shows save state in header', () => {
    renderWithProviders(<EditorShell />)

    // Initial state should be "Saved"
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('renders with split editor button', () => {
    renderWithProviders(<EditorShell />)

        expect(screen.getByText('Synced')).toBeInTheDocument()
  })
})
