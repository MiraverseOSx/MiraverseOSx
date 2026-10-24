# MIRAVERSEOSx

Universal Game Design System · Version 1.0 · October 2026

We're expanding the WORKNET style guide into a unified visual design system for the entire MiraverseOSx game.

The goal is consistency without making every application look identical. The desktop, navigation, windows, buttons, typography, and interactions will share common standards, while MAI.SPACE, WORKNET, DGAOS, Cyacademy, and other applications retain distinct identities.

We'll also address the sizing issue you noticed: compact windows, tighter spacing, narrower content, and less wasted space.

This is a proposed universal guide that preserves the application-specific designs we've established. It does not modify GitHub.

## 1. Core design philosophy

MIRAVERSE OS

# One world. Many identities.

A living digital civilization expressed through distinct applications, consistent interactions, and personal choice.

The universal design follows five principles:

1. Compact: Avoid oversized headings, excessive padding, and unnecessarily wide cards.
2. Consistent: Shared navigation patterns, window controls, keyboard behavior, and accessibility.
3. Distinct: Every application has an identity suited to its purpose.
4. Functional: Information and interactivity come before decoration.
5. Immersive: Interfaces should feel like real software used by Meridion's citizens.

## 2. Universal color foundation

These are the proposed operating-system-level neutrals. They don't replace WORKNET's approved earthy palette or MAI.SPACE's customizable themes.

Core theme tokens

LightDark

Canvas

\#F5F2EF

Surface

\#FFFCF9

Raised

\#EDE7E1

Primary text

\#241D20

Secondary text

\#6B6268

Border

\#DBD3D6

### Universal accent colors

Heather

Plum

Sage

Copper

Steel

The global OS can use heather/plum as its default accent. Individual applications may override accents inside their own content areas.

## 3. Application identities

This is the most important distinction: MiraverseOSx should have a coherent visual family, not a single repeated design.

| Application     | Visual direction                       | Character                        |
| --------------- | -------------------------------------- | -------------------------------- |
| Orbit / Desktop | Heather, plum, soft neutrals           | Personal operating environment   |
| MAI.SPACE       | User-customizable, including Y2K       | Expressive social network        |
| WORKNET         | Earthy browns, beige, black raspberry  | Government and corporate         |
| DGAOS           | Steel, charcoal, restrained navy       | Investigative and administrative |
| TRACE           | Forensic neutral, technical accents    | Evidence and examination         |
| AureMail        | Warm neutrals, lavender accents        | Personal and professional email  |
| Comms           | Heather, gray, institutional accents   | Official collaboration           |
| VAULT           | Graphite, ivory, muted violet          | Files and document storage       |
| VerseNet        | Clean neutrals with contextual accents | Web and research                 |
| Cyacademy       | Muted violet, parchment, silver        | Academic and magical education   |
| Faith Medical   | Clinical teal, white, slate            | Healthcare and medical records   |
| Citizen Hub     | Blue-gray, ivory, civic neutrals       | Citizen services                 |
| AURA Registry   | Slate, indigo, metallic neutrals       | Institutional identity records   |
| Vitals          | Soft teal, muted rose, neutral         | Personal health                  |
| HOMECRAFT       | Warm stone, sand, olive                | Housing and interiors            |
| ORYN / Banking  | Charcoal, cream, subdued gold          | Finance and treasury             |
| Atlas           | Parchment, stone, dark ink             | History and archives             |
| MAI             | Soft violet, pearl, subtle luminosity  | Benevolent AI assistant          |
| Creator Studio  | Neutral canvas, configurable accent    | World creation tools             |

These app-specific palettes are proposals, except where we've already chosen a direction, such as WORKNET and MAI.SPACE.

DGAOS should retain its institutional visual identity, and TRACE should remain integrated inside DGAOS rather than reappearing as a separate desktop application.

## 4. Universal sizing standards

This is where we'll make the entire game more compact.

| Component           | Proposed standard               |
| ------------------- | ------------------------------- |
| Desktop top bar     | 42–48px                         |
| Application toolbar | 40–48px                         |
| Standard sidebar    | 220–260px                       |
| Compact sidebar     | 56–64px                         |
| Content max width   | 1,200–1,360px where appropriate |
| Modal width         | 400–640px                       |
| Card padding        | 12–16px                         |
| Standard button     | 34–38px tall                    |
| Compact button      | 28–32px tall                    |
| Input height        | 34–40px                         |
| Standard spacing    | 8px                             |
| Section spacing     | 16–24px                         |
| Card corner radius  | 6–10px                          |

### Important layout rule

Not every application should be constrained to a narrow content column.

Document editors, spreadsheets, maps, investigation workspaces, and multi-panel dashboards may need the full available window width.

Instead, individual text panels should have reasonable reading widths, while functional workspaces use space where it is valuable.

This avoids both extremes: giant empty screens and cramped productivity tools.

## 5. Typography system

The default MiraverseOSx interface should use a clean, modern sans-serif family.

| Content        | Recommended style        |
| -------------- | ------------------------ |
| OS branding    | Distinctive, understated |
| Page titles    | 22–28px semibold         |
| Panel headings | 16–18px semibold         |
| Card headings  | 14–16px medium           |
| Body text      | 13–14px                  |
| Navigation     | 12–14px                  |
| Metadata       | 11–12px                  |
| Technical data | 12–13px monospaced       |

