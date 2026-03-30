import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { MainWorkspace } from './MainWorkspace'
import { BottomPanel } from './BottomPanel'
import { useStore } from '@/store/useStore'
import { api } from '@/lib/api'

export function AppShell() {
  const { sidebarCollapsed, bottomPanelExpanded, setDocuments, addDocument } = useStore()

  // Load documents on mount
  useEffect(() => {
    api.getDocuments()
      .then(setDocuments)
      .catch(() => {
        // Use mock data in demo mode
        setDocuments(DEMO_DOCUMENTS)
      })
  }, [setDocuments])

  const sidebarWidth = sidebarCollapsed ? 64 : 240
  const bottomHeight = bottomPanelExpanded ? 200 : 56

  return (
    <div className="flex h-full bg-neural overflow-hidden relative">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyan/5 blur-3xl" />
      </div>

      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-20 flex-shrink-0"
        style={{ width: sidebarWidth }}
      >
        <Sidebar />
      </motion.div>

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-250"
        style={{ paddingBottom: bottomHeight }}
      >
        <MainWorkspace />
      </div>

      {/* Bottom voice panel */}
      <motion.div
        animate={{ height: bottomHeight }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 z-30"
        style={{ height: bottomHeight }}
      >
        <BottomPanel />
      </motion.div>
    </div>
  )
}

// ─── Demo data ────────────────────────────────────────────────────────────────

import type { KnowledgeDocument } from '@/types'

const DEMO_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'doc-1',
    title: 'Introduction to Neural Networks',
    type: 'pdf',
    status: 'ready',
    summary: 'Comprehensive overview of artificial neural networks, their architectures, and training methodologies.',
    tags: ['AI', 'ML', 'Deep Learning'],
    chunkCount: 42,
    wordCount: 8500,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'doc-2',
    title: 'Attention Is All You Need',
    type: 'pdf',
    status: 'ready',
    summary: 'The original Transformer paper introducing the self-attention mechanism.',
    tags: ['Transformers', 'NLP', 'Research'],
    chunkCount: 28,
    wordCount: 6200,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'doc-3',
    title: 'RAG: Retrieval Augmented Generation',
    type: 'markdown',
    status: 'ready',
    summary: 'Notes on RAG pipelines, vector databases, and embedding strategies.',
    tags: ['RAG', 'Embeddings', 'LLM'],
    chunkCount: 18,
    wordCount: 3400,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'doc-4',
    title: 'Andrej Karpathy: Neural Nets from Scratch',
    type: 'youtube',
    status: 'ready',
    summary: 'Video transcript: building neural networks from first principles in Python.',
    tags: ['Python', 'Tutorial', 'Deep Learning'],
    chunkCount: 65,
    wordCount: 14200,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sourceUrl: 'https://youtube.com/watch?v=VMj-3S1tku0',
  },
  {
    id: 'doc-5',
    title: 'Vector Database Comparison 2024',
    type: 'url',
    status: 'ready',
    summary: 'Comparison of Qdrant, Pinecone, Weaviate, and Chroma for production RAG systems.',
    tags: ['Vector DB', 'Infrastructure'],
    chunkCount: 22,
    wordCount: 4800,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    sourceUrl: 'https://towardsdatascience.com/vector-databases-2024',
  },
]
