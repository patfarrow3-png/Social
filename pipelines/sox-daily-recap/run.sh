#!/usr/bin/env bash
# Run the Sox Daily Recap pipeline manually.
# Usage:
#   ./run.sh              # recap yesterday's game
#   ./run.sh 2025-04-01   # recap a specific date
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Run setup.sh first."
    exit 1
fi

# shellcheck source=/dev/null
source .venv/bin/activate
exec python pipeline.py "$@"
