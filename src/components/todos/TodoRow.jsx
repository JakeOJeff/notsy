import { useState, useRef } from 'react'
import { GripVertical, Trash2, PencilIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/badge'
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent,
  ContextMenuItem, ContextMenuLabel, ContextMenuSeparator,
  ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent,
  ContextMenuRadioGroup, ContextMenuRadioItem,
  ContextMenuCheckboxItem,
} from '../ui/context-menu'
import { StatusIcon, PriorityIcon } from './Icons'
import { useTodosStore, STATUS_CONFIG, PRIORITY_CONFIG, LABEL_OPTIONS, LABEL_VARIANT } from '../../store/useTodosStore'

export default function TodoRow({ todo, active, onClick, draggingId, onDragStart, onDragEnd }) {
  const updateTodo = useTodosStore(s => s.updateTodo)
  const deleteTodo = useTodosStore(s => s.deleteTodo)
  const [editing, setEditing] = useState(false)
  const [title,   setTitle]   = useState(todo.title)
  const inputRef  = useRef(null)
  const isDragging = draggingId === todo.id

  const commitTitle = () => {
    setEditing(false)
    if (title.trim()) updateTodo(todo.id, { title: title.trim() })
    else setTitle(todo.title)
  }

  const cycleStatus = (e) => {
    e.stopPropagation()
    const order = ['backlog','todo','in-progress','done','cancelled']
    updateTodo(todo.id, { status: order[(order.indexOf(todo.status) + 1) % order.length] })
  }

  const row = (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('todoId', todo.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(todo.id)
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'group flex items-center gap-2 px-3 h-10 border-b border-border/60 cursor-pointer select-none',
        'transition-colors duration-100',
        active     ? 'bg-accent/50'          : 'hover:bg-accent/30',
        isDragging ? 'opacity-30 scale-[0.99]' : ''
      )}
      onClick={onClick}
    >
      {/* Grip */}
      <span className="shrink-0 opacity-0 group-hover:opacity-30 cursor-grab active:cursor-grabbing text-muted-foreground">
        <GripVertical size={12} />
      </span>

      {/* Priority */}
      <span className="shrink-0 opacity-20 group-hover:opacity-60 transition-opacity">
        <PriorityIcon priority={todo.priority} />
      </span>

      {/* Status — click to cycle */}
      <button
        title={`${STATUS_CONFIG[todo.status]?.label} — click to advance`}
        onClick={cycleStatus}
        className="shrink-0 hover:opacity-70 transition-opacity"
      >
        <StatusIcon status={todo.status} />
      </button>

      {/* ID */}
      <span className="text-[11px] text-muted-foreground/30 font-mono shrink-0 w-[52px]">{todo.id}</span>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter')  commitTitle()
              if (e.key === 'Escape') { setEditing(false); setTitle(todo.title) }
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-6 bg-background border border-ring/50 rounded-lg px-2 text-sm text-foreground outline-none ring-2 ring-ring/20"
          />
        ) : (
          <span
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
            className={cn(
              'text-sm truncate block leading-none',
              todo.status === 'done' || todo.status === 'cancelled'
                ? 'text-muted-foreground/40 line-through'
                : 'text-foreground'
            )}
          >
            {todo.title}
          </span>
        )}
      </div>

      {/* Labels */}
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        {todo.labels.map(l => (
          <Badge key={l} variant={LABEL_VARIANT[l] ?? 'muted'}>{l}</Badge>
        ))}
      </div>
    </div>
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        {/* ── Status ── */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <StatusIcon status={todo.status} size={12} />
            <span>Status</span>
            <span className="ml-auto text-[11px] text-muted-foreground/50 font-normal">
              {STATUS_CONFIG[todo.status]?.label}
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuRadioGroup
              value={todo.status}
              onValueChange={(v) => updateTodo(todo.id, { status: v })}
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <ContextMenuRadioItem key={k} value={k} className="gap-2">
                  <StatusIcon status={k} size={12} />
                  {v.label}
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* ── Priority ── */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <PriorityIcon priority={todo.priority} size={12} />
            <span>Priority</span>
            <span className="ml-auto text-[11px] text-muted-foreground/50 font-normal">
              {PRIORITY_CONFIG[todo.priority]?.label}
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuRadioGroup
              value={todo.priority}
              onValueChange={(v) => updateTodo(todo.id, { priority: v })}
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <ContextMenuRadioItem key={k} value={k} className="gap-2">
                  <PriorityIcon priority={k} size={12} />
                  {v.label}
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* ── Labels ── */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <span className="size-3 rounded bg-muted border border-border shrink-0" />
            <span>Labels</span>
            {todo.labels.length > 0 && (
              <span className="ml-auto text-[11px] text-muted-foreground/50 font-normal">{todo.labels.length}</span>
            )}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            {LABEL_OPTIONS.map(l => (
              <ContextMenuCheckboxItem
                key={l}
                checked={todo.labels.includes(l)}
                onCheckedChange={(v) =>
                  updateTodo(todo.id, {
                    labels: v ? [...todo.labels, l] : todo.labels.filter(x => x !== l),
                  })
                }
                className="gap-2"
              >
                <Badge variant={LABEL_VARIANT[l] ?? 'muted'} className="pointer-events-none">{l}</Badge>
              </ContextMenuCheckboxItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem onSelect={() => setEditing(true)} className="gap-2">
          <PencilIcon size={12} /> Rename
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onSelect={() => deleteTodo(todo.id)}
          className="gap-2 text-destructive data-[highlighted]:text-destructive data-[highlighted]:bg-destructive/10"
        >
          <Trash2 size={12} /> Delete issue
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
