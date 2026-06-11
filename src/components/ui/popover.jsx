import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '../../lib/utils'

const Popover        = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor  = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef(({ className, align = 'center', sideOffset = 5, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-56 rounded-xl border border-border bg-popover p-1',
        'text-popover-foreground shadow-xl shadow-black/20 outline-none',
        'data-[state=open]:animate-[fade-in_0.12s_ease-out]',
        'data-[state=closed]:animate-[fade-out_0.1s_ease-in]',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
