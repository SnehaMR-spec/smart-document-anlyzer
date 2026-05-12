import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const API = "http://localhost:8000";

export default function HistoryPage({ onOpen }) {
  const { token } = useAuth();
  const [docs,    setDocs]    = useState([]);
  const [chats,   setChats]   = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/history`, { headers: authHeaders })
      .then(r => r.json())
      .then(setDocs)
      .finally(() => setLoading(false));
  }, []);

  const loadChats = async (doc) => {
    setSelected(doc);
    setChats(null);
    const res = await fetch(`${API}/history/${doc.id}/chat`, { headers: authHeaders });
    const data = await res.json();
    setChats(data);
  };

  const deleteDoc = async (id, e) => {
    e.stopPropagation();
    await fetch(`${API}/history/${id}`, { method: "DELETE", headers: authHeaders });
    setDocs(prev => prev.filter(d => d.id !== id));
    if (selected?.id === id) { setSelected(null); setChats(null); }
  };

  return (
    <div className="history-page">
      <div className="history-list">
        <h2>📂 Your Documents</h2>
        {loading && <p className="muted">Loading…</p>}
        {!loading && docs.length === 0 && <p className="muted">No documents yet.</p>}
        {docs.map(doc => (
          <div
            key={doc.id}
            className={`doc-card ${selected?.id === doc.id ? "active" : ""}`}
            onClick={() => loadChats(doc)}
          >
            <div className="doc-header">
              <span className="doc-name">{doc.filename}</span>
              <button className="del-btn" onClick={e => deleteDoc(doc.id, e)}>🗑</button>
            </div>
            <div className="doc-meta">
              <span className="badge">{doc.doc_type}</span>
              <span className="muted">{doc.word_count} words</span>
              <span className="muted">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
            </div>
            {doc.summary && (
              <p className="doc-summary">{doc.summary.slice(0, 120)}…</p>
            )}
            {onOpen && (
              <button className="reopen-btn" onClick={e => { e.stopPropagation(); onOpen(doc); }}>
                ↩ Reopen
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="chat-panel">
        {!selected && <p className="muted center">Select a document to view its chat history.</p>}
        {selected && (
          <>
            <h2>💬 Chat history — {selected.filename}</h2>
            {!chats && <p className="muted">Loading…</p>}
            {chats && chats.length === 0 && <p className="muted">No chat history for this document.</p>}
            {chats && chats.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="msg-role">{m.role === "user" ? "👤 You" : "⬡ AI"}</div>
                <div className="msg-content">{m.content}</div>
                <div className="msg-time">{new Date(m.time).toLocaleTimeString()}</div>
              </div>
            ))}
          </>
        )}
      </div>

      <style>{`
        .history-page {
          display: flex;
          height: 100%;
          overflow: hidden;
          background: #0f1117;
          color: #e2e8f0;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }
        .history-list {
          width: 340px;
          flex-shrink: 0;
          border-right: 1px solid #1e2535;
          padding: 20px;
          overflow-y: auto;
        }
        h2 { font-size: 16px; font-weight: 600; color: #94a3b8; margin-bottom: 16px; }
        .doc-card {
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .doc-card:hover, .doc-card.active { border-color: #6ee7b750; background: #0d1f1a; }
        .doc-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .doc-name { font-size: 13px; font-weight: 600; color: #e2e8f0; word-break: break-all; flex: 1; }
        .del-btn { background: none; border: none; cursor: pointer; font-size: 14px; opacity: 0.5; }
        .del-btn:hover { opacity: 1; }
        .doc-meta { display: flex; gap: 8px; align-items: center; margin: 6px 0; flex-wrap: wrap; }
        .badge {
          background: #0d2137;
          border: 1px solid #1e3a5f;
          color: #6ee7b7;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 11px;
        }
        .muted { color: #475569; font-size: 12px; }
        .doc-summary { font-size: 12px; color: #64748b; margin-top: 6px; line-height: 1.5; }
        .reopen-btn {
          margin-top: 8px;
          background: #1e2535;
          border: none;
          color: #6ee7b7;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        .chat-panel { flex: 1; padding: 20px; overflow-y: auto; }
        .center { text-align: center; margin-top: 40px; }
        .msg { margin-bottom: 16px; }
        .msg-role { font-size: 12px; font-weight: 600; color: #6ee7b7; margin-bottom: 4px; }
        .msg.user .msg-role { color: #94a3b8; }
        .msg-content {
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .msg-time { font-size: 11px; color: #334155; margin-top: 4px; }
      `}</style>
    </div>
  );
}