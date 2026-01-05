```markdown
# Secret Llama

A static, in-browser LLM chat UI that runs entirely in the browser using WebGPU and WebLLM. No server required, pure vanilla JavaScript.

## Features

- **Streaming Responses**: Real-time streaming of AI responses for a smooth chat experience.
- **Model Selection**: Dropdown to choose from available models (e.g., Llama-3.2-1B-Instruct-q4f16_1, Llama-3.2-3B-Instruct-q4f16_1).
- **Persistent Chat History**: Chat history saved to local storage, persists across sessions.
- **Responsive Design**: Mobile-friendly UI using Bootstrap.
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support, semantic HTML.
- **Performance**: Optimized for fast loading and low memory usage.
- **Debug UI**: Toggleable debug panel for monitoring model loading, inference, and errors.

## Architecture

- **Frontend**: Static HTML/CSS/JS served from a web server or file system.
- **Styling**: Bootstrap v5.3.8 via CDN.
- **JavaScript**: Pure vanilla JS with Web Workers (no Node.js dependencies, only browser APIs and CDNs).
- **AI**: WebLLM for in-browser LLM inference using WebGPU (loaded via CDN: https://esm.run/@mlc-ai/web-llm).
- **Persistence**: Browser local storage for chat history.
- **Build**: No build process; direct static files.

## Accessibility Requirements

- All interactive elements have ARIA labels.
- Semantic HTML: main, section, article, header, nav, etc.
- Keyboard navigation support.
- Screen reader friendly.
- Color contrast meets WCAG AA standards.
- Focus indicators visible.

## Acceptance Criteria

- [ ] App loads in browser without errors.
- [ ] User can select a model from dropdown.
- [ ] User can send messages and receive streaming responses.
- [ ] Chat history persists across page reloads.
- [ ] UI is responsive on mobile devices.
- [ ] Accessibility score > 90% (Lighthouse).
- [ ] Performance score > 80% (Lighthouse).
- [ ] No console errors.
- [ ] Pure JavaScript, no Node.js dependencies.

## Files

- `index.html`: Main HTML structure with semantic elements and ARIA.
- `src/app.js`: Main application logic in vanilla JS.
- `src/worker.js`: Web Worker for WebLLM inference.
- `src/styles.css`: Custom styles with Bootstrap.
- `public/`: Static assets.

```
