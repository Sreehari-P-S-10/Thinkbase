import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Search, Filter, Tag, Clock,
  Hash, Eye, Trash2, MessageSquare, MoreVertical,
  Youtube, Globe, BookOpen,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn, formatRelative, docTypeColor, truncate } from '@/lib/utils'
import type { KnowledgeDocument } from '@/types'

// ─── Type icon ────────────────────────────────────────────────────────────────
function DocTypeIcon({ type }: { type: KnowledgeDocument['type'] }) {
  const cls = cn('w-4 h-4', docTypeColor(type))
  if (type === 'youtube') return <Youtube className={cls} />
  if (type === 'url')     return <Globe   className={cls} />
  return <FileText className={cls} />
}

// ─── Document card ────────────────────────────────────────────────────────────
function DocCard({ doc, selected, onSelect, onChat }: {
  doc: KnowledgeDocument
  selected: boolean
  onSelect: () => void
  onChat: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-sm rounded-xl p-4 cursor-pointer border transition-all duration-150 group',
        selected ? 'border-cyan/40 bg-cyan/5' : 'border-transparent hover:border-border-bright hover:bg-surface/30'
      )}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          doc.type === 'pdf'      ? 'bg-rose-500/10'
          : doc.type === 'youtube' ? 'bg-red-500/10'
          : doc.type === 'url'     ? 'bg-cyan/10'
          : 'bg-emerald-500/10'
        )}>
          <DocTypeIcon type={doc.type} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary leading-tight line-clamp-2">
            {doc.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn('text-2xs font-mono uppercase', docTypeColor(doc.type))}>
              {doc.type}
            </span>
            <span className="text-2xs text-text-muted">·</span>
            <span className="text-2xs text-text-muted font-mono">
              {doc.wordCount.toLocaleString()} words
            </span>
          </div>
        </div>

        {/* Status dot */}
        <div className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5',
          doc.status === 'ready'      ? 'bg-emerald-400'
          : doc.status === 'processing' ? 'bg-amber-400 animate-pulse'
          : 'bg-rose-400'
        )} />
      </div>

      {/* Summary */}
      {doc.summary && (
        <p className="text-xs text-text-secondary line-clamp-2 mb-3">{doc.summary}</p>
      )}

      {/* Tags */}
      {doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {doc.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-2xs font-mono bg-surface px-1.5 py-0.5 rounded text-text-muted">
              #{tag}
            </span>
          ))}
          {doc.tags.length > 3 && (
            <span className="text-2xs text-text-muted font-mono">+{doc.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-text-muted">
          <Clock className="w-3 h-3" />
          <span className="text-2xs font-mono">{formatRelative(doc.updatedAt)}</span>
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onChat() }}
            className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-cyan hover:bg-cyan/10 transition-colors"
            title="Chat about this document"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-2xs text-text-muted font-mono">
          {doc.chunkCount} chunks
        </span>
      </div>
    </motion.div>
  )
}

// ─── Document detail panel ────────────────────────────────────────────────────
function DocDetail({ doc, onClose }: { doc: KnowledgeDocument; onClose: () => void }) {
  return (
    <div className="w-80 flex-shrink-0 glass border-l border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-display font-semibold text-sm text-text-primary truncate">{doc.title}</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary ml-2">
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Type',   value: doc.type.toUpperCase() },
            { label: 'Status', value: doc.status },
            { label: 'Words',  value: doc.wordCount.toLocaleString() },
            { label: 'Chunks', value: doc.chunkCount.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="glass-sm rounded-lg p-2.5">
              <p className="text-2xs text-text-muted font-mono uppercase">{label}</p>
              <p className="text-xs font-semibold text-text-primary mt-0.5 font-mono">{value}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        {doc.summary && (
          <div>
            <p className="text-2xs text-text-muted font-mono uppercase tracking-widest mb-2">Summary</p>
            <p className="text-xs text-text-secondary leading-relaxed">{doc.summary}</p>
          </div>
        )}

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-2xs text-text-muted font-mono uppercase tracking-widest">Tags</p>
            <button className="text-2xs text-cyan font-mono">+ Add</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map((tag) => (
              <span key={tag} className="text-xs font-mono bg-surface border border-border px-2 py-0.5 rounded-md text-text-secondary flex items-center gap-1">
                <Hash className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
            {doc.tags.length === 0 && (
              <span className="text-xs text-text-muted font-mono">No tags yet</span>
            )}
          </div>
        </div>

        {/* Source URL */}
        {doc.sourceUrl && (
          <div>
            <p className="text-2xs text-text-muted font-mono uppercase tracking-widest mb-1">Source</p>
            <a
              href={doc.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan underline decoration-cyan/30 hover:decoration-cyan break-all"
            >
              {doc.sourceUrl}
            </a>
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Created</span>
            <span className="font-mono text-text-secondary">{formatRelative(doc.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Updated</span>
            <span className="font-mono text-text-secondary">{formatRelative(doc.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main NotesView ───────────────────────────────────────────────────────────
type SortKey = 'date' | 'title' | 'words'
type FilterType = 'all' | KnowledgeDocument['type']

export function NotesView() {
  const { documents, setActiveView, setSelectedDocumentId } = useStore()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = documents
    .filter((d) => filterType === 'all' || d.type === filterType)
    .filter((d) =>
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortKey === 'date')  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      if (sortKey === 'title') return a.title.localeCompare(b.title)
      return b.wordCount - a.wordCount
    })

  const selectedDoc = documents.find((d) => d.id === selectedId) ?? null

  const handleChatAbout = (docId: string) => {
    setSelectedDocumentId(docId)
    setActiveView('chat')
  }

  const TYPE_FILTERS: FilterType[] = ['all', 'pdf', 'markdown', 'youtube', 'url', 'note']

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-shrink-0 glass">
          <BookOpen className="w-4 h-4 text-cyan" />
          <h1 className="font-display font-semibold text-sm text-text-primary">Notes Library</h1>
          <span className="text-2xs font-mono text-text-muted">{documents.length} documents</span>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search documents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neural-input pl-9 h-8 w-52 text-xs py-1.5"
            />
          </div>

          {/* Sort */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="neural-input h-8 text-xs py-0 w-28"
          >
            <option value="date">Newest</option>
            <option value="title">A → Z</option>
            <option value="words">Longest</option>
          </select>
        </div>

        {/* Type filters */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-border overflow-x-auto scrollbar-hide">
          {TYPE_FILTERS.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'flex-shrink-0 text-2xs font-mono uppercase px-2.5 py-1 rounded-md transition-all duration-100',
                filterType === type
                  ? 'bg-cyan/10 text-cyan border border-cyan/30'
                  : 'text-text-muted hover:text-text-primary border border-transparent hover:border-border'
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <FileText className="w-10 h-10 text-text-muted opacity-50" />
              <p className="text-sm text-text-muted">
                {search ? 'No documents match your search' : 'No documents yet. Upload something!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((doc) => (
                  <DocCard
                    key={doc.id}
                    doc={doc}
                    selected={selectedId === doc.id}
                    onSelect={() => setSelectedId(selectedId === doc.id ? null : doc.id)}
                    onChat={() => handleChatAbout(doc.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <DocDetail doc={selectedDoc} onClose={() => setSelectedId(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
