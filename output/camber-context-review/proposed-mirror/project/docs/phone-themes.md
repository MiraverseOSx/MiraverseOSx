# Shared phone themes

Both `PhoneWidget` and the DGA phone console (including incoming calls) use the same phone theme preference. This preference is independent of the desktop theme.

- `frontend/src/styles/phone/themes.css`: semantic palette and shared geometry tokens. Twilight is the default; Aureline and Agency override the palette.
- `frontend/src/components/phone/themes.ts`: theme IDs, labels, descriptions, and validation.
- `frontend/src/components/phone/PhonePrimitives.tsx`: themed surfaces, panels, buttons, navigation, app icons, status bar, and theme picker.
- `frontend/src/styles/phone/phone.css`: shared component styles and container-based console layouts.
- `frontend/src/store/usePhonePreferences.ts`: one Zustand preference, persisted as `miraverse-phone-preferences` in local storage. Invalid theme IDs fall back to Twilight; unavailable storage leaves session selection functional.

Wrap phone UI in `PhoneSurface`; use the shared primitives and `--phone-*` variables inside it. Add a theme by updating the catalog, adding a palette selector, and including it in the contrast tests. Keep business logic and phone data outside the primitives.

## Validation

Run `npm run test:phone --prefix frontend` for WCAG AA text/action contrast checks across all three palettes. `npm run build --prefix frontend` validates the production bundle.

Browser QA uses the integrated desktop, not an isolated component preview:

| Viewport | Personal phone | DGA phone |
| --- | --- | --- |
| 980 × 780 (narrow desktop) | Three palettes; viewport and content bounds | Directory, keypad, voicemail, call log; three palettes |
| 768 × 1024 (tablet) | Three palettes; viewport and content bounds | Directory, keypad, voicemail, call log; three palettes |
| 390 × 844 (mobile) | Three palettes; viewport and content bounds | Directory, keypad, voicemail, call log; three palettes |
| 320 × 568 (small mobile) | Three palettes; scrollable home and messaging | Directory, keypad, voicemail, call log; populated voicemail and active call |

Additional checks: sending a message, valid and unknown extension dialing, incoming-call theme, routing a missed call into voicemail, voicemail controls, changing one phone's theme updates the other, and retaining the preference after closing/reopening the phone and a full page reload.

The DGA call log intentionally scrolls horizontally inside its panel on small screens. Phone screen content scrolls vertically when height is limited. Window bounds must be checked after resize transitions finish.
