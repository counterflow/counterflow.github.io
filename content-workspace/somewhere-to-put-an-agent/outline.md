---
type: article
slug: somewhere-to-put-an-agent
title: "Somewhere to Put an Agent"
status: planned
parts: 2
---

## Series frontmatter

Both parts carry these, identically:

```yaml
series: "somewhere-to-put-an-agent"
seriesTitle: "Somewhere to Put an Agent"
partsTotal: 2
```

Part slugs: `i-didnt-write-a-daemon` (part 1), `what-a-mock-encodes` (part 2).
Publish all-or-nothing: the validator hard-errors if part 2 goes live while
part 1 is still a draft.

## Standing constraints for both drafters

- **Publication boundary, and it is hard.** `gotmucks` and this site are
  public. The agent launcher is a **private** project. Never name it, link it,
  quote its planning documents, or describe its internals, roadmap, data model
  or commercial direction. It appears only as "a remote agent launcher I'm
  building". This outline is committed to a public repository, so the rule
  applies to this file too.
- The launcher stays **generic**. "A remote agent launcher I'm building." No
  name, no link, no implied availability.
- **Nothing claims the launcher is finished, in production, or battle-tested.**
  The claim is about the decision and what it bought.
- The alternatives Ian actually evaluated are **a systemd unit** and **a
  bespoke Go supervisor of his own**. Do not name others as evaluated.
- Voice: no em dashes, no bullet lists in prose, paragraphs of 1 to 4
  sentences, one bold sentence per section maximum, first person throughout.

---

## Part 1 — I didn't write a daemon, and here's what that bought me

*Carries: the substrate decision, the daemon steelman at full strength, the
concession that this ground is well trodden, and the honest cost. Ends by
handing part 2 the library problem.*

Target 1400 to 1700 words, 6 sections.

### An agent that runs for hours needs a home, not a request handler

- Open blunt, no wind-up: the actual shape of the problem. Start an agent on a
  remote machine, it works for hours, I disconnect, I come back later.
- This is not request and response. Treating it as a job queue item throws away
  the entire middle of the run, which is the part that matters.
- The real question is what holds the process while nobody is watching.
- **specific:** the two things actually evaluated first, named. A systemd unit,
  and a supervisor written in Go by hand. The title is literal, not rhetorical.

### A daemon supervises a process; it doesn't let you watch one

- Steelman at full strength, and concede it properly. `Restart=on-failure`
  covers non-zero exit, signal, timeout and watchdog. journald gives structured
  indexed logs. cgroups give real memory and CPU limits. Unit ordering handles
  dependencies. No terminal anywhere in the loop.
- All of that is true, and on isolation and resource control a daemon wins
  outright.
- ← **load-bearing.** The argument turns on one word. A supervisor tells you a
  process is alive. It doesn't tell you it's doing the right thing.
- An agent's characteristic failure isn't dying, it's continuing confidently in
  the wrong direction, and that is invisible to a restart policy.
- Logs are a reconstruction assembled from what you thought to record in
  advance. You can't intervene in a log.
- **No citation here. Ian's decision: this section stands on experience.**
  Do not reach for SpecBench or any other paper to prop it up. The research
  digest has them if a reviewer asks, and they stay there.
- **specific: NEEDED FROM IAN.** With the citation gone, the load-bearing claim
  of part 1 rests entirely on a first-person specific, and there isn't one yet.
  The section needs one real instance of an agent that kept running while doing
  the wrong thing: what it was doing, how long before he noticed, and what made
  him notice. Two or three sentences is enough. Without it this section asserts
  rather than earns, which is the exact failure the voice contract names.

> [!ASSET] diagram · required
> id: two-observation-paths
> shows: one agent process in the centre. To the left, a supervisor whose only
>        inputs are exit status and restart count, labelled as after-the-fact
>        and binary. To the right, a human attached to the live pane, labelled
>        as continuous and mid-flight. The asymmetry is the whole point, so the
>        two edges must not look equivalent.
> format: mermaid
> alt: "Diagram contrasting a supervisor that observes only process liveness with a human attached to a live tmux pane observing the work itself"
> source: CLAUDE
> status: TODO

### Half the internet already reached for tmux, and almost nobody says why

- The honesty section, placed early on purpose. This observation is not new.
  There is a live 2026 ecosystem doing exactly this.
- **specific:** name-check claude-squad directly (8.4k stars, written in Go,
  tmux plus git worktrees). Naming it is the point. A reader who finds it
  afterwards and wonders why it went unmentioned stops trusting the piece.
- Mention the shape of the rest without listing all of it (Herdr, the Show-HN
  wave). They're utilities and products, not arguments.
- The gap they leave: they reach for tmux without arguing for it, and none of
  them treat the driving layer as something to be tested. **That gap is what
  this series claims**, not the discovery.
- The properties that made everyone reach for it: it survives a disconnect
  reliably, a human can attach at any moment with no extra tooling and no
  exported port, panes are addressable and capturable programmatically, and
  it's already installed on the remote box.
- **Correction from research, and it's not optional.** Do NOT write that
  surviving a disconnect is the reason tmux exists. Marriott's own account
  cites screen's documentation, configuration and CLI, plus shared windows.
  Screen had detach in 1987. The defensible claim is functional, about what it
  does reliably now, never an origin story.

### Inspectability is a design requirement, not a nice-to-have

- The claim the reader takes away, stated plainly and early in the section.
- The difference between "the job failed" and "I can see it looping on the same
  file for the last twenty minutes".
- An agent you can only poll is one you hear about too late.
- **specific:** connect to the safety-factor idea from "From Buildings to
  Bytes". Match the rigour to the consequence. An autonomous process has a wide
  blast radius, and being able to watch it is how you safely spend a smaller
  margin elsewhere. This is the one place the structural metaphor should appear;
  do not thread it through the whole piece.

### The bill comes due on isolation

- No isolation, no resource limits, no cgroup. A container wins this outright
  and it isn't close. Say so without hedging.
- Version skew is real and specific to control mode: 3.4 fixed control clients
  hanging on exit with queued pty data, 3.5 fixed another hang after toggling
  no-output, 3.2 added pausing for slow control clients.
- **specific:** 3.2a shipped 10 June 2021 and 3.4 shipped 13 February 2024.
  Two years and eight months of a substrate moving underneath you.
- Not Windows, and it's structural rather than a to-do. Native Windows support
  was requested in October 2019 and never landed.
- **specific:** wmux went the other way, talking to ConPTY directly rather than
  accepting the limitation. Someone competent made the opposite trade, which is
  the strongest available evidence that this is a trade at all.
- It's a human tool being driven as an API, and control mode is a narrow door
  into it.

### Choosing the substrate forced a library

- Every Go option forks a `tmux` process per call and parses the text that
  comes back. None of them use control mode or hold a persistent connection.
- **Precision required here.** Do not write "scrapes output meant for a person
  to read" as a blanket claim. GianlucaP106/gotmux does use `-F` format
  strings, and a reader who checks the source will find it. The accurate and
  still-damning version is the per-call fork and the absence of control mode.
- The failures hit personally: renumbered panes, session names containing
  spaces, output that stopped being correct without ever erroring.
- So the substrate decision became a library decision, which is `gotmucks`.
- Bridge, one or two sentences only: a library that drives someone else's
  process has a testing problem, and the usual answer to it is wrong. That's
  part 2.

> [!ASSET] image · required
> id: hero
> shows: hero for part 1. Terminal or multiplexer imagery, 16/9, must read at
>        card size on the index and as an OG image on a share.
> format: webp
> alt: "A tmux session split into panes on a remote machine"
> source: IAN
> status: TODO
> path: public/assets/images/posts/i-didnt-write-a-daemon/hero.webp

