from pipeline import parse_script, build_audio, OUTPUT_DIR

mock_script = """
HENRY: Dude, we lost to Houston AGAIN. I cannot deal.
DAD: It's April. Calm down.
HENRY: Dad it's literally game two of the season!
DAD: 2004. We were ten games back in August. Sit down.
HENRY: You always say that.
DAD: Because it always applies.
HENRY: Go Sox. See you tomorrow!
"""

lines = parse_script(mock_script)
print(f"Script parsed: {len(lines)} lines")
print("Generating voices via ElevenLabs...")
audio = build_audio(lines)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
out = OUTPUT_DIR / "sox-recap-TEST.mp3"
audio.export(str(out), format="mp3", bitrate="128k")
print(f"Saved to: {out}")
