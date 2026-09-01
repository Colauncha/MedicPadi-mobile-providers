import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

// import { PlatformPressable } from '@react-navigation/elements';
// import * as Haptics from 'expo-haptics';
// import React from 'react';

// export function HapticTab(props: any) {
//   return (
//     <PlatformPressable
//       {...props}
//       style={(pressed: Event) => [
//         props.style,
//         {
//           borderRadius: 999,
//           overflow: 'hidden',
//           opacity: pressed ? 0.7 : 1,
//         },
//       ]}
//       onPressIn={(ev) => {
//         if (process.env.EXPO_OS === 'ios') {
//           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//         }

//         props.onPressIn?.(ev);
//       }}
//     />
//   );
// }
