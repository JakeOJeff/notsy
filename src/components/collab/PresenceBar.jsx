import { useState, useRef, useEffect } from 'react'
import { Copy, Check, Wifi, WifiOff } from 'lucide-react'
import { cn } from '../../lib/utils'

function Avatar({ user, isSelf }) {
  return (
    <div
      title={user.name || 'Anonymous'}
      className={cn(
        'size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0',
        isSelf && 'ring-2 ring-offset-1 ring-offset-background'
      )}
      style={{ background: user.color, ringColor: user.color }}
    >
      {(user.name || '?')[0].toUpperCase()}
    </div>
  )
}

export default function PresenceBar({ roomId, users, connected, error, myId, myName, myColor, onChangeName }) {
  const [copied,    setCopied]    = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [nameInput, setNameInput] = useState(myName)
  const inputRef = useRef(null)

  useEffect(() => { setNameInput(myName) }, [myName])
  useEffect(() => { if (editing) setTimeout(() => inputRef.current?.focus(), 30) }, [editing])

  const copyCode = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const commitName = () => {
    const trimmed = nameInput.trim()
    if (trimmed) onChangeName(trimmed)
    setEditing(false)
  }

  const others  = users.filter(u => u.id !== myId)
  const selfUser = users.find(u => u.id === myId) ?? { id: myId, name: myName, color: myColor }

  return (
    <div className="flex items-center gap-3 px-4 h-10 border-b border-border bg-card shrink-0">

      {/* Connection indicator */}
      <div className={cn('flex items-center gap-1.5 shrink-0', connected ? 'text-green-400' : 'text-muted-foreground/40')}>
        {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
        <span className="text-[11px] hidden sm:inline">{connected ? 'Live' : 'Connecting…'}</span>
      </div>

      {/* Room code */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground/40 hidden sm:inline">Room</span>
        <span className="font-mono text-xs text-foreground/70 tracking-wider">{roomId}</span>
        <button
          onClick={copyCode}
          title="Copy room code"
          className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-0.5 rounded"
        >
          {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
        </button>
      </div>

      <div className="flex-1" />

      {/* Error banner */}
      {error && (
        <span className="text-[11px] text-destructive truncate max-w-48">{error}</span>
      )}

      {/* Other users */}
      {others.length > 0 && (
        <div className="flex items-center -space-x-1">
          {others.slice(0, 5).map(u => <Avatar key={u.id} user={u} isSelf={false} />)}
          {others.length > 5 && (
            <div className="size-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] text-muted-foreground">
              +{others.length - 5}
            </div>
          )}
        </div>
      )}

      {/* Self — click to rename */}
      {editing ? (
        <input
          ref={inputRef}
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setNameInput(myName); setEditing(false) } }}
          maxLength={40}
          className="w-28 bg-background border border-ring/50 rounded-lg px-2 py-0.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring/30 transition-all"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          title="Click to change your name"
          className="flex items-center gap-1.5 group"
        >
          <Avatar user={selfUser} isSelf />
          <span className="text-xs text-foreground/70 group-hover:text-foreground transition-colors hidden sm:inline">
            {myName || 'Set name'}
          </span>
        </button>
      )}
    </div>
  )
}
