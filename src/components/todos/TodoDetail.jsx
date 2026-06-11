import { useState } from 'react'
import { useTodosStore, STATUS_CONFIG, PRIORITY_CONFIG, LABEL_OPTIONS, LABEL_COLORS } from '../../store/useTodosStore'
import { StatusIcon, PriorityIcon } from './Icons'
import { X, Trash2, ChevronDown } from 'lucide-react'

export default function TodoDetail({ todoId, onClose }) {
  const todos      = useTodosStore(s => s.todos)
  const updateTodo = useTodosStore(s => s.updateTodo)
  const deleteTodo = useTodosStore(s => s.deleteTodo)
  const setActive  = useTodosStore(s => s.setActiveTodo)

  const todo = todos.find(t => t.id === todoId)
  if (!todo) return null

  const up = (u) => updateTodo(todoId, u)

  const handleDelete = () => {
    deleteTodo(todoId)
    onClose()
  }

  return (
    <aside className="flex flex-col w-80 min-w-[320px] h-full border-l border-surface-border bg-surface-raised overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border sticky top-0 bg-surface-raised z-10">
        <span className="text-xs font-mono text-ink-faint">{todo.id}</span>
        <div className="flex items-center gap-1">
          <button onClick={handleDelete} className="p-1.5 rounded hover:bg-red-500/10 text-ink-faint hover:text-red-400 transition-colors" title="Delete">
            <Trash2 size={13} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-surface-overlay text-ink-faint hover:text-ink transition-colors" title="Close">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pt-4 pb-2">
        <TitleInput value={todo.title} onChange={(v) => up({ title: v })} />
      </div>

      {/* Meta */}
      <div className="px-4 py-2 space-y-1 border-b border-surface-border">
        <MetaRow label="Status">
          <SelectDropdown
            value={todo.status}
            options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
            onChange={(v) => up({ status: v })}
            renderSelected={() => (
              <span className="flex items-center gap-1.5">
                <StatusIcon status={todo.status} size={12} />
                {STATUS_CONFIG[todo.status]?.label}
              </span>
            )}
            renderOption={(k) => (
              <span className="flex items-center gap-1.5">
                <StatusIcon status={k} size={12} />
                {STATUS_CONFIG[k]?.label}
              </span>
            )}
          />
        </MetaRow>

        <MetaRow label="Priority">
          <SelectDropdown
            value={todo.priority}
            options={Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
            onChange={(v) => up({ priority: v })}
            renderSelected={() => (
              <span className="flex items-center gap-1.5">
                <PriorityIcon priority={todo.priority} size={12} />
                {PRIORITY_CONFIG[todo.priority]?.label}
              </span>
            )}
            renderOption={(k) => (
              <span className="flex items-center gap-1.5">
                <PriorityIcon priority={k} size={12} />
                {PRIORITY_CONFIG[k]?.label}
              </span>
            )}
          />
        </MetaRow>

        <MetaRow label="Labels">
          <LabelEditor labels={todo.labels} onChange={(l) => up({ labels: l })} />
        </MetaRow>

        <MetaRow label="Created">
          <span className="text-xs text-ink-muted">
            {new Date(todo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </MetaRow>
      </div>

      {/* Description */}
      <div className="px-4 py-3 flex-1">
        <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-2">Description</p>
        <textarea
          value={todo.description ?? ''}
          onChange={(e) => up({ description: e.target.value })}
          placeholder="Add a description…"
          rows={6}
          className="w-full bg-surface-overlay border border-surface-border rounded-md text-sm text-ink-muted placeholder-ink-faint outline-none resize-none p-2 focus:border-accent/50 transition-colors focus:text-ink"
        />
      </div>
    </aside>
  )
}

function TitleInput({ value, onChange }) {
  const [v, setV] = useState(value)
  return (
    <textarea
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { if (v.trim()) onChange(v.trim()) }}
      rows={2}
      className="w-full bg-transparent text-ink font-semibold text-base outline-none resize-none placeholder-ink-faint leading-snug"
    />
  )
}

function MetaRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-ink-faint w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  )
}

function SelectDropdown({ value, options, onChange, renderSelected, renderOption }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink bg-surface-overlay border border-surface-border rounded px-2 py-0.5 hover:border-accent/40 transition-colors"
      >
        {renderSelected()}
        <ChevronDown size={10} className="opacity-50 ml-0.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-surface-raised border border-surface-border rounded-lg shadow-2xl py-1 min-w-[150px]">
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`w-full flex items-center px-3 py-1.5 text-sm hover:bg-surface-hover transition-colors text-left
                  ${o.value === value ? 'text-ink' : 'text-ink-muted'}`}
              >
                {renderOption(o.value)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function LabelEditor({ labels, onChange }) {
  const [open, setOpen] = useState(false)
  const toggle = (l) => onChange(labels.includes(l) ? labels.filter(x => x !== l) : [...labels, l])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center flex-wrap gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
      >
        {labels.length === 0
          ? <span className="bg-surface-overlay border border-surface-border rounded px-2 py-0.5 hover:border-accent/40 transition-colors">None</span>
          : labels.map(l => (
              <span key={l} className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: (LABEL_COLORS[l] ?? '#555') + '22', color: LABEL_COLORS[l] ?? '#888' }}>
                {l}
              </span>
            ))
        }
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-surface-raised border border-surface-border rounded-lg shadow-2xl py-1 min-w-[150px]">
            {LABEL_OPTIONS.map(l => (
              <button key={l} onClick={() => toggle(l)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface-hover transition-colors text-left">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LABEL_COLORS[l] }} />
                <span className={labels.includes(l) ? 'text-ink font-medium' : 'text-ink-muted'}>{l}</span>
                {labels.includes(l) && <span className="ml-auto text-accent text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
