# WORKNET visual specification — October 24, 2026

User-approved specification. This supersedes earlier tentative color and appearance guidance in worknet-design.md. The game’s authored assignments and compensation remain authoritative over illustrative reference copy.

1. Design identity
WORKNET is a modern government and corporate employment platform within Meridion.

The approved visual identity combines dark, earthy neutrals; rich reddish-brown accents; warm beige surfaces; and sophisticated editorial typography.

It should feel like a premium professional application used by government institutions, corporate employers, researchers, investigators, and other working citizens.

Design principles
- Professional without appearing cold or sterile.
- Elegant without excessive decoration.
- Modern, not nostalgic or Y2K.
- Warm and atmospheric while remaining functional.
- Dense enough for meaningful work, but never visually overwhelming.
- Consistent across employers while allowing institutional branding.
The light and dark themes are equally important. Neither should feel like an afterthought.
2. Official color palette
These colors come directly from your selected references.
Primary earthy palette
Black Raspberry

#16110B

Deepest backgrounds, text, strong contrast

Black Slug

#381E11

Brand surfaces, navigation, dark brown emphasis

Moussaka

#6B2F10

Primary actions and prominent highlights

Earth Black

#4A463B

Secondary dark surfaces and borders

Resort Tan

#8E7A66

Muted interface details and secondary text

Carrageen Moss

#8F5C32

Bronze accents, icons, selected states

Façade

#B5A391

Warm neutrals, surfaces, typography


Secondary palette

Distinctive Lack of Hue

#141714



Black Powder

#36362A



Baby Bear

#6E5B43



Roasted Coconut

#AA8C73



Arterial

#761518



Color hierarchy: Black Raspberry establishes depth; Façade and Roasted Coconut introduce warmth; Moussaka and Carrageen Moss carry the brand; Arterial is reserved for meaningful danger or urgent status.

Avoid using red merely as decoration.
3. Light theme
The light interface should resemble warm paper, polished stone, and a refined administrative workspace.
FEDERAL CAREER NETWORK
WorkNet



Opportunities

Workplace

Career Record


MISSION · SYSTEMS ENGINEERING
Subway Node Terminal Diagnostic & Circuit Repair
Glassline District · Terminal Junction 12
230 credits
Review assignment 




Light-theme design tokens
Element	Color
Main background	#F5F0EA
Cards and panels	#FFFCF8
Alternate surface	#EAE0D6
Main text	#16110B
Secondary text	#6E5B43
Borders	#DED1C5
Primary buttons	#6B2F10
Interactive accents	#8F5C32
Selected background	#F1DFD1

These supplementary neutrals are derived from the approved palette to create readable interface surfaces.
4. Dark theme
The dark theme should feel luxurious, grounded, and serious without becoming completely black everywhere.
FEDERAL CAREER NETWORK
WorkNet



Opportunities

Workplace

Career Record


MISSION · SYSTEMS ENGINEERING
Subway Node Terminal Diagnostic & Circuit Repair
Glassline District · Terminal Junction 12
230 credits
Review assignment 




Dark-theme design tokens
Element	Color
Main background	#141714
Navigation background	#16110B
Panel background	#25241E
Raised surfaces	#36362A
Main text	#F3E7DA
Secondary text	#C7B7A5
Borders	#51483E
Primary buttons	#8F5C32
Interactive accents	#D6A17A
Selected background	#38271F

Dark mode should avoid pure white body text and excessive bright orange. Warm neutral typography is more consistent with the visual direction.
5. Typography
WORKNET should use a combination of elegant serif headings and modern sans-serif interface text.
DISPLAY TYPOGRAPHY
Find your next chapter.
Editorial headings for primary screens and important assignments.

INTERFACE TYPOGRAPHY
Professional Assignments
Review responsibilities, employment terms, requirements, and deliverables.


SYSTEM LABELS AND METADATA

DEPARTMENT / LOCATION / STATUS / COMPENSATION


Recommended font families:
Use	Suggested fonts
Branding and hero headings	DM Serif Display or Libre Baskerville
Section headings	Libre Baskerville or a semibold sans-serif
Body text and navigation	Inter
Tables and forms	Inter
Technical identifiers	IBM Plex Mono

Serif fonts should create hierarchy, not dominate forms, navigation, tables, or technical documents.
Type scale
Element	Desktop size
Main page heading	32–40px
Assignment title	28–36px
Section heading	18–22px
Card title	15–17px
Body text	14–16px
Navigation	13–14px
Metadata	11–12px

Body copy should remain comfortably readable, especially in complex investigation and employment workflows.
6. Layout and spacing
WORKNET retains its two-panel opportunities browser.
Global header · Branding, navigation, credits, notifications

Opportunity list
Search + filters

Selected opportunity

Additional listings



Assignment details
Title, employer, location

Description, requirements, objectives

Primary action





Layout specifications
Element	Guideline
Header	Approximately 64–76px
Left browser panel	30–35% of content width
Main detail panel	65–70%
Standard spacing	8px system
Card padding	16–24px
Section spacing	24–32px
Corner radius	6–12px
Border thickness	1px
Shadows	Very subtle, more prominent in light mode

Avoid excessive empty space, oversized cards, unnecessary gradients, or decorative panels that reduce usable space.
7. Buttons and interactive elements
Button hierarchy
Primary action

Secondary action

Outline action



Buttons should be rectangular with gently rounded corners, never overly pill-shaped by default.

Use consistent hover, active, focus, loading, and disabled states. Focus indicators must remain visible in both themes.

Forms should have clear labels, restrained borders, adequate padding, and visible validation messages.
8. Status and feedback colors
Status colors should communicate meaning rather than simply decorate the interface.
Status	Suggested treatment
Available	Neutral bronze or muted accent
In progress	Copper or warm amber
Completed	Muted green with a check icon
Pending review	Taupe with a clock icon
Revision required	Strong amber with an edit icon
Urgent	Arterial red #761518 with an alert icon
Restricted	Neutral charcoal with a lock icon

Do not rely on color alone. Pair every important status with readable text and, where helpful, an icon.
9. Institutional branding rules
The shared WORKNET design always remains dominant.

Each employer may supply its name, official emblem, department description, and limited accent styling.

For example, DGA may introduce navy accents; Faith Medical may use clinical teal; and Cyacademy may use muted violet.

However, institution-specific branding should not overwrite WORKNET's base layout, typography rules, navigation, or accessibility standards.

When switching workplaces, the active emblem and contextual accent may change, while the main shell remains consistent.
10. Iconography and imagery
Icons: Use minimal, consistent outline icons for navigation, departments, documents, work orders, notifications, and statuses. Avoid exaggerated 3D or decorative gaming icons.

Imagery: Photographs and illustrations can appear in opportunity cards and assignment headers when they show relevant locations, buildings, workplaces, or equipment.

The subway assignment, for instance, may show Terminal Junction 12. A medical opportunity might display a clinical facility.

Images should provide context and atmosphere rather than serve as unnecessary decoration. Important information must remain available without them.
11. Light and dark mode behavior
Both themes should share identical navigation, spacing, components, and workflows.

Only the visual tokens change.

The application should support a user-selected Light, Dark, or System appearance where practical. If WORKNET inherits the operating system's appearance, it should still preserve this distinct earthy palette.

Theme switching should not reset the current workplace, selected assignment, form entries, or active workflow.