import { useState } from 'react'
import { FileText, CheckSquare, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { Separator } from './ui/separator'
import { useNotesStore } from '../store/useNotesStore'
import { useTodosStore } from '../store/useTodosStore'

const TODO_FILTERS = [
  { id: 'all',     label: 'All Issues' },
  { id: 'active',  label: 'Active' },
  { id: 'backlog', label: 'Backlog' },
  { id: 'done',    label: 'Completed' },
]

export default function Sidebar({ view, setView }) {
  const [notesOpen, setNotesOpen] = useState(true)
  const [todosOpen, setTodosOpen] = useState(true)

  const notes        = useNotesStore(s => s.notes)
  const activeNoteId = useNotesStore(s => s.activeNoteId)
  const openNote     = useNotesStore(s => s.openNote)
  const createNote   = useNotesStore(s => s.createNote)
  const deleteNote   = useNotesStore(s => s.deleteNote)

  const todos        = useTodosStore(s => s.todos)
  const statusFilter = useTodosStore(s => s.statusFilter)
  const setFilter    = useTodosStore(s => s.setStatusFilter)

  const filterCount = (id) => {
    if (id === 'all')     return todos.length
    if (id === 'active')  return todos.filter(t => ['todo','in-progress'].includes(t.status)).length
    if (id === 'backlog') return todos.filter(t => t.status === 'backlog').length
    if (id === 'done')    return todos.filter(t => ['done','cancelled'].includes(t.status)).length
    return 0
  }

  return (
    <aside className="flex flex-col w-56 shrink-0 h-full bg-sidebar border-r border-sidebar-border overflow-y-auto">
      <div className="flex flex-col py-2 flex-1 overflow-y-auto gap-0.5">
        {/* ── Notes ── */}
        <SectionLabel
          icon={<FileText size={11} />}
          label="Notes"
          open={notesOpen}
          onToggle={() => setNotesOpen(v => !v)}
          onAdd={() => { createNote(); setView('notes') }}
        />

        {notesOpen && (
          <div className="mb-1 px-2">
            {notes.map(note => (
              <SidebarItem
                key={note.id}
                label={note.title || 'Untitled Note'}
                active={view === 'notes' && activeNoteId === note.id}
                onClick={() => { openNote(note.id); setView('notes') }}
                onDelete={notes.length > 1 ? (e) => { e.stopPropagation(); deleteNote(note.id) } : null}
              />
            ))}
            <button
              onClick={() => { createNote(); setView('notes') }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
            >
              <Plus size={11} />
              New note
            </button>
          </div>
        )}

        <div className="px-3 my-1">
          <Separator className="bg-sidebar-border" />
        </div>

        {/* ── Todos ── */}
        <SectionLabel
          icon={<CheckSquare size={11} />}
          label="Todos"
          open={todosOpen}
          onToggle={() => setTodosOpen(v => !v)}
        />

        {todosOpen && (
          <div className="px-2">
            {TODO_FILTERS.map(f => (
              <SidebarItem
                key={f.id}
                label={f.label}
                count={filterCount(f.id)}
                active={view === 'todos' && statusFilter === f.id}
                onClick={() => { setView('todos'); setFilter(f.id) }}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

function SectionLabel({ icon, label, open, onToggle, onAdd }) {
  return (
    <button
      onClick={onToggle}
      className="group flex items-center justify-between w-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
    >
      <span className="flex items-center gap-1.5">{icon}{label}</span>
      <span className="flex items-center gap-0.5">
        {onAdd && (
          <span
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
            onClick={(e) => { e.stopPropagation(); onAdd() }}
          >
            <Plus size={10} />
          </span>
        )}
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
      </span>
    </button>
  )
}

function SidebarItem({ label, active, onClick, onDelete, count }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-sm transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}
    >
      <span className="truncate">{label}</span>
      <span className="flex items-center gap-1 shrink-0">
        {count !== undefined && count > 0 && (
          <span className={cn('text-[11px] tabular-nums', active ? 'text-sidebar-foreground/60' : 'text-sidebar-foreground/30')}>
            {count}
          </span>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-all"
          >
            <Trash2 size={10} />
          </button>
        )}
      </span>
    </div>
  )
}
