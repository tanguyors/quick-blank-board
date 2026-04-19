"""
Remove checkerboard/light background from Nano Banana generated icons.
Uses flood-fill from the 4 corners with tolerance to target only the bg,
preserving white pixels that are part of the icon itself.
"""
import sys
from pathlib import Path
from PIL import Image
from collections import deque

TOLERANCE = 35  # how much color variation to include in the "background"

def is_bg_color(r, g, b):
    """Detect pixels that look like checkerboard bg (white or light gray)."""
    if r > 220 and g > 220 and b > 220:
        return True
    if 190 < r < 230 and 190 < g < 230 and 190 < b < 230 and abs(r - g) < 10 and abs(g - b) < 10:
        return True
    return False

def remove_bg(src_path: Path, dst_path: Path | None = None):
    if dst_path is None:
        dst_path = src_path
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    visited = [[False] * h for _ in range(w)]
    queue = deque()

    for x in range(w):
        for y in (0, h - 1):
            r, g, b, _ = pixels[x, y]
            if is_bg_color(r, g, b):
                queue.append((x, y))
                visited[x][y] = True
    for y in range(h):
        for x in (0, w - 1):
            r, g, b, _ = pixels[x, y]
            if is_bg_color(r, g, b):
                queue.append((x, y))
                visited[x][y] = True

    while queue:
        x, y = queue.popleft()
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                nr, ng, nb, _ = pixels[nx, ny]
                if is_bg_color(nr, ng, nb):
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    img.save(dst_path, "PNG")
    print(f"OK {src_path.name}")

if __name__ == "__main__":
    paths = [Path(p) for p in sys.argv[1:]]
    if not paths:
        icon_dir = Path("src/assets/icons")
        paths = sorted(icon_dir.glob("*.png"))
    for p in paths:
        try:
            remove_bg(p)
        except Exception as e:
            print(f"ERR {p.name}: {e}")
