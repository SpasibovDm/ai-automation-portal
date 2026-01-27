import React, { useMemo, useRef, useState } from "react";

import { createChatLead, sendChatMessage } from "../services/chatApi";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hi! How can I help you today?",
  },
];

const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadPrompted, setLeadPrompted] = useState(false);
  const [leadInfo, setLeadInfo] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const chatTitle = useMemo(
    () => (leadSubmitted ? "Thanks! We’ll follow up soon." : "AI Assistant"),
    [leadSubmitted],
  );

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const extractName = (message: string) => {
    const nameMatch =
      message.match(/name\s*[:\-]\s*([A-Za-z][A-Za-z\s'-]+)/i) ||
      message.match(/(?:i am|i'm)\s+([A-Za-z][A-Za-z\s'-]+)/i);
    return nameMatch ? nameMatch[1].trim() : "";
  };

  const extractCompany = (message: string) => {
    const companyMatch = message.match(/company\s*[:\-]\s*([A-Za-z0-9&\s.'-]+)/i);
    return companyMatch ? companyMatch[1].trim() : "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    const emailMatch = trimmed.match(emailRegex);
    const nextLead = {
      ...leadInfo,
      message: leadInfo.message || trimmed,
      email: leadInfo.email || (emailMatch ? emailMatch[0] : ""),
      name: leadInfo.name || extractName(trimmed),
      company: leadInfo.company || extractCompany(trimmed),
    };
    setLeadInfo(nextLead);

    try {
      const response = await sendChatMessage(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: response.reply,
        },
      ]);

      if (!nextLead.email && !leadPrompted) {
        setLeadPrompted(true);
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-assistant-followup`,
            role: "assistant",
            content: "If you’d like a follow-up, share your name and email anytime.",
          },
        ]);
      }

      if (nextLead.email && !leadSubmitted) {
        const name = nextLead.name || "Website Visitor";
        await createChatLead({
          name,
          email: nextLead.email,
          message: nextLead.message,
          company: nextLead.company || undefined,
        });
        setLeadSubmitted(true);
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-assistant-confirm`,
            role: "assistant",
            content: `Thanks! We’ll follow up at ${nextLead.email}.`,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant-error`,
          role: "assistant",
          content: "Sorry, I ran into an issue. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsSending(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-900">{chatTitle}</p>
              <p className="text-xs text-slate-500">Typically replies in seconds</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-96">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2 text-sm bg-slate-100 text-slate-500">
                  Typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSubmit} className="border-t border-slate-200 px-3 py-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={isSending}
                className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full bg-slate-900 text-white px-5 py-3 shadow-xl hover:bg-slate-800"
        aria-label="Toggle chat widget"
      >
        {isOpen ? "Close chat" : "Chat with us"}
      </button>
    </div>
  );
};

export default ChatWidget;
