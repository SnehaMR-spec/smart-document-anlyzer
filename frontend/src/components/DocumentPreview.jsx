export default function DocumentPreview({ session }) {
  const ext = session.filename?.split(".").pop()?.toLowerCase();
 
  const iconMap = {
    pdf: "📕",
    docx: "📘",
    doc: "📘",
    png: "🖼️",
    jpg: "🖼️",
    jpeg: "🖼️",
    tiff: "🖼️",
    bmp: "🖼️",
  };
 
  const icon = iconMap[ext] || "📄";
 
  return (
    <div className="doc-preview-bar">
      <span className="doc-preview-icon">{icon}</span>
      <div className="doc-preview-info">
        <span className="doc-preview-name">{session.filename}</span>
        <span className="doc-preview-meta">
          {session.word_count?.toLocaleString()} words · {session.char_count?.toLocaleString()} characters
        </span>
      </div>
      <span className="doc-preview-badge">Indexed ✓</span>
 
      <style>{`
        .doc-preview-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: #111827;
          border-bottom: 1px solid #1e2535;
          flex-shrink: 0;
        }
 
        .doc-preview-icon { font-size: 20px; }
 
        .doc-preview-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }
 
        .doc-preview-name {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
 
        .doc-preview-meta {
          font-size: 12px;
          color: #475569;
        }
 
        .doc-preview-badge {
          background: #0d2a1a;
          border: 1px solid #166534;
          color: #6ee7b7;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}