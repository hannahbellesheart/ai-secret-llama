# 00_ENTRYPOINT — Spec-Kit Entry Point

Purpose
- Single authoritative entrypoint for the spec-kit planning process. Keep this file concise: it tells implementers what to read and what to plan next. It does not perform or create app artifacts.

Required reading (first step)
1) Read `01_user.md` (the user's rules and constraints).
2) Read `README.md` (project-specific requirements and context).

Plan (do not create files yet)
- Use `01_user.md` and `README.md` to plan the project's `02_app.md` specification. DO NOT create `02_app.md` yet — only plan its contents and acceptance criteria in your working notes.

Iteration loop (short)
1) Pick a single focused task from your project's task list.
2) Implement one focused change-set for that task only.
3) Run the verification matrix (syntax, smoke, accessibility, perf) and produce a JSON report at `/tmp/speckit_iteration_report_<timestamp>.json`.
4) If no critical failures: attach the report to the task, mark it completed, and append a short changelog entry.
5) If critical failures: fix and re-run verification before marking complete.

Conventions and constraints
- This file only describes the process; do not add project-specific details here.
- For planning: read `01_user.md` and `README.md` and prepare the `02_app.md` plan (again: do not create `02_app.md` yet).
- Only update `01_user.md` or this `00_ENTRYPOINT.md` when the user explicitly asks for those changes.
- Scripts in `spec-kit/scripts/` create their own reports (one per script), adding to historical runs without changing past reports. All reports go in `spec-kit/reports/`.

Minimal verification checks (implementer responsibility)
- Syntax/lint checks appropriate to the project.
- Smoke tests to confirm essential assets/endpoints respond.
- Basic accessibility heuristics.

Notes
- The entrypoint intentionally avoids redundancy. All project artifacts (tasks, plans, changelog) live in the project workspace and are produced by implementers following this entrypoint.
