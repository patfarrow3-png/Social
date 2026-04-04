"""
Free end-to-end test — uses pyttsx3 (offline TTS) instead of ElevenLabs.
Verifies: MLB data fetch → Claude script → audio stitching → MP3 saved.
Run: python3 test_free.py
"""
import os
import sys
import tempfile
import subprocess
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env", override=True)

# ── Step 1: MLB data ──────────────────────────────────────────────────────────
print("Step 1/3  Fetching Red Sox game data...")
from pipeline import fetch_game, generate_script, parse_script, OUTPUT_DIR
from datetime import datetime, timedelta

date_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
game = fetch_game(date_str)
if game and game.get("state") == "Final":
    print(f"         {game['result']} vs {game['opponent']}  {game['sox_score']}–{game['opp_score']}")
elif game is None:
    print("         Off day.")
else:
    print(f"         Game state: {game.get('state')}")

# ── Step 2: Claude script ─────────────────────────────────────────────────────
print("Step 2/3  Generating script with Claude...")
script = generate_script(game, date_str)
lines  = parse_script(script)
print(f"         {len(lines)} dialogue lines generated.")
print()
for spk, text in lines:
    print(f"  {spk.upper():5s}: {text}")
print()

# ── Step 3: Free TTS with espeak ──────────────────────────────────────────────
print("Step 3/3  Synthesising audio with espeak (free offline TTS)...")

# Install espeak if needed
result = subprocess.run(["which", "espeak"], capture_output=True)
if result.returncode != 0:
    print("         Installing espeak...")
    subprocess.run(["sudo", "apt-get", "install", "-y", "-qq", "espeak"], check=True)

from pydub import AudioSegment

episode   = AudioSegment.empty()
gap       = AudioSegment.silent(duration=500)
tmp_paths = []

try:
    for i, (spk, text) in enumerate(lines, 1):
        # espeak voices: en+m1 (male) for Henry, en+m3 (deeper male) for Dad
        voice  = "en+m1" if spk == "henry" else "en+m3"
        speed  = "180"   if spk == "henry" else "140"
        pitch  = "60"    if spk == "henry" else "30"

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            tmp_path = f.name
            tmp_paths.append(tmp_path)

        subprocess.run(
            ["espeak", "-v", voice, "-s", speed, "-p", pitch, "-w", tmp_path, text],
            check=True, capture_output=True
        )
        seg      = AudioSegment.from_wav(tmp_path)
        episode += seg + gap
        print(f"         [{i}/{len(lines)}] {spk.upper()} done")
finally:
    for p in tmp_paths:
        try: os.unlink(p)
        except: pass

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
out = OUTPUT_DIR / f"sox-recap-{date_str}-TEST.mp3"
episode.export(str(out), format="mp3", bitrate="128k")
print()
print(f"✓ Episode saved → {out}")
print()
print("Full pipeline works! Ready to use ElevenLabs voices once credits are available.")
