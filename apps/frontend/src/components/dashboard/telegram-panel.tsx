import { useMutation } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@ghostfx/ui';

import { connectTelegram, testTelegram } from '@/services/dashboard-service';
import { fetchMe } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';

export function TelegramPanel() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [chatId, setChatId] = useState('');

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

  function submit(event: FormEvent) {
    event.preventDefault();
    connectMutation.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <Badge className="mb-3">{user?.telegram_connected ? 'Connected' : 'Primary alerts'}</Badge>
          <CardTitle>Telegram agent</CardTitle>
        </div>
        <Send className="h-7 w-7 text-cyan-300" />
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex gap-2" onSubmit={submit}>
          <Input
            value={chatId}
            onChange={(event) => setChatId(event.target.value)}
            placeholder="Telegram chat id"
            required
          />
          <Button type="submit" disabled={connectMutation.isPending}>
            Save
          </Button>
        </form>
        <Button type="button" variant="secondary" className="w-full" onClick={() => testMutation.mutate()}>
          Send test alert
        </Button>
        {(connectMutation.isError || testMutation.isError) && (
          <p className="m-0 text-sm text-rose-200">Telegram request failed. Check the bot token and chat id.</p>
        )}
        {testMutation.data && (
          <p className="m-0 text-sm text-emerald-200">
            {testMutation.data.sent ? 'Test alert sent.' : 'No alert sent. Add TELEGRAM_BOT_TOKEN and connect a chat id.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
