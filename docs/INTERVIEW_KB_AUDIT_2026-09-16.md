# 3V0L Interview Knowledge Base Audit — 2026-09-16

## Scope

This audit reviews the uploaded **Comprehensive Interview Prep Database** against the latest resume/interview reference materials available in the project library, then separates candidate facts from role knowledge and scenario assumptions.

## 1. Facts that are consistently supported

- Omar has 6+ years of customer/technical support experience across phone, chat and back-office work.
- Comdata: ENGIE Iris specialized cases, Avaya/Hermes outbound calls, and hands-on guidance for roughly 4–5 new colleagues.
- 5CA / Epic Games: French-language gaming support, complex account/gameplay/transaction issues, approximately 15-agent team, and support for newer colleagues.
- 5CA / Beerwulf: technical/customer support for e-commerce and home-draught products, including escalation and coordination with external parties.
- ModSquad: Spotify high-volume live chat, approximately 4–7 concurrent conversations; EA/The Sims Discord moderation.
- Airalo: eSIM technical support, recurring-issue review, practical workarounds, structured internal "Ask for Help" workflow, and approximately two months of Assistant Project Manager-type responsibilities.
- Education: DEUG in English Literature, Abdelmalik Saadi University; Google Foundations of Project Management certificate.
- Languages: Arabic native; English advanced/bilingual professional level; French professional/fluent working level. Do not call French native.
- Tools in the latest reference set include Zendesk, Salesforce, Avaya, Hermes, Dialpad, Slack, Microsoft Teams, Google Meet, Excel/Google Sheets, Jira, Freshdesk, Freshchat, SAP CRM, plus additional exposure such as Island Enterprise Browser, Okta, VMware, OpenVPN and Cato.

These facts are corroborated by the current resume and interview field manual. fileciteturn251file1L72-L117 The interview field manual also explicitly identifies the four primary proof-point stories: ENGIE Iris, Epic Games, Airalo workflow improvement, and Spotify high-volume chat. fileciteturn250file0L18-L63

## 2. Important fact-control fixes

### ModSquad ending

The uploaded database says the final ModSquad period ended in January 2024 because of attendance issues during relocation/night work. That matches the current resume/interview materials, which list ModSquad as March 2022–January 2024 and describe the final period as attendance/connectivity problems. fileciteturn247file5L287-L319

**Rule:** never turn this into a layoff, budget cut, project closure, or performance success. The existing database already has the correct hard rule. fileciteturn247file6L381-L397

### French level

One section of the uploaded database describes TransPerfect as assessing "French native fluency." This should **not** be copied into Omar's candidate facts. The latest candidate materials describe French as professional working/fluent level and specifically advise natural spoken French rather than academic phrasing. fileciteturn251file12L888-L901

### Airalo technical examples

The PDF includes a PDP Authentication Failure scenario and wording about collecting device logs. These are useful **technical role-play examples**, but they should not automatically be treated as proof that Omar personally handled that exact error or collected that exact artifact. The current resume verifies eSIM support, troubleshooting, recurring issues, workarounds and escalation workflow, but does not name PDP failures or device logs. fileciteturn251file1L89-L96

### V-Bucks / platform mismatch

The gaming story is useful and appears in the interview references, but the KB should treat very specific mechanics (for example, an exact cross-platform wallet behavior) as scenario context rather than a universal rule. The safest answer is to say Omar would verify the account, transaction and platform before taking action.

### KPI claims

The PDF includes external claims such as a 2026 CSAT benchmark and a statement that FCR is the strongest CSAT driver. These are not candidate facts and should not be used as memorized claims. The candidate-facing answer should instead explain the practical relationship: speed matters, but rushing can create repeat contacts; accuracy and appropriate resolution matter. The original database already warns against inventing proprietary metrics. fileciteturn249file0L253-L278

### Fintech policy / timelines

TapTap Send refund and transfer timing is **role knowledge, not Omar's previous work experience**. It must live in a separate researched-policy layer and never in `verified_facts` for the candidate. The current official TapTap Send help content (updated August 2026) confirms that failed/refunded transfers are returned automatically and that timing varies by payment method; card payments are typically 3–5 business days, Klarna/Sofort 10 calendar days, with other methods having different timings. citeturn432358search3turn432358search5turn432358search6

The current TapTap Send careers page also confirms the values "Impact first," "Accept reality, propose solutions," "Love the particular," and related accountability/team values. citeturn432358search0

## 3. Structural weaknesses in the original PDF

1. The master JSON has only eight questions. It is a useful foundation, but too small for a realtime copilot to cover the realistic surface area of recruiter, hiring-manager, behavioral, technical, gaming, fintech and remote interviews.
2. Questions, role knowledge, candidate facts and company policy are mixed together. They should be separately tagged.
3. Several answers are written as polished essays instead of speakable responses. The copilot needs short and long forms.
4. Some answers use exact operational details that are not present in the verified candidate facts. These should be marked with risk flags instead of becoming retrieval anchors.
5. The database needs more follow-up questions because interviewers commonly challenge the first answer rather than stopping after one response.
6. There is not enough explicit English coverage even though the candidate is comfortable working in English.
7. There are too few questions about recruiter logistics, remote reliability, feedback, ownership, prioritization, documentation, ambiguity, learning new products, quality-versus-speed, and difficult follow-ups.

## 4. 3V0L implementation rules

### Source hierarchy

`verified_candidate` > `candidate_story` > `researched_role` > `scenario_roleplay` > `inference`.

For answer generation, the model may combine multiple items only when they do not conflict. Candidate facts must never be invented from role research.

### Hard truth-lock rules

- Never invent an employer, title, date, metric, tool, permission, KPI, certification or responsibility.
- Never merge Spotify facts with Comdata facts.
- Never merge Epic Games facts with Beerwulf facts.
- Never call Airalo "Project Manager"; use "Assistant Project Manager exposure/responsibilities for about two months."
- Never call French native.
- Never call the ModSquad end a layoff.
- Never invent a reason for a career gap beyond what is actually supported.
- Never present TapTap Send policy as previous work experience.
- When a scenario requires company-specific policy and the KB does not contain a verified policy, say that the candidate would verify the applicable policy/system instead of guessing.

## 5. Expansion completed on `launcher-suite`

The expanded question bank is stored separately from the original compact content bank so it can be retrieved without rewriting the UI content schema. The copilot server is updated to retrieve these question objects together with answers, stories, scenarios and phrase banks.

The new bank adds bilingual variants and speakable French/English answers across:

- introduction and motivation
- role/company fit
- career transitions, shorter contracts and gap questions
- ModSquad accountability questions
- behavioral / STAR questions
- difficult customers and de-escalation
- prioritization and multitasking
- technical troubleshooting and escalation
- documentation and ambiguity
- gaming support and moderation
- fintech / remittance support
- remote work and reliability
- recruiter logistics, schedule and compensation
- hiring-manager questions
- strengths, weakness and failure
- learning, feedback and teamwork
- interviewer follow-ups and pressure pivots

## 6. Recommended interview-day behavior

Use the first answer as a concise spoken response. Add one concrete story only when useful. When challenged, verify the new fact rather than defending an earlier assumption. The scenario playbook reinforces the sequence acknowledge → clarify → verify → resolve or explain next step → confirm. fileciteturn250file7L404-L413

The interview field manual likewise instructs: answer the exact question, keep the first answer concise, add one concrete example, and stop. fileciteturn250file3L229-L240
