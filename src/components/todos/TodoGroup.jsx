import { useState } from 'react'
import { ChevronRight, ChevronDown, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTodosStore, STATUS_CONFIG } from '../../store/useTodosStore'
import { StatusIcon } from './Icons'
import TodoRow from './TodoRow'

export default function TodoGroup({
  status, todos, activeTodoId, onSelectTodo,
  onNewIssue, draggingId, onDragStart, onDragEnd,
}) {
  const collapsed      = useTodosStore(s => s.collapsedGroups.includes(status))
  const toggleCollapse = useTodosStore(s => s.toggleGroupCollapse)
  const updateTodo     = useTodosStore(s => s.updateTodo)
  const cfg            = STATUS_CONFIG[status]
  const [dragOver, setDragOver] = useState(false)

  const isDragging = draggingId !== null
  const hasItems   = todos.length > 0

  if (!hasItems && !isDragging) return null

  const handleDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(true) }
  const handleDragEnter = (e) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false) }
  const handleDrop      = (e) => {
    e.preventDefault(); setDragOver(false)
    const id = e.dataTransfer.getData('todoId')
    if (id) updateTodo(id, { status })
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'transition-colors duration-150',
        dragOver && 'bg-primary/5 ring-1 ring-inset ring-primary/20'
      )}
    >
      {/* Group header */}
      <div
        onClick={() => toggleCollapse(status)}
        className={cn(
          'group flex items-center gap-2 px-3 h-9 border-b border-border/60',
          'cursor-pointer hover:bg-muted/30 transition-colors sticky top-0 bg-background z-10',
        )}
      >
        <span className="text-muted-foreground/40 shrink-0">
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </span>
        <StatusIcon status={status} size={13} />
        <span className="text-sm font-medium text-foreground">{cfg.label}</span>
        <span className="text-[11px] text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded-md tabular-nums">
          {todos.length}
        </span>
        <span className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); onNewIssue(status) }}
          className={cn(
            'opacity-0 group-hover:opacity-100 flex items-center gap-1',
            'text-[11px] text-muted-foreground hover:text-foreground',
            'px-2 py-1 rounded-lg hover:bg-muted transition-all'
          )}
        >
          <Plus size={10} /> Add
        </button>
      </div>

      {/* Rows */}
      {!collapsed && (
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

          {/* Empty drop zone — only shown while dragging */}
          {!hasItems && isDragging && (
            <div className={cn(
              'flex items-center justify-center py-6 text-xs transition-colors',
              dragOver ? 'text-foreground' : 'text-muted-foreground/30'
            )}>
              {dragOver ? `Move to ${cfg.label}` : 'Drop here'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
