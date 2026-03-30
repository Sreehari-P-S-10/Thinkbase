import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Copy, Check, ChevronDown, ChevronUp, Brain, User, Zap } from 'lucide-react'
import { cn, copyToClipboard, formatTime } from '@/lib/utils'
import type { ChatMessage } from '@/types'

interface Props {
  message: ChatMessage
}

export function MessageBubble({ message }: Props) {
  const [copied, setCopied] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)

  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming

  const handleCopy = async () => {
    const ok = await copyToClipboard(message.content)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn('flex gap-3 group', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
        isUser
          ? 'bg-cyan/20 border border-cyan/30'
          : 'bg-violet/20 border border-violet/30'
      )}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-cyan" />
          : <Brain className="w-3.5 h-3.5 text-violet-400" />
        }
      </div>

      {/* Bubble */}
      <div className={cn('flex-1 max-w-[85%]', isUser && 'flex flex-col items-end')}>
        <div className={cn(
          'relative rounded-2xl px-4 py-3',
          isUser ? 'message-user rounded-tr-sm' : 'message-assistant rounded-tl-sm'
        )}>
          {isUser ? (
            <p className="text-sm text-text-primary leading-relaxed">{message.content}</p>
          ) : (
            <div className={cn('markdown-content', isStreaming && !message.content && 'typing-cursor')}>
              {message.content ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                <span className="text-text-muted text-sm">Thinking</span>
              )}
              {isStreaming && message.content && (
                <span className="inline-block w-0.5 h-4 bg-cyan ml-0.5 animate-pulse" />
              )}
            </div>
          )}
        </div>

        {/* Metadata row */}
        <div className={cn(
          'flex items-center gap-3 mt-1.5 px-1',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-2xs text-text-muted font-mono">
            {formatTime(message.timestamp)}
          </span>

          {!isUser && message.metadata && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-2xs text-text-muted font-mono">
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                {message.metadata.model}
              </div>
              {message.metadata.tokensUsed && (
                <span className="text-2xs text-text-muted font-mono">
                  {message.metadata.tokensUsed} tok
                </span>
              )}
            </div>
          )}

          {/* Copy button */}
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary"
            >
              {copied
                ? <Check className="w-3 h-3 text-emerald-400" />
                : <Copy className="w-3 h-3" />
              }
            </button>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 px-1">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-1.5 text-2xs text-cyan/70 hover:text-cyan transition-colors font-mono"
            >
              {sourcesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {message.sources.length} source{message.sources.length > 1 ? 's' : ''} retrieved
            </button>

            {sourcesOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1.5"
              >
                {message.sources.map((src, i) => (
                  <div
                    key={i}
                    className="glass-sm rounded-lg px-3 py-2 border-l-2 border-cyan/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xs font-semibold text-cyan font-mono truncate">
                        {src.documentTitle}
                      </span>
                      <span className="text-2xs text-emerald-400 font-mono flex-shrink-0 ml-2">
                        {(src.relevanceScore * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <p className="text-2xs text-text-muted line-clamp-2">
                      {src.chunkContent}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
