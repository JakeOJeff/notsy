import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-2xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&>svg]:size-3! [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground',
        secondary:   'bg-secondary text-secondary-foreground',
        outline:     'border-border text-foreground',
        muted:       'bg-muted text-muted-foreground border-border',
        destructive: 'bg-destructive/10 text-destructive',
        rose:        'bg-rose-500/10   text-rose-400   border-rose-500/20  dark:bg-rose-500/15',
        amber:       'bg-amber-500/10  text-amber-400  border-amber-500/20 dark:bg-amber-500/15',
        sky:         'bg-sky-500/10    text-sky-400    border-sky-500/20   dark:bg-sky-500/15',
        indigo:      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 dark:bg-indigo-500/15',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
))
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
