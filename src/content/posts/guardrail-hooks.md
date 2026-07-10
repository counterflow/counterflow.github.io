---
title: "The Guardrail Hooks That Stop Our Agents Doing Something Stupid"
description: "The Claude Code hooks we actually run in production at a small shop — each one born from a real near-miss, and the principle that ties them together."
date: "2026-07-07"
readTime: "8 min read"
image: "/assets/images/posts/post3.jpg"
slug: "guardrail-hooks"
draft: true
---

# The Guardrail Hooks That Stop Our Agents Doing Something Stupid

Coding agents are fast, and they're right most of the time. "Most of the time" is a lovely property for autocomplete and a terrifying one for something that can run shell commands against your repo and your infrastructure. The gap between *mostly right* and *safe* is where a small team gets hurt.

We close that gap with hooks. Every guardrail we run exists because something *almost* went wrong once — and the hook is the seatbelt we put in afterwards so it can't happen twice. This is the actual set, and the principle underneath it.

## Why hooks, and not just a good prompt

You can *ask* an agent to be careful. You cannot *rely* on it, because the same natural-language channel you use to set the rule is the channel the model can talk itself out of. "The user said don't touch migrations, but this clearly needs a migration, so…" — and now you have a problem.

Hooks are different because they're **deterministic and run by the harness, not the model.** A `PreToolUse` hook fires before a tool call actually executes; it can inspect the command and block it. The agent can't reason its way past a hook any more than a driver can reason their way past a seatbelt. That's the whole point: the model *advises*, the hook *decides*.

## The hooks we run

Each of these maps to a trust boundary from [an earlier post](/posts/where-we-let-ai-drive) — the places where we hold the wheel. The hooks are just those boundaries written down as code so they hold at 6pm on a Friday.

### 1. Block genuinely destructive commands

`rm -rf`, force-pushes, dropping a database, truncating a table. A `PreToolUse` hook pattern-matches the command and refuses outright.

[TODO: the real near-miss. What did an agent *nearly* run that made you write this one? The specific story is what makes this post yours instead of generic.]

### 2. Fence off migrations, secrets, and infra

No edits to the migrations directory, `.env`, KeyVault config, or the reverse-proxy setup without a human explicitly taking the wheel. These are the irreversible, high-blast-radius paths — exactly the ones an agent shouldn't touch autonomously.

[TODO: list your actual protected paths so a reader can copy the shape of it.]

### 3. Keep work inside the workspace

An agent has no business reaching outside the repo it was invited into — reading unrelated files, writing to home directories, poking at other projects. A hook rejects any file operation whose path escapes the workspace root. Small rule, large reduction in "wait, why did it edit *that*."

### 4. No unbounded or unreviewed network calls

Long, one-off `curl`/`Invoke-WebRequest` invocations are both a security surface and a way to exfiltrate or import who-knows-what. We route web access through known tools and flag ad-hoc network commands for review rather than letting them run silently.

### 5. Format and test on every edit

A `PostToolUse` hook runs the formatter and the fast test suite after the agent changes code, and **blocks on failure.** The agent doesn't get to declare victory on a diff that doesn't build. This is the cheapest quality gate you'll ever install and it catches an embarrassing amount.

[TODO: note which formatter/test command you actually wire in, and roughly how often it catches something.]

## The principle: encode your trust boundaries, don't recite them

If there's one idea to take from this, it's that **a guardrail hook is a trust boundary compiled into something that can't be argued with.** You decide once, deliberately, where an agent is allowed to act — and then you stop relying on the agent's good judgement (or your own vigilance) to honour it.

That reframes the whole "is it safe to let AI write code?" question. It's safe exactly to the degree that the dangerous actions are *mechanically* off the table. Get the boundaries right and encode them, and you can let the agent move fast everywhere else without holding your breath.

[TODO: when the hooks-pack repo is public, link it here so readers can lift the starting set.]

We didn't get to a calm AI-native workflow by trusting the model more. We got there by making the expensive mistakes impossible, and then trusting it with everything that was left.
