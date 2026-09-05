# Another Day at Work
### Game Design Document — v0.1

## 1. High Concept

**Another Day at Work** is a humorous single-player time-management and resource-management game about surviving one chaotic day as a software engineer.

The player sits at their workstation trying to complete engineering tasks while responding to an escalating stream of interruptions:

- Product Owner requests
- Production incidents
- Slack messages
- Junior engineers asking for help
- Tool outages
- CI failures
- GitHub downtime
- AI coding assistant failures
- Fatigue
- Hunger
- Coffee dependency
- Bathroom needs
- Meetings
- Technical debt

The player cannot solve everything.

The core challenge is deciding:

**What deserves my attention right now, and what am I willing to let get worse?**

The game should feel funny, stressful, recognizable, and slightly absurd without becoming mechanically complicated.

---

# 2. Game Fantasy

The player fantasy is:

> “I am one engineer desperately trying to keep myself, the product, and production alive until 17:00.”

The game should create situations where the player feels clever for juggling priorities, guilty for ignoring coworkers, terrified by production alerts, and amused by how quickly a normal workday collapses into chaos.

The ideal emotional progression of a run is:

**Calm → Busy → Concerning → Chaotic → Barely Controlled → 17:00 Salvation**

---

# 3. Genre

Primary genres:

- Time management
- Resource management
- Decision game
- Push-your-luck
- Light simulation

Inspirational mechanics:

- **Reigns** — trade-offs between competing resources
- **FTL** — multiple simultaneous problems competing for limited attention
- **Overcooked** — escalating task pressure
- **Papers, Please** — simple repeated actions becoming stressful through context
- **Mini Metro / Mini Motorways** — simple systems becoming increasingly difficult to maintain

The game should remain significantly simpler than these inspirations.

---

# 4. Target Experience

## Session Length

Target:

**10–20 minutes per workday**

One game session represents roughly:

**09:00 → 17:00**

The game clock runs faster than real time.

Example:

1 real second ≈ 1–2 in-game minutes.

A full uninterrupted day could therefore last approximately 8–12 real minutes, with pauses during important decisions.

---

# 5. Core Gameplay Loop

The basic loop is:

1. Work on the current engineering task.
2. New problems appear.
3. Decide whether to interrupt current work.
4. Resolve, postpone, or ignore the problem.
5. Resources change.
6. Some decisions create delayed consequences.
7. Resume work.
8. Survive until the end of the day.

Simplified:

**CODE → INTERRUPTION → DECISION → CONSEQUENCE → CODE**

The player is almost always trying to return to coding.

---

# 6. Main Physical Interaction

The game is primarily controlled with:

**Mouse / touch**

Keyboard controls may exist as optional shortcuts.

The main physical interaction is:

### Hold to Code

The player's laptop contains the current engineering task.

The player clicks and holds a large:

**HOLD TO CODE**

button.

While held:

- task progress increases
- stamina slowly decreases
- focus increases
- time advances

Example:

`Coding ███████████░░░ 67%`

The player wants to keep holding the button.

However, interruptions continuously appear.

Example:

**PING — Slack**

**PO: “quick question”**

**Production latency increasing**

The player must decide whether to:

- continue holding and ignore the interruption
- release the button and deal with it

This creates the core physical tension of the game.

The player's literal finger represents their attention.

---

# 7. Main Game Screen

The entire game takes place on one primary screen representing the engineer's workstation.

## Center

The laptop.

Contains:

- current task
- code/task progress
- Hold to Code button
- current focus multiplier

The center should always visually communicate:

**This is what I am supposed to be doing.**

---

## Top HUD

Three primary resources:

### ☕ Stamina

Represents the engineer's physical and mental energy.

Low stamina causes:

- slower coding
- mistakes
- reduced focus gain
- sleep events

At zero stamina:

The engineer becomes effectively unable to work.

Potential failure state:

**Fell asleep during standup.**

---

### 💚 PO Happiness

Represents stakeholder satisfaction.

Increases when:

- urgent requests are handled
- tickets are delivered
- status updates are sent
- deadlines are met

Decreases when:

- requests are ignored
- features are delayed
- production incidents block roadmap work
- messages remain unanswered

Low PO Happiness increases:

- status requests
- meetings
- “quick sync” events
- priority escalation

At zero:

Major escalation event.

