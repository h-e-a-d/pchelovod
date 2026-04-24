#!/usr/bin/env bash
# Usage: generate.sh "prompt" output.webp [aspect_ratio]
# aspect_ratio default: 16:9
# Reads KIE_AI_API_KEY from env or project .mcp.json

set -euo pipefail

PROMPT="${1:?Usage: generate.sh \"prompt\" output.webp [aspect_ratio]}"
OUTPUT="${2:?Usage: generate.sh \"prompt\" output.webp [aspect_ratio]}"
ASPECT="${3:-16:9}"

# Resolve API key
if [ -z "${KIE_AI_API_KEY:-}" ]; then
  if [ -f ".mcp.json" ]; then
    KIE_AI_API_KEY=$(python3 -c "import json; d=json.load(open('.mcp.json')); print(d['mcpServers']['kie-ai']['env']['KIE_AI_API_KEY'])")
  else
    echo "Error: KIE_AI_API_KEY not set and .mcp.json not found" >&2
    exit 1
  fi
fi

echo "Creating task: \"$PROMPT\" ($ASPECT)"

# 1. Create task
TASK=$(curl -s -X POST https://api.kie.ai/api/v1/jobs/createTask \
  -H "Authorization: Bearer $KIE_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"nano-banana-2\",
    \"input\": {
      \"prompt\": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$PROMPT"),
      \"aspect_ratio\": \"$ASPECT\",
      \"resolution\": \"1K\",
      \"output_format\": \"jpg\"
    }
  }")

TASK_ID=$(echo "$TASK" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['taskId'])")
echo "Task ID: $TASK_ID"

# 2. Poll until complete
while true; do
  RESULT=$(curl -s "https://api.kie.ai/api/v1/jobs/recordInfo?taskId=$TASK_ID" \
    -H "Authorization: Bearer $KIE_AI_API_KEY")
  STATE=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['state'])")
  if [ "$STATE" = "success" ]; then break; fi
  if [ "$STATE" = "fail" ]; then
    echo "Task failed: $(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'].get('failMsg','unknown'))")" >&2
    exit 1
  fi
  echo "  waiting... ($STATE)"
  sleep 5
done

# 3. Extract image URL
IMG_URL=$(echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
urls = json.loads(d['data']['resultJson'])['resultUrls']
print(urls[0])
")

# 4. Get temporary download link
DL_URL=$(curl -s -X POST https://api.kie.ai/api/v1/common/download-url \
  -H "Authorization: Bearer $KIE_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$IMG_URL\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'])")

# 5. Download JPG
TMP_JPG=$(mktemp /tmp/kie_XXXXXX.jpg)
curl -s -o "$TMP_JPG" "$DL_URL"
echo "Downloaded JPG: $TMP_JPG"

# 6. Convert to WebP
python3 -c "
from PIL import Image
img = Image.open('$TMP_JPG')
img.save('$OUTPUT', 'WEBP', quality=85)
print('Saved: $OUTPUT')
"

rm -f "$TMP_JPG"
