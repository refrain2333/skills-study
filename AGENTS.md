# Repository maintenance notes

## Skills

- Each directory under skills/ is a published skill. Its SKILL.md is canonical. A same-directory SKILL_zh.md is a reader translation and should track the matching English version.
- When a canonical skill changes, review the root README.md and SKILL.md, plugin manifests, researcher/corpus/index.json, activation fixtures, references, and any generated inventory that depends on the change.
- Keep numeric, benchmark, and time-sensitive claims linked to researcher/claims/index.jsonl, or qualify them with dated references. Do not present benchmark values as general guarantees.
- Read researcher/insights/auto-research-experiment.md and researcher/insights/how-we-built-this.md before making architectural changes to the research harness.
- Runtime queue, logs, reports, and unfinished run directories are not source files. Preserve the repository's ignore and run-state rules.

## Changes and checks

- Follow the current user's instructions for tests and validation. By default, make only the smallest relevant checks; do not run the full suite or model benchmarks unless the user asks.
- Do not start or stop application services, databases, containers, or site deployments unless the user asks.
- Use the repository's deterministic validators for skill-format, package, or data-schema changes when they are allowed by the current task instructions.
- Keep credentials out of source, logs, examples, and benchmark output.
