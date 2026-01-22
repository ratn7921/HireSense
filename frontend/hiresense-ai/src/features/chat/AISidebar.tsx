import { useState, useRef, useEffect } from "react";
import { api } from "../../api/client";
import { Bot, Send, X, Sparkles, User } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  data?: any;
  error?: boolean;
}

export default function AISidebar({ onApplyFilters }: any) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your AI job assistant. Ask me to find jobs, filter by skills, or explain matches." }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const ask = async (overrideQuery?: string) => {
    const q = overrideQuery || query;
    if (!q.trim() || loading) return;

    if (!overrideQuery) setQuery("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const resp = await api.aiChat(q);
      console.log("AI Response:", resp);

      let aiContent = "";
      let isError = false;

      if (resp.error) {
        aiContent = resp.answer || `Error: ${resp.error}. ${resp.details || "Please check if the backend is running and the Gemini API key is valid."}`;
        isError = true;
      } else {
        aiContent = resp.answer || (typeof resp.raw === 'string' ? resp.raw : "I processed your request.");
      }

      setMessages(prev => [...prev, { role: "ai", content: aiContent, data: resp, error: isError }]);

      // Apply filters if present
      if (resp?.filter && onApplyFilters) {
        onApplyFilters(resp.filter);
      } else if (resp?.topJobIds && onApplyFilters) {
        onApplyFilters({ topJobIds: resp.topJobIds });
      }

    } catch (e: any) {
      console.error("Chat Error:", e);
      setMessages(prev => [...prev, {
        role: "ai",
        content: "Sorry, I couldn't connect to the server. Please make sure the backend is running on port 3001.",
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-indigo-600 p-3 rounded-l-xl shadow-lg hover:bg-indigo-500 transition-all z-50"
        >
          <Bot className="text-white w-6 h-6" />
        </button>
      )}

      <div className={`fixed right-0 top-0 h-full bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-white/10 transition-all duration-300 z-50 flex flex-col ${open ? "w-96 translate-x-0" : "w-96 translate-x-full"}`}>

        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">AI Assistant</h3>
              <p className="text-xs text-zinc-400">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === "ai"
                ? (msg.error ? "bg-red-500/20 text-red-400" : "bg-indigo-600/20 text-indigo-400")
                : "bg-zinc-700 text-zinc-300"
                }`}>
                {msg.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user"
                ? "bg-indigo-600 text-white rounded-tr-none"
                : (msg.error
                  ? "bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-none"
                  : "bg-zinc-800/50 border border-white/5 text-zinc-200 rounded-tl-none")
                }`}>
                {msg.content}
                {msg.data?.filter && (
                  <div className="mt-2 text-xs bg-indigo-500/10 text-indigo-300 p-2 rounded border border-indigo-500/20">
                    ✨ Applied filters automatically
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="bg-zinc-800/50 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600"
              placeholder="Ask for jobs..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && ask()}
            />
            <button
              onClick={() => ask()}
              disabled={!query.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["Remote React jobs", "High match score", "UX Design"].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => ask(suggestion)}
                className="whitespace-nowrap px-3 py-1 bg-zinc-800/50 border border-zinc-700 rounded-full text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
