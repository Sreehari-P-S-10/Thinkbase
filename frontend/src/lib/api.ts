import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type {
  AppSettings,
  ChatMessage,
  ChatSession,
  KnowledgeDocument,
  KnowledgeGraph,
  InsightMetrics,
  TopicFrequency,
  LearningStreak,
  StreamChunk,
  UploadJob,
  User,
} from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000,
    })

    // Request interceptor — attach token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('knowledge-os-token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    // Response interceptor — handle 401
    this.client.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('knowledge-os-token')
          window.location.href = '/login'
        }
        return Promise.reject(err)
      }
    )
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const { data } = await this.client.post<{ user: User; token: string }>('/auth/login', {
      email,
      password,
    })
    localStorage.setItem('knowledge-os-token', data.token)
    return data
  }

  async register(name: string, email: string, password: string) {
    const { data } = await this.client.post<{ user: User; token: string }>('/auth/register', {
      name,
      email,
      password,
    })
    localStorage.setItem('knowledge-os-token', data.token)
    return data
  }

  async getMe() {
    const { data } = await this.client.get<{ user: User }>('/auth/me')
    return data.user
  }

  // ── Documents ───────────────────────────────────────────────────────────────

  async getDocuments(): Promise<KnowledgeDocument[]> {
    const { data } = await this.client.get<{ documents: KnowledgeDocument[] }>('/documents')
    return data.documents
  }

  async getDocument(id: string): Promise<KnowledgeDocument> {
    const { data } = await this.client.get<{ document: KnowledgeDocument }>(`/documents/${id}`)
    return data.document
  }

  async uploadFile(
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<KnowledgeDocument> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await this.client.post<{ document: KnowledgeDocument }>(
      '/documents/upload',
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
        },
      }
    )
    return data.document
  }

  async ingestUrl(url: string): Promise<KnowledgeDocument> {
    const { data } = await this.client.post<{ document: KnowledgeDocument }>('/documents/url', {
      url,
    })
    return data.document
  }

  async ingestYouTube(url: string): Promise<KnowledgeDocument> {
    const { data } = await this.client.post<{ document: KnowledgeDocument }>(
      '/documents/youtube',
      { url }
    )
    return data.document
  }

  async deleteDocument(id: string): Promise<void> {
    await this.client.delete(`/documents/${id}`)
  }

  async updateDocumentTags(id: string, tags: string[]): Promise<KnowledgeDocument> {
    const { data } = await this.client.patch<{ document: KnowledgeDocument }>(
      `/documents/${id}/tags`,
      { tags }
    )
    return data.document
  }

  // ── Chat / RAG ──────────────────────────────────────────────────────────────

  async getSessions(): Promise<ChatSession[]> {
    const { data } = await this.client.get<{ sessions: ChatSession[] }>('/chat/sessions')
    return data.sessions
  }

  async createSession(title?: string): Promise<ChatSession> {
    const { data } = await this.client.post<{ session: ChatSession }>('/chat/sessions', { title })
    return data.session
  }

  async deleteSession(id: string): Promise<void> {
    await this.client.delete(`/chat/sessions/${id}`)
  }

  /**
   * Stream a chat response. Calls `onChunk` for each SSE event.
   * Returns a promise that resolves when the stream completes.
   */
  async streamChat(
    sessionId: string,
    userMessage: string,
    documentIds: string[] | undefined,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('knowledge-os-token')}`,
      },
      body: JSON.stringify({ sessionId, message: userMessage, documentIds }),
      signal,
    })

    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value)
      for (const line of text.split('\n')) {
        if (line.startsWith('data: ')) {
          try {
            const chunk = JSON.parse(line.slice(6)) as StreamChunk
            onChunk(chunk)
          } catch {
            // skip malformed
          }
        }
      }
    }
  }

  async summarizeDocument(documentId: string): Promise<string> {
    const { data } = await this.client.post<{ summary: string }>('/chat/summarize', {
      documentId,
    })
    return data.summary
  }

  // ── Knowledge Graph ─────────────────────────────────────────────────────────

  async getGraph(): Promise<KnowledgeGraph> {
    const { data } = await this.client.get<{ graph: KnowledgeGraph }>('/graph')
    return data.graph
  }

  async getGraphForDocument(documentId: string): Promise<KnowledgeGraph> {
    const { data } = await this.client.get<{ graph: KnowledgeGraph }>(
      `/graph/document/${documentId}`
    )
    return data.graph
  }

  async expandNode(nodeId: string): Promise<KnowledgeGraph> {
    const { data } = await this.client.post<{ graph: KnowledgeGraph }>(`/graph/expand/${nodeId}`)
    return data.graph
  }

  // ── Insights ────────────────────────────────────────────────────────────────

  async getMetrics(): Promise<InsightMetrics> {
    const { data } = await this.client.get<{ metrics: InsightMetrics }>('/insights/metrics')
    return data.metrics
  }

  async getTopicFrequency(): Promise<TopicFrequency[]> {
    const { data } = await this.client.get<{ topics: TopicFrequency[] }>('/insights/topics')
    return data.topics
  }

  async getLearningStreak(): Promise<LearningStreak[]> {
    const { data } = await this.client.get<{ streak: LearningStreak[] }>('/insights/streak')
    return data.streak
  }

  // ── Voice ───────────────────────────────────────────────────────────────────

  async transcribeAudio(audioBlob: Blob): Promise<{ text: string; confidence: number }> {
    const form = new FormData()
    form.append('audio', audioBlob, 'recording.webm')
    const { data } = await this.client.post<{ text: string; confidence: number }>(
      '/voice/transcribe',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  }

  async textToSpeech(text: string): Promise<Blob> {
    const response = await this.client.post(
      '/voice/tts',
      { text },
      { responseType: 'blob' }
    )
    return response.data as Blob
  }

  // ── Settings ────────────────────────────────────────────────────────────────

  async getSettings(): Promise<AppSettings> {
    const { data } = await this.client.get<{ settings: AppSettings }>('/settings')
    return data.settings
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const { data } = await this.client.patch<{ settings: AppSettings }>('/settings', settings)
    return data.settings
  }
}

export const api = new ApiClient()
