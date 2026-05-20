import type { ExperienceMode } from '@ghostfx/shared-types';

import { Badge, Card, CardContent, CardHeader, CardTitle, Select } from '@ghostfx/ui';

import { useUiStore } from '@/store/ui-store';

const modeCopy: Record<ExperienceMode, string> = {
  beginner: 'Simplified guidance, fewer decisions, stronger guardrails.',
  intermediate: 'Balanced visibility with stronger signal context and risk summaries.',
  advanced: 'Expanded insights, strategy context, and more control surfaces.',
};

export function ModeSelector() {
  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);

  return (
    <Card>
      <CardHeader>
        <div>
          <Badge className="mb-3">Adaptive experience</Badge>
          <CardTitle>Trading mode</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={mode} onChange={(event) => setMode(event.target.value as ExperienceMode)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
        <p className="m-0 text-sm text-slate-300">{modeCopy[mode]}</p>
      </CardContent>
    </Card>
  );
}