Suggested fonts: Inter for standard interface text, DM Serif Display for selected editorial headings, and IBM Plex Mono for technical records.

Serif typography should be optional and app-specific. WORKNET may use it for major headings, but DGAOS's evidence tables and VAULT's file listings should prioritize readable sans-serif text.

## 6. Universal components

Every application should share common behavior for buttons, forms, dialogs, tabs, tooltips, and status messages.

Component examples

Primary actionSecondary More

Completed

In progress

Pending

Important feedback should be visible without covering the workspace.

### Component rules

Buttons use one consistent height within a toolbar. Inputs have persistent labels for important forms. Dialogs appear only when necessary. Destructive actions require clear confirmation.

Status indicators use text and icons in addition to color.

Hover, focus, keyboard navigation, disabled states, and loading states must remain consistent across applications.

## 7. Desktop and window system

MiraverseOSx's desktop should behave like a genuine multitasking environment.

WorkNet

Application workspace

Application content and tools appear here.

### Window rules

- Support normal, maximized, and fullscreen views.
- Preserve window position and dimensions when practical.
- Allow multiple applications to remain open.
- Display compact and consistent title bars.
- Keep window controls functional and accessible.
- Use responsive layouts when a window is resized.
- Avoid unnecessarily large minimum window sizes.
- Retain application state when switching between windows.

The desktop remains edge-to-edge, as established in your recent game update.

## 8. Document and record design

The document reader system should remain differentiated by content type.

| Record type         | Presentation                                       |
| ------------------- | -------------------------------------------------- |
| Notes               | Clean writing-paper presentation                   |
| Technical logs      | Monospaced details, timestamps, structured data    |
| Medical records     | Clinical sections and readable fields              |
| Legal forms         | Official headers, numbered fields, signature areas |
| Maps                | Interactive or illustrated geographic display      |
| Historical archives | Archival typography and document provenance        |
| Evidence files      | Case metadata, examination notes, attachments      |

This distinction supports immersion. A clinical record should not look like a personal diary, and a historical archive should not look like an ordinary technical log.

However, shared actions such as Save, Print, Export, Search, and Close should have consistent placement and behavior.

## 9. Navigation architecture

There should be three levels of navigation.

Level 1: Operating system. Orbit opens applications, manages windows, and provides system-wide utilities.

Level 2: Application. Each app has its own sections, workflows, and navigation suited to its purpose.

Level 3: Workspace. A specific case, employment position, research project, or document opens its relevant tools and records.

This prevents the common problem of placing too many unrelated functions inside one application or creating several apps for the same workflow.

The existing consolidations remain:

- TRACE stays inside DGAOS.
- WORKNET contains its civic notice and career-related functions.
- Magic practice remains inside Cyacademy.
- MAI.SPACE contains its social networking features.
- Citizen Hub and AURA Registry retain separate responsibilities.
- Service Directory remains accessible through the established integrated locations.

## 10. Interaction and motion

Animations should feel restrained and purposeful.

| Interaction        | Guideline |
| ------------------ | --------- |
| Hover feedback     | 100–150ms |
| Button transitions | 120–180ms |
| Panel transitions  | 180–240ms |
| Dialog appearance  | 160–220ms |
| Window transitions | 180–260ms |

Respect reduced-motion preferences, and avoid long animations that delay interactions.

MAI.SPACE may allow decorative animated content within user profiles, while official workplace apps should remain comparatively restrained.

## 11. Accessibility and usability

All applications should support sufficient text contrast, keyboard navigation, visible focus indicators, scalable fonts, readable error messages, and logical navigation order.

Primary workflows should be possible without precise mouse movements.

Important alerts should be understandable without relying solely on color, animation, or sound.

A setting for interface density would be especially useful across the game.

Interface density

CompactComfortable

Document Studio

WorkNet

AureMail

The density control demonstrates the proposed difference in spacing.

I recommend Compact as the default, with Comfortable available as a user preference.

## 12. Theme inheritance

Each application should have a defined relationship to the OS theme.

| Theme behavior                      | Applications                              |
| ----------------------------------- | ----------------------------------------- |
| Inherit system appearance           | General productivity apps by default      |
| Inherit light/dark, keep app colors | WORKNET, DGAOS, Cyacademy, Faith Medical  |
| User-customized appearance          | MAI.SPACE profiles                        |
| Specialized document presentation   | Archives, medical records, technical logs |

For WORKNET specifically, the approved warm earth-tone light and dark designs remain intact. Its theme changes should preserve its brand identity rather than making it generic gray.

## 13. Final design rules

MIRAVERSEOSx · UNIVERSAL STANDARD

# Consistent systems. Distinct worlds.

Compact, readable, responsive applications connected through one operating environment, each reflecting the institution, culture, or personal experience it represents.

Approved foundations preserved: The existing application architecture, WORKNET-001 through WORKNET-017 gameplay decisions, MAI.SPACE customization, connected assignments, institutional permissions, and established world systems remain unchanged.

New design proposals: Universal color tokens, exact sizing standards, typography, interface density controls, motion timings, and several application-specific palettes require your review before becoming final design canon.

Implementation status: Design only. No GitHub files have been modified.