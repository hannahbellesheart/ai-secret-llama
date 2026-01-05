# Spec-Kit System Overview

## Purpose
The spec-kit is a generic, reusable template system (not tied to any specific app) designed to guide the planning and iterative implementation of any application in a spec-driven, enterprise-level way. It's a framework for an AI or human implementer to follow, starting from a single entrypoint, to create a comprehensive plan, task list, and changelog for a project—without actually building the app yet. The system emphasizes autonomy: once started, the implementer iterates through tasks without further prompts until completion, with strict verification after each iteration. It's blank/generic by default, with placeholders for app-specific details (e.g., in README.md), and focuses on rules, loops, and governance rather than code or artifacts.

## Key Files and Structure
- **00_ENTRYPOINT.md**: The single authoritative file that governs the entire process. It must be read first and after each iteration. It describes the mandatory iteration loop, what to read next, and how to verify/progress. It's concise, non-redundant, and only updated when you explicitly instruct. It references other files but doesn't contain project-specific content.
- **01_user.md**: Contains your user rules, constraints, and iteration protocol (e.g., how to handle verifications, task updates, autonomous implementation). This is the source of directives like "read user rules before each iteration" and "update only when told."
- README.md: A placeholder for app-specific prompts, requirements, and context (e.g., what the app should do). The user edits this for each project.
- **02_app.md**: A generated copy of README.md (created by reading 01_user.md and README.md to plan the app spec). This is the planned app specification—do not create it yet; only plan its contents.
- **03_plan.md**: Comprehensive implementation plan with phased steps, derived from 00, 01, 02. Includes verification points, accessibility/testing/documentation emphasis.
- **04_tasks.json**: A per-feature task list. Derived from the plan, it tracks progress with statuses (e.g., completed), acceptance criteria, and verification artifacts. Tasks are JSON objects with id, title, description, acceptanceCriteria, verificationCommands, owner, impact.
- **04_changelog.md**: A log of per-iteration changes, with dated entries summarizing updates, linked to verification reports.
- **spec-kit/scripts/**: Directory for generated scripts based on the specific app, used for verification, code quality checks, smoke checks, etc. Scripts create their own reports (one per script), adding to historical runs in spec-kit/reports/.
- **spec-kit/reports/**: Directory for all verification reports.

## Process Governed
- **Entry**: Start by reading 00_ENTRYPOINT.md, then 01_user.md and README.md.
- **Planning Phase**: Use those to plan 02_app.md (app spec), 03_plan.md (phased plan), 04_tasks.json (task list), and 04_changelog.md (initial entry)—but do not create or implement anything yet.
- **Iteration Loop**: Pick the next incomplete task from 04_tasks.json. Implement one focused change-set for that task only. Run verifications (syntax, smoke, accessibility, perf) and produce a JSON report. If no critical failures: update task to completed, attach report, append changelog entry. If failures: fix and re-run before marking complete. Repeat until all tasks are completed and enterprise criteria met.
- **Autonomy**: The implementer continues without prompts, pausing only for blockers or completion.
- **Verification**: Mandatory after each iteration—includes code quality checks, smoke tests, and adherence to rules. Update task statuses and changelog accordingly.

## Constraints
- No redundancies; filenames must match exactly (e.g., README.md, case insensitive; other files exact); only update 00_ENTRYPOINT.md or 01_user.md when told; separate spec-kit stuff from app stuff; ensure the loop is non-conflicting and leads to production-ready results.
- Scripts are app-specific and generated; keep generic parts, remove old app-specific content.

## Other Notes
- The system is optimized for repeatability across projects: it's a template that gets copied/adapted, with the entrypoint ensuring consistent, spec-driven development.
- App-specific content stays in README.md/02_app.md; the rest is generic rules and process.
- Focus on enterprise-level quality: accessibility, robust testing, comprehensive commenting, and documentation.