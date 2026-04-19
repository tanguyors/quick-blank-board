"""
AI background removal using rembg (U2NET model).
Handles antialiasing and soft edges properly, unlike flood-fill.
"""
import sys
from pathlib import Path
from rembg import remove, new_session
from PIL import Image
import io

def remove_bg_ai(src_path: Path, session):
    with open(src_path, "rb") as f:
        input_bytes = f.read()
    output_bytes = remove(input_bytes, session=session)
    img = Image.open(io.BytesIO(output_bytes))
    img.save(src_path, "PNG")
    print(f"OK {src_path.name}")

if __name__ == "__main__":
    paths = [Path(p) for p in sys.argv[1:]]
    if not paths:
        icon_dir = Path("src/assets/icons")
        paths = sorted(icon_dir.glob("*.png"))

    session = new_session("isnet-general-use")

    for p in paths:
        try:
            remove_bg_ai(p, session)
        except Exception as e:
            print(f"ERR {p.name}: {e}")
