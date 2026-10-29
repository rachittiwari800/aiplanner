import api from './api';

export interface ChatContext {
  destination?: string;
  budget?: number;
  currency?: string;
  travelStyle?: string;
  durationDays?: number;
}

export const chatService = {
  async sendMessage(message: string, context?: ChatContext): Promise<{ reply: string; source: string }> {
    const response = await api.post('/chat', { message, context });
    return response.data.data;
  },
};

