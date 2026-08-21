from PIL import Image
from collections import Counter

img = Image.open("assets/logo.png").convert("RGB")
w, h = img.size
print(f"size: {w}x{h}")

pixels = list(img.getdata())
counts = Counter(pixels)

# Print the most common colors overall (dominated by background)
print("\nTop 10 most frequent colors (raw):")
for color, cnt in counts.most_common(10):
    print(f"  #{color[0]:02x}{color[1]:02x}{color[2]:02x}  rgb{color}  count={cnt}")

# Cluster near-duplicate colors by rounding to nearest 8 to find real distinct hues
# (anti-aliasing creates thousands of near-identical shades)
def bucket(c, step=12):
    return tuple((v // step) * step for v in c)

bucketed = Counter()
for color, cnt in counts.items():
    bucketed[bucket(color)] += cnt

print("\nTop 15 bucketed color clusters:")
for color, cnt in bucketed.most_common(15):
    print(f"  #{color[0]:02x}{color[1]:02x}{color[2]:02x}  rgb{color}  count={cnt}")

# Sample specific known regions: corner (background), and a few interior points
corner = img.getpixel((5, 5))
print(f"\nCorner background pixel (5,5): #{corner[0]:02x}{corner[1]:02x}{corner[2]:02x} rgb{corner}")
