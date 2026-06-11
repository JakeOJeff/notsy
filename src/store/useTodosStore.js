import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const STATUS_CONFIG = {
  backlog:     { label: 'Backlog',     order: 0, color: '#555' },
  todo:        { label: 'Todo',        order: 1, color: '#888' },
  'in-progress': { label: 'In Progress', order: 2, color: '#F0C000' },
  done:        { label: 'Done',        order: 3, color: '#26C940' },
  cancelled:   { label: 'Cancelled',  order: 4, color: '#4D4D4D' },
}

export const PRIORITY_CONFIG = {
  'no-priority': { label: 'No priority', color: '#555' },
  urgent:        { label: 'Urgent',      color: '#E5484D' },
  high:          { label: 'High',        color: '#F76808' },
  medium:        { label: 'Medium',      color: '#F0C000' },
  low:           { label: 'Low',         color: '#707070' },
}

export const LABEL_OPTIONS = ['Bug', 'Feature', 'Design', 'Performance', 'Documentation', 'Research', 'UI', 'API']

export const LABEL_COLORS = {
  Bug:           '#E5484D',
  Feature:       '#5E6AD2',
  Design:        '#A855F7',
  Performance:   '#F76808',
  Documentation: '#22C55E',
  Research:      '#06B6D4',
  UI:            '#EC4899',
  API:           '#F59E0B',
}

let _counter = 12

const seed = [
  { id: 'NOT-001', title: 'Set up project structure',          status: 'done',        priority: 'high',        labels: ['Feature'],      description: 'Initial scaffolding with Vite, React and Tailwind.', createdAt: Date.now() - 86400000 * 5 },
  { id: 'NOT-002', title: 'Design sidebar navigation',         status: 'done',        priority: 'medium',      labels: ['Design', 'UI'], description: '',  createdAt: Date.now() - 86400000 * 4 },
  { id: 'NOT-003', title: 'Implement note tabs',               status: 'done',        priority: 'high',        labels: ['Feature'],      description: '',  createdAt: Date.now() - 86400000 * 3 },
  { id: 'NOT-004', title: 'Rich text editor toolbar',          status: 'in-progress', priority: 'high',        labels: ['Feature'],      description: 'Bold, italic, headings, lists, alignment controls.', createdAt: Date.now() - 86400000 * 2 },
  { id: 'NOT-005', title: 'Todo list Linear-style UI',         status: 'in-progress', priority: 'urgent',      labels: ['Feature', 'Design'], description: '', createdAt: Date.now() - 86400000 },
  { id: 'NOT-006', title: 'Find & Replace in notes',           status: 'todo',        priority: 'medium',      labels: ['Feature'],      description: 'Ctrl+H to open. Highlight matches, replace one or all.', createdAt: Date.now() },
  { id: 'NOT-007', title: 'Fix caret position after paste',    status: 'todo',        priority: 'high',        labels: ['Bug'],          description: '',  createdAt: Date.now() },
  { id: 'NOT-008', title: 'Add keyboard shortcuts cheatsheet', status: 'todo',        priority: 'low',         labels: ['Documentation'], description: '', createdAt: Date.now() },
  { id: 'NOT-009', title: 'Performance audit on large notes',  status: 'backlog',     priority: 'low',         labels: ['Performance'],  description: '',  createdAt: Date.now() },
  { id: 'NOT-010', title: 'Export notes as PDF / Markdown',    status: 'backlog',     priority: 'medium',      labels: ['Feature'],      description: '',  createdAt: Date.now() },
  { id: 'NOT-011', title: 'Sync notes to cloud storage',       status: 'backlog',     priority: 'no-priority', labels: ['Feature', 'Research'], description: '', createdAt: Date.now() },
]

export const useTodosStore = create(
  persist(
    (set, get) => ({
      todos: seed,
      activeTodoId: null,
      statusFilter: 'all',          // 'all' | 'active' | 'backlog' | 'done'
      collapsedGroups: ['done', 'cancelled'],

      createTodo: (data) => {
        const id = `NOT-${String(++_counter).padStart(3, '0')}`
        const todo = {
          id,
          title: data.title || 'New issue',
          status: data.status || 'todo',
          priority: data.priority || 'no-priority',
          labels: data.labels || [],
          description: '',
          createdAt: Date.now(),
        }
        set(s => ({ todos: [...s.todos, todo], activeTodoId: id }))
        return id
      },

      updateTodo: (id, updates) =>
        set(s => ({ todos: s.todos.map(t => t.id === id ? { ...t, ...updates } : t) })),

      deleteTodo: (id) =>
        set(s => ({
          todos: s.todos.filter(t => t.id !== id),
          activeTodoId: s.activeTodoId === id ? null : s.activeTodoId,
        })),

      setActiveTodo: (id) => set({ activeTodoId: id }),
      setStatusFilter: (f) => set({ statusFilter: f }),

      toggleGroupCollapse: (status) =>
        set(s => ({
          collapsedGroups: s.collapsedGroups.includes(status)
            ? s.collapsedGroups.filter(x => x !== status)
            : [...s.collapsedGroups, status],
        })),
    }),
    {
      name: 'notsy-todos',
      // re-hydrate counter from persisted IDs
      onRehydrateStorage: () => (state) => {
        if (state?.todos?.length) {
          const max = state.todos.reduce((m, t) => {
            const n = parseInt(t.id.replace('NOT-', ''), 10)
            return isNaN(n) ? m : Math.max(m, n)
          }, 0)
          _counter = Math.max(_counter, max)
        }
      },
    }
  )
)
