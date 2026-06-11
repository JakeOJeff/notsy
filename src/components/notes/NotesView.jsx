import { useRef, useEffect, useState, useCallback } from 'react'
import { useNotesStore } from '../../store/useNotesStore'
import NoteEditor from './NoteEditor'
import { Plus, X } from 'lucide-react'

export default function NotesView() {
  const notes        = useNotesStore(s => s.notes)
  const openTabIds   = useNotesStore(s => s.openTabIds)
  const activeNoteId = useNotesStore(s => s.activeNoteId)
  const createNote   = useNotesStore(s => s.createNote)
  const setActive    = useNotesStore(s => s.setActiveNote)
  const closeTab     = useNotesStore(s => s.closeTab)

  const openTabs = openTabIds.map(id => notes.find(n => n.id === id)).filter(Boolean)
  const activeNote = notes.find(n => n.id === activeNoteId) ?? null

  const tabBarRef = useRef(null)

  // Keyboard: Ctrl+N → new note
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        createNote()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [createNote])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div
        ref={tabBarRef}
        className="flex items-stretch border-b border-surface-border bg-surface-raised overflow-x-auto flex-shrink-0"
        style={{ scrollbarWidth: 'none' }}
      >
        {openTabs.map(note => (
          <Tab
            key={note.id}
            note={note}
            active={note.id === activeNoteId}
            onActivate={() => setActive(note.id)}
            onClose={() => closeTab(note.id)}
            canClose={openTabs.length > 1}
          />
        ))}

        {/* New tab button */}
        <button
          className="flex items-center justify-center px-3 text-ink-faint hover:text-ink hover:bg-surface-hover transition-colors flex-shrink-0 border-r border-surface-border"
          onClick={() => createNote()}
          title="New note (Ctrl+N)"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        {activeNote ? (
          <NoteEditor key={activeNote.id} note={activeNote} />
        ) : (
          <EmptyState onCreate={createNote} />
        )}
      </div>
    </div>
  )
}

function Tab({ note, active, onActivate, onClose, canClose }) {
  return (
    <div
      className={`group flex items-center gap-1.5 px-3 py-2.5 border-r border-surface-border cursor-pointer transition-colors flex-shrink-0 max-w-[180px]
        ${active
          ? 'bg-surface text-ink border-b-2 border-b-accent -mb-px'
          : 'bg-surface-raised text-ink-muted hover:bg-surface-hover hover:text-ink'
        }`}
      onClick={onActivate}
      style={{ minWidth: 100 }}
    >
      <span className="truncate text-sm">{note.title || 'Untitled Note'}</span>
      {canClose && (
        <button
          className={`flex-shrink-0 p-0.5 rounded transition-colors
            ${active
              ? 'opacity-60 hover:opacity-100 hover:bg-surface-border'
              : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-surface-border'
            }`}
          onClick={(e) => { e.stopPropagation(); onClose() }}
          title="Close tab"
        >
          <X size={11} />
        </button>
      )}
    </div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-ink-faint gap-3">
      <p className="text-sm">No note open</p>
      <button
        onClick={onCreate}
        className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
      >
        Create a note
      </button>
    </div>
  )
}
