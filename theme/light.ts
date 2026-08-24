// theme/light.ts
import { palette, radius, spacing, typography } from './tokens';
import { Theme } from './types';

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: palette.light.background,
    surface: palette.light.surface,
    surfaceCard: palette.light.card,
    surfaceCardLight: palette.light.cardLight,
    surfaceCardBlue: palette.light.cardBlue,
    text: palette.light.text.primary,
    buttonText: palette.light.buttonText,
    textSecondary: palette.light.text.medium,
    textMuted: palette.light.text.muted,
    primary: {
      shallow: palette.light.primary.shallow,
      base: palette.light.primary.base,
      mid: palette.light.primary.mid,
      deep: palette.light.primary.deep,
      extraDeep: palette.light.primary.extraDeep,
    },
    border: palette.light.border,
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