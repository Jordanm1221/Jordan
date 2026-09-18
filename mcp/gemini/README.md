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

It takes three steps and about two minutes.

### 1. Get a Gemini API key

Go to https://aistudio.google.com/apikey and create a key. It is free to start.
Copy the key.

### 2. Put the key in your environment

Add this line to `~/.zshrc` (Mac) or `~/.bashrc` (Linux), then open a new
terminal:

```bash
export GEMINI_API_KEY="paste-your-key-here"
```

Do not paste the key into any file in this repo. Anything committed here is
permanent and public to anyone with repo access.

### 3. Install the server

```bash
cd mcp/gemini
npm install
```

That is it. The next time you start Claude Code in this repo, it reads
`.mcp.json` at the repo root and starts the server. Claude Code will ask you
once to approve the server. Say yes.

## Check that it worked

In Claude Code, run:

```
/mcp
```

You should see `gemini` listed as connected. Then ask Claude something like
"ask Gemini what it thinks about this headline" and it will call the tool.

## Changing the default model

The default is `gemini-2.5-pro`. To change it, set this in the same file where
you put your key:

```bash
export GEMINI_MODEL="gemini-2.5-flash"
```

Flash is faster and cheaper. Pro is stronger on hard problems. You can also
override the model on any single call by telling Claude which one to use.

## If it does not connect

- **"No API key found"** — the key is not in your environment. Open a new
  terminal after editing `~/.zshrc` or `~/.bashrc`, then run
  `echo $GEMINI_API_KEY` to confirm it is set.
- **Server fails to start** — you skipped `npm install` in `mcp/gemini`.
- **Nothing in `/mcp`** — you started Claude Code from a different folder.
  Start it from the repo root so it finds `.mcp.json`.
