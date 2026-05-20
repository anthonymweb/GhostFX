import { cn } from '../lib/cn';

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-white/10', className)}>
      <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}
