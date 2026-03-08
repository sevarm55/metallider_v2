---
name: nanoBananaPro-image-gen
description: Batch-generate images via fal.ai Nano Banana Pro model. Random prompt sampler + `index.html` gallery.
homepage: https://fal.ai
metadata:
  {
    "openclaw":
      {
        "emoji": "🍌",
        "requires": { "bins": ["python3"], "env": ["FAL_KEY"] },
        "primaryEnv": "FAL_KEY",
        "install":
          [
            {
              "id": "python-brew",
              "kind": "brew",
              "formula": "python",
              "bins": ["python3"],
              "label": "Install Python (brew)",
            },
          ],
      },
  }
---

# Nano Banana Pro Image Gen

Generate a handful of "random but structured" prompts and render them via the fal.ai Nano Banana Pro model.

## Run

```bash
python3 {baseDir}/scripts/gen.py
open ~/Projects/tmp/nanoBananaPro-image-gen-*/index.html  # if ~/Projects/tmp exists; else ./tmp/...
```

Useful flags:

```bash
# Basic generation
python3 {baseDir}/scripts/gen.py --count 8
python3 {baseDir}/scripts/gen.py --prompt "ultra-detailed studio photo of a lobster astronaut" --count 4

# Aspect ratios
python3 {baseDir}/scripts/gen.py --aspect-ratio 16:9 --count 4
python3 {baseDir}/scripts/gen.py --aspect-ratio 9:16 --count 4
python3 {baseDir}/scripts/gen.py --aspect-ratio 1:1 --out-dir ./out/images

# Edit mode (with reference image)
python3 {baseDir}/scripts/gen.py --prompt "product on marble table" --image-url https://example.com/product.png
```

## Parameters

### Aspect Ratio (`--aspect-ratio`)

Supported values: `1:1`, `3:4`, `4:3`, `9:16`, `16:9`, `3:2`, `2:3`, `4:5`, `5:4`, `21:9`
- Default: `3:4`

### Output Format (`--output-format`)

Supported values: `png`, `jpeg`, `webp`
- Default: `png`

### Edit Mode (`--image-url`)

When a reference image URL is provided, uses `fal-ai/nano-banana-pro/edit` endpoint to generate images based on the reference. Otherwise uses `fal-ai/nano-banana-pro` for text-to-image generation.

## Output

- `*.png`, `*.jpeg`, or `*.webp` images (depends on `--output-format`)
- `prompts.json` (prompt -> file mapping)
- `index.html` (thumbnail gallery)
