#!/usr/bin/env python3
import argparse
import datetime as dt
import json
import os
import random
import re
import sys
import urllib.error
import urllib.request
from html import escape as html_escape
from pathlib import Path


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text or "image"


def default_out_dir() -> Path:
    now = dt.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    preferred = Path.home() / "Projects" / "tmp"
    base = preferred if preferred.is_dir() else Path("./tmp")
    base.mkdir(parents=True, exist_ok=True)
    return base / f"nanoBananaPro-image-gen-{now}"


def pick_prompts(count: int) -> list[str]:
    subjects = [
        "a lobster astronaut",
        "a brutalist lighthouse",
        "a cozy reading nook",
        "a cyberpunk noodle shop",
        "a Vienna street at dusk",
        "a minimalist product photo",
        "a surreal underwater library",
    ]
    styles = [
        "ultra-detailed studio photo",
        "35mm film still",
        "isometric illustration",
        "editorial photography",
        "soft watercolor",
        "architectural render",
        "high-contrast monochrome",
    ]
    lighting = [
        "golden hour",
        "overcast soft light",
        "neon lighting",
        "dramatic rim light",
        "candlelight",
        "foggy atmosphere",
    ]
    prompts: list[str] = []
    for _ in range(count):
        prompts.append(
            f"{random.choice(styles)} of {random.choice(subjects)}, {random.choice(lighting)}"
        )
    return prompts


def request_image(
    fal_key: str,
    prompt: str,
    aspect_ratio: str,
    output_format: str,
    image_url: str = "",
) -> dict:
    """Call fal.ai Nano Banana Pro API (generate or edit)."""
    if image_url:
        url = "https://queue.fal.run/fal-ai/nano-banana-pro/edit"
        payload = {
            "prompt": prompt,
            "image_urls": [image_url],
            "aspect_ratio": aspect_ratio,
            "output_format": output_format,
        }
    else:
        url = "https://queue.fal.run/fal-ai/nano-banana-pro"
        payload = {
            "prompt": prompt,
            "aspect_ratio": aspect_ratio,
            "output_format": output_format,
        }

    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        method="POST",
        headers={
            "Authorization": f"Key {fal_key}",
            "Content-Type": "application/json",
        },
        data=body,
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        payload_err = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"fal.ai API failed ({e.code}): {payload_err}") from e

    # fal.ai queue: poll for result if we get a request_id
    request_id = result.get("request_id")
    if request_id:
        return poll_fal_result(fal_key, url, request_id)

    return result


def poll_fal_result(fal_key: str, base_url: str, request_id: str) -> dict:
    """Poll fal.ai queue until the result is ready."""
    import time

    status_url = f"{base_url}/requests/{request_id}/status"
    result_url = f"{base_url}/requests/{request_id}"

    for _ in range(120):  # up to ~4 minutes
        time.sleep(2)
        req = urllib.request.Request(
            status_url,
            headers={"Authorization": f"Key {fal_key}"},
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                status = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError:
            continue

        if status.get("status") == "COMPLETED":
            req2 = urllib.request.Request(
                result_url,
                headers={"Authorization": f"Key {fal_key}"},
            )
            with urllib.request.urlopen(req2, timeout=30) as resp2:
                return json.loads(resp2.read().decode("utf-8"))
        elif status.get("status") == "FAILED":
            raise RuntimeError(f"fal.ai generation failed: {status}")

    raise RuntimeError("fal.ai generation timed out")


def download_image(image_url: str, filepath: Path) -> None:
    """Download image from URL to local file."""
    req = urllib.request.Request(image_url)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            filepath.write_bytes(resp.read())
    except urllib.error.URLError as e:
        raise RuntimeError(f"Failed to download image from {image_url}: {e}") from e


def write_gallery(out_dir: Path, items: list[dict]) -> None:
    thumbs = "\n".join(
        [
            f"""
<figure>
  <a href="{html_escape(it["file"], quote=True)}"><img src="{html_escape(it["file"], quote=True)}" loading="lazy" /></a>
  <figcaption>{html_escape(it["prompt"])}</figcaption>
</figure>
""".strip()
            for it in items
        ]
    )
    html = f"""<!doctype html>
<meta charset="utf-8" />
<title>nanoBananaPro-image-gen</title>
<style>
  :root {{ color-scheme: dark; }}
  body {{ margin: 24px; font: 14px/1.4 ui-sans-serif, system-ui; background: #0b0f14; color: #e8edf2; }}
  h1 {{ font-size: 18px; margin: 0 0 16px; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }}
  figure {{ margin: 0; padding: 12px; border: 1px solid #1e2a36; border-radius: 14px; background: #0f1620; }}
  img {{ width: 100%; height: auto; border-radius: 10px; display: block; }}
  figcaption {{ margin-top: 10px; color: #b7c2cc; }}
  code {{ color: #9cd1ff; }}
</style>
<h1>nanoBananaPro-image-gen</h1>
<p>Output: <code>{html_escape(out_dir.as_posix())}</code></p>
<div class="grid">
{thumbs}
</div>
"""
    (out_dir / "index.html").write_text(html, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate images via fal.ai Nano Banana Pro.")
    ap.add_argument("--prompt", help="Single prompt. If omitted, random prompts are generated.")
    ap.add_argument("--count", type=int, default=8, help="How many images to generate.")
    ap.add_argument("--aspect-ratio", default="3:4", help="Aspect ratio (e.g. 1:1, 3:4, 16:9).")
    ap.add_argument("--output-format", default="png", help="Output format: png, jpeg, or webp.")
    ap.add_argument("--image-url", default="", help="Reference image URL for edit mode.")
    ap.add_argument("--out-dir", default="", help="Output directory (default: ./tmp/nanoBananaPro-image-gen-<ts>).")
    args = ap.parse_args()

    fal_key = (os.environ.get("FAL_KEY") or "").strip()
    if not fal_key:
        print("Missing FAL_KEY", file=sys.stderr)
        return 2

    out_dir = Path(args.out_dir).expanduser() if args.out_dir else default_out_dir()
    out_dir.mkdir(parents=True, exist_ok=True)

    prompts = [args.prompt] * args.count if args.prompt else pick_prompts(args.count)
    file_ext = args.output_format

    items: list[dict] = []
    for idx, prompt in enumerate(prompts, start=1):
        print(f"[{idx}/{len(prompts)}] {prompt}")
        res = request_image(
            fal_key,
            prompt,
            args.aspect_ratio,
            args.output_format,
            args.image_url,
        )

        images = res.get("images", [])
        if not images:
            raise RuntimeError(f"Unexpected response: {json.dumps(res)[:400]}")

        image_url = images[0].get("url", "")
        if not image_url:
            raise RuntimeError(f"No image URL in response: {json.dumps(res)[:400]}")

        filename = f"{idx:03d}-{slugify(prompt)[:40]}.{file_ext}"
        filepath = out_dir / filename
        download_image(image_url, filepath)

        items.append({"prompt": prompt, "file": filename})

    (out_dir / "prompts.json").write_text(json.dumps(items, indent=2), encoding="utf-8")
    write_gallery(out_dir, items)
    print(f"\nWrote: {(out_dir / 'index.html').as_posix()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
