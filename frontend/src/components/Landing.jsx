import "./Landing.css";

const features = [
  { icon: "📄", title: "Upload your documents", text: "PDFs, Word files, spreadsheets, text files and images." },
  { icon: "📋", title: "Instant summaries", text: "Get the key points of a long document in seconds." },
  { icon: "💬", title: "Ask questions", text: "Chat with your document and get answers about its content." },
  { icon: "🔐", title: "Your own account", text: "Sign up and log in. Your chat history stays with your account." },
];

const steps = [
  { n: "1", title: "Sign up", text: "Create a free account in a few seconds." },
  { n: "2", title: "Upload", text: "Choose a file from your computer." },
  { n: "3", title: "Summarize and ask", text: "Read the summary, then ask your questions." },
];

export default function Landing({ onLogin }) {
  return (
    <div className="lp">
      <nav className="lp-nav">
        <div className="lp-logo">📑 Smart Document Analyzer</div>
        <div className="lp-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </div>
        <div className="lp-actions">
          <button className="lp-btn" onClick={onLogin}>Login</button>
          <button className="lp-btn primary" onClick={onLogin}>Get started</button>
        </div>
      </nav>

      <header className="lp-hero">
        <div className="lp-hero-inner">
          <h1>Understand any document in seconds</h1>
          <p>Upload a file, get a clear summary, and ask questions about it. Powered by AI.</p>
          <button className="lp-btn primary big" onClick={onLogin}>Try it now</button>
        </div>
      </header>

      <section className="lp-section" id="features">
        <h2>What you can do</h2>
        <div className="lp-grid">
          {features.map((f) => (
            <div className="lp-card" key={f.title}>
              <div className="lp-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section" id="how">
        <h2>How it works</h2>
        <div className="lp-grid">
          {steps.map((s) => (
            <div className="lp-card" key={s.n}>
              <div className="lp-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="lp-footer">© 2026 Smart Document Analyzer</footer>
    </div>
  );
}