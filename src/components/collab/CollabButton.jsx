import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import RoomModal from './RoomModal'

export default function CollabButton() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleJoin = (roomId) => {
    setOpen(false)
    navigate(`/room/${roomId.trim().toUpperCase()}`)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Collaborate"
        className={cn(
          'flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs font-medium transition-colors',
          'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border'
        )}
      >
        <Users2 size={13} />
        <span className="hidden sm:inline">Collaborate</span>
      </button>

      {open && <RoomModal onJoin={handleJoin} onClose={() => setOpen(false)} />}
    </>
  )
}
