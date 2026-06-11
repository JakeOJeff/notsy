import { useState } from 'react'
import { X, Trash2, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { StatusIcon, PriorityIcon } from './Icons'
import {
  useTodosStore, STATUS_CONFIG, PRIORITY_CONFIG, LABEL_OPTIONS, LABEL_VARIANT,
} from '../../store/useTodosStore'

export default function TodoDetail({ todoId, onClose }) {
  const todos      = useTodosStore(s => s.todos)
  const updateTodo = useTodosStore(s => s.updateTodo)
  const deleteTodo = useTodosStore(s => s.deleteTodo)

  const todo = todos.find(t => t.id === todoId)
  if (!todo) return null

  const up = (u) => updateTodo(todoId, u)

  return (
    <aside className="flex flex-col w-72 shrink-0 h-full border-l border-border bg-card overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-border shrink-0 sticky top-0 bg-card z-10">
        <span className="text-[11px] font-mono text-muted-foreground/40 tracking-wide">{todo.id}</span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost" size="icon-xs"
            className="text-muted-foreground/50 hover:text-destructive"
            onClick={() => { deleteTodo(todoId); onClose() }}
            title="Delete"
          >
            <Trash2 size={12} />
          </Button>
          <Button
            variant="ghost" size="icon-xs"
            className="text-muted-foreground/50"
            onClick={onClose}
            title="Close"
          >
            <X size={12} />
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pt-4 pb-3">
        <TitleEditor value={todo.title} onChange={(v) => up({ title: v })} />
      </div>

      <Separator />

      {/* Properties */}
      <div className="px-4 py-2.5 space-y-0.5">
        <PropRow label="Status">
          <PropPopover
            trigger={
              <span className="flex items-center gap-1.5">
                <StatusIcon status={todo.status} size={11} />
                {STATUS_CONFIG[todo.status]?.label}
              </span>
            }
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <PopItem key={k} active={todo.status === k} onClick={() => up({ status: k })}>
                <StatusIcon status={k} size={11} /> {v.label}
              </PopItem>
            ))}
          </PropPopover>
        </PropRow>

        <PropRow label="Priority">
          <PropPopover
            trigger={
              <span className="flex items-center gap-1.5">
                <PriorityIcon priority={todo.priority} size={11} />
                {PRIORITY_CONFIG[todo.priority]?.label}
              </span>
            }
          >
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <PopItem key={k} active={todo.priority === k} onClick={() => up({ priority: k })}>
                <PriorityIcon priority={k} size={11} /> {v.label}
              </PopItem>
            ))}
          </PropPopover>
        </PropRow>

        <PropRow label="Labels">
          <LabelPicker labels={todo.labels} onChange={(l) => up({ labels: l })} />
        </PropRow>

        <PropRow label="Created">
          <span className="text-xs text-muted-foreground/50">
            {new Date(todo.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        </PropRow>
      </div>

      <Separator />

      {/* Description */}
      <div className="px-4 py-3 flex-1 flex flex-col">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 mb-2">Description</p>
        <textarea
          value={todo.description ?? ''}
          onChange={(e) => up({ description: e.target.value })}
          placeholder="Add a description…"
          rows={5}
          className={cn(
            'flex-1 w-full rounded-lg border border-input bg-muted/40 px-3 py-2',
            'text-sm text-foreground placeholder:text-muted-foreground/30',
            'outline-none resize-none transition-all',
            'focus:ring-2 focus:ring-ring/20 focus:bg-background'
          )}
        />
      </div>
    </aside>
  )
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function TitleEditor({ value, onChange }) {
  const [v, setV] = useState(value)
  return (
    <textarea
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v.trim() && onChange(v.trim())}
      rows={2}
      placeholder="Issue title"
      className="w-full bg-transparent text-sm font-semibold text-foreground outline-none resize-none leading-snug placeholder:text-muted-foreground/30"
    />
  )
}

function PropRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground/40 w-16 shrink-0">{label}</span>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  )
}

function PropPopover({ trigger, children }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          'flex items-center gap-1.5 text-xs text-muted-foreground',
          'border border-border/60 rounded-lg px-2 py-1',
          'hover:bg-muted hover:text-foreground hover:border-border transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring/30'
        )}>
          {trigger}
          <ChevronDown size={9} className="opacity-30 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-1 w-44" onClick={() => setOpen(false)}>
        {children}
      </PopoverContent>
    </Popover>
  )
}

function LabelPicker({ labels, onChange }) {
  const [open, setOpen] = useState(false)
  const toggle = (l) => onChange(labels.includes(l) ? labels.filter(x => x !== l) : [...labels, l])
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 flex-wrap justify-end text-xs text-muted-foreground hover:text-foreground transition-colors max-w-[160px] outline-none">
          {labels.length === 0
            ? <span className="border border-border/60 rounded-lg px-2 py-1 text-muted-foreground/40 hover:border-border transition-colors">None</span>
            : labels.map(l => <Badge key={l} variant={LABEL_VARIANT[l] ?? 'muted'}>{l}</Badge>)
          }
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-1 w-44">
        {LABEL_OPTIONS.map(l => (
          <PopItem key={l} active={labels.includes(l)} onClick={() => toggle(l)} check>
            <Badge variant={LABEL_VARIANT[l] ?? 'muted'} className="pointer-events-none">{l}</Badge>
          </PopItem>
        ))}
      </PopoverContent>
    </Popover>
  )
}

function PopItem({ children, active, onClick, check = false }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {check && (
        <span className={cn('size-3 flex items-center justify-center text-foreground text-xs shrink-0', !active && 'opacity-0')}>✓</span>
      )}
      {children}
    </button>
  )
}
