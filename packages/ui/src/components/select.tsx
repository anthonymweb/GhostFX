import * as React from 'react';

import { cn } from '../lib/cn';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300',
        className,
        '[&>option]:bg-slate-900',
      )}
      {...props}
    />
  ),
);

Select.displayName = 'Select';
