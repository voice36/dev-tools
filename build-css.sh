#!/usr/bin/env bash
# Rebuild the compiled Tailwind CSS after editing HTML classes.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p assets
npx --yes tailwindcss@3.4.17 -c tailwind.config.js -i src/input.css -o assets/tailwind.css --minify
echo "built assets/tailwind.css ($(wc -c < assets/tailwind.css) bytes)"
