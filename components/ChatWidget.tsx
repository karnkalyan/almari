
import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageCircle, X, Send, User, Mail, Phone, ChevronRight, MessageSquare, Clock } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { apiService } from '../services/api';
import { ShopContext } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../constants';

const SOCKET_URL = API_BASE_URL.replace('/api', '');

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'info' | 'chat'>('info');
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { site } = useContext(ShopContext);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const chatSettings = site.chatSettings || {
    enabled: true,
    welcomeMessage: 'Hi! How can we help you today?',
    faq: [
      { question: 'Where is my order?', answer: 'You can check your order status in your profile or ask me here!' },
      { question: 'Delivery time?', answer: 'Usually 1-3 business days within the city.' }
    ],
    collectGuestInfo: true
  };

  useEffect(() => {
    if (user && step === 'info') {
      setStep('chat');
    }
  }, [user]);

  useEffect(() => {
    if (step === 'chat' && !socketRef.current) {
      const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('new_message', (data: any) => {
        if (data.message.sender === 'admin' || data.message.sender === 'system') {
          setMessages(prev => [...prev, data.message]);
        }
      });

      // Load existing conversation if any
      const loadHistory = async () => {
        try {
          const convs = await apiService.getConversations();
          if (convs.length > 0) {
            const active = convs[0];
            setConversationId(active.id);
            socket.emit('join_conversation', active.id);
            const history = await apiService.getConversationMessages(active.id, 'customer');
            setMessages(history);
          }
        } catch {}
      };
      
      if (user) loadHistory();
    }
  }, [step]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestInfo.name || !guestInfo.email) return;
    setStep('chat');
    // For guests, we might want to create a temporary user or just start a guest conversation
    // For now, let's assume the API handles guest messages if a conversationId isn't provided
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const tempId = Date.now().toString();
    const newUserMsg = { id: tempId, text, sender: 'customer', createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');

    try {
      let activeConvId = conversationId;
      if (!activeConvId) {
        // Create conversation
        const conv = await apiService.createConversation('General Support', guestInfo.email || (user?.email || 'guest@guest.com'));
        activeConvId = conv.id;
        setConversationId(activeConvId);
        socketRef.current?.emit('join_conversation', activeConvId);
      }
      
      await apiService.sendMessage(activeConvId, text, 'customer');
      
      // Auto-reply logic (Simple FAQ match)
      const faqMatch = chatSettings.faq?.find(f => text.toLowerCase().includes(f.question.toLowerCase()));
      if (faqMatch) {
        setTimeout(() => {
          setMessages(prev => [...prev, { id: 'faq-' + Date.now(), text: faqMatch.answer, sender: 'admin', createdAt: new Date().toISOString() }]);
        }, 1000);
      }
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  if (!chatSettings.enabled) return null;

  return (
    <div className={`fixed z-[99999] ${isOpen ? 'inset-0 md:inset-auto md:bottom-6 md:right-6' : 'bottom-6 right-6'} flex flex-col items-end pointer-events-none`}>
      {isOpen && (
        <div className="pointer-events-auto w-full md:mb-4 md:w-[360px] max-w-[100vw] bg-white md:rounded-3xl shadow-2xl border-0 md:border md:border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 h-[100dvh] md:h-auto md:max-h-[600px]">
          {/* Header */}
          <div className="p-6 bg-[var(--brand-primary)] text-white relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white transition">
              <X size={20} />
            </button>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <MessageSquare size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-lg leading-tight">Customer Support</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                     <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                     <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Active Now</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50 relative">
            {step === 'info' && !user ? (
              <div className="p-8 flex-1 overflow-y-auto">
                 <h4 className="text-slate-800 font-bold mb-2">Welcome!</h4>
                 <p className="text-gray-500 text-sm mb-8 leading-relaxed">Please introduce yourself to start a live conversation with our team.</p>
                 
                 <form onSubmit={handleStartChat} className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                       <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          <input 
                            required
                            value={guestInfo.name}
                            onChange={e => setGuestInfo({...guestInfo, name: e.target.value})}
                            className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 transition-all font-medium text-slate-700"
                            placeholder="John Doe"
                          />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                       <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          <input 
                            required
                            type="email"
                            value={guestInfo.email}
                            onChange={e => setGuestInfo({...guestInfo, email: e.target.value})}
                            className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 transition-all font-medium text-slate-700"
                            placeholder="john@example.com"
                          />
                       </div>
                    </div>
                    <div className="space-y-1.5 pb-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                       <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          <input 
                            value={guestInfo.phone}
                            onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})}
                            className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 transition-all font-medium text-slate-700"
                            placeholder="+977 98..."
                          />
                       </div>
                    </div>
                    <button className="w-full h-14 bg-[var(--brand-primary)] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                       Start Chat <ChevronRight size={16} />
                    </button>
                 </form>
              </div>
            ) : (
              <>
                <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide bg-gray-50/50">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                       <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 text-[var(--brand-primary)]">
                          <MessageCircle size={32} />
                       </div>
                       <p className="text-slate-800 font-bold mb-2">{chatSettings.welcomeMessage}</p>
                       <p className="text-gray-400 text-xs px-4">Our agents usually respond within 5 minutes.</p>
                       
                       <div className="mt-8 space-y-2">
                          {chatSettings.faq?.map((f: any, i: number) => (
                             <button 
                                key={i}
                                onClick={() => sendMessage(f.question)}
                                className="w-full p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-left text-xs font-bold text-slate-700 flex justify-between items-center transition-all group"
                             >
                                {f.question}
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-[var(--brand-primary)]" />
                             </button>
                          ))}
                       </div>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender === 'customer' 
                          ? 'bg-[var(--brand-primary)] text-white rounded-br-md' 
                          : 'bg-white border border-gray-100 text-slate-700 shadow-sm rounded-bl-md'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'customer' ? 'justify-end' : ''}`}>
                           <Clock size={8} className="opacity-40" />
                           <span className="text-[8px] opacity-40 font-bold uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-safe">
                  <div className="flex gap-2 p-1.5 bg-gray-50 border border-gray-100 rounded-2xl">
                    <input 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
                      className="flex-1 px-3 py-2 bg-transparent text-sm outline-none font-medium text-slate-700"
                      placeholder="Type a message..."
                    />
                    <button 
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim()}
                      className="w-10 h-10 bg-[var(--brand-primary)] text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto w-16 h-16 bg-[var(--brand-primary)] text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group relative"
        >
          <div className="absolute inset-0 bg-white/20 rounded-[2rem] scale-90 group-hover:scale-100 transition-transform duration-500"></div>
          <MessageCircle size={28} className="relative z-10" />
        </button>
      )}
    </div>
  );
};
