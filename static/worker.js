// Worker that runs the web-llm Engine. This file imports the library from an ESM CDN.
// It implements the EngineWorkerHandler interface so the main thread can create a
// WebWorker-backed engine with `CreateWebWorkerEngine`.

// IMPORTANT: This worker expects to run as a module worker and that the main
// thread will use web-llm's `CreateWebWorkerEngine` against it.

import * as webllm from 'https://esm.sh/@mlc-ai/web-llm';

const engine = new webllm.Engine();
const handler = new webllm.EngineWorkerHandler(engine);

self.onmessage = (msg) => {
  try {
    handler.onmessage(msg);
  } catch (e) {
    // Surface errors back to main thread
    self.postMessage({ type: 'error', message: String(e) });
  }
};

