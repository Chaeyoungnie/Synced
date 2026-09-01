'use client'

import { useState, useCallback } from 'react'
import {
  Settings2,
  Monitor,
  Sun,
  Moon,
  Type,
  Code2,
  Palette,
  Keyboard,
  Bell,
  Eye,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTheme } from '@/hooks/use-theme'

export interface EditorSettings {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  lineNumbers: boolean
  minimap: boolean
  autoSave: boolean
  formatOnSave: boolean
  bracketPairs: boolean
  cursorBlinking: 'smooth' | 'blink' | 'solid'
  cursorStyle: 'line' | 'block' | 'underline'
  renderWhitespace: boolean
  showIndentGuides: boolean
  fontFamily: string
  lineHeight: number
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  minimap: true,
  autoSave: true,
  formatOnSave: false,
  bracketPairs: true,
  cursorBlinking: 'smooth',
  cursorStyle: 'line',
  renderWhitespace: false,
  showIndentGuides: true,
  fontFamily: 'Geist Mono, monospace',
  lineHeight: 1.7,
}

const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18, 20]
const TAB_SIZES = [2, 4, 8]
const LINE_HEIGHTS = [1.2, 1.4, 1.5, 1.6, 1.7, 1.8, 2.0]

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings?: EditorSettings
  onSettingsChange?: (settings: EditorSettings) => void
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

function SettingSelect({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string
  description?: string
  value: string | number
  options: { label: string; value: string | number }[]
  onChange: (v: string | number) => void
}) {
  return (
    <div className="py-2">
      <div className="mb-1.5">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              value === opt.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SettingsModal({ open, onOpenChange, settings: externalSettings, onSettingsChange }: SettingsModalProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS)
  const [activeSection, setActiveSection] = useState<'editor' | 'appearance' | 'keybindings'>('editor')

  const update = useCallback(
    <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        onSettingsChange?.(next)
        return next
      })
    },
    [onSettingsChange],
  )

  const sections = [
    { id: 'editor' as const, label: 'Editor', icon: Code2 },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'keybindings' as const, label: 'Shortcuts', icon: Keyboard },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="size-4" /> Settings
          </DialogTitle>
          <DialogDescription>Customize your editor experience</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[400px]">
          {/* Sidebar */}
          <div className="w-40 shrink-0 border-r border-border bg-muted/30 p-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  activeSection === s.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <s.icon className="size-3.5" />
                {s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeSection === 'editor' && (
              <div className="space-y-1">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Editor
                </h3>

                <SettingSelect
                  label="Font Size"
                  value={settings.fontSize}
                  options={FONT_SIZES.map((s) => ({ label: `${s}px`, value: s }))}
                  onChange={(v) => update('fontSize', v as number)}
                />

                <SettingSelect
                  label="Tab Size"
                  value={settings.tabSize}
                  options={TAB_SIZES.map((s) => ({ label: `${s} spaces`, value: s }))}
                  onChange={(v) => update('tabSize', v as number)}
                />

                <SettingSelect
                  label="Line Height"
                  value={settings.lineHeight}
                  options={LINE_HEIGHTS.map((l) => ({ label: l.toString(), value: l }))}
                  onChange={(v) => update('lineHeight', v as number)}
                />

                <Separator className="my-2" />

                <SettingToggle
                  label="Word Wrap"
                  description="Wrap long lines at the viewport edge"
                  checked={settings.wordWrap}
                  onChange={(v) => update('wordWrap', v)}
                />

                <SettingToggle
                  label="Line Numbers"
                  description="Show line numbers in the gutter"
                  checked={settings.lineNumbers}
                  onChange={(v) => update('lineNumbers', v)}
                />

                <SettingToggle
                  label="Bracket Pair Colorization"
                  description="Colorize matching brackets"
                  checked={settings.bracketPairs}
                  onChange={(v) => update('bracketPairs', v)}
                />

                <SettingToggle
                  label="Show Indent Guides"
                  description="Display vertical indent lines"
                  checked={settings.showIndentGuides}
                  onChange={(v) => update('showIndentGuides', v)}
                />

                <Separator className="my-2" />

                <SettingToggle
                  label="Auto Save"
                  description="Save files automatically after changes"
                  checked={settings.autoSave}
                  onChange={(v) => update('autoSave', v)}
                />

                <SettingToggle
                  label="Format on Save"
                  description="Format file when saving"
                  checked={settings.formatOnSave}
                  onChange={(v) => update('formatOnSave', v)}
                />
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-1">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Theme
                </h3>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { id: 'light' as const, label: 'Light', icon: Sun },
                    { id: 'dark' as const, label: 'Dark', icon: Moon },
                    { id: 'system' as const, label: 'System', icon: Monitor },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setTheme(theme.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors',
                        resolvedTheme === theme.id || (theme.id === 'system' && false)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/30',
                      )}
                    >
                      <theme.icon className="size-5" />
                      <span className="text-xs font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>

                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cursor
                </h3>

                <SettingSelect
                  label="Cursor Style"
                  value={settings.cursorStyle}
                  options={[
                    { label: 'Line', value: 'line' },
                    { label: 'Block', value: 'block' },
                    { label: 'Underline', value: 'underline' },
                  ]}
                  onChange={(v) => update('cursorStyle', v as EditorSettings['cursorStyle'])}
                />

                <SettingSelect
                  label="Cursor Blinking"
                  value={settings.cursorBlinking}
                  options={[
                    { label: 'Smooth', value: 'smooth' },
                    { label: 'Blink', value: 'blink' },
                    { label: 'Solid', value: 'solid' },
                  ]}
                  onChange={(v) => update('cursorBlinking', v as EditorSettings['cursorBlinking'])}
                />

                <Separator className="my-2" />

                <SettingToggle
                  label="Render Whitespace"
                  description="Show spaces, tabs, and line breaks"
                  checked={settings.renderWhitespace}
                  onChange={(v) => update('renderWhitespace', v)}
                />
              </div>
            )}

            {activeSection === 'keybindings' && (
              <div className="space-y-1">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-0.5">
                  {[
                    { keys: 'Ctrl+K', action: 'Command Palette' },
                    { keys: 'Ctrl+P', action: 'Quick Open File' },
                    { keys: 'Ctrl+Shift+P', action: 'Keyboard Shortcuts' },
                    { keys: 'Ctrl+B', action: 'Toggle Sidebar' },
                    { keys: 'Ctrl+\\', action: 'Toggle Collaboration Panel' },
                    { keys: 'Ctrl+S', action: 'Save File' },
                    { keys: 'Ctrl+W', action: 'Close Tab' },
                    { keys: 'Ctrl+N', action: 'New File' },
                    { keys: 'Ctrl+F', action: 'Find in File' },
                    { keys: 'Ctrl+H', action: 'Find and Replace' },
                    { keys: "Ctrl+'", action: 'Toggle Theme' },
                    { keys: 'Ctrl+Shift+\\', action: 'Split Editor' },
                  ].map((binding) => (
                    <div key={binding.action} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/50">
                      <span className="text-sm text-muted-foreground">{binding.action}</span>
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {binding.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
