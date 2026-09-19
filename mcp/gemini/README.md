# Gemini MCP Server

This lets Claude ask Google Gemini a question and read the answer back.

Claude stays the assistant you talk to. Gemini becomes a tool Claude can call,
the same way it calls Google Calendar or Notion.

## What you get

Two tools:

- **ask_gemini** — sends a prompt to Gemini and returns the answer. Options:
  pick a model, add a system instruction, set temperature, or turn on Google
  Search so Gemini cites real sources.
- **list_gemini_models** — shows which Gemini models your key can use.

## Setup

Three steps, about two minutes.

### 1. Get a Gemini API key

Go to https://aistudio.google.com/apikey and create a key. Copy it.

### 2. Put the key in your environment

Add this line to `~/.zshrc` (Mac) or `~/.bashrc` (Linux), then open a new
terminal:

```bash
export GEMINI_API_KEY="paste-your-key-here"
```

Do not paste the key into any file in this repo. Anything committed here is
permanent and visible to anyone with repo access.

### 3. Install the server

```bash
cd mcp/gemini
npm install
```

Done. Next time you start Claude Code in this repo it reads `.mcp.json` at the
repo root and starts the server. Claude Code asks you once to approve it. Say
yes.

## Check that it worked

In Claude Code, run `/mcp`. You should see `gemini` connected. Then ask Claude
something like "ask Gemini what it thinks about this headline."

## What a free key can and cannot do

This matters, because the limits are not obvious and the error messages are
vague.

**Works on a free key:** all the Flash models. That is the everyday workhorse —
fast, 1 million token context, good enough for almost anything you would ask a
second model.

**Needs billing turned on:** the Pro models, and Google Search grounding
(the `search` option). Both return a quota error on a free key, even though
Pro models show up in `list_gemini_models`. Turn on billing at
https://aistudio.google.com/apikey if you want them.

## Choosing a model

The default is `gemini-flash-latest`, which always points at the newest Flash
model so it never goes stale. To change it, set this next to your key:

```bash
export GEMINI_MODEL="gemini-3.8-flash"
```

You can also name a model on any single call by telling Claude which one to use.

One warning: `list_gemini_models` shows everything Google advertises to your
key, including older models that have since been retired for new users. If a
model returns a 404 saying it is "no longer available to new users," pick a
newer one.

## If it does not connect

- **"No API key found"** — the key is not in your environment. Open a new
  terminal after editing `~/.zshrc` or `~/.bashrc`, then run
  `echo $GEMINI_API_KEY` to confirm.
- **Server fails to start** — you skipped `npm install` in `mcp/gemini`.
- **Nothing in `/mcp`** — you started Claude Code from a different folder.
  Start it from the repo root so it finds `.mcp.json`.
- **"High demand, try again later"** — Google's side, not yours. Retry.
