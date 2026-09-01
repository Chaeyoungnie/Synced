'use client'

import {
  FileCode2,
  FileText,
  FileJson,
  FileImage,
  FileCog,
  File,
  Folder,
  FolderOpen,
  Hash,
  Braces,
  Terminal,
  Globe,
  Lock,
  Package,
  Settings,
  Database,
  GitBranch,
  Shield,
  Palette,
  BookOpen,
} from 'lucide-react'

// VS Code-inspired color scheme for file types
const FILE_ICONS: Record<string, { icon: typeof FileCode2; color: string; label: string }> = {
  // TypeScript / JavaScript
  tsx: { icon: FileCode2, color: '#3178c6', label: 'TypeScript React' },
  ts: { icon: FileCode2, color: '#3178c6', label: 'TypeScript' },
  jsx: { icon: FileCode2, color: '#61dafb', label: 'JavaScript React' },
  js: { icon: FileCode2, color: '#f7df1e', label: 'JavaScript' },
  mjs: { icon: FileCode2, color: '#f7df1e', label: 'JavaScript' },

  // Web
  html: { icon: Globe, color: '#e34c26', label: 'HTML' },
  htm: { icon: Globe, color: '#e34c26', label: 'HTML' },
  css: { icon: Palette, color: '#1572b6', label: 'CSS' },
  scss: { icon: Palette, color: '#c6538c', label: 'SCSS' },
  less: { icon: Palette, color: '#1d365d', label: 'Less' },

  // Data
  json: { icon: Braces, color: '#f7df1e', label: 'JSON' },
  yaml: { icon: FileText, color: '#cb171e', label: 'YAML' },
  yml: { icon: FileText, color: '#cb171e', label: 'YAML' },
  toml: { icon: FileText, color: '#9c4221', label: 'TOML' },
  xml: { icon: FileText, color: '#f16529', label: 'XML' },
  csv: { icon: Database, color: '#217346', label: 'CSV' },

  // Config
  env: { icon: Lock, color: '#ecd53f', label: 'Environment' },
  gitignore: { icon: GitBranch, color: '#f05032', label: 'Git Ignore' },
  eslintrc: { icon: Shield, color: '#4b32c3', label: 'ESLint' },
  prettierrc: { icon: Palette, color: '#56b3b4', label: 'Prettier' },
  editorconfig: { icon: Settings, color: '#999', label: 'Editor Config' },

  // Documentation
  md: { icon: BookOpen, color: '#083fa1', label: 'Markdown' },
  mdx: { icon: BookOpen, color: '#fcb32c', label: 'MDX' },
  txt: { icon: FileText, color: '#999', label: 'Text' },
  log: { icon: FileText, color: '#999', label: 'Log' },

  // Images
  png: { icon: FileImage, color: '#a855f7', label: 'PNG' },
  jpg: { icon: FileImage, color: '#a855f7', label: 'JPEG' },
  jpeg: { icon: FileImage, color: '#a855f7', label: 'JPEG' },
  gif: { icon: FileImage, color: '#a855f7', label: 'GIF' },
  svg: { icon: FileImage, color: '#ffb13b', label: 'SVG' },
  ico: { icon: FileImage, color: '#a855f7', label: 'ICO' },
  webp: { icon: FileImage, color: '#a855f7', label: 'WebP' },

  // Python
  py: { icon: FileCode2, color: '#3572a5', label: 'Python' },
  pyw: { icon: FileCode2, color: '#3572a5', label: 'Python' },

  // Go
  go: { icon: FileCode2, color: '#00add8', label: 'Go' },

  // Rust
  rs: { icon: FileCode2, color: '#dea584', label: 'Rust' },

  // Shell
  sh: { icon: Terminal, color: '#89e051', label: 'Shell' },
  bash: { icon: Terminal, color: '#89e051', label: 'Bash' },
  zsh: { icon: Terminal, color: '#89e051', label: 'Zsh' },

  // Package
  lock: { icon: Lock, color: '#999', label: 'Lock' },
  package: { icon: Package, color: '#cb3837', label: 'Package' },

  // Misc
  dockerfile: { icon: Terminal, color: '#2496ed', label: 'Docker' },
  sql: { icon: Database, color: '#336791', label: 'SQL' },
  graphql: { icon: Braces, color: '#e10098', label: 'GraphQL' },
  prisma: { icon: Database, color: '#2d3748', label: 'Prisma' },
  test: { icon: FileCog, color: '#15803d', label: 'Test' },
  spec: { icon: FileCog, color: '#15803d', label: 'Spec' },
}

function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  if (parts.length < 2) return ''
  return parts[parts.length - 1].toLowerCase()
}

function isTestFile(filename: string): boolean {
  return filename.includes('.test.') || filename.includes('.spec.') || filename.includes('__tests__')
}

function getConfigFile(filename: string): string | null {
  const lower = filename.toLowerCase()
  if (lower === '.gitignore') return 'gitignore'
  if (lower === '.eslintrc' || lower === '.eslintrc.js' || lower === '.eslintrc.json') return 'eslintrc'
  if (lower === '.prettierrc' || lower === '.prettierrc.js') return 'prettierrc'
  if (lower === '.editorconfig') return 'editorconfig'
  if (lower === 'dockerfile') return 'dockerfile'
  if (lower === '.env' || lower.startsWith('.env.')) return 'env'
  return null
}

export function getFileIconInfo(filename: string) {
  // Check config files first
  const configFile = getConfigFile(filename)
  if (configFile && FILE_ICONS[configFile]) {
    return FILE_ICONS[configFile]
  }

  // Check test files
  if (isTestFile(filename)) {
    const ext = getFileExtension(filename)
    const base = FILE_ICONS[ext]
    return { icon: FileCog, color: '#15803d', label: base?.label || 'Test' }
  }

  // Check extension
  const ext = getFileExtension(filename)
  if (ext && FILE_ICONS[ext]) {
    return FILE_ICONS[ext]
  }

  return { icon: File, color: '#999', label: 'File' }
}

export function FileIcon({ filename, size = 14 }: { filename: string; size?: number }) {
  const { icon: Icon, color } = getFileIconInfo(filename)
  return <Icon className="shrink-0" style={{ color, width: size, height: size }} />
}

export function FolderIcon({ open, size = 14 }: { open?: boolean; size?: number }) {
  const Icon = open ? FolderOpen : Folder
  return <Icon className="shrink-0 text-amber-500" style={{ width: size, height: size }} />
}
