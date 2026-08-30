# Ian's writing voice

The style contract for everything published on counterflow.github.io.

Derived from "From Buildings to Bytes", the first published post. That's a
sample size of one, so **treat this as a hypothesis to be corrected, not a
law**. Every time Ian rewrites a line you drafted, the rule behind that
rewrite belongs in this file. That's how it gets accurate.

---

## The shape of a piece

**Open with a blunt fact. No wind-up.**

> I didn't start in software. I started as a civil engineer, designing buildings
> where the failure mode isn't a stack trace, it's people.

Not "In this post I want to explore…". Not a definition. Not context-setting.
The first sentence is a claim or a fact, and it's short.

**Headings are claims, not labels.** Compare:

| Write this | Not this |
|---|---|
| Load paths become data flows | Data Flow |
| Failure modes come first | On Failure Handling |
| 25 years, and the same job underneath | Conclusion |

A reader should be able to read only the headings and come away with the
argument. If a heading could sit on any post about any topic, it's a label —
rewrite it.

**Close by calling back to the opening image.** Two short sentences, no summary:

> I went from buildings to bytes. It turns out they carry load the same way.

Never end with a paragraph that restates what was just read.

---

## Sentence and paragraph mechanics

- **Paragraphs run 1–4 sentences.** Never a wall of text.
- **No bullet lists in prose posts.** The published post has zero. Enumerations
  go inside parentheses instead: *"(fatigue, a column losing capacity, a load
  case nobody planned for)"*. Lists are allowed only when the content is
  genuinely tabular — a comparison, a checklist, a set of options.
- **No em dashes.** Commas and parentheses do that work. This is distinctive and
  consistent in the sample; keep it.
- **One bold sentence per section, maximum.** It marks the load-bearing claim:
  *"**you don't apply the same margin everywhere.**"* Bold used more than once
  per section stops meaning anything.
- **Italics are for the question being posed to oneself**, not for general
  emphasis: *"where does the pressure actually go under stress, and what's
  carrying it?"*
- **First person throughout.** "I let an AI agent write my tests." Not "you
  should" and not "we can see that".
- **No rhetorical questions aimed at the reader.** Questions are asked
  inward — the ones an engineer asks while reviewing.

---

## Argument style

**Carry one concrete metaphor the whole way through, and make it do work.**
The structural-engineering frame in the sample isn't decoration; every section
is a real mapping (load path → data flow, safety factor → autonomy budget,
failure mode → blast radius). A metaphor that only appears in the intro and
conclusion is ornament — cut it or commit to it.

**Be contrarian, and be specific about why.** Not "AI hype is bad" but:

> The hype is all happy path and no load diagram: ship on vibes, worry about
> the failure mode never.

**Earn claims with specifics.** "It's why I let an AI agent write my tests but
not my schema migrations" lands because it names the actual boundary. A version
without the specific — "you have to be careful where you apply AI" — says
nothing.

**Concede the real counter-argument.** The brief has a "who disagrees" field
for exactly this reason. A piece with no opposition in it is a description
wearing an argument's clothes.

---

## Banned

Hard no on all of these:

- "In today's fast-paced / ever-evolving / rapidly changing …"
- "It's worth noting that", "It's important to remember", "Needless to say"
- "Let's dive in", "Let's unpack", "Buckle up"
- "game-changer", "supercharge", "leverage" (as a verb), "seamless", "robust
  solution", "best-in-class", "at the end of the day"
- "In this post, I'll cover…" — a section whose only job is announcing the next
  section
- A closing paragraph that summarises what the reader just read
- Tricolons everywhere. One rule-of-three in a piece is rhetoric; four is a tic.
- Hedging stacks: "it might arguably be somewhat of a consideration"
- Sentences that begin "But here's the thing" or "And that's the point"
- Emoji in body prose

---

## Formatting rules that come from the site itself

These aren't taste, they're how the template behaves. Full detail in
`frontmatter.md`.

- **Body starts at `##`.** Never use `#` in the body — the page renders the
  title from frontmatter and strips the first H1 unconditionally. The content
  validator enforces this.
- Code blocks and tables have never appeared on this site. They render fine via
  `@tailwindcss/typography`, but eyeball the first one in both light and dark
  before publishing.
- Diagrams: use a ` ```mermaid ` fence. It renders client-side and re-themes
  with the toggle.

---

## Length targets

| Kind | Words | Sections |
|---|---|---|
| Post | 400–900 | 3–5 |
| Article part | 1200–2000 | 4–7 |

A post that runs past 1000 words is usually an article that hasn't admitted it
yet. Say so rather than padding or truncating.

---

## Corrections log

Append every tonal correction Ian makes, dated, so the rule survives the
session it was learned in.

<!-- e.g. 2026-07-28 — cut "Here's the thing:" from a draft. Never use it. -->
