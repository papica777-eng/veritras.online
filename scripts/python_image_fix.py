"""
python_image_fix — Qantum Module
Path: scripts/python_image_fix.py
Auto-documented by BrutalDocEngine v2.1
"""

from PIL import Image
import os
import sys

# Paths
artifact_dir = r"C:\Users\papic\.gemini\antigravity\brain\50bd67e4-5ba4-4e45-905f-f9fec4eb9c9c"
original_png = os.path.join(artifact_dir, "aeterna_play_header_1772328290803.png")
final_jpg = os.path.join(artifact_dir, "aeterna_play_header_FINAL.jpg")
final_png = os.path.join(artifact_dir, "aeterna_play_header_FINAL.png")

print(f"Opening original: {original_png}")
try:
    img = Image.open(original_png)
    
    # Needs to be EXACTLY 4096x2304, No Transparency (RGB!)
    # Convert to standard RGB to strip alpha channel completely
    img = img.convert('RGB')
    
    # Resize with Lanszos for high quality
    img = img.resize((4096, 2304), Image.Resampling.LANCZOS)
    
    # Save as PNG (24-bit opaque)
    img.save(final_png, format="PNG")
    png_size = os.path.getsize(final_png)
    print(f"PNG size: {png_size / (1024*1024):.2f} MB")
    
    # If PNG is > 1MB, we MUST use JPEG. Google says "JPEG or 24-bit PNG (no alpha). Under 1MB".
    # Since 4096x2304 is massive, PNG is likely > 1MB (usually 4-10MB).
    # Save as JPEG with specific quality to be < 1MB
    quality = 90
    while True:
        img.save(final_jpg, format="JPEG", quality=quality, optimize=True)
        size_mb = os.path.getsize(final_jpg) / (1024 * 1024)
        if size_mb < 0.95 or quality <= 10:  # Aim for < 0.95 MB to be super safe
            break
        quality -= 5
        
    print(f"JPEG size: {os.path.getsize(final_jpg) / (1024*1024):.2f} MB at quality {quality}")
    print(f"Dimensions: {img.width}x{img.height}")
    print(f"Paths:\n{final_jpg}\n{final_png}")

except Exception as e:
    print(f"Error: {e}")
