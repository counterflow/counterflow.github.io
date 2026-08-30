---
name: blog-write
description: Phase 3 of the writing pipeline. Draft full prose from an approved outline using post-drafter subagents — one per part, in parallel for a multi-part article. Use after /blog-plan, or when Ian says to write up an outline.
---

# Draft the prose

Phase 3. The outline becomes finished prose.

## Read first

The piece's `outline.md`, `brief.md`, and `research.md`. If `outline.md` has no
asset slots, `/blog-plan` hasn't run — go do that first rather than drafting
against a bare skeleton.

## Step 1 — Check the homework

Before spawning anything, check the outline's `source: IAN` slots.

If any are still `TODO`, list them and ask whether to proceed. Sometimes the
answer is "draft it anyway, I'll capture the screenshot later" — that's fine,
the reference gets written and publish catches the missing file. But he should
choose it, not discover it.

## Step 2 — Draft

**Single post** — one `post-drafter`, foreground. Ian is waiting on this and
there's nothing to parallelise.

**Multi-part article** — one `post-drafter` per part, **all spawned in a single
message so they run concurrently.** This is the real justification for
subagents in this pipeline: five parts drafted sequentially in one context
means part five is written by a model saturated with its own prose.

Each drafter gets:

- The full `brief.md` — so it knows the series spine
- Its own part of `outline.md`
- `research.md`
- **One-line summaries of every other part**, so it neither re-explains part 1
  nor pre-empts part 4
- Its output path: `content-workspace/<slug>/parts/<NN>-draft.md`

The `post-drafter` agent definition carries the voice contract and the hard
constraints. Don't restate them in the prompt; point at the piece.

## Step 3 — Reconcile the seams

Article only, and don't skip it. Read the parts in sequence and check:

- **Repetition.** Two parts explaining the same concept from scratch.
- **Gaps.** Part 3 assuming something no part established.
- **Tonal drift.** Parts written in parallel can land in different registers.
- **Continuity.** Do the forward and backward references actually match what
  the neighbouring parts say?

Fix seams directly in the main session. Spawning an agent per seam is absurd.

## Step 4 — Frontmatter

Every draft carries valid frontmatter per
`.claude/skills/blogging/references/frontmatter.md`, with:

- `draft: true` — always, no exceptions
- `readTime` computed from word count (words ÷ 200, rounded up), not invented
- `image` pointing at the planned hero path whether or not the file exists yet
- Series keys on every part, with identical `seriesTitle` and contiguous `part`
  numbers from 1

## Step 5 — Report

Tell him:

- Word count per part and total
- Anything the drafters changed or dropped from the outline, and why
- Assets referenced that don't exist on disk yet
- Any claim marked `UNVERIFIED`
- Where the files are

Then: `/blog-review` next, or read it first — his call.

## Rules

- **Never write into `src/content/`.** Drafts live in the workspace until
  `/blog-publish` promotes them. Nothing half-finished should ever be one
  `draft: false` away from a live page.
- **One part per drafter.** A single agent writing three parts defeats the
  purpose.
- **Don't self-review here.** Drafting and criticising in the same context
  produces a review that defends the draft. That's `/blog-review`'s job, with
  agents that haven't seen the drafting.
- If a drafter reports the outline fought it, surface that — it usually means
  a section has no real content, and that's a phase 2 problem worth fixing at
  the source.
