from PIL import Image, ImageDraw
import os

def create_icon():
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background rounded rect (Obsidian dark slate)
    margin = 24
    corner_radius = 80
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=corner_radius,
        fill=(11, 17, 32, 255),
        outline=(30, 41, 59, 255),
        width=6
    )

    # Subtly draw balance pillar
    cx = size // 2
    draw.line([cx, 130, cx, 360], fill=(148, 163, 184, 255), width=8)
    draw.rounded_rectangle([cx - 30, 360, cx + 30, 376], radius=4, fill=(148, 163, 184, 255))
    draw.rounded_rectangle([cx - 45, 376, cx + 45, 394], radius=6, fill=(100, 116, 139, 255))

    # Balance beam (Gold)
    beam_y = 175
    draw.line([130, beam_y + 10, cx, beam_y, 382, beam_y + 10], fill=(245, 158, 11, 255), width=8)
    draw.ellipse([cx - 10, beam_y - 10, cx + 10, beam_y + 10], fill=(245, 158, 11, 255))

    # Left Pan (Defense - Blue)
    draw.line([130, beam_y + 10, 105, 250], fill=(59, 130, 246, 200), width=3)
    draw.line([130, beam_y + 10, 155, 250], fill=(59, 130, 246, 200), width=3)
    draw.pieslice([90, 240, 170, 280], 0, 180, fill=(37, 99, 235, 240))

    # Right Pan (Plaintiff - Red)
    draw.line([382, beam_y + 10, 357, 250], fill=(239, 68, 68, 200), width=3)
    draw.line([382, beam_y + 10, 407, 250], fill=(239, 68, 68, 200), width=3)
    draw.pieslice([342, 240, 422, 280], 0, 180, fill=(220, 38, 38, 240))

    # ECG Wave cutting across in Vivid Cyan
    ecg_pts = [
        (65, 315),
        (165, 315),
        (185, 285),
        (205, 345),
        (230, 220),
        (256, 385),
        (275, 290),
        (295, 325),
        (315, 315),
        (447, 315)
    ]
    draw.line(ecg_pts, fill=(6, 182, 212, 255), width=6, joint="round")

    # Scalpel diamond top
    diamond_pts = [(cx, 100), (cx + 12, 118), (cx, 136), (cx - 12, 118)]
    draw.polygon(diamond_pts, fill=(56, 189, 248, 255))

    # Ensure output directories exist
    os.makedirs("public", exist_ok=True)
    png_path = os.path.join("public", "app-icon.png")
    ico_path = os.path.join("public", "app-icon.ico")

    img.save(png_path, "PNG")
    print(f"Generated {png_path}")

    # Generate multi-size ICO
    icon_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(ico_path, format="ICO", sizes=icon_sizes)
    print(f"Generated {ico_path}")

if __name__ == "__main__":
    create_icon()
