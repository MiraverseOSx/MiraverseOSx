import zipfile
import json
import xml.etree.ElementTree as ET
import os

docx_path = 'Game Dev Doc.docx'
out_path = 'src/data/gameDevDoc.json'

os.makedirs('src/data', exist_ok=True)

z = zipfile.ZipFile(docx_path)
tree = ET.fromstring(z.read('word/document.xml'))

ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

paragraphs = []
sections = []
current_section = {"title": "Introduction", "content": []}

for p in tree.iter(f"{{{ns['w']}}}p"):
    texts = [elem.text for elem in p.iter(f"{{{ns['w']}}}t") if elem.text]
    full_text = "".join(texts).strip()
    if not full_text:
        continue
    
    # Simple heading detection (e.g., "1 Executive Summary", "3 Story & Lore")
    if (len(full_text) < 80 and full_text[0].isdigit() and ' ' in full_text[:5]) or full_text.isupper() or full_text.startswith('APP '):
        if current_section["content"]:
            sections.append(current_section)
        current_section = {"title": full_text, "content": []}
    else:
        current_section["content"].append(full_text)
    paragraphs.append(full_text)

if current_section["content"]:
    sections.append(current_section)

data = {
    "title": "MIRAVERSEOSX Game Design Document",
    "tagline": "Technology should feel magical, and magic should feel technological.",
    "sections": sections,
    "totalParagraphs": len(paragraphs)
}

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Successfully extracted {len(sections)} sections and {len(paragraphs)} paragraphs to {out_path}")
