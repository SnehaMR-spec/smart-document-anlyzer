import { useState, useRef } from "react";
 
export default function Upload({ onSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();
 
  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setIsUploading(true);
 
    const formData = new FormData();
    formData.append("file", file);
 
    try {
      const token = JSON.parse(localStorage.getItem("auth"))?.token;

      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });     const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      onSuccess(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsUploading(false);
    }
  };
 
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };
 
  return (
    <div className="upload-page">
      <div className="upload-hero">
        <div className="logo-mark">⬡</div>
        <h1>Smart Doc Analyzer</h1>
        <p className="subtitle">Upload a document to start analyzing, chatting, and summarizing</p>
 
        <div
          className={`drop-zone ${isDragging ? "dragging" : ""} ${isUploading ? "uploading" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isUploading && inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg,.tiff,.bmp"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {isUploading ? (
            <div className="upload-state">
              <div className="spinner" />
              <p>Processing document...</p>
            </div>
          ) : (
            <div className="upload-state">
              <div className="upload-icon">📄</div>
              <p className="drop-title">{isDragging ? "Drop it!" : "Drag & drop or click to upload"}</p>
              <p className="drop-hint">PDF · DOCX · PNG · JPG · TIFF</p>
            </div>
          )}
        </div>
 
        {error && <div className="error-msg">⚠️ {error}</div>}
 
        <div className="features">
          {[
            { icon: "🔍", label: "RAG-powered Q&A" },
            { icon: "📋", label: "Auto summarization" },
            { icon: "👁️", label: "OCR for scanned docs" },
            { icon: "⚡", label: "Gemini 1.5 Flash" },
          ].map((f) => (
            <div className="feature-chip" key={f.label}>
              {f.icon} {f.label}
            </div>
          ))}
        </div>
      </div>
 
      <style>{`
        .upload-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 40px 20px;
          background: radial-gradient(ellipse at 50% 0%, #0d2137 0%, #0f1117 60%);
        }
 
        .upload-hero {
          max-width: 560px;
          width: 100%;
          text-align: center;
        }
 
        .logo-mark {
          font-size: 48px;
          color: #6ee7b7;
          line-height: 1;
          margin-bottom: 16px;
          filter: drop-shadow(0 0 20px #6ee7b740);
        }
 
        h1 {
          font-size: 36px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.5px;
          margin-bottom: 10px;
        }
 
        .subtitle {
          color: #64748b;
          font-size: 15px;
          margin-bottom: 36px;
        }
 
        .drop-zone {
          border: 2px dashed #1e2d45;
          border-radius: 16px;
          padding: 52px 32px;
          cursor: pointer;
          transition: all 0.25s;
          background: #111827;
          margin-bottom: 24px;
        }
 
        .drop-zone:hover, .drop-zone.dragging {
          border-color: #6ee7b7;
          background: #0d1f1a;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px #6ee7b715;
        }
 
        .drop-zone.uploading {
          pointer-events: none;
          opacity: 0.8;
        }
 
        .upload-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
 
        .upload-icon { font-size: 40px; }
 
        .drop-title {
          font-size: 16px;
          font-weight: 600;
          color: #cbd5e1;
        }
 
        .drop-hint {
          font-size: 13px;
          color: #475569;
        }
 
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #1e2535;
          border-top-color: #6ee7b7;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
 
        @keyframes spin { to { transform: rotate(360deg); } }
 
        .error-msg {
          background: #2d1515;
          border: 1px solid #7f1d1d;
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 24px;
        }
 
        .features {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
 
        .feature-chip {
          background: #161b27;
          border: 1px solid #1e2535;
          color: #94a3b8;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}