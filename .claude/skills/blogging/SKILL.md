---
name: blogging
description: Conventions for writing and publishing content on counterflow.github.io — Ian's voice, the frontmatter schema, and asset rules. Use whenever writing, editing or reviewing any post, article or project case study, or when asked how the writing pipeline works.
---

# Writing for Counterflow

Shared conventions for everything published on the site. The phase skills
(`/blog-brainstorm`, `/blog-plan`, `/blog-write`, `/blog-review`,
`/blog-publish`, `/project-new`) all load these.

## The references

Read the one that applies. Don't work from memory of them — `voice.md` in
particular accumulates corrections and goes stale in context.

| File | When |
|---|---|
| `references/voice.md` | Writing or reviewing any prose. The style contract |
| `references/frontmatter.md` | Touching any file in `src/content/` |
| `references/assets.md` | Planning or placing images, diagrams, screenshots, links, video |

## The pipeline

```
/blog-brainstorm  →  brief.md      idea → claim → skeleton (conversation, main session)
/blog-plan        →  outline.md    skeleton → asset slots + research (background researcher)
/blog-write       →  parts/*.md    outline → prose (post-drafter, one per part, parallel)
/blog-review      →  review.md     3 independent critics + look at the rendered page
/blog-publish     →  src/content/  validate, promote, build, commit, ask before pushing
```

State lives on disk in `content-workspace/<slug>/`, never in conversation
context. Every phase reads a file and writes a file, so a piece can be picked up
weeks later or by a subagent with no history.

Projects use `/project-new`, a shorter loop with the same rules.

## The three things that bite

**1. Body starts at `##`, never `#`.** The post template renders the title from
frontmatter and strips the first `<h1>` unconditionally. `npm run validate`
errors on a body H1.

**2. Nothing else validates frontmatter.** There's no content-collection
schema; `getPosts.ts` uses `import.meta.glob` with `|| ''` fallbacks, so a
typo'd key renders as an empty string on a live page rather than failing.
`scripts/validate-content.mjs` is the only check, and it runs on `prebuild`.

**3. Publishing is a push to `main`.** It deploys to GitHub Pages immediately —
no staging, no preview, no private undo. **Always confirm before pushing.**

## Reviewing means looking at the page

`draft: true` is visible in `npm run dev` and hidden in production. So review
by running the dev server and opening the real page, in both light and dark, at
mobile width. Layout, image crops, and diagram legibility are invisible in a
markdown diff.

## Tool discipline

Standing rule on this machine: zero avoidable permission prompts.

- `WebFetch`/`WebSearch` for web, never `curl`/`Invoke-WebRequest`/`wget`
- `Read`/`Grep`/`Glob`/`Edit`/`Write` for files, never `Get-Content`/
  `Select-String`/`cat`/`grep`/`find`
- Never chain shell commands with `;`, `&&`, or `|`
- Web-touching subagents run in the background
