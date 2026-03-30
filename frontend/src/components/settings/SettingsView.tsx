import { useState } from 'react'
import { Settings, Eye, EyeOff, Save, Key, Cpu, Database, Sliders, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

// ─── Masked API key input ─────────────────────────────────────────────────────
function ApiKeyInput({
  label, placeholder, value, onChange, hint,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  const [visible, setVisible] = useState(false)
  const [focused, setFocused] = useState(false)

  return (
    <div>
      <label className="block text-xs font-semibold text-text-secondary mb-1.5">
        {label}
      </label>
      <div className={cn(
        'flex items-center gap-2 rounded-lg border bg-surface transition-all duration-150',
        focused ? 'border-cyan ring-1 ring-cyan/20' : 'border-border'
      )}>
        <Key className="w-3.5 h-3.5 text-text-muted ml-3 flex-shrink-0" />
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none font-mono"
        />
        <button
          onClick={() => setVisible(!visible)}
          className="px-3 text-text-muted hover:text-text-primary transition-colors"
          type="button"
        >
          {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      {hint && <p className="text-2xs text-text-muted mt-1 font-mono">{hint}</p>}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode
}) {
  return (
    <div className="glass-sm rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Icon className="w-4 h-4 text-cyan" />
        <h2 className="font-display font-semibold text-sm text-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ─── Main SettingsView ────────────────────────────────────────────────────────
export function SettingsView() {
  const { settings, updateSettings } = useStore()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // In production: await api.updateSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0 glass">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan" />
          <h1 className="font-display font-semibold text-sm text-text-primary">Settings</h1>
        </div>
        <button onClick={handleSave} className={cn('btn-primary', saved && 'bg-emerald-500 hover:bg-emerald-400')}>
          {saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* API Keys */}
          <Section icon={Key} title="API Keys">
            <div className="glass rounded-lg p-3 border border-amber-500/20 bg-amber-500/5 mb-4">
              <p className="text-xs text-amber-400 font-mono">
                ⚠ API keys are stored locally in your browser. Never share this device's storage.
                In production, keys are stored server-side encrypted.
              </p>
            </div>

            <ApiKeyInput
              label="Anthropic API Key"
              placeholder="sk-ant-api03-••••••••••••••••••••••••••••••••"
              value={settings.apiKeys.anthropic ?? ''}
              onChange={(v) => updateSettings({ apiKeys: { ...settings.apiKeys, anthropic: v } })}
              hint="Get your key at console.anthropic.com → API Keys"
            />

            <ApiKeyInput
              label="OpenAI API Key (optional)"
              placeholder="sk-proj-••••••••••••••••••••••••••••••••••••••"
              value={settings.apiKeys.openai ?? ''}
              onChange={(v) => updateSettings({ apiKeys: { ...settings.apiKeys, openai: v } })}
              hint="Required only if using OpenAI models for embeddings or chat"
            />

            <ApiKeyInput
              label="Pinecone API Key (optional)"
              placeholder="pcsk_••••••••••••••••••••••••••••••••••••••••"
              value={settings.apiKeys.pinecone ?? ''}
              onChange={(v) => updateSettings({ apiKeys: { ...settings.apiKeys, pinecone: v } })}
              hint="Required only if vectorDb is set to Pinecone. Default uses local Qdrant."
            />
          </Section>

          {/* LLM Config */}
          <Section icon={Cpu} title="LLM Configuration">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Provider</label>
                <select
                  value={settings.llmProvider}
                  onChange={(e) => updateSettings({ llmProvider: e.target.value as typeof settings.llmProvider })}
                  className="neural-input"
                >
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT)</option>
                  <option value="local">Local (Ollama)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Model</label>
                <select
                  value={settings.llmModel}
                  onChange={(e) => updateSettings({ llmModel: e.target.value })}
                  className="neural-input"
                >
                  {settings.llmProvider === 'anthropic' ? (
                    <>
                      <option value="claude-opus-4-5">Claude Opus 4.5 (Best)</option>
                      <option value="claude-sonnet-4-5">Claude Sonnet 4.5 (Fast)</option>
                    </>
                  ) : settings.llmProvider === 'openai' ? (
                    <>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </>
                  ) : (
                    <>
                      <option value="llama3">Llama 3</option>
                      <option value="mistral">Mistral</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </Section>

          {/* RAG Config */}
          <Section icon={Sliders} title="RAG Pipeline">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Embedding Model</label>
                <select
                  value={settings.embeddingModel}
                  onChange={(e) => updateSettings({ embeddingModel: e.target.value })}
                  className="neural-input"
                >
                  <option value="text-embedding-3-small">text-embedding-3-small (Recommended)</option>
                  <option value="text-embedding-3-large">text-embedding-3-large (Better quality)</option>
                  <option value="text-embedding-ada-002">text-embedding-ada-002 (Legacy)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Vector Database</label>
                <select
                  value={settings.vectorDb}
                  onChange={(e) => updateSettings({ vectorDb: e.target.value as typeof settings.vectorDb })}
                  className="neural-input"
                >
                  <option value="qdrant">Qdrant (Recommended — self-hosted)</option>
                  <option value="pinecone">Pinecone (Managed cloud)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Max Context Chunks: <span className="text-cyan font-mono">{settings.maxContextChunks}</span>
                </label>
                <input
                  type="range" min={1} max={12} step={1}
                  value={settings.maxContextChunks}
                  onChange={(e) => updateSettings({ maxContextChunks: Number(e.target.value) })}
                  className="w-full accent-cyan"
                />
                <div className="flex justify-between text-2xs text-text-muted font-mono mt-0.5">
                  <span>1 (fast)</span><span>12 (thorough)</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Temperature: <span className="text-cyan font-mono">{settings.temperature}</span>
                </label>
                <input
                  type="range" min={0} max={1} step={0.1}
                  value={settings.temperature}
                  onChange={(e) => updateSettings({ temperature: Number(e.target.value) })}
                  className="w-full accent-cyan"
                />
                <div className="flex justify-between text-2xs text-text-muted font-mono mt-0.5">
                  <span>0 (precise)</span><span>1 (creative)</span>
                </div>
              </div>
            </div>
          </Section>

          {/* About */}
          <div className="glass-sm rounded-xl p-4 text-center">
            <p className="text-xs text-text-muted font-mono">
              Knowledge OS v1.0.0 · Built with React, FastAPI, LangChain, Qdrant
            </p>
            <p className="text-2xs text-text-muted font-mono mt-1">
              Session 1 complete · Backend in Session 3
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
