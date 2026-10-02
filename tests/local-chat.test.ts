import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { Store } from '../src/server/store.js';
import { WorkspaceStore } from '../src/server/workspace.js';
import { Platform } from '../src/server/platform.js';
import { Runner } from '../src/server/runner.js';
import { createApp } from '../src/server/app.js';
import { openaiCompatibleChat } from '../src/server/local-chat.js';

const cleanup: (() => void)[] = [];
afterEach(() => {
  vi.unstubAllGlobals();
  cleanup.splice(0).forEach((fn) => fn());
});

it('parses an OpenAI-compatible chat completion', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      Response.json({
        choices: [{ message: { content: 'hello from model' } }],
      }),
    ),
  );
  await expect(
    openaiCompatibleChat({
      baseUrl: 'http://example.test/v1',
      apiKey: 'key',
      model: 'lab-model',
      messages: [{ role: 'user', content: 'hi' }],
    }),
  ).resolves.toBe('hello from model');
});

it('POST /api/threads/:id/messages stores user+assistant without Intelligence', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      expect(String(url)).toContain('/chat/completions');
      return Response.json({
        choices: [{ message: { content: 'lab reply' } }],
      });
    }),
  );
  const store = new Store(':memory:');
  const ws = new WorkspaceStore(':memory:', 'owner');
  cleanup.push(() => {
    store.close();
    ws.close();
  });
  const platform = new Platform(
    store,
    ws,
    {
      apiKey: 'lab-key',
      model: 'lab-model',
      baseUrl: 'http://example.test/v1',
      voiceName: 'marin',
      slackUsers: [],
      runtimeUrl: '',
      // no intelligenceKey
    },
    mkdtempSync(join(tmpdir(), 'opendots-threads-')),
  );
  expect(platform.setup().intelligence).toBe(false);
  expect(platform.setup().missing).toEqual([]);
  const app = createApp({
    store,
    runner: new Runner(store, { mode: 'live', baseUrl: 'http://example.test' }),
    config: { mode: 'live', baseUrl: 'http://example.test' },
    platform,
  });
  const created = await app.request('/api/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dotId: ws.dots()[0].id, title: 'Orb turn' }),
  });
  expect(created.status).toBe(201);
  const { id } = (await created.json()) as { id: string };
  const turn = await app.request(`/api/threads/${id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'ping' }),
  });
  expect(turn.status).toBe(201);
  const body = (await turn.json()) as {
    messages: { role: string; content: string }[];
  };
  expect(body.messages.map((m) => [m.role, m.content])).toEqual([
    ['user', 'ping'],
    ['assistant', 'lab reply'],
  ]);
  const got = await app.request(`/api/threads/${id}`);
  expect(got.status).toBe(200);
  expect(((await got.json()) as typeof body).messages).toHaveLength(2);
});
