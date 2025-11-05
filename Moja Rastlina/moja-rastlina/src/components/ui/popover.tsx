import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent: React.FC<React.ComponentProps<typeof PopoverPrimitive.Content>> = ({ children, sideOffset = 8, ...props }) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content sideOffset={sideOffset} {...props}>
      {children}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
);


