---
name: project-new
description: Add or update a project case study in src/content/projects. Use when Ian wants to add a project to the portfolio, write a case study, or showcase something he built.
---

# Add a project

Projects are markdown files in `src/content/projects/`, rendered as cards on
`/projects` and full case-study pages at `/projects/<slug>`.

Shorter loop than a blog post — a project is structured, not argued — but the
same rules apply: real content, validated frontmatter, confirm before pushing.

## Read first

- `.claude/skills/blogging/references/frontmatter.md` — the project schema
- `.claude/skills/blogging/references/voice.md` — case-study prose is still his
  voice
- `.claude/skills/blogging/references/assets.md` — hero and screenshot rules

## Step 1 — Interview

Don't generate a case study from a repo skim. Ask:

1. **What problem did it solve?** For whom? A project with no problem behind it
   is a tech demo, and should be written as one honestly.
2. **What's the interesting constraint?** Every project worth writing up has
   one — a deadline, a hostile API, a scale limit, a platform restriction.
   This is the part a reader actually learns from.
3. **What's the architecture, in three sentences?**
4. **What would you do differently?** The most valuable section and the one
   most often left out. It's also what separates a case study from a brochure.
5. **Is it live? Is the source public?**
6. **Status** — `shipped`, `building`, or `archived`.

If the project is in a local repo, read it — real file names, real stack, real
structure beat anything invented. Never claim a technology is used without
seeing it in the code or hearing it from Ian.

## Step 2 — Assets

Every project needs a hero at
`public/assets/images/projects/<slug>/hero.webp`, 16/9. It's the card image and
the OG image on share.

Screenshots are `source: IAN` — only he can capture the real thing. Say
explicitly what should be visible and what must be redacted: client names,
tokens, internal URLs, customer data.

The validator warns while a project still points at the template's shared
`project1.jpg`/`project2.jpg` stock.

## Step 3 — Write it

`src/content/projects/<slug>.md`:

```markdown
---
title: "Project name"
description: "One line for the card."
summary: "A longer pitch for the detail page."
date: "YYYY-MM-DD"
image: "/assets/images/projects/<slug>/hero.webp"
slug: "<slug>"
stack: ["Astro", "TypeScript", "Tailwind"]
url: "https://..."
repo: "https://github.com/..."
status: "shipped"
order: 1
draft: true
---

## The problem
...

## How it's built
...

## The interesting part
<the constraint, and what it forced>

## What I'd do differently
...
```

Body rules, same as posts: **starts at `##`, never `#`** — the validator errors
on a body H1. Mermaid fences work for architecture diagrams and re-theme with
the toggle.

Keep it short. A case study is 300–600 words. If it wants to be 1500, that's a
blog post about the project, and the two can link to each other.

`order` controls index position; lower sorts first. Unset sorts by date after
everything numbered.

## Step 4 — Review

```
npm run dev
```

Check `/projects` and `/projects/<slug>` in **both** themes: card crop, chips
not overflowing, stack list not wrapping badly, buttons rendering only when
`url`/`repo` are set.

The projects index shows a "Coming soon" empty state until at least one
non-draft project exists, so the first published project is what switches that
page on.

## Step 5 — Publish

- `draft: false`
- `npm run validate` — must pass
- `npm run build` — must pass
- Commit
- **Ask before pushing.** Push to `main` deploys to GitHub Pages immediately.

## Rules

- **Never invent capabilities, metrics, or outcomes.** This is a portfolio a
  potential client reads. A fabricated number is a real problem.
- **Don't describe private client work in identifying detail** without asking
  what's shareable.
- "What I'd do differently" is not optional. A case study without it reads as
  marketing.
