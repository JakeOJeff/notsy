import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { StatusIcon, PriorityIcon } from './Icons'
import { useTodosStore, STATUS_CONFIG, PRIORITY_CONFIG, LABEL_OPTIONS, LABEL_VARIANT } from '../../store/useTodosStore'

export default function NewTodoModal({ defaultStatus = 'todo', onClose }) {
  const createTodo = useTodosStore(s => s.createTodo)
  const [title,    setTitle]    = useState('')
  const [status,   setStatus]   = useState(defaultStatus)
  const [priority, setPriority] = useState('no-priority')
  const [labels,   setLabels]   = useState([])
  const [desc,     setDesc]     = useState('')
  const inputRef = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 60) }, [])

  const submit = () => {
    if (!title.trim()) return
    createTodo({ title: title.trim(), status, priority, labels, description: desc })
    onClose()
  }

  const toggleLabel = (l) =>
    setLabels(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l])

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[500px] p-0">
        <DialogHeader>
          <DialogTitle>New Issue</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-3">
          {/* Title */}
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Issue title"
            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/50 outline-none border-none"
          />

          {/* Description */}
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Add a description…"
            rows={3}
            className={cn(
              'w-full rounded-lg border border-input bg-muted/40 px-3 py-2',
              'text-sm text-foreground placeholder:text-muted-foreground/40',
              'outline-none resize-none transition-all',
              'focus:ring-2 focus:ring-ring/20 focus:bg-background'
            )}
          />

          {/* Metadata chips */}
          <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
            {/* Status */}
            <ChipPopover
              trigger={
                <span className="flex items-center gap-1.5">
                  <StatusIcon status={status} size={11} />
                  {STATUS_CONFIG[status]?.label}
                </span>
              }
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <PopItem key={k} active={status === k} onClick={() => setStatus(k)}>
                  <StatusIcon status={k} size={11} /> {v.label}
                </PopItem>
              ))}
            </ChipPopover>

            {/* Priority */}
            <ChipPopover
              trigger={
                <span className="flex items-center gap-1.5">
                  <PriorityIcon priority={priority} size={11} />
                  {PRIORITY_CONFIG[priority]?.label}
                </span>
              }
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <PopItem key={k} active={priority === k} onClick={() => setPriority(k)}>
                  <PriorityIcon priority={k} size={11} /> {v.label}
                </PopItem>
              ))}
            </ChipPopover>

            {/* Labels */}
            <ChipPopover
              keepOpen
              trigger={
                labels.length === 0
                  ? <span className="text-muted-foreground/50">Labels</span>
                  : <span className="flex items-center gap-1 flex-wrap">
                      {labels.map(l => <Badge key={l} variant={LABEL_VARIANT[l] ?? 'muted'}>{l}</Badge>)}
                    </span>
              }
            >
              {LABEL_OPTIONS.map(l => (
                <PopItem key={l} active={labels.includes(l)} onClick={() => toggleLabel(l)} check>
                  <Badge variant={LABEL_VARIANT[l] ?? 'muted'} className="pointer-events-none">{l}</Badge>
                </PopItem>
              ))}
            </ChipPopover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!title.trim()} onClick={submit}>Create issue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── Chip-style popover trigger ───────────────────────────────────────── */
function ChipPopover({ trigger, children, keepOpen = false }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          'flex items-center gap-1 text-xs text-muted-foreground',
          'border border-border rounded-lg px-2 py-1',
          'hover:bg-muted hover:text-foreground hover:border-border',
          'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/30'
        )}>
          {trigger}
          <ChevronDown size={9} className="opacity-40 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-1 w-44">
        <div onClick={keepOpen ? undefined : () => setOpen(false)}>
          {children}
        </div>
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
        <span className={cn('size-3 flex items-center justify-center text-foreground text-xs shrink-0', !active && 'opacity-0')}>
          ✓
        </span>
      )}
      {children}
    </button>
  )
}
