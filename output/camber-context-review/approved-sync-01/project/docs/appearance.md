# Miraverse appearance collection

Open Orbit, choose Settings, then Appearance. The color collection applies immediately and is saved with desktop preferences. Changing or resetting desktop shortcuts preserves the selected palette. Older saves start with Mountain Heather.

The collection uses the user's palette references:

| Palette | Colors |
| --- | --- |
| Mountain Heather | `#16131F`, `#F0D9E4`, `#C1A0AC`, `#4A3F4B`, `#806C79` |
| Stillwater Pine | `#1C2D2A`, `#0E1719`, `#BABA9E`, `#3B4A38`, `#6B765C` |
| Velvet Sienna | `#C0BAB3`, `#52423D`, `#887D77`, `#391214`, `#160F0C` |
| Autumn Study | `#22150C`, `#432C1A`, `#816550`, `#A98C75`, `#D3CBC1` |
| Morning Mist | `#5E8B7E`, `#A7C7E7`, `#2F3E46`, `#F1F5F4`, `#EBAEB7` |

`frontend/src/store/desktopThemes.ts` defines the palettes and derived surface tokens. `frontend/src/styles/studio-design.css` applies them to the default wallpaper, desktop chrome, window title bars, Service Directory, File Explorer, and Appearance settings. Individual professional applications retain their own functional colors.

The default wallpaper is drawn with CSS and remains available offline. Choosing an existing photo wallpaper keeps that image while applying the palette to the surrounding interface. Reduced-motion preferences remain respected.

The Service Directory provides category navigation, search, grouped cards, and the existing launch/edit controls. At narrow widths it uses the category selector in place of the sidebar. The standalone export uses the same directory styling, with Mountain Heather as its default.

File Explorer opens to Home unless an existing assignment requests a particular folder. Home shows quick-access folders and the actual file collection. Folder counts reflect current files; existing documents, mail attachments, web downloads, and assignment records continue using their original actions.
