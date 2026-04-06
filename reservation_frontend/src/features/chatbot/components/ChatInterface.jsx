import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage, createNewSession, clearMessages, setTyping } from '../chatbotSlice';
import { fetchServices } from '../../services/servicesSlice';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';

const ChatInterface = () => {
  const dispatch = useDispatch();
  const { 
    messages, 
    isTyping, 
    isLoading, 
    error, 
    currentSession 
  } = useSelector((state) => state.chatbot);
  const { services } = useSelector((state) => state.services);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Create initial session if none exists
    if (!currentSession && !isLoading) {
      dispatch(createNewSession());
    }
  }, [currentSession, isLoading, dispatch]);

  useEffect(() => {
    // Load services for context
    dispatch(fetchServices());
  }, [dispatch]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isTyping) return;

    const message = inputMessage.trim();
    setInputMessage('');
    dispatch(setTyping(true));

    try {
      await dispatch(sendMessage({ 
        message, 
        sessionId: currentSession?.id 
      })).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleQuickAction = (service) => {
    const message = `Tell me more about ${service.name}`;
    setInputMessage(message);
    inputRef.current?.focus();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-blue-600 hover:bg-blue-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50 bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="font-medium">AI Assistant</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsMinimized(true)}
          className="text-white hover:bg-white/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm">Hello! I'm your AI assistant. How can I help you find the perfect service today?</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="text-xs font-medium mb-2">Recommended Services:</p>
                  <div className="space-y-1">
                    {message.recommendations.map((service, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(service)}
                        className="text-xs bg-white text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 w-full text-left"
                      >
                        {service.name} - €{service.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs mt-1 opacity-70">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              Error: {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about services..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            size="sm"
          >
            {isTyping ? <Loader size="sm" /> : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
