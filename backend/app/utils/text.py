import base64

def decode_base64_readme(encoded_content: str, max_chars: int = 3000) -> str:
    try:
        decoded = base64.b64decode(encoded_content).decode("utf-8")
        if len(decoded) > max_chars:
            return decoded[:max_chars] + "..."
        return decoded
    except Exception:
        return ""
