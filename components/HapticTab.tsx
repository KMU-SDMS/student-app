import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      pointerEvents="auto"
      onPressIn={(ev) => {
        if (Platform.OS === 'ios' && !Platform.isPad) {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      style={[
        props.style,
        {
          // 웹에서 탭 버튼이 더 안정적으로 작동하도록 스타일 추가
          minHeight: Platform.OS === 'ios' ? 80 : 60,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: Platform.OS === 'ios' ? 8 : 0,
          flex: 1,
          width: '50%',
          paddingHorizontal: 16,
        },
      ]}
    />
  );
}
