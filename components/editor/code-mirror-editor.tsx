'use client'

import { useEffect, useRef } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, rectangularSelection, gutter } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput, foldKeymap } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { searchKeymap, highlightSelectionMatches, search } from '@codemirror/search'
import { lintKeymap } from '@codemirror/lint'
import { highlightSpecialChars } from '@codemirror/view'
import { remoteCursorsExtension, updateRemoteCursors, type RemoteCursor } from '@/lib/codemirror/remote-cursors'

function getLanguage(filename: string) {
  const ext = filename.split('.').pop()
  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return javascript({ jsx: true, typescript: true })
    case 'html':
    case 'htm':
      return html()
    case 'css':
      return css()
    case 'json':
      return json()
    default:
      return javascript({ jsx: true, typescript: true })
  }
}

function gitGutter() {
  return gutter({
    class: 'cm-git-gutter',
  })
}

const enhancedTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    height: '100%',
    backgroundColor: 'transparent',
  },
  '.cm-scroller': {
    fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
    lineHeight: '1.7',
    overflow: 'auto',
  },
  '.cm-content': {
    padding: '16px 0',
    caretColor: 'var(--primary)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: '1px solid var(--border)',
    color: 'var(--muted-foreground)',
    opacity: 0.4,
    minWidth: '40px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--primary)',
    opacity: 1,
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(var(--primary-foreground), 0.03)',
    borderLeft: '2px solid var(--primary)',
    paddingLeft: '13px',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(139, 92, 246, 0.15) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(139, 92, 246, 0.2) !important',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--primary)',
    borderLeftWidth: '2px',
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: 'var(--primary)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    outline: '1px solid rgba(139, 92, 246, 0.3)',
  },
  '.cm-foldGutter': {
    width: '14px',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--muted)',
    border: 'none',
    color: 'var(--muted-foreground)',
    padding: '0 4px',
    borderRadius: '3px',
    fontSize: '11px',
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
    outline: '1px solid rgba(250, 204, 21, 0.4)',
    borderRadius: '2px',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(250, 204, 21, 0.35)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  '.cm-panels': {
    backgroundColor: 'var(--card)',
    color: 'var(--card-foreground)',
    borderTop: '1px solid var(--border)',
  },
  '.cm-panel.cm-search': {
    backgroundColor: 'var(--card)',
    padding: '8px 12px',
  },
  '.cm-git-gutter': {
    width: '4px',
    backgroundColor: 'transparent',
  },
}, { dark: true })

interface CodeMirrorEditorProps {
  value: string
  onChange?: (value: string) => void
  filename?: string
  readOnly?: boolean
  wordWrap?: boolean
  remoteCursors?: RemoteCursor[]
}

export function CodeMirrorEditor({
  value,
  onChange,
  filename = 'file.tsx',
  readOnly = false,
  wordWrap = true,
  remoteCursors = [],
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const language = getLanguage(filename)

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter({
          markerDOM(open) {
            const el = document.createElement('span')
            el.textContent = open ? '▾' : '▸'
            el.className = 'cm-fold-marker'
            el.style.cssText = 'font-size: 10px; cursor: pointer; color: var(--muted-foreground); opacity: 0.6; transition: opacity 0.15s;'
            el.onmouseenter = () => { el.style.opacity = '1' }
            el.onmouseleave = () => { el.style.opacity = '0.6' }
            return el
          },
        }),
        drawSelection(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        search({ caseSensitive: false }),
        gitGutter(),

        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap,
          indentWithTab,
        ]),
        language,
        oneDark,
        enhancedTheme,
        remoteCursorsExtension(),
        ...(wordWrap ? [EditorView.lineWrapping] : []),
        ...(readOnly ? [EditorState.readOnly.of(true), EditorView.editable.of(false)] : []),
        ...(onChange
          ? [
              EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                  onChange(update.state.doc.toString())
                }
              }),
            ]
          : []),
      ],
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [filename])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentValue = view.state.doc.toString()
    if (currentValue !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      })
    }
  }, [value])

  useEffect(() => {
    const view = viewRef.current
    if (!view || remoteCursors.length === 0) return
    updateRemoteCursors(view, remoteCursors)
  }, [remoteCursors])

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto"
    />
  )
}
