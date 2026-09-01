'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ... existing types ...

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const ICONS: Record<ToastVariant, ReactNode> = {
  default: null,
  success: <Check className="size-4" />,
  error: <AlertCircle className="size-4" />,
  warning: <AlertTriangle className="size-4" />,
  info: <Info className="size-4" />,
}

const STYLES: Record<ToastVariant, string> = {
  default: 'bg-card border-border text-foreground',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'default', duration = 3000) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, message, variant, duration }])
    },
    [],
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>,
    document.body,
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast, onRemove])

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300',
        STYLES[toast.variant],
      )}
    >
      {ICONS[toast.variant] && (
        <span className="shrink-0">{ICONS[toast.variant]}</span>
      )}
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 shrink-0 rounded p-0.5 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
