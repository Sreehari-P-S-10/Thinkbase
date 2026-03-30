import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  ActiveView,
  AppSettings,
  AuthState,
  ChatMessage,
  ChatSession,
  GraphFilters,
  KnowledgeDocument,
  KnowledgeGraph,
  UploadJob,
  User,
  VoiceState,
} from '@/types'

// ─── Auth Slice ───────────────────────────────────────────────────────────────

interface AuthSlice extends AuthState {
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

// ─── UI Slice ────────────────────────────────────────────────────────────────

interface UISlice {
  activeView: ActiveView
  sidebarCollapsed: boolean
  bottomPanelExpanded: boolean
  selectedDocumentId: string | null
  selectedNodeId: string | null
  isCommandPaletteOpen: boolean
  setActiveView: (view: ActiveView) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setBottomPanelExpanded: (expanded: boolean) => void
  setSelectedDocumentId: (id: string | null) => void
  setSelectedNodeId: (id: string | null) => void
  setCommandPaletteOpen: (open: boolean) => void
}

// ─── Chat Slice ───────────────────────────────────────────────────────────────

interface ChatSlice {
  sessions: ChatSession[]
  activeSessionId: string | null
  isStreaming: boolean
  streamingMessageId: string | null
  createSession: (title?: string) => ChatSession
  setActiveSession: (id: string) => void
  addMessage: (sessionId: string, message: ChatMessage) => void
  updateMessage: (sessionId: string, messageId: string, update: Partial<ChatMessage>) => void
  appendStreamChunk: (sessionId: string, messageId: string, chunk: string) => void
  setStreaming: (streaming: boolean, messageId?: string) => void
  clearSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
}

// ─── Documents Slice ─────────────────────────────────────────────────────────

interface DocumentsSlice {
  documents: KnowledgeDocument[]
  setDocuments: (docs: KnowledgeDocument[]) => void
  addDocument: (doc: KnowledgeDocument) => void
  updateDocument: (id: string, update: Partial<KnowledgeDocument>) => void
  removeDocument: (id: string) => void
}

// ─── Upload Slice ─────────────────────────────────────────────────────────────

interface UploadSlice {
  uploadQueue: UploadJob[]
  addUploadJob: (job: UploadJob) => void
  updateUploadJob: (id: string, update: Partial<UploadJob>) => void
  removeUploadJob: (id: string) => void
  clearCompleted: () => void
}

// ─── Graph Slice ──────────────────────────────────────────────────────────────

interface GraphSlice {
  graph: KnowledgeGraph | null
  graphFilters: GraphFilters
  setGraph: (graph: KnowledgeGraph) => void
  setGraphFilters: (filters: Partial<GraphFilters>) => void
}

// ─── Voice Slice ──────────────────────────────────────────────────────────────

interface VoiceSlice {
  voiceState: VoiceState
  transcription: string
  setVoiceState: (state: VoiceState) => void
  setTranscription: (text: string) => void
}

// ─── Settings Slice ───────────────────────────────────────────────────────────

interface SettingsSlice {
  settings: AppSettings
  updateSettings: (update: Partial<AppSettings>) => void
}

// ─── Combined Store ───────────────────────────────────────────────────────────

type AppStore = AuthSlice &
  UISlice &
  ChatSlice &
  DocumentsSlice &
  UploadSlice &
  GraphSlice &
  VoiceSlice &
  SettingsSlice

const DEFAULT_SETTINGS: AppSettings = {
  llmProvider: 'anthropic',
  llmModel: 'claude-opus-4-5',
  embeddingModel: 'text-embedding-3-small',
  vectorDb: 'qdrant',
  maxContextChunks: 6,
  temperature: 0.7,
  apiKeys: {},
}

const DEFAULT_GRAPH_FILTERS: GraphFilters = {
  nodeTypes: ['concept', 'document', 'entity', 'topic'],
  minWeight: 0,
  searchQuery: '',
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const useStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ── Auth ──────────────────────────────────────────────────────────────
        user: null,
        token: null,
        isAuthenticated: false,

        login: (user, token) => set({ user, token, isAuthenticated: true }),
        logout: () => set({ user: null, token: null, isAuthenticated: false }),
        updateUser: (update) =>
          set((s) => ({ user: s.user ? { ...s.user, ...update } : null })),

        // ── UI ────────────────────────────────────────────────────────────────
        activeView: 'chat',
        sidebarCollapsed: false,
        bottomPanelExpanded: false,
        selectedDocumentId: null,
        selectedNodeId: null,
        isCommandPaletteOpen: false,

        setActiveView: (view) => set({ activeView: view }),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        setBottomPanelExpanded: (expanded) => set({ bottomPanelExpanded: expanded }),
        setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),
        setSelectedNodeId: (id) => set({ selectedNodeId: id }),
        setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

