// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'dark' | 'light'
  responseStyle: 'concise' | 'detailed' | 'academic'
  voiceEnabled: boolean
  autoSummarize: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// ─── Notes & Documents ───────────────────────────────────────────────────────

export type DocumentType = 'pdf' | 'markdown' | 'text' | 'youtube' | 'url' | 'note'
export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'error'

export interface KnowledgeDocument {
  id: string
  title: string
  type: DocumentType
  status: DocumentStatus
  content?: string
  summary?: string
  tags: string[]
  chunkCount: number
  wordCount: number
  createdAt: string
  updatedAt: string
  sourceUrl?: string
  metadata?: Record<string, unknown>
}

export interface DocumentChunk {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  embedding?: number[]
  metadata?: Record<string, unknown>
}

// ─── Chat & AI ───────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  sources?: SourceReference[]
  isStreaming?: boolean
  metadata?: {
    model?: string
    tokensUsed?: number
    processingTime?: number
  }
}

export interface SourceReference {
  documentId: string
  documentTitle: string
  chunkContent: string
  relevanceScore: number
  pageNumber?: number
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  documentIds?: string[]  // scoped documents
}

export interface StreamChunk {
  type: 'content' | 'source' | 'done' | 'error'
  content?: string
  sources?: SourceReference[]
  error?: string
}

// ─── Knowledge Graph ─────────────────────────────────────────────────────────

export interface GraphNode {
  id: string
  label: string
  type: 'concept' | 'document' | 'entity' | 'topic'
  weight: number           // frequency/importance
  documentIds: string[]
  color?: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
  weight: number          // relationship strength
  type: 'related' | 'contains' | 'references' | 'derived_from'
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  lastUpdated: string
}

export interface GraphFilters {
  nodeTypes: GraphNode['type'][]
  minWeight: number
  searchQuery: string
  selectedDocumentId?: string
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error'

export interface UploadJob {
  id: string
  file?: File
  url?: string
  type: DocumentType
  name: string
  status: UploadStatus
  progress: number          // 0–100
  error?: string
  documentId?: string       // set when complete
}

export interface ProcessingStep {
  name: string
  status: 'pending' | 'running' | 'done' | 'error'
  detail?: string
}

// ─── Insights ────────────────────────────────────────────────────────────────

export interface InsightMetrics {
  totalDocuments: number
  totalChunks: number
  totalQueries: number
  averageSessionLength: number
  topicsExplored: number
}

export interface TopicFrequency {
  topic: string
  count: number
  lastAccessed: string
  trend: 'rising' | 'stable' | 'falling'
}

export interface LearningStreak {
  date: string
  queries: number
  documentsAdded: number
}

export interface WeakArea {
  topic: string
  score: number           // 0–100 (lower = weaker)
  suggestedResources: string[]
}

export interface LearningRoadmap {
  id: string
  topic: string
  steps: RoadmapStep[]
  estimatedTime: string
}

export interface RoadmapStep {
  id: string
  title: string
  description: string
  completed: boolean
  documentIds: string[]
}

// ─── Voice ───────────────────────────────────────────────────────────────────

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking'

export interface VoiceTranscription {
  text: string
  confidence: number
  isFinal: boolean
}

// ─── UI State ────────────────────────────────────────────────────────────────

export type ActiveView = 'chat' | 'graph' | 'notes' | 'upload' | 'insights' | 'settings'
export type SidebarItem = ActiveView

export interface UIState {
  activeView: ActiveView
  sidebarCollapsed: boolean
  bottomPanelExpanded: boolean
  selectedDocumentId: string | null
  selectedNodeId: string | null
  isCommandPaletteOpen: boolean
}

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, unknown>
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  llmProvider: 'openai' | 'anthropic' | 'local'
  llmModel: string
  embeddingModel: string
  vectorDb: 'qdrant' | 'pinecone'
  maxContextChunks: number
  temperature: number
  apiKeys: {
    openai?: string
    anthropic?: string
    pinecone?: string
  }
}