Example:

**“Can we jump on a quick call?”**

---

### 🟢 System Stability

Represents the health of production.

Decreases because of:

- bugs
- rushed releases
- risky fixes
- neglected incidents
- accumulated technical debt

Increases through:

- proper fixes
- rollback
- testing
- monitoring
- refactoring

At zero:

Major outage.

Potential run-ending event:

**SEV-1**

---

# 8. Secondary Systems

## Technical Debt

Technical Debt is a slower-moving secondary resource.

It represents accumulated shortcuts.

Quick solutions often increase Tech Debt.

Example:

### Quick Hotfix

+20 Stability  
+10 PO Happiness  
+15 Tech Debt

High technical debt makes future events worse.

Effects may include:

- more bugs
- slower debugging
- production instability
- harder feature implementation
- repeated incidents

Technical debt should feel like:

**Future You paying for Present You's decisions.**

---

# 9. Focus

Focus represents uninterrupted concentration.

Focus grows while the player continuously works.

Example:

Focus:

x1 → x1.5 → x2 → x3

Higher focus increases coding speed.

Interruptions reset or reduce Focus.

Examples:

- responding to Slack
- talking to the PO
- meetings
- bathroom breaks
- production incidents

This creates an important dilemma:

Sometimes ignoring a small interruption is more efficient.

But ignored interruptions may escalate.

---

# 10. Needs

The engineer has physical needs that gradually become problems.

## Sleepiness

Stages:

1. Slightly tired
2. Getting sleepy
3. Struggling to focus
4. Microsleep
5. Fell asleep

Effects:

- slower coding
- random mistakes
- reduced Focus
- accidental actions

Countered by:

- coffee
- Coke Zero
- breaks
- lunch
- possibly water

---

## Toilet Need

Bathroom need slowly increases.

Initial state:

**“Could probably wait.”**

Later:

**“This is becoming a priority.”**

Critical:

**BIOLOGICAL SEV-1**

Effects at high levels:

- stamina drain
- focus reduction
- coding slowdown

Going to the toilet costs time.

Ignoring it saves time temporarily but creates increasing penalties.

---

## Hunger

Optional system for later versions.

Can be handled through:

- lunch
- snacks
- energy drinks

Skipping lunch saves time but causes an afternoon stamina penalty.

---

# 11. Boosters

Boosters provide short-term relief.

## Coffee

Effect:

+30 Stamina

Side effect:

Adds a **Coffee Crash** event to the future event pool.

Repeated coffee consumption increases crash probability.

Possible progression:

Coffee #1  
“Nice.”

Coffee #2  
“Productivity.”

Coffee #3  
“You can now hear Kubernetes.”

---

## Coke Zero

Effect:

+15 Stamina

Lower downside than coffee.

Possible downside:

minor bathroom increase.

---

## Water

Effect:

+5 Stamina

Reduces Coffee Crash chance.

Increases bathroom need.

---

## Lunch

Effect:

+25 Stamina

Costs significant game time.

Potential side effect:

PO messages while player is away.

---

# 12. Interruption System

Problems appear around the player's workspace as clickable notifications.

Problems may originate from:

- Slack
- monitoring
- Jira / ticket queue
- PO
- junior engineer
- QA
- GitHub
- CI/CD
- AI coding tools
- personal needs

Each interruption has:

- severity
- age
- escalation timer
- available actions
- consequences

Example:

## Junior Engineer

**“Hey, do you have 2 minutes?”**

Options:

### Help

-10 Stamina  
-10 minutes  
+Junior Karma

### Ignore

+Focus preserved  
Junior problem may escalate

### Send documentation

-5 minutes  
50% chance problem disappears  
50% chance junior replies:

**“I already read that.”**

---

# 13. Escalation

Ignored problems do not necessarily disappear.

Many become worse.

Example:

### Slack message

Stage 1:

“Hey, quick question?”

Stage 2:

“Hey, did you see this?”

Stage 3:

“Sorry to ping again.”

Stage 4:

Junior posts in public channel:

“Does anyone know why production is doing this?”

---

Another example:

### Production issue

Stage 1:

Error rate 3%

Stage 2:

Error rate 12%

Stage 3:

Customers reporting issues

Stage 4:

Production outage

Stage 5:

PO messages:

**“Is this related to the deploy?”**

This escalation system is central to the game.

