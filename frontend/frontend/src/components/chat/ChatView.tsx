import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, Sparkles, BookOpen, Layers } from 'lucide-react'
import { useStore, useActiveMessages } from '@/store/useStore'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { cn, generateId } from '@/lib/utils'
import type { ChatMessage, SourceReference } from '@/types'

// ─── Demo AI responses ────────────────────────────────────────────────────────

const DEMO_RESPONSES: Record<string, string> = {
  default: `Based on your knowledge base, here's what I found:

## Key Insights

The **transformer architecture** introduced in "Attention Is All You Need" fundamentally changed NLP by replacing recurrence with a self-attention mechanism. This allows the model to:

1. **Process sequences in parallel** — unlike RNNs, all tokens are processed simultaneously
2. **Capture long-range dependencies** — attention scores connect any two positions directly
3. **Scale efficiently** — the architecture scales well with more data and compute

### How Self-Attention Works

For each token, the model computes Query (Q), Key (K), and Value (V) matrices. The attention score is:

\`\`\`
Attention(Q, K, V) = softmax(QK^T / √d_k) × V
\`\`\`

The scaling factor \`√d_k\` prevents vanishing gradients in deep networks.

> **From your notes:** "The multi-head variant runs attention h times in parallel with different projections, allowing the model to jointly attend to information from different representation subspaces."

Would you like me to elaborate on positional encodings or the encoder-decoder structure?`,

  summarize: `## Document Summary

**Retrieval-Augmented Generation (RAG)** combines the strengths of parametric memory (LLMs) with non-parametric memory (vector databases).

### Core Pipeline
- **Ingestion**: Documents are chunked → embedded → stored in vector DB
- **Retrieval**: Query is embedded → top-k chunks fetched via ANN search  
- **Generation**: Chunks injected into LLM context → response generated

### Why RAG beats Fine-tuning for knowledge tasks
- No retraining required for new knowledge
- Traceable sources (citations)
- Lower hallucination rate on factual queries
- Cost-effective updates`,
}

const DEMO_SOURCES: SourceReference[] = [
  { documentId: 'doc-1', documentTitle: 'Attention Is All You Need', chunkContent: 'Multi-head attention allows the model to jointly attend to information...', relevanceScore: 0.94 },
  { documentId: 'doc-3', documentTitle: 'RAG: Retrieval Augmented Generation', chunkContent: 'Vector databases store dense embeddings for efficient nearest-neighbor...', relevanceScore: 0.87 },
]

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyChat({ onPrompt }: { onPrompt: (text: string) => void }) {
  const STARTERS = [
    { icon: Sparkles, label: 'Explain transformers', q: 'Explain the transformer attention mechanism in simple terms' },
    { icon: BookOpen, label: 'Summarize my notes', q: 'Summarize the key concepts from my knowledge base' },
    { icon: Layers, label: 'Compare concepts', q: 'Compare RAG vs fine-tuning for knowledge-intensive tasks' },
    { icon: MessageSquare, label: 'Find connections', q: 'What are the connections between neural networks and attention?' },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
      {/* Animated brain logo */}
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan/20 to-violet/20 border border-cyan/20 flex items-center justify-center"
        >
          <span className="text-4xl">🧠</span>
        </motion.div>
        <div className="absolute -inset-2 rounded-3xl border border-cyan/10 animate-pulse-slow" />
      </div>

      <div className="text-center max-w-sm">
        <h2 className="font-display text-xl font-semibold text-text-primary mb-2">
          What would you like to explore?
        </h2>
        <p className="text-sm text-text-secondary">
          Ask anything about your knowledge base. I'll retrieve the most relevant context and generate an accurate response.
        </p>
      </div>

      {/* Starter prompts */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-md">
        {STARTERS.map(({ icon: Icon, label, q }) => (
          <button
            key={label}
            onClick={() => onPrompt(q)}
            className="glass-sm rounded-xl p-3 text-left hover:border-cyan/30 border border-transparent transition-all duration-150 group"
          >
            <Icon className="w-4 h-4 text-cyan mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-medium text-text-primary">{label}</p>
            <p className="text-2xs text-text-muted mt-0.5 line-clamp-2">{q}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main ChatView ────────────────────────────────────────────────────────────

export function ChatView() {
  const {
    sessions, activeSessionId,
    createSession, setActiveSession,
    addMessage, appendStreamChunk,
    updateMessage, setStreaming, isStreaming,
    documents,
  } = useStore()

  const messages = useActiveMessages()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [scopedDocIds, setScopedDocIds] = useState<string[]>([])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Ensure a session exists
  useEffect(() => {
    if (!activeSessionId && sessions.length === 0) {
      createSession('New Chat')
    } else if (!activeSessionId && sessions.length > 0) {
      setActiveSession(sessions[0].id)
    }
  }, [activeSessionId, sessions, createSession, setActiveSession])

  const handleSend = async (text: string) => {
    const sessionId = activeSessionId ?? createSession('New Chat').id

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    addMessage(sessionId, userMsg)

    // Add placeholder assistant message
    const assistantMsgId = generateId()
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }
    addMessage(sessionId, assistantMsg)
    setStreaming(true, assistantMsgId)

    // ── DEMO MODE: Simulate streaming ────────────────────────────
    // In production, replace with: await api.streamChat(...)
    const responseText = text.toLowerCase().includes('summar')
      ? DEMO_RESPONSES.summarize
      : DEMO_RESPONSES.default

    const words = responseText.split(' ')
    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 18))
      appendStreamChunk(sessionId, assistantMsgId, (i === 0 ? '' : ' ') + words[i])
    }

    // Finalize with sources
    updateMessage(sessionId, assistantMsgId, {
      isStreaming: false,
      sources: DEMO_SOURCES,
      metadata: { model: 'claude-opus-4-5', tokensUsed: 847, processingTime: 1240 },
    })
    setStreaming(false)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0 glass">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan" />
          <h1 className="font-display font-semibold text-sm text-text-primary">
            {sessions.find(s => s.id === activeSessionId)?.title ?? 'AI Chat'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Document scope selector */}
          <div className="flex items-center gap-1.5 text-2xs text-text-muted font-mono">
            <span>{scopedDocIds.length > 0 ? `${scopedDocIds.length} docs scoped` : `${documents.length} docs in scope`}</span>
          </div>

          <button
            onClick={() => createSession()}
            className="btn-ghost text-xs py-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {messages.length === 0 ? (
          <EmptyChat onPrompt={handleSend} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i === messages.length - 1 ? 0 : 0 }}
                >
                  <MessageBubble message={msg} />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border glass px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  )
}
