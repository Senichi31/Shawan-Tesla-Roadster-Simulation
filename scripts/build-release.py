"""Build a standalone game page so a release cannot mix cached JS/CSS/assets."""
from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
css = (root / 'style.css').read_text()
# Optional remote fonts are omitted from the standalone/offline release.
css = re.sub(r'@import url\([^)]*\);', '', css)
# Derive the independently rotating wheels and unmodified body from one design.
svg = (root / 'assets/roadster.svg').read_text()
body = re.sub(r'<use href="#wheel"[^>]+/>', '', svg)
(root / 'assets/roadster-body.svg').write_text(body)
defs = svg[svg.index('<defs>'):svg.index('</defs>') + len('</defs>')]
wheel = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200">' + defs + '<use href="#wheel"/></svg>'
(root / 'assets/roadster-wheel.svg').write_text(wheel)
js = (root / 'game.js').read_text()
for filename in ['roadster.svg', 'roadster-body.svg', 'roadster-wheel.svg', 'roadster-top.svg']:
    data_url = 'data:image/svg+xml;base64,' + base64.b64encode((root / 'assets' / filename).read_bytes()).decode()
    js = js.replace('assets/' + filename + '?v=24', data_url)
    html = html.replace('assets/' + filename + '?v=24', data_url)
html = re.sub(r'<link rel="stylesheet" href="[^"]+">', lambda _: '<style>' + css + '</style>', html)
html = re.sub(r'<script src="game.js[^\"]*"></script>', lambda _: '<script>' + js + '</script>', html)
(root / 'play-ceiling-v24.html').write_text(html)
print('Built play-ceiling-v24.html (standalone, no external assets)')
