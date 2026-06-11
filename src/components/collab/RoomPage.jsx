import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useRoom } from '../../hooks/useRoom'
import PresenceBar from './PresenceBar'
import Sidebar from '../Sidebar'
import NotesView from '../notes/NotesView'
import TodosView from '../todos/TodosView'

export default function RoomPage() {
  const { roomId } = useParams()
  const navigate   = useNavigate()
  const [view, setView] = useState('notes')

  const { users, connected, error, myId, myName, myColor, changeName } =
    useRoom(roomId)

  const handleLeave = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">

      {/* Top bar: back button + presence */}
      <div className="flex items-center shrink-0 border-b border-border bg-card">
        <button
          onClick={handleLeave}
          className="flex items-center gap-1.5 px-3 h-10 text-xs text-muted-foreground hover:text-foreground transition-colors border-r border-border shrink-0"
        >
          <ArrowLeft size={13} />
          <span className="hidden sm:inline">Leave room</span>
        </button>
        <PresenceBar
          roomId={roomId?.toUpperCase()}
          users={users}
          connected={connected}
          error={error}
          myId={myId}
          myName={myName}
          myColor={myColor}
          onChangeName={changeName}
        />
      </div>

      {/* Main layout — identical to local mode */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar view={view} setView={setView} />
        <main className="flex-1 min-w-0 overflow-hidden">
          {view === 'notes' ? <NotesView /> : <TodosView />}
        </main>
      </div>
    </div>
  )
}