---

# 14. Event Categories

## Product Owner Events

Examples:

- “ASAP priority”
- “Tiny change”
- “Can we squeeze this into the sprint?”
- “Customer needs this today”
- “Can we get an estimate?”
- “Any update?”
- “Quick sync?”
- “Can we deploy before the demo?”

PO events primarily affect:

**PO Happiness**

---

## Production Events

Examples:

- latency increasing
- error rate spike
- database connection exhaustion
- queue backlog
- broken deployment
- expired certificate
- mystery memory leak

Primarily affect:

**System Stability**

---

## Developer Tool Events

Examples:

- GitHub down
- CI stuck
- package registry unavailable
- Claude Code connection error
- IDE update required
- Docker mysteriously broken
- VPN disconnected

These primarily disrupt productivity.

---

## Human Events

Examples:

- junior needs help
- QA found edge case
- teammate asks for review
- meeting starts
- lunch invitation
- Slack thread argument

These primarily disrupt Focus.

---

## Personal Events

Examples:

- sleepy
- toilet
- hungry
- coffee craving
- posture pain
- existential dread at 15:42

These primarily affect Stamina.

---

# 15. Decision Design

Most decisions should contain a trade-off.

There should rarely be an obviously correct answer.

Example:

## Production Outage

### Hotfix

+20 Stability  
+10 PO Happiness  
+15 Tech Debt  
Fast

### Investigate Properly

+35 Stability  
-10 PO Happiness  
-20 Stamina  
Slow

### Rollback

+25 Stability  
Feature progress reset

### Ignore

Continue coding  
Outage severity increases

The game becomes interesting because:

**Every solution creates another problem.**

---

# 16. Inventory / Desk Items

The player has a small number of usable desk items.

Potential items:

### ☕ Coffee

Boost stamina.

### 🥤 Coke Zero

Smaller stamina boost.

### 🎧 Headphones

Temporarily reduces Slack interruptions.

Possible downside:

Production alert may also be missed.

### 🦆 Rubber Duck

Reroll a debugging event.

### 🛡 Feature Flag

Cancel one risky deployment consequence.

### 🔄 Restart

Attempt to fix a tooling issue.

Possible result:

50% fixed  
50% somehow worse

### 📝 “Per our previous conversation…”

Negate one PO Happiness penalty.

---

# 17. Coding Tasks

The player should always have a primary task.

Examples:

- Fix mobile login
- Add analytics event
- Improve search performance
- Refactor authentication
- Upgrade dependencies
- Write tests
- Investigate memory leak

Tasks contain:

- estimated effort
- risk
- reward
- potential Tech Debt

Some tasks may include mini-decisions.

Example:

## Implement Search Optimization

At 50%:

**Claude suggests changing the query strategy.**

Options:

Trust Claude  
Ignore  
Review suggestion

---

# 18. Day Progression

The day should become increasingly chaotic.

## 09:00–10:30

Calm.

Few interruptions.

Player learns systems.

---

## 10:30–12:00

Normal workload.

Slack activity increases.

PO starts appearing.

---

## 12:00–14:00

Needs become relevant.

Lunch decision.

Small production issues.

---

## 14:00–16:00

Main chaos.

Multiple simultaneous interruptions.

Stamina declining.

Tech debt consequences appearing.

---

## 16:00–17:00

Endgame.

PO asks whether something can still ship today.

Production becomes increasingly fragile.

Player decides whether to:

- ship
- stabilize
- clean up
- survive

---

# 19. End of Day

At 17:00:

**STOP CODING**

The game evaluates the player's day.

Scoring categories:

- Features completed
- System Stability
- PO Happiness
- Stamina remaining
- Technical Debt
- Coworker Karma
- Incidents resolved
- Coffee consumed

---

# 20. Endings

Runs should end with humorous titles.

Examples:

## Staff Engineer

Production stable.  
Reasonable technical debt.  
Junior helped.  
Feature partially shipped.

---

## 10x Engineer

14 tickets completed.

System held together by:

- one cron job
- two shell scripts
- hope

---

## Incident Commander

Features shipped:

0

Outages prevented:

6

---

## Promoted to Management

PO Happiness:

100%

Stamina:

2%

Technical Debt:

97%

---

## The Transcendent

Coffee consumed:

9

You no longer require sleep.

---

