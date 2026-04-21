#!/usr/bin/env bash
# Take full-page screenshots of live and local sites for visual comparison.
# Usage: scripts/shoot.sh <live|local> <page-slug> <width>
#   page-slug: "" (home), "about", "contact", "contact/thanks", "privacy-policy"
#   width: 1440 or 390
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TARGET="${1:?target required (live|local)}"
SLUG="${2-}"
WIDTH="${3:-1440}"

case "$TARGET" in
  live)  BASE="https://dispatch.care" ;;
  local) BASE="http://localhost:3000" ;;
  *) echo "Unknown target: $TARGET" >&2; exit 1 ;;
esac

if [[ -n "$SLUG" ]]; then
  URL="$BASE/$SLUG/"
  FILE_SLUG="${SLUG//\//_}"
else
  URL="$BASE/"
  FILE_SLUG="home"
fi

OUT_DIR="/tmp/dispatch-compare/$TARGET"
mkdir -p "$OUT_DIR"
OUT="$OUT_DIR/${FILE_SLUG}_${WIDTH}.png"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --no-sandbox \
  --force-device-scale-factor=1 \
  --window-size="${WIDTH},900" \
  --screenshot="$OUT" \
  --full-page-screenshot \
  --virtual-time-budget=8000 \
  "$URL" >/dev/null 2>&1

echo "$OUT"
