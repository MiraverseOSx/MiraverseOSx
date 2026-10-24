export const PHONE_THEMES = [
  {
    id: "twilight",
    name: "Twilight",
    description: "Soft grey, white and deep purple",
  },
  {
    id: "aureline",
    name: "Aureline",
    description: "Pearl surfaces and violet accents",
  },
  { id: "agency", name: "Agency", description: "Midnight navy and clear teal" },
] as const;

export type PhoneThemeId = (typeof PHONE_THEMES)[number]["id"];
export const DEFAULT_PHONE_THEME: PhoneThemeId = "twilight";

export function isPhoneThemeId(value: unknown): value is PhoneThemeId {
  return PHONE_THEMES.some((theme) => theme.id === value);
}
