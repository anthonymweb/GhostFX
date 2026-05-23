import { motion } from 'framer-motion';
import { Bell, Bot, LogOut, ShieldCheck, Waves } from 'lucide-react';
import { useState } from 'react';

import { Badge, Button } from '@ghostfx/ui';

import { logout } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    try {
      await logout(refreshToken);
    } finally {
      clearSession();
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-slate-950/80 via-slate-900/80 to-slate-950/80 shadow-[0_8px_32px_rgba(2,6,23,0.4)] backdrop-blur-2xl sm:mb-6"
        >
          <div className="relative px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg shadow-cyan-400/20 sm:h-10 sm:w-10">
                  <Bot className="h-4 w-4 text-slate-950 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-cyan-300 sm:text-xs">GhostFX</span>
                    <span className="hidden text-[9px] text-slate-600 sm:inline">|</span>
                    <span className="hidden text-[9px] text-slate-500 sm:inline">AI Trading Co-pilot</span>
                  </div>
                  <h1 className="mt-0.5 truncate text-sm font-semibold text-white sm:text-xl md:text-2xl">
                    Your protective trading co-pilot
                  </h1>
                </div>
              </div>

              <Button
                variant="ghost"
                className="shrink-0 px-2 text-slate-400 hover:text-white sm:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </Button>

              <div className="hidden items-center gap-2 sm:flex">
                <Badge className="gap-1.5 border-emerald-400/15 bg-emerald-400/5 text-[10px] text-emerald-200/80 sm:text-[11px]">
                  <ShieldCheck className="h-3 w-3" />
                  Protection active
                </Badge>
                <Badge className={`gap-1.5 border text-[10px] sm:text-[11px] ${
                  user?.telegram_connected
                    ? 'border-emerald-400/15 bg-emerald-400/5 text-emerald-200/80'
                    : 'border-white/5 bg-white/[0.03] text-slate-400'
                }`}>
                  <Bell className="h-3 w-3" />
                  <span className="hidden sm:inline">{user?.telegram_connected ? 'Telegram on' : 'Alerts off'}</span>
                  <span className="sm:hidden">{user?.telegram_connected ? 'On' : 'Off'}</span>
                </Badge>
                <Badge className="gap-1.5 border-white/5 bg-white/[0.03] text-[10px] capitalize text-slate-300 sm:text-[11px]">
                  {user?.experience_mode ?? 'beginner'} mode
                </Badge>
                <Button variant="ghost" onClick={signOut} className="gap-1.5 text-[10px] text-slate-400 hover:text-white sm:text-xs">
                  <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            </div>

            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4 sm:hidden"
              >
                <div className="flex items-center gap-2">
                  <Badge className="gap-1.5 border-emerald-400/15 bg-emerald-400/5 text-[10px] text-emerald-200/80">
                    <ShieldCheck className="h-3 w-3" />
                    Protection active
                  </Badge>
                  <Badge className={`gap-1.5 border text-[10px] ${
                    user?.telegram_connected
                      ? 'border-emerald-400/15 bg-emerald-400/5 text-emerald-200/80'
                      : 'border-white/5 bg-white/[0.03] text-slate-400'
                  }`}>
                    <Bell className="h-3 w-3" />
                    {user?.telegram_connected ? 'On' : 'Off'}
                  </Badge>
                  <Badge className="gap-1.5 border-white/5 bg-white/[0.03] text-[10px] capitalize text-slate-300">
                    {user?.experience_mode ?? 'beginner'}
                  </Badge>
                </div>
                <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-2 text-xs text-slate-400 hover:text-white">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              </motion.div>
            )}
          </div>
        </motion.header>

        <main>{children}</main>

        <footer className="mt-8 flex items-center justify-center gap-2 pb-4 text-[9px] text-slate-600 sm:mt-12 sm:pb-6 sm:text-[10px]">
          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          Decision-support software &mdash; not financial advice.
        </footer>
      </div>
    </div>
  );
}
