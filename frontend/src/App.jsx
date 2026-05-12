import { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import AuthPage from "./AuthPage";
import Upload from "./components/Upload";
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import SummaryCard from "./components/SummaryCard";
import DocumentPreview from "./components/DocumentPreview";
import HistoryPage from "./HistoryPage";

function AppInner() {
  const { user, token, logout, loading } = useAuth();
  const [session, setSession]     = useState(null);
  const [summary, setSummary]     = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [view, setView]           = useState("home"); // "home" | "history"
  const [isSummarizing, setIsSummarizing] = useState(false);

  if (loading) return null;
  if (!user)   return <AuthPage />;

  const handleUploadSuccess = (sessionData) => {
    setSession(sessionData);
    setSummary(sessionData.summary || null);
    setActiveTab("chat");
    setView("home");
  };

  const handleReset = () => {
    if (session) {
      fetch(`http://localhost:8000/session/${session.session_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setSession(null);
    setSummary(null);
    setActiveTab("chat");
  };

  const handleSummarize = async () => {
    if (!session || isSummarizing) return;
    setIsSummarizing(true);
    setActiveTab("summary");
    try {
      const res  = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ session_id: session.session_id }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch { setSummary("Failed to generate summary."); }
    finally { setIsSummarizing(false); }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* User info + nav */}
        <div className="user-bar">
          <div className="user-info">
            <div className="avatar">{user.name[0].toUpperCase()}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">↩</button>
        </div>

        <div className="nav-links">
          <button className={`nav-btn ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>
            📄 Analyzer
          </button>
          <button className={`nav-btn ${view === "history" ? "active" : ""}`} onClick={() => setView("history")}>
            🕒 History
          </button>
        </div>

        {view === "home" && (
          <Sidebar
            session={session}
            onReset={handleReset}
            onSummarize={handleSummarize}
            isSummarizing={isSummarizing}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </aside>

      <main className="main-content">
        {view === "history" ? (
          <HistoryPage onOpen={(doc) => { setView("home"); }} />
        ) : !session ? (
          <Upload onSuccess={handleUploadSuccess} />
        ) : (
          <div className="workspace">
            <DocumentPreview session={session} />
            <div className="panel">
              <div className="tab-bar">
                <button className={`tab-btn ${activeTab === "chat" ? "active" : ""}`} onClick={() => setActiveTab("chat")}>
                  💬 Chat
                </button>
                <button
                  className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
                  onClick={() => { setActiveTab("summary"); if (!summary) handleSummarize(); }}
                >
                  📋 Summary
                </button>
              </div>
              {activeTab === "chat" && <Chat session={session} />}
              {activeTab === "summary" && (
                <SummaryCard summary={summary} isSummarizing={isSummarizing} filename={session.filename} />
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans','Segoe UI',sans-serif; background:#0f1117; color:#e2e8f0; min-height:100vh; }
        .app-shell { display:flex; min-height:100vh; }
        .sidebar { width:260px; flex-shrink:0; background:#161b27; border-right:1px solid #1e2535; display:flex; flex-direction:column; }
        .user-bar { display:flex; align-items:center; justify-content:space-between; padding:16px; border-bottom:1px solid #1e2535; }
        .user-info { display:flex; align-items:center; gap:10px; overflow:hidden; }
        .avatar { width:32px; height:32px; border-radius:8px; background:#6ee7b720; border:1px solid #6ee7b740; color:#6ee7b7; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0; }
        .user-name { font-size:13px; font-weight:600; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .user-email { font-size:11px; color:#475569; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .logout-btn { background:none; border:none; color:#475569; cursor:pointer; font-size:16px; flex-shrink:0; }
        .logout-btn:hover { color:#fca5a5; }
        .nav-links { display:flex; flex-direction:column; gap:4px; padding:12px; border-bottom:1px solid #1e2535; }
        .nav-btn { background:transparent; border:none; color:#64748b; padding:8px 12px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:500; text-align:left; transition:all 0.2s; }
        .nav-btn:hover { background:#1e2535; color:#94a3b8; }
        .nav-btn.active { background:#0d2137; color:#6ee7b7; }
        .main-content { flex:1; overflow:hidden; display:flex; flex-direction:column; }
        .workspace { display:flex; flex-direction:column; height:100vh; overflow:hidden; }
        .panel { flex:1; display:flex; flex-direction:column; overflow:hidden; }
        .tab-bar { display:flex; gap:4px; padding:12px 20px 0; border-bottom:1px solid #1e2535; background:#0f1117; }
        .tab-btn { padding:8px 18px; border:none; background:transparent; color:#64748b; cursor:pointer; font-size:14px; font-weight:500; border-bottom:2px solid transparent; transition:all 0.2s; margin-bottom:-1px; }
        .tab-btn:hover { color:#94a3b8; }
        .tab-btn.active { color:#6ee7b7; border-bottom-color:#6ee7b7; }
      `}</style>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}