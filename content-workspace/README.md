# Content workspace

Work in progress. Nothing in here is built or deployed — Astro only reads
`src/content/`.

One directory per piece:

```
content-workspace/
  <slug>/
    brief.md      /blog-brainstorm  — the claim, the counter-argument, the skeleton
    outline.md    /blog-plan        — skeleton + asset slots + section specifics
    research.md   /blog-plan        — references, prior art, gaps (post-researcher)
    assets/                         — working images/diagrams before they move to public/
    parts/                          — drafts (post-drafter)
      01-draft.md
    review.md     /blog-review      — findings from the three critics
```

`/blog-publish` promotes the finished markdown into `src/content/posts/` and
the assets into `public/assets/images/posts/<slug>/`.

**The workspace directory stays after publishing.** Six months from now the
brief and outline of a piece are worth more than the disk space, and the
outline of a post that never got written is worth more still.

This is committed deliberately. The pipeline's whole design is that state lives
on disk rather than in a conversation, which only holds if the state survives a
machine rebuild.

See `.claude/skills/blogging/SKILL.md` for the pipeline, and
`docs/blogging-pipeline.md` for the full design.
