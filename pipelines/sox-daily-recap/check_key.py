import os
from dotenv import load_dotenv
from pathlib import Path
import requests

load_dotenv(Path(__file__).parent / ".env", override=True)
key = os.environ.get("ELEVENLABS_API_KEY", "")
print(f"Key preview: {key[:4]}...{key[-4:]}")

# Test auth
r = requests.get("https://api.elevenlabs.io/v1/user", headers={"xi-api-key": key})
print(f"Auth status: {r.status_code}")

# List available voices
r2 = requests.get("https://api.elevenlabs.io/v1/voices", headers={"xi-api-key": key})
print(f"Voices status: {r2.status_code}")
if r2.status_code == 200:
    voices = r2.json().get("voices", [])
    print(f"Available voices ({len(voices)} total):")
    for v in voices[:10]:
        print(f"  {v['voice_id']}  {v['name']}")

# Test TTS with first available voice
if r2.status_code == 200 and voices:
    test_voice = voices[0]["voice_id"]
    print(f"\nTesting TTS with voice: {test_voice} ({voices[0]['name']})")
    r3 = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{test_voice}",
        headers={"Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": key},
        json={"text": "Test.", "model_id": "eleven_turbo_v2_5"},
        timeout=30,
    )
    print(f"TTS status: {r3.status_code}")
    if r3.status_code == 200:
        print("TTS works! Voice ID to use:", test_voice)
    else:
        print("TTS error:", r3.text[:200])
