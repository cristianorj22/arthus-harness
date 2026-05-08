---
# One known error per file. Short, copy-pastable, evergreen.
# If the entry is stable and reusable, promote it to a RUNBOOK.
symptom: <one-line user-visible symptom>
component: <slug>              # e.g. openclaw-gateway, coda-ui, db
last_verified: <YYYY-MM-DD>
---

# <Symptom — verbatim from the error or UI message>

<!--
  Troubleshooting entries are for the "I googled the error and want the fix in 30 seconds"
  reader. Prose is discouraged; commands and bullets are preferred.
-->

## Symptom

<!-- Exact error string, stack trace excerpt, or screenshot description. -->
```
<literal error message or log line>
```

## Likely cause

<!-- Short, ranked if multiple. -->
- <Cause 1, e.g. "Docker container for Postgres not running">
- <Cause 2>

## Fix

<!-- Numbered. Every step has a command or a click path. -->
1. <Step, with the exact command>

   ```bash
   <command>
   ```

2. <Step>
3. Verify: <how to confirm it's resolved>

## Preventive action

<!-- What would have stopped this from recurring. Often an ADR or CI check. -->
- <Action 1, e.g. "Add healthcheck to docker-compose.yml for the service">
- <Action 2>

## Related

- Runbook: <../runbooks/...>
- ADR: <../adrs/...>
- Similar symptom: <link to sibling troubleshooting entry>
