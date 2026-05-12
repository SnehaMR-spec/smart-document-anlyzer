export default function SummaryCard({ summary, isSummarizing, filename }) {
  const copyToClipboard = () => {
    if (summary) navigator.clipboard.writeText(summary);
  };
 
  // Render markdown-ish bold (**text**) simply
  const renderLine = (line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className={line.startsWith("**") ? "section-header" : "section-body"}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    );
  };
 
  return (
    <div className="summary-container">
      <div className="summary-header">
        <div>
          <h2>Document Summary</h2>
          {filename && <p className="summary-filename">{filename}</p>}
        </div>
        {summary && (
          <button className="copy-btn" onClick={copyToClipboard} title="Copy summary">
            📋 Copy
          </button>
        )}
      </div>
 
      <div className="summary-body">
        {isSummarizing && (
          <div className="loading-state">
            <div className="pulse-ring" />
            <p>Generating summary with Gemini...</p>
          </div>
        )}
 
        {!isSummarizing && summary && (
          <div className="summary-content">
            {summary.split("\n").filter(Boolean).map((line, i) => renderLine(line, i))}
          </div>
        )}
 
        {!isSummarizing && !summary && (
          <div className="empty-summary">
            <p>📋</p>
            <p>Click "Summary" to generate an AI-powered summary of this document.</p>
          </div>
        )}
      </div>
 
      <style>{`
        .summary-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          background: #0f1117;
        }
 
        .summary-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #1e2535;
        }
 
        .summary-header h2 {
          font-size: 16px;
          font-weight: 600;
          color: #f1f5f9;
        }
 
        .summary-filename {
          font-size: 12px;
          color: #475569;
          margin-top: 4px;
        }
 
        .copy-btn {
          background: #161b27;
          border: 1px solid #1e2535;
          color: #64748b;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
 
        .copy-btn:hover {
          border-color: #6ee7b750;
          color: #6ee7b7;
        }
 
        .summary-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
 
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          height: 200px;
          color: #475569;
          font-size: 14px;
        }
 
        .pulse-ring {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid #1e2535;
          border-top-color: #6ee7b7;
          animation: spin 1s linear infinite;
        }
 
        @keyframes spin { to { transform: rotate(360deg); } }
 
        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: fadeIn 0.4s ease;
        }
 
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
 
        .section-header {
          font-size: 14px;
          color: #e2e8f0;
          margin-top: 16px;
        }
 
        .section-header:first-child { margin-top: 0; }
 
        .section-header strong {
          color: #6ee7b7;
          font-weight: 600;
        }
 
        .section-body {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.7;
          padding-left: 12px;
          border-left: 2px solid #1e2535;
        }
 
        .empty-summary {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 200px;
          color: #374151;
          font-size: 14px;
          text-align: center;
        }
 
        .empty-summary p:first-child { font-size: 36px; }
      `}</style>
    </div>
  );
}

