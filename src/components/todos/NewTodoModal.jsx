import { useState, useEffect, useRef } from 'react'
import { useTodosStore, STATUS_CONFIG, PRIORITY_CONFIG, LABEL_OPTIONS, LABEL_COLORS } from '../../store/useTodosStore'
import { StatusIcon, PriorityIcon } from './Icons'
import { X } from 'lucide-react'

export default function NewTodoModal({ defaultStatus = 'todo', onClose }) {
  const createTodo = useTodosStore(s => s.createTodo)
  const [title,    setTitle]    = useState('')
  const [status,   setStatus]   = useState(defaultStatus)
  const [priority, setPriority] = useState('no-priority')
  const [labels,   setLabels]   = useState([])
  const [desc,     setDesc]     = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const submit = () => {
    if (!title.trim()) return
    createTodo({ title: title.trim(), status, priority, labels, description: desc })
    onClose()
  }

  const toggleLabel = (l) =>
    setLabels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-raised border border-surface-border rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <span className="text-sm font-semibold text-ink">New Issue</span>
          <button onClick={onClose} className="text-ink-faint hover:text-ink transition-colors p-1 rounded hover:bg-surface-overlay">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Issue title"
            className="w-full bg-transparent text-ink text-base font-medium placeholder-ink-faint outline-none border-none"
          />

          {/* Description */}
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Add a description…"
            rows={3}
            className="w-full bg-surface-overlay border border-surface-border rounded-md text-sm text-ink-muted placeholder-ink-faint outline-none resize-none p-2 focus:border-accent/50 transition-colors"
          />

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-2 pt-1">
            {/* Status */}
            <Dropdown
              trigger={
                <span className="flex items-center gap-1.5 text-xs text-ink-muted bg-surface-overlay border border-surface-border rounded-md px-2 py-1 hover:border-accent/40 transition-colors cursor-pointer">
                  <StatusIcon status={status} size={12} />
                  {STATUS_CONFIG[status]?.label}
                </span>
              }
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <button key={k} onClick={() => setStatus(k)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors text-left">
                  <StatusIcon status={k} size={12} /> {v.label}
                </button>
              ))}
            </Dropdown>

            {/* Priority */}
            <Dropdown
              trigger={
                <span className="flex items-center gap-1.5 text-xs text-ink-muted bg-surface-overlay border border-surface-border rounded-md px-2 py-1 hover:border-accent/40 transition-colors cursor-pointer">
                  <PriorityIcon priority={priority} size={12} />
                  {PRIORITY_CONFIG[priority]?.label}
                </span>
              }
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <button key={k} onClick={() => setPriority(k)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors text-left">
                  <PriorityIcon priority={k} size={12} /> {v.label}
                </button>
              ))}
            </Dropdown>

            {/* Labels */}
            <Dropdown
              trigger={
                <span className="flex items-center gap-1.5 text-xs text-ink-muted bg-surface-overlay border border-surface-border rounded-md px-2 py-1 hover:border-accent/40 transition-colors cursor-pointer">
                  {labels.length === 0 ? 'Labels' : labels.join(', ')}
                </span>
              }
            >
              {LABEL_OPTIONS.map(l => (
                <button key={l} onClick={() => toggleLabel(l)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface-hover transition-colors text-left">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LABEL_COLORS[l] }} />
                  <span className={labels.includes(l) ? 'text-ink font-medium' : 'text-ink-muted'}>{l}</span>
                  {labels.includes(l) && <span className="ml-auto text-accent text-xs">✓</span>}
                </button>
              ))}
            </Dropdown>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-surface-border bg-surface">
          <button onClick={onClose}  className="px-3 py-1.5 text-sm text-ink-muted hover:text-ink transition-colors rounded-md hover:bg-surface-overlay">Cancel</button>
          <button
            onClick={submit}
            disabled={!title.trim()}
            className="px-4 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            Create issue
          </button>
        </div>
      </div>
    </div>
  )
}

function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <div onClick={() => setOpen(v => !v)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-surface-raised border border-surface-border rounded-lg shadow-2xl py-1 min-w-[140px]" onClick={() => setOpen(false)}>
            {children}
          </div>
        </>
      )}
    </div>
  )
}
