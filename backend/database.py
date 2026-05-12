from sqlalchemy import create_engine, Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import uuid

DATABASE_URL = "sqlite:///./smartdoc.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id       = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email    = Column(String, unique=True, nullable=False, index=True)
    name     = Column(String, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    documents  = relationship("Document", back_populates="user", cascade="all, delete")


class Document(Base):
    __tablename__ = "documents"
    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id     = Column(String, ForeignKey("users.id"), nullable=False)
    filename    = Column(String, nullable=False)
    doc_type    = Column(String)
    summary     = Column(Text)
    word_count  = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    user        = relationship("User", back_populates="documents")
    chats       = relationship("ChatMessage", back_populates="document", cascade="all, delete")


class ChatMessage(Base):
    __tablename__ = "chats"
    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    role        = Column(String, nullable=False)   # "user" | "assistant"
    content     = Column(Text, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)
    document    = relationship("Document", back_populates="chats")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)