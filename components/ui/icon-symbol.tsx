// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Newer expo-symbols versions type `name` as a union of plain SF Symbol
// strings *or* a per-platform config object ({ ios?, android?, web? }).
// Record/index keys can't be object types, so pull out just the string members.
type SFSymbolName = Extract<SymbolViewProps['name'], string>;

type IconMapping = Partial<
  Record<SFSymbolName, ComponentProps<typeof MaterialIcons>['name']>
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // 'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.up?': 'chevron-up',
  'chevron.down?': 'chevron-down',

  // ⬇️ New Additions ⬇️
  // 'gearshape.fill': 'settings',
  // 'person.fill': 'person',
  'person.2.fill': 'group',
  'bell.fill': 'notifications',
  'arrow.down.to.line': 'download',
  magnifyingglass: 'search',
  plus: 'add',
  'trash.fill': 'delete',
  'exclamationmark.triangle.fill': 'warning',
  'heart.fill': 'favorite',
  'lock.fill': 'lock',
  'mail.fill': 'mail',
  'mail.stack.fill': 'mark-email-unread',
  'phone.and.waveform.fill': 'phone-android',
  'bell.badge.fill': 'notifications-active',
  'arrow.up.right': 'north-east',
  checkmark: 'check',
  xmark: 'close',
  'xmark.circle': 'highlight-off',
  square: 'check-box-outline-blank',
  'checkmark.square.fill': 'check-box',
  camera: 'camera-alt',
  'pencil.line': 'edit',
  'graduationcap.fill': 'school',
  'calendar.badge': 'calendar-month',
  'clock.badge.fill': 'alarm-on',
  'door.left.hand.open': 'exit-to-app',
  'info.circle.fill': 'info-outline',
  'pin.fill': 'pin-drop',
  'videoprojector.fill': 'video-call',
  'folder.circle.fill': 'attachment',
  'alarm.fill': 'alarm-on',
  'doc.on.clipboard': 'content-copy',
  // Medical related
  stethoscope: 'medical-services', // Doctor (Stethoscope on iOS -> Medical Briefcase on Android)
  'pill.fill': 'local-pharmacy', // Pharmacy (Pill Capsule on iOS -> Cross Capsule on Android)
  'flask.fill': 'science',
  'creditcard.fill': 'payment',

  // Tabs
  'house.fill': 'home',
  'gearshape.fill': 'settings',
  'person.fill': 'person',
  'calendar.badge.plus': 'calendar-view-month',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  style,
  color,
}: {
  name: IconSymbolName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
