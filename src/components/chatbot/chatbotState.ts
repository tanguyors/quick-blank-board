// Simple global state for chatbot open/close, shared between ChatBot and ChatBotToggle
let listener: ((open: boolean) => void) | null = null;
let currentState = false;

export function subscribeChatbot(fn: (open: boolean) => void) {
  listener = fn;
  return () => { listener = null; };
}

export function toggleChatbot() {
  currentState = !currentState;
  listener?.(currentState);
}

export function setChatbotOpen(open: boolean) {
  currentState = open;
  listener?.(currentState);
}

export function getChatbotOpen() {
  return currentState;
}
