# The Counterflow Writing Pipeline

A skills/subagent workflow that takes an idea from "I have a thought" to live on
counterflow.github.io — plus the site infrastructure it needs.

**Status: built and verified.** This document is both the design rationale and
the reference for what exists.

---

## 1. The shape of it

Four phases, each with a hard artifact on disk. You drive phases 1 and 2. I do
most of 3. We share 4.

```
  ┌─ 1. BRAINSTORM ──┐  ┌─ 2. PLAN ───────┐  ┌─ 3. WRITE ─────┐  ┌─ 4. SHIP ────┐
  │ topic → angle    │  │ outline →       │  │ outline →      │  │ review →     │
  │ working titles   │→ │ asset slots,    │→ │ full prose     │→ │ revise →     │
  │ H2 skeleton      │  │ refs, evidence  │  │ (per part)     │  │ publish      │
  │ post or article? │  │                 │  │                │  │              │
  └──────────────────┘  └─────────────────┘  └────────────────┘  └──────────────┘
      brief.md              outline.md          parts/*.md          src/content/
      /blog-brainstorm      + research.md       /blog-write         /blog-review
                            /blog-plan                              /blog-publish
```

The whole design rests on one principle:

> **State lives on disk, not in the conversation.**

You will not write a post in one sitting. You'll brainstorm on Monday, plan on
Wednesday, and write on Saturday. If phase 2 depends on remembering phase 1's
conversation, the pipeline breaks the moment you close the terminal. So every
phase reads a file, writes a file, and assumes it knows nothing else.

This is also what makes subagents viable at all. A subagent gets a fresh
context; if the plan is a file, the subagent can read it. If the plan is
"what we discussed earlier", it can't.

---

## 2. Posts vs Articles

| | **Post** | **Article** |
|---|---|---|
| Purpose | Quick reaction, one thought, spilling | Sustained argument across parts |
| Length | 400–900 words | 1200–2000 words × 2–6 parts |
| Structure | 3–5 `##` sections | Per-part sections + a spine across parts |
| Lifecycle | Idea → live in one or two sittings | Planned as a set, published as a set |
| Files | one `.md` | one `.md` per part, sharing `series` keys |
| Index | One card | Collapses to **one** card listing the parts |
| Extra pages | — | `/series/<slug>` index, prev/next on each part |

The distinction is a judgement call made in phase 1, and `/blog-brainstorm`
pushes back both ways: an article that's really a post with padding, and a
"quick post" that's actually three posts fighting.

---

## 3. The workspace

One directory per piece, outside `src/` so half-finished work can never
accidentally build:

```
content-workspace/
  <slug>/
    brief.md      /blog-brainstorm  — claim, counter-argument, skeleton
    outline.md    /blog-plan        — skeleton + asset slots + specifics
    research.md   /blog-plan        — references, prior art, gaps
    assets/                         — working files before they move to public/
    parts/        /blog-write       — drafts
      01-draft.md
    review.md     /blog-review      — findings from the three critics
```

Committed deliberately, not gitignored. The design only holds if the state
survives a machine rebuild, and six months from now the outline of a post you
never finished is worth more than the disk space.

Publishing *promotes* a file out of `content-workspace/` into
`src/content/posts/`. Nothing in `src/content/posts/` is ever half-written.

---

## 4. The skills

Project-scoped in `.claude/skills/`, so they're versioned with the repo and
know its conventions.

| Skill | Phase | Where it runs |
|---|---|---|
| `/blog-brainstorm` | 1 | Main session — it's a conversation |
| `/blog-plan` | 2 | Main session + background research agent |
| `/blog-write` | 3 | Subagents — one per part, in parallel |
| `/blog-review` | 4a | Three adversarial agents in parallel |
| `/blog-publish` | 4b | Mechanical checklist, no agents |
| `/project-new` | — | Shorter loop for portfolio case studies |
| `blogging` | — | Shared conventions; auto-loads for any content work |

### `/blog-brainstorm`

Interrogates the idea before outlining it. Four questions: what's the claim,
who disagrees, what do you know that the reader doesn't, what does the reader
leave with. An idea that can't survive those isn't ready, and the skill says so
rather than dutifully outlining nothing.

Then post-vs-article (via `AskUserQuestion`), 3–5 working titles across
registers (blunt / metaphor / contrarian / metaphor+subtitle), and the
skeleton — where **every heading is written as a claim, not a label**. Your
published post already does this ("Failure modes come first"), and encoding it
at skeleton stage is what stops phase 3 drifting into
Introduction/Background/Conclusion.

### `/blog-plan`

Fires `post-researcher` into the background immediately, then walks the
skeleton with you placing **asset slots** — specs, not wishes:

```markdown
> [!ASSET] diagram · required
> id: margin-allocation
> shows: two axes, blast radius vs reversibility; four quadrants labelled
> format: mermaid
> alt: "Chart mapping engineering decisions by blast radius and reversibility"
> source: CLAUDE
> status: TODO
```

