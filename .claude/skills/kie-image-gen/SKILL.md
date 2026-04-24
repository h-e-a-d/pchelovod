---
name: kie-image-gen
description: Use when generating images via kie.ai API with the nano-banana-2 model and saving them as WebP files for use in web projects.
---

# kie Image Generation

## Overview

Generate images using kie.ai's nano-banana-2 model, download as JPG, and convert to WebP using Python Pillow.

## API Key

Read from the project's `.mcp.json` under `mcpServers.kie-ai.env.KIE_AI_API_KEY`, or export as `KIE_AI_API_KEY` env var.

```bash
KIE_AI_API_KEY=$(python3 -c "import json; d=json.load(open('.mcp.json')); print(d['mcpServers']['kie-ai']['env']['KIE_AI_API_KEY'])")
```

## Workflow

### 1. Create task

```bash
TASK=$(curl -s -X POST https://api.kie.ai/api/v1/jobs/createTask \
  -H "Authorization: Bearer $KIE_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nano-banana-2",
    "input": {
      "prompt": "YOUR PROMPT HERE",
      "aspect_ratio": "16:9",
      "resolution": "1K",
      "output_format": "jpg"
    }
  }')
TASK_ID=$(echo $TASK | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['taskId'])")
```

### 2. Poll until complete

```bash
while true; do
  RESULT=$(curl -s "https://api.kie.ai/api/v1/jobs/recordInfo?taskId=$TASK_ID" \
    -H "Authorization: Bearer $KIE_AI_API_KEY")
  STATE=$(echo $RESULT | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['state'])")
  if [ "$STATE" = "success" ]; then break; fi
  if [ "$STATE" = "fail" ]; then echo "Task failed"; exit 1; fi
  echo "Waiting... ($STATE)"; sleep 5
done
```

### 3. Get image URL and download

```bash
IMG_URL=$(echo $RESULT | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.loads(d['data']['resultJson'])['resultUrls'][0])")

# Get temporary download link (valid 20 min)
DL_URL=$(curl -s -X POST https://api.kie.ai/api/v1/common/download-url \
  -H "Authorization: Bearer $KIE_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$IMG_URL\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'])")

curl -s -o /tmp/kie_output.jpg "$DL_URL"
```

### 4. Convert JPG → WebP

```bash
python3 -c "
from PIL import Image
img = Image.open('/tmp/kie_output.jpg')
img.save('OUTPUT_PATH.webp', 'WEBP', quality=85)
print('Saved OUTPUT_PATH.webp')
"
```

## Aspect Ratio Options

| Use case           | Ratio          |
| ------------------ | -------------- |
| Hero / landscape   | `16:9`         |
| Portrait / product | `2:3` or `4:5` |
| Square             | `1:1`          |
| Wide banner        | `21:9`         |

## Resolution

Always use `1K` unless exceptional quality is needed (higher = slower + more credits).

## Full One-Shot Script

See `generate.sh` in this directory — accepts prompt, output path, and optional aspect ratio.

```bash
~/.claude/skills/kie-image-gen/generate.sh \
  "Wooden beehives on a Tajik mountain slope at golden hour" \
  /path/to/output.webp \
  16:9
```
