import React, { useState } from 'react';
import { Bot, Send, Sparkles, MessageSquare, HelpCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Language, LatestReading } from '../types';
import { UI_TRANSLATIONS } from '../constants';

interface AIAdvisoryChatProps {
  latest: LatestReading | null;
  language: Language;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIAdvisoryChat: React.FC<AIAdvisoryChatProps> = ({
  latest,
  language,
}) => {
  const t = UI_TRANSLATIONS[language];
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: language === 'te' 
        ? 'నమస్కారం! నేను మీ ఆక్వాసెంటినెల్ AI నిపుణుడిని. మీ చెరువు నీటి నాణ్యత, ఏరేషన్ షెడ్యూల్, లేదా మేత నిర్వహణపై ఏవైనా ప్రశ్నలు అడగవచ్చు.'
        : language === 'hi'
        ? 'नमस्ते! मैं आपका एक्वासेंटिनल AI जल कृषि सलाहकार हूँ। ऑक्सीजन, अमोनिया, तापमान या चारा प्रबंधन पर सवाल पूछें।'
        : 'Welcome! I am your AquaSentinel Aquaculture Intelligence Copilot. Ask me about aerator schedules, water chemistry remediation, feeding guidelines, or proactive fish welfare.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Suggested prompt chips based on current language
  const suggestedPrompts = language === 'te' ? [
    'ఆక్సిజన్ తక్కువగా ఉంటే తక్షణమే ఏం చేయాలి?',
    'అమ్మోనియా పెరిగితే నీటి మార్పిడి ఎంత శాతం చేయాలి?',
    'ఈ ఉష్ణోగ్రత వద్ద మేత తగ్గించాలా?',
  ] : language === 'hi' ? [
    'ऑक्सीजन की कमी में तुरंत क्या कदम उठाएं?',
    'अमोनिया बढ़ने पर कितना पानी बदलना चाहिए?',
    'क्या इस तापमान पर चारा आधा कर देना चाहिए?',
  ] : [
    'Immediate action protocol for low dissolved oxygen?',
    'How much water exchange is required for elevated ammonia?',
    'Optimal aerator schedule given current temperatures?',
  ];

  const handleSend = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, lang: language }),
      });

      if (!response.ok) {
        throw new Error('Failed to get advisory response');
      }

      const data = await response.json();
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.answer || 'Analysis complete. Maintain standard aeration protocols.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Fallback local agronomic recommendation if backend connection was interrupted
      let fallbackAnswer = 'Maintain continuous aeration and test dissolved oxygen every 30 minutes.';
      if (latest && latest.advice && latest.advice.length > 0) {
        fallbackAnswer = latest.advice.map((a) => a[language] || a.en).join(' ');
      }
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: fallbackAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-5 lg:p-6 border border-cyan-500/20 flex flex-col h-[460px] justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-md shadow-cyan-500/10">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <span>{t.aiAdvisory}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  DIURNAL ENGINE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Predictive agronomic guidelines for pond managers
              </p>
            </div>
          </div>

          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        </div>

        {/* Quick prompt chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-950/40 transition-all shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-3 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75">
                <span className="font-semibold uppercase tracking-wider">
                  {m.sender === 'user' ? 'Operator' : 'AquaSentinel AI'}
                </span>
                <span>{m.timestamp}</span>
              </div>
              <p className="text-xs">{m.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-slate-900/60 p-2.5 rounded-xl max-w-fit border border-slate-800">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting aquaculture biophysical rules...</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={t.askQuestionPlaceholder}
          className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span>{t.sendPrompt}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