> [!ASSET] screenshot · dropped
> id: attached-agent-session
> shows: would have been Ian attached to a real agent session mid-run, the
>        thing a log cannot show. Redaction would have been required on paths,
>        tokens, client and repo names.
> format: png
> alt: "An agent running in an attached tmux pane, mid-task"
> source: IAN
> status: DROPPED
> reason: not available yet; the two-observation-paths diagram carries the
>         section instead so drafting never stalls on it. Worth revisiting if
>         part 1 is ever revised.

---

## Part 2 — A mock encodes what you believe, not what it does

*Carries: why mocking fails at a process boundary, the Go standard library's
own precedent for the alternative, the stand-in binary technique, and its
honest limits. Assumes part 1; does not re-argue the substrate choice.*

Target 1600 to 2000 words, 7 sections.

**Specifics available to this part, all verified in the repo on 2026-08-30:**

- Roughly 9,900 lines of test code against roughly 7,300 lines of library.
  `integration_test.go` alone is 3,551 lines, three times the size of
  `control.go` at 1,141.
- CI asserts `go.sum` is empty, because the library takes no non-stdlib
  dependencies. That's a test of a design decision, which is unusual enough to
  be worth a clause.
- Fuzzing runs `FuzzRoundTrip` and `FuzzUnescapeArbitrary` against
  `internal/escape` for 60 seconds each, on every run.
- Ten `scripts/probe-*.sh` run on every integration job.

### The standard advice stops working at the process boundary

- Open blunt: the orthodoxy, stated fairly and citably. Google's Go style guide
  says functions should take interfaces and return concrete types.
- **specific:** attribute correctly. "Accept interfaces, return structs" is
  Jack Lindamood's phrasing, popularised by Dave Cheney. It is **not** a Rob
  Pike Go Proverb, and getting that wrong in public would be embarrassing.
- The advice is sound while both sides of the seam are your code.
- tmux is not my code, doesn't implement my interface, and has never heard of
  it. A mock at that seam is a transcript of my beliefs about tmux.
- **specific:** Fowler's definition does the work here. Mocks are "objects
  pre-programmed with expectations which form a specification of the calls they
  are expected to receive." A specification I wrote, about someone else's
  program.

### The bug I was worried about lives in the argument vector

- The risk was never logic. It's "did we send the command we meant to send".
- An interface mock asserts that I called my own method correctly, which was
  never in doubt.
- ← **load-bearing.** The wire format is the thing under test, and the mock is
  the one component in the system that never sees it.
- **specific:** the concrete failure this catches. Addressing by `$0`, `@1`,
  `%2` rather than by index only helps if the right identifier actually reaches
  the command line, and only an argv-level assertion proves that.

### Go's own standard library doesn't mock this either

- The strongest support in the piece, and it deserves its own section.
- `os/exec` is the package whose entire job is shelling out. Its tests do not
  mock an interface. They re-exec the test binary as a fake external process
  and assert on what it was handed.
- **specific:** the mechanism, briefly. The older form built
  `exec.Command(os.Args[0], "-test.run=TestHelperProcess", ...)` with a
  `GO_WANT_HELPER_PROCESS` environment marker; current master uses `TestMain`
  and a map of named fake commands. Same idea, different plumbing.
- The argument this licenses: this isn't an exotic technique invented for
  gotmucks, it's what the people who wrote the subprocess package do.
- **specific, verified in the repo:** `helper_test.go` names it in a comment as
  "the standard os/exec testing idiom", and says what it buys: "the fake
  records the argument vector verbatim and replies byte for byte, so argv
  assembly and output parsing are both pinned without a tmux installation or a
  build step." The drafter may quote that comment; it's Ian's own prose.

> [!ASSET] link · required
> id: os-exec-precedent
> shows: the Go standard library's own os/exec test file, linked inline in
>        prose at the point the precedent is claimed
> format: link
> alt: n/a
> source: CLAUDE
> status: HAVE
> url: https://github.com/golang/go/blob/master/src/os/exec/exec_test.go

