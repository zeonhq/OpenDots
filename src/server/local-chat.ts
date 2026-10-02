import { z } from 'zod';

const completionSchema = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string().min(1) }) }))
    .min(1),
});

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** OpenAI-compatible chat completions (Hermes proxy / OpenAI / lab override). */
export async function openaiCompatibleChat(input: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
  maxTokens?: number;
}): Promise<string> {
  const url = `${input.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    signal: input.signal,
    body: JSON.stringify({
      model: input.model,
      temperature: 0.4,
      max_tokens: input.maxTokens ?? 2048,
      messages: input.messages,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Model provider returned HTTP ${response.status}. Check OPENAI_BASE_URL, OPENAI_API_KEY, and OPENAI_MODEL.`,
    );
  }
  const parsed = completionSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error('Model provider returned an invalid or empty completion.');
  }
  return parsed.data.choices[0].message.content;
}
