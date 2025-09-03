"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { SidebarDesktop } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import ChatMessage from "@/components/chat/chat-message";
import ChatHeader from "@/components/chat/chat-header";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m0",
      role: "assistant",
      content: "Halo! Aku siap bantu resep, belanja, dan ide makanan dari isi kulkasmu",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, isSending]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      await new Promise((r) => setTimeout(r, 600));
      const aiText =
        "Ini ide cepat: tumis sayur sisa + telur orak-arik, tambah kecap & bawang putih. Mau resep lengkap?";

      const aiMsg: Msg = { id: crypto.randomUUID(), role: "assistant", content: aiText };
      setMessages((m) => [...m, aiMsg]);
    } catch (err) {
      console.log(err);
      const errMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Maaf, terjadi masalah saat menghubungi server. Coba lagi ya.",
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex">
      {/* Desktop sidebar */}
      <SidebarDesktop />

      {/* Main */}
      <main className="flex-1 min-h-screen bg-gray-50">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="px-4 md:px-6">
            <ChatHeader
              title="resep.ai chat"
              subtitle="Diskusi resep, ide masak, & belanja"
              Icon={Sparkles}
            />
          </div>
        </div>

        {/* Chat body */}
        <div className="px-2 md:px-6 pt-3 pb-28"> {/* pb-28 for mobile navbar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              {/* Messages area */}
              <div className="h-[calc(100vh-260px)] md:h-[calc(100vh-220px)] overflow-y-auto p-4 md:p-6">
                {messages.map((m) => (
                  <ChatMessage key={m.id} role={m.role} content={m.content} />
                ))}

                {isSending && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="size-2 rounded-full bg-gray-300 animate-bounce" />
                    <div className="size-2 rounded-full bg-gray-300 animate-bounce [animation-delay:120ms]" />
                    <div className="size-2 rounded-full bg-gray-300 animate-bounce [animation-delay:240ms]" />
                    <span className="ml-2">Mengetik…</span>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="border-t border-gray-200 p-3 md:p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tanya ide masak, bahan pengganti, atau rencana belanja…"
                    rows={1}
                    className="flex-1 resize-none rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder:text-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !input.trim()}
                    className="bg-[#5EB1FF] text-white px-3 md:px-4 py-2 rounded-md font-medium hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 ring-1"
                    title="Kirim"
                  >
                    <Send size={16} />
                    <span className="hidden sm:inline">Kirim</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile bottom navbar */}
        <div className="md:hidden">
          <Navbar />
        </div>
      </main>
    </div>
  );
}
