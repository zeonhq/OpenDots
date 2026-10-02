import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { ThreadStore } from '../src/server/thread-store.js';

const cleanup: string[] = [];
afterEach(() => {
  while (cleanup.length) rmSync(cleanup.pop()!, { recursive: true, force: true });
});

it('creates, lists, and gets local JSON threads under the lab volume path', () => {
  const root = mkdtempSync(join(tmpdir(), 'opendots-threads-'));
  cleanup.push(root);
  const store = new ThreadStore(root);
  const created = store.create({
    dotId: 'dot-1',
    ownerId: 'owner',
    title: 'Orb chat',
  });
  expect(store.list('owner')).toHaveLength(1);
  expect(store.list('other')).toHaveLength(0);
  const got = store.get(created.id, 'owner');
  expect(got?.title).toBe('Orb chat');
  expect(got?.messages).toEqual([]);
  store.appendMessage(created.id, 'owner', {
    role: 'user',
    content: 'hello',
  });
  expect(store.get(created.id, 'owner')?.messages[0]?.content).toBe('hello');
});
