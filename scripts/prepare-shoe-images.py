import hashlib
import json
import os
from pathlib import Path

os.environ.setdefault("OMP_NUM_THREADS", "1")

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_propagation
from rembg import new_session, remove

root = Path(__file__).resolve().parent.parent
assets = root / "temp/shoe-images"
os.environ.setdefault("U2NET_HOME", str(assets / "models"))
records = json.loads((root / "data/shoe-images.json").read_text())
selections = json.loads((root / "data/shoe-image-selections.json").read_text())
results_path = assets / "processed.json"
results = json.loads(results_path.read_text()) if results_path.exists() else {}
session = None
paths = [(shoe["brandKey"], shoe["slug"]) for shoe in records]
if len(paths) != len(set(paths)):
    raise ValueError("Image path collision in source manifest")

for shoe in records:
    key = f"{shoe['brand']}/{shoe['name']}"
    selection = selections.get(key)
    if not selection:
        continue
    candidate = shoe["candidates"][selection["index"]]
    if not candidate.get("localPath"):
        print(f"Skipped {key}: source not downloaded", flush=True)
        continue
    source = root / candidate["localPath"]
    source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
    previous = results.get(key, {})
    destination = assets / shoe["brandKey"] / shoe["slug"] / "side.png"
    if previous.get("localPath") == str(destination.relative_to(root)) and previous.get("processorVersion") == 2 and previous.get("sourceHash") == source_hash and previous.get("selection") == selection and previous.get("sourceImageUrl") == candidate["url"] and previous.get("sourcePage") == shoe["sourcePage"] and (root / previous["localPath"]).exists():
        continue
    image = Image.open(source).convert("RGBA")
    if selection.get("crop"):
        image = image.crop(selection["crop"])
    image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    alpha = np.asarray(image.getchannel("A"))
    transparent = (alpha < 8).mean() > 0.05
    if selection.get("whiteBackground"):
        pixels = np.asarray(image).copy()
        background = pixels[:, :, :3].min(axis=2) > 225
        edges = np.zeros(background.shape, dtype=bool)
        edges[[0, -1], :] = True
        edges[:, [0, -1]] = True
        pixels[:, :, 3][binary_propagation(edges & background, mask=background)] = 0
        image = Image.fromarray(pixels)
    elif not transparent:
        if session is None:
            session = new_session("u2net")
        image = remove(image, session=session, post_process_mask=True)
    if selection.get("rotate"):
        image = image.rotate(selection["rotate"], resample=Image.Resampling.BICUBIC, expand=True)
    bounds = image.getchannel("A").point(lambda value: 255 if value > 16 else 0).getbbox()
    if not bounds:
        raise ValueError(f"Empty foreground for {key}")
    image = image.crop(bounds)
    image.thumbnail((1104, 704), Image.Resampling.LANCZOS)
    width = max(image.width + 96, (image.height + 96) * 3 // 2)
    height = (width * 2 + 2) // 3
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    canvas.alpha_composite(image, ((width - image.width) // 2, (height - image.height) // 2))
    destination.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(destination, optimize=True)
    alpha = np.asarray(canvas.getchannel("A"))
    results[key] = {
        "localPath": str(destination.relative_to(root)),
        "sourceImageUrl": candidate["url"],
        "sourcePage": shoe["sourcePage"],
        "sourceHash": source_hash,
        "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
        "selection": selection,
        "processorVersion": 2,
        "nativeTransparency": bool(transparent),
        "transparentPixels": float((alpha == 0).mean()),
        "foregroundPixels": float((alpha > 240).mean()),
    }
    results_path.write_text(json.dumps(results, indent=2) + "\n")
    print(f"Prepared {key}: {results[key]['transparentPixels']:.0%} transparent", flush=True)

items = [(key, result) for key, result in results.items() if key in selections]
review_id = hashlib.sha256(json.dumps({key: result["sha256"] for key, result in items}, sort_keys=True).encode()).hexdigest()[:8]
for start in range(0, len(items), 20):
    sheet = Image.new("RGB", (1440, 1000), "#303238")
    draw = ImageDraw.Draw(sheet)
    for offset, (key, result) in enumerate(items[start:start + 20]):
        left, top = (offset % 4) * 360, (offset // 4) * 200
        background = Image.new("RGBA", (360, 176), "#303238")
        checker = ImageDraw.Draw(background)
        for x in range(0, 360, 16):
            for y in range(0, 176, 16):
                if (x // 16 + y // 16) % 2:
                    checker.rectangle((x, y, x + 15, y + 15), fill="#40434a")
        image = Image.open(root / result["localPath"]).convert("RGBA")
        image.thumbnail((350, 175), Image.Resampling.LANCZOS)
        background.alpha_composite(image, ((360 - image.width) // 2, (176 - image.height) // 2))
        sheet.paste(background.convert("RGB"), (left, top))
        draw.text((left + 8, top + 178), key, fill="white")
    destination = assets / f"review-{review_id}-{start // 20}.jpg"
    sheet.save(destination, quality=92)
    print(destination, flush=True)