`source` is the field that matters: `CLAUDE` (I produce it) vs `IAN` (only you
can — screenshots of real work, photos, numbers from private projects). The
skill ends by printing your homework list, so phase 3 never stalls waiting on
an image.

### `/blog-write`

Single post → one drafter. **Multi-part article → one `post-drafter` per part,
spawned in a single message so they run concurrently.** That's the real
justification for subagents here: five parts drafted sequentially in one
context means part five is written by a model saturated with its own prose.

Each drafter gets the brief, its own outline section, the research, and
one-line summaries of every other part so it neither re-explains part 1 nor
pre-empts part 4. Then a seam-reconciliation pass in the main session catches
repetition, gaps and tonal drift between parallel parts.

### `/blog-review`

Three critics, three lenses, spawned together, none having seen the drafting
reasoning:

- `post-critic` — structure and argument, **against `brief.md`**. The brief is
  a contract, so "does it deliver what it promised" is a sharper test than "is
  this good writing".
- `voice-guardian` — tone, line by line, against `voice.md`. Pedantic by
  design; a generalist reviewer is always too polite about tone.
- `fact-checker` — every claim, number, and link. Background, since it's web-bound.

Then you look at the rendered page (`npm run dev` shows `draft: true` posts
exactly as they'll appear live), and revision happens conversationally in the
main session.

### `/blog-publish`

Preflight → compute `readTime` → move assets → verify every path resolves →
`draft: false` → promote → `npm run validate` → `npm run build` → commit →
**stop and ask before pushing.**

---

## 5. The subagents

In `.claude/agents/`. Each has a reason to exist beyond "we could".

| Agent | Model | Tools | Why it's an agent |
|---|---|---|---|
| `post-researcher` | Sonnet | Read, Grep, Glob, WebSearch, WebFetch | Web fan-out is slow and noisy; runs in background so its 40 fetched pages never enter your context |
| `post-drafter` | Opus | Read, Write, Glob, Grep | Clean context per part; parallelism across a series is the actual win |
| `post-critic` | Opus | Read, Glob, Grep | Independence — hasn't seen the drafting rationalisations |
| `voice-guardian` | Sonnet | Read, Grep, Glob | One narrow job done pedantically |
| `fact-checker` | Sonnet | Read, Grep, Glob, WebSearch, WebFetch | Web-bound, and claims published under your real name |

All five are briefed with the no-permission-spam rules: dedicated tools over
shell, no chained commands, no reaching outside the workspace.

**Where subagents are deliberately not used:** brainstorming (a conversation),
applying review notes (iterative and small), publishing (a checklist). The
temptation is to make every step an agent because it feels sophisticated. It
isn't; it's slower, and it puts a context boundary between you and the work at
exactly the moments you want to be close to it.

---

## 6. The knowledge files

`.claude/skills/blogging/references/`. Skills are orchestration; these are the
content, and they determine whether output sounds like you or like a language
model.

- **`voice.md`** — the style contract, derived from "From Buildings to Bytes":
  blunt opening fact, 1–4 sentence paragraphs, no bullet lists in prose
  (enumerations go in parentheses), no em dashes, headings as claims, one bold
  sentence per section, italics only for the inward question, a metaphor that
  does real work in every section, callback ending. Plus a banned-phrase list.
- **`frontmatter.md`** — the exact schema for posts and projects, and the
  behaviours that bite.
- **`assets.md`** — the slot format, mermaid, images, screenshots, code, links,
  video.

`voice.md` has a **corrections log** at the foot. Every time you rewrite a line
I drafted, the rule behind that rewrite goes in there. That's the flywheel:
each correction written back is one I stop needing to be given. It's the single
highest-leverage maintenance habit in this whole system.

---

## 7. What was built in the site

### Series support

- `getPosts.ts` — `series`/`seriesTitle`/`part`/`partsTotal` frontmatter,
  `getSeries()`, `getAllSeries()`, `getSeriesNav()`, and `getPostListEntries()`
  which collapses a series into one index row.
- `posts/[slug].astro` — "Part N of M · Series Title" badge linking to the
  series page, and prev/next cards at the foot.
- `posts.astro` — series render as one card with a parts badge and an inline
  part list. Pagination counts a series as one row, so a six-part article can't
  push everything else off page one.
- `series/[series].astro` — new series index page.

*Verified:* badge reads "Part 1 of 2 · ZZ Test Series", next→part 2, prev
absent on part 1, index shows 2 cards for 3 posts, `/series/<slug>` lists parts
in order.

### Mermaid diagrams

` ```mermaid ` fences in markdown now render as diagrams, via
`src/components/Mermaid.astro`.

The non-obvious part: Astro highlights fenced blocks with Shiki, which
tokenises the source into per-line `<span class="line">` elements on a
`<pre data-language="mermaid">`. Reading `textContent` off that loses the
newlines mermaid needs, so the component reassembles the definition line by
line. (`shikiConfig.excludeLangs` doesn't take effect in this Astro version —
handling it in the component works regardless.)

Mermaid is loaded from the local npm package, not a CDN, and only on pages that
contain a fence — it code-splits per diagram type, so a post without diagrams
downloads none of it.

*Verified:* SVG renders; toggling the theme re-renders it (`fill:#ccc` dark →
`#333` light) with no duplicate SVGs.

### Projects, data-driven

- `src/content/projects/*.md` + `getProjects.ts`, mirroring how posts work
  (including dev-visible/prod-hidden drafts).
- `projects.astro` — real cards with status and stack chips, off the hardcoded
  placeholder array. Falls back to the "Coming soon" empty state until the
  first non-draft project exists.
- `projects/[slug].astro` — full case-study page with stack chips, Visit/Source
  buttons, hero, mermaid support, and JSON-LD.
- The three fake "Project One/Two/Three" entries are gone from `content.ts`,
  which now holds page copy only.

*Verified:* detail page renders title, summary, three stack chips, both
buttons, prose sections, and JSON-LD.

### Content validation

`scripts/validate-content.mjs`, wired to `npm run validate` **and the
`prebuild` hook** — so a content error fails the GitHub Actions deploy instead
of shipping.

Checks: required keys, real `YYYY-MM-DD` dates, slug/filename match, asset
paths actually resolving under `public/`, duplicate slugs, body `# H1`, series
integrity (contiguous parts, consistent `seriesTitle`, no published part
orphaned by a draft predecessor), project status/URL validity. Warns on
template stock images.

**Draft content downgrades errors to warnings** — drafts aren't deployed, so a
half-finished post must never block a deploy.

### Also

- `PageShell.astro` — extracts the theme bootstrap, background layers and
  layout that every page duplicates. Used by the three new pages; existing
  pages were left alone deliberately, since refactoring them is visual-
  regression risk for no functional gain.
- The published post's body `# H1` was removed to match the new convention.
  No visual change — the template already stripped it.

---

## 8. Repo gotchas the skills encode

**1. Body starts at `##`, never `#`.** `posts/[slug].astro` renders the title
from frontmatter, then removes the first `<h1>` from the prose container in JS
*and* hides it in CSS. That strip is unconditional, so a `#` used for a genuine
mid-post heading gets eaten. The validator now errors on it.

**2. Nothing else validates frontmatter.** `getPosts.ts`/`getProjects.ts` use
`import.meta.glob` with `|| ''` fallbacks on every field. There's no
content-collection schema, so a misspelled key doesn't throw — it renders an
empty string on a live page. `validate-content.mjs` is the only check.

**3. Drafts are dev-visible, prod-hidden.** `draft: true` is the *review*
state. Review means running `npm run dev` and opening the real page, in both
themes, at mobile width.

**4. Assets ship unoptimised.** No `astro:assets` pipeline — whatever is
committed is what every visitor downloads. Compress first, prefer `.webp`.

**5. Publishing is a push to `main`.** `deploy.yml` fires on push, builds, and
deploys to Pages. No staging, no preview, no undo that isn't itself public.
Every skill that can push asks first.

**6. Prose styling is `@tailwindcss/typography` defaults.** Code blocks and
tables have never appeared on this site. The first one should be eyeballed in
both themes.

---

## 9. Decisions made

| Decision | Choice |
|---|---|
| Series support | Built now, before the first article |
| Diagrams | Client-side mermaid from the local package — **not** `rehype-mermaid`, which needs Playwright in CI and would add ~1min to every deploy |
| Workspace | Committed |
| Body `#` | Adopted `##`; existing post migrated |
| Frontmatter validation | Script + `prebuild` hook, not a `PostToolUse` hook — it fires where it matters (the deploy) without firing on every file write |

---

## 10. Known gaps

**Astro deprecation warning.** The build now warns that auto-generating
collections from `src/content/` folders is deprecated, and suggests defining
them in `src/content.config.ts`. It's a warning, not a failure, and fixing it
means migrating `getPosts.ts`/`getProjects.ts` to `getCollection()` — a real
refactor with a real upside (schema validation would move into Astro, which
partly replaces the validator). Worth doing on its own, not mid-pipeline.

**Mermaid is client-side.** A diagram is invisible with JS off and doesn't
appear in page source for search engines. `assets.md` tells drafters to restate
a diagram's point in nearby prose when it carries load the text doesn't.

**No video component.** Raw HTML works in markdown, but an unstyled iframe
blows out the 896px container on mobile. If video becomes routine it needs a
responsive wrapper component first.

**No tags, categories, RSS, or `updated` date.** Deferred deliberately —
none of them block writing. Worth revisiting at ten posts, RSS first.

---

## 11. Using it

```
/blog-brainstorm <topic>     idea → brief.md
/blog-plan                   brief → outline.md + research.md + your homework
/blog-write                  outline → drafts
/blog-review                 three critics + look at the rendered page
/blog-publish                validate, promote, build, commit, ask before pushing

/project-new                 portfolio case study, shorter loop
```

Start anywhere. Each phase reads from disk, so picking up a piece three weeks
later costs nothing.
