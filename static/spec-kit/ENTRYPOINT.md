# Spec Kit Entry Point

This file is the single entry point for the spec-kit. Follow it on every iteration.

1) Read the *User Rules & Iteration Protocol* in `tasks.json` (task id 16) before starting work.
2) Execute one focused iteration (edits, tests, updates).
3) After the iteration, run code quality checks and smoke tests (syntax, server responses).
4) Update `static/spec-kit/tasks.json` statuses using the `manage_todo_list` tool.
5) Update this ENTRYPOINT with any noteworthy decisions.
6) Read the user's instructions again and repeat until all tasks in `tasks.json` are `completed`.

Files of interest:
- `static/spec-kit/tasks.json` — canonical task list and statuses.
- `static/spec-kit/README.md` — spec overview and acceptance criteria.

Protocol requirements enforced:
- Always use real in-browser `web-llm` for model runtime; do not ship simulated placeholder behavior.
- Run syntax checks and a static server smoke test after each iteration.
- Record progress in `tasks.json` and via `manage_todo_list`.
- Provide concise progress update and next steps after batches of edits.

MANDATORY ITERATION LOOP
- Before making any change: read the user's latest instructions and `ENTRYPOINT.md`.
- Make a single coherent change-set.
- Run the verification harness (see `task 17`) which MUST perform:
	- `node --check app.js worker.js` (syntax check)
	- `bash scripts/smoke_test.sh` (static server smoke test)
	- accessibility smoke checks (axe-based or equivalent)
- Update `manage_todo_list` and `static/spec-kit/tasks.json` to mark task statuses and record the verification report.
- If any task remains incomplete, repeat the loop until all tasks are `completed`.

Enterprise completion criteria
- All tasks in `static/spec-kit/tasks.json` set to `completed`.
- Verification harness returns all checks passing or items are explicitly documented as acceptable risks in `ENTRYPOINT.md`.
- Accessibility high-severity issues resolved.

AUTONOMOUS IMPLEMENTATION DIRECTIVE
- The implementer (agent) will continue iterating through the tasks in `static/spec-kit/tasks.json` without requiring further prompts from the user until all tasks are `completed` and enterprise completion criteria are met.
- On each iteration the implementer MUST:
	- Read the user's latest instructions and `ENTRYPOINT.md` before making changes.
	- Make a single coherent change-set.
	- Run the verification harness (see task 17) and resolve any high-severity failures.
	- Update `manage_todo_list` and `static/spec-kit/tasks.json` to reflect exact task status changes.
	- Log a concise progress update and the next action.
- The implementer should only pause autonomous iterations if:
	- All tasks are `completed`; or
	- The user explicitly issues a stop instruction; or
	- The implementer encounters a blocker that cannot be resolved without external access or credentials, in which case it must report the blocker and suggested mitigation.

If any task is not `completed`, the implementer must continue working until it is.
