import { useState } from 'react'
import { Plus, Search, LayoutList } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { useTodosStore } from '../../store/useTodosStore'
import TodoGroup from './TodoGroup'
import TodoDetail from './TodoDetail'
import NewTodoModal from './NewTodoModal'

const STATUS_ORDER = ['backlog', 'todo', 'in-progress', 'done', 'cancelled']

export default function TodosView() {
  const todos        = useTodosStore(s => s.todos)
  const statusFilter = useTodosStore(s => s.statusFilter)
  const activeTodoId = useTodosStore(s => s.activeTodoId)
  const setActive    = useTodosStore(s => s.setActiveTodo)

  const [showModal,      setShowModal]      = useState(false)
  const [modalDefStatus, setModalDefStatus] = useState('todo')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [draggingId,     setDraggingId]     = useState(null)

  const visible = (() => {
    let list = todos
    if (statusFilter === 'active')  list = list.filter(t => ['todo','in-progress'].includes(t.status))
    if (statusFilter === 'backlog') list = list.filter(t => t.status === 'backlog')
    if (statusFilter === 'done')    list = list.filter(t => ['done','cancelled'].includes(t.status))
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.labels.some(l => l.toLowerCase().includes(q))
      )
    }
    return list
  })()

  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = visible.filter(t => t.status === s)
    return acc
  }, {})

  const statusesToShow = draggingId
    ? STATUS_ORDER
    : STATUS_ORDER.filter(s => grouped[s].length > 0)

  const openNewIssue = (status = 'todo') => { setModalDefStatus(status); setShowModal(true) }

  const viewLabel = {
    all: 'All Issues', active: 'Active', backlog: 'Backlog', done: 'Completed',
  }[statusFilter] ?? 'Issues'

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0">
          <h1 className="text-sm font-semibold text-foreground">{viewLabel}</h1>
          <span className="text-[11px] text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded-md tabular-nums">
            {visible.length}
          </span>

          {/* Filter / search */}
          <div className={cn(
            'flex items-center gap-1.5 bg-muted border border-input rounded-lg px-2.5 h-7',
            'flex-1 max-w-60 focus-within:ring-2 focus-within:ring-ring/20 focus-within:bg-background transition-all'
          )}>
            <Search size={11} className="text-muted-foreground/40 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter issues…"
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 outline-none flex-1 min-w-0"
            />
          </div>

          <div className="flex-1" />

          <Button size="sm" onClick={() => openNewIssue('todo')}>
            <Plus size={12} /> New issue
          </Button>
        </div>

        {/* Column header */}
        <div className="flex items-center px-3 h-8 border-b border-border text-[11px] text-muted-foreground/30 bg-card shrink-0 select-none">
          <span className="w-4 shrink-0" />
          <span className="w-4 shrink-0 ml-2" />
          <span className="w-4 shrink-0 ml-2" />
          <span className="w-[52px] shrink-0 ml-2">ID</span>
          <span className="flex-1 ml-2">Title</span>
          <span className="hidden sm:block w-32 text-right pr-8">Labels</span>
        </div>

        {/* Issue groups */}
        <div className="flex-1 overflow-y-auto">
          {statusesToShow.length === 0
            ? <EmptyState filter={statusFilter} search={searchQuery} onNew={() => openNewIssue()} />
            : statusesToShow.map(status => (
                <TodoGroup
                  key={status}
                  status={status}
                  todos={grouped[status] ?? []}
                  activeTodoId={activeTodoId}
                  onSelectTodo={(id) => setActive(activeTodoId === id ? null : id)}
                  onNewIssue={openNewIssue}
                  draggingId={draggingId}
                  onDragStart={(id) => setDraggingId(id)}
                  onDragEnd={() => setDraggingId(null)}
                />
              ))
          }
        </div>
      </div>

      {/* Detail panel */}
      {activeTodoId && (
        <TodoDetail todoId={activeTodoId} onClose={() => setActive(null)} />
      )}

      {/* Modal */}
      {showModal && (
        <NewTodoModal defaultStatus={modalDefStatus} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

function EmptyState({ filter, search, onNew }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground/40">
      <LayoutList size={28} strokeWidth={1.5} />
      <p className="text-sm">
        {search ? `No results for "${search}"` : `No ${filter === 'all' ? '' : filter + ' '}issues`}
      </p>
      {!search && <Button size="sm" onClick={onNew}>Create issue</Button>}
    </div>
  )
}
