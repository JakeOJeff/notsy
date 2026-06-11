import { useState } from 'react'
import { useTodosStore, STATUS_CONFIG } from '../../store/useTodosStore'
import { StatusIcon } from './Icons'
import TodoRow from './TodoRow'
import { ChevronRight, ChevronDown, Plus } from 'lucide-react'

export default function TodoGroup({ status, todos, activeTodoId, onSelectTodo, onNewIssue, draggingId, onDragStart, onDragEnd }) {
  const collapsed      = useTodosStore(s => s.collapsedGroups.includes(status))
  const toggleCollapse = useTodosStore(s => s.toggleGroupCollapse)
  const updateTodo     = useTodosStore(s => s.updateTodo)
  const cfg            = STATUS_CONFIG[status]

  const [dragOver, setDragOver] = useState(false)

  const isDragging  = draggingId !== null
  const hasItems    = todos.length > 0
  const showBody    = !collapsed && (hasItems || isDragging)

  // Hide empty groups entirely when nothing is being dragged
  if (!hasItems && !isDragging) return null

  /* ── drag event handlers ── */
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    // Only clear if leaving the group container entirely
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const id = e.dataTransfer.getData('todoId')
    if (id) updateTodo(id, { status })
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-colors ${dragOver ? 'bg-accent/5 ring-1 ring-inset ring-accent/20' : ''}`}
    >
      {/* Group header */}
      <div
        className="group flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-surface-hover transition-colors border-b border-surface-border sticky top-0 bg-surface z-10"
        onClick={() => toggleCollapse(status)}
      >
        <span className="text-ink-faint">
          {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </span>
        <StatusIcon status={status} size={13} />
        <span className="text-sm font-medium text-ink">{cfg.label}</span>
        <span className="text-xs text-ink-faint bg-surface-overlay px-1.5 py-0.5 rounded-full">{todos.length}</span>
        <span className="flex-1" />
        <button
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-ink-faint hover:text-ink px-1.5 py-0.5 rounded hover:bg-surface-border transition-all"
          onClick={(e) => { e.stopPropagation(); onNewIssue(status) }}
          title="New issue in this group"
        >
          <Plus size={11} /> Add
        </button>
      </div>

      {/* Rows */}
      {showBody && (
        <div>
          {todos.map(todo => (
            <TodoRow
              key={todo.id}
              todo={todo}
              active={todo.id === activeTodoId}
              onClick={() => onSelectTodo(todo.id)}
              draggingId={draggingId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))}

          {/* Empty drop zone shown only while dragging */}
          {!hasItems && isDragging && (
            <div className={`flex items-center justify-center py-5 text-xs transition-colors
              ${dragOver ? 'text-accent' : 'text-ink-faint'}`}
            >
              {dragOver ? `Move here → ${cfg.label}` : 'Drop issue here'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
