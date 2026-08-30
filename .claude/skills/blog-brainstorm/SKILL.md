---
name: blog-brainstorm
description: Phase 1 of the writing pipeline. Interrogate a raw idea, decide post vs multi-part article, agree a working title, and produce the skeleton as brief.md. Use when Ian wants to start a new blog post or article, has a topic to explore, or says he wants to write about something.
---

# Brainstorm a post or article

Phase 1 of the writing pipeline. Turns a raw idea into a skeleton on disk.

**This is a conversation, not a generation task.** Stay in the main session —
do not delegate this to a subagent. The whole point is Ian thinking out loud
with pushback, and a subagent puts a wall between him and the output.

Read `.claude/skills/blogging/references/voice.md` before starting, so the
titles and headings you propose are already in register.

## The output

`content-workspace/<slug>/brief.md`. Nothing else. No prose, no drafting.

---

## Step 1 — Get the idea out

If the user passed a topic as an argument, start there. Otherwise ask what's on
his mind. Let him talk. Don't structure it yet.

## Step 2 — Interrogate it

This is the part that earns the phase. Four questions, and an idea that can't
survive them isn't ready:

1. **What's the claim?** One sentence, asserting something. "AI-native
   development" is a topic, not a claim. "Autonomy is a safety factor, and you
   spend it where failure is cheap" is a claim.
2. **Who disagrees?** Steelman it. If nobody credible disagrees, this is a
   description, not an argument — and descriptions are boring to read and
   boring to write.
3. **What do you know that the reader doesn't?** His standing. 25 years, the
   civil engineering background, agentic tooling built in anger. Specifics, not
   credentials.
4. **What does the reader leave with?** One sentence they could repeat to a
   colleague tomorrow.

Push back honestly. If the answers are thin, **say so and suggest the sharper
version of the idea** rather than dutifully building an outline around
nothing. An outline for an idea with no claim in it wastes phase 2 and 3 as
well.

## Step 3 — Post or article?

Use `AskUserQuestion`. The heuristic:

- **Post** — one load-bearing example, no background needed before the claim
  lands, 400–900 words. Quick reactions, single observations, spilling a thought.
- **Article** — needs more than one example to be convincing, or the reader
  needs groundwork before the claim makes sense. 1200–2000 words per part,
  2–6 parts.

If it's an article, propose the part split and what each part carries. Each
part needs its own claim that serves the series claim — "part 2: more detail"
is not a part.

Be honest when a proposed article is really a post with padding, and when a
"quick post" is actually three posts fighting.

## Step 4 — Working titles

Offer 3–5 across different registers, via `AskUserQuestion`:

- **Blunt** — states the claim. "Autonomy is a safety factor"
- **Metaphor** — the published post's register. "From Buildings to Bytes"
- **Contrarian** — picks the fight. "Your AI pair programmer should not touch
  the schema"
- **Metaphor + subtitle** — the register of the one published post:
  "From Buildings to Bytes: A Structural Engineer's Route to AI-Native Tech Lead"

Derive the slug from the chosen title: lowercase, hyphenated, short. Check it
doesn't collide with an existing file in `src/content/posts/`.

## Step 5 — The skeleton

3–5 sections for a post, 4–7 per part for an article.

**Every heading is a claim, not a label.** This is the single most important
constraint in this phase. "Failure modes come first", never "Failure Handling".
If a heading could appear on any post about any topic, rewrite it. Getting this
right here is what stops phase 3 drifting into
Introduction/Background/Conclusion.

Under each heading, 2–4 beats — the points that section makes. Beats, not prose.

## Step 6 — Write brief.md

Create `content-workspace/<slug>/` and write `brief.md`:

```markdown
---
type: post
slug: agents-are-not-employees
title: "Working title"
status: brief
parts: 1
created: "YYYY-MM-DD"
---

## The claim
One sentence.

## Why me
What I know that the reader doesn't.

## The reader leaves with
One sentence they could repeat to a colleague.

## Who disagrees
The steelman. Named, if there's someone specific.

## Working titles
1. ...
2. ...

## Skeleton

### Section heading as a claim
- beat
- beat
```

For an article, use `type: article`, set `parts: N`, and give each part its own
`## Part N — <claim heading>` block with its own skeleton and a one-line
statement of what that part carries.

## Step 7 — Hand off

Tell him the brief is written, where it is, and that `/blog-plan` is next.
Don't roll straight into planning — the point of phases is that he can stop
here and come back on Saturday.

## Rules

- **Never draft prose in this phase.** Not even a sample paragraph. It anchors
  phase 3 to whatever you happened to write here.
- **Push back on weak ideas.** Being agreeable at this stage costs him a whole
  writing session downstream.
- **One brief per invocation.** If three ideas come out, write the best one and
  note the others in a `## Parked` section at the foot of the brief.