## Biological Incident

Ignored bathroom need for seven consecutive events.

Postmortem required.

---

## Unicorn Day

Production stable.

PO happy.

Feature shipped.

No Slack messages.

Probability:

approximately impossible.

---

# 21. Failure States

The player should usually reach the end of the day.

Hard game-over states should be rare.

Instead, catastrophic situations produce terrible endings.

Possible catastrophic states:

### Stamina = 0

Fell asleep.

### PO Happiness = 0

Escalation meeting.

### Stability = 0

SEV-1 incident.

The player may still recover depending on difficulty.

The game should favor:

**funny consequences over harsh failure.**

---

# 22. Difficulty

Difficulty should primarily control:

- interruption frequency
- escalation speed
- stamina drain
- production fragility
- PO patience

Possible modes:

### Intern

Relaxed.

Lots of recovery opportunities.

### Engineer

Standard.

### Senior Engineer

More simultaneous problems.

### Staff Engineer

Everyone assumes you know everything.

### Principal Engineer

You are invited to every meeting.

---

# 23. Humor Style

Humor should come primarily from recognition.

Avoid relying entirely on random memes.

Good humor:

**PO:**  
“It should be a tiny change.”

Task estimate changes:

`45 min → 6 hours`

---

Good:

**GitHub is down**

Available action:

**Check GitHub status**

Result:

“GitHub status page is loading slowly.”

---

Good:

Coffee #4:

**Stamina +20**

New passive effect:

**Heart Rate Observability**

---

Humor should feel like:

**“I have absolutely experienced this.”**

---

# 24. Visual Direction

Style:

- warm
- colorful
- slightly chaotic
- playful 2D illustration
- readable game UI
- cozy workstation aesthetic

The desk becomes increasingly messy throughout the day.

Visual environmental progression:

Morning:

- clean desk
- one coffee
- few notifications

Afternoon:

- mugs everywhere
- sticky notes
- alerts
- food wrappers
- crumpled paper
- Slack windows
- flashing incident warnings

The workstation itself visually communicates how badly the day is going.

---

# 25. Audio Direction

Audio is important for creating stress.

Core sounds:

- keyboard typing
- Slack notification
- incident alarm
- coffee machine
- message ping
- GitHub notification
- meeting alert
- PO message
- stomach growl
- bathroom urgency sound

The same notification sound should become psychologically terrifying by the end of a run.

As chaos increases, notification sounds overlap more frequently.

---

# 26. MVP

The first playable prototype should contain only:

### Resources

- Stamina
- PO Happiness
- System Stability
- Tech Debt

### Core Interaction

- Hold to Code
- Click interruptions
- Choose responses

### Needs

- Sleep
- Toilet

### Boosters

- Coffee
- Coke Zero

### Event Types

Approximately 25–30 events.

Suggested split:

- 6 PO events
- 6 production events
- 5 Slack/team events
- 4 tooling events
- 4 personal events
- 5 consequence events

### One Workday

09:00 → 17:00

### Endings

5–10 possible endings.

This is enough to validate whether the game is actually fun.

---

# 27. Prototype Success Criteria

The prototype succeeds if players naturally experience moments like:

> “I know production is broken, but if I stop coding now I'm never finishing this ticket.”

Or:

> “I can't believe I'm ignoring the junior because I desperately need to go to the bathroom.”

Or:

> “I used three coffees to finish an ASAP ticket and now production is dying because of the shortcut I took.”

Those moments indicate that the systems are interacting correctly.

---

# 28. Core Design Principles

### 1. One more thing

The player should frequently feel like they were almost back in control before another problem appeared.

### 2. Every shortcut has a cost

Fast solutions create future problems.

### 3. Attention is the true resource

The meters matter, but the player's real limitation is deciding what to look at.

### 4. Stress should be funny

The game should create pressure without feeling punishing.

### 5. Simple inputs, complicated consequences

Controls should remain extremely simple.

The complexity comes from interacting systems.

### 6. The desk tells the story

The player's screen and workstation should visually deteriorate as the day becomes more chaotic.

---

# 29. Core Pitch

**Another Day at Work** is a comedy time-management game where you hold a button to code while increasingly ridiculous workplace problems compete for your attention.

Keep yourself awake.

Keep the PO happy.

Keep production alive.

And, ideally:

**ship something before 17:00.**