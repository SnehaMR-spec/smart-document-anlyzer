export default function Sidebar({ session, onReset, onSummarize, isSummarizing, activeTab, setActiveTab }) {
  return (
    <div className="sidebar-inner">
      <div className="brand">
        <span className="brand-icon">⬡</span>
        <span className="brand-name">DocAnalyzer</span>
      </div>
 
      {session ? (
        <div className="session-info">
          <div className="doc-card">
            <div className="doc-icon">📄</div>
            <div className="doc-meta">
              <p className="doc-name" title={session.filename}>{session.filename}</p>
              <p className="doc-stats">{session.word_count?.toLocaleString()} words</p>
            </div>
          </div>
 
          <nav className="nav">
            <button
              className={`nav-item ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              💬 <span>Chat</span>
            </button>
            <button
              className={`nav-item ${activeTab === "summary" ? "active" : ""}`}
              onClick={() => { setActiveTab("summary"); onSummarize(); }}
              disabled={isSummarizing}
            >
              {isSummarizing ? "⏳" : "📋"} <span>{isSummarizing ? "Summarizing..." : "Summary"}</span>
            </button>
          </nav>
 
          <div className="sidebar-footer">
            <button className="reset-btn" onClick={onReset}>
              ↩ Upload new document
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>No document loaded</p>
          <p>Upload a file to get started</p>
        </div>
      )}
 
      <style>{`
        .sidebar-inner {
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 20px 16px;
        }
 
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 20px;
          border-bottom: 1px solid #1e2535;
          margin-bottom: 20px;
        }
 
        .brand-icon {
          font-size: 24px;
          color: #6ee7b7;
          filter: drop-shadow(0 0 8px #6ee7b740);
        }
 
        .brand-name {
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.3px;
        }
 
        .session-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
 
        .doc-card {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          background: #111827;
          border: 1px solid #1e2535;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 20px;
        }
 
        .doc-icon { font-size: 24px; flex-shrink: 0; }
 
        .doc-meta { min-width: 0; }
 
        .doc-name {
          font-size: 13px;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
 
        .doc-stats {
          font-size: 12px;
          color: #475569;
          margin-top: 2px;
        }
 
        .nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
 
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }
 
        .nav-item:hover:not(:disabled) {
          background: #161b27;
          color: #94a3b8;
        }
 
        .nav-item.active {
          background: #0d2137;
          color: #6ee7b7;
        }
 
        .nav-item:disabled { opacity: 0.5; cursor: not-allowed; }
 
        .sidebar-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #1e2535;
        }
 
        .reset-btn {
          width: 100%;
          padding: 9px 14px;
          background: transparent;
          border: 1px solid #1e2535;
          color: #64748b;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
 
        .reset-btn:hover {
          border-color: #ef4444;
          color: #f87171;
          background: #1a0f0f;
        }
 
        .empty-state {
          color: #374151;
          font-size: 13px;
          line-height: 1.8;
        }
      `}</style>
    </div>
  );
}
 