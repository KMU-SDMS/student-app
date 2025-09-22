import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  // 하단 탭 네비게이션은 배포에서 사용하지 않으므로 주석 처리/비활성화합니다.
  // 아래는 기존 커스텀 탭 바 및 스타일 코드로, 필요 시 복원할 수 있도록 남겨둡니다.
  /*
  // 웹 전용 커스텀 탭 바
  const WebTabBar = () => { ... };

  <Tabs
    screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      tabBarInactiveTintColor: '#8E8E93',
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarBackground: TabBarBackground,
      tabBarShowLabel: true,
      tabBarLabelStyle: { ... },
      tabBarStyle: Platform.select<ViewStyle>({ ios: { ... }, default: { ... } })
    }}
    {...(Platform.OS === 'web' ? { tabBar: () => <WebTabBar /> } : {})}
  >
  */

  // 실제 렌더: 탭 바를 완전히 숨깁니다.
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          // 탭 바 숨김 유지
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '스캔',
          // 탭 바 숨김 유지
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
