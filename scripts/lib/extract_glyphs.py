"""Extract glyph outlines from fonts into a JSON atlas: {font: {upm, asc, desc, glyphs: {char: [adv, d]}}}."""
import json, sys, io
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib import instancer

FD = sys.argv[1]; OUT = sys.argv[2]
EXTRA = "·•●○◆◇▸▹►→←↑↓↗✓✦★°′″—–…│─┌┐└┘├┤▲▼■□×±≈∞⌁⏵"
CHARS = [chr(c) for c in range(32, 127)] + list(EXTRA)
SPECS = {
  "michroma":   ("Michroma-Regular.ttf", None),
  "unb300":     ("Unbounded[wght].ttf", 300),
  "unb500":     ("Unbounded[wght].ttf", 500),
  "unb700":     ("Unbounded[wght].ttf", 700),
  "sg400":      ("SpaceGrotesk[wght].ttf", 400),
  "sg500":      ("SpaceGrotesk[wght].ttf", 500),
  "sg700":      ("SpaceGrotesk[wght].ttf", 700),
  "jb400":      ("JetBrainsMono[wght].ttf", 400),
  "jb600":      ("JetBrainsMono[wght].ttf", 600),
  "jb800":      ("JetBrainsMono[wght].ttf", 800),
  "sm400":      ("SpaceMono-Regular.ttf", None),
  "sm700":      ("SpaceMono-Bold.ttf", None),
}
atlas = {}
for key, (fn, wght) in SPECS.items():
    f = TTFont(f"{FD}/{fn}")
    if wght is not None:
        f = instancer.instantiateVariableFont(f, {"wght": wght})
        buf = io.BytesIO(); f.save(buf); buf.seek(0); f = TTFont(buf)
    gs = f.getGlyphSet(); cmap = f.getBestCmap(); hmtx = f["hmtx"]
    upm = f["head"].unitsPerEm; hhea = f["hhea"]
    os2 = f["OS/2"]
    glyphs = {}
    for ch in CHARS:
        g = cmap.get(ord(ch))
        if not g: continue
        pen = SVGPathPen(gs, ntos=lambda v: ("%.1f" % v).rstrip("0").rstrip("."))
        gs[g].draw(TransformPen(pen, (1, 0, 0, -1, 0, 0)))
        glyphs[ch] = [hmtx[g][0], pen.getCommands()]
    atlas[key] = {"upm": upm, "asc": hhea.ascent, "desc": hhea.descent,
                  "cap": getattr(os2, "sCapHeight", 0) or int(upm*0.7), "glyphs": glyphs}
    missing = [c for c in CHARS if c not in glyphs]
    print(key, upm, "glyphs", len(glyphs), "missing", "".join(missing[:40]))
json.dump(atlas, open(OUT, "w"), separators=(",", ":"))
