---
name: blog-review
description: Phase 4a of the writing pipeline. Run three independent adversarial reviews of a draft (structure, voice, facts) in parallel and collect them into review.md. Use after /blog-write, or when Ian wants a draft critiqued before publishing.
---

# Review a draft

Phase 4a. Three independent critics, three different lenses, run in parallel.

Independence is the design. Three agents that haven't read each other's
findings won't converge on the same three safe observations, and none of them
has seen the reasoning that produced the draft.

## Step 1 — Spawn all three in one message

So they run concurrently:

| Agent | Lens | Mode |
|---|---|---|
| `post-critic` | Structure and argument, against `brief.md` | foreground |
| `voice-guardian` | Tone, line by line, against `voice.md` | foreground |
| `fact-checker` | Every claim, number and link | **background** (touches the web) |

Each gets the draft path, the workspace path, and `brief.md`. They append their
own section to `content-workspace/<slug>/review.md`.

For a multi-part article, review **part by part** — a critic reading five parts
at once gives five shallow reviews. Structure and voice can run per part in
parallel; add one final `post-critic` pass over the whole series for the spine.

## Step 2 — Look at the rendered page

Not optional, and easy to skip.

```
npm run dev
```

Then open `/posts/<slug>`. `draft: true` posts are visible in dev and hidden in
production, so this is exactly the published page.

Check, in **both** light and dark:

- The hero image — is it there, is the crop right?
- Any mermaid diagram — does it render, is it legible on both backgrounds?
- Code blocks and tables, if the piece has them. Neither has ever appeared on
  this site, so the first one is unproven.
- Mobile width. The site only went responsive recently.
- Series nav, if applicable — do prev/next point at the right parts?

A markdown diff cannot catch any of this.

## Step 3 — Synthesise

When all three report, read `review.md` and present a **ranked** summary. Don't
dump three agent reports on him.

```
Blockers (2)
  1. <problem> — post-critic. <one line on why it matters>
  2. "Studies show most outages..." is unsupported — fact-checker

Worth fixing (3)
  ...

Minor / your call (4)
  ...

Not a problem: voice-guardian found 1 em dash and nothing else.
```

Where critics disagree, say so — that's information, not noise.

**Apply your own judgement.** If a critic is being precious about something
that reads fine, say you disagree and why. Relaying findings uncritically makes
you a pipe, and Ian can read the file himself.

## Step 4 — Revise

Iteratively, **in the main session**. This is conversational — he marks what he
agrees with, you apply it. Spawning an agent per tweak would be absurd.

After substantial revision, re-run only the lens that was failing. A full
three-agent pass on every round is waste.

## Rules

- **Critics report, they don't edit.** All four agent definitions enforce this.
  You apply changes, in the main session, with Ian watching.
- **Never mark something fixed you haven't verified.** If a fact-check finding
  needs a source Ian has to supply, it stays open.
- **An empty finding list is a real result.** Don't manufacture work to look
  thorough. If it's ready, say it's ready.
- **Don't let the piece die here.** Three critics will always find something.
  The test is whether it delivers the brief, not whether it's perfect.
