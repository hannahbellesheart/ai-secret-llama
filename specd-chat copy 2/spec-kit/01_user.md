```markdown
# 01_user — User Rules & Requirements

Purpose
- This file contains the user's non-negotiable rules, constraints, and acceptance criteria for the spec-kit process. Implementers must read this before each iteration.

Main Requirements for the Spec-Kit System
- The spec-kit directory is a generic, reusable template system (not tied to any specific app) designed to guide the planning and iterative implementation of any application in a spec-driven, enterprise-level way.
- It's a framework for an AI or human implementer to follow, starting from a single entrypoint, to create a comprehensive plan, task list, and changelog for a project—without actually building the app yet.
- The system emphasizes autonomy: once started, the implementer iterates through tasks without further prompts until completion, with strict verification after each iteration.
- It's blank/generic by default, with placeholders for app-specific details (e.g., in readme.md), and focuses on rules, loops, and governance rather than code or artifacts.

Key Files and Structure
- 00_ENTRYPOINT.md: The single authoritative file that governs the entire process. It must be read first and after each iteration. It describes the mandatory iteration loop, what to read next, and how to verify/progress. It's concise, non-redundant, and only updated when you explicitly instruct. It references other files but doesn't contain project-specific content.
- 01_user.md: Contains your user rules, constraints, and iteration protocol (e.g., how to handle verifications, task updates, autonomous implementation). This is the source of directives like "read user rules before each iteration" and "update only when told."
- README.md: A placeholder for app-specific prompts, requirements, and context (e.g., what the app should do). The user edits this for each project.
- 02_app.md: A generated copy of README.md (created by reading 01_user.md and README.md to plan the app spec). This is the planned app specification—do not create it yet; only plan its contents.
- 04_tasks.json: A per-feature task list. Derived from the plan, it tracks progress with statuses (e.g., completed), acceptance criteria, and verification artifacts.
- 04_changelog.md: A log of per-iteration changes, with dated entries summarizing updates, linked to verification reports.
- spec-kit/scripts/: Directory for generated scripts based on the specific app, used for verification, code quality checks, smoke checks, etc. Scripts create their own reports (one per script), adding to historical runs in spec-kit/reports/.
- spec-kit/reports/: Directory for all verification reports.

Constraints
- No redundancies; filenames must match exactly (e.g., README.md, case insensitive; other files exact); only update 00_ENTRYPOINT.md or 01_user.md when told; separate spec-kit stuff from app stuff; ensure the loop is non-conflicting and leads to production-ready results.
- Scripts are app-specific and generated; keep generic parts, remove old app-specific content.

User Rules (must-follow)
- Start every iteration by reading `00_ENTRYPOINT.md` and this `01_user.md`.
- Make exactly one focused change-set per iteration that maps to a single task in `04_tasks.json`.
- Always run the verification harness before updating task status.
- Use `04_tasks.json` for task definitions and `04_changelog.md` for per-iteration records.
- Attach verification artifacts (reports/logs) to the task entry after a successful iteration.
- Ultimate spec-driven compliance: All actions must strictly follow the specs in `00_ENTRYPOINT.md` and this file. No deviations, skips, or ad-hoc changes. If non-compliant, repeat the step until fully compliant. Verification must confirm adherence to all rules.

Governance and Quality
- Accessibility: include ARIA roles, labels, and a11y smoke checks as part of verification.
- Testing: include syntax checks and smoke tests at minimum; add linting and unit tests when applicable.
- Security: avoid embedding secrets in repo; document any required credentials as blockers in `04_changelog.md`.

Blockers & Escalation
- If an iteration is blocked by external credentials, environment, or resources, record the blocker in `04_changelog.md` and pause autonomous iterations until resolved.

Ending condition
- The project is complete when all tasks in `04_tasks.json` are `completed` and verification artifacts show no unresolved critical failures.

```
