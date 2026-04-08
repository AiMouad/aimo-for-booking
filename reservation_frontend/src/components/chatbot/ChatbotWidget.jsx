import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  MessageSquare, X, Send, Bot, Sparkles,
  RotateCcw, Minimize2,
} from 'lucide-react';
import {
  sendChatMessage, addUserMessage, toggleChat, clearMessages,
} from '../../store/chatbotSlice';

const TypingIndicator = () => (
  <div className="flex items-end gap-2 justify-start">
    <div className="w-7 h-7 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
      <Bot size={14} className="text-white" />
    </div>
    <div className="chat-bubble-bot flex items-center gap-1.5 px-4 py-3">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  </div>
);

const Message = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-7 h-7 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div>
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}>
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        {/* Suggestion cards if data present */}
        {message.data && message.dataType === 'suggestions' && (
          <div className="mt-2 space-y-1.5 max-w-xs">
            {message.data.slice(0, 3).map((p) => (
              <div key={p.id}
                className="p-3 bg-white dark:bg-surface-700 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{p.name}</p>
                <p className="text-xs text-gray-500">{p.location} · ⭐ {p.rating}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-gray-400 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

const QUICK_PROMPTS = [
  'Show my bookings 📋',
  'Available properties ✨',
  'Give me a tip 💡',
  'How to cancel? ❌',
];

const ChatbotWidget = () => {
  const dispatch = useDispatch();
  const { messages, isOpen, isLoading, sessionId, aiPowered } = useSelector((s) => s.chatbot);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    setInput('');
    dispatch(addUserMessage(msg));
    dispatch(sendChatMessage({ message: msg, sessionId }));
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── Chat Window ─────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-4 z-50 w-[360px] sm:w-[400px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/40"
            style={{ maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="gradient-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">AIMO Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-blue-200 text-xs">
                      {aiPowered ? 'AI Powered' : 'Online'}
                    </span>
                    {aiPowered && <Sparkles size={10} className="text-yellow-300" />}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => dispatch(clearMessages())}
                  title="Clear chat"
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => dispatch(toggleChat())}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-surface-900 min-h-0">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-glow animate-float">
                    <Bot size={28} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Hi! I'm AIMO 👋</h4>
                    <p className="text-gray-400 text-xs mt-1">Your intelligent booking assistant</p>
                  </div>
                  {/* Quick prompts */}
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleSend(p)}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 border border-primary-100 hover:bg-primary-100 transition-colors dark:bg-primary-950/30 dark:text-primary-300"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <Message key={msg.id} message={msg} />
              ))}

              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-surface-900 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-sm hover:shadow-glow disabled:opacity-50 disabled:pointer-events-none transition-shadow flex-shrink-0"
              >
                <Send size={16} className="text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle Button ──────────────────────────────────── */}
      <motion.button
        onClick={() => dispatch(toggleChat())}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg hover:shadow-glow transition-shadow"
        aria-label="Open AI Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <Minimize2 size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default ChatbotWidget;
