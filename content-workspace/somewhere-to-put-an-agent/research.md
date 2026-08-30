# Research: Somewhere to Put an Agent

Gathered 2026-08-30 by `post-researcher` during `/blog-plan`. Not for
publication. Every claim in the drafts should trace back to something here, or
be explicitly marked as personal experience.

---

## Primary sources

### tmux — control mode, formats, target syntax

- **[tmux(1) man page](https://man7.org/linux/man-pages/man1/tmux.1.html)** — Confirms identifier syntax: "Sessions, window and panes are each numbered with a unique ID; session IDs are prefixed with a '$', windows with a '@', and panes with a '%'. These are unique and are unchanged for the life of the session, window or pane in the tmux server." Also confirms `new-session -e`: "`-e` takes the form 'VARIABLE=value' and sets an environment variable for the newly created session".
- **[Control Mode — tmux/tmux GitHub wiki](https://github.com/tmux/tmux/wiki/Control-Mode)** — Maintained by the tmux project itself. "Control mode is a special mode that allows a tmux client to be used to talk to tmux using a simple text-only protocol." Command output is "wrapped in two guard lines: either `%begin` and `%end` if the command succeeded, or `%begin` and `%error` if it failed", each guard line carrying a timestamp, command number and flags. Notifications are prefixed `%` (`%output`, `%session-changed`, `%window-renamed`).
- **[tmux CHANGES @ the 3.2 tag](https://github.com/tmux/tmux/blob/3.2/CHANGES)** — "Add -e flag to new-session to set environment variables, like the same flag for new-window." **Confirms the ≥ 3.2 requirement**, verified against the version-pinned branch rather than rolling master.
- **Control-mode version deltas** (from CHANGES), which justify a CI matrix concretely:
  - 3.2 adds pausing for slow control clients, and format subscriptions
  - 3.2a adds `-C` to `run-shell`
  - 3.3 adds `%config-error`, extends `display-message` to control clients
  - 3.4 fixes "control mode clients hanging on exit if pty data was still queued"
  - 3.5 fixes "control mode clients hanging on exit after toggling no-output"
  - 3.5a partially reverts a `default-shell` change affecting `#()`/`run-shell`/`if-shell`
- **[Release dates](https://github.com/tmux/tmux/releases)** — 3.2a = 10 Jun 2021, 3.4 = 13 Feb 2024, 3.5 = 27 Sep 2024, 3.5a = 5 Oct 2024. The 3.2a → 3.4 gap is ~2 years 8 months. 3.5 → 3.5a is 8 days.
- **[tmux issue #1954](https://github.com/tmux/tmux/issues/1954)** — "Feature Request: running natively on Windows 10", opened 23 Oct 2019, never landed. Evidence that "not Windows" is a structural upstream gap.
- **[Marriott interview, Undeadly, July 2009](http://www.undeadly.org/cgi?action=article&sid=20090712190402)** — tmux's creator on why he built it: dissatisfaction with GNU Screen's "poor documentation, a strange configuration file and an unintuitive command-line interface", plus wanting shared windows across terminals. **He does not mention disconnect survival.** See Gaps.

### systemd / supervisord / s6 — the daemon steelman

- **[systemd.service(5)](https://man7.org/linux/man-pages/man5/systemd.service.5.html)** — `Restart=` values: `no`, `on-success`, `on-failure` ("restarted when the process exits with a non-zero exit code, is terminated by a signal … when an operation times out, and when the configured watchdog timeout is triggered"), `on-abnormal`, `on-abort`, `on-watchdog`, `always`.
- **[systemd.resource-control(5)](https://www.man7.org/linux/man-pages/man5/systemd.resource-control.5.html)** — cgroup limits: `MemoryMax=`, `CPUWeight=`, `TasksMax=`, `IOAccounting=`.
- **[systemd.unit(5)](https://man7.org/linux/man-pages/man5/systemd.unit.5.html)** — `Before=`/`After=` ordering, `Requires=`, `Wants=`.
- **[systemd-journald.service(8)](https://man7.org/linux/man-pages/man8/systemd-journald.service.8.html)** — "collects and stores logging data … structured, indexed journals".
- **[Poettering on socket activation, 2011](http://0pointer.de/blog/projects/socket-activation.html)** — "If a service dies its listening socket stays around, not losing a single message."
- **[Supervisor config](https://supervisord.org/configuration.html?highlight=autorestart)**, **[s6-supervise](https://skarnet.org/software/s6/s6-supervise.html)**.

These are all real capabilities. The steelman can be conceded honestly and at full strength.

### Go mocking orthodoxy, and testing external binaries

- **[Go Style Decisions — Google](https://google.github.io/styleguide/go/decisions.html)** — "Functions should take interfaces as arguments but return concrete types." **This is the citation to argue against**, being official and authoritative.
- **[SOLID Go Design — Dave Cheney, 2016](https://dave.cheney.net/2016/08/20/solid-go-design)** — credits the phrase "accept interfaces, return structs" to **Jack Lindamood**. It is *not* a Rob Pike Go Proverb. See Gaps.
- **[Mocks Aren't Stubs — Fowler, 2004/2007](https://martinfowler.com/articles/mocksArentStubs.html)** — "Mocks are… objects pre-programmed with expectations which form a specification of the calls they are expected to receive." Directly useful for the "a mock is a transcript of my beliefs" framing.
- **[TestPyramid — Fowler, 2012](https://martinfowler.com/bliki/TestPyramid.html)** — the standard citation for "integration tests are slow and brittle": end-to-end tests are "brittle, expensive to write, and time consuming to run". Scope caveat: his examples are UI tests, not process-boundary tests.
- **Go stdlib `os/exec` tests — the strongest precedent in this whole digest:**
  - Go 1.4 era, **[exec_test.go](https://github.com/golang/go/blob/release-branch.go1.4/src/os/exec/exec_test.go)** — `helperCommand()` builds `exec.Command(os.Args[0], "-test.run=TestHelperProcess", "--", s...)` with `cmd.Env = []string{"GO_WANT_HELPER_PROCESS=1"}`; `TestHelperProcess` reads `os.Args` and switches on the fake command name to emulate it.
  - Current master, **[exec_test.go](https://raw.githubusercontent.com/golang/go/master/src/os/exec/exec_test.go)** — refactored to `GO_EXEC_TEST_PID` + `TestMain` dispatching a `helperCommands` map (`cmdEcho`, `cmdCat`, …). Same idea, different plumbing.
  - **The Go standard library's own tests, for the package whose entire job is shelling out, do not mock an interface. They build a fake subprocess and assert on what it was handed.** This is the precedent part 2 should lead on.
- **[Race detector](https://go.dev/doc/articles/race_detector)**, **[Go fuzzing](https://go.dev/security/fuzz/)** — official docs. Note the fuzzing docs don't specifically name "parsers of untrusted text" as a use case; that connection is Ian's.

### Existing Go tmux libraries

- **[jubnzv/go-tmux, cmd.go](https://raw.githubusercontent.com/jubnzv/go-tmux/master/cmd.go)** — `exec.Command(tmux, args...)`, buffers stdout/stderr, returns raw strings, **no structured parsing**.
- **[GianlucaP106/gotmux](https://raw.githubusercontent.com/GianlucaP106/gotmux/main/gotmux/tmux.go)** — shells out per call, but **does use `-F` format strings** and splits CSV output. See Gaps: this makes "scrapes output meant for a person to read" slightly unfair as applied to it.
- **owenthereal/tmux**, **wricardo/gomux**, **philipgraf/libtmux-go** — same per-call fork pattern, effectively unmaintained.
- **No Go library found uses control mode (`-C`) as its transport.** The niche is genuinely open.

### AI agent observability and long-horizon failure

- **[Building Effective Agents — Anthropic, 19 Dec 2024](https://www.anthropic.com/engineering/building-effective-agents)** — "The autonomous nature of agents means higher costs, and the potential for compounding errors. We recommend extensive testing in sandboxed environments, along with the appropriate guardrails." Agents should "gain 'ground truth' from the environment at each step" and can "pause for human feedback at checkpoints." Adjacent to the "confidently wrong" framing, not an exact match.
- **[SpecBench, arXiv:2605.21384, 20 May 2026](https://arxiv.org/abs/2605.21384)** — directly on point: "As long-horizon coding agents produce more code than any developer can review, oversight collapses onto a single surface: the automated test suite. Reward hacking naturally arises in this setup, as the agent optimizes for passing tests while deviating from the user's true goal." Reports the visible-vs-held-out performance gap growing **28 percentage points for every tenfold expansion in code size**. Strong, dated, citable.
- **[Devin's 2025 Performance Review — Cognition, 14 Nov 2025](https://cognition.com/blog/devin-annual-performance-review-2025)** — weak corroboration only. "Human review is still necessary, because code quality is not straightforwardly verifiable."

---

## Prior art

**Headline finding: the "tmux for AI agents" observation is not fresh.**

- **[claude-squad — smtg-ai](https://github.com/smtg-ai/claude-squad)** — 8.4k stars, 616 forks, AGPL-3.0, **written in Go**, tmux + git worktrees for running multiple coding agents. Uses `exec.Command("tmux", "new-session", …)` and parses output with regex. **This is the one Ian could be accused of ignoring.** It is a TUI product rather than a reusable library, and it shells out and parses like all the others, so the general claim survives — but it needs a name-check.
- **[Tmux Keeps AI Coding Agents Alive After You Disconnect — implicator.ai, 28 May 2026](https://www.implicator.ai/tmux-keeps-ai-coding-agents-running-for-days-after-you-disconnect/)** — closest existing piece to part 1's premise. Stays at anecdote level; makes no daemon-steelman argument, doesn't discuss control mode, doesn't touch testing.
- **[How tmux Became the Runtime for AI Agent Teams — dev.to, 4 Apr 2026](https://dev.to/battyterm/how-tmux-became-the-runtime-for-ai-agent-teams-gmi)** — thematic overlap with part 1's opening. The author's tool (Batty) is a ~1,600-line **Rust daemon** wrapping `send-keys`/`capture-pane`/`pipe-pane`. Different language, different shape, no control mode. Useful contrast.
- **[Herdr](https://akmatori.com/blog/herdr-agent-multiplexer)** — competing solution to the same problem: "Classic multiplexers know about panes. Herdr knows that some panes contain agents and that those agents can be blocked, working, done, idle, or unknown."
- **[wmux](https://www.wmux.app/en)** — explicitly **not** built on tmux, specifically to get Windows: "On Windows wmux talks to ConPTY directly… There is no Linux VM in the path." **Someone else hit the same wall Ian concedes and made the opposite trade.** Strengthens "this is a trade, not a free win".
- **[Pane](https://runpane.com/alternatives/claude-squad-windows)** — commercial, markets against claude-squad's tmux dependency: "There is no official Windows port from the tmux project and no widely used community build… The only practical way to run tmux on Windows is inside WSL." Second independent source on the Windows gap.
- **A live 2026 Show-HN ecosystem**: Agent Hand, Claude Colony, Amux, Orchestrator, tmux-agent-switcher, tmux-agent-status, Agent-Manager, [pchalasani/claude-code-tools](https://github.com/pchalasani/claude-code-tools)'s `tmux-cli`. All utilities, none essays. **None make the daemon-vs-watch argument or address testing methodology.**
- **Simon Willison** — checked [his ai-agents tag](https://simonwillison.net/tags/ai-agents/) directly. Has not written on multiplexers as agent substrate. Worth knowing, since he'd be the obvious person cited against Ian.

**What this means for the piece:** the differentiation is the *argument* (inspectability as a design requirement, the daemon steelman taken seriously) and the *technique* (stand-in binary plus real-tmux matrix). Not the discovery that tmux is useful for this. That ground is thoroughly covered.

---

## Counter-arguments

- **"Just write a daemon."** Fully supported at the capability level by primary docs. A fair, strong steelman on the facts. But no named person was found making it as a rebuttal to tmux-for-agents specifically — see Gaps.
- **"Accept interfaces, mock at the seam."** Real, mainstream, well documented. Cite Google's style guide. Do not misattribute the phrase to Rob Pike.
- **"Integration tests against a real binary are slow and flaky."** Fowler's Test Pyramid is the standard citation. Minor scope mismatch (UI tests), but any Go engineer holding the view would recognise it.

---

## Citable specifics

| Claim | Source |
|---|---|
| `new-session -e` added in tmux 3.2 | [CHANGES @ 3.2](https://github.com/tmux/tmux/blob/3.2/CHANGES) |
| 3.2a → 3.4 is ~2 years 8 months (10 Jun 2021 → 13 Feb 2024) | [releases](https://github.com/tmux/tmux/releases) |
| 3.5 → 3.5a is 8 days, control-mode-adjacent | [releases](https://github.com/tmux/tmux/releases) |
| 3.4 fixed control mode clients hanging on exit | CHANGES |
| IDs `$0`/`@1`/`%2` are "unchanged for the life of" the object | [tmux(1)](https://man7.org/linux/man-pages/man1/tmux.1.html) |
| claude-squad: 8.4k stars, Go, tmux + worktrees | [GitHub](https://github.com/smtg-ai/claude-squad) |
| Reward-hacking gap grows 28pp per tenfold code expansion | [arXiv:2605.21384](https://arxiv.org/abs/2605.21384) |
| `Restart=on-failure` semantics | [systemd.service(5)](https://man7.org/linux/man-pages/man5/systemd.service.5.html) |
| Native Windows tmux requested 23 Oct 2019, never landed | [issue #1954](https://github.com/tmux/tmux/issues/1954) |
| Go's own `os/exec` tests use a fake subprocess, not a mock | [exec_test.go](https://raw.githubusercontent.com/golang/go/master/src/os/exec/exec_test.go) |

---

## Gaps

Decisions needed before drafting, not surprises at review.

1. **"Surviving a disconnect is the entire reason tmux exists" is unsupported and arguably contradicted.** Marriott cites screen's documentation, config and CLI, plus shared windows. GNU Screen had detach since 1987. **Soften to a functional claim** ("it's what tmux has always done reliably"), never an origin story.
2. **No named adversary for the daemon argument.** The steelman is Ian's own construction from real capabilities. Don't phrase it as though someone specific said it.
3. **The angle is not novel.** See Prior art. Acknowledge the ecosystem early; claim the argument, not the discovery.
4. **"Scrapes output meant for a person to read" overstates gotmux**, which uses `-F`. Defensible version: "none of them use control mode or a persistent connection; all of them fork a `tmux` process per call and parse text."
5. **The `pause-after` 300-second figure** came from a non-official docs mirror. Verify against the man page or drop the number and keep the general point.
6. **Feathers' "seam" definition is secondhand.** Attribute the concept, don't quote it.
7. **The Devin "3 hours before divergence" figure could not be verified.** Do not use.
8. **No exact release dates for 3.3 / 3.3a.** Minor.
9. **The researcher reported finding no public footprint for `gotmucks` itself.** Resolved: the repo is public and a local clone was read directly. Everything in the section below comes from it.

10. **Publication boundary.** `gotmucks` and this site are public. The agent launcher is a **private** project. Neither draft may name it, link it, quote its planning documents, or describe its internals, roadmap or commercial direction. It appears only as "a remote agent launcher I'm building". This file is committed to a public repository, so the same rule applies to everything written here.

---

## Primary source: the repository itself

Read from the local clone on 2026-08-30. The public repository is the only
source used here, and the only one either draft may draw on.

**The testing technique is the stand-in binary, not an injectable interface.**
An early design sketch had an internal `Runner` interface with a fake
implementation. **No such package exists in the shipped library**, and drafting
part 2 from that sketch would have argued against the library's own approach.
What exists is `helper_test.go` plus `internal/faketmux`: the test
binary re-executes itself, guarded by `GOTMUCKS_HELPER_PROCESS=1` and
`-test.run=^TestHelperProcess$`, with a scripted reply file and an argv log.
Assertion helpers are `onlyArgv` and `wantArgv`. Drafting part 2 from the
design docs would have argued against the library's own approach.

**`helper_test.go` names the precedent unprompted:** "That is the standard
os/exec testing idiom and it buys exactness: the fake records the argument
vector verbatim and replies byte for byte, so argv assembly and output parsing
are both pinned without a tmux installation or a build step."

**The CI file is the richest source in the project.** From `.github/workflows/ci.yml`:

- Jobs: `check` (Go 1.22 and stable), `integration` (tmux 3.2a, 3.4, 3.5a, each
  built from source and cached), `fuzz`, `lint`.
- `check` builds with `CGO_ENABLED=0`, runs `gofmt`, and **fails if `go.sum` is
  non-empty**, asserting the no-external-dependencies rule.
- The suite runs twice: `go test -count=1 ./...` then
  `go test -race -short -count=1 ./...`. The comment: the sweep "took 150s
  where these two take about 19s together… What `-race` is for is the
  control-mode half — a reader goroutine, per-pane taps, the event stream,
  Close — and every one of those tests runs over in-memory pipes and starts no
  process, so `-short` keeps all of them."
- **Ten `scripts/probe-*.sh` run on every integration job, and most assert
  nothing:** "Not assertions: these print how this release actually behaves, so
  that a matrix failure comes with the evidence next to it."
- `probe-notify.sh` and `probe-roundtrip.sh` *are* assertions, and the comment
  on the first is the sharpest statement of part 2's thesis anywhere: a
  notification name a release can write that the reader's table lacks "is an
  event the library silently loses, and no test can catch it: **the unit suite
  feeds the reader lines it spells itself, so the table is only ever asserted
  against itself there.**"
- **A real ordering lesson, in his own words.** The integration suite now runs
  *before* those two assertion steps, because they "abort at their first failed
  claim and a failing step ends the job: on 3.4 and 3.5a the suite had
  therefore never run at all, and what the package does on those releases was
  unknown rather than bad."
- Fuzzing: `FuzzRoundTrip` and `FuzzUnescapeArbitrary` on `internal/escape`,
  60s each, every run.
- `golangci-lint` pinned from source at `v2.13.2`, deliberately not via the
  marketplace action.

**Size**, counted across the clone: roughly **9,900 lines of test code against
roughly 7,300 lines of library**. `integration_test.go` is 3,551 lines,
`control_test.go` 2,825, `client_test.go` 1,717. The largest implementation
file is `control.go` at 1,141.

**Shipped control-mode API**, from `control.go` and `control_cmds.go`:
`Connect`, `Do`, `DoArgs`, `Events`, `Output(PaneID) (<-chan []byte, error)`,
`Untap`, `Dropped`, `DroppedOutput(PaneID)`, `Subscribe`, `Unsubscribe`,
`SetSize`, `PauseAfter`, `Pause`, `Resume`, `Wait`, `Done`, `Err`, `Stderr`,
`Close`, `Version`, `AttachedSession`.

**Note for the case study.** Flow control shipped (`PauseAfter`, `Pause`,
`Resume`), so tmux's own backpressure handles pane output. `EventsDropped` and
`Dropped()` concern the event stream, and `DroppedOutput(PaneID)` is a
per-pane counter. Any claim that a slow consumer simply loses pane output is
wrong.

**Discrepancy to resolve.** Two race-detector figures exist: `ci.yml` says
150s versus about 19s for the pair; `helper_test.go` says a 1.9s suite becomes
123s. Different scopes, both visible to any reader of the repo.
