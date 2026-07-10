---
title: "Where We Let the AI Drive, and Where We Still Hold the Wheel"
description: "The trust boundaries we actually use running AI-native at a small ERP shop — what an agent is allowed to own, and what stays firmly in human hands."
date: "2026-07-09"
readTime: "7 min read"
image: "/assets/images/posts/post1.jpg"
slug: "where-we-let-ai-drive"
draft: true
---

# Where We Let the AI Drive, and Where We Still Hold the Wheel

Most of the AI-native debate is stuck on the wrong question. "Is the model good at writing code?" is settled enough to be boring. The question that actually decides whether AI helps or hurts your team is narrower and sharper: **where do you let it act without a human in the loop?**

At a small shop, that question has teeth. We don't have a platform team to catch a bad autonomous change before it reaches production. The blast radius of a confident, wrong agent isn't a code-review nit — it's your whole week. So instead of arguing about capability, we drew boundaries. Here's the map we actually use.

## Autonomy is a safety factor, not a vibe

Before software, I designed bridges. You never apply the same safety factor everywhere. A handrail and a primary load-bearing girder get very different margins, because the *consequence of failure* is different. You spend your engineering rigour where the failure mode is severe and irreversible, and you move fast where it isn't.

AI autonomy is the same decision. The right amount of unsupervised agent action isn't a fixed setting — it's a function of two things:

- **Reversibility** — if this goes wrong, can I `git revert` it in thirty seconds, or is it a customer-data incident?
- **Blast radius** — does a mistake affect one file, or every tenant in the ERP?

Everything below falls out of those two axes.

## Where we let it drive

These are the places where verification is cheap, mistakes are reversible, and the volume is high enough that human toil is the real bottleneck:

- **Tests.** Writing them, expanding coverage, filling in the boring cases. A wrong test fails loudly and costs nothing.
- **Boilerplate and scaffolding.** New endpoints, DTOs, mappers, the fifth CRUD screen that looks like the other four.
- **Refactors behind a green test suite.** If the tests still pass, the refactor is a safe move — and the agent is genuinely good at the mechanical parts.
- **First-draft PRs.** Let it take a ticket to a reviewable diff. The human starts from something, not nothing.
- **Exploratory spikes.** Throwaway code to answer a question. Reversibility is total; you delete it either way.

The common thread: **cheap to verify, cheap to undo.** That's the whole permission slip.

## Where we still hold the wheel

These are the places where a mistake is expensive, irreversible, or invisible until it's a problem — so a human makes the call, every time:

- **Schema and data migrations.** The one change that can't be reverted with a git command. [TODO: the specific incident or near-miss that made this a hard line for you.]
- **Auth and RBAC.** We run KeyCloak for identity and role-based access. The blast radius of getting a permission boundary wrong is "the wrong customer sees the wrong data." No agent ships that unsupervised.
- **Money paths.** Quoting, checkout, billing, anything that moves a dollar. [TODO: name the actual ERP flow — job quoting? invoicing? — so this is concrete, not generic.]
- **Secrets and infrastructure.** KeyVault, App Config, the reverse-proxy config, anything that can take the whole system down or leak a credential.
- **Anything touching customer data irreversibly.** Deletes, bulk updates, exports.

Notice these aren't "hard for the model." Several are things it would do competently. We hold the wheel anyway, because **the cost of verifying it's correct is higher than the cost of just doing it ourselves** — and the downside if we're wrong is unbounded.

## The rule, on one line

> Let the agent drive where a mistake is cheap to catch and cheap to reverse. Hold the wheel where it's neither.

That's it. It's not distrust of the model — it's matching autonomy to consequence, the same instinct a structural engineer applies to a safety factor. The interesting work is deciding which bucket a given task falls into, and being honest that the line moves as verification gets cheaper.

## Boundaries are worthless unless they're enforced

A boundary you hold in your head is a boundary you'll cross at 6pm on a Friday. Ours are enforced in code — guardrail hooks that make the protected paths genuinely off-limits to an agent, no matter how confidently it argues otherwise. That's a whole post of its own, and it's the next one: *the guardrail hooks that stop our agents doing something stupid.*

[TODO: add a concrete before/after — a task that used to take X and now takes Y under these boundaries — so the payoff is a number, not a claim.]

The teams getting burned by AI-native aren't the ones whose model is bad. They're the ones who never decided where the wheel lives.
