import api from './api';

const chatbotService = {
  async sendMessage(message, sessionId = null) {
    const response = await api.post('/v1/chatbot/interact/', {
      message,
      session_id: sessionId,
    });
    return response.data;
  },

  async createSession() {
    const response = await api.post('/v1/chatbot/sessions/');
    return response.data;
  },

  async getChatHistory(sessionId) {
    const response = await api.get(`/v1/chatbot/sessions/${sessionId}/`);
    return response.data;
  },

  async getSessions() {
    const response = await api.get('/v1/chatbot/sessions/');
    return response.data;
  },

  async deleteSession(sessionId) {
    await api.delete(`/v1/chatbot/sessions/${sessionId}/`);
  },

  async smartSearch(query) {
    const response = await api.post('/v1/chatbot/search/', { query });
    return response.data;
  },
};

export default chatbotService;