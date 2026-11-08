# One-shot photo editor for the "sobre mí" gallery.
# Crops each photo to 4:5 around a chosen focus (removing watermarks and edge distractions),
# then evens out exposure, contrast and color so the set looks consistent.
# Usage: python scripts/edit-gallery.py <source_dir> <out_dir>
import math
import sys
from pathlib import Path

import pillow_heif
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageStat

pillow_heif.register_heif_opener()

OUT_W, OUT_H = 1200, 1500  # 4:5

# file, (center x, center y, crop width) as fractions of the oriented photo, output name
PHOTOS = [
    ('20240511_124816.heic', (0.56, 0.48, 0.74), 'galeria-01'),
    ('20241110_185905.jpg', (0.50, 0.52, 1.00), 'galeria-02'),
    ('20241120_095023.jpg', (0.50, 0.66, 1.00), 'galeria-03'),
    ('IMG_20241212_104932.jpg', (0.40, 0.50, 0.52), 'galeria-04'),
    ('20250803_141157.jpg', (0.50, 0.60, 1.00), 'galeria-05'),
    ('IMG_20250927_100807_136.jpg', (0.50, 0.55, 0.90), 'galeria-06'),
    ('20260614_203032.jpg', (0.40, 0.56, 0.58), 'galeria-07'),
    ('20260808_154555.jpg', (0.45, 0.52, 0.75), 'galeria-08'),
    ('WhatsApp Image 2026-11-08 at 10.41.39 (1).jpeg', (0.37, 0.436, 0.523), 'galeria-09'),
    ('WhatsApp Image 2026-11-08 at 10.41.39.jpeg', (0.50, 0.44, 0.85), 'galeria-10'),
    ('WhatsApp Image 2026-11-08 at 10.41.40 (1).jpeg', (0.50, 0.50, 0.85), 'galeria-11'),
    ('WhatsApp Image 2026-11-08 at 10.41.40.jpeg', (0.55, 0.55, 0.70), 'galeria-12'),
]


def crop_45(img: Image.Image, cx: float, cy: float, wf: float) -> Image.Image:
    w, h = img.size
    cw = wf * w
    ch = cw * 5 / 4
    if ch > h:  # too tall for this photo: shrink keeping 4:5
        ch = h
        cw = ch * 4 / 5
    left = min(max(cx * w - cw / 2, 0), w - cw)
    top = min(max(cy * h - ch / 2, 0), h - ch)
    return img.crop((round(left), round(top), round(left + cw), round(top + ch)))


def grade(img: Image.Image) -> Image.Image:
    img = ImageOps.autocontrast(img, cutoff=(0.5, 0.1), preserve_tone=True)
    # Gamma curve toward a common midtone: lifts dark photos without clipping highlights.
    lum = ImageStat.Stat(img.convert('L')).mean[0] / 255
    gamma = min(max(math.log(0.46) / math.log(min(max(lum, 0.05), 0.95)), 0.7), 1.15)
    img = img.point(lambda v: round(255 * (v / 255) ** gamma))
    img = ImageEnhance.Contrast(img).enhance(1.04)
    img = ImageEnhance.Color(img).enhance(1.08)
    # Gentle warm tone shared by the whole set.
    r, g, b = img.split()
    r = r.point(lambda v: min(255, round(v * 1.035)))
    b = b.point(lambda v: round(v * 0.965))
    img = Image.merge('RGB', (r, g, b))
    return img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=3))


def main(src: str, out: str) -> None:
    Path(out).mkdir(parents=True, exist_ok=True)
    for name, (cx, cy, wf), slug in PHOTOS:
        img = ImageOps.exif_transpose(Image.open(Path(src) / name)).convert('RGB')
        img = crop_45(img, cx, cy, wf).resize((OUT_W, OUT_H), Image.LANCZOS)
        grade(img).save(Path(out) / f'{slug}.jpg', 'JPEG', quality=86, optimize=True, progressive=True)
        print(slug, name)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
