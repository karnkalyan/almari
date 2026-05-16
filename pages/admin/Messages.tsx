import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, MessageCircle, Search, Send, Trash2, Circle, Clock } from 'lucide-react';
import { apiService } from '../../services/api';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../../constants';

interface ChatMessage {
  id: string;
  conversationId: string;
  text: string;
  sender: 'customer' | 'admin';
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  userId: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string; avatar?: string };
  messages: ChatMessage[];
}

const SOCKET_URL = API_BASE_URL.replace('/api', '');

export const AdminMessages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const prevConversationRef = useRef<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await apiService.getConversations();
      setConversations(data);
      if (!selectedId && data.length > 0) setSelectedId(data[0].id);
    } catch {
      toast.error('Failed to load conversations');
    }
  }, [selectedId]);

  useEffect(() => {
    loadConversations();
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('new_message', (data: { conversationId: string; message: ChatMessage }) => {
      setConversations(prev =>
        prev.map(c =>
          c.id === data.conversationId
            ? { ...c, messages: [data.message], updatedAt: data.message.createdAt, status: 'open' }
            : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
      setMessages(prev => {
        if (prev.length > 0 && prev[0]?.conversationId === data.conversationId) {
          if (prev.find(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    // Leave previous room
    if (prevConversationRef.current && socketRef.current) {
      socketRef.current.emit('leave_conversation', prevConversationRef.current);
    }
    // Join new room
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', selectedId);
    }
    prevConversationRef.current = selectedId;

    apiService.getConversationMessages(selectedId, 'admin').then(setMessages).catch(() => {});
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selected = conversations.find(c => c.id === selectedId);

  const filtered = useMemo(
    () => conversations.filter(c =>
      `${c.user?.name || ''} ${c.user?.email || ''} ${c.subject}`.toLowerCase().includes(search.toLowerCase())
    ),
    [conversations, search]
  );

  const sendReply = async () => {
    if (!selectedId || !reply.trim()) return toast.error('Type a message first');
    setSending(true);
    try {
      const msg = await apiService.sendMessage(selectedId, reply.trim(), 'admin');
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      setReply('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const markResolved = async () => {
    if (!selectedId) return;
    await apiService.updateConversationStatus(selectedId, 'resolved');
    setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, status: 'resolved' } : c));
    toast.success('Conversation marked as resolved');
  };

  const deleteConversation = async (id: string) => {
    await apiService.deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setSelectedId(remaining[0]?.id || null);
    }
    toast.success('Conversation deleted');
  };

  const getStatusColor = (status: string) => {
    if (status === 'resolved') return 'text-green-500';
    if (status === 'closed') return 'text-gray-400';
    return 'text-blue-500';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const unreadCount = (c: Conversation) => {
    const lastMsg = c.messages?.[0];
    return lastMsg && lastMsg.sender === 'customer' && !lastMsg.isRead ? 1 : 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Inbox</h1>
        <p className="text-gray-500 text-sm">Real-time customer support chat. Messages update live.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {filtered.map(c => {
              const isSelected = c.id === selectedId;
              const hasUnread = unreadCount(c) > 0;
              const lastMsg = c.messages?.[0];
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50/70 border-l-4 border-[var(--brand-primary)]' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${hasUnread ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {c.user?.avatar ? (
                        <img src={c.user.avatar} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        c.user?.name?.charAt(0) || '?'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{c.user?.name || 'Unknown'}</h4>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(c.updatedAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.user?.email}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-sm font-semibold text-slate-700 truncate">{c.subject}</p>
                        <Circle size={8} className={`flex-shrink-0 fill-current ${getStatusColor(c.status)}`} />
                      </div>
                      {lastMsg && <p className="text-sm text-gray-500 truncate mt-0.5">{lastMsg.sender === 'admin' ? 'You: ' : ''}{lastMsg.text}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle size={32} className="mx-auto mb-3 text-gray-300" />
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Chat Panel */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold flex-shrink-0">
                    {selected.user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-800 truncate">{selected.subject}</h2>
                    <p className="text-sm text-gray-500 truncate">{selected.user?.name} · {selected.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${selected.status === 'resolved' ? 'bg-green-100 text-green-700' : selected.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                    {selected.status}
                  </span>
                  <button onClick={markResolved} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Mark Resolved">
                    <CheckCircle size={18} />
                  </button>
                  <button onClick={() => deleteConversation(selected.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 py-12">
                    <MessageCircle size={40} className="mx-auto mb-3 text-gray-200" />
                    <p>No messages in this conversation yet.</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender === 'admin' ? 'bg-[var(--brand-primary)] text-white rounded-br-md' : 'bg-gray-100 text-slate-800 rounded-bl-md'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <div className={`flex items-center gap-1.5 mt-1 ${msg.sender === 'admin' ? 'justify-end' : ''}`}>
                        <Clock size={10} className={msg.sender === 'admin' ? 'text-white/50' : 'text-gray-400'} />
                        <span className={`text-[10px] ${msg.sender === 'admin' ? 'text-white/50' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-3">
                  <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    className="flex-1 h-11 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                    placeholder="Type your reply..."
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="w-11 h-11 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center hover:bg-[#003d61] transition disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
              <MessageCircle size={48} className="text-gray-200" />
              <p className="font-medium">Select a conversation to start chatting</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
