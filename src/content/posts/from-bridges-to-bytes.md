---
title: "From Bridges to Bytes: A Structural Engineer's Route to AI-Native Tech Lead"
description: "How a detour through civil engineering — load paths, safety factors, failure modes — still shapes the way I build software and lead teams 25 years on."
date: "2026-07-08"
readTime: "6 min read"
image: "/assets/images/posts/post2.jpg"
slug: "from-bridges-to-bytes"
draft: true
---

# From Bridges to Bytes: A Structural Engineer's Route to AI-Native Tech Lead

I didn't start in software. I started as a civil engineer, designing structures where the failure mode isn't a stack trace — it's people. [TODO: one or two concrete details — where you trained, the kind of structures you worked on, the registration/PE license — this is the part that's uniquely yours, so make it specific.]

Somewhere along the way I traded concrete for code. But I've come to think the detour wasn't a reset — it was the best architecture education I could have had. Two and a half decades later, the way I build and lead software still runs on instincts I learned standing in front of a load diagram.

## Load paths become data flows

The first thing you learn designing a structure is to trace the load. Every force has to travel from where it's applied to the ground, through a path you chose on purpose. If you can't draw that path, you don't understand the structure — you're just hoping.

Software is the same, and most outages are a load path nobody drew: a request that fans out to a dependency that fans out to a database that quietly became the single point of failure. When I review a system, I'm still tracing the load — *where does the pressure actually go under stress, and what's carrying it?*

## Safety factors become margins and redundancy

Bridges aren't built to survive exactly the expected load. They're built with a margin, because the world is noisier than the spec and the cost of being wrong is catastrophic. But — and this is the part people miss — **you don't apply the same margin everywhere.** You spend it where failure is severe and irreversible, and you stay lean where it isn't.

That's the single most useful idea I brought into software. Not "make everything robust" — that's how you ship nothing. Match the rigour to the consequence. It's why I let an AI agent write my tests but not my schema migrations, and it's the same calculation either way.

## Failure modes come first

An engineer designs by imagining how the thing breaks — fatigue, resonance, a load case nobody planned for — and then designing that failure out. You start from the failure, not the happy path.

Most software is built the other way around: happy path first, failure handling bolted on when something bites. Flipping that — asking "how does this break, and what's the blast radius?" before writing the feature — is a habit from bridges that has saved me more incidents than any framework ever has.

## 25 years, and the same job underneath

The tools kept changing. jQuery gave way to Angular.js, then the SPA era, then mobile, then cloud, then serverless, and now AI-native. Four countries and several employers along the way. [TODO: the human thread — Philippines → Saudi → Singapore → NZ, and what actually stayed constant for you across all of it.]

Under all of it the job never changed: understand the load, choose the path, design for the failure, ship the thing. The frameworks are fashion. The engineering is not.

## Why this matters for AI-native

Here's the punchline. The current wave of AI-native development is desperate for exactly the discipline that a bridge engineer takes for granted. The hype is all happy path and no load diagram — ship on vibes, worry about the failure mode never.

A structural engineer can't think that way; the bridge doesn't care how confident you were. That instinct — treat autonomy as a safety factor, design from the failure mode, trace the real load — is what turns "AI wrote my code" from a liability into an engineering practice. It's the throughline of everything else I write here.

I went from bridges to bytes. It turns out they carry load the same way.
