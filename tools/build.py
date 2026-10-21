#!/usr/bin/env python3
"""Concatenate src/js/*.js into src/template.html and write index.html (single self-contained file)."""
import glob, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tpl = open(os.path.join(root, "src", "template.html"), encoding="utf-8").read()
parts = []
for p in sorted(glob.glob(os.path.join(root, "src", "js", "*.js"))):
    parts.append("// ===== %s =====\n" % os.path.basename(p) + open(p, encoding="utf-8").read())
js = "\n".join(parts)
assert "</script>" not in js, "JS must not contain a closing script tag"
out = tpl.replace("/*__JS__*/", js)
open(os.path.join(root, "index.html"), "w", encoding="utf-8").write(out)
print("built index.html: %d bytes from %d files" % (len(out.encode()), len(parts)))