        // ── Chat ──────────────────────────────────────────────────────────────
        sessions: [],
        activeSessionId: null,
        isStreaming: false,
        streamingMessageId: null,

        createSession: (title) => {
          const session: ChatSession = {
            id: generateId(),
            title: title ?? `Session ${new Date().toLocaleTimeString()}`,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          set((s) => ({
            sessions: [session, ...s.sessions],
            activeSessionId: session.id,
          }))
          return session
        },

        setActiveSession: (id) => set({ activeSessionId: id }),

        addMessage: (sessionId, message) =>
          set((s) => ({
            sessions: s.sessions.map((sess) =>
              sess.id === sessionId
                ? {
                    ...sess,
                    messages: [...sess.messages, message],
                    updatedAt: new Date().toISOString(),
                  }
                : sess
            ),
          })),

        updateMessage: (sessionId, messageId, update) =>
          set((s) => ({
            sessions: s.sessions.map((sess) =>
              sess.id === sessionId
                ? {
                    ...sess,
                    messages: sess.messages.map((m) =>
                      m.id === messageId ? { ...m, ...update } : m
                    ),
                  }
                : sess
            ),
          })),

        appendStreamChunk: (sessionId, messageId, chunk) =>
          set((s) => ({
            sessions: s.sessions.map((sess) =>
              sess.id === sessionId
                ? {
                    ...sess,
                    messages: sess.messages.map((m) =>
                      m.id === messageId
                        ? { ...m, content: m.content + chunk }
                        : m
                    ),
                  }
                : sess
            ),
          })),

        setStreaming: (streaming, messageId) =>
          set({ isStreaming: streaming, streamingMessageId: messageId ?? null }),

        clearSession: (sessionId) =>
          set((s) => ({
            sessions: s.sessions.map((sess) =>
              sess.id === sessionId ? { ...sess, messages: [] } : sess
            ),
          })),

        deleteSession: (sessionId) =>
          set((s) => {
            const sessions = s.sessions.filter((sess) => sess.id !== sessionId)
            return {
              sessions,
              activeSessionId:
                s.activeSessionId === sessionId
                  ? sessions[0]?.id ?? null
                  : s.activeSessionId,
            }
          }),

        // ── Documents ─────────────────────────────────────────────────────────
        documents: [],
        setDocuments: (docs) => set({ documents: docs }),
        addDocument: (doc) =>
          set((s) => ({ documents: [doc, ...s.documents] })),
        updateDocument: (id, update) =>
          set((s) => ({
            documents: s.documents.map((d) => (d.id === id ? { ...d, ...update } : d)),
          })),
        removeDocument: (id) =>
          set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

        // ── Upload ────────────────────────────────────────────────────────────
        uploadQueue: [],
        addUploadJob: (job) =>
          set((s) => ({ uploadQueue: [...s.uploadQueue, job] })),
        updateUploadJob: (id, update) =>
          set((s) => ({
            uploadQueue: s.uploadQueue.map((j) => (j.id === id ? { ...j, ...update } : j)),
          })),
        removeUploadJob: (id) =>
          set((s) => ({ uploadQueue: s.uploadQueue.filter((j) => j.id !== id) })),
        clearCompleted: () =>
          set((s) => ({
            uploadQueue: s.uploadQueue.filter((j) => j.status !== 'complete'),
          })),

        // ── Graph ─────────────────────────────────────────────────────────────
        graph: null,
        graphFilters: DEFAULT_GRAPH_FILTERS,
        setGraph: (graph) => set({ graph }),
        setGraphFilters: (filters) =>
          set((s) => ({ graphFilters: { ...s.graphFilters, ...filters } })),

        // ── Voice ─────────────────────────────────────────────────────────────
        voiceState: 'idle',
        transcription: '',
        setVoiceState: (state) => set({ voiceState: state }),
        setTranscription: (text) => set({ transcription: text }),

        // ── Settings ──────────────────────────────────────────────────────────
        settings: DEFAULT_SETTINGS,
        updateSettings: (update) =>
          set((s) => ({ settings: { ...s.settings, ...update } })),
      }),
      {
        name: 'knowledge-os-store',
        partialize: (s) => ({
          settings: s.settings,
          sessions: s.sessions.slice(0, 20), // keep last 20 sessions
          activeSessionId: s.activeSessionId,
        }),
      }
    )
  )
)

// ─── Selectors ────────────────────────────────────────────────────────────────

export const useActiveSession = () => {
  const { sessions, activeSessionId } = useStore()
  return sessions.find((s) => s.id === activeSessionId) ?? null
}

export const useActiveMessages = () => {
  const session = useActiveSession()
  return session?.messages ?? []
}
