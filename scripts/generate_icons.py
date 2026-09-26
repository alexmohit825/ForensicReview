from PIL import Image, ImageDraw
import os

def create_icon():
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Base Clean White Box Container with Subtle Border
    margin = 24
    corner_radius = 88
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=corner_radius,
        fill=(255, 255, 255, 255),
        outline=(203, 213, 225, 255),
        width=8
    )

    # Balance pillar
    cx = size // 2
    draw.line([cx, 130, cx, 360], fill=(71, 85, 105, 255), width=8)
    draw.rounded_rectangle([cx - 30, 360, cx + 30, 376], radius=4, fill=(51, 65, 85, 255))
    draw.rounded_rectangle([cx - 45, 376, cx + 45, 394], radius=6, fill=(30, 41, 59, 255))

    # Balance beam (Rich Amber Gold)
    beam_y = 175
    draw.line([130, beam_y + 10, cx, beam_y, 382, beam_y + 10], fill=(217, 119, 6, 255), width=8)
    draw.ellipse([cx - 10, beam_y - 10, cx + 10, beam_y + 10], fill=(217, 119, 6, 255))

    # Left Pan (Defense - Royal Blue)
    draw.line([130, beam_y + 10, 105, 250], fill=(37, 99, 235, 255), width=4)
    draw.line([130, beam_y + 10, 155, 250], fill=(37, 99, 235, 255), width=4)
    draw.pieslice([90, 240, 170, 280], 0, 180, fill=(37, 99, 235, 255))

    # Right Pan (Plaintiff - Crimson Red)
    draw.line([382, beam_y + 10, 357, 250], fill=(220, 38, 38, 255), width=4)
    draw.line([382, beam_y + 10, 407, 250], fill=(220, 38, 38, 255), width=4)
    draw.pieslice([342, 240, 422, 280], 0, 180, fill=(220, 38, 38, 255))

    # ECG Wave cutting across in Deep Cyan / Medical Sky
    ecg_pts = [
        (65, 315),
        (165, 315),
        (185, 285),
        (205, 345),
        (230, 215),
        (256, 385),
        (275, 285),
        (295, 325),
        (315, 310),
        (447, 310)
    ]
    draw.line(ecg_pts, fill=(2, 132, 199, 255), width=7, joint="round")

    # Scalpel diamond top
    diamond_pts = [(cx, 102), (cx + 12, 120), (cx, 138), (cx - 12, 120)]
    draw.polygon(diamond_pts, fill=(2, 132, 199, 255))

    # Ensure output directories exist
    os.makedirs("public", exist_ok=True)
    png_path = os.path.join("public", "app-icon.png")
    ico_path = os.path.join("public", "app-icon.ico")

    img.save(png_path, "PNG")
    print(f"Generated {png_path} (White box background)")

    # Generate multi-size ICO
    icon_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(ico_path, format="ICO", sizes=icon_sizes)
    print(f"Generated {ico_path} (White box background)")

if __name__ == "__main__":
    create_icon()
