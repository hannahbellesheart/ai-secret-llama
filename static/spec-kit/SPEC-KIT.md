# Comprehensive Spec-Kit

This document merges local planning guidance (`df.md`) with the spec-kit iteration protocol and makes the spec-kit a reusable template for any project. It defines naming conventions, the single-entry iteration loop, separation of spec-kit vs application responsibilities, verification harness requirements, and an example, repeatable iteration checklist.

1.0 Naming & Numbering Conventions
- 1.x — Spec-kit governance and tooling (entrypoint, verification harness, CI templates).
- 2.x — Project-level, application-agnostic requirements (security, accessibility, testing policy).
- 3.x — Application-specific tasks and features (scaffold, runtime, UI, domain logic).

2.0 Core Rules (merged from `df.md`)
- Verification: verify all rules are respected, all requirements accounted for, and code quality is enforced on generated and modified code.
- Follow the plan: start with the entry point, define app requirements, spec out the plan, and complete tasks one at a time until all tasks are `completed`.
- Always spec out the plan with phased or tiered steps; include scaffold, tasks, accessibility, testing, commenting, and documentation.

3.0 Single-Entry Iteration Loop (authoritative)
1) Read the user's latest instructions and this ENTRYPOINT (or `static/spec-kit/ENTRYPOINT.md`).
2) Identify the next incomplete `3.x` task from `static/spec-kit/tasks.json`.
3) Implement a single, focused change-set that addresses the task.
4) Run the verification harness in `static/spec-kit/scripts/`.
5) Update `static/spec-kit/tasks.json` and call the `manage_todo_list` tool with exact status changes.
6) Record any important decisions in the ENTRYPOINT's Change Log and repeat.

4.0 Separation: Spec-kit vs Application
- Spec-kit: iteration loop, verification scripts, acceptance criteria, `tasks.json` governance.
- Application: implementation details, runtime artifacts, domain tests, and feature deliverables.

5.0 Verification Harness (placed under spec-kit)
- Location: `static/spec-kit/scripts/`
- Mandatory checks (run every iteration where applicable):
  - Syntax checks for runtime artifacts (e.g., `node --check ../../app.js ../../worker.js`).
  - Static server smoke test (key assets return 200).
  - Accessibility heuristics (ARIA presence, form labels, alt text).
  - Linting and unit tests as applicable.
  - Basic perf sanity checks (asset timing, model-load timing where relevant).

6.0 What to Run (recommended)
- From the project root:

  cd static && bash spec-kit/scripts/verify.sh

- The verify script will invoke the local spec-kit smoke, a11y, and perf scripts.

7.0 Task Lifecycle and Content
- Every `3.x` task in `tasks.json` MUST include:
  - id, title, description, acceptance criteria, verification commands, owner, and runtime impact notes.

8.0 Change Log
- Record noteworthy decisions in ENTRYPOINT and in task notes for traceability.

9.0 Autonomous Implementation
- The implementer (agent) follows the loop autonomously until all tasks are `completed` unless explicitly stopped or blocked.

10.0 Example Minimal Iteration
1) Read ENTRYPOINT and user instructions.
2) Pick task `3.N`.
3) Implement, run unit tests.
4) Run `cd static && bash spec-kit/scripts/verify.sh`.
5) Update task status and `manage_todo_list`.

11.0 Reuse
- To reuse this spec-kit, copy `static/spec-kit/` into the new repo, update `tasks.json`, and adapt `verify.sh` to point at the repo-specific runtime artifacts.

12.0 Numbering, templates & automation (files added)
- `static/spec-kit/NUMBERING.md` — numbering and file-naming conventions (1.x / 2.x / 3.x).
- `static/spec-kit/task-template.json` — canonical `3.x` task template.
- `static/spec-kit/verify.config.json` — default verification configuration.
- `static/spec-kit/iteration_checklist.sh` — per-iteration checklist runner that produces a JSON report.

These files are designed to be non-invasive — they live under `static/spec-kit/` and MUST NOT modify application runtime files.

Change Log:
- 2025-12-21: Created merged `SPEC-KIT.md` from `df.md` and ENTRYPOINT guidance.
