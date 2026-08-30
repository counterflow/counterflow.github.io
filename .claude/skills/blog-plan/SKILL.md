---
name: blog-plan
description: Phase 2 of the writing pipeline. Take an approved brief and turn it into a fully specified outline with asset slots for images, diagrams, screenshots, code and references, plus a background research pass. Use after /blog-brainstorm, or when Ian wants to flesh out a skeleton before writing.
---

# Plan a post or article

Phase 2. Turns a skeleton into a build-ready outline where every supplementary
element is specified, and every dependency on Ian is surfaced *before* drafting
starts.

The deliverable is `outline.md` plus `research.md`, and a printed list of what
Ian has to supply.

## Read first

- The piece's `brief.md` — if there isn't one, run `/blog-brainstorm` first
- `.claude/skills/blogging/references/assets.md` — the asset slot format
- `.claude/skills/blogging/references/voice.md`
- `.claude/skills/blogging/references/frontmatter.md`

---

## Step 1 — Launch research in the background

Immediately, before anything else, so it works while you plan:

```
Agent(subagent_type: "post-researcher", run_in_background: true)
```

Give it the brief's claim, the counter-argument, the skeleton, and the
workspace path to write `research.md` into. Background is not optional — it
touches the web, and blocking Ian behind it (or burying him in prompts) breaks
the standing rule about permission spam.

Carry on planning while it runs.

## Step 2 — Deepen the skeleton

Walk the skeleton section by section with Ian. For each:

- Are the beats in the right order? Argument order, not chronology.
- Which beat is the load-bearing claim? That one gets the bold sentence.
- What's the concrete specific that makes this section land? A vague section is
  one missing its example.
- Does the central metaphor do work here, or is this the section where it goes
  decorative?

Sharpen headings that drifted toward labels.

## Step 3 — Place the asset slots

The core of this phase. Go through the outline and ask, section by section:
**what would make this land harder than prose alone?**

Then specify each as a slot. Format and full field reference in `assets.md`:

```markdown
> [!ASSET] diagram · required
> id: margin-allocation
> shows: two axes, blast radius vs reversibility; four quadrants labelled with
>        real engineering decisions
> format: mermaid
> alt: "Chart mapping engineering decisions by blast radius and reversibility"
> source: CLAUDE
> status: TODO
```

**`source` is the field that matters.** `CLAUDE` means I can produce it —
mermaid diagrams, code samples, reference links. `IAN` means only he can:
screenshots of real work, photos, video, numbers from private projects, code
from a client repo.

Every piece needs at minimum a hero image slot
(`/assets/images/posts/<slug>/hero.webp`). It's the index card and the OG image
on every share, and the validator warns while it's still pointing at the
template's shared stock.

Don't over-specify. Two good assets beat six decorative ones, and every slot
marked `IAN` is homework that can stall the piece.

## Step 4 — Fold in the research

When `post-researcher` reports back, read `research.md` and:

- Attach relevant sources to the sections that need them.
- **Read the Gaps section carefully.** A claim in the brief that research
  couldn't support is a decision for Ian now, not a surprise at review. Raise
  it explicitly: soften the claim, cut it, or assert it as personal experience.
- If research found the angle is already well covered elsewhere, say so. Better
  to hear it now than after drafting.

## Step 5 — Write outline.md

`content-workspace/<slug>/outline.md`:

```markdown
---
type: post
slug: agents-are-not-employees
title: "Chosen working title"
status: planned
parts: 1
---

## Section heading as a claim
- beat
- beat  ← load-bearing, gets the bold sentence
- specific: <the concrete example>

> [!ASSET] ...
```

For an article, one `## Part N` block per part, each with its own sections,
slots, and a one-line summary of what that part carries. The drafters get those
summaries so no part re-explains another.

## Step 6 — Print the homework

End with an explicit checklist — this is what Ian remembers from the phase:

```
Before /blog-write can run, I need from you:
  [ ] hero image — 16/9, .webp, goes in public/assets/images/posts/<slug>/
  [ ] screenshot of the agent PR diff (section 3)

I'll produce:
  [x] margin-allocation diagram (mermaid)
  [x] 4 reference links — in research.md

Open decisions:
  - research found no support for "most outages are load-path failures".
    Soften, cut, or assert from experience?
```

## Rules

- **Don't draft prose.** Beats and specs only.
- **Every slot gets real alt text now**, written properly. It's never written
  properly later.
- **Mark uncertainty rather than resolving it silently.** An unsupported claim
  that reaches a live page under Ian's name is the failure this phase exists to
  prevent.
- **Assets can be dropped.** `status: DROPPED` with a reason is a good outcome
  — better than a placeholder that blocks the piece for a week.
