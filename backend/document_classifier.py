def classify_document(text: str) -> str:
    t = text.lower()
    rules = [
        ("Legal Document",  ["agreement", "terms and conditions", "whereas", "hereinafter"]),
        ("Invoice",         ["invoice", "bill to", "amount due", "payment due"]),
        ("Resume",          ["education", "experience", "skills", "curriculum vitae"]),
        ("Medical Report",  ["patient", "diagnosis", "prescription", "symptoms"]),
        ("Bank Statement",  ["bank", "account number", "transaction", "balance"]),
        ("Research Paper",  ["abstract", "methodology", "references", "conclusion"]),
        ("Image Document",  ["image content", "image description", "extracted text"]),
    ]
    for doc_type, keywords in rules:
        if any(kw in t for kw in keywords):
            return doc_type
    return "General Document"