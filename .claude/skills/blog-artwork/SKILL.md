---
name: blog-artwork
description: Produce any visual asset for counterflow.github.io - hero images, cover art, in-body diagrams, figures, illustrations, charts. Use whenever a post, article part or project needs artwork, when the content validator warns about a missing or placeholder image, or when Ian mentions images, artwork, diagrams, covers, banners or OG images. Author everything directly; never ask Ian to make or fetch an image.
---

# Artwork for the site

Every visual asset on this site is authored here, in the repo, as code.

## The rule that overrides everything else

**Never ask Ian to produce, generate or fetch an image. Never send him to an
external image generator. Never leave a `source: IAN` image slot as his
homework.**

This was tried and it cost him an evening. Diffusion models render garbled
pseudo-code and fake letterforms, which is the worst possible failure on a post
about a code library, and the round trip through another tool puts a human in
the middle of a job that does not need one. Hand-authored SVG is deterministic:
write the geometry, get exactly that geometry, every time.

The only asset that genuinely requires Ian is a photograph or a screenshot of
something real on his own machine. If a piece wants one, first ask whether an
authored figure makes the point better. It usually does, and it always ships
sooner. If it truly must be a screenshot, say so once, plainly, and design the
piece so it works without it.

## Which format

| Need | Format |
|---|---|
| Hero / card / OG image | Hand-authored SVG, `public/assets/images/...` |
| Flow, sequence, state, architecture | ` ```mermaid ` fence in the body |
| A figure mermaid can't express | Hand-authored SVG in the piece's asset dir |
| Anything with real data | Author the SVG; there is no chart library here |
| Photo of a real thing | Ian, and only as a last resort |

## Heroes

```
public/assets/images/posts/<slug>/hero.svg
public/assets/images/projects/<slug>/hero.svg
```

Referenced absolutely from frontmatter, path matching exactly:

```yaml
image: "/assets/images/posts/<slug>/hero.svg"
```

The validator errors on a missing file once `draft: false`, and warns while a
piece still points at the template's `post1.jpg`/`project1.jpg` stock.

### House style

Hold these constant so the index reads as one site.

| Element | Value |
|---|---|
| Canvas | `viewBox="0 0 1600 900"`, 16/9 |
| Ground | `#0f1318` to `#0a0d11` diagonal gradient |
| Grid | 40px `userSpaceOnUse` pattern, stroke `#1a2029`, `opacity="0.55"` |
| Structure | slate `#33404f`, `#4a5a68`, `#5b6b7c` |
| Panel fill | `#161b22`, `#1b222b` |
| Primary accent | amber `#e8a33d` - the live thing, the thing that works |
| Secondary accent | cyan `#6fc7d6` - the copy, the assumption, the untrusted thing |

Two filters carry all the depth needed. `stdDeviation` around 14 to 18 for a
whole panel, 6 to 8 for a point light:

```xml
<filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
  <feGaussianBlur stdDeviation="16" result="b"/>
  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
```

### Composition

- **Abstract geometry, never a literal screenshot.** Represent text as rounded
  bars of varying width and descending opacity. Never draw glyphs.
- **The hero states the argument**, it doesn't decorate it. If the piece
  contrasts two things, so does the image, and the one that matters is visibly
  larger and brighter.
- **Distinguishable at thumbnail size.** Parts of a series sit side by side on
  the index. Vary composition and accent, not just detail.
- Leave real negative space, roughly a third of the canvas.
- Always set `role="img"` and a real `aria-label`.

### Archetypes that have worked

- **Tiled panes, one lit, driven from a single point.** One program
  controlling many things.
- **A sealed box with one status light, beside a large open frame full of
  visible activity.** Observability; knowing a thing is alive versus watching
  it work.
- **A solid form beside a dashed wireframe copy, offset and missing an edge,
  the gap marked in amber.** Assumptions, mocks, models that almost match.
- **A load path traced through a frame, continuing as a flow through nodes to
  ground.** Structural-engineering ideas carried into software.

## In-body diagrams

`src/components/Mermaid.astro` renders ` ```mermaid ` fences client-side. It is
bundled locally, loads only on pages that contain a fence, and re-renders on the
light/dark toggle so a diagram never ends up dark-on-dark.

Constraints that bite:

- It runs `securityLevel: "strict"`, so **HTML in node labels is escaped**.
  `<br/>` inside a quoted label works; `<i>`, `<b>` and links do not.
- Rendering is client-side, so a diagram is invisible with JS off and absent
  from the page source. **Restate its point in a sentence next to it.**
- Keep them small. A 30-node flowchart is unreadable at 896px on a phone.
  Prefer `flowchart LR` with three or four short chains, which stacks
  vertically on a narrow screen.

For anything mermaid can't express, author an SVG into the piece's asset
directory and reference it with plain markdown.

## Checks before moving on

1. No text, no glyphs, no numerals anywhere in an authored SVG.
2. Every colour is valid 3 or 6 digit hex. **Watch for homoglyphs**: a Cyrillic
   `а` in `#4a5а68` parses as garbage and the stroke silently vanishes.
3. Every `id` used in `url(#…)` exists in that file's `<defs>`.
4. `npm run validate` passes.
5. Look at the card and the body in `npm run dev`, in both themes.

## Raster, only if a share preview demands it

SVG renders everywhere in a browser and is fine for the index card. Some social
scrapers won't render an SVG OG image, so a share may fall back to no preview.
If that matters for a specific piece:

```
npx --yes sharp-cli -i public/assets/images/posts/<slug>/hero.svg -o public/assets/images/posts/<slug>/hero.png resize 1600 900
```

Point `image:` at the `.png` and keep the `.svg` beside it as the source. Do
not add an image dependency to `package.json`; this site deliberately has no
build-time image pipeline, so what is committed is what ships.
