// Secret Llama - Main Application Script
// In-browser LLM chat using WebLLM

// Global variables
let chatHistory = [];
let currentModel = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
let worker = null;
let isStreaming = false;
let currentAssistantMessage = null; // For streaming

// DOM elements
const modelSelect = document.getElementById('model-select');
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const resetButton = document.getElementById('reset-button');
const debugToggle = document.getElementById('debug-toggle');
const debugPanel = document.getElementById('debug-panel');
const debugOutput = document.getElementById('debug-output');

// Initialize app
function init() {
    loadChatHistory();
    setupEventListeners();
    initWorker();
    updateDebugInfo('App initialized');
}

// Setup event listeners
function setupEventListeners() {
    modelSelect.addEventListener('change', handleModelChange);
    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
    resetButton.addEventListener('click', resetChat);
    debugToggle.addEventListener('click', toggleDebug);
}

// Handle model change
function handleModelChange() {
    currentModel = modelSelect.value;
    updateDebugInfo(`Model changed to ${currentModel}`);
    // In a real implementation, reload the model in the worker
}

// Handle send message
function handleSend() {
    const message = userInput.value.trim();
    if (!message || isStreaming) return;

    addMessage('user', message);
    userInput.value = '';
    // Start assistant message for streaming
    currentAssistantMessage = addMessage('assistant', '');
    sendToWorker(message);
    // Accessibility: Focus back to input after send
    userInput.focus();
}

// Add message to chat
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = content;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    if (role !== 'assistant' || !isStreaming) {
        chatHistory.push({ role, content });
        saveChatHistory();
    }
    return messageDiv;
}

// Send message to worker
function sendToWorker(message) {
    if (!worker) return;
    isStreaming = true;
    updateDebugInfo('Sending message to worker');
    worker.postMessage({ type: 'generate', message, model: currentModel });
}

// Initialize web worker
function initWorker() {
    if (typeof Worker === 'undefined') {
        addMessage('error', 'Web Workers not supported in this browser.');
        return;
    }
    worker = new Worker('src/worker.js', { type: 'module' });
    worker.onmessage = handleWorkerMessage;
    worker.onerror = handleWorkerError;
    updateDebugInfo('Worker initialized');
}

// Handle messages from worker
function handleWorkerMessage(event) {
    const { type, data } = event.data;
    if (type === 'partial') {
        if (currentAssistantMessage) {
            currentAssistantMessage.textContent += data;
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    } else if (type === 'response') {
        if (currentAssistantMessage) {
            currentAssistantMessage.textContent = data; // Ensure full response
            chatHistory.push({ role: 'assistant', content: data });
            saveChatHistory();
            currentAssistantMessage = null;
        }
        isStreaming = false;
        updateDebugInfo('Response received');
    } else if (type === 'error') {
        addMessage('error', `Error: ${data}`);
        isStreaming = false;
        currentAssistantMessage = null;
        updateDebugInfo(`Worker error: ${data}`);
    } else if (type === 'debug') {
        updateDebugInfo(data);
    }
}

// Handle worker errors
function handleWorkerError(error) {
    addMessage('error', 'Worker error occurred.');
    updateDebugInfo(`Worker error: ${error.message}`);
    isStreaming = false;
}

// Reset chat
function resetChat() {
    chatHistory = [];
    chatContainer.innerHTML = '';
    localStorage.removeItem('chatHistory');
    currentAssistantMessage = null;
    isStreaming = false;
    updateDebugInfo('Chat reset');
}

// Toggle debug panel
function toggleDebug() {
    debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
}

// Update debug info
function updateDebugInfo(info) {
    const timestamp = new Date().toLocaleTimeString();
    debugOutput.textContent += `[${timestamp}] ${info}\n`;
    debugOutput.scrollTop = debugOutput.scrollHeight;
}

// Load chat history from localStorage
function loadChatHistory() {
    const stored = localStorage.getItem('chatHistory');
    if (stored) {
        chatHistory = JSON.parse(stored);
        chatHistory.forEach(msg => addMessage(msg.role, msg.content));
    }
}

// Save chat history to localStorage
function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Initialize on load
window.addEventListener('load', init);