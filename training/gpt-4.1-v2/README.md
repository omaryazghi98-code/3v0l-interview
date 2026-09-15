# 3V0L / NexQ GPT-4.1 v2 training set

This directory contains a curated supervised fine-tuning dataset for Omar's interview response coach.

## Objective

V2 is designed to fix the main V1 failure mode: employer and channel contamination. The model must route a question to the correct experience before composing an answer.

Core routing:

- Spotify / ModSquad: live chat; approximately 4-7 concurrent chats.
- Comdata: ENGIE / Iris, phone support and operations; inbound/outbound calls; complex cases and coordination; also Uber/Uber Eats/Uber Freight back-office/operations.
- Epic Games / 5CA: gaming support; account, gameplay and transaction cases; complex case escalation.
- Airalo: eSIM technical support; ICCID, APN, device compatibility and configuration; approximately two months of Assistant Project Manager responsibilities.
- Beerwulf / 5CA: customer/technical e-commerce support; damaged or missing components.

## Grounding policy

The model must not merge employers, invent internal tools or policies, invent KPIs or timelines, or upgrade coordination/agent guidance into formal management authority. For unknown details, the target behavior is honest verification rather than guessing.

## Dataset design

Examples deliberately include:

1. Direct factual recall.
2. Paraphrased interview wording.
3. French and English.
4. Employer/channel traps.
5. Support scenarios where personal experience must not be fabricated.
6. Unknown-answer and anti-hallucination behavior.
7. Short spoken answers suitable for live use.

The validation set is intentionally adversarial and should not be mixed into training.

## Azure format

Azure Microsoft Foundry fine-tuning expects JSONL in Chat Completions conversational format and UTF-8 with BOM. Each line below is one independent training example.

Recommended starting model: `gpt-4.1-2025-04-14` (deploy using a separate deployment name such as `nexq-interview-v2`).

Do not put API keys, personal contact details, or credentials in this directory.

## Runtime architecture

Fine-tuning is only one layer. Keep the runtime Notion/reference routing layer as the factual guardrail. The intended flow remains:

`STT -> final interviewer question -> intent -> verified experience -> answer composition -> concise spoken answer`

Source design is based on the 3V0L Interview Intelligence Hub, Interview Question Router, Verified Experience Library, Scenario & Guidance Library, Acer Live Interview Cheat Sheet, and the mock-interview stress test.