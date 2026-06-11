import { useState } from 'react'
import { FileText, CheckSquare, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
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
    if (id === 'active')  return todos.filter(t => ['todo', 'in-progress'].includes(t.status)).length
    if (id === 'backlog') return todos.filter(t => t.status === 'backlog').length
    if (id === 'done')    return todos.filter(t => ['done', 'cancelled'].includes(t.status)).length
    return 0
  }

  return (
    <aside className="flex flex-col w-60 min-w-[240px] h-full bg-surface-raised border-r border-surface-border select-none overflow-y-auto flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-surface-border">
        <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">N</div>
        <span className="font-semibold text-ink text-sm">Notsy</span>
      </div>

      {/* NOTES */}
      <div className="mt-3">
        <SectionHeader
          icon={<FileText size={12} />}
          label="Notes"
          open={notesOpen}
          onToggle={() => setNotesOpen(v => !v)}
          onAdd={() => { createNote(); setView('notes') }}
        />
        {notesOpen && (
          <div className="mt-0.5 pb-1">
            {notes.map(note => (
              <SidebarItem
                key={note.id}
                label={note.title || 'Untitled Note'}
                active={view === 'notes' && activeNoteId === note.id}
                onClick={() => { openNote(note.id); setView('notes') }}
                onDelete={notes.length > 1 ? () => deleteNote(note.id) : null}
              />
            ))}
            <button
              onClick={() => { createNote(); setView('notes') }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-ink-faint hover:text-ink-muted hover:bg-surface-hover transition-colors rounded-md mx-1"
              style={{ width: 'calc(100% - 8px)' }}
            >
              <Plus size={12} /> New note
            </button>
          </div>
        )}
      </div>

      <div className="mx-3 my-2 border-t border-surface-border" />

      {/* TODOS */}
      <div>
        <SectionHeader
          icon={<CheckSquare size={12} />}
          label="Todos"
          open={todosOpen}
          onToggle={() => setTodosOpen(v => !v)}
        />
        {todosOpen && (
          <div className="mt-0.5 pb-1">
            {TODO_FILTERS.map(f => (
              <SidebarItem
                key={f.id}
                label={f.label}
                badge={filterCount(f.id)}
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

function SectionHeader({ icon, label, open, onToggle, onAdd }) {
  return (
    <div className="group flex items-center justify-between px-3 py-1 cursor-pointer" onClick={onToggle}>
      <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-faint uppercase tracking-widest">
        {icon}
        {label}
      </span>
      <span className="flex items-center gap-0.5 text-ink-faint">
        {onAdd && (
          <span
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-surface-overlay hover:text-ink transition-all"
            onClick={(e) => { e.stopPropagation(); onAdd() }}
            title={`New ${label.toLowerCase().slice(0, -1)}`}
          >
            <Plus size={11} />
          </span>
        )}
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </span>
    </div>
  )
}

function SidebarItem({ label, active, onClick, onDelete, badge }) {
  return (
    <div
      className={`group flex items-center justify-between px-3 py-1.5 rounded-md mx-1 cursor-pointer transition-colors
        ${active ? 'bg-surface-overlay text-ink' : 'text-ink-muted hover:bg-surface-hover hover:text-ink'}`}
      style={{ width: 'calc(100% - 8px)' }}
      onClick={onClick}
    >
      <span className="truncate text-sm">{label}</span>
      <span className="flex items-center gap-1 flex-shrink-0">
        {badge !== undefined && (
          <span className="text-xs text-ink-faint">{badge || ''}</span>
        )}
        {onDelete && (
          <button
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 transition-all"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            title="Delete"
          >
            <Trash2 size={11} />
          </button>
        )}
      </span>
    </div>
  )
}
