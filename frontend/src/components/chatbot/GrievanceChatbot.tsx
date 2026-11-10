import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Search, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  User
} from 'lucide-react';
import { api } from '../../services/api';
import { GlassCard } from '../3d/GlassCard';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  data?: any;
  quickReplies?: string[];
}

export const GrievanceChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Welcome to the RYMEC Grievance Desk Assistance Desk. How can I assist you today? You can enter a Complaint ID to check live status, or ask questions regarding grievance submission policies and timelines.',
      quickReplies: [
        'How does Anonymous Mode work?',
        'What is the SLA turnaround time?',
        'How to reopen a complaint?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text) return;

    const userMsg: Message = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    const grvMatch = text.match(/GRV-[A-Z0-9]+-[A-Z0-9]+/i) || (text.toUpperCase().startsWith('GRV') ? [text.toUpperCase()] : null);

    if (grvMatch) {
      const id = grvMatch[0].toUpperCase();
      try {
        const data = await api.trackComplaint(id);
        const comp = data.complaint;
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `Found record for ${comp.complaint_number}:\n• Subject: "${comp.title}"\n• Current Status: ${comp.status.toUpperCase()}\n• Priority: ${comp.priority.toUpperCase()}\n• Target SLA: ${new Date(comp.sla_deadline).toLocaleDateString()}\n• Department: ${comp.department_name || 'Central Office'}`,
            data: comp,
            quickReplies: ['Submit a Grievance', 'Ask another question']
          }
        ]);
      } catch (e: any) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `I could not find an active complaint with ID "${id}". Please verify the complaint ID format (e.g. GRV-YYYY-XXXXX) or check your dashboard history.`,
            quickReplies: ['What is the SLA time?', 'How to file a grievance?']
          }
        ]);
      }
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const lower = text.toLowerCase();
      let botResponse = '';
      let replies: string[] = [];

      if (lower.includes('anonymous')) {
        botResponse = 'Anonymous Mode allows you to submit grievances with complete privacy. Staff and reviewers see "Anonymous Student" on their screen, ensuring that you can report safety or harassment issues without hesitation.';
        replies = ['File Anonymous Grievance', 'What is the SLA time?'];
      } else if (lower.includes('sla') || lower.includes('time') || lower.includes('deadline')) {
        botResponse = 'Under RYMEC Grievance Redressal statutes:\n• Normal Priority: 7-day resolution window\n• High Priority: 3-day turnaround\n• Urgent / Safety: 24-hour emergency response\nComplaints exceeding the SLA window are escalated automatically.';
        replies = ['How does escalation work?', 'Check Complaint Status'];
      } else if (lower.includes('reopen') || lower.includes('dissatisfied') || lower.includes('not fixed')) {
        botResponse = 'If a resolved complaint requires further action, click "Reopen Grievance" on the tracking page. Provide a brief justification, and the issue will be routed to a senior committee. Reopening is permitted up to 2 times.';
        replies = ['How to track by ID?', 'Contact Office'];
      } else if (lower.includes('ragging') || lower.includes('harass') || lower.includes('safety')) {
        botResponse = 'RYMEC maintains a strict ZERO TOLERANCE policy for ragging and harassment. Ragging grievances are flagged with URGENT priority, routing immediately to the Anti-Ragging Squad and the Principal.';
        replies = ['File a Grievance', 'SLA Response Window'];
      } else if (lower.includes('hostel') || lower.includes('mess') || lower.includes('water')) {
        botResponse = 'Hostel and residential facility grievances (water, geyser, mess food, Wi-Fi) are automatically routed to the Chief Warden Office for inspection and remedial action.';
        replies = ['Track by Complaint ID', 'Submit a Grievance'];
      } else {
        botResponse = 'I can help with submitting complaints, tracking real-time status by ID, understanding SLA deadlines, or answering questions on institutional grievance policies.';
        replies = ['How does Anonymous Mode work?', 'What is the SLA response time?'];
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          quickReplies: replies
        }
      ]);
      setLoading(false);
    }, 350);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <GlassCard className="p-6 flex flex-col h-[75vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
              <Bot className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Grievance Information & Status Assistant
              </h2>
              <p className="text-[11px] text-silver-400">
                Direct status check and institutional policy guidance
              </p>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-royal text-white rounded-br-none shadow-sm'
                    : 'bg-white/5 text-silver-200 border border-white/10 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>

              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                  {msg.quickReplies.map((reply, rIdx) => (
                    <button
                      key={rIdx}
                      onClick={() => handleSend(reply)}
                      className="pebble-pill text-[10px] sm:text-[11px] font-semibold text-silver-300 bg-white/5 border border-white/10 px-3 py-1 hover:bg-white/10 hover:text-white"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-silver-400">
              <span className="h-4 w-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              <span>Checking database...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/10 pt-3 mt-3">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question or enter Complaint ID..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-silver-500 focus:border-brand-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="pebble-pill flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal text-white hover:bg-blue-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </GlassCard>
    </div>
  );
};
