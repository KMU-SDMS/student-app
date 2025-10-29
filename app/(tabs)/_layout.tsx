import { Tabs, Link, usePathname } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Platform, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // 웹 전용 커스텀 탭 바 (아이콘 없이 레이블만, 상단 여백 확보)
  const WebTabBar = () => {
    const tabs = [
      { href: '/' as const, title: '홈', icon: 'home' as const },
      { href: '/service' as const, title: '서비스', icon: 'service' as const },
      { href: '/settings' as const, title: '설정', icon: 'settings' as const },
    ] as const;

    const renderIcon = (name: 'home' | 'service' | 'settings', color: string) => {
      const size = 24;
      if (name === 'home') {
        // 단순 홈 아이콘 (SVG)
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
            <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1-1.06 1.06l-.72-.72V19.5A2.25 2.25 0 0 1 16 21.75H8A2.25 2.25 0 0 1 5.25 19.5v-7.82l-.72.72a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" />
            <path d="M12 4.91 6.75 10.16V19.5c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-9.34L12 4.91Z" />
          </svg>
        );
      }
      if (name === 'service') {
        // 서비스 아이콘: 그리드 형태 (4개 사각형)
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
            <rect x="4" y="4" width="7" height="7" rx="1.5" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" />
            <rect x="13" y="13" width="7" height="7" rx="1.5" />
          </svg>
        );
      }
      // 설정 아이콘: 가로줄 3개(메뉴 형태)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      );
    };

    return (
      <View
        accessibilityRole="tablist"
        style={{
          backgroundColor: 'rgba(255,255,255,0.97)',
          // 콘텐츠를 위로 붙이기 위해 상단 패딩을 줄이고 하단 패딩을 늘림
          paddingTop: 6,
          paddingBottom: Math.max(14, insets.bottom),
          paddingLeft: insets.left,
          paddingRight: insets.right,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} asChild>
              <Pressable
                role="tab"
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  maxWidth: 480,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 8,
                }}
              >
                <View style={{ marginBottom: 4 }}>
                  {renderIcon(tab.icon, active ? tint : '#8E8E93')}
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: active ? tint : '#8E8E93',
                    lineHeight: 18,
                    letterSpacing: 0.2,
                  }}
                >
                  {tab.title}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
          paddingTop: 6,
          lineHeight: 22,
        },
        tabBarItemStyle: { justifyContent: 'center', alignItems: 'center' },
        // 아이콘 영역을 완전히 숨김
        tabBarIconStyle: { display: 'none', width: 0, height: 0 },
        // 하단에 붙도록 절대 위치 제거
        tabBarStyle: {
          height: 72,
          paddingTop: 10,
          paddingBottom: 12,
        },
      }}
      {...(Platform.OS === 'web' ? { tabBar: () => <WebTabBar /> } : {})}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
        }}
      />
      <Tabs.Screen
        name="service"
        options={{
          title: '서비스',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
        }}
      />
    </Tabs>
  );
}
