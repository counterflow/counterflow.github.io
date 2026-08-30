---
type: article
slug: somewhere-to-put-an-agent
title: "Somewhere to Put an Agent"
status: brief
parts: 2
created: "2026-08-30"
---

## The claim

A long-running AI agent needs a substrate you can attach to and watch, not just
one that restarts it when it dies, and choosing that substrate is a design
decision with a bill attached rather than a piece of plumbing.

## Why me

I tried the alternatives first. The launcher needed somewhere to put a process
that runs for hours on a remote box while I'm disconnected, and I went looking
before I settled on tmux.

I also hit the failures personally rather than reading about them. Renumbered
panes, session names containing spaces, scraped output that was correct right
up until it silently wasn't. That's what pushed the substrate decision into a
library decision, and the library is `gotmucks`.

Not claimed anywhere in this piece: that the launcher is finished, battle-tested
or running in production. It isn't. The claim is about the decision and what it
bought, not about an outcome that hasn't happened yet.

## The reader leaves with

Pick a substrate that's already inspectable, because an agent you can only poll
is one you hear about too late.

## Who disagrees

**"Just write a daemon."** The strongest version, and the one to steelman
properly: if you need a long-lived supervised process, that problem is solved.
systemd or any supervisor gives you a restart policy, structured logging,
resource limits, dependency ordering and lifecycle management, with no
dependency on a terminal tool that was designed for a human at a keyboard. All
of that is true, and a daemon beats tmux outright on isolation and resource
control.

The argument turns on one word. A supervisor tells you a process is alive. It
doesn't let you watch it work. An agent's characteristic failure isn't dying,
it's continuing confidently in the wrong direction, and that failure is
invisible to a restart policy.

Secondary opposition, mostly landing on part 2: standard Go advice says accept
an interface and mock at the seam, and that integration tests against a real
binary are slow and flaky.

---

## Part 1 — I didn't write a daemon, and here's what that bought me

*Carries: the substrate decision, the steelman, and the honest cost.*

### An agent that runs for hours needs a home, not a request handler

- The actual shape: start an agent on a remote machine, it works for hours, I
  disconnect, I come back later
- This is not request and response, and treating it as a job queue item throws
  away the middle of the run
- The real question is what holds the process while nobody's watching

### A daemon supervises a process; it doesn't let you watch one

- Steelman first, at full strength: restart policy, logging, resource limits,
  no terminal in the loop
- What it doesn't give: a live view of the process mid-flight
- Logs are a reconstruction after the fact, assembled from what you thought to
  record beforehand
- You can't intervene in a log

### The thing I actually wanted was already installed

- Surviving a disconnect is the entire reason tmux exists, so it's not a
  feature I have to build or trust
- A human can attach at any moment with no extra tooling and no exported port
- Panes are addressable and capturable programmatically, which is the half most
  people never use
- It's already on every remote box, which is not nothing

### Inspectability is a design requirement, not a nice-to-have

- The load-bearing claim of the part
- The difference between "the job failed" and "I can see it looping on the same
  file for the last twenty minutes"
- Connects to the safety-factor idea from the first post: match the rigour to
  the consequence, and an autonomous process has a wide blast radius
- Watching is how you spend a smaller margin safely

### The bill comes due on isolation

- No isolation, no resource limits, no cgroup. A container wins this outright
  and it isn't close
- Version skew is real: 3.2a, 3.4 and 3.5a don't agree about everything
- Not Windows, and that's structural rather than a to-do
- It's a human tool being driven as an API, and control mode is a narrow door
  into it
- State plainly that this is a trade, not a free win

### Choosing the substrate forced a library

- Every Go tmux wrapper I found shells out and scrapes output meant for a
  person to read
- The specific failures: renumbered panes, names with spaces, output that lies
  quietly rather than erroring
- So the substrate decision became a library decision, which is `gotmucks`
- Bridge to part 2: a library that drives someone else's process has a testing
  problem that mocks don't solve

---

## Part 2 — A mock encodes what you believe, not what it does

*Carries: why mocking fails at a process boundary, the stand-in binary
technique, and its honest limits.*

### The standard advice stops working at the process boundary

- Go orthodoxy: accept interfaces, return structs, mock at the seam
- Sound while both sides of the seam are your code
- tmux is not my code, doesn't implement my interface, and has never heard of it
- A mock at that seam is a transcript of my beliefs about tmux

### The bug I was worried about lives in the argument vector

- The risk isn't logic, it's "did we send the command we meant to send"
- An interface mock asserts I called my own method correctly, which was never
  in doubt
- The wire format is the thing under test, and the mock never sees it

### A stand-in binary that records what it was handed

- The technique: a fake tmux executable that records the argv it received and
  replies byte for byte
- Now the assertion is against the real command line, not against an
  abstraction over it
- Hermetic and fast, and the suite runs with no tmux installed
- This is the part worth stealing even if nobody else ever drives tmux

### A recorded reply is still a reply I wrote

- The honest limit, and it goes here rather than being buried at the end
- The fake replies with bytes I chose, so a wrong understanding of the protocol
  produces a fake that's wrong in the same direction and a suite that's green
- The characteristic failure of every golden-file test suite
- Which is why the fake can't be the whole story

### So run it against the real thing, on a private socket

- Real tmux, on private sockets so a test run never collides with a developer's
  own session
- Race detector on, because control mode is one goroutine on a pipe and that's
  where the concurrency bugs would be
- Fuzzing for output escaping and control-line assembly, since that's the part
  handling untrusted text

### Version skew is a test matrix, not a footnote

- CI runs against 3.2a, 3.4 and 3.5a
- The substrate you don't control moves underneath you, and the matrix is how
  you find out on your schedule instead of a user's
- This is the bill from part 1 arriving, itemised
- Close by calling back to the opening: I picked somewhere to put an agent, and
  the rent is a test matrix

---

## Parked

Two angles that came up and didn't make the cut. Both are real posts, neither
belongs inside this one:

- **Designing against a protocol you don't own.** Control mode is the API I was
  handed, not the one I'd design. The library as a negotiation with someone
  else's protocol.
- **Making illegal states unrepresentable.** Typed identifiers (`SessionID`,
  `WindowID`, `PaneID`), typed option structs, addressing by `$0`/`@1`/`%2`
  rather than by name. How Go's type system absorbs a category of bug tmux
  would otherwise hand you.
