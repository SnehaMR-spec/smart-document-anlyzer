import { useState, useRef, useEffect } from "react";
 
export default function Chat({ session }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `I've analyzed **${session.filename}** (${session.word_count?.toLocaleString()} words). Ask me anything about this document!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef();
 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
 
  const send = async () => {
    const q = input.trim();
    if (!q || isLoading) return;
 
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setIsLoading(true);
 
    try {
      const token = JSON.parse(localStorage.getItem("auth"))?.token;

      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id: session.session_id, question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${e.message}`, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };
 
  const suggestions = [
    "What is this document about?",
    "List the key points",
    "What are the main conclusions?",
    "Are there any important dates or numbers?",
  ];
 
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role} ${msg.isError ? "error" : ""}`}>
            <div className="avatar">{msg.role === "assistant" ? "⬡" : "👤"}</div>
            <div className="bubble">
              {msg.text.split("\n").map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </div>
        ))}
 
        {isLoading && (
          <div className="message assistant">
            <div className="avatar">⬡</div>
            <div className="bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
 
        {messages.length === 1 && (
          <div className="suggestions">
            {suggestions.map((s) => (
              <button key={s} className="suggestion-btn" onClick={() => { setInput(s); }}>
                {s}
              </button>
            ))}
          </div>
        )}
 
        <div ref={bottomRef} />
      </div>
 
      <div className="input-bar">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask something about the document..."
          disabled={isLoading}
        />
        <button onClick={send} disabled={isLoading || !input.trim()} className="send-btn">
          {isLoading ? "..." : "Send"}
        </button>
      </div>
 
      <style>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          background: #0f1117;
        }
 
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
 
        .message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          animation: fadeUp 0.3s ease;
        }
 
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
 
        .message.user { flex-direction: row-reverse; }
 
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          background: #161b27;
          border: 1px solid #1e2535;
        }
 
        .bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.6;
          background: #161b27;
          border: 1px solid #1e2535;
          color: #cbd5e1;
        }
 
        .bubble p + p { margin-top: 6px; }
 
        .message.user .bubble {
          background: #0d2137;
          border-color: #1e3a5f;
          color: #e2e8f0;
        }
 
        .message.error .bubble {
          background: #2d1515;
          border-color: #7f1d1d;
          color: #fca5a5;
        }
 
        .typing {
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 16px;
        }
 
        .typing span {
          width: 7px;
          height: 7px;
          background: #6ee7b7;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
 
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
 
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
 
        .suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px 0 0 44px;
        }
 
        .suggestion-btn {
          text-align: left;
          background: #161b27;
          border: 1px solid #1e2535;
          color: #64748b;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
 
        .suggestion-btn:hover {
          border-color: #6ee7b750;
          color: #94a3b8;
        }
 
        .input-bar {
          display: flex;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid #1e2535;
          background: #0f1117;
        }
 
        .input-bar input {
          flex: 1;
          background: #161b27;
          border: 1px solid #1e2535;
          color: #e2e8f0;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
 
        .input-bar input:focus { border-color: #6ee7b750; }
        .input-bar input::placeholder { color: #475569; }
 
        .send-btn {
          background: #6ee7b7;
          color: #0f1117;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
 
        .send-btn:hover:not(:disabled) { background: #34d399; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}