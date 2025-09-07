import requests
import os
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")  # Hugging Face token
HF_MODEL = "facebook/bart-large-cnn"  # You can also try "google/pegasus-xsum" or "t5-base"


def call_hf_api(text: str, max_words: int = 150) -> str:
    """Helper to call Hugging Face API for summarization."""
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": text[:1000],  # avoid API overflow
        "parameters": {
            "max_length": max_words,
            "min_length": 50,
            "do_sample": False
        }
    }
    try:
        response = requests.post(
            f"https://api-inference.huggingface.co/models/{HF_MODEL}",
            headers=headers,
            json=payload,
            timeout=60
        )
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and "summary_text" in data[0]:
                return data[0]["summary_text"]
            return "⚠️ No summary returned."
        else:
            return f"⚠️ Hugging Face error {response.status_code}: {response.text}"
    except Exception as e:
        return f"[Summary error: {e}]"


def chunk_text(text: str, chunk_size: int = 800) -> list:
    """Split long text into chunks of ~chunk_size words."""
    words = text.split()
    return [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]


def summarize_text(text: str, max_words: int = 1500) -> str:
    """Summarize long text by chunking + merging."""
    if not text.strip():
        return "No content to summarize."

    chunks = chunk_text(text)
    partial_summaries = []

    for chunk in chunks:
        partial = call_hf_api(chunk, max_words=max_words // 2)
        partial_summaries.append(partial)

    # Combine partial summaries into one final summary
    combined_text = " ".join(partial_summaries)
    final_summary = call_hf_api(combined_text, max_words=max_words)

    return final_summary
