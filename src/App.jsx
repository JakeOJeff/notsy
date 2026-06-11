import { useState } from 'react'
import Sidebar from './components/Sidebar'
import NotesView from './components/notes/NotesView'
import TodosView from './components/todos/TodosView'

export default function App() {
  const [view, setView] = useState('notes')

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-ink">
      <Sidebar view={view} setView={setView} />
      <main className="flex-1 min-w-0 overflow-hidden">
        {view === 'notes' ? <NotesView /> : <TodosView />}
      </main>
    </div>
  )
}
