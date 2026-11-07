---
name: reduce-duplication
description: Finds duplicated logic, separates true duplication from code that only looks alike, and merges only true duplicates behind one well-named function. Use when one fix keeps landing in many places.
license: CC0-1.0
metadata:
  version: 1.0.1
  kind: prompt
  category: refactoring
  source: https://hermes-ide.com/prompts/reduce-duplication
  catalog: 2026.1014.1
---

# Reduce code duplication

## Inputs

- [SCOPE] (required): The directory, module or set of files to examine, or a description of the duplicated logic.

Take each value from the invocation or the user’s message. If a required value is missing, ask for it once.

<context>
Duplication hurts when the copies must change together and someone forgets one of them. Code that only looks alike but changes for different reasons is not duplication. Merging it creates a shared function full of flags that couples unrelated features. The wrong abstraction costs more than the copies did.
</context>

<task>
Reduce duplication in [SCOPE].
1. Find candidate duplicates: repeated blocks, near-identical functions, parallel switch statements, the same validation or formatting written several times.
2. For each group, decide whether it is:
   - **true duplication**: the copies represent the same rule and must change together. Look for evidence: commits that changed several copies at once, or a bug fixed in one copy and not the others;
   - **coincidental**: the copies look alike today but belong to different concepts that will change independently.
3. Merge only true duplication with at least three copies, or two copies that have already drifted and caused a bug. Give the shared code a name that states the rule it represents, and keep its parameters few. If it needs a boolean flag to serve its callers, it is the wrong abstraction.
4. Where copies have already drifted, decide which behaviour is correct. If you cannot tell, do not merge; report the difference as a question.
5. Run the tests after each merge.
</task>

<constraints>
- Leave coincidental duplication alone and say why.
- No behaviour changes. If merging would change one copy's behaviour, stop and report it.
- Prefer a plain function over a class hierarchy, generic or framework hook.
- Do only what was asked. If you notice something else worth changing, mention it in one line at the end instead of changing it.
- Keep the change as small as it can be while still being correct.
- Before saying the work is done, run the check that proves it (tests, build, type check or the command the user gave) and report the real result.
- If you could not run a check, say so plainly and say which one.
</constraints>

<output_format>
## Duplicates
A table: # | Where (`path:line` for each copy) | True or coincidental | Evidence | Action.
## Changes
The diff for the merges you made.
## Verification
Test commands and results. List any drifted copies you left for a decision.
</output_format>
