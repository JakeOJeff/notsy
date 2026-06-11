import { useState, useRef, useLayoutEffect } from 'react'
import { useTodosStore, LABEL_COLORS, LABEL_OPTIONS, STATUS_CONFIG, PRIORITY_CONFIG } from '../../store/useTodosStore'
import { StatusIcon, PriorityIcon } from './Icons'
import { Trash2, GripVertical } from 'lucide-react'

export default function TodoRow({ todo, active, onClick, draggingId, onDragStart, onDragEnd }) {
  const updateTodo = useTodosStore(s => s.updateTodo)
  const deleteTodo = useTodosStore(s => s.deleteTodo)
  const [editing, setEditing]   = useState(false)
  const [title, setTitle]       = useState(todo.title)
  const [ctxMenu, setCtxMenu]   = useState(null) // { x, y } or null
  const inputRef = useRef(null)

  const isDragging = draggingId === todo.id

  const commitTitle = () => {
    setEditing(false)
    if (title.trim()) updateTodo(todo.id, { title: title.trim() })
    else setTitle(todo.title)
  }

  const cycleStatus = (e) => {
    e.stopPropagation()
    const order = ['backlog', 'todo', 'in-progress', 'done', 'cancelled']
    const next = order[(order.indexOf(todo.status) + 1) % order.length]
    updateTodo(todo.id, { status: next })
  }

  const openCtx = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCtxMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('todoId', todo.id)
          e.dataTransfer.effectAllowed = 'move'
          onDragStart(todo.id)
        }}
        onDragEnd={onDragEnd}
        onContextMenu={openCtx}
        className={`group flex items-center gap-2 px-3 py-2 border-b border-surface-border cursor-pointer transition-all select-none
          ${active ? 'bg-surface-overlay' : 'hover:bg-surface-hover'}
          ${isDragging ? 'opacity-40' : 'opacity-100'}`}
        onClick={onClick}
      >
        {/* Drag handle */}
        <span className="flex-shrink-0 opacity-0 group-hover:opacity-30 cursor-grab active:cursor-grabbing text-ink-faint">
          <GripVertical size={13} />
        </span>

        {/* Priority */}
        <span className="flex-shrink-0 opacity-40 group-hover:opacity-80 transition-opacity">
          <PriorityIcon priority={todo.priority} />
        </span>

        {/* Status (click to cycle) */}
        <span
          title={`${STATUS_CONFIG[todo.status]?.label} — click to advance`}
          onClick={cycleStatus}
          className="flex-shrink-0 hover:scale-110 transition-transform"
        >
          <StatusIcon status={todo.status} />
        </span>

        {/* ID */}
        <span className="text-xs text-ink-faint font-mono flex-shrink-0 w-14">{todo.id}</span>

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
              className="bg-surface-overlay text-ink text-sm rounded px-1 py-0.5 outline-none border border-accent w-full"
            />
          ) : (
            <span
              className={`text-sm truncate block
                ${todo.status === 'cancelled' || todo.status === 'done' ? 'text-ink-faint line-through' : 'text-ink'}`}
              onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
            >
              {todo.title}
            </span>
          )}
        </div>

        {/* Labels */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          {todo.labels.map(l => (
            <span
              key={l}
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background: (LABEL_COLORS[l] ?? '#555') + '22',
                color: LABEL_COLORS[l] ?? '#888',
                border: `1px solid ${(LABEL_COLORS[l] ?? '#555')}44`,
              }}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Right-click context menu */}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          todo={todo}
          onUpdate={(u) => updateTodo(todo.id, u)}
          onDelete={() => { deleteTodo(todo.id) }}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </>
  )
}

/* ─── Rich fixed-position context menu ─────────────────────────────────── */
function ContextMenu({ x, y, todo, onUpdate, onDelete, onClose }) {
  const menuRef = useRef(null)
  const [pos, setPos] = useState({ x, y })

  // Clamp to viewport after paint so we know the menu's true dimensions
  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    setPos({
      x: x + width  > vw - 8 ? x - width  : x,
      y: y + height > vh - 8 ? y - height : y,
    })
  }, [x, y])

  const toggleLabel = (l) => {
    const labels = todo.labels.includes(l)
      ? todo.labels.filter(x => x !== l)
      : [...todo.labels, l]
    onUpdate({ labels })
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />

      <div
        ref={menuRef}
        style={{ left: pos.x, top: pos.y }}
        className="fixed z-50 w-56 bg-surface-raised border border-surface-border rounded-xl shadow-2xl overflow-hidden py-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Status ── */}
        <Section label="Status" />
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <MenuRow
            key={key}
            active={todo.status === key}
            onClick={() => { onUpdate({ status: key }); onClose() }}
          >
            <StatusIcon status={key} size={12} />
            <span>{cfg.label}</span>
          </MenuRow>
        ))}

        <Divider />

        {/* ── Priority ── */}
        <Section label="Priority" />
        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
          <MenuRow
            key={key}
            active={todo.priority === key}
            onClick={() => { onUpdate({ priority: key }); onClose() }}
          >
            <PriorityIcon priority={key} size={12} />
            <span>{cfg.label}</span>
          </MenuRow>
        ))}

        <Divider />

        {/* ── Labels ── */}
        <Section label="Labels" />
        {LABEL_OPTIONS.map(l => (
          <MenuRow
            key={l}
            active={todo.labels.includes(l)}
            onClick={() => toggleLabel(l)}
            closeOnClick={false}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LABEL_COLORS[l] }} />
            <span className="flex-1">{l}</span>
            {todo.labels.includes(l) && (
              <span className="text-accent text-xs ml-auto">✓</span>
            )}
          </MenuRow>
        ))}

        <Divider />

        {/* ── Delete ── */}
        <button
          onClick={() => { onDelete(); onClose() }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={12} />
          Delete issue
        </button>
      </div>
    </>
  )
}

function Section({ label }) {
  return (
    <div className="px-3 pt-1 pb-0.5 text-[10px] font-semibold text-ink-faint uppercase tracking-widest">
      {label}
    </div>
  )
}

function Divider() {
  return <div className="my-1 border-t border-surface-border" />
}

function MenuRow({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-surface-hover
        ${active ? 'text-ink' : 'text-ink-muted'}`}
    >
      {children}
    </button>
  )
}
