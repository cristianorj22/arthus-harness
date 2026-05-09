---
# Operational playbook for a specific incident class.
# One runbook per incident type. Keep it short enough to read under pressure.
incident_type: <slug>             # e.g. openclaw-gateway-down, db-migration-stuck
severity: p1                      # p0 | p1 | p2
on_call: <handle or rotation>
last_verified: <YYYY-MM-DD>       # bump whenever you dry-run the book
---

# <Incident type — imperative: "Recover from X">

<!--
  A runbook is read by a tired human at 3 AM. Optimise for scannability:
  - No narrative paragraphs.
  - Every step is a command or a click path.
  - Link, don't inline, background material.
-->

## Symptom

<!-- How you'd notice the incident. -->
- <Symptom 1, e.g. "Health endpoint returns 503 for > 2 min">
- <Symptom 2, e.g. "Approval timeline in Coda UI shows stuck queue > 50 items">

## Likely cause (ranked)

<!-- Ordered by probability, most likely first. -->
1. <Cause 1>
2. <Cause 2>
3. <Cause 3>

## Diagnosis

<!-- Commands that confirm or rule out each cause. -->
1. <Check> — expected output: <...>

   ```bash
   <command>
   ```

2. <Check>
3. <Check>

## Mitigation

<!-- Stop the bleeding. Not the root cause fix. -->
1. <Step, with exact command>

   ```bash
   <command>
   ```

2. <Step>
3. Verify mitigation: <check>

## Root cause checklist

<!-- After mitigation, walk this list to find the real cause. -->
- [ ] <Check 1, e.g. "Inspect recent deploys in the last 24h">
- [ ] <Check 2, e.g. "Review resource metrics for the affected container">
- [ ] <Check 3>

## Post-mortem

<!-- Where the write-up goes once the incident is closed. -->
- Template: <link to post-mortem template>
- Incident log: <link or path>

## Related

- ADR: <../adrs/...>
- Troubleshooting: <../troubleshooting/...>
- Dashboard: <URL>
