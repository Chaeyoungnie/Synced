import type { FolderNode, FileNode } from '@/components/editor/data'

export interface TerminalLine {
  id: number
  type: 'input' | 'output' | 'error' | 'info'
  text: string
  timestamp: number
}

export interface TerminalState {
  cwd: string
  lines: TerminalLine[]
  history: string[]
  historyIndex: number
}

type CmdFn = (args: string[], state: TerminalState, ctx: TerminalContext) => { output: TerminalLine[]; newState?: Partial<TerminalState> }

export interface TerminalContext {
  fileTree: FolderNode
  fileContents: Record<string, string>
  onSaveFile?: (name: string, content: string) => void
  onOpenFile?: (name: string) => void
}

let lineCounter = 0

function makeLine(text: string, type: TerminalLine['type'] = 'output'): TerminalLine {
  return { id: ++lineCounter, type, text, timestamp: Date.now() }
}

function resolvePath(cwd: string, input: string): string {
  if (input.startsWith('/')) return input.replace(/^\//, '').replace(/\/$/, '')
  const parts = (cwd ? cwd.split('/') : []).filter(Boolean)
  const segments = input.split('/').filter(Boolean)
  for (const seg of segments) {
    if (seg === '..') parts.pop()
    else if (seg !== '.') parts.push(seg)
  }
  return parts.join('/')
}

function getNode(tree: FolderNode, path: string): FileNode | FolderNode | null {
  if (!path) return tree
  const parts = path.split('/').filter(Boolean)
  let current: FolderNode = tree
  for (const part of parts) {
    const child = current.children.find(c => c.name === part)
    if (!child) return null
    if ('children' in child) current = child
    else if (parts.indexOf(part) === parts.length - 1) return child
    else return null
  }
  return current
}

function listDir(node: FolderNode): string[] {
  return node.children.map(c => c.name + ('children' in c ? '/' : '')).sort()
}

// ============================================
// COMMANDS
// ============================================

const commands: Record<string, CmdFn> = {
  help: () => ({
    output: [
      makeLine('Available commands:', 'info'),
      makeLine(''),
      makeLine('  ls [path]        List directory contents'),
      makeLine('  cd <path>        Change directory'),
      makeLine('  pwd              Print working directory'),
      makeLine('  cat <file>       Display file contents'),
      makeLine('  echo <text>      Print text'),
      makeLine('  touch <file>     Create a new file'),
      makeLine('  mkdir <dir>      Create a new directory'),
      makeLine('  rm <file>        Remove a file'),
      makeLine('  clear            Clear the terminal'),
      makeLine('  date             Show current date/time'),
      makeLine('  whoami           Show current user'),
      makeLine('  tree [path]      Show file tree'),
      makeLine('  git status       Show git status'),
      makeLine('  git log          Show recent commits'),
      makeLine('  git diff         Show file differences'),
      makeLine('  npm run <script> Run an npm script'),
      makeLine('  npm install      Install dependencies'),
      makeLine('  npm test         Run tests'),
      makeLine('  open <file>      Open file in editor'),
      makeLine('  history          Show command history'),
      makeLine('  help             Show this help message'),
    ],
  }),

  ls: (args, state, ctx) => {
    const target = args[0] || ''
    const path = resolvePath(state.cwd, target)
    const node = getNode(ctx.fileTree, path)
    if (!node) return { output: [makeLine(`ls: cannot access '${target || path}': No such file or directory`, 'error')] }
    if ('children' in node) {
      const entries = listDir(node)
      if (entries.length === 0) return { output: [makeLine('(empty directory)', 'info')] }
      // Color directories differently
      const formatted = entries.map(e => e.endsWith('/') ? `\x1b[36m${e}\x1b[0m` : e)
      return { output: [makeLine(formatted.join('  '))] }
    }
    return { output: [makeLine(target || path)] }
  },

  cd: (args, state) => {
    const target = args[0] || ''
    if (!target || target === '~') return { output: [], newState: { cwd: '' } }
    const path = resolvePath(state.cwd, target)
    return { output: [], newState: { cwd: path } }
  },

  pwd: (_args, state) => ({
    output: [makeLine('/' + (state.cwd || 'workspace'))],
  }),

  cat: (args, state, ctx) => {
    if (!args[0]) return { output: [makeLine('cat: missing file operand', 'error')] }
    const path = resolvePath(state.cwd, args[0])
    const node = getNode(ctx.fileTree, path)
    if (!node) return { output: [makeLine(`cat: ${args[0]}: No such file or directory`, 'error')] }
    if ('children' in node) return { output: [makeLine(`cat: ${args[0]}: Is a directory`, 'error')] }
    const content = ctx.fileContents[args[0]] || ctx.fileContents[node.name] || '// empty file'
    const lines = content.split('\n').map(l => makeLine(l))
    return { output: lines }
  },

  echo: (args) => ({
    output: [makeLine(args.join(' '))],
  }),

  clear: () => ({
    output: [],
    newState: { lines: [] },
  }),

  touch: (args, state, ctx) => {
    if (!args[0]) return { output: [makeLine('touch: missing file operand', 'error')] }
    const path = resolvePath(state.cwd, args[0])
    const existing = getNode(ctx.fileTree, path)
    if (existing) return { output: [makeLine(`touch: ${args[0]}: File already exists`, 'error')] }
    if (ctx.onSaveFile) ctx.onSaveFile(args[0], '')
    return { output: [makeLine(`Created ${args[0]}`, 'info')] }
  },

  mkdir: (args) => {
    if (!args[0]) return { output: [makeLine('mkdir: missing operand', 'error')] }
    return { output: [makeLine(`Directory "${args[0]}" created`, 'info')] }
  },

  rm: (args) => {
    if (!args[0]) return { output: [makeLine('rm: missing file operand', 'error')] }
    return { output: [makeLine(`Removed ${args[0]}`, 'info')] }
  },

  date: () => ({
    output: [makeLine(new Date().toString())],
  }),

  whoami: () => ({
    output: [makeLine('developer')],
  }),

  tree: (args, state, ctx) => {
    const target = args[0] || ''
    const path = resolvePath(state.cwd, target)
    const node = getNode(ctx.fileTree, path)
    if (!node || !('children' in node)) {
      return { output: [makeLine(`tree: '${target || path}': Not a directory`, 'error')] }
    }
    const lines: TerminalLine[] = [makeLine(node.name + '/')]
    function walk(n: FolderNode, prefix: string) {
      const children = n.children
      children.forEach((child, i) => {
        const isLast = i === children.length - 1
        const connector = isLast ? '└── ' : '├── '
        const childPrefix = isLast ? '    ' : '│   '
        if ('children' in child) {
          lines.push(makeLine(prefix + connector + child.name + '/'))
          walk(child, prefix + childPrefix)
        } else {
          lines.push(makeLine(prefix + connector + child.name))
        }
      })
    }
    walk(node, '')
    return { output: lines }
  },

  open: (args, state, ctx) => {
    if (!args[0]) return { output: [makeLine('open: missing file operand', 'error')] }
    if (ctx.onOpenFile) ctx.onOpenFile(args[0])
    return { output: [makeLine(`Opened ${args[0]} in editor`, 'info')] }
  },

  history: (_args, state) => {
    const lines = state.history.map((cmd: string, i: number) => makeLine(`  ${String(i + 1).padStart(4)}  ${cmd}`))
    return { output: lines }
  },

  git: (args, state, ctx) => {
    const sub = args[0]
    if (sub === 'status') {
      const lines: TerminalLine[] = [makeLine('On branch main', 'info'), makeLine('')]
      let hasChanges = false
      function walkTree(node: FolderNode) {
        for (const child of node.children) {
          if ('children' in child) { walkTree(child); continue }
          const fn = child as FileNode
          if (fn.status === 'modified') { lines.push(makeLine(`        modified:   ${fn.name}`)); hasChanges = true }
          else if (fn.status === 'new' || fn.status === 'untracked') { lines.push(makeLine(`        untracked:  ${fn.name}`)); hasChanges = true }
        }
      }
      walkTree(ctx.fileTree)
      if (!hasChanges) lines.push(makeLine('nothing to commit, working tree clean', 'info'))
      return { output: lines }
    }
    if (sub === 'log') {
      return {
        output: [
          makeLine('commit a1b2c3d (HEAD -> main)', 'info'),
          makeLine('Author: Developer <dev@example.com>'),
          makeLine('Date:   ' + new Date().toLocaleString()),
          makeLine(''),
          makeLine('    Latest changes'),
        ],
      }
    }
    if (sub === 'diff') {
      return { output: [makeLine('No changes staged for commit', 'info')] }
    }
    if (sub === 'branch') {
      return {
        output: [
          makeLine('* main', 'info'),
          makeLine('  develop'),
          makeLine('  feature/collab'),
        ],
      }
    }
    return { output: [makeLine(`git: '${sub || ''}' is not a git command.`, 'error'), makeLine("Try 'git help' for available commands.", 'info')] }
  },

  npm: (args) => {
    const sub = args[0]
    if (sub === 'run') {
      const script = args[1]
      if (script === 'dev') return { output: [makeLine('Starting development server...'), makeLine('> next dev'), makeLine(''), makeLine('  ▲ Next.js 15.3.3'), makeLine('  - Local: http://localhost:3000'), makeLine('  ✓ Ready in 2.1s', 'info')] }
      if (script === 'build') return { output: [makeLine('Building production bundle...'), makeLine('✓ Build completed successfully', 'info')] }
      if (script === 'test') return { output: [makeLine('Running test suite...'), makeLine('✓ 182 tests passed', 'info')] }
      if (script === 'lint') return { output: [makeLine('Linting...'), makeLine('✓ No errors found', 'info')] }
      return { output: [makeLine(`npm ERR! Missing script: "${script || ''}"`, 'error')] }
    }
    if (sub === 'install') return { output: [makeLine('added 312 packages in 8.2s'), makeLine(''), makeLine('38 packages are looking for funding'), makeLine('  run `npm fund` for details', 'info')] }
    if (sub === 'test') return { output: [makeLine('Running test suite...'), makeLine('✓ 182 tests passed', 'info')] }
    if (sub === 'start') return { output: [makeLine('Starting production server...'), makeLine('> next start'), makeLine('  ▲ Next.js 15.3.3'), makeLine('  - Local: http://localhost:3000', 'info')] }
    return { output: [makeLine(`npm: '${sub || ''}' is not a valid command.`, 'error'), makeLine("Try 'npm help' for available commands.", 'info')] }
  },
}

export function executeCommand(input: string, state: TerminalState, ctx: TerminalContext): { output: TerminalLine[]; newState: TerminalState } {
  const trimmed = input.trim()
  if (!trimmed) return { output: [], newState: state }

  const parts = trimmed.split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)

  const handler = commands[cmd]
  if (!handler) {
    return {
      output: [makeLine(`${cmd}: command not found. Type 'help' for available commands.`, 'error')],
      newState: { ...state, history: [...state.history, trimmed], historyIndex: -1 },
    }
  }

  const result = handler(args, state, ctx)
  const newState: TerminalState = {
    ...state,
    ...result.newState,
    history: [...state.history, trimmed],
    historyIndex: -1,
    lines: result.newState?.lines ?? [...state.lines, makeLine(`$ ${trimmed}`, 'input'), ...result.output],
  }

  return { output: result.output, newState }
}

export function createInitialState(): TerminalState {
  return {
    cwd: '',
    lines: [
      makeLine('Welcome to the Synced Terminal', 'info'),
      makeLine('Type "help" for a list of available commands.', 'info'),
      makeLine(''),
    ],
    history: [],
    historyIndex: -1,
  }
}

export function getPrompt(cwd: string): string {
  return cwd ? `~/workspace/${cwd} $` : '~/workspace $'
}
