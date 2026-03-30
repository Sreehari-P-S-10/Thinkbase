import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2, TrendingUp, TrendingDown, Minus,
  Brain, FileText, MessageSquare, Zap, Target,
  BookOpen, Award, ChevronRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

// ─── Mock insight data ────────────────────────────────────────────────────────

const STREAK_DATA = [
  { date: 'Mon', queries: 4,  docs: 1 },
  { date: 'Tue', queries: 7,  docs: 2 },
  { date: 'Wed', queries: 3,  docs: 0 },
  { date: 'Thu', queries: 12, docs: 3 },
  { date: 'Fri', queries: 8,  docs: 1 },
  { date: 'Sat', queries: 15, docs: 2 },
  { date: 'Sun', queries: 6,  docs: 1 },
]

const TOPIC_DATA = [
  { topic: 'Transformers',   count: 18, trend: 'rising'  },
  { topic: 'RAG',            count: 14, trend: 'rising'  },
  { topic: 'Embeddings',     count: 11, trend: 'stable'  },
  { topic: 'Vector DBs',     count: 9,  trend: 'stable'  },
  { topic: 'Fine-tuning',    count: 6,  trend: 'falling' },
  { topic: 'Neural Nets',    count: 4,  trend: 'falling' },
]

const RADAR_DATA = [
  { topic: 'Transformers', score: 85 },
  { topic: 'RAG',          score: 70 },
  { topic: 'Embeddings',   score: 60 },
  { topic: 'Agents',       score: 35 },
  { topic: 'Fine-tuning',  score: 45 },
  { topic: 'Evaluation',   score: 25 },
]

const ROADMAP = [
  { id: 'r1', topic: 'Evaluation & Benchmarking', steps: 4, done: 1, level: 'Weak' },
  { id: 'r2', topic: 'Agentic Systems',           steps: 6, done: 2, level: 'Learning' },
  { id: 'r3', topic: 'Fine-tuning LLMs',          steps: 5, done: 2, level: 'Learning' },
]

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="glass-sm rounded-xl p-4 flex items-start gap-3">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-2xs text-text-muted font-mono uppercase tracking-widest">{label}</p>
        <p className="font-display font-bold text-xl text-text-primary mt-0.5">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Trend icon ───────────────────────────────────────────────────────────────
function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'rising')  return <TrendingUp   className="w-3.5 h-3.5 text-emerald-400" />
  if (trend === 'falling') return <TrendingDown  className="w-3.5 h-3.5 text-rose-400" />
  return <Minus className="w-3.5 h-3.5 text-text-muted" />
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; dataKey: string}>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs border border-border">
      <p className="font-mono text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-text-primary">
          {p.dataKey === 'queries' ? '🔍 ' : '📄 '}{p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Main InsightsView ────────────────────────────────────────────────────────
export function InsightsView() {
  const { documents, sessions } = useStore()
  const totalQueries = sessions.reduce((acc, s) => acc + s.messages.filter(m => m.role === 'user').length, 0)

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border flex-shrink-0 glass">
        <BarChart2 className="w-4 h-4 text-cyan" />
        <h1 className="font-display font-semibold text-sm text-text-primary">Insights Dashboard</h1>
        <span className="text-2xs font-mono text-text-muted ml-1">Last 7 days</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-6xl mx-auto space-y-5">

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={FileText}      label="Documents"    value={documents.length}  sub="indexed & searchable" color="bg-rose-500/10 text-rose-400" />
            <StatCard icon={MessageSquare} label="Queries"      value={totalQueries || 28} sub="this session"          color="bg-cyan/10 text-cyan" />
            <StatCard icon={Brain}         label="Topics"       value={18}                sub="in knowledge graph"    color="bg-violet/10 text-violet-400" />
            <StatCard icon={Zap}           label="Avg Response" value="1.2s"              sub="processing time"       color="bg-amber-500/10 text-amber-400" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Activity chart */}
            <div className="col-span-2 glass-sm rounded-xl p-4">
              <p className="text-xs font-semibold text-text-secondary mb-4 font-mono">Learning Activity (7 days)</p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={STREAK_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="queriesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="docsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="queries" stroke="#00d4ff" strokeWidth={1.5} fill="url(#queriesGrad)" />
                  <Area type="monotone" dataKey="docs"    stroke="#7c3aed" strokeWidth={1.5} fill="url(#docsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-0.5 bg-cyan rounded" />
                  <span className="text-2xs text-text-muted font-mono">Queries</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-0.5 bg-violet-500 rounded" />
                  <span className="text-2xs text-text-muted font-mono">Documents added</span>
                </div>
              </div>
            </div>

            {/* Knowledge radar */}
            <div className="glass-sm rounded-xl p-4">
              <p className="text-xs font-semibold text-text-secondary mb-2 font-mono">Knowledge Coverage</p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <PolarGrid stroke="#1e3a6a" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'IBM Plex Mono' }} />
                  <Radar dataKey="score" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Topics + Roadmap */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top topics */}
            <div className="glass-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-text-secondary font-mono">Most Explored Topics</p>
                <Target className="w-4 h-4 text-text-muted" />
              </div>
              <div className="space-y-2.5">
                {TOPIC_DATA.map((t, i) => (
                  <div key={t.topic} className="flex items-center gap-2.5">
                    <span className="text-2xs text-text-muted font-mono w-4 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-primary">{t.topic}</span>
                        <div className="flex items-center gap-1">
                          <TrendIcon trend={t.trend} />
                          <span className="text-2xs text-text-muted font-mono">{t.count}x</span>
                        </div>
                      </div>
                      <div className="h-1 bg-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(t.count / TOPIC_DATA[0].count) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan to-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning roadmap */}
            <div className="glass-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-text-secondary font-mono">Suggested Roadmap</p>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-3">
                {ROADMAP.map((r) => {
                  const pct = Math.round((r.done / r.steps) * 100)
                  return (
                    <div key={r.id} className="glass rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-semibold text-text-primary">{r.topic}</p>
                          <span className={cn(
                            'text-2xs font-mono',
                            r.level === 'Weak' ? 'text-rose-400' : 'text-amber-400'
                          )}>
                            {r.level} area
                          </span>
                        </div>
                        <button className="text-text-muted hover:text-cyan transition-colors">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-2xs text-text-muted font-mono flex-shrink-0">
                          {r.done}/{r.steps}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button className="w-full mt-3 text-xs text-cyan font-mono hover:underline text-center">
                Generate full roadmap →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
