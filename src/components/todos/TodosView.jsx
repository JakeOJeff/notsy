import { useState } from 'react'
import { useTodosStore, STATUS_CONFIG } from '../../store/useTodosStore'
import TodoGroup from './TodoGroup'
import TodoDetail from './TodoDetail'
import NewTodoModal from './NewTodoModal'
import { Plus, Filter, SlidersHorizontal, LayoutList } from 'lucide-react'

const STATUS_ORDER = ['backlog', 'todo', 'in-progress', 'done', 'cancelled']

export default function TodosView() {
  const todos        = useTodosStore(s => s.todos)
  const statusFilter = useTodosStore(s => s.statusFilter)
  const activeTodoId = useTodosStore(s => s.activeTodoId)
  const setActive    = useTodosStore(s => s.setActiveTodo)

  const [showModal,       setShowModal]       = useState(false)
  const [modalDefStatus,  setModalDefStatus]  = useState('todo')
  const [searchQuery,     setSearchQuery]     = useState('')
  const [draggingId,      setDraggingId]      = useState(null)

  // Filter todos based on sidebar selection
  const visibleTodos = (() => {
    let list = todos
    if (statusFilter === 'active')  list = list.filter(t => ['todo', 'in-progress'].includes(t.status))
    if (statusFilter === 'backlog') list = list.filter(t => t.status === 'backlog')
    if (statusFilter === 'done')    list = list.filter(t => ['done', 'cancelled'].includes(t.status))
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.labels.some(l => l.toLowerCase().includes(q)))
    }
    return list
  })()

  // When dragging, show all groups (even empty ones) as drop targets
  const statusesToShow = draggingId
    ? STATUS_ORDER
    : STATUS_ORDER.filter(s => visibleTodos.some(t => t.status === s))

  const groupedByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = visibleTodos.filter(t => t.status === status)
    return acc
  }, {})

  const openNewIssue = (status = 'todo') => {
    setModalDefStatus(status)
    setShowModal(true)
  }

  const viewLabel = {
    all:     'All Issues',
    active:  'Active',
    backlog: 'Backlog',
    done:    'Completed',
  }[statusFilter] ?? 'Issues'

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main issues list */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border flex-shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-ink">{viewLabel}</h1>
            <span className="text-xs text-ink-faint bg-surface-overlay px-1.5 py-0.5 rounded-full">{visibleTodos.length}</span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            {/* Search */}
            <div className="flex items-center gap-1.5 bg-surface-overlay border border-surface-border rounded-md px-2 py-1.5 flex-1 focus-within:border-accent/50 transition-colors">
              <Filter size={11} className="text-ink-faint flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter issues…"
                className="bg-transparent text-xs text-ink placeholder-ink-faint outline-none flex-1 min-w-0"
              />
            </div>
          </div>

          <button
            onClick={() => openNewIssue('todo')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 text-white text-xs font-medium rounded-md transition-colors flex-shrink-0"
          >
            <Plus size={13} />
            New issue
          </button>
        </div>

        {/* Column headers */}
        <div className="flex items-center px-3 py-1.5 border-b border-surface-border text-xs text-ink-faint bg-surface-raised flex-shrink-0">
          <span className="w-5 flex-shrink-0" />
          <span className="w-5 flex-shrink-0" />
          <span className="w-14 flex-shrink-0">ID</span>
          <span className="flex-1">Title</span>
          <span className="hidden sm:block w-32 text-right">Labels</span>
          <span className="w-8" />
        </div>

        {/* Issue groups */}
        <div className="flex-1 overflow-y-auto">
          {statusesToShow.length === 0 ? (
            <EmptyState filter={statusFilter} search={searchQuery} onNew={() => openNewIssue()} />
          ) : (
            statusesToShow.map(status => (
              <TodoGroup
                key={status}
                status={status}
                todos={groupedByStatus[status] ?? []}
                activeTodoId={activeTodoId}
                onSelectTodo={(id) => setActive(activeTodoId === id ? null : id)}
                onNewIssue={openNewIssue}
                draggingId={draggingId}
                onDragStart={(id) => setDraggingId(id)}
                onDragEnd={() => setDraggingId(null)}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      {activeTodoId && (
        <TodoDetail
          todoId={activeTodoId}
          onClose={() => setActive(null)}
        />
      )}

      {/* New issue modal */}
      {showModal && (
        <NewTodoModal
          defaultStatus={modalDefStatus}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function EmptyState({ filter, search, onNew }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-ink-faint gap-3">
      <LayoutList size={32} className="opacity-20" />
      <p className="text-sm">
        {search ? `No issues matching "${search}"` : `No ${filter === 'all' ? '' : filter + ' '}issues`}
      </p>
      {!search && (
        <button
          onClick={onNew}
          className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          Create an issue
        </button>
      )}
    </div>
  )
}
