import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NotepadText } from 'lucide-react'
import Sidebar from './components/Sidebar'
import NotesView from './components/notes/NotesView'
import TodosView from './components/todos/TodosView'
import CollabButton from './components/collab/CollabButton'
import RoomPage from './components/collab/RoomPage'

function LocalApp() {
  const [view, setView] = useState('notes')

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Global header */}
      <header className="flex items-center justify-between px-4 h-10 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded-md bg-sidebar-primary flex items-center justify-center shrink-0">
            <NotepadText size={11} className="text-sidebar-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Notsy</span>
        </div>
        <CollabButton />
      </header>

      {/* Sidebar + content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar view={view} setView={setView} />
        <main className="flex-1 min-w-0 overflow-hidden">
          {view === 'notes' ? <NotesView /> : <TodosView />}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <Routes>
        <Route path="/"            element={<LocalApp />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  )
}
