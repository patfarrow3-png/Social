#!/usr/bin/env bash
# Sox Daily Recap — one-time setup for Chromebook Linux (Crostini/Debian)
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       Sox Daily Recap — Setup            ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. System dependencies ────────────────────────────────────────────────────
echo "→ Installing system packages (ffmpeg, python3, pip)…"
sudo apt-get update -qq
sudo apt-get install -y -qq ffmpeg python3 python3-pip python3-venv
echo "  ✓ system packages ready"

# ── 2. Python virtual environment ─────────────────────────────────────────────
echo "→ Creating Python virtual environment…"
python3 -m venv .venv
# shellcheck source=/dev/null
source .venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo "  ✓ Python environment ready"

# ── 3. Output folder ──────────────────────────────────────────────────────────
echo "→ Creating output folder…"
mkdir -p "$HOME/Desktop/Sox Daily Recap"
echo "  ✓ ~/Desktop/Sox Daily Recap created"

# ── 4. .env file ──────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "  ⚠  .env file created from template."
    echo "     Open it now and fill in your API keys before running the pipeline:"
    echo "     nano $SCRIPT_DIR/.env"
    echo ""
else
    echo "  ✓ .env already exists"
fi

# ── 5. Cron job ───────────────────────────────────────────────────────────────
echo ""
echo "→ Setting up 7am daily cron job…"

CRON_CMD="0 7 * * * cd $SCRIPT_DIR && $SCRIPT_DIR/.venv/bin/python $SCRIPT_DIR/pipeline.py >> \"$HOME/Desktop/Sox Daily Recap/pipeline.log\" 2>&1"

# Add only if not already present
if crontab -l 2>/dev/null | grep -qF "pipeline.py"; then
    echo "  ✓ Cron job already installed (skipping)"
else
    # Append to existing crontab (or create new one)
    (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
    echo "  ✓ Cron job installed"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║              Setup complete!             ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Fill in your API keys:"
echo "     nano $SCRIPT_DIR/.env"
echo ""
echo "  2. Test it manually:"
echo "     cd $SCRIPT_DIR"
echo "     source .venv/bin/activate"
echo "     python pipeline.py"
echo ""
echo "  3. The cron job will run automatically at 7:00 AM every day."
echo ""
echo "  ⚠  IMPORTANT — Chromebook note:"
echo "     Cron only fires while the Linux container is running."
echo "     To keep it active: Settings → Linux → 'Start on login'."
echo "     Or just open the Terminal app before 7am."
echo ""
echo "  Episodes are saved to:  ~/Desktop/Sox Daily Recap/"
echo "  (Accessible in Files app → Linux files → Desktop → Sox Daily Recap)"
echo ""
