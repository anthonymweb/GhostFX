import { motion } from 'framer-motion';
import { BarChart3, Bell, RefreshCw, ScrollText, Search, Settings } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { icon: RefreshCw, label: 'Refresh', shortcut: 'R', onClick: () => window.location.reload() },
    { icon: Search, label: 'Scan', shortcut: 'S', onClick: () => document.querySelector('[data-signal-feed]')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: Bell, label: 'Alerts', shortcut: 'A', onClick: () => document.querySelector('[data-telegram]')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: BarChart3, label: 'Chart', shortcut: 'C', onClick: () => document.querySelector('[data-chart]')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: ScrollText, label: 'Signals', shortcut: 'G', onClick: () => document.querySelector('[data-signals]')?.scrollIntoView({ behavior: 'smooth' }) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-slate-950/90 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 transition-all hover:bg-white/5 hover:text-white"
            title={`${action.label} (${action.shortcut})`}
          >
            <action.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{action.label}</span>
            <kbd className="ml-0.5 rounded border border-white/5 bg-white/[0.03] px-1 text-[9px] text-slate-600">
              {action.shortcut}
            </kbd>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
