import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

export interface LocalThread {
  id: string;
  dotId: string;
  ownerId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ThreadMessage[];
}

/** JSON/filesystem thread store under the lab compose volume (Naya Phase 1). */
export class ThreadStore {
  constructor(readonly root: string) {
    mkdirSync(root, { recursive: true });
  }

  private pathFor(id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('Invalid thread id.');
    return join(this.root, `${id}.json`);
  }

  private read(id: string): LocalThread | undefined {
    try {
      return JSON.parse(readFileSync(this.pathFor(id), 'utf8')) as LocalThread;
    } catch {
      return undefined;
    }
  }

  private write(thread: LocalThread) {
    const target = this.pathFor(thread.id);
    const temp = `${target}.${process.pid}.tmp`;
    writeFileSync(temp, JSON.stringify(thread, null, 2));
    renameSync(temp, target);
  }

  create(input: {
    id?: string;
    dotId: string;
    ownerId: string;
    title: string;
  }): LocalThread {
    const now = Date.now();
    const thread: LocalThread = {
      id: input.id ?? randomUUID(),
      dotId: input.dotId,
      ownerId: input.ownerId,
      title: input.title,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    this.write(thread);
    return thread;
  }

  list(ownerId: string): Omit<LocalThread, 'messages'>[] {
    const files = readdirSync(this.root).filter((name) => name.endsWith('.json'));
    return files
      .map((name) => this.read(name.slice(0, -5)))
      .filter((thread): thread is LocalThread => !!thread && thread.ownerId === ownerId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(({ messages: _messages, ...meta }) => meta);
  }

  get(id: string, ownerId: string): LocalThread | undefined {
    const thread = this.read(id);
    if (!thread || thread.ownerId !== ownerId) return undefined;
    return thread;
  }

  appendMessage(
    id: string,
    ownerId: string,
    message: Omit<ThreadMessage, 'id' | 'createdAt'> & {
      id?: string;
      createdAt?: number;
    },
  ): LocalThread {
    const thread = this.get(id, ownerId);
    if (!thread) throw new Error('Thread not found.');
    thread.messages.push({
      id: message.id ?? randomUUID(),
      role: message.role,
      content: message.content,
      createdAt: message.createdAt ?? Date.now(),
    });
    thread.updatedAt = Date.now();
    this.write(thread);
    return thread;
  }
}
