# Spec-Kit Numbering & File Naming Convention (1.x / 2.x / 3.x)

Purpose: Provide a strict, numbered file naming and task ID convention so the spec-kit can be applied consistently to any project without ambiguity.

1. Top-level taxonomy
- 1.x — Spec-kit governance & tooling (immutable rules, ENTRYPOINT pointers, CI templates).
- 2.x — Cross-project policies & verification config (accessibility, security, testing policy).
- 3.x — Application-specific tasks and features (implementation tasks, owners, verification commands).

2. File naming rules
- Filenames SHOULD start with the major and minor numbers using the pattern `<major>-<minor>-<short-name>.<ext>` where `<minor>` is two digits.
- Examples: `1-01-entrypoint.md`, `2-01-verify.config.json`, `3-01-task-template.json`.
- Use hyphens and lowercase only. Avoid special characters and spaces.

3. Task ID rules
- Tasks use `3.x` numeric IDs. Map the `tasks.json` `id` numeric field to this scheme (e.g., `3.01`, `3.21`).
- Each task object MUST include: `id`, `title`, `description`, `acceptanceCriteria`, `verificationCommands`, `owner`, `impact`.

4. Directory layout recommendation
- `static/spec-kit/1-gov/` — governance docs and ENTRYPOINT pointer files
- `static/spec-kit/2-policy/` — verification configs, matrices, scripts
- `static/spec-kit/3-tasks/` — task templates and examples

5. Applying this repo (retrofit guidance)
- Do not modify runtime application files outside `static/spec-kit/`.
- Add spec-kit artifacts under `static/spec-kit/` only.
- Update `static/spec-kit/tasks.json` using the `3.x` numbering when adding new tasks.

6. Automation notes
- Scripts and CI workflows can parse filenames and task IDs to automate reports and gating.

End of document.
