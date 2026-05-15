#!/usr/bin/env bash

set -euo pipefail

PORT="${PORT:-5173}"

echo "Starting Story of the City on http://localhost:${PORT}"

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "${PORT}"
elif command -v python >/dev/null 2>&1; then
  python -m http.server "${PORT}"
elif command -v npx >/dev/null 2>&1; then
  npx --yes serve -l "${PORT}" .
else
  echo "Error: python/python3 or npx is required to run a local web server."
  exit 1
fi

# Ctrl+Shift+R (하드 리프레시)