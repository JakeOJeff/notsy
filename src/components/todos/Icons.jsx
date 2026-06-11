import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../store/useTodosStore'

export function StatusIcon({ status, size = 14 }) {
  const r = size / 2
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.backlog

  if (status === 'backlog') {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
        <circle cx="7" cy="7" r="5.5" stroke={cfg.color} strokeWidth="1.5" strokeDasharray="3 2" />
      </svg>
    )
  }
  if (status === 'todo') {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
        <circle cx="7" cy="7" r="5.5" stroke={cfg.color} strokeWidth="1.5" />
      </svg>
    )
  }
  if (status === 'in-progress') {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
        <circle cx="7" cy="7" r="5.5" stroke={cfg.color} strokeWidth="1.5" />
        <path d="M7 1.5 A5.5 5.5 0 0 1 7 12.5" fill={cfg.color} />
      </svg>
    )
  }
  if (status === 'done') {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
        <circle cx="7" cy="7" r="6.5" fill={cfg.color} />
        <path d="M4.5 7 L6.2 8.8 L9.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (status === 'cancelled') {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
        <circle cx="7" cy="7" r="5.5" stroke={cfg.color} strokeWidth="1.5" />
        <path d="M5 5 L9 9 M9 5 L5 9" stroke={cfg.color} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  }
  return null
}

export function PriorityIcon({ priority, size = 12 }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG['no-priority']
  const c = cfg.color

  if (priority === 'no-priority') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
        <rect x="1" y="3" width="10" height="1.5" rx="0.75" fill={c} opacity="0.5" />
        <rect x="1" y="5.5" width="10" height="1.5" rx="0.75" fill={c} opacity="0.5" />
        <rect x="1" y="8" width="10" height="1.5" rx="0.75" fill={c} opacity="0.5" />
      </svg>
    )
  }
  if (priority === 'urgent') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
        <rect x="1" y="1" width="10" height="10" rx="2" fill={c} />
        <path d="M6 3.5 L6 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="8.5" r="0.75" fill="white" />
      </svg>
    )
  }
  if (priority === 'high') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
        <rect x="1"   y="5" width="2.5" height="6" rx="0.5" fill={c} />
        <rect x="4.75" y="3" width="2.5" height="8" rx="0.5" fill={c} />
        <rect x="8.5"  y="1" width="2.5" height="10" rx="0.5" fill={c} />
      </svg>
    )
  }
  if (priority === 'medium') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
        <rect x="1"   y="5" width="2.5" height="6" rx="0.5" fill={c} />
        <rect x="4.75" y="3" width="2.5" height="8" rx="0.5" fill={c} />
        <rect x="8.5"  y="1" width="2.5" height="10" rx="0.5" fill={c} opacity="0.25" />
      </svg>
    )
  }
  if (priority === 'low') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
        <rect x="1"   y="5" width="2.5" height="6" rx="0.5" fill={c} />
        <rect x="4.75" y="3" width="2.5" height="8" rx="0.5" fill={c} opacity="0.25" />
        <rect x="8.5"  y="1" width="2.5" height="10" rx="0.5" fill={c} opacity="0.25" />
      </svg>
    )
  }
  return null
}
