import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  [
    'group/button inline-flex shrink-0 items-center justify-center gap-1.5',
    'rounded-2xl border border-transparent bg-clip-padding',
    'text-sm font-medium whitespace-nowrap select-none',
    'transition-all outline-none',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:     'border-border bg-transparent hover:bg-muted hover:text-foreground dark:bg-transparent dark:hover:bg-input/30',
        ghost:       'hover:bg-muted hover:text-foreground',
        destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
        link:        'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-8 px-3',
        xs:      'h-6 px-2.5 text-xs',
        sm:      'h-7 px-2.5',
        lg:      'h-9 px-4',
        icon:    'size-8',
        'icon-sm': 'size-7',
        'icon-xs': 'size-6',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
