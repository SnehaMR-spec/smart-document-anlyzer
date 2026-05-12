import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL    = "llama-3.1-8b-instant"


def _call_groq(prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not set in .env")
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1024,
    }
    resp = httpx.post(GROQ_URL, headers=headers, json=payload, timeout=120)
    if resp.status_code != 200:
        raise RuntimeError(f"Groq API error {resp.status_code}: {resp.text}")
    return resp.json()["choices"][0]["message"]["content"]


def generate_summary(text: str, image_description: str | None = None) -> str:
    context = text[:6000]
    if image_description:
        context += f"\n\n[Image description: {image_description}]"
    return _call_groq(
        f"Summarize the following document in clear bullet points. Be concise.\n\n{context}"
    )


def ask_question(document_text: str, question: str, image_description: str | None = None) -> str:
    context = document_text[:6000]
    if image_description:
        context += f"\n\n[Image description: {image_description}]"
    return _call_groq(
        f"Answer the question using only the document below. "
        f"If the answer isn't there, say so.\n\nDocument:\n{context}\n\nQuestion: {question}\n\nAnswer:"
    )