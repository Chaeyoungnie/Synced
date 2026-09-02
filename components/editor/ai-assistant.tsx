'use client'

import { useState, useRef, useEffect, useCallback, type JSX } from 'react'
import { Sparkles, Send, Copy, Check, RotateCcw, X, Code2, FileCode2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  codeBlock?: string
  language?: string
}

interface AIAssistantProps {
  open: boolean
  onToggle: () => void
  activeFile?: string
  fileContent?: string
  onApplyCode?: (code: string) => void
}

// Simulated AI responses for demo
const AI_RESPONSES: Record<string, string[]> = {
  'help': [
    "I can help you with:\n\n• **Code generation** — describe what you need\n• **Refactoring** — paste code and ask for improvements\n• **Bug fixing** — describe the issue or paste error messages\n• **Explaining code** — paste any code snippet\n• **Writing tests** — describe the function to test",
  ],
  'default': [
    "I'll help you with that. Here's what I suggest:\n\n```typescript\n// Your code suggestion here\n```",
    "Here's an approach you could take:\n\n```typescript\nexport function solution() {\n  // Implementation\n  return result\n}\n```\n\nThis pattern works well because it keeps the logic clean and testable.",
    "Good question! Let me break this down:\n\n1. First, we need to handle the edge case\n2. Then apply the transformation\n3. Finally, validate the output\n\nHere's a code example:\n```typescript\nfunction process(data: string[]) {\n  return data\n    .filter(item => item.length > 0)\n    .map(item => item.trim())\n}\n```",
  ],
  'refactor': [
    "Here's a cleaner version of your code:\n\n```typescript\n// Before: verbose\nfunction process(items) {\n  const result = []\n  for (let i = 0; i < items.length; i++) {\n    if (items[i] !== null) {\n      result.push(items[i])\n    }\n  }\n  return result\n}\n\n// After: concise\nfunction process(items: Item[]) {\n  return items.filter(Boolean)\n}\n```\n\nThe refactored version uses array filtering, which is more readable and idiomatic.",
  ],
  'bug': [
    "I found the issue! The problem is:\n\n```typescript\n// Bug: null check is missing\nconst value = data.map(item => item.value)\n\n// Fix: add null guard\nconst value = data\n  .filter(item => item != null)\n  .map(item => item.value)\n```\n\nThe error occurs because `item` can be `null` or `undefined` when destructuring.",
  ],
}

function generateResponse(query: string): string {
  const lower = query.toLowerCase()
  if (lower.includes('help') || lower.includes('what can')) return AI_RESPONSES['help'][0]
  if (lower.includes('refactor') || lower.includes('clean')) return AI_RESPONSES['refactor'][0]
  if (lower.includes('bug') || lower.includes('error') || lower.includes('fix')) return AI_RESPONSES['bug'][0]
  
  // Pick a random default response
  const defaults = AI_RESPONSES['default']
  return defaults[Math.floor(Math.random() * defaults.length)]
}

function parseCodeBlocks(content: string): { parts: { type: 'text' | 'code'; content: string; language?: string }[] } {
  const parts: { type: 'text' | 'code'; content: string; language?: string }[] = []
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'code', content: match[2].trim(), language: match[1] || 'typescript' })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) })
  }

  return { parts }
}

function CodeBlock({ code, language, onApply }: { code: string; language: string; onApply?: (code: string) => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5">
        <Badge variant="secondary" className="text-[10px] font-mono">
          {language}
        </Badge>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-xs" className="h-5 w-5 text-muted-foreground" />
              }
              onClick={handleCopy}
            >
              {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied!' : 'Copy code'}</TooltipContent>
          </Tooltip>
          {onApply && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" size="icon-xs" className="h-5 w-5 text-muted-foreground" />
                }
                onClick={() => onApply(code)}
              >
                <Zap className="size-3" />
              </TooltipTrigger>
              <TooltipContent>Apply to editor</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <pre className="overflow-x-auto bg-card/50 p-3 text-[12px] leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  )
}

function MessageBubble({ message, onApplyCode }: { message: Message; onApplyCode?: (code: string) => void }) {
  const isUser = message.role === 'user'
  const { parts } = parseCodeBlocks(message.content)

  return (
    <div className={cn('group flex gap-2', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-violet-500 to-blue-500 text-white',
        )}
      >
        {isUser ? 'JD' : <Sparkles className="size-3" />}
      </div>

      {/* Message content */}
      <div className={cn('max-w-[85%] min-w-0', isUser && 'text-right')}>
        <div
          className={cn(
            'rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-card border border-border text-card-foreground rounded-tl-sm',
          )}
        >
          {parts.map((part, i) => {
            if (part.type === 'code') {
              return <CodeBlock key={i} code={part.content} language={part.language || 'typescript'} onApply={onApplyCode} />
            }
            return (
              <div key={i} className="whitespace-pre-wrap">
                {part.content.split('\n').map((line, j) => {
                  // Handle bold text
                  const boldRegex = /\*\*(.*?)\*\*/g
                  const parts: JSX.Element[] = []
                  let lastIndex = 0
                  let match
                  while ((match = boldRegex.exec(line)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push(<span key={`t${j}-${lastIndex}`}>{line.slice(lastIndex, match.index)}</span>)
                    }
                    parts.push(<strong key={`b${j}-${match.index}`}>{match[1]}</strong>)
                    lastIndex = match.index + match[0].length
                  }
                  if (lastIndex < line.length) {
                    parts.push(<span key={`t${j}-${lastIndex}`}>{line.slice(lastIndex)}</span>)
                  }
                  return (
                    <span key={j}>
                      {parts.length > 0 ? parts : line}
                      {j < part.content.split('\n').length - 1 && '\n'}
                    </span>
                  )
                })}
              </div>
            )
          })}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  { label: 'Explain this code', icon: Code2 },
  { label: 'Refactor selection', icon: RotateCcw },
  { label: 'Generate component', icon: FileCode2 },
  { label: 'Fix the bug', icon: Zap },
]

export function AIAssistant({ open, onToggle, activeFile, fileContent, onApplyCode }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! I'm your AI coding assistant. I can help you write, refactor, debug, and understand code.\n\nTry asking me something or pick a suggestion below.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSend = useCallback(
    async (text?: string) => {
      const query = text || input.trim()
      if (!query || isGenerating) return

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: query,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsGenerating(true)

      // Simulate AI thinking
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200))

      const response = generateResponse(query)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsGenerating(false)
    },
    [input, isGenerating],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  if (!open) return null

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onApplyCode={onApplyCode} />
        ))}

        {isGenerating && (
          <div className="flex gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white">
              <Sparkles className="size-3" />
            </div>
            <div className="rounded-xl rounded-tl-sm bg-card border border-border px-3.5 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <Button
                key={s.label}
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-[10px] text-muted-foreground"
                onClick={() => handleSend(s.label)}
              >
                <s.icon className="size-2.5" />
                {s.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Input */}
      <div className="p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI anything about your code..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[20px] max-h-[120px]"
            style={{ height: 'auto', overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden' }}
            onInput={(e) => {
              const target = e.currentTarget
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
          />
          <Button
            size="icon-xs"
            className={cn(
              'shrink-0 rounded-lg transition-colors',
              input.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'text-muted-foreground',
            )}
            disabled={!input.trim() || isGenerating}
            onClick={() => handleSend()}
          >
            <Send className="size-3.5" />
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
          AI can make mistakes. Review suggestions before applying.
        </p>
      </div>
    </div>
  )
}
