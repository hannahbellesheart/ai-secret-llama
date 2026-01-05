(() => {
  const $ = (s) => document.querySelector(s);
  const $all = (s) => document.querySelectorAll(s);
  const messagesEl = $('#messages');
  const form = $('#composer');
  const input = $('#input');
  const modelSelect = $('#model');
  const resetBtn = $('#reset');
  const stopBtn = $('#stop');
  const welcome = $('#welcome');
  const messagesContainer = $('#messagesContainer');

  const STORAGE_KEY = 'secret-llama-static-messages-v2';
  // Configure your backend streaming API here. If `useApi` is enabled in settings,
  // the client will POST to `API_URL` with the session-stored `API_KEY`.
  // By default the demo uses simulated responses (safer for local-only use).
  function getSettings() {
    return {
      apiUrl: sessionStorage.getItem('API_URL') || '',
      apiKey: sessionStorage.getItem('API_KEY') || '',
      useApi: sessionStorage.getItem('USE_API') === '1',
    };
  }

  const MODELS = {
    'TinyLlama-1.1B-Chat-v0.4-q4f32_1-1k': { displayName: 'TinyLlama', icon: '🦙' },
    'Llama-3-8B-Instruct-q4f16_1': { displayName: 'Llama 3', icon: '🦙' },
    'Mistral-7B-Instruct-v0.2-q4f16_1': { displayName: 'Mistral 7B', icon: '🌬️' },
    'Phi1.5-q4f16_1-1k': { displayName: 'Phi 1.5', icon: '🔮' },
  };

  function loadMessages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveMessages(msgs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  }

  let messages = loadMessages();
  let engineLoaded = false;
  let isGenerating = false;
  let streamingTimer = null;
  let currentStream = null;
  let isAutoScroll = true;
  let worker = null;
  let engine = null;
  let webllm = null;

  // populate model select
  Object.keys(MODELS).forEach((k) => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = `${MODELS[k].icon} ${MODELS[k].displayName}`;
    modelSelect.appendChild(opt);
  });

  function render() {
    // welcome handling
    if (messages.length === 0) {
      welcome.style.display = 'block';
      welcome.setAttribute('aria-hidden', 'false');
      messagesContainer.style.display = 'none';
      messagesContainer.setAttribute('aria-hidden', 'true');
    } else {
      welcome.style.display = 'none';
      welcome.setAttribute('aria-hidden', 'true');
      messagesContainer.style.display = 'block';
      messagesContainer.setAttribute('aria-hidden', 'false');
    }

    messagesEl.innerHTML = '';
    messages.forEach((m, i) => {
      const li = document.createElement('li');
      li.className = 'msg ' + (m.role === 'user' ? 'user' : 'ai');

      // header
      const header = document.createElement('div');
      header.className = 'msg-header';
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = m.role === 'assistant' ? '🦙' : '👤';
      const who = document.createElement('div');
      who.className = 'who';
      who.textContent = m.role === 'assistant' ? MODELS[modelSelect.value].displayName : 'You';
      header.appendChild(avatar);
      header.appendChild(who);

      const body = document.createElement('div');
      body.className = 'msg-body';
      // render markdown to HTML
      const html = marked.parse(typeof m.text === 'string' ? m.text : String(m.text));
      body.innerHTML = html;

      li.appendChild(header);
      li.appendChild(body);
      messagesEl.appendChild(li);
    });

    // highlight code and add copy buttons
    $all('pre code').forEach((block) => {
      try { hljs.highlightElement(block); } catch (e) {}
      const pre = block.parentElement;
      if (pre && !pre.querySelector('.copy-btn')) {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copy';
        btn.addEventListener('click', () => {
          navigator.clipboard.writeText(block.textContent || '');
          const old = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = old), 1500);
        });
        pre.style.position = 'relative';
        btn.style.position = 'absolute';
        btn.style.top = '6px';
        btn.style.right = '6px';
        pre.appendChild(btn);
      }
    });

    // auto-scroll if enabled
    const container = messagesContainer;
    if (isAutoScroll) container.scrollTop = container.scrollHeight;

    saveMessages(messages);
  }

  // Model cache UI: check whether models are present in web-llm cache (IndexedDB)
  const cacheStatusEl = document.getElementById('cacheStatus');
  async function updateModelCacheUI() {
    if (!cacheStatusEl) return;
    cacheStatusEl.textContent = 'Checking cache...';
    try {
      if (!webllm) {
        // import webllm minimally to access cache check
        webllm = await import('https://esm.sh/@mlc-ai/web-llm');
      }
      const appConfig = webllm.prebuiltAppConfig || {};
      appConfig.useIndexedDBCache = true;
      const results = await Promise.all(Object.keys(MODELS).map((m) => webllm.hasModelInCache(m, appConfig)));
      const items = Object.keys(MODELS).map((m, i) => `${MODELS[m].displayName}: ${results[i] ? 'cached' : 'not cached'}`);
      cacheStatusEl.textContent = items.join(' • ');
    } catch (e) {
      cacheStatusEl.textContent = 'Cache check failed';
      console.warn('updateModelCacheUI error', e);
    }
  }

  // Prefetch (download) selected model into IndexedDB cache using web-llm engine init.
  async function prefetchModel() {
    const model = modelSelect.value;
    if (!model) return;
    const btn = document.getElementById('downloadModelBtn');
    if (btn) btn.disabled = true;

    const infoId = pushMessage('assistant', `Downloading ${MODELS[model].displayName}...`);

    try {
      if (!webllm) {
        webllm = await import('https://esm.sh/@mlc-ai/web-llm');
      }

      const appConfig = webllm.prebuiltAppConfig || {};
      appConfig.useIndexedDBCache = true;

      // show progress via init callback
      const initProgressCallback = (report) => {
        updateLastAssistant(report.text || 'Downloading...');
      };

      // create with retry/backoff in case of transient failures
      const createTempEngine = async () => {
        const workerInstance = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
        return await webllm.CreateWebWorkerEngine(workerInstance, model, {
          initProgressCallback,
          appConfig,
        });
      };
      const tempEngine = await retryWithBackoff(createTempEngine, 3, 500);

      // model should now be cached; unload engine but keep cached shards
      try {
        await tempEngine.unload();
      } catch (e) {
        console.warn('tempEngine.unload failed', e);
      }

      updateLastAssistant(`${MODELS[model].displayName} downloaded and cached.`);
      await updateModelCacheUI();
    } catch (e) {
      const msg = (e && e.message) || String(e);
      if (msg.toLowerCase().includes('outofmemory') || msg.toLowerCase().includes('oom')) {
        updateLastAssistant('Download failed: out of memory. Try selecting a smaller model or free system memory.');
      } else if (msg.toLowerCase().includes('webgpu')) {
        updateLastAssistant('Download failed: WebGPU not available. Ensure a compatible Chromium browser with GPU support.');
      } else {
        updateLastAssistant('Download failed: ' + msg);
      }
      console.error('prefetchModel error', e);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function pushMessage(role, text) {
    const msg = { role, text, model: modelSelect.value, ts: Date.now() };
    messages.push(msg);
    render();
    return msg;
  }

  function updateLastAssistant(text) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        messages[i].text = text;
        messages[i].ts = Date.now();
        break;
      }
    }
    render();
  }

  async function loadEngine() {
    if (engineLoaded) return;
    // If using a backend API, we'll check reachability; otherwise simulate.
    pushMessage('assistant', 'Loading model...');
    const settings = getSettings();
    if (settings.useApi && settings.apiUrl) {
      try {
        const resp = await fetch(settings.apiUrl + '/health', { method: 'GET' });
        if (!resp.ok) throw new Error('health check failed');
        updateLastAssistant('Model backend reachable.');
        engineLoaded = true;
        setTimeout(() => {
          if (messages.length && messages[messages.length - 1].text && messages[messages.length - 1].text.includes('reachable')) {
            messages.pop();
            render();
          }
        }, 500);
        return;
      } catch (e) {
        console.warn('Backend not available, falling back to simulated model:', e);
      }
    }

    // Initialize the web-llm engine in a worker (no bundling required)
    try {
      webllm = await import('https://esm.sh/@mlc-ai/web-llm');
    } catch (e) {
      updateLastAssistant('Failed to load web-llm library: ' + e);
      throw e;
    }

    const appConfig = webllm.prebuiltAppConfig || {};
    // prefer IndexedDB cache for model shards
    appConfig.useIndexedDBCache = true;

    // setup init progress callback
    const initProgressCallback = (report) => {
      updateLastAssistant(report.text || 'Initializing...');
    };

    try {
      // create engine with retries to handle transient WebGPU or network hiccups
      const createEngine = async () => {
        const workerInstance = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
        return await webllm.CreateWebWorkerEngine(workerInstance, modelSelect.value, {
          initProgressCallback,
          appConfig,
        });
      };
      engine = await retryWithBackoff(createEngine, 3, 700);
      engineLoaded = true;
      updateLastAssistant('Model loaded.');
      setTimeout(() => {
        if (messages.length && messages[messages.length - 1].text === 'Model loaded.') {
          messages.pop();
          render();
        }
      }, 700);
    } catch (e) {
      // Better error handling and guidance
      const msg = typeof e === 'string' ? e : (e && e.message) || String(e);
      if (msg.toLowerCase().includes('outofmemory') || msg.toLowerCase().includes('oom')) {
        updateLastAssistant('Model failed to load: out of memory. Try a smaller model or close other tabs.');
      } else if (msg.toLowerCase().includes('webgpu')) {
        updateLastAssistant('Model failed to load: WebGPU not available. Ensure a compatible Chromium browser with GPU support.');
      } else {
        updateLastAssistant('Failed to initialize engine: ' + msg);
      }
      throw e;
    }
    // update cache UI after engine init (models may be cached now)
    updateModelCacheUI().catch(() => {});
  }

  // Worker initializer: creates or returns existing worker
  function ensureWorker() {
    if (worker) return worker;
    try {
      // Use module worker when supported
      worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    } catch (e) {
      // Fallback to classic worker path
      worker = new Worker('worker.js');
    }
    return worker;
  }

  // Exponential backoff helper for transient operations
  async function retryWithBackoff(fn, attempts = 3, baseDelay = 500) {
    let lastErr = null;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms`, e);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  }

  function parseChunkedStreamLine(line) {
    // handle lines like: data: {json}\n\n or plain text
    if (!line) return null;
    const trimmed = line.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('data:')) {
      const payload = trimmed.replace(/^data:\s*/, '');
      if (payload === '[DONE]') return { done: true };
      try {
        return JSON.parse(payload);
      } catch (e) {
        return { text: payload };
      }
    }
    // try JSON
    try { return JSON.parse(trimmed); } catch (e) { return { text: trimmed }; }
  }

  async function startStreaming(userText) {
    if (isGenerating) return;
    isGenerating = true;
    stopBtn.style.display = 'inline-block';
    document.getElementById('send').style.display = 'none';

    pushMessage('assistant', '');

    if (!engine) {
      try {
        await loadEngine();
      } catch (e) {
        updateLastAssistant('Engine load failed: ' + e);
        isGenerating = false;
        stopBtn.style.display = 'none';
        document.getElementById('send').style.display = 'inline-block';
        return;
      }
    }

    // Prepare messages for engine
    const systemPrompt = 'You are a very helpful assistant.';
    const chatHistory = messages.map((m) => ({ role: m.role, content: m.text }));
    const userMessage = { role: 'user', content: userText };

    try {
      const completion = await engine.chat.completions.create({
        stream: true,
        messages: [{ role: 'system', content: systemPrompt }, ...chatHistory, userMessage],
        temperature: 0.5,
        max_gen_len: 1024,
      });

      let assistantMessage = '';
      for await (const chunk of completion) {
        const curDelta = chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content;
        if (curDelta) {
          assistantMessage += curDelta;
          const idx = messages.length - 1;
          if (idx >= 0 && messages[idx].role === 'assistant') {
            messages[idx].text = assistantMessage;
          }
          render();
        }
      }

      isGenerating = false;
      stopBtn.style.display = 'none';
      document.getElementById('send').style.display = 'inline-block';
    } catch (e) {
      isGenerating = false;
      stopBtn.style.display = 'none';
      document.getElementById('send').style.display = 'inline-block';
      updateLastAssistant('Error generating response: ' + e);
      return;
    }
  }

  function stopStreaming() {
    // Interrupt generation on the engine if available
    try {
      if (engine && typeof engine.interruptGenerate === 'function') {
        engine.interruptGenerate();
      }
    } catch (e) {
      // best-effort
      console.warn('interrupt failed', e);
    }
    isGenerating = false;
    stopBtn.style.display = 'none';
    document.getElementById('send').style.display = 'inline-block';
  }

  function resetChat() {
    if (!confirm('Clear chat history?')) return;
    messages = [];
    saveMessages(messages);
    render();
  }

  function resetEngineAndChatHistory() {
    // unload engine (if present) and clear chat
    engineLoaded = false;
    stopStreaming();
    if (engine && typeof engine.unload === 'function') {
      try { engine.unload(); } catch (e) { console.warn('engine.unload failed', e); }
      engine = null;
    }
    if (worker) {
      try { worker.terminate(); } catch (e) {}
      worker = null;
    }
    messages = [];
    saveMessages(messages);
    render();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    pushMessage('user', text);
    input.value = '';

    // ensure engine loaded
    if (!engineLoaded) {
      await loadEngine();
    }

    startStreaming(text);
  });

  stopBtn.addEventListener('click', () => {
    stopStreaming();
  });

  resetBtn.addEventListener('click', () => {
    resetEngineAndChatHistory();
  });

  // scroll handling to enable/disable auto-scroll
  messagesContainer.addEventListener('scroll', (e) => {
    const el = e.target;
    const isAtBottom = el.scrollHeight - el.scrollTop === el.clientHeight;
    isAutoScroll = isAtBottom;
  });

  // initial render
  render();
  // initial cache status check (best-effort)
  updateModelCacheUI().catch(() => {});

  // wire download button and model selection change
  const downloadBtn = document.getElementById('downloadModelBtn');
  if (downloadBtn) downloadBtn.addEventListener('click', prefetchModel);
  modelSelect && modelSelect.addEventListener('change', () => updateModelCacheUI().catch(() => {}));

  // Settings modal interactions (Bootstrap)
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModalEl = document.getElementById('settingsModal');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const apiUrlInput = document.getElementById('apiUrl');
  const apiKeyInput = document.getElementById('apiKey');
  const useApiCheck = document.getElementById('useApi');

  function openSettings() {
    const settings = getSettings();
    apiUrlInput.value = settings.apiUrl || '';
    apiKeyInput.value = settings.apiKey || '';
    useApiCheck.checked = settings.useApi;
    const modal = new bootstrap.Modal(settingsModalEl);
    modal.show();
  }

  settingsBtn && settingsBtn.addEventListener('click', openSettings);

  saveSettingsBtn && saveSettingsBtn.addEventListener('click', () => {
    sessionStorage.setItem('API_URL', apiUrlInput.value.trim());
    sessionStorage.setItem('API_KEY', apiKeyInput.value.trim());
    sessionStorage.setItem('USE_API', useApiCheck.checked ? '1' : '0');
    const modal = bootstrap.Modal.getInstance(settingsModalEl);
    modal && modal.hide();
    // When settings change, refresh cache UI since user may enable web-llm usage
    updateModelCacheUI().catch(() => {});
  });

  // convenience: Escape clears input
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') input.value = '';
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

})();
