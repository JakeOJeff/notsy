import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const WELCOME = {
  id: 'note-welcome',
  title: 'Welcome to Notsy',
  content: `<h1>Welcome to Notsy ✨</h1>
<p>A fast, minimal notepad that stays out of your way.</p>
<h2>Features</h2>
<ul>
  <li><strong>Rich text editing</strong> — bold, italic, headings, lists &amp; more</li>
  <li><strong>Multiple notes</strong> — open as many tabs as you need</li>
  <li><strong>Find &amp; Replace</strong> — press <code>Ctrl+H</code></li>
  <li><strong>Todo tracker</strong> — Linear-style issue board in the sidebar</li>
  <li><strong>Auto-save</strong> — everything persists in your browser</li>
</ul>
<h2>Keyboard shortcuts</h2>
<ul>
  <li><code>Ctrl+B</code> — Bold</li>
  <li><code>Ctrl+I</code> — Italic</li>
  <li><code>Ctrl+U</code> — Underline</li>
  <li><code>Ctrl+H</code> — Find &amp; Replace</li>
  <li><code>Ctrl+N</code> — New note</li>
</ul>`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

export const useNotesStore = create(
  persist(
    (set, get) => ({
      notes: [WELCOME],
      openTabIds: [WELCOME.id],
      activeNoteId: WELCOME.id,

      createNote: () => {
        const id = `note-${Date.now()}`
        const note = { id, title: 'Untitled Note', content: '', createdAt: Date.now(), updatedAt: Date.now() }
        set(s => ({ notes: [...s.notes, note], openTabIds: [...s.openTabIds, id], activeNoteId: id }))
        return id
      },

      openNote: (id) => {
        set(s => ({
          openTabIds: s.openTabIds.includes(id) ? s.openTabIds : [...s.openTabIds, id],
          activeNoteId: id,
        }))
      },

      setActiveNote: (id) => set({ activeNoteId: id }),

      closeTab: (id) => {
        set(s => {
          const tabs = s.openTabIds.filter(t => t !== id)
          let active = s.activeNoteId
          if (active === id) {
            const idx = s.openTabIds.indexOf(id)
            active = tabs[Math.min(idx, tabs.length - 1)] ?? null
          }
          return { openTabIds: tabs, activeNoteId: active }
        })
      },

      updateNote: (id, updates) => {
        set(s => ({
          notes: s.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n),
        }))
      },

      deleteNote: (id) => {
        set(s => {
          const notes = s.notes.filter(n => n.id !== id)
          const tabs = s.openTabIds.filter(t => t !== id)
          const active = s.activeNoteId === id ? (tabs[0] ?? null) : s.activeNoteId
          return { notes, openTabIds: tabs, activeNoteId: active }
        })
      },
    }),
    { name: 'notsy-notes' }
  )
)
