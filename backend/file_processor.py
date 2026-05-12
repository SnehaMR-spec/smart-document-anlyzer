import os
import io
import base64
import httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

GROQ_URL  = "https://api.groq.com/openai/v1/chat/completions"
GROQ_KEY  = lambda: os.getenv("GROQ_API_KEY")

# ---------- helpers ----------------------------------------------------------

def _groq_vision(image_bytes: bytes, media_type: str) -> str:
    """Send image to Groq vision model and get description + extracted text."""
    b64 = base64.b64encode(image_bytes).decode()
    payload = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{media_type};base64,{b64}"},
                    },
                    {
                        "type": "text",
                        "text": (
                            "Please do two things:\n"
                            "1. Extract ALL visible text from this image (OCR).\n"
                            "2. Describe what the image shows.\n\n"
                            "Format your response as:\n"
                            "EXTRACTED TEXT:\n<all text you can read>\n\n"
                            "IMAGE DESCRIPTION:\n<what is shown in the image>"
                        ),
                    },
                ],
            }
        ],
        "max_tokens": 2048,
    }
    headers = {"Authorization": f"Bearer {GROQ_KEY()}", "Content-Type": "application/json"}
    resp = httpx.post(GROQ_URL, headers=headers, json=payload, timeout=120)
    if resp.status_code != 200:
        raise RuntimeError(f"Groq vision error {resp.status_code}: {resp.text}")
    return resp.json()["choices"][0]["message"]["content"]


def _ocr_fallback(image_bytes: bytes) -> str:
    """Try Tesseract OCR as a fallback (no internet needed)."""
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(img)
    except Exception:
        return ""


# ---------- main entry -------------------------------------------------------

def process_document(file_path: str, file_bytes: bytes | None = None) -> dict:
    """
    Returns {"text": str, "image_description": str | None}
    image_description is set only for image files.
    """
    ext = Path(file_path).suffix.lower()
    raw = file_bytes or open(file_path, "rb").read()

    # ── PDF ──────────────────────────────────────────────────────────────────
    if ext == ".pdf":
        try:
            import pdfplumber
            parts = []
            with pdfplumber.open(io.BytesIO(raw)) as pdf:
                pages = pdf.pages[:50]
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        parts.append(t)
            return {"text": "\n".join(parts), "image_description": None}
        except ImportError:
            raise RuntimeError("Install pdfplumber: pip install pdfplumber")

    # ── DOCX ─────────────────────────────────────────────────────────────────
    elif ext == ".docx":
        try:
            from docx import Document
            doc = Document(io.BytesIO(raw))
            return {
                "text": "\n".join(p.text for p in doc.paragraphs if p.text.strip()),
                "image_description": None,
            }
        except ImportError:
            raise RuntimeError("Install python-docx: pip install python-docx")

    # ── TXT / MD ─────────────────────────────────────────────────────────────
    elif ext in (".txt", ".md"):
        return {"text": raw.decode("utf-8", errors="replace"), "image_description": None}

    # ── CSV ──────────────────────────────────────────────────────────────────
    elif ext == ".csv":
        try:
            import pandas as pd
            df = pd.read_csv(io.BytesIO(raw))
            return {"text": df.to_string(index=False), "image_description": None}
        except ImportError:
            raise RuntimeError("Install pandas: pip install pandas")

    # ── Excel ─────────────────────────────────────────────────────────────────
    elif ext in (".xlsx", ".xls"):
        try:
            import pandas as pd
            df = pd.read_excel(io.BytesIO(raw))
            return {"text": df.to_string(index=False), "image_description": None}
        except ImportError:
            raise RuntimeError("Install pandas + openpyxl: pip install pandas openpyxl")

    # ── Images ────────────────────────────────────────────────────────────────
    elif ext in (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif", ".tiff", ".tif"):
        mime_map = {
            ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
            ".png": "image/png",  ".webp": "image/webp",
            ".gif": "image/gif",  ".bmp": "image/bmp",
            ".tiff": "image/tiff", ".tif": "image/tiff",
        }
        media_type = mime_map.get(ext, "image/jpeg")

        # Try AI vision first
        try:
            vision_result = _groq_vision(raw, media_type)
            # Parse the two sections
            ocr_text = ""
            description = vision_result
            if "EXTRACTED TEXT:" in vision_result and "IMAGE DESCRIPTION:" in vision_result:
                parts = vision_result.split("IMAGE DESCRIPTION:")
                ocr_text    = parts[0].replace("EXTRACTED TEXT:", "").strip()
                description = parts[1].strip()
            combined_text = f"{ocr_text}\n\n[Image content: {description}]".strip()
            return {"text": combined_text, "image_description": description}
        except Exception:
            pass

        # Fallback: Tesseract OCR only
        ocr_text = _ocr_fallback(raw)
        return {
            "text": ocr_text or "[Could not extract text from image]",
            "image_description": "Image processed via OCR only (AI vision unavailable)",
        }

    else:
        raise ValueError(f"Unsupported file type: '{ext}'")