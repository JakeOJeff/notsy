import { useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useNotesStore } from '../../store/useNotesStore'
import NoteEditor from './NoteEditor'
import { Button } from '../ui/button'

export default function NotesView() {
  const notes        = useNotesStore(s => s.notes)
  const openTabIds   = useNotesStore(s => s.openTabIds)
  const activeNoteId = useNotesStore(s => s.activeNoteId)
  const createNote   = useNotesStore(s => s.createNote)
  const setActive    = useNotesStore(s => s.setActiveNote)
  const closeTab     = useNotesStore(s => s.closeTab)

  const openTabs   = openTabIds.map(id => notes.find(n => n.id === id)).filter(Boolean)
  const activeNote = notes.find(n => n.id === activeNoteId) ?? null

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); createNote() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [createNote])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Tab bar */}
      <div
        className="flex items-end gap-0.5 px-3 pt-2 border-b border-border bg-card overflow-x-auto shrink-0"
        style={{ scrollbarWidth: 'none' }}
      >
        {openTabs.map(note => (
          <Tab
            key={note.id}
            label={note.title || 'Untitled Note'}
            active={note.id === activeNoteId}
            onActivate={() => setActive(note.id)}
            onClose={openTabs.length > 1 ? () => closeTab(note.id) : null}
          />
        ))}
        <button
          onClick={createNote}
          title="New note (Ctrl+N)"
          className="mb-px flex items-center justify-center size-7 shrink-0 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        {activeNote
          ? <NoteEditor key={activeNote.id} note={activeNote} />
          : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <p className="text-sm">No note open</p>
              <Button size="sm" onClick={createNote}>New note</Button>
            </div>
          )
        }
      </div>
    </div>
  )
}

function Tab({ label, active, onActivate, onClose }) {
  return (
    <div
      onClick={onActivate}
      className={cn(
        'group relative flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg cursor-pointer select-none transition-colors shrink-0 max-w-[180px]',
        active
          ? 'bg-background text-foreground border border-border border-b-background -mb-px z-10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
      style={{ minWidth: 90 }}
    >
      <span className="truncate text-xs font-medium">{label}</span>
      {onClose && (
        <button
          onClick={(e) => { e.stopPropagation(); onClose() }}
          className={cn(
            'shrink-0 size-4 flex items-center justify-center rounded transition-colors hover:bg-border',
            active ? 'opacity-50 hover:opacity-100' : 'opacity-0 group-hover:opacity-50 hover:!opacity-100'
          )}
        >
          <X size={10} />
        </button>
      )}
    </div>
  )
}
