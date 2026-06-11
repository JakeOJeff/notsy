import * as React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-8 w-full rounded-lg border border-input bg-transparent px-3 py-1.5',
      'text-sm text-foreground placeholder:text-muted-foreground',
      'transition-[color,box-shadow] outline-none',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
      'disabled:pointer-events-none disabled:opacity-50',
      'dark:bg-input/30',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
