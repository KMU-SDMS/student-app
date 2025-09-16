import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: true,
        tabBarShowIcon: false,
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 0,
          marginTop: 0,
          textAlign: 'center',
        },
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
            height: 80,
            paddingTop: 8,
            paddingBottom: 'env(safe-area-inset-bottom, 8px)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            bottom: 0,
            left: 0,
            right: 0,
          },
          default: {
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
