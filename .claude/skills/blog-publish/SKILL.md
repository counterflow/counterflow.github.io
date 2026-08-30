---
name: blog-publish
description: Phase 4b of the writing pipeline. Promote a reviewed draft from the workspace into src/content/posts, move assets, validate, build, and commit. Use when Ian says a post is ready to publish or go live.
---

# Publish

Phase 4b. Mechanical and checklist-driven. **Fail loudly rather than guess.**

Publishing is a push to `main`, which triggers
`.github/workflows/deploy.yml` and deploys to GitHub Pages immediately. There
is no staging, no preview deploy, and no undo that isn't itself public.
Treat every step as one-way.

## Step 1 — Preflight

Refuse to continue if any of these fail. Say which one and stop.

- [ ] `review.md` exists and has no unresolved **blockers**
- [ ] Every `source: IAN` asset slot is `HAVE` or `DROPPED`, never `TODO`
- [ ] No `<!-- UNVERIFIED -->` markers left in the draft
- [ ] No `CONTRADICTED` or `UNSUPPORTED` fact-check finding still open
- [ ] Slug doesn't collide with an existing file in `src/content/posts/`

For a series: **every part is ready, or none publishes.** Part 3 going live
while part 2 is a draft leaves a published post whose "previous" link goes
nowhere. The validator hard-errors on this, but catch it here first.

## Step 2 — Compute readTime

Word count ÷ 200, rounded up, formatted `"N min read"`. Derive it; never carry
over a number from the draft. The one published post claims 6 minutes for ~780
words, which is how that goes wrong.

## Step 3 — Move the assets

From `content-workspace/<slug>/assets/` to
`public/assets/images/posts/<slug>/`.

Then **verify every referenced path resolves to a real file.** Check the actual
markdown body and frontmatter, not the outline's intentions. A broken asset
path is invisible in a markdown diff and glaring on the live page — that's why
it's a hard stop, not a warning.

Compress anything oversized before it moves. There's no build-time image
optimisation; whatever gets committed is what every visitor downloads.

## Step 4 — Finalise frontmatter

- `draft: false`
- `date` — today, unless Ian wants it dated otherwise
- `slug` matches the destination filename exactly
- `image` points at the real hero, not template stock
- Series keys present and consistent across all parts

## Step 5 — Promote

Move the file to `src/content/posts/<slug>.md`.

Leave the workspace directory in place. The brief and outline of a published
piece are worth keeping.

## Step 6 — Validate and build

```
npm run validate
```

Then:

```
npm run build
```

`validate` also runs automatically as a `prebuild` hook, so a content error
fails the deploy in CI. Both must pass clean. **Do not proceed past a failure**
— fix it, or back the piece out to the workspace.

## Step 7 — Look at it once more

```
npm run dev
```

Open `/posts/<slug>` and the `/posts` index. Confirm the card renders with the
right hero, and for a series that the index collapses it into one entry and
`/series/<slug>` lists the parts in order.

## Step 8 — Commit, then stop

Commit with a clear message: `Publish <title>` or `Publish <series>, parts 1-4`.

**Then stop and ask before pushing.** Pushing to `main` deploys. That
confirmation is required every time, no matter how routine it feels, and no
matter that he approved the last one.

## After publishing

Offer, don't do automatically:

- Add any tonal corrections from this round to the `## Corrections log` in
  `voice.md`. This is the flywheel — corrections written back are corrections
  you stop needing to be given.
- Note follow-up post ideas that surfaced during review.

## Rules

- **Never skip validation because the change looks small.**
- **Never push without explicit confirmation.**
- If something fails preflight, report it and stop. Don't fix content problems
  silently at publish time — that's how an unreviewed edit reaches a live page.
