import * as React from 'react';

import { cn } from '../lib/cn';

type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'destructive';

const variants: Record<ButtonVariant, string> = {
  default: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
  secondary: 'bg-white/10 text-white hover:bg-white/15',
  ghost: 'bg-transparent text-slate-200 hover:bg-white/10',
  destructive: 'bg-rose-500 text-white hover:bg-rose-400',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
