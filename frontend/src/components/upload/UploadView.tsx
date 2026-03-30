import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Youtube, Globe, Link,
  CheckCircle2, XCircle, Loader2, X, Plus, AlertCircle,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn, generateId, formatBytes } from '@/lib/utils'
import type { DocumentType, UploadJob } from '@/types'

// ─── Upload job status card ───────────────────────────────────────────────────

function JobCard({ job, onRemove }: { job: UploadJob; onRemove: () => void }) {
  const icons: Record<DocumentType, React.ElementType> = {
    pdf:      FileText,
    markdown: FileText,
    text:     FileText,
    youtube:  Youtube,
    url:      Globe,
    note:     FileText,
  }
  const Icon = icons[job.type] ?? FileText

  const statusColor = {
    idle:       'text-text-muted',
    uploading:  'text-cyan',
    processing: 'text-amber',
    complete:   'text-emerald',
    error:      'text-rose',
  }[job.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="glass-sm rounded-xl p-4 flex items-start gap-3"
    >
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', {
        'bg-cyan/10':    job.type === 'pdf' || job.type === 'markdown',
        'bg-amber/10': job.type === 'youtube',
        'bg-emerald/10': job.type === 'url',
      })}>
        <Icon className={cn('w-4 h-4', statusColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-text-primary truncate">{job.name}</p>
          <button onClick={onRemove} className="text-text-muted hover:text-text-primary ml-2 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {job.status === 'uploading' || job.status === 'processing' ? (
            <>
              <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan rounded-full"
                  animate={{ width: `${job.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-2xs text-text-muted font-mono flex-shrink-0">{job.progress}%</span>
              <Loader2 className="w-3 h-3 text-cyan animate-spin flex-shrink-0" />
            </>
          ) : job.status === 'complete' ? (
            <div className="flex items-center gap-1.5 text-emerald">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-xs">Ready — indexed and searchable</span>
            </div>
          ) : job.status === 'error' ? (
            <div className="flex items-center gap-1.5 text-rose">
              <XCircle className="w-3.5 h-3.5" />
              <span className="text-xs">{job.error ?? 'Upload failed'}</span>
            </div>
          ) : (
            <span className="text-xs text-text-muted font-mono uppercase">{job.type}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── URL ingestion form ───────────────────────────────────────────────────────

function UrlIngestion({ onIngest }: { onIngest: (url: string, type: 'url' | 'youtube') => void }) {
  const [url, setUrl] = useState('')

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')

  const handleSubmit = () => {
    if (!url.trim()) return
    onIngest(url.trim(), isYouTube ? 'youtube' : 'url')
    setUrl('')
  }

  return (
    <div className="glass-sm rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Link className="w-4 h-4 text-cyan" />
        <h3 className="font-semibold text-sm text-text-primary">Import from URL</h3>
      </div>
      <p className="text-xs text-text-secondary">
        Paste any web URL or YouTube link. We'll extract and index the content automatically.
      </p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          {isYouTube && url && (
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
          )}
          {!isYouTube && url && (
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan" />
          )}
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="https://example.com/article  or  youtube.com/watch?v=…"
            className={cn('neural-input', (isYouTube || url) && 'pl-10')}
          />
        </div>
        <button onClick={handleSubmit} disabled={!url.trim()} className="btn-primary px-5">
          Fetch
        </button>
      </div>

      {isYouTube && url && (
        <p className="text-xs text-red-400 font-mono flex items-center gap-1.5">
          <Youtube className="w-3 h-3" /> YouTube detected — transcript will be extracted
        </p>
      )}
    </div>
  )
}

// ─── Processing steps display ─────────────────────────────────────────────────

const STEPS = [
  'Extracting text',
  'Cleaning content',
  'Semantic chunking',
  'Generating embeddings',
  'Storing in vector DB',
  'Building knowledge graph',
]

function ProcessingSteps({ currentStep }: { currentStep: number }) {
  return (
    <div className="glass-sm rounded-xl p-4 space-y-2">
      <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest font-mono mb-3">
        Processing Pipeline
      </p>
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2.5">
          <div className={cn(
            'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
            i < currentStep  ? 'bg-emerald/20 border border-emerald'
            : i === currentStep ? 'bg-cyan/20 border border-cyan animate-pulse'
            : 'bg-surface border border-border'
          )}>
            {i < currentStep
              ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald" />
              : i === currentStep
              ? <Loader2 className="w-2.5 h-2.5 text-cyan animate-spin" />
              : null
            }
          </div>
          <span className={cn(
            'text-xs',
            i < currentStep  ? 'text-emerald line-through'
            : i === currentStep ? 'text-cyan font-medium'
            : 'text-text-muted'
          )}>
            {step}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main UploadView ──────────────────────────────────────────────────────────

export function UploadView() {
  const { uploadQueue, addUploadJob, updateUploadJob, removeUploadJob, addDocument } = useStore()
  const [processingStep, setProcessingStep] = useState(-1)
  const activeJobs = uploadQueue.filter((j) => j.status === 'uploading' || j.status === 'processing')

  // Simulate processing pipeline
  const simulateProcessing = useCallback(async (jobId: string, name: string, type: DocumentType) => {
    setProcessingStep(0)
    for (let step = 0; step < STEPS.length; step++) {
      updateUploadJob(jobId, { status: 'processing', progress: Math.round(((step + 1) / STEPS.length) * 100) })
      setProcessingStep(step)
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400))
    }
    setProcessingStep(-1)

    const docId = generateId()
    updateUploadJob(jobId, { status: 'complete', progress: 100, documentId: docId })

    // Add to documents list
    addDocument({
      id: docId,
      title: name.replace(/\.[^.]+$/, ''),
      type,
      status: 'ready',
      tags: [],
      chunkCount: Math.floor(Math.random() * 40) + 10,
      wordCount: Math.floor(Math.random() * 8000) + 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }, [updateUploadJob, addDocument])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const type: DocumentType =
        file.name.endsWith('.pdf')  ? 'pdf'
        : file.name.endsWith('.md') ? 'markdown'
        : 'text'

      const job: UploadJob = {
        id: generateId(),
        file,
        type,
        name: file.name,
        status: 'uploading',
        progress: 0,
      }
      addUploadJob(job)

      // Simulate upload then processing
      setTimeout(async () => {
        updateUploadJob(job.id, { progress: 100 })
        await simulateProcessing(job.id, file.name, type)
      }, 500)
    }
  }, [addUploadJob, updateUploadJob, simulateProcessing])

  const handleIngestUrl = useCallback(async (url: string, type: 'url' | 'youtube') => {
    const name = type === 'youtube' ? 'YouTube Video' : new URL(url).hostname
    const job: UploadJob = {
      id: generateId(),
      url,
      type,
      name,
      status: 'uploading',
      progress: 0,
    }
    addUploadJob(job)
    await simulateProcessing(job.id, name, type)
  }, [addUploadJob, simulateProcessing])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/markdown':   ['.md'],
      'text/plain':      ['.txt'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border flex-shrink-0 glass">
        <Upload className="w-4 h-4 text-cyan" />
        <h1 className="font-display font-semibold text-sm text-text-primary">Upload Center</h1>
        <span className="text-2xs font-mono text-text-muted ml-1">
          {uploadQueue.filter((j) => j.status === 'complete').length} documents indexed
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="grid grid-cols-3 gap-5 max-w-5xl mx-auto">

          {/* Left: Dropzone + URL */}
          <div className="col-span-2 space-y-4">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                'relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200',
                isDragActive
                  ? 'border-cyan bg-cyan/5 scale-[1.01]'
                  : 'border-border hover:border-border-bright hover:bg-surface/30'
              )}
            >
              <input {...getInputProps()} />

              {/* Animated target */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200',
                    isDragActive ? 'bg-cyan/20 border-2 border-cyan' : 'bg-surface border border-border'
                  )}>
                    <Upload className={cn('w-7 h-7', isDragActive ? 'text-cyan' : 'text-text-muted')} />
                  </div>
                  {isDragActive && (
                    <span className="absolute -inset-1 rounded-2xl border border-cyan/40 animate-ping" />
                  )}
                </div>

                {isDragActive ? (
                  <div>
                    <p className="font-display font-semibold text-cyan">Drop to upload</p>
                    <p className="text-xs text-text-muted mt-1">Release to start processing</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-display font-semibold text-text-primary">
                      Drag & drop files here
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                      or <span className="text-cyan underline">click to browse</span>
                    </p>
                    <p className="text-xs text-text-muted mt-3">
                      Supports: <span className="font-mono">PDF, Markdown, TXT</span> · Max 50MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* URL import */}
            <UrlIngestion onIngest={handleIngestUrl} />

            {/* Upload queue */}
            {uploadQueue.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-widest font-mono">
                    Upload Queue
                  </p>
                  <button
                    onClick={() => uploadQueue.filter(j => j.status === 'complete').forEach(j => removeUploadJob(j.id))}
                    className="text-2xs text-text-muted hover:text-text-primary font-mono"
                  >
                    Clear completed
                  </button>
                </div>
                <AnimatePresence>
                  {uploadQueue.map((job) => (
                    <JobCard key={job.id} job={job} onRemove={() => removeUploadJob(job.id)} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right: processing pipeline + tips */}
          <div className="space-y-4">
            {processingStep >= 0 ? (
              <ProcessingSteps currentStep={processingStep} />
            ) : (
              <div className="glass-sm rounded-xl p-4">
                <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest font-mono mb-3">
                  Processing Pipeline
                </p>
                <div className="space-y-2">
                  {STEPS.map((step, i) => (
                    <div key={step} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-surface border border-border flex-shrink-0 flex items-center justify-center">
                        <span className="text-2xs text-text-muted font-mono">{i + 1}</span>
                      </div>
                      <span className="text-xs text-text-muted">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supported formats */}
            <div className="glass-sm rounded-xl p-4 space-y-2">
              <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest font-mono mb-1">
                Supported Sources
              </p>
              {[
                { icon: FileText, label: 'PDF Documents',   color: 'text-rose' },
                { icon: FileText, label: 'Markdown Notes',  color: 'text-emerald' },
                { icon: FileText, label: 'Plain Text',      color: 'text-amber' },
                { icon: Youtube,  label: 'YouTube Videos',  color: 'text-amber' },
                { icon: Globe,    label: 'Web Articles',    color: 'text-cyan' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-text-secondary">
                  <Icon className={cn('w-3.5 h-3.5', color)} />
                  {label}
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="glass-sm rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber" />
                <p className="text-2xs font-semibold text-amber uppercase tracking-widest font-mono">Tips</p>
              </div>
              <ul className="space-y-1.5 text-xs text-text-muted">
                <li>• Structured PDFs index better than scanned ones</li>
                <li>• Add tags after upload for better retrieval</li>
                <li>• YouTube needs a transcript-enabled video</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
