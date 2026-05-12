from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime
import os

from database import get_db, init_db, User, Document, ChatMessage
from auth import hash_password, verify_password, create_token, get_current_user
from file_processor import process_document
from document_classifier import classify_document
from summarizer import generate_summary, ask_question
import asyncio
from concurrent.futures import ThreadPoolExecutor


# ── app setup ──────────────────────────────────────────────────────────────
app = FastAPI(title="Smart Doc Analyzer", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
executor = ThreadPoolExecutor()
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory store for active session texts (not persisted, just for live Q&A)
active_sessions: dict = {}   # session_id -> {text, image_description}


@app.on_event("startup")
def startup():
    init_db()


# ── schemas ────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChatRequest(BaseModel):
    session_id: str
    question: str

class SummarizeRequest(BaseModel):
    session_id: str


# ── auth routes ────────────────────────────────────────────────────────────

@app.post("/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=req.name, email=req.email, password=hash_password(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": create_token(user.id), "user": {"id": user.id, "name": user.name, "email": user.email}}


@app.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(401, "Invalid email or password")
    return {"token": create_token(user.id), "user": {"id": user.id, "name": user.name, "email": user.email}}


@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}


# ── document routes ────────────────────────────────────────────────────────

@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    raw = await file.read()
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(executor, process_document, file.filename, raw)
    if not raw:
        raise HTTPException(422, "Uploaded file is empty.")

    result = process_document(file.filename or "upload", raw)
    text              = result["text"]
    image_description = result["image_description"]

    if not text.strip():
        raise HTTPException(422, "Could not extract text from this file.")

    doc_type = classify_document(text)
    summary  = generate_summary(text, image_description)

    # Save to DB
    doc = Document(
        user_id    = current_user.id,
        filename   = file.filename,
        doc_type   = doc_type,
        summary    = summary,
        word_count = str(len(text.split())),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Store in memory for live chat
    active_sessions[doc.id] = {"text": text, "image_description": image_description}

    return {
        "session_id":   doc.id,
        "filename":     file.filename,
        "document_type": doc_type,
        "word_count":   len(text.split()),
        "summary":      summary,
        "image_description": image_description,
    }


@app.post("/summarize")
def summarize(req: SummarizeRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == req.session_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(404, "Document not found.")
    return {"summary": doc.summary}


@app.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == req.session_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(404, "Document not found.")

    session = active_sessions.get(req.session_id)
    if not session:
        raise HTTPException(400, "Session expired. Please re-upload the document.")

    answer = ask_question(session["text"], req.question, session.get("image_description"))

    # Save chat history
    db.add(ChatMessage(document_id=doc.id, role="user",      content=req.question))
    db.add(ChatMessage(document_id=doc.id, role="assistant", content=answer))
    db.commit()

    return {"answer": answer}


# ── history routes ─────────────────────────────────────────────────────────

@app.get("/history")
def history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )
    return [
        {
            "id":          d.id,
            "filename":    d.filename,
            "doc_type":    d.doc_type,
            "summary":     d.summary,
            "word_count":  d.word_count,
            "uploaded_at": d.uploaded_at.isoformat(),
        }
        for d in docs
    ]


@app.get("/history/{doc_id}/chat")
def chat_history(doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(404, "Document not found.")
    messages = db.query(ChatMessage).filter(ChatMessage.document_id == doc_id).order_by(ChatMessage.created_at).all()
    return [{"role": m.role, "content": m.content, "time": m.created_at.isoformat()} for m in messages]


@app.delete("/history/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(404, "Document not found.")
    db.delete(doc)
    db.commit()
    active_sessions.pop(doc_id, None)
    return {"message": "Deleted"}


@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    active_sessions.pop(session_id, None)
    return {"message": "Session cleared"}


@app.get("/")
def root():
    return {"status": "Smart Doc Analyzer API running"}