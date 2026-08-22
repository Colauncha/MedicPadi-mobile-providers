/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },

  primary: {
    50: '#f3f4ff',
    100: '#e9eafe',
    200: '#d5d9ff',
    300: '#b3b6ff',
    400: '#8989fc',
    500: '#6159f9',
    600: '#4b36f1',
    700: '#3d24dd',
    800: '#331eb9',
    900: '#2b1a98',
    950: '#140c5e',
  },
  purple: {
    50: '#f7f7fb',
    100: '#f1eff8',
    200: '#e6e2f2',
    300: '#d2cbe7',
    400: '#b4a6d5',
    500: '#a08bc7',
  },
  green: {
    50: '#f3f9f4',
    100: '#e9f3e6',
    200: '#d5e6d0',
    300: '#b3d9b3',
    400: '#a3d9a5',
    500: '#47a052',
    600: '#36833f',
    700: '#317039',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  warning: '#f98007',
  warn: {
    100: '#fef3e5',
    200: '#fcd9b3',
    300: '#fbbf80',
    400: '#fa9e4d',
    500: '#f98007',
    600: '#c96a06',
  },
  danger: '#e5334b',
  error: {
    100: '#fef3f4',
    200: '#fcd9dc',
    300: '#fbbfc1',
    400: '#fa9ea3',
    500: '#e5334b',
    600: '#c42a3e',
  },
  background: '#fcfcfc',
  card: '#f7f7fb',
  cardLight: '#f3f4ff',
  cardBlue: '#e9eafe',
  text: {
    primary: '#121212',
    dark: '#3d3d3d',
    medium: '#464646',
    light: '#888888',
    muted: '#b0b0b0',
    white: '#fcfcfc',
  },
  border: '#e7e7e7',
  white: '#ffffff',
  gold: '#ffd888',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
