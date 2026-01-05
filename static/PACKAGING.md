# Packaging & Release Notes

This document describes how to package and release the static Secret Llama webapp for production hosting.

Prerequisites
- Modern Chromium-based browser for WebGPU (Chrome/Edge) for in-browser LLM runtime.
- Sufficient disk (IndexedDB) and RAM for chosen model sizes.

Model size guidance
- TinyLlama-1.1B: ~600 MB (small, recommended for testing)
- Phi1.5: ~1.2 GB
- Mistral-7B: ~4 GB
- Llama-3-8B: ~4.3 GB

Packaging steps
1. Build static site (if using a bundler). For this repo, files under `static/` are ready to host.
2. Optionally bundle or CDN-host libraries used by `worker.js` (web-llm). Worker expects to import `@mlc-ai/web-llm` from an ESM CDN; consider hosting a pinned ESM build for stability.
3. Upload `static/` to a static host (Netlify, Vercel, S3 + CloudFront, GitHub Pages).
4. Configure HTTPS and enable large file caching headers for model shards if hosting model artifacts.

Release checklist
- Verify `scripts/verify.sh` passes locally (syntax, smoke, accessibility).
- Confirm model shards are reachable and cache behavior works (manual test or prefetch flow).
- Update `PACKAGING.md` with host-specific notes (CDN pinning, cache headers).
- Tag release and publish release notes with model size warnings and recommended hardware.

Important warnings
- In-browser model runtime requires WebGPU and large memory — provide explicit warnings in UI and docs.
- Never embed private API keys in client-side code.

Rollback guidance
- Provide instructions to clear IndexedDB/cache if model load causes OOM:
  - `engine.unload()` and `worker.terminate()` in-app triggers.
  - Manual: clear site storage in browser devtools.
