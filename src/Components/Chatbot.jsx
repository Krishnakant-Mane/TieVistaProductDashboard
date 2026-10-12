import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  IconMessageCircle2,
  IconSend,
  IconMinus,
  IconRobot,
  IconUser,
  IconSparkleHighlight,
} from '@tabler/icons-react';
import { API_URL } from '../services/api';

// ──────────────────────────────────────────────────
// Helper: renders AI response text with basic
// markdown-style formatting (bold, bullet points)
// ──────────────────────────────────────────────────
const FormattedMessage = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        // Bold: **text**
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <p
            key={i}
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      })}
    </div>
  );
};

// ──────────────────────────────────────────────────
// Typing indicator (bouncing dots)
// ──────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-none">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

// ──────────────────────────────────────────────────
// Main Chatbot Component
// ──────────────────────────────────────────────────
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Hello! I\'m your AI assistant for this dashboard.\n\nYou can ask me things like:\n- **Which fund has the highest AUM ever?**\n- **Compare WhiteOak and Marcellus returns**\n- **Show all PMS funds with Sharpe ratio above 1**',
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history excluding the initial greeting for brevity
      const history = messages.map(m => ({ role: m.role, text: m.text }));

      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/chat`,
        { question, conversationHistory: history },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [
        ...prev,
        { role: 'model', text: data.answer },
      ]);
    } catch (error) {
      const errorText =
        error.response?.data?.error ||
        'Sorry, something went wrong. Please try again.';
      setMessages(prev => [
        ...prev,
        { role: 'model', text: errorText, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Suggested quick questions ──
  const suggestions = [
    'Top 5 funds by AUM of all time',
    'Best Sharpe ratio funds ever',
    'Show all products who\'s Type is PMS',
  ];

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">

      {/* ─── Chat Window ─── */}
      {isOpen && (
        <div className="mb-3 sm:mb-4 w-[calc(100vw-1.5rem)] sm:w-[380px] h-[min(520px,calc(100dvh-5.5rem))] sm:h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-4">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#F3D34F] via-[#D59D1C] to-[#F5D958] text-white px-3.5 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <img src="/icon.png" alt="" />
              </div>
              <div>
                <p className="text-black font-semibold text-sm">AI Assistant</p>
                <p className="text-[10px] text-white">Powered by TieVista</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              title="Minimize"
            >
              <IconMinus size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-3 bg-gray-50 flex flex-col gap-3 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-1">
                    <img src="/icon.png" alt="" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                    msg.role === 'user'
                      ? 'bg-white text-black shadow-sm rounded-br-none'
                      : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none'
                  }`}
                >
                  {msg.role === 'model' && !msg.isError ? (
                    <FormattedMessage text={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F3D34F] via-[#D59D1C] to-[#F5D958] flex items-center justify-center flex-shrink-0 mt-1">
                    <IconUser size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && <TypingIndicator />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions (only show when no conversation yet) */}
          {messages.length === 1 && !isLoading && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-1.5 flex-wrap flex-shrink-0 max-h-[96px] overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(s);
                    inputRef.current?.focus();
                  }}
                  className="text-[11px] bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about funds, AUM, returns..."
                rows={1}
                className="flex-1 bg-gray-50 border border-[#F5D958] rounded-xl px-3.5 py-2.5 text-[13px] focus:border-amber-300 resize-none max-h-[90px] sm:max-h-[100px] overflow-y-auto"
                style={{ lineHeight: '1.4' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-[#F3D34F] via-[#D59D1C] to-[#F5D958] text-white rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <IconSend size={16} />
              </button>
            </div>
            <p className="text-[8px] italic text-gray-400 text-center mt-1.5">
              This is an AI which can make mistake. Please verify the information before using it.
            </p>
          </div>
        </div>
      )}

      {/* ─── Floating Action Button ─── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-gradient-to-r from-[#F3D34F] via-[#D59D1C] to-[#F5D958] text-white'
            : 'bg-gradient-to-r from-[#F3D34F] via-[#D59D1C] to-[#F5D958] text-white'
        }`}
        title={isOpen ? 'Close chat' : 'Open AI Assistant'}
      >
        <IconSparkleHighlight size={20} />
      </button>
    </div>
  );
};

export default Chatbot;
