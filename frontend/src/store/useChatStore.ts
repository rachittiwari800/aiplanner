import { create } from 'zustand';
import type { ChatMessage } from '../types';


interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (text: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  clearChat: () => void;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    sender: 'user',
    text: 'Help me plan a trip around my dates, interests, and budget.',
    timestamp: '10:14 AM',
  },
  {
    id: 'msg_2',
    sender: 'ai',
    text: 'Share a destination, travel dates, interests, and budget. I will help shape the itinerary, budget, and daily activities.',
    timestamp: '10:15 AM',
  },
];

export const useChatStore = create<ChatState>((set) => ({
  messages: initialMessages,
  isStreaming: false,
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: `msg_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    })),
  updateLastMessage: (text) =>
    set((state) => {
      const newMessages = [...state.messages];
      if (newMessages.length > 0) {
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = {
          ...newMessages[lastIndex],
          text,
        };
      }
      return { messages: newMessages };
    }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  clearChat: () => set({ messages: [] }),
}));
