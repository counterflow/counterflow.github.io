---
title: "gotmucks"
description: "A Go library for driving tmux programmatically: typed one-shot commands and a persistent control-mode client."
summary: "The tmux driver I needed for a remote AI agent launcher, and couldn't find. Typed identifiers, no shell invocation, and a control-mode reader that never blocks."
date: "2026-08-30"
image: "/assets/images/projects/gotmucks/hero.svg"
slug: "gotmucks"
stack: ["Go", "tmux", "stdlib only", "GitHub Actions"]
repo: "https://github.com/counterflow/gotmucks"
status: "building"
order: 1
featured: true
draft: false
---

I needed to launch AI agents on a remote machine and still be able to watch them work. tmux is the obvious substrate for that. Driving it from Go turned out to be the hard part.

## Nothing on offer fit

Every Go tmux wrapper I looked at does the same thing: fork a `tmux` process per call and parse the text that comes back. None of them hold a connection open, and none of them use control mode. That holds up until a session gets renamed, a pane gets renumbered, or a window title contains a space. Then it stops holding up, and the failure is silent rather than loud.

What I wanted was a client, not a wrapper. Something that treats tmux as a process you hold a conversation with, rather than a command you fire and hope about.

## Two interfaces, because tmux has two

tmux genuinely has two personalities, so gotmucks exposes both. One-shot commands cover the transactional work (create a session, list panes, send keys, capture a pane, set options and hooks) with typed arguments and parsed results instead of string building.

Control mode is the other half. `tmux -C` gives you a persistent connection that streams live pane output and asynchronous notifications, and gotmucks wraps that in a connection holding one active command channel while events arrive alongside it. **That's the half the agent launcher actually needs**, because an agent you can only poll is an agent you hear about too late.

It's standard library only, builds with `CGO_ENABLED=0`, and needs tmux 3.2 or newer for `new-session -e`.

## The process boundary is where the bugs live

Four of the design decisions are really one decision wearing different clothes. Address everything by identifier (`$0`, `@1`, `%2`) and never by name or index, because tmux renumbers and names are user input. Ask for format strings rather than human-readable output, so nothing depends on the shape of a table meant for a person to read. Never invoke a shell, so commands are argument vectors and a single-element vector that tmux would hand to `sh` gets rejected. Encode and decode names with vis(3), so a pane title survives the round trip it was put through.

Each one closes a hole in the same place: the point where my types stop and someone else's process starts. The control-mode reader follows the same rule. One goroutine on the pipe, and it never blocks. If a consumer stalls, events are dropped and counted rather than deadlocking the connection, because tmux is the only party in the exchange that can actually apply backpressure.

## You can't mock a process, so don't

The unit suite runs against a stand-in tmux binary that records the argument vector it was handed and replies byte for byte, which turns "did we send the right command" into a test rather than a hope. The integration suite runs against real tmux on private sockets, under the race detector, across 3.2a, 3.4 and 3.5a. The only thing that proves a protocol client works is the protocol.

## What I'd do differently

I built more library than the launcher needed. It was scoped to the short list of things one agent runner actually does, and what shipped has window and pane objects, hooks, a full options layer and flow control. None of it is wrong, and most of it I'd have wanted eventually. But the library was plainly the more enjoyable problem, and it got the attention the thing it exists for hasn't had yet.

The other one is smaller and already fixed. The CI probes that assert things about a given tmux release used to run ahead of the integration suite, and since a failing step ends the job, the suite had never actually run on 3.4 or 3.5a. What the package did on those releases wasn't bad, it was unknown.
