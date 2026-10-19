"""Build a standalone game page so a release cannot mix cached JS/CSS/assets."""
from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
css = (root / 'style.css').read_text()
# Optional remote fonts are omitted from the standalone/offline release.
css = re.sub(r'@import url\([^)]*\);', '', css)
svg_url = 'data:image/svg+xml;base64,' + base64.b64encode((root / 'assets/roadster.svg').read_bytes()).decode()
js = (root / 'game.js').read_text().replace('assets/roadster.svg?v=7', svg_url)
html = re.sub(r'<link rel="stylesheet" href="[^"]+">', lambda _: '<style>' + css + '</style>', html)
html = re.sub(r'<script src="game.js[^\"]*"></script>', lambda _: '<script>' + js + '</script>', html)
html = html.replace('assets/roadster.svg?v=7', svg_url)
(root / 'play-ceiling-v7.html').write_text(html)
print('Built play-ceiling-v7.html (standalone, no external assets)')
