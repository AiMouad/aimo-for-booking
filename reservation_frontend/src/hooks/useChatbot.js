import { useState } from 'react';
import chatbotService from '../services/chatbot.service';

export const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    // Add user message
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    try {
      const response = await chatbotService.sendMessage(text, messages);
      
      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: response.reply,
        recommendations: response.recommendations || [],
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      return response;
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return { messages, loading, sendMessage, clearMessages };
};