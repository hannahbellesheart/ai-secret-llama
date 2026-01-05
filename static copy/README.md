## Secret Llama — Static Version

This folder contains a static re-creation of the Secret Llama chat UI using HTML, Bootswatch v5.3.8, and vanilla JavaScript.

Quick start

```bash
cd static
python -m http.server 8000
# then open http://localhost:8000 in a modern Chromium browser (Chrome/Edge)
```

Modes
- Simulated (default): local-only responses; safe and works without special hardware.
- In-browser model runtime (optional): integrates `web-llm` and runs models locally in a WebGPU-capable browser. See `spec-kit` for details, requirements, and the implementation plan.

Spec and implementation plan
- The full plan and task list to reproduce the original app are in `spec-kit`:
  - `static/spec-kit/README.md` — spec summary and acceptance criteria
  - `static/spec-kit/tasks.json` — actionable task list

Notes
- This static version intentionally avoids any server by default. Embedding API keys in-browser is insecure; use an external secure proxy for production if needed.

This repository follows a strict iteration protocol defined in `static/spec-kit/ENTRYPOINT.md`. All work must follow that entry point and its iteration loop. The `spec-kit/tasks.json` file is the canonical task list and must be updated after each change.

# Secret Llama — Spec Kit

Purpose
- Provide a concise spec and implementation plan to recreate the original Secret Llama project using static HTML, Bootswatch v5.3.8, and vanilla JavaScript.

Overview (feature parity)
- Fully in-browser LLM chat UI with model selection and local model runtime (web-llm) — no server required.
- Model download and cache (IndexedDB/Cache API). Show download/init progress.
- Streamed generation: incremental token updates to assistant message; Stop to abort generation.
- Reset/unload: clear chat history and free model memory.
- Markdown rendering with syntax highlighting and copy-to-clipboard for code blocks.
- Auto-scroll: only auto-scroll when user is at bottom; stop auto-scroll if user scrolls up.
- Persistence: chat history persists locally (IndexedDB/localStorage) across reloads.
- Debug UI: runtime stats and loading progress shown for user feedback.

Runtime requirements
- WebGPU-capable Chromium-based browser (Chrome, Edge). Firefox support experimental.
- Large local storage and enough RAM for chosen model sizes. See model sizes:
  - TinyLlama-1.1B-Chat-v0.4-q4f32_1-1k — ~600MB
  - Llama-3-8B-Instruct-q4f16_1 — ~4.3GB
  - Phi1.5-q4f16_1-1k — ~1.2GB
  - Mistral-7B-Instruct-v0.2-q4f16_1 — ~4GB

Architecture (high level)
- Main thread: UI, local persistence, settings, and rendering.
- Worker thread (`worker.js`): hosts the `web-llm` Engine to load model shards, perform inference, and stream deltas.
- Model files are downloaded by the engine and saved to IndexedDB/Cache for offline reuse.
- Streaming uses async iterables; the main thread updates assistant content per delta.

Acceptance criteria
- UI mirrors original layout and behavior (model dropdown, messages, composer, settings).
- Streaming updates append to the assistant message in real time and support stop/interrupt.
- Chat history persists and restores correctly.
- Model load progress is visible and reasonably accurate.
- No external server is required to run the demo; everything works locally if browser supports WebGPU.

Files to add/modify (deliverable list)
- `static/index.html` — Bootswatch-based UI and structure (header, model select, messages, composer, settings modal).
- `static/styles.css` — theme overrides and message/code styles.
- `static/app.js` — client logic: UI wiring, persistence, streaming handling, settings; can fallback to simulated responses when `web-llm` is unavailable.
- `static/worker.js` — worker script that initializes `web-llm` engine and handles messages.
- `static/spec-kit/tasks.json` — actionable task list (see tasks.json).

Notes
- Integrating real `web-llm` in a static site requires including the proper ESM/UMD build. If direct inclusion is not feasible, provide a bundling step (Vite/Rollup) to produce a single `worker.js` and `webllm-loader.js` that the static site can import.
- For the browser-only approach, warn users about the hardware requirements clearly in the UI.

Developer next steps
1. Read `tasks.json` for a step-by-step implementation plan.
2. Implement the UI scaffold and client behavior (simulated fallback first).
3. Integrate `web-llm` in `worker.js` and wire streaming to the main thread.
4. Test on a WebGPU-capable browser with a small model (TinyLlama) before attempting larger models.

How to run checks (required after each change)
```bash
cd static
node --check app.js worker.js
bash scripts/smoke_test.sh
```
