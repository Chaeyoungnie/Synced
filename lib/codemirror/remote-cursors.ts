import { ViewPlugin, EditorView, Decoration, DecorationSet, ViewUpdate, WidgetType } from '@codemirror/view'
import { StateField, StateEffect } from '@codemirror/state'

export interface RemoteCursor {
  id: string
  name: string
  color: string
  line: number
  col: number
  selection?: { from: number; to: number } | null
}

const addCursors = StateEffect.define<RemoteCursor[]>()
const removeCursors = StateEffect.define<string[]>()

const cursorField = StateField.define<RemoteCursor[]>({
  create() { return [] },
  update(cursors, tr) {
    for (const e of tr.effects) {
      if (e.is(addCursors)) return e.value
      if (e.is(removeCursors)) {
        const ids = new Set(e.value)
        return cursors.filter(c => !ids.has(c.id))
      }
    }
    return cursors
  },
})

function cursorDecoration(cursor: RemoteCursor) {
  return Decoration.widget({
    widget: new CursorWidget(cursor.name, cursor.color),
    side: 1,
  })
}

function selectionDecoration(cursor: RemoteCursor) {
  if (!cursor.selection) return null
  const { from, to } = cursor.selection
  if (from === to) return null
  return Decoration.mark({
    attributes: {
      style: `background-color: ${cursor.color}22; border-bottom: 2px solid ${cursor.color};`,
    },
    class: 'cm-remote-selection',
  })
}

class CursorWidget extends WidgetType {
  name: string
  color: string

  constructor(name: string, color: string) {
    super()
    this.name = name
    this.color = color
  }

  toDOM() {
    const container = document.createElement('div')
    container.className = 'cm-remote-cursor'
    container.style.cssText = `position: relative; display: inline; pointer-events: none;`

    // Cursor caret line
    const caret = document.createElement('span')
    caret.style.cssText = `
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 2px;
      background-color: ${this.color};
      pointer-events: none;
      z-index: 1;
    `
    container.appendChild(caret)

    // Name label above cursor
    const label = document.createElement('span')
    label.textContent = this.name
    label.style.cssText = `
      position: absolute;
      left: 0; top: -18px;
      background-color: ${this.color};
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 3px 3px 3px 0;
      white-space: nowrap;
      pointer-events: none;
      z-index: 2;
      line-height: 14px;
      font-family: var(--font-geist), system-ui, sans-serif;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    `
    container.appendChild(label)

    return container
  }

  eq(other: CursorWidget) {
    return this.name === other.name && this.color === other.color
  }

}

function buildDecorations(cursors: RemoteCursor[], doc: any) {
  const decorations: any[] = []

  for (const cursor of cursors) {
    // Convert line/col to absolute position
    const lines = doc.toString().split('\n')
    let pos = 0
    for (let i = 0; i < Math.min(cursor.line - 1, lines.length); i++) {
      pos += lines[i].length + 1 // +1 for newline
    }
    pos += Math.min(cursor.col - 1, lines[cursor.line - 1]?.length || 0)

    // Clamp to valid range
    pos = Math.max(0, Math.min(pos, doc.length))

    // Add cursor widget
    decorations.push(cursorDecoration(cursor).range(pos))

    // Add selection if present
    const sel = selectionDecoration(cursor)
    if (sel) {
      decorations.push(sel.range(cursor.selection!.from, cursor.selection!.to))
    }
  }

  return Decoration.set(decorations, true)
}

export function remoteCursorsExtension(cursors: RemoteCursor[] = []) {
  return [
    cursorField,
    EditorView.decorations.compute([cursorField], (state) => {
      const cursors = state.field(cursorField)
      return buildDecorations(cursors, state.doc)
    }),
    // Plugin to dispatch updates when cursors change
    ViewPlugin.fromClass(
      class {
        update(update: ViewUpdate) {
          // No-op, decorations are computed from state field
        }
      }
    ),
  ]
}

// Helper to dispatch cursor updates to a view
export function updateRemoteCursors(view: EditorView, cursors: RemoteCursor[]) {
  view.dispatch({
    effects: addCursors.of(cursors),
  })
}
