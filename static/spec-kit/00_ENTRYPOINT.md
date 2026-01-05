# 00_ENTRYPOINT — Spec-Kit Single Entry Point

This repo uses a numbered spec-kit. Always begin here.

Quick start:

1. Read `01_SPEC-KIT.md` for the canonical, merged spec and rules.
2. Pick the next `3.x` task from `static/spec-kit/tasks.json`.
3. Implement one focused change-set.
4. Run verification: `bash 06_verify.sh` (runs the spec-kit verify harness).
5. Update `static/spec-kit/tasks.json` and call `manage_todo_list` with the exact task status changes.
6. Record any design decisions in the Change Log inside `01_SPEC-KIT.md`.

Notes:
- Do NOT modify runtime application files outside `static/spec-kit/` when retrofitting or templating.
- The spec-kit is designed to be reusable for any project; use the numbering convention in `02_NUMBERING.md`.
