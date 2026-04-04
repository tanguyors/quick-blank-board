import { toggleChatbot } from './chatbotState';
import iconChatbot from '@/assets/icons/chatbot.png';

export function ChatBotToggle() {
  return (
    <button
      type="button"
      onClick={toggleChatbot}
      className="p-1.5 rounded-lg transition-colors hover:bg-muted"
      aria-label="Ouvrir le chatbot"
    >
      <img src={iconChatbot} alt="" className="h-6 w-6 object-contain" />
    </button>
  );
}
