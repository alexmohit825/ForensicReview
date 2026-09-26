from PIL import Image, ImageDraw
import os

def create_icon():
    size = 512
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Solid White Tile Background (Squircle with minimal margin to pop on Windows dark taskbar)
    margin = 8
    corner_radius = 72
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=corner_radius,
        fill=(255, 255, 255, 255), # Solid Pure White Box
        outline=(203, 213, 225, 255), # Subtle Slate-300 border
        width=10
    )

    cx = size // 2

    # Balance pillar (Dark Slate for crisp contrast against white)
    draw.line([cx, 120, cx, 360], fill=(51, 65, 85, 255), width=10)
    draw.rounded_rectangle([cx - 32, 360, cx + 32, 378], radius=4, fill=(30, 41, 59, 255))
    draw.rounded_rectangle([cx - 50, 378, cx + 50, 398], radius=6, fill=(15, 23, 42, 255))

    # Balance beam (Rich Amber/Gold)
    beam_y = 170
    draw.line([120, beam_y + 12, cx, beam_y, 392, beam_y + 12], fill=(217, 119, 6, 255), width=10)
    draw.ellipse([cx - 12, beam_y - 12, cx + 12, beam_y + 12], fill=(217, 119, 6, 255))

    # Left Pan (Defense - Royal Cobalt Blue)
    draw.line([120, beam_y + 12, 95, 250], fill=(29, 78, 216, 255), width=4)
    draw.line([120, beam_y + 12, 145, 250], fill=(29, 78, 216, 255), width=4)
    draw.pieslice([80, 240, 160, 280], 0, 180, fill=(37, 99, 235, 255), outline=(29, 78, 216, 255), width=2)

    # Right Pan (Plaintiff - Crimson Red)
    draw.line([392, beam_y + 12, 367, 250], fill=(185, 28, 28, 255), width=4)
    draw.line([392, beam_y + 12, 417, 250], fill=(185, 28, 28, 255), width=4)
    draw.pieslice([352, 240, 432, 280], 0, 180, fill=(220, 38, 38, 255), outline=(185, 28, 28, 255), width=2)

    # ECG Wave cutting across in Deep Medical Blue/Cyan
    ecg_pts = [
        (55, 315),
        (155, 315),
        (175, 280),
        (195, 345),
        (225, 210),
        (256, 390),
        (275, 285),
        (295, 325),
        (315, 310),
        (457, 310)
    ]
    draw.line(ecg_pts, fill=(2, 132, 199, 255), width=8, joint="round")

    # Scalpel diamond top
    diamond_pts = [(cx, 94), (cx + 14, 112), (cx, 130), (cx - 14, 112)]
    draw.polygon(diamond_pts, fill=(2, 132, 199, 255))

    # Ensure output directories exist
    os.makedirs("public", exist_ok=True)
    png_path = os.path.join("public", "app-icon.png")
    ico_path = os.path.join("public", "app-icon.ico")

    img.save(png_path, "PNG")
    print(f"Generated {png_path} (Solid White Box)")

    # Generate multi-size ICO including 16, 24, 32, 48, 64, 128, 256
    icon_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(ico_path, format="ICO", sizes=icon_sizes)
    print(f"Generated {ico_path} (Solid White Box)")

if __name__ == "__main__":
    create_icon()
