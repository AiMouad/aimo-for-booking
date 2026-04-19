import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Search, User, MoreVertical, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([
    { id: 1, name: 'John Doe', lastMessage: 'Hi, I have a question about the booking', time: '2m ago', unread: 2, avatar: 'JD' },
    { id: 2, name: 'Sarah Smith', lastMessage: 'Thank you for the confirmation', time: '1h ago', unread: 0, avatar: 'SS' },
    { id: 3, name: 'Mike Johnson', lastMessage: 'Is the property available next week?', time: '3h ago', unread: 1, avatar: 'MJ' },
  ]);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Hi, I have a question about the booking', time: '10:30 AM' },
    { id: 2, sender: 'them', text: 'Is there any availability for next weekend?', time: '10:31 AM' },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'me',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    toast.success('Message sent');
  };

  return (
    <div className="min-h-screen gradient-surface">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">Communicate with your guests and team</p>
          </div>
          <Button size="sm" leftIcon={<MessageSquare size={14} />}>
            New Message
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4">
              <div className="mb-4">
                <Input
                  placeholder="Search conversations..."
                  leftIcon={<Search size={14} />}
                />
              </div>
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedConversation?.id === conv.id
                        ? 'bg-primary-100 dark:bg-primary-950/40 border-primary-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent'
                    } border-2`}
                  >
                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{conv.name}</p>
                        <p className="text-xs text-gray-400">{conv.time}</p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {conv.unread}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="glass-card flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {selectedConversation.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedConversation.name}</p>
                      <p className="text-xs text-green-500">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                    <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${
                        msg.sender === 'me'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      } rounded-2xl px-4 py-2`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'me' ? 'text-primary-200' : 'text-gray-400'
                        }`}>{msg.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="sm">
                      <Send size={18} />
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="glass-card h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500">No conversation selected</h3>
                  <p className="text-sm text-gray-400 mt-2">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
