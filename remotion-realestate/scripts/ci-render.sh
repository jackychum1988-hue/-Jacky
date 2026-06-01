#!/bin/bash
# CI render script — called from GitHub Actions workflow
# Compacts timeline JSON and renders via Remotion CLI
set -e

cd "$(dirname "$0")/.."

# Compact JSON to single line for --props argument
PROPS=$(python -c '
import json
with open("../zs-ranking-agent/output/timeline-latest.json") as f:
    data = json.load(f)
print(json.dumps(data, separators=(",", ":")))
')

OUTPUT="out/zhongshan-ranking-$(date +%Y-%m-%d).mov"

echo "Rendering to $OUTPUT..."
npx remotion render src/index.ts PipOverlay "$OUTPUT" \
  --props="$PROPS" \
  --codec=prores \
  --prores-profile=4444 \
  --pixel-format=yuva444p10le

echo "Done: $OUTPUT"
ls -lh "$OUTPUT"
