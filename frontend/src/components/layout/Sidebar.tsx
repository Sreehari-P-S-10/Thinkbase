import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, GitFork, FileText, Upload,
  BarChart2, Settings, ChevronLeft, ChevronRight,
  Brain, Plus, Search,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn, formatRelative, truncate } from '@/lib/utils'
import type { ActiveView } from '@/types'

const NAV_ITEMS: { id: ActiveView; icon: React.ElementType; label: string; shortcut: string }[] = [
  { id: 'chat',     icon: MessageSquare, label: 'AI Chat',        shortcut: '1' },
  { id: 'graph',    icon: GitFork,       label: 'Knowledge Graph', shortcut: '2' },
  { id: 'notes',    icon: FileText,      label: 'Notes',           shortcut: '3' },
  { id: 'upload',   icon: Upload,        label: 'Upload Center',   shortcut: '4' },
  { id: 'insights', icon: BarChart2,     label: 'Insights',        shortcut: '5' },
]

export function Sidebar() {
  const {
    sidebarCollapsed, setSidebarCollapsed,
    activeView, setActiveView,
    sessions, activeSessionId, createSession, setActiveSession, deleteSession,
    documents,
    user,
  } = useStore()

  const collapsed = sidebarCollapsed

  return (
    <div className="h-full flex flex-col glass border-r border-border relative overflow-hidden">
      {/* Header */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-border flex-shrink-0',
        collapsed && 'justify-center px-0'
      )}>
        {/* Logo mark */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan/30 to-violet/30 border border-cyan/30 flex items-center justify-center animate-glow-pulse">
            <Brain className="w-4 h-4 text-cyan" />
          </div>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="min-w-0"
            >
              <p className="font-display font-bold text-sm text-text-primary leading-none">
                Knowledge <span className="text-cyan">OS</span>
              </p>
              <p className="text-2xs text-text-muted font-mono mt-0.5">neural interface v1</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className={cn(
            'ml-auto flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center',
            'text-text-muted hover:text-text-primary hover:bg-surface transition-all duration-150',
            collapsed && 'ml-0'
          )}
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 p-2 flex-shrink-0 border-b border-border">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'sidebar-item w-full',
                isActive && 'active',
                collapsed && 'justify-center px-0 py-2.5'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-cyan')} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 text-left"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && (
                <kbd className="hidden group-hover:flex text-2xs text-text-muted font-mono bg-surface px-1.5 py-0.5 rounded">
                  ⌘{item.shortcut}
                </kbd>
              )}
            </button>
          )
        })}
      </nav>

      {/* Recent Sessions (only when expanded + chat active) */}
      <AnimatePresence>
        {!collapsed && activeView === 'chat' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <span className="text-2xs font-semibold text-text-muted uppercase tracking-widest font-mono">
                Sessions
              </span>
              <button
                onClick={() => { createSession(); setActiveView('chat') }}
                className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-cyan hover:bg-cyan/10 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-2 pb-2 space-y-0.5">
              {sessions.length === 0 && (
                <p className="text-2xs text-text-muted px-2 py-3 text-center font-mono">
                  No sessions yet.<br />Start a conversation.
                </p>
              )}
              {sessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => { setActiveSession(sess.id); setActiveView('chat') }}
                  className={cn(
                    'w-full text-left px-2 py-1.5 rounded-md transition-all duration-100 group',
                    sess.id === activeSessionId
                      ? 'bg-surface border border-border text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                  )}
                >
                  <p className="text-xs truncate">{truncate(sess.title, 28)}</p>
                  <p className="text-2xs text-text-muted font-mono mt-0.5">
                    {formatRelative(sess.updatedAt)}
                    {' · '}{sess.messages.length} msg
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Docs (when notes/upload active) */}
      <AnimatePresence>
        {!collapsed && (activeView === 'notes' || activeView === 'upload') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="px-3 pt-3 pb-2">
              <span className="text-2xs font-semibold text-text-muted uppercase tracking-widest font-mono">
                Recent Docs
              </span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-2 pb-2 space-y-0.5">
              {documents.slice(0, 12).map((doc) => (
                <button
                  key={doc.id}
                  className="w-full text-left px-2 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-all duration-100"
                >
                  <p className="text-xs truncate">{doc.title}</p>
                  <p className="text-2xs text-text-muted font-mono mt-0.5 uppercase">{doc.type}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      {!collapsed && activeView !== 'chat' && activeView !== 'notes' && activeView !== 'upload' && (
        <div className="flex-1" />
      )}

      {/* Bottom: User + Settings */}
      <div className={cn(
        'border-t border-border p-2 flex-shrink-0',
        collapsed ? 'flex flex-col items-center gap-1' : 'flex items-center gap-2'
      )}>
        {/* Settings button */}
        <button
          onClick={() => setActiveView('settings')}
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'sidebar-item',
            activeView === 'settings' && 'active',
            collapsed ? 'w-10 justify-center px-0' : 'flex-shrink-0'
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>

        {/* User avatar */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 ml-auto"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan/40 to-violet/40 border border-cyan/20 flex items-center justify-center text-2xs font-bold text-cyan flex-shrink-0">
                {user?.name?.[0] ?? 'N'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary truncate max-w-[90px]">
                  {user?.name ?? 'Neural User'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
