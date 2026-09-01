import { describe, it, expect } from 'vitest'
import { executeCommand, createInitialState, getPrompt, type TerminalState, type TerminalContext } from './commands'
import { fileTree } from '@/components/editor/data'

const mockContext: TerminalContext = {
  fileTree,
  fileContents: {
    'page.tsx': 'export default function Page() {}',
    'globals.css': 'body { color: red; }',
  },
}

function initState(overrides?: Partial<TerminalState>): TerminalState {
  return { ...createInitialState(), ...overrides }
}

describe('terminal commands', () => {
  describe('help', () => {
    it('lists available commands', () => {
      const result = executeCommand('help', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('Available commands'))).toBe(true)
      expect(result.output.some(l => l.text.includes('ls'))).toBe(true)
      expect(result.output.some(l => l.text.includes('cd'))).toBe(true)
      expect(result.output.some(l => l.text.includes('git'))).toBe(true)
      expect(result.output.some(l => l.text.includes('npm'))).toBe(true)
    })
  })

  describe('ls', () => {
    it('lists root directory contents', () => {
      const result = executeCommand('ls', initState(), mockContext)
      expect(result.output.length).toBeGreaterThan(0)
      const text = result.output.map(l => l.text).join(' ')
      expect(text).toContain('page.tsx')
      expect(text).toContain('components/')
    })

    it('lists subdirectory contents', () => {
      const result = executeCommand('ls components/editor', initState(), mockContext)
      expect(result.output.length).toBeGreaterThan(0)
      const text = result.output.map(l => l.text).join(' ')
      expect(text).toContain('sidebar.tsx')
    })

    it('shows error for nonexistent path', () => {
      const result = executeCommand('ls nonexistent', initState(), mockContext)
      expect(result.output.some(l => l.type === 'error')).toBe(true)
    })
  })

  describe('cd', () => {
    it('changes directory', () => {
      const result = executeCommand('cd components', initState(), mockContext)
      expect(result.newState?.cwd).toBe('components')
    })

    it('goes to root on cd ~', () => {
      const result = executeCommand('cd ~', initState({ cwd: 'components/editor' }), mockContext)
      expect(result.newState?.cwd).toBe('')
    })

    it('handles .. (parent directory)', () => {
      const result = executeCommand('cd ..', initState({ cwd: 'components/editor' }), mockContext)
      expect(result.newState?.cwd).toBe('components')
    })
  })

  describe('pwd', () => {
    it('shows current directory', () => {
      const result = executeCommand('pwd', initState({ cwd: 'components' }), mockContext)
      expect(result.output[0].text).toBe('/components')
    })

    it('shows workspace root when at root', () => {
      const result = executeCommand('pwd', initState(), mockContext)
      expect(result.output[0].text).toBe('/workspace')
    })
  })

  describe('cat', () => {
    it('displays file contents', () => {
      const result = executeCommand('cat page.tsx', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('export default function Page()'))).toBe(true)
    })

    it('shows error for missing operand', () => {
      const result = executeCommand('cat', initState(), mockContext)
      expect(result.output[0].type).toBe('error')
    })

    it('shows error for nonexistent file', () => {
      const result = executeCommand('cat nonexistent.tsx', initState(), mockContext)
      expect(result.output.some(l => l.type === 'error')).toBe(true)
    })
  })

  describe('echo', () => {
    it('prints text', () => {
      const result = executeCommand('echo hello world', initState(), mockContext)
      expect(result.output[0].text).toBe('hello world')
    })
  })

  describe('clear', () => {
    it('clears all lines', () => {
      const state = initState({ lines: [{ id: 1, type: 'output', text: 'test', timestamp: 0 }] })
      const result = executeCommand('clear', state, mockContext)
      expect(result.newState?.lines).toEqual([])
    })
  })

  describe('date', () => {
    it('shows current date', () => {
      const result = executeCommand('date', initState(), mockContext)
      expect(result.output[0].text).toContain(new Date().getFullYear().toString())
    })
  })

  describe('whoami', () => {
    it('returns developer', () => {
      const result = executeCommand('whoami', initState(), mockContext)
      expect(result.output[0].text).toBe('developer')
    })
  })

  describe('tree', () => {
    it('shows file tree structure', () => {
      const result = executeCommand('tree', initState(), mockContext)
      expect(result.output.length).toBeGreaterThan(1)
      const text = result.output.map(l => l.text).join('\n')
      expect(text).toContain('page.tsx')
      expect(text).toContain('components/')
    })
  })

  describe('open', () => {
    it('calls onOpenFile', () => {
      let openedFile = ''
      const ctx = { ...mockContext, onOpenFile: (f: string) => { openedFile = f } }
      executeCommand('open page.tsx', initState(), ctx)
      expect(openedFile).toBe('page.tsx')
    })

    it('shows error for missing operand', () => {
      const result = executeCommand('open', initState(), mockContext)
      expect(result.output[0].type).toBe('error')
    })
  })

  describe('touch', () => {
    it('creates a new file', () => {
      let savedName = ''
      const ctx = { ...mockContext, onSaveFile: (n: string) => { savedName = n } }
      const result = executeCommand('touch new-file.tsx', initState(), ctx)
      expect(savedName).toBe('new-file.tsx')
      expect(result.output[0].text).toContain('Created')
    })
  })

  describe('history', () => {
    it('shows command history', () => {
      const state = initState({ history: ['ls', 'cd components', 'pwd'] })
      const result = executeCommand('history', state, mockContext)
      expect(result.output.length).toBe(3)
      expect(result.output[0].text).toContain('ls')
      expect(result.output[1].text).toContain('cd components')
    })
  })

  describe('git', () => {
    it('shows git status', () => {
      const result = executeCommand('git status', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('branch main'))).toBe(true)
    })

    it('shows git log', () => {
      const result = executeCommand('git log', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('commit'))).toBe(true)
    })

    it('shows git diff', () => {
      const result = executeCommand('git diff', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('No changes'))).toBe(true)
    })

    it('shows git branch', () => {
      const result = executeCommand('git branch', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('main'))).toBe(true)
    })

    it('shows error for unknown git subcommand', () => {
      const result = executeCommand('git push', initState(), mockContext)
      expect(result.output.some(l => l.type === 'error')).toBe(true)
    })
  })

  describe('npm', () => {
    it('runs npm run dev', () => {
      const result = executeCommand('npm run dev', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('localhost'))).toBe(true)
    })

    it('runs npm run build', () => {
      const result = executeCommand('npm run build', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('Build completed'))).toBe(true)
    })

    it('runs npm run test', () => {
      const result = executeCommand('npm run test', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('182 tests'))).toBe(true)
    })

    it('runs npm install', () => {
      const result = executeCommand('npm install', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('added'))).toBe(true)
    })

    it('shows error for unknown script', () => {
      const result = executeCommand('npm run unknown', initState(), mockContext)
      expect(result.output.some(l => l.type === 'error')).toBe(true)
    })
  })

  describe('unknown command', () => {
    it('shows command not found', () => {
      const result = executeCommand('foobar', initState(), mockContext)
      expect(result.output.some(l => l.text.includes('command not found'))).toBe(true)
    })
  })

  describe('empty input', () => {
    it('returns empty output', () => {
      const result = executeCommand('', initState(), mockContext)
      expect(result.output).toEqual([])
    })
  })

  describe('command history tracking', () => {
    it('adds command to history', () => {
      const result = executeCommand('ls', initState(), mockContext)
      expect(result.newState?.history).toContain('ls')
    })
  })

  describe('getPrompt', () => {
    it('shows workspace root at root', () => {
      expect(getPrompt('')).toBe('~/workspace $')
    })

    it('shows subdirectory path', () => {
      expect(getPrompt('components/editor')).toBe('~/workspace/components/editor $')
    })
  })
})
