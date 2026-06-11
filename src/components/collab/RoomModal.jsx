import { useState, useEffect, useRef } from 'react'
import { X, Plus, LogIn } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

function generateRoomCode() {
  return crypto.randomUUID().split('-')[0].toUpperCase()
}

export default function RoomModal({ onJoin, onClose }) {
  const [tab,    setTab]    = useState('create')  // 'create' | 'join'
  const [code,   setCode]   = useState(() => generateRoomCode())
  const [input,  setInput]  = useState('')
  const joinRef  = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (tab === 'join') setTimeout(() => joinRef.current?.focus(), 40)
  }, [tab])

  const handleCreate = () => onJoin(code)
  const handleJoin   = () => {
    const trimmed = input.trim().toUpperCase()
    if (!trimmed) return
    onJoin(trimmed)
  }

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-foreground">Collaborate</h2>
          <button onClick={onClose} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1 rounded-lg hover:bg-muted">
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-5 mb-4 bg-muted rounded-lg p-0.5">
          {[['create', <Plus size={12} />, 'Create room'], ['join', <LogIn size={12} />, 'Join room']].map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all',
                tab === id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          {tab === 'create' ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Room code
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm text-foreground tracking-widest">
                    {code}
                  </div>
                  <button
                    onClick={() => setCode(generateRoomCode())}
                    title="Regenerate"
                    className="text-[11px] text-muted-foreground hover:text-foreground px-2.5 py-2 rounded-lg hover:bg-muted border border-border transition-colors"
                  >
                    New
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground/50 mt-1.5">
                  Share this code with anyone you want to collaborate with.
                </p>
              </div>
              <Button className="w-full" onClick={handleCreate}>
                <Plus size={13} /> Create room
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Enter room code
                </label>
                <input
                  ref={joinRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="e.g. A1B2C3D4"
                  maxLength={16}
                  className={cn(
                    'w-full bg-muted border border-input rounded-lg px-3 py-2',
                    'font-mono text-sm text-foreground tracking-widest uppercase placeholder:normal-case placeholder:text-muted-foreground/40',
                    'outline-none focus:ring-2 focus:ring-ring/30 focus:bg-background transition-all'
                  )}
                />
              </div>
              <Button className="w-full" onClick={handleJoin} disabled={!input.trim()}>
                <LogIn size={13} /> Join room
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
