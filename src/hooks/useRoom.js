import { useEffect, useRef, useState, useCallback } from 'react'
import { useNotesStore } from '../store/useNotesStore'
import { useTodosStore } from '../store/useTodosStore'

// Resolve WS URL: env var → same host (for self-hosted prod) → localhost dev fallback
function resolveWsUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host  = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return `ws://localhost:3001`
  return `${proto}//${window.location.host}`
}

const WS_URL = resolveWsUrl()

/**
 * Manages the WebSocket connection to a collab room.
 * While connected, the existing Zustand stores (useNotesStore / useTodosStore)
 * are used as the shared state. On leave, the pre-room local state is restored.
 */
export function useRoom(roomId) {
  const wsRef        = useRef(null)
  const syncingRef   = useRef(false)   // true while applying a server patch (suppress echo)
  const notesTimer   = useRef(null)
  const todosTimer   = useRef(null)
  const savedStorage = useRef(null)    // snapshot of localStorage before room join

  const [users,     setUsers]     = useState([])
  const [connected, setConnected] = useState(false)
  const [error,     setError]     = useState(null)
  const [myId]      = useState(() => crypto.randomUUID())
  const [myColor]   = useState(() => {
    const palette = ['#a78bfa','#34d399','#f87171','#60a5fa','#fbbf24','#f472b6','#4ade80','#fb923c']
    return palette[Math.floor(Math.random() * palette.length)]
  })
  const [myName, setMyNameLocal] = useState(
    () => localStorage.getItem('notsy-collab-name') || ''
  )

  // ── helpers ──────────────────────────────────────────────────────────────
  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  // Debounced patch senders
  const sendNotesPatch = useCallback((notes) => {
    clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(() => send({ type: 'patch', notes }), 250)
  }, [send])

  const sendTodosPatch = useCallback((todos) => {
    clearTimeout(todosTimer.current)
    todosTimer.current = setTimeout(() => send({ type: 'patch', todos }), 250)
  }, [send])

  // ── lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return

    // ── 1. Snapshot localStorage so we can restore on leave ──────────────
    savedStorage.current = {
      notes: localStorage.getItem('notsy-notes'),
      todos: localStorage.getItem('notsy-todos'),
    }

    // ── 2. Connect ────────────────────────────────────────────────────────
    let ws
    try {
      ws = new WebSocket(WS_URL)
    } catch (e) {
      setError(`Cannot connect to collaboration server at ${WS_URL}`)
      return
    }
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setError(null)
      ws.send(JSON.stringify({
        type:     'join',
        roomId:   roomId.toUpperCase(),
        clientId: myId,
        name:     myName,
        color:    myColor,
      }))
    }

    ws.onmessage = ({ data }) => {
      let msg
      try { msg = JSON.parse(data) } catch { return }

      syncingRef.current = true

      if (msg.type === 'welcome') {
        const firstId = msg.notes?.[0]?.id ?? null
        useNotesStore.setState({
          notes:       msg.notes  ?? [],
          openTabIds:  firstId ? [firstId] : [],
          activeNoteId: firstId,
        })
        useTodosStore.setState({ todos: msg.todos ?? [], activeTodoId: null })
        setUsers(msg.users ?? [])
      }

      if (msg.type === 'patch') {
        if (Array.isArray(msg.notes)) {
          useNotesStore.setState(s => {
            // Keep tabs that still exist; add first note if no open tabs remain
            const alive = s.openTabIds.filter(id => msg.notes.some(n => n.id === id))
            const open  = alive.length ? alive : (msg.notes[0] ? [msg.notes[0].id] : [])
            const active = open.includes(s.activeNoteId) ? s.activeNoteId : (open[0] ?? null)
            return { notes: msg.notes, openTabIds: open, activeNoteId: active }
          })
        }
        if (Array.isArray(msg.todos)) {
          useTodosStore.setState(s => ({
            todos: msg.todos,
            activeTodoId: msg.todos.some(t => t.id === s.activeTodoId) ? s.activeTodoId : null,
          }))
        }
      }

      if (msg.type === 'users')      setUsers(msg.users ?? [])
      if (msg.type === 'user-join')  setUsers(u => [...u.filter(x => x.id !== msg.user?.id), msg.user])
      if (msg.type === 'user-leave') setUsers(u => u.filter(x => x.id !== msg.userId))

      syncingRef.current = false
    }

    ws.onerror = () => setError(`Lost connection to collaboration server.`)
    ws.onclose = () => { setConnected(false) }

    // ── 3. Subscribe to store changes → send patches ──────────────────────
    const unsubNotes = useNotesStore.subscribe((state) => {
      if (syncingRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return
      sendNotesPatch(state.notes)
    })

    const unsubTodos = useTodosStore.subscribe((state) => {
      if (syncingRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return
      sendTodosPatch(state.todos)
    })

    // ── 4. Cleanup: restore local state on leave ──────────────────────────
    return () => {
      clearTimeout(notesTimer.current)
      clearTimeout(todosTimer.current)
      unsubNotes()
      unsubTodos()
      ws.close()
      wsRef.current = null

      if (savedStorage.current) {
        // Restore localStorage so the persist middleware re-hydrates correctly
        if (savedStorage.current.notes) localStorage.setItem('notsy-notes', savedStorage.current.notes)
        else                            localStorage.removeItem('notsy-notes')
        if (savedStorage.current.todos) localStorage.setItem('notsy-todos', savedStorage.current.todos)
        else                            localStorage.removeItem('notsy-todos')

        // Rehydrate stores from the restored localStorage snapshot
        useNotesStore.persist?.rehydrate?.()
        useTodosStore.persist?.rehydrate?.()
      }
    }
  }, [roomId]) // eslint-disable-line

  const changeName = useCallback((name) => {
    const trimmed = name.slice(0, 40)
    setMyNameLocal(trimmed)
    localStorage.setItem('notsy-collab-name', trimmed)
    send({ type: 'set-name', name: trimmed })
  }, [send])

  return { users, connected, error, myId, myName, myColor, changeName }
}
