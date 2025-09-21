import { Tabs, Link, usePathname } from 'expo-router';
import React from 'react';
import { Platform, ViewStyle, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // 웹 전용 커스텀 탭 바
  const WebTabBar = () => {
    const tabs = [
      { href: '/' as const, title: '홈' },
      { href: '/scan' as const, title: '스캔' },
    ] as const;

    return (
      <View
        accessibilityRole="tablist"
        style={{
          pointerEvents: 'box-none',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 0, 0, 0.1)',
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          bottom: 0,
          left: 0,
          right: 0,
          position: 'absolute',
        }}
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} asChild>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) => ({
                  backgroundColor: 'transparent',
                  borderRadius: 0,
                  minHeight: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  flex: 1,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: isActive ? Colors[colorScheme ?? 'light'].tint : '#8E8E93',
                    fontSize: 16,
                    fontWeight: '600',
                    marginBottom: 0,
                    marginTop: 0,
                    textAlign: 'center',
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
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 0,
          marginTop: 0,
          textAlign: 'center',
        },
        tabBarStyle: Platform.select<ViewStyle>({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            pointerEvents: 'box-none',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
            height: 80,
            paddingTop: 8,
            paddingBottom: 8 + insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            bottom: 0,
            left: 0,
            right: 0,
          },
          default: {
            pointerEvents: 'box-none',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
            height: 60,
            paddingTop: 8,
            paddingBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            bottom: 0,
            left: 0,
            right: 0,
          },
        }),
      }}
      {...(Platform.OS === 'web' ? { tabBar: () => <WebTabBar /> } : {})}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: () => null,
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 0,
            marginTop: 0,
          },
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '스캔',
          tabBarIcon: () => null,
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 0,
            marginTop: 0,
          },
        }}
      />
      {/* Explore 탭 제거 */}
    </Tabs>
  );
}
