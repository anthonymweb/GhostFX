import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { BellOff, BellRing, CheckCircle2, MessageCircle, Send, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@ghostfx/ui';

import { fetchMe } from '@/services/auth-service';
import { connectTelegram, testTelegram, updateUser } from '@/services/dashboard-service';
import { useAuthStore } from '@/store/auth-store';

type AlertType = 'buy' | 'sell' | 'hold';

const alerts: { key: AlertType; label: string; description: string }[] = [
  { key: 'buy', label: 'Buy signals', description: 'When AI recommends a buy' },
  { key: 'sell', label: 'Sell signals', description: 'When AI recommends a sell' },
  { key: 'hold', label: 'Do nothing', description: 'When AI says stay out' },
];

export function TelegramPanel() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [chatId, setChatId] = useState('');

  const initialAlerts = new Set<AlertType>();
  if (user?.alert_on_buy) initialAlerts.add('buy');
  if (user?.alert_on_sell) initialAlerts.add('sell');
  if (user?.alert_on_hold) initialAlerts.add('hold');
  const [enabledAlerts, setEnabledAlerts] = useState<Set<AlertType>>(initialAlerts);

  const connected = user?.telegram_connected ?? false;

  const connectMutation = useMutation({
    mutationFn: async () => {
      await connectTelegram(chatId);
      return fetchMe();
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setChatId('');
    },
  });

  const testMutation = useMutation({
    mutationFn: testTelegram,
  });

  const alertMutation = useMutation({
    mutationFn: async (alerts: Set<AlertType>) => {
      return updateUser({
        alert_on_buy: alerts.has('buy'),
        alert_on_sell: alerts.has('sell'),
        alert_on_hold: alerts.has('hold'),
      });
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    connectMutation.mutate();
  }

  function toggleAlert(type: AlertType) {
    const next = new Set(enabledAlerts);
    if (next.has(type)) {
      if (next.size > 1) next.delete(type);
    } else {
      next.add(type);
    }
    setEnabledAlerts(next);
    alertMutation.mutate(next);
  }

  return (
    <Card data-telegram>
      <CardHeader>
        <div>
          <Badge className={`mb-3 w-fit ${connected ? 'bg-emerald-400/10 text-emerald-200' : 'bg-slate-400/10 text-slate-300'}`}>
            {connected ? (
              <><CheckCircle2 className="mr-1 h-3 w-3" /> Connected</>
            ) : (
              <><BellOff className="mr-1 h-3 w-3" /> Disconnected</>
            )}
          </Badge>
          <CardTitle className="text-base sm:text-lg">Telegram alerts</CardTitle>
        </div>
        <MessageCircle className={`h-6 w-6 shrink-0 sm:h-7 sm:w-7 ${connected ? 'text-cyan-300' : 'text-slate-500'}`} />
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <p className="text-[10px] text-slate-500 sm:text-xs">
          Get instant buy/sell alerts sent to Telegram. First message <span className="font-mono text-slate-300">@ghostfx_bot</span> to get your chat ID.
        </p>

        {!connected ? (
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
            <Input
              value={chatId}
              onChange={(event) => setChatId(event.target.value)}
              placeholder="Enter your Telegram chat ID"
              required
              className="min-w-0"
            />
            <Button type="submit" disabled={connectMutation.isPending} className="shrink-0">
              {connectMutation.isPending ? 'Connecting...' : 'Connect'}
            </Button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-2.5 text-[11px] sm:p-3 sm:text-sm"
          >
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-medium">Telegram connected</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">Alerts will be sent based on your preferences below.</p>
          </motion.div>
        )}

        <div>
          <p className="mb-1.5 text-[10px] font-medium text-slate-400 sm:text-xs">Alert preferences</p>
          <div className="space-y-1">
            {alerts.map((a) => {
              const active = enabledAlerts.has(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAlert(a.key)}
                  className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-[10px] transition-all sm:gap-3 sm:p-2.5 sm:text-xs ${
                    active
                      ? 'border-cyan-400/25 bg-cyan-400/5'
                      : 'border-white/5 bg-white/[0.02] opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md sm:h-6 sm:w-6 ${
                    active ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/5 text-slate-500'
                  }`}>
                    {active ? <BellRing className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <BellOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`font-medium ${active ? 'text-white' : 'text-slate-400'}`}>{a.label}</span>
                    <p className="text-[9px] text-slate-500 sm:text-[10px]">{a.description}</p>
                  </div>
                  {active && <CheckCircle2 className="h-3 w-3 shrink-0 text-cyan-400 sm:h-3.5 sm:w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {connected && (
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2 text-[11px] sm:text-xs"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending}
          >
            <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {testMutation.isPending ? 'Sending...' : 'Send test alert'}
          </Button>
        )}

        <AnimatePresence>
          {(connectMutation.isError || testMutation.isError) && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="m-0 flex items-center gap-1.5 text-[10px] text-rose-300 sm:text-xs"
            >
              <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Connection failed. Check TELEGRAM_BOT_TOKEN and chat ID.
            </motion.p>
          )}
          {testMutation.data?.sent && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="m-0 flex items-center gap-1.5 text-[10px] text-emerald-300 sm:text-xs"
            >
              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Test alert sent.
            </motion.p>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
