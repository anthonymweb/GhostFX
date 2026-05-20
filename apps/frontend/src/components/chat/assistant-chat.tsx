import { useMutation } from '@tanstack/react-query';
import { Bot, SendHorizonal } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@ghostfx/ui';

import { askAgent } from '@/services/dashboard-service';

export function AssistantChat() {
  const [question, setQuestion] = useState('Should I avoid trading right now?');
  const chat = useMutation({
    mutationFn: askAgent,
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    chat.mutate(question);
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <Badge className="mb-3">Conversational co-pilot</Badge>
          <CardTitle>Ask the AI assistant</CardTitle>
        </div>
        <Bot className="h-6 w-6 text-cyan-300" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          {chat.data?.answer ??
            'Ask why a signal exists, whether today is risky, which markets are strongest, or if you should stay out.'}
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <Input value={question} onChange={(event) => setQuestion(event.target.value)} />
          <Button className="w-full gap-2" type="submit" disabled={chat.isPending}>
            <SendHorizonal className="h-4 w-4" />
            {chat.isPending ? 'Thinking...' : 'Ask GhostFX'}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {(chat.data?.follow_up ?? [
            'Why did you recommend this trade?',
            'What pairs are strongest?',
            'Is today risky?',
          ]).map((item) => (
            <button
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
              onClick={() => setQuestion(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
