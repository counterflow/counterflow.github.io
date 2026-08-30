# Frontmatter and file conventions

The exact contract for `src/content/posts/*.md` and `src/content/projects/*.md`.

Enforced by `scripts/validate-content.mjs`, which runs automatically via the
`prebuild` npm hook — a content error fails the GitHub Actions deploy rather
than shipping a broken page.

---

## Posts

```yaml
---
title: "I didn't write a daemon, and here's what that bought me"
subtitle: "What supervising a long-running coding agent taught me about agent infrastructure"
description: "Process supervision asks whether the worker is healthy. Agent supervision asks whether the work is healthy. Why a long-running agent went in tmux."
date: "2026-07-08"
readTime: "6 min read"
image: "/assets/images/posts/from-buildings-to-bytes/hero.webp"
slug: "from-buildings-to-bytes"
draft: false
---
```

| Key | Required | Notes |
|---|---|---|
| `title` | yes | Rendered in `<h1>`, `<title>`, and OG title |
| `subtitle` | no | Deck line under the title on the post page. Use when the title is deliberately narrow or contrarian and the piece is arguing something broader: the title earns the click, the subtitle says what the argument actually is. Not used on cards or in OG, so it can be plainer than `description`. When set it **replaces** `description` in the lead position, so don't write the same sentence twice |
| `description` | yes | Index card, meta description, OG description. One or two sentences, **under 160 chars** or search results truncate it |
| `date` | yes | Quoted `YYYY-MM-DD`. Drives sort order *and* `schema.org` `datePublished`. Must be a real calendar date |
| `readTime` | yes | Free text. **Compute it** — words ÷ 200, rounded up. Don't invent it |
| `image` | yes | Absolute path from `public/`. Appears on the index card **and** as the OG image on every share |
| `slug` | yes | Must match the filename. The URL follows `slug`, so a mismatch makes the file unfindable later |
| `draft` | yes | Always set explicitly. `true` = visible in `npm run dev`, hidden in production |

### Series keys (multi-part articles only)

```yaml
series: "agents-in-production"
seriesTitle: "Agents in Production"
part: 2
partsTotal: 4
```

| Key | Notes |
|---|---|
| `series` | Slug shared by every part. Drives `/series/<slug>` |
| `seriesTitle` | Display name. **Must be identical across all parts** |
| `part` | 1-based. Must be contiguous from 1 across the series |
| `partsTotal` | Planned length. May exceed the number of published parts mid-run |

**Publish a series all-or-nothing.** The validator hard-errors if part 3 is live
while part 2 is still a draft, because that leaves a published post whose
"previous" link points at nothing.

---

## Projects

```yaml
---
title: "Counterflow"
description: "The site you're reading, and the agent pipeline that writes it."
summary: "A longer pitch shown on the project page under the title."
date: "2026-07-28"
image: "/assets/images/projects/counterflow/hero.webp"
slug: "counterflow"
stack: ["Astro", "TypeScript", "Tailwind", "GitHub Pages"]
url: "https://counterflow.github.io"
repo: "https://github.com/counterflow/counterflow.github.io"
status: "shipped"
order: 1
featured: true
draft: false
---
```

| Key | Required | Notes |
|---|---|---|
| `title` | yes | |
| `description` | yes | One line, shown on the index card |
| `summary` | no | Longer pitch on the detail page. Falls back to `description` |
| `date` | yes | `YYYY-MM-DD` |
| `image` | yes | Card and hero |
| `slug` | yes | Must match filename |
| `stack` | no | List. First four render as chips on the card |
| `url` | no | Absolute http(s). Omit if not deployed |
| `repo` | no | Absolute http(s). Omit if private |
| `status` | no | `shipped` \| `building` \| `archived`. Defaults to `shipped` |
| `order` | no | Lower sorts first. Unset sorts after everything numbered, by date |
| `featured` | no | Reserved for index emphasis |
| `draft` | no | Same dev-visible/prod-hidden behaviour as posts |

The markdown body is the case study. Suggested spine: the problem, the shape of
the solution, one interesting constraint, what you'd do differently.

---

## Rules that apply to both

**1. Body starts at `##`. Never `#`.**
`posts/[slug].astro` renders the title from frontmatter, then removes the first
`<h1>` from the prose container in JS *and* hides it in CSS. That strip is
unconditional, so a `#` used for a genuine mid-post heading gets eaten. The
validator errors on any body H1.

**2. Assets live in `public/`, referenced absolutely.**
There's no import pipeline and no `astro:assets` optimisation — images ship at
whatever size they're committed at. Compress first; prefer `.webp`.

**3. Per-piece asset directories.**

```
public/assets/images/posts/<slug>/hero.webp
public/assets/images/posts/<slug>/<diagram-name>.svg
public/assets/images/projects/<slug>/hero.webp
```

The template's `post1.jpg`/`post2.jpg`/`project1.jpg` placeholders are shared
stock. Reusing one across several pieces makes the index look like an
abandoned template, so the validator warns whenever a piece still points at one.

**4. Drafts are dev-visible, prod-hidden.**
`draft: true` is the *review* state, not the hidden state. Review by running
`npm run dev` and opening the real page — that catches layout and image
problems a markdown diff never will.

**5. Publishing is a push to `main`.**
`.github/workflows/deploy.yml` fires on push, builds, and deploys to GitHub
Pages. No staging, no preview deploy, no undo that isn't itself public.
**Always confirm with Ian before pushing.**

---

## Nothing else validates this

`getPosts.ts` and `getProjects.ts` read frontmatter through `import.meta.glob`
with `|| ''` fallbacks on every field. There is no content-collection schema.
A misspelled key therefore doesn't throw — it renders an empty string on a live
page. `scripts/validate-content.mjs` exists specifically to close that gap; run
`npm run validate` any time content changes.
