// theme/types.ts
export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceCard: string;
    surfaceCardLight: string;
    surfaceCardBlue: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    buttonText: string;
    primary: {
      shallow: string,
      mid: string,
      base: string,
      deep: string,
      extraDeep: string,
    };
    border: string;
    danger: string;
    success: string;
    purple: {
      base: string;
      mid: string;
      deep: string;
      extraDeep: string;
    }
  };
  spacing: typeof import('./tokens').spacing;
  radius: typeof import('./tokens').radius;
  typography: typeof import('./tokens').typography;
}