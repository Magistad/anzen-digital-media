"""Rasterize the Closepath mark from app/icon.svg into Capacitor source art."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

INK = (7, 7, 8, 255)
PAPER = (244, 240, 230, 255)
OUTER = [(16, 5.2), (26.8, 26), (23.65, 26), (21.5, 20.85), (12.5, 20.85), (10.35, 26), (7.2, 26)]
INNER = [(16, 12.35), (12.65, 20.35), (19.35, 20.35)]
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"


def mapped(points, size, pad):
    span = size * (1 - 2 * pad)
    origin = size * pad
    return [(origin + x / 32 * span, origin + y / 32 * span) for x, y in points]


def mask(size, pad):
    image = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(image)
    draw.polygon(mapped(OUTER, size, pad), fill=255)
    draw.polygon(mapped(INNER, size, pad), fill=0)
    return image


def icon(size, pad, background):
    image = Image.new("RGBA", (size, size), background)
    paint = Image.new("RGBA", (size, size), PAPER)
    image.paste(paint, mask=mask(size, pad))
    return image


def wordmark(canvas, font):
    draw = ImageDraw.Draw(canvas)
    text = "Closepath"
    box = draw.textbbox((0, 0), text, font=font)
    width = box[2] - box[0]
    height = box[3] - box[1]
    x = (canvas.width - width) / 2
    y = canvas.height * 0.62
    draw.text((x, y), text, font=font, fill=PAPER)
    return height


def splash(size):
    image = Image.new("RGBA", (size, size), INK)
    mark = icon(size, 0.34, (0, 0, 0, 0))
    # Keep the mark above center so the wordmark has room.
    mark = mark.resize((int(size * 0.36), int(size * 0.36)), Image.Resampling.LANCZOS)
    x = (size - mark.width) // 2
    y = int(size * 0.28)
    image.alpha_composite(mark, (x, y))
    font = load_font(int(size * 0.048))
    draw = ImageDraw.Draw(image)
    text = "Closepath"
    box = draw.textbbox((0, 0), text, font=font)
    width = box[2] - box[0]
    draw.text(((size - width) / 2, size * 0.60), text, font=font, fill=PAPER)
    return image


def load_font(size):
    candidates = [
        Path("/tmp/InstrumentSans.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    icon(1024, 0.18, INK).save(OUT / "icon-only.png")
    icon(1024, 0.22, (0, 0, 0, 0)).save(OUT / "icon-foreground.png")
    Image.new("RGBA", (1024, 1024), INK).save(OUT / "icon-background.png")
    art = splash(2732)
    art.save(OUT / "splash.png")
    art.save(OUT / "splash-dark.png")
    print(f"wrote brand art in {OUT}")


if __name__ == "__main__":
    main()
