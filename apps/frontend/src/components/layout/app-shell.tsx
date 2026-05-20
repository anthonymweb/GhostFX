import { Bell, Bot, ShieldCheck } from 'lucide-react';
import { PropsWithChildren } from 'react';

import { Badge, Button } from '@ghostfx/ui';

import { logout } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';

export function AppShell({ children }: PropsWithChildren) {
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);

  async function signOut() {
    try {
      await logout(refreshToken);
    } finally {
      clearSession();
    }
  }

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="rounded-[28px] border border-white/10 bg-slate-950/60 px-6 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-300">
                <Bot className="h-4 w-4" />
                <span className="text-sm uppercase tracking-[0.3em]">GhostFX AI Agent</span>
              </div>
              <h1 className="m-0 text-3xl font-semibold text-white md:text-5xl">
                Your protective trading co-pilot.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
                The agent scans markets, filters bad trades, explains risk, and helps users act with discipline.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge className="gap-2 border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protection mode active
              </Badge>
              <Badge className="gap-2">
                <Bell className="h-3.5 w-3.5" />
                {user?.telegram_connected ? 'Telegram connected' : 'Telegram available'}
              </Badge>
              <Badge>{user?.experience_mode ?? 'beginner'} mode</Badge>
              <Button variant="secondary" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
