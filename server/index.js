import { WebSocketServer } from 'ws'
import { createServer } from 'http'

const PORT = process.env.PORT || 3001
const httpServer = createServer()
const wss = new WebSocketServer({ server: httpServer })

// ── In-memory rooms ──────────────────────────────────────────────────────────
// Map<roomId, { notes: [], todos: [], clients: Map<clientId, ClientEntry> }>
const rooms = new Map()

const COLORS = ['#a78bfa','#34d399','#f87171','#60a5fa','#fbbf24','#f472b6','#4ade80','#fb923c']
const pickColor = (i) => COLORS[i % COLORS.length]

function getOrCreateRoom(roomId) {
  if (rooms.has(roomId)) return rooms.get(roomId)
  const sharedNote = {
    id: `note-${Date.now()}`,
    title: 'Shared Note',
    content: '<p>Everyone in this room can edit this note in real time.</p>',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const room = { notes: [sharedNote], todos: [], clients: new Map() }
  rooms.set(roomId, room)
  return room
}

function usersSnapshot(room) {
  return [...room.clients.values()].map(({ id, name, color }) => ({ id, name, color }))
}

function broadcast(room, msg, excludeId = null) {
  const json = JSON.stringify(msg)
  for (const [id, client] of room.clients) {
    if (id !== excludeId && client.ws.readyState === 1 /* OPEN */) {
      client.ws.send(json)
    }
  }
}

// ── Connection handler ────────────────────────────────────────────────────────
wss.on('connection', (ws) => {
  let roomId = null
  let clientId = null
  let colorIdx = 0

  ws.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }

    // ── join ──
    if (msg.type === 'join') {
      roomId   = String(msg.roomId || '').trim().toUpperCase()
      clientId = String(msg.clientId || crypto.randomUUID())
      if (!roomId) return

      const room = getOrCreateRoom(roomId)
      colorIdx = room.clients.size
      const user = { id: clientId, name: String(msg.name || 'Anonymous').slice(0, 40), color: pickColor(colorIdx), ws }
      room.clients.set(clientId, user)

      ws.send(JSON.stringify({
        type: 'welcome',
        notes: room.notes,
        todos: room.todos,
        users: usersSnapshot(room),
      }))

      broadcast(room, { type: 'user-join', user: { id: clientId, name: user.name, color: user.color } }, clientId)
      return
    }

    if (!roomId || !clientId) return
    const room = rooms.get(roomId)
    if (!room) return

    // ── set-name ──
    if (msg.type === 'set-name') {
      const client = room.clients.get(clientId)
      if (client) {
        client.name = String(msg.name || 'Anonymous').slice(0, 40)
        broadcast(room, { type: 'users', users: usersSnapshot(room) })
      }
      return
    }

    // ── patch  (last-write-wins: server overwrites and rebroadcasts) ──
    if (msg.type === 'patch') {
      if (Array.isArray(msg.notes)) room.notes = msg.notes
      if (Array.isArray(msg.todos)) room.todos = msg.todos
      broadcast(room, {
        type: 'patch',
        notes: msg.notes ?? null,
        todos: msg.todos ?? null,
        from:  clientId,
      }, clientId)
      return
    }

    // ── ping ──
    if (msg.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }))
  })

  ws.on('close', () => {
    if (!roomId || !clientId) return
    const room = rooms.get(roomId)
    if (!room) return
    room.clients.delete(clientId)
    broadcast(room, { type: 'user-leave', userId: clientId })
    // Evict empty rooms after 30 s
    if (room.clients.size === 0) {
      setTimeout(() => {
        if (rooms.get(roomId)?.clients.size === 0) rooms.delete(roomId)
      }, 30_000)
    }
  })

  ws.on('error', () => { /* swallow per-socket errors */ })
})

httpServer.listen(PORT, () => {
  console.log(`\n  Notsy collaboration server\n  ws://localhost:${PORT}\n`)
})
