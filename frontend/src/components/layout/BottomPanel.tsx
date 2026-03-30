import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, ChevronUp, ChevronDown, Loader2, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { VoiceState } from '@/types'

const VOICE_COLORS: Record<VoiceState, string> = {
  idle:       'text-text-muted',
  listening:  'text-rose',
  processing: 'text-amber',
  speaking:   'text-emerald',
}

const VOICE_LABELS: Record<VoiceState, string> = {
  idle:       'Click mic to speak',
  listening:  'Listening…',
  processing: 'Processing…',
  speaking:   'Speaking…',
}

// Animated waveform bars
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full bg-rose"
          animate={active ? {
            height: ['4px', `${6 + Math.random() * 14}px`, '4px'],
          } : { height: '4px' }}
          transition={{
            duration: 0.4 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function BottomPanel() {
  const {
    bottomPanelExpanded, setBottomPanelExpanded,
    voiceState, setVoiceState,
    transcription, setTranscription,
    activeSessionId, createSession, addMessage,
  } = useStore()

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        setVoiceState('processing')
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())

        // In production: call api.transcribeAudio(blob)
        // For demo: simulate transcription
        await new Promise((r) => setTimeout(r, 1200))
        const mockText = 'Explain the transformer attention mechanism'
        setTranscription(mockText)
        setVoiceState('idle')

        // Auto-send to chat
        const sessionId = activeSessionId ?? createSession().id
        addMessage(sessionId, {
          id: Math.random().toString(36).slice(2),
          role: 'user',
          content: mockText,
          timestamp: new Date().toISOString(),
        })
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setVoiceState('listening')
      setTranscription('')
    } catch {
      console.warn('Microphone access denied')
    }
  }, [activeSessionId, createSession, addMessage, setVoiceState, setTranscription])

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const toggleMic = () => {
    if (voiceState === 'idle') startListening()
    else if (voiceState === 'listening') stopListening()
  }

  return (
    <div className="h-full glass border-t border-border flex flex-col overflow-hidden">
      {/* Collapsed bar */}
      <div className="flex items-center gap-3 px-4 h-14 flex-shrink-0">
        {/* Mic button */}
        <button
          onClick={toggleMic}
          className={cn(
            'relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
            voiceState === 'listening'
              ? 'bg-rose/20 border border-rose/50 text-rose'
              : 'bg-surface border border-border text-text-muted hover:text-text-primary hover:border-cyan/40',
            voiceState === 'processing' && 'opacity-50 cursor-not-allowed'
          )}
          disabled={voiceState === 'processing' || voiceState === 'speaking'}
        >
          {voiceState === 'processing' ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber" />
          ) : voiceState === 'listening' ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}

          {/* Pulse ring when listening */}
          {voiceState === 'listening' && (
            <span className="absolute inset-0 rounded-full border border-rose animate-ping opacity-40" />
          )}
        </button>

        {/* Waveform / status */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          {voiceState === 'listening' ? (
            <Waveform active />
          ) : (
            <>
              <span className={cn('text-xs font-mono flex-shrink-0', VOICE_COLORS[voiceState])}>
                {VOICE_LABELS[voiceState]}
              </span>
              {transcription && (
                <span className="text-xs text-text-secondary truncate">
                  {transcription}
                </span>
              )}
            </>
          )}
        </div>

        {/* Speaking indicator */}
        {voiceState === 'speaking' && (
          <div className="flex items-center gap-1.5 text-emerald">
            <Volume2 className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">Speaking</span>
          </div>
        )}

        {/* Clear transcription */}
        {transcription && voiceState === 'idle' && (
          <button
            onClick={() => setTranscription('')}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Expand/collapse */}
        <button
          onClick={() => setBottomPanelExpanded(!bottomPanelExpanded)}
          className="ml-auto text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
        >
          {bottomPanelExpanded
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronUp className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {bottomPanelExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 px-4 pb-4 overflow-y-auto"
          >
            <div className="grid grid-cols-3 gap-3 h-full">
              {/* Voice controls */}
              <div className="glass-sm rounded-xl p-4 flex flex-col gap-2">
                <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest font-mono">Voice Input</p>
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <button
                    onClick={toggleMic}
                    className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200',
                      voiceState === 'listening'
                        ? 'bg-rose/20 border-2 border-rose text-rose animate-pulse'
                        : 'bg-surface border-2 border-border text-text-secondary hover:border-cyan hover:text-cyan'
                    )}
                  >
                    {voiceState === 'listening' ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <p className="text-xs text-text-muted font-mono text-center">
                    {voiceState === 'listening' ? 'Tap to stop' : 'Tap to speak'}
                  </p>
                </div>
              </div>

              {/* Live transcript */}
              <div className="glass-sm rounded-xl p-4 flex flex-col gap-2">
                <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest font-mono">Transcript</p>
                <div className="flex-1 overflow-y-auto">
                  {transcription ? (
                    <p className="text-sm text-text-primary leading-relaxed">{transcription}</p>
                  ) : (
                    <p className="text-xs text-text-muted font-mono">Awaiting input…</p>
                  )}
                </div>
              </div>

              {/* Shortcuts */}
              <div className="glass-sm rounded-xl p-4 flex flex-col gap-2">
                <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest font-mono">Shortcuts</p>
                <div className="flex-1 space-y-2">
                  {[
                    ['Space', 'Toggle mic'],
                    ['Esc', 'Cancel'],
                    ['Enter', 'Send query'],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">{label}</span>
                      <kbd className="text-2xs font-mono bg-surface border border-border px-1.5 py-0.5 rounded text-text-secondary">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
