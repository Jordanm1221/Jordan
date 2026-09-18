#!/usr/bin/env node
/**
 * Gemini MCP server.
 *
 * Exposes Google Gemini to any MCP client (Claude Code, Claude Desktop) as a
 * set of tools. Talks to the Gemini API over the official @google/genai SDK
 * and speaks MCP over stdio.
 *
 * Requires GEMINI_API_KEY (or GOOGLE_API_KEY) in the environment.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro';

// Read the key lazily so the server still starts (and reports a clear error)
// when the key is missing, instead of dying during the MCP handshake.
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'No API key found. Set GEMINI_API_KEY in your environment. ' +
        'Get one at https://aistudio.google.com/apikey'
    );
  }
  return new GoogleGenAI({ apiKey });
}

function textResult(text) {
  return { content: [{ type: 'text', text }] };
}

function errorResult(err) {
  const message = err instanceof Error ? err.message : String(err);
  return { content: [{ type: 'text', text: `Gemini error: ${message}` }], isError: true };
}

/** Pull the answer text plus any grounding sources out of a Gemini response. */
function formatResponse(response) {
  const answer = (response.text || '').trim() || '(Gemini returned no text.)';

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources = chunks
    .map((chunk) => chunk.web)
    .filter((web) => web?.uri)
    .map((web) => `- ${web.title || web.uri}: ${web.uri}`);

  const unique = [...new Set(sources)];
  return unique.length ? `${answer}\n\nSources:\n${unique.join('\n')}` : answer;
}

const server = new McpServer({ name: 'gemini', version: '1.0.0' });

server.registerTool(
  'ask_gemini',
  {
    title: 'Ask Gemini',
    description:
      'Send a prompt to Google Gemini and return its answer. Use for a second opinion, ' +
      'for Gemini-specific strengths (very long context, Google Search grounding), or ' +
      'when the user explicitly asks what Gemini thinks.',
    inputSchema: {
      prompt: z.string().min(1).describe('The question or instruction to send to Gemini.'),
      model: z
        .string()
        .optional()
        .describe(`Gemini model id. Defaults to ${DEFAULT_MODEL}.`),
      system_instruction: z
        .string()
        .optional()
        .describe('Optional system instruction that sets Gemini\'s role or rules.'),
      search: z
        .boolean()
        .optional()
        .describe('Set true to let Gemini ground its answer in Google Search and cite sources.'),
      temperature: z
        .number()
        .min(0)
        .max(2)
        .optional()
        .describe('Sampling temperature, 0 to 2. Lower is more deterministic.'),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ prompt, model, system_instruction, search, temperature }) => {
    try {
      const ai = getClient();
      const config = {};
      if (system_instruction) config.systemInstruction = system_instruction;
      if (typeof temperature === 'number') config.temperature = temperature;
      if (search) config.tools = [{ googleSearch: {} }];

      const response = await ai.models.generateContent({
        model: model || DEFAULT_MODEL,
        contents: prompt,
        config,
      });
      return textResult(formatResponse(response));
    } catch (err) {
      return errorResult(err);
    }
  }
);

server.registerTool(
  'list_gemini_models',
  {
    title: 'List Gemini models',
    description: 'List the Gemini models this API key can use, so you can pick one for ask_gemini.',
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async () => {
    try {
      const ai = getClient();
      const names = [];
      for await (const model of await ai.models.list()) {
        const actions = model.supportedActions ?? [];
        if (actions.length && !actions.includes('generateContent')) continue;
        names.push(`- ${model.name}${model.displayName ? ` (${model.displayName})` : ''}`);
      }
      return textResult(names.length ? names.join('\n') : 'No models returned.');
    } catch (err) {
      return errorResult(err);
    }
  }
);

await server.connect(new StdioServerTransport());
