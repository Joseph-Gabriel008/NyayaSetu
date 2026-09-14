"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle, Quote, Scale, Copy, Check } from "lucide-react";
import { ChatMessage, Citation } from "@/lib/types";

interface GroundedChatProps {
  documentText: string;
  documentTitle?: string;
  initialQuery?: string | null;
}

const DEFAULT_QUESTIONS = [
  "Can the landlord evict me with just 7 days notice?",
  "Is the 10-month security deposit legally allowed in Chennai?",
  "Can the landlord enter my flat without prior notice?",
  "Who is responsible for structural plumbing or seepage repairs?",
  "Can the landlord deduct painting charges from my deposit?",
];

const MANDATORY_DISCLAIMER =
  "This is general information, not legal advice — consult a licensed advocate for your specific situation.";

export function GroundedChat({
  documentText,
  documentTitle = "Uploaded Contract",
  initialQuery,
}: GroundedChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-msg",
      role: "assistant",
      content: `Hello! I am your NyayaSetu grounded assistant. I am strictly grounded in "${documentTitle}". Ask me anything about your deposit, notice periods, repair clauses, or liabilities, and I will cite the exact clauses for you.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // If initialQuery changes from outside, trigger it automatically
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0) {
      handleSendMessage(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSendMessage = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q || q.trim().length === 0 || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "initial-msg")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.trim(),
          docText: documentText,
          history,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to get answer from document.");
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        citations: data.citations as Citation[],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Could not query document.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section
      aria-label="Ask the Document Chatbot"
      className="glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[700px] overflow-hidden"
    >
      {/* Chat Header */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-white text-sm sm:text-base flex items-center space-x-2">
              <span>Ask-The-Document Assistant</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Grounded Mode
              </span>
            </h3>
            <p className="text-xs text-slate-400">Strictly answers from your contract text — zero legal hallucination</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span>General Information Only</span>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-4 py-3 bg-slate-950/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-slate-400 shrink-0 font-bold flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick queries:</span>
        </span>
        {DEFAULT_QUESTIONS.map((question, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(question)}
            disabled={isLoading}
            className="shrink-0 px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
          >
            {question}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div
        className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Conversation Log"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 max-w-3xl ${
              msg.role === "user" ? "ml-auto flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md ${
                msg.role === "user"
                  ? "bg-amber-500 text-nyaya-950 font-bold"
                  : "bg-slate-800 text-amber-400 border border-slate-700"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-3 ${
                msg.role === "user"
                  ? "bg-amber-500 text-nyaya-950 font-medium shadow-lg shadow-amber-500/10"
                  : "bg-slate-950/90 border border-slate-800/80 text-slate-100 shadow-md"
              }`}
            >
              <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>

              {/* Citations Box for Assistant */}
              {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                <div className="pt-2.5 border-t border-slate-800/80 space-y-2 text-xs">
                  <span className="font-bold text-amber-400 flex items-center space-x-1.5">
                    <Quote className="w-3.5 h-3.5" />
                    <span>Exact Document Citations:</span>
                  </span>
                  {msg.citations.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs space-y-1"
                    >
                      <p className="font-bold text-slate-100">{c.clauseTitle}</p>
                      <p className="text-slate-400 italic">&ldquo;{c.snippet}&rdquo;</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Mandatory Legal Disclaimer on Assistant Message */}
              {msg.role === "assistant" && (
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 italic">
                  <div className="flex items-center space-x-1.5">
                    <Scale className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{MANDATORY_DISCLAIMER}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="not-italic text-slate-400 hover:text-white ml-2 shrink-0 p-1"
                    title="Copy Answer"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              <div className={`text-[10px] ${msg.role === "user" ? "text-nyaya-900 font-bold" : "text-slate-500 font-mono"}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl p-4 bg-slate-950 border border-slate-800 text-xs text-amber-300 animate-pulse flex items-center space-x-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Scanning document clauses and retrieving citations...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Error alert */}
      {error && (
        <div role="alert" className="px-4 py-2 bg-rose-950/80 border-t border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-white/10 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about this document (e.g. 'What is my notice period?')..."
            aria-label="Ask a question about the document"
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || inputQuery.trim().length === 0}
            aria-label="Send Question"
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-nyaya-950 font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 shrink-0"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1.5">
          <Scale className="w-3 h-3 text-amber-400 inline shrink-0" />
          <span>{MANDATORY_DISCLAIMER}</span>
        </div>
      </div>
    </section>
  );
}