### A stand-in binary that records what it was handed

- The technique, concretely and now verified against the shipped code: the test
  binary re-executes *itself* as the stand-in. `WithBinary(self)` plus
  `-test.run=^TestHelperProcess$` points the client at the test binary, an
  environment marker (`GOTMUCKS_HELPER_PROCESS=1`) tells it to behave as tmux,
  and `internal/faketmux` runs a scripted reply while appending every
  invocation to an argv log.
- The assertions that fall out of it are blunt and worth showing: `onlyArgv`
  ("exactly one tmux invocation ran, here are its arguments") and `wantArgv`
  ("the nth invocation was exactly this vector"). That's the whole point made
  concrete.
- Hermetic and fast, and the whole unit suite runs with no tmux installed and
  no separate build step for the fake.
- This is the part worth stealing even for a reader who will never drive tmux.
- **Do not describe this as a Runner interface with a fake implementation.** An
  earlier design of the library did work that way; the shipped code doesn't,
  and that distinction is the entire thesis of this part.

> [!ASSET] code · required
> id: standin-binary
> shows: the `TestHelperProcess` entry point and the `options()` method that
>        points a client at the test binary. Those two together are the whole
>        technique in about 25 lines. Trim the rest; do not show the argv
>        assertion helpers as well, they can be described in prose.
> format: code
> alt: n/a
> source: CLAUDE
> status: HAVE
> note: verified against the live repo. Source is `helper_test.go` at
>       github.com/counterflow/gotmucks, fetched 2026-08-30. Quote verbatim,
>       trim only by removing whole functions, never by rewording.

### A recorded reply is still a reply I wrote

- The honest limit, placed here rather than buried at the end where it reads as
  a disclaimer.
- The fake replies with bytes I chose. A wrong understanding of the protocol
  produces a fake that is wrong in the same direction, and a suite that is
  green about it.
- ← **load-bearing, and Ian already wrote the sentence.** From `ci.yml`, about
  the notification table: "the unit suite feeds the reader lines it spells
  itself, so the table is only ever asserted against itself there." That is the
  title of this part, restated in his own CI config about his own tests. Quote
  it. Do not paraphrase it into something weaker.
- The consequence, also his: a notification name a tmux release can write that
  the reader's table lacks "is an event the library silently loses, and no test
  can catch it".
- The characteristic failure of every golden-file suite, and the reason the
  fake can't be the whole story.
- **specific:** concede the opposition properly. Fowler's test pyramid is right
  that end-to-end tests are brittle, expensive and slow. The answer isn't that
  he's wrong, it's that a protocol client has no cheaper way to know it's
  correct.

### So ask the real binary what it does

- **This section is the original contribution of the piece.** The obvious
  answer to the previous section is "run integration tests", and that's not
  what the repo does. It writes assertions that interrogate tmux itself about
  the claims the unit suite can only assume.
- `probe-notify.sh` scans the tmux binary's format strings, collects what a
  live server actually emits, and exits non-zero if either set contains a
  notification name the reader's table doesn't have. It's a test of the
  library's beliefs, not of its behaviour.
- `probe-roundtrip.sh` does the same for escaping: sends values through a real
  server and reads them back, failing if this release escapes a byte the
  decoder doesn't undo, or stops expanding one of the arguments the package
  doubles `#` in.
- **specific:** the distinction that makes this worth a section. Ten
  `scripts/probe-*.sh` run on every integration job, and most of them assert
  nothing at all. Ian's comment: "Not assertions: these print how this release
  actually behaves, so that a matrix failure comes with the evidence next to
  it." Diagnostics as a first-class CI output rather than something you go
  hunting for after a red build.
- The general principle, and the one a reader takes away: when your test suite
  can only assert your own spelling back at itself, write something that asks
  the other program directly.

### A matrix only helps if it actually runs

- The closing section, and it's about the bill rather than the technique.
- CI across 3.2a, 3.4 and 3.5a, and the reason is specific rather than
  superstitious: those releases genuinely disagree about control-mode
  behaviour, including two separate fixes for control clients hanging on exit.
- ← **the best hard-won specific in either part, and it wasn't in any plan.**
  The probe assertions originally ran before the integration suite. They abort
  at the first failed claim, and a failing step ends the job, so on 3.4 and
  3.5a the suite had never actually run. Ian's own words: what the package did
  on those releases "was unknown rather than bad". The fix was reordering, so
  the assertions still fail the job but no longer decide whether anything is
  learned from the run.
- The stand-in technique's other bill, the race detector. Every use of the fake
  re-executes the test binary, and under `-race` that binary is instrumented,
  so every launch pays instrumented startup. Hence two steps rather than one
  raced sweep: the full suite without `-race`, then `-race -short`.
- **specific, but check the number first.** `ci.yml` says the single raced
  sweep "took 150s where these two take about 19s together". `helper_test.go`
  says "the 1.9s suite becomes 123s". Those are different measurements and the
  drafter must not average them or pick silently. Use the `ci.yml` pair (150s
  versus 19s), since that's the decision CI actually encodes, and see the open
  question at the foot of this outline.
- The reasoning matters more than the speed: `-short` keeps every control-mode
  test, because those run over in-memory pipes and start no process, and skips
  only argv assembly and output parsing, which is one goroutine calling a
  subprocess with no race to find.
- Fuzzing on the output escaping round trip, 60 seconds per target on every
  run, because that parsing handles text that isn't mine.
- Close by calling back to the series title and part 1's bill. Two short
  sentences, no summary. In the register of: I picked somewhere to put an
  agent, and the rent is a test matrix.

> [!ASSET] diagram · required
> id: three-test-layers
> shows: the three commands the repo actually runs, each labelled with the
>        failure class it catches and the one it cannot. `go test ./...`
>        (hermetic, stand-in binary, pins argv and parsing, cannot catch a
>        wrong belief about the protocol). `go test -race -short ./...` (the
>        control-mode half over in-memory pipes, catches concurrency, skips
>        the re-exec tests on purpose). `go test -tags integration ./...`
>        (real tmux, private sockets, CI across 3.2a / 3.4 / 3.5a, catches
>        protocol and version skew, slow). Not a pyramid; the point is
>        coverage of different failure classes, not volume.
> format: mermaid
> alt: "Three testing layers for a library that drives an external process, each labelled with the failure class it catches and the one it cannot"
> source: CLAUDE
> status: TODO

> [!ASSET] image · required
> id: hero
> shows: hero for part 2. Should feel like testing or verification rather than
>        terminals, so the two parts are distinguishable as cards on the index.
> format: webp
> alt: "A test suite running against multiple versions of an external dependency"
> source: IAN
> status: TODO
> path: public/assets/images/posts/what-a-mock-encodes/hero.webp

---

## Open questions for Ian

1. **Two different race-detector numbers exist in the repo.** `ci.yml` says the
   single raced sweep "took 150s where these two take about 19s together".
   `helper_test.go` says "the 1.9s suite becomes 123s". Both are plausible
   measurements of different scopes, but a reader who opens the repo will see
   both. The outline currently tells the drafter to use the `ci.yml` pair.
   Confirm, or reconcile the two comments in the repo.
2. **The anecdote for part 1 is still missing.** One real instance of an agent
   that kept running while doing the wrong thing. Part 1's load-bearing claim
   has no first-person specific under it until this lands.

## Cross-links

- Part 1's final section links the `gotmucks` project case study at
  `/projects/gotmucks`.
- The case study's "Nothing on offer fit" section should gain a link back to
  part 1 once it's live.
- Part 2 opens by linking part 1. The series page at
  `/series/somewhere-to-put-an-agent` handles navigation, but an inline link
  costs nothing.
