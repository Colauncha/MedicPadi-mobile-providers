// theme/dark.ts
import { palette, radius, spacing, typography } from './tokens';
import { Theme } from './types';

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: palette.dark.background,
    surface: palette.dark.card,
    surfaceCard: palette.dark.card,
    surfaceCardLight: palette.dark.cardLight,
    surfaceCardBlue: palette.dark.cardBlue,
    text: palette.dark.text.primary,
    buttonText: palette.dark.buttonText,
    textSecondary: palette.dark.text.medium,
    textMuted: palette.dark.text.muted,
    primary: {
      shallow: palette.dark.primary.shallow,
      base: palette.dark.primary.base,
      mid: palette.dark.primary.mid,
      deep: palette.dark.primary.deep,
      extraDeep: palette.dark.primary.extraDeep,
    },
    border: palette.dark.border,
    danger: palette.danger,
    success: palette.green,
    purple: {
      base: palette.purple.base,
      mid: palette.purple.mid,
      deep: palette.purple.deep,
      extraDeep: palette.purple.extraDeep,
    },
  },
  spacing,
  radius,
  typography,
}; 