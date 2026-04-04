import os
from dotenv import load_dotenv
from pathlib import Path
import requests

load_dotenv(Path(__file__).parent / ".env")
key = os.environ.get("ELEVENLABS_API_KEY", "")
print(f"Key length: {len(key)}")
print(f"Key preview: {key[:4]}...{key[-4:]}")

r = requests.get(
    "https://api.elevenlabs.io/v1/user",
    headers={"xi-api-key": key}
)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:300]}")
