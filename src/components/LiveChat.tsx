import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Heart } from 'lucide-react';
import { ChatMessage, User } from '../types';

interface LiveChatProps {
  user: User | null;
}

export default function LiveChat({ user }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `Hello sweetheart! I am Riddhi, your cozy crochet companion. ✨ Sending fuzzy woolly hugs! Are you looking for a magical gift today? I am happy to recommend something beautiful or explain our custom stitching! 🌸`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const preSets = [
    { label: "🎁 Suggest a gift", text: "What is your best gift recommendation?" },
    { label: "🧶 Custom details", text: "How can I submit a custom crochet order request?" },
    { label: "📍 Where are you located?", text: "Where is crochet.softdiaries located?" },
    { label: "📦 Delivery forecast", text: "What is the shipping cost and estimated delivery time?" }
  ];

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile: user
        })
      });

      const data = await response.json();
      
      const replyMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: data.text || "Oh honey, my yarn slipped. Could you repeat that? ✨",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: "Sending soft knit hugs! Our stitching gears are humming. How can I help you choose beautiful keychains today? ✨",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          id="chat-floating-button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 p-4 rounded-full bg-linear-to-r from-lavender-400 to-pink-300 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all animate-bounce"
        >
          <MessageCircle className="w-6 h-6 animate-pulse" />
          <span className="hidden sm:inline text-xs font-bold font-serif tracking-tight pr-1">Chat with Riddhi ✨</span>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] max-w-[calc(100vw-32px)] max-h-[85vh] h-[480px] bg-cream-soft dark:bg-zinc-900 rounded-3xl shadow-2xl border border-lavender-100 dark:border-zinc-800 flex flex-col overflow-hidden animate-fade-in transition-colors duration-200">
          
          {/* Header */}
          <div className="bg-linear-to-r from-lavender-400 to-pink-300 p-4 text-white flex justify-between items-center shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-lg shadow-inner">
                  🧶
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></div>
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm leading-tight flex items-center gap-1.5">
                  Riddhi ✨ <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Owner</span>
                </h4>
                <p className="text-[10px] text-zinc-100 italic">Online & stitching crafts now...</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Panel */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-zinc-50/55 dark:bg-zinc-950/20">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div key={msg.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} items-end gap-1.5`}>
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-lavender-50 dark:bg-zinc-800 flex items-center justify-center text-xs shadow-xs shrink-0 self-start">
                      🌸
                    </div>
                  )}
                  <div className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isAssistant
                      ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-bl-none border border-lavender-50 dark:border-zinc-700'
                      : 'bg-lavender-400 text-white rounded-br-none font-medium'
                  }`}>
                    {msg.text}
                    <span className={`block text-[8px] text-right mt-1 ${isAssistant ? 'text-zinc-300' : 'text-lavender-100'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Loading typing state */}
            {isTyping && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-lavender-50 dark:bg-zinc-800 flex items-center justify-center text-xs shrink-0">
                  🧶
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-bl-none px-3.5 py-2.5 border border-lavender-50 dark:border-zinc-700 text-xs">
                  <span className="flex items-center gap-1 text-zinc-400">
                    Stitching reply
                    <span className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce"></span>
                    <span className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce delay-100"></span>
                    <span className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce delay-200"></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Templates */}
          {messages.length < 3 && !isTyping && (
            <div className="px-4 py-2 border-t border-lavender-50 dark:border-zinc-850 bg-white/70 dark:bg-zinc-900 flex gap-1.5 overflow-x-auto whitespace-nowrap shrink-0">
              {preSets.map((ps, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(ps.text)}
                  className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-lavender-50 text-lavender-600 border border-lavender-100/60 dark:bg-zinc-800 dark:text-lavender-300 dark:border-zinc-750 transition-colors"
                >
                  {ps.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMsg);
            }}
            className="p-3 border-t border-lavender-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2 items-center shrink-0"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type cozy message..."
              className="flex-grow px-3.5 py-2 text-xs rounded-full border border-lavender-200 dark:border-zinc-750 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-lavender-300"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="p-2 rounded-full bg-lavender-400 text-white disabled:bg-zinc-200 hover:bg-lavender-500 active:scale-95 transition-all self-stretch flex items-center justify-center shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
