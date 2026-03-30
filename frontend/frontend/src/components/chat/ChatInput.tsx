import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Paperclip, Globe, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [value])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    textareaRef.current?.focus()
  }

  return (
    <div className={cn(
      'flex items-end gap-2 rounded-xl border transition-all duration-200',
      disabled
        ? 'border-border bg-surface/50'
        : 'border-border bg-surface hover:border-border-bright focus-within:border-cyan focus-within:ring-1 focus-within:ring-cyan/20'
    )}>
      {/* Action buttons left */}
      <div className="flex items-center gap-1 pl-2 pb-2.5">
        <button
          className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-cyan hover:bg-cyan/10 transition-all"
          title="Attach file"
          disabled={disabled}
        >
          <Paperclip className="w-3.5 h-3.5" />
        </button>
        <button
          className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-cyan hover:bg-cyan/10 transition-all"
          title="Add web URL"
          disabled={disabled}
        >
          <Globe className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder ?? 'Ask anything about your knowledge base…'}
        rows={1}
        className={cn(
          'flex-1 resize-none bg-transparent py-3 text-sm text-text-primary placeholder:text-text-muted',
          'focus:outline-none leading-relaxed',
          'min-h-[44px] max-h-[160px]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ scrollbarWidth: 'none' }}
      />

      {/* Send button */}
      <div className="pb-2 pr-2">
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
            value.trim() && !disabled
              ? 'bg-cyan text-void hover:bg-cyan-bright active:scale-95'
              : 'bg-surface text-text-muted cursor-not-allowed'
          )}
        >
          {disabled
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-3.5 h-3.5" />
          }
        </button>
      </div>
    </div>
  )
}
