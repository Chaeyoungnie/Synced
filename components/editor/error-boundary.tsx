'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleCopyError = () => {
    const { error, errorInfo } = this.state
    const text = [
      `Error: ${error?.message}`,
      error?.stack && `\nStack:\n${error.stack}`,
      errorInfo?.componentStack && `\nComponent Stack:\n${errorInfo.componentStack}`,
    ]
      .filter(Boolean)
      .join('\n')
    navigator.clipboard?.writeText(text)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center gap-4 bg-background p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              An unexpected error occurred while rendering this component.
            </p>
          </div>

          {this.state.error && (
            <div className="w-full max-w-md rounded-lg border border-border bg-muted/50 p-3 text-left">
              <p className="mb-1 text-xs font-semibold text-destructive">
                {this.state.error.name}: {this.state.error.message}
              </p>
              {this.state.error.stack && (
                <pre className="max-h-32 overflow-auto text-[10px] leading-relaxed text-muted-foreground font-mono">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={this.handleCopyError}>
              <Copy className="size-3" /> Copy error
            </Button>
            <Button size="sm" className="gap-2" onClick={this.handleReset}>
              <RefreshCw className="size-3" /> Try again
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.location.href = '/'}>
              <Home className="size-3" /> Home
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
