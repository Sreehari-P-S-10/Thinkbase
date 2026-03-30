import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useStore } from '@/store/useStore'

export default function App() {
  const { isAuthenticated, login } = useStore()

  // --- Demo auto-login (remove in production) ---
  useEffect(() => {
    if (!isAuthenticated) {
      login(
        {
          id: 'demo-user',
          email: 'demo@knowledge-os.ai',
          name: 'Neural User',
          createdAt: new Date().toISOString(),
          preferences: {
            theme: 'dark',
            responseStyle: 'detailed',
            voiceEnabled: true,
            autoSummarize: false,
          },
        },
        'demo-token'
      )
    }
  }, [isAuthenticated, login])

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center bg-neural">
        <div className="glass rounded-2xl p-8 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧠</span>
          </div>
          <p className="text-text-secondary text-sm font-mono">Initializing neural interface…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/*" element={<AppShell />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
