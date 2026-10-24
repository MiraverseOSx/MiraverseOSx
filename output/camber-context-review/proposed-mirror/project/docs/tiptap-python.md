# Tiptap and Python in Miraverse

Tiptap provides the local rich-text editor in AureMail composition and WORKNET report fields. Bold, italic, underline, lists, blockquotes, undo/redo, and keyboard shortcuts are available. Existing plain-text drafts remain readable. WORKNET validates the plain-text findings; sanitized formatting is stored with drafts and accepted outputs. Templates contain section prompts and do not supply assignment answers. No Tiptap cloud account or subscription is used.

Python 3.14.7 was already available on this machine. The standard-library generator produces three report outlines used by the editor and repeatable fictional case examples for writing and future content work:

```powershell
npm run data:fiction
npm run data:fiction -- --seed 123 --count 20
npm run test:fiction
```

The outlines are generated into `frontend/src/data/report-outlines.json`. Examples are written to `output/fictional-cases.json`. Identical seeds and counts produce identical output, including stable example and source IDs. These examples are not imported into AURA, WORKNET, or live player records. The browser consumes the generated outline JSON; Python runs as a developer command and is not required while playing.

The existing SQLite export script remains available as `npm run data:build`.

Validation covers report formatting recovery, HTML sanitization, unchanged plain-text evaluation, accepted receipts, deterministic generation, unique identifiers, and separation of examples from official records and rewards.
