// Web Worker for LLM Inference using WebLLM
// This worker handles model loading and text generation

// Import WebLLM web build
import * as webllm from 'https://esm.run/@mlc-ai/web-llm';

// Global variables
let engine = null;
let currentModel = null;

// Handle messages from main thread
self.onmessage = async function(event) {
    const { type, message, model } = event.data;

    if (type === 'generate') {
        try {
            await generateResponse(message, model);
        } catch (error) {
            self.postMessage({ type: 'error', data: error.message });
        }
    }
};

// Generate response using WebLLM
async function generateResponse(message, model) {
    // Initialize engine if needed
    if (!engine || currentModel !== model) {
        await initEngine(model);
    }

    // Prepare messages for chat
    const messages = [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: message }
    ];

    try {
        // Generate response
        const reply = await engine.chat.completions.create({
            messages,
            stream: true
        });

        let fullResponse = '';
        for await (const chunk of reply) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            // Send partial for streaming
            self.postMessage({ type: 'partial', data: content });
        }

        self.postMessage({ type: 'response', data: fullResponse });
    } catch (error) {
        self.postMessage({ type: 'error', data: `Chat error: ${error.message}` });
    }
}

// Initialize WebLLM engine
async function initEngine(model) {
    self.postMessage({ type: 'debug', data: `Initializing engine for model: ${model}` });

    try {
        // Create engine
        engine = await webllm.CreateMLCEngine(model, {
            initProgressCallback: (progress) => {
                self.postMessage({ type: 'debug', data: `Init progress: ${progress.text}` });
            }
        });

        currentModel = model;
        self.postMessage({ type: 'debug', data: 'Engine initialized' });
    } catch (error) {
        self.postMessage({ type: 'error', data: `Engine init error: ${error.message}` });
        throw error;
    }
}