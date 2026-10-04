export const MENU_OPTIONS = ["1", "2", "3", "4", "5", "8", "9"] as const;

export type MenuOption = (typeof MENU_OPTIONS)[number];

export function isMenuOption(value: string): value is MenuOption {
  return (MENU_OPTIONS as readonly string[]).includes(value);
}
