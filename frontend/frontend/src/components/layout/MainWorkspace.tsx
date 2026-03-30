import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { ChatView } from '@/components/chat/ChatView'
import { GraphView } from '@/components/graph/GraphView'
import { NotesView } from '@/components/notes/NotesView'
import { UploadView } from '@/components/upload/UploadView'
import { InsightsView } from '@/components/insights/InsightsView'
import { SettingsView } from '@/components/settings/SettingsView'

const VIEW_MAP = {
  chat:     ChatView,
  graph:    GraphView,
  notes:    NotesView,
  upload:   UploadView,
  insights: InsightsView,
  settings: SettingsView,
} as const

export function MainWorkspace() {
  const { activeView } = useStore()

  const ViewComponent = VIEW_MAP[activeView]

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <ViewComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
