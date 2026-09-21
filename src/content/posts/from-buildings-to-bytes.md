---
title: "The Engineer's Job Keeps Moving Up the Stack"
subtitle: "Looking back at the tools I've used, from structural software to AI agents, and the pattern I didn't notice at the time."
description: "Structural analysis programs, RAD tools, modern web, DevOps, now AI agents. Every tool I was drawn to took repetitive work away, and the engineering kept moving somewhere else."
date: "2026-07-08"
readTime: "6 min read"
image: "/assets/images/posts/from-buildings-to-bytes/hero.svg"
slug: "from-buildings-to-bytes"
draft: false
---

Back in 1992, I took a university entrance exam. My score was high enough for Computer Engineering, which was one of the harder courses to get into at the time.

I didn't take it.

My father wanted me to become a civil engineer, so I did. I went through the five-year course, graduated in 1997, passed the board exam, and eventually worked as a structural engineer.

I wasn't one of those people who had dreamed of becoming a civil engineer since childhood. There were subjects I liked, especially steel design, hydraulic engineering, project management, and anything involving computers. There were also plenty that I didn't enjoy at all.

What I do remember clearly is how much I liked using computers to do engineering work.

At university and later at work, I was exposed to structural analysis programs, spreadsheets, CAD tools, and other engineering software. We still learned the manual calculations, and that foundation mattered, but once you had a computer doing thousands of calculations in seconds, it was hard not to appreciate the difference.

I think that was probably the beginning of a pattern I only really recognise now.

## The kind of tools I kept liking

When I eventually moved into software development, I found myself drawn to tools that gave me the same feeling.

PowerBuilder was one of them. Microsoft Access was another. I liked VBA, Visual Basic, JScript, and scripting in general.

Rapid Application Development appealed to me because it felt direct. You could build something useful quickly, see it working, change it, and move on.

I probably resisted some parts of mainstream software development longer than I should have because of that. Object-oriented programming, for example, never excited me in the way it seemed to excite other developers. I eventually learned it properly because I had to, but I was always more interested in whether a tool helped me get something working than whether it encouraged the cleanest theoretical model.

By around 2011 or 2012, the market was already moving away from the technologies I had spent years using. PowerBuilder roles were becoming less common, and Java and .NET were everywhere.

Instead of going deeply into either of those, I became more interested in modern web development.

JavaScript, Durandal, Knockout, Grunt, browser APIs, that whole period felt fresh to me. I remember building a mobile web application for a company that distributed newsletters and flyers. The people doing the deliveries could use geolocation to record where they had been, while supervisors could see the progress from the office.

It wasn't a particularly glamorous application, but I liked the immediacy of that kind of development. You could build something practical without a huge amount of ceremony.

That mattered to me more than I realised at the time.

## What changed over time

When I look back over the different technologies I've used, I don't think I was ever particularly loyal to one stack.

I moved through mainframe work, PowerBuilder, databases, modern web, cloud, DevOps, mobile, IoT, and eventually into technical leadership.

Some transitions went well. Others didn't.

At one company, for example, my modern web experience helped me get in, but when I moved into a product team where Java mattered much more, I struggled. That was a useful reminder that being comfortable in one part of a system doesn't automatically make you strong in all of it.

At other places, being broad worked in my favour. Consulting suited me because companies could use different parts of my experience depending on the problem in front of them.

That has probably shaped how I think about software more than any particular framework ever did.

The tools kept changing, and every few years something would arrive that removed another layer of work that used to be done manually.

That usually interested me.

I never saw much value in doing something the hard way simply because that was how it had always been done.

## Why AI feels different

I started looking seriously at generative AI around late 2022.

At first it was mostly the same experience everyone had: ask ChatGPT something, copy the answer into an editor, try it, go back and ask another question.

But I got interested quite quickly in what was happening underneath and around the models. I played with LangChain, LangSmith, RAG, AutoGPT, BabyAGI and some of the other early agent experiments. From 2023 to 2025, I also did some on-and-off contract work on RLHF-style model evaluation and training tasks.

That gave me a slightly different perspective. I wasn't only using the models; I had some exposure to how human feedback and evaluation affected the way they behaved.

Then the coding tools started changing.

Copilot and Cursor made AI feel more native to development. Later, tools like Claude Code moved much further beyond autocomplete and code snippets.

That was when I became much more interested.

By mid-2025, I was using Claude Code heavily and had started building tooling around it for software-development process. I created a plugin, integrated it into parts of the SDLC workflow, and started experimenting with how much more of the development process could be handed over to agents.

Somewhere along the way, I stopped being impressed by the fact that AI could write code.

That part was already obvious.

What became more interesting was whether I could trust what it was doing once I gave it a larger part of the process.

That felt much closer to an engineering problem than a coding problem.

## What I'm thinking about now

There is something familiar about that problem.

A structural analysis program can give you a very precise answer to a badly modelled structure. The software may have done exactly what you asked it to do, but the result can still be wrong because the assumptions were wrong.

AI has a similar quality.

An agent can produce code that looks convincing, passes some tests, and still misunderstand what the system is actually supposed to do.

I see this quite often in the kind of software I work with now. Some of it is old, some of the business rules are buried in places nobody would design that way today, and some behaviours only make sense because customers have depended on them for years.

In that environment, writing code is often not the difficult part.

Understanding what should change, what must stay the same, and how to know whether the result is correct usually takes more thought.

That is probably why my interest has started moving toward things like agent evaluation, observability, RAG, and more structured ways of using AI in software development.

I'm also experimenting more with local models like Qwen, run through tools like Ollama, Hermes Agent and OpenCode, which has pulled me toward the computing side of AI as well.

I'm not sure yet where that part goes.

That is probably what I like about it.

## Looking back

I sometimes think about that entrance exam in 1992.

If I had taken Computer Engineering instead, maybe I would have arrived in software earlier. Maybe I would have ended up somewhere completely different.

It is impossible to know.

What I can see now is that I have spent a lot of my career being attracted to the same kind of idea.

If a computer can take repetitive work away from me, I usually want to let it.

That was true when I was using structural software. It was true with RAD tools and scripting. It was true with modern web development and DevOps automation. And it is certainly true with AI agents.

The part that has become more important to me over time is keeping enough understanding to know when the tool is wrong.

I don't think the engineer disappears when the tools become more capable.

The work just keeps moving.
