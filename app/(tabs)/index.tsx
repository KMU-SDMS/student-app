import { StyleSheet, ScrollView, View, Image, Platform, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import CalendarWidget from '@/components/CalendarWidget';
import NoticeSection from '@/components/NoticeSection';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL as string) || '';

// React Native Web 호환 아이콘 컴포넌트
interface ChevronIconProps {
  direction: 'left' | 'right';
  size?: number;
  color?: string;
  thickness?: number;
}

const ChevronIcon = ({ direction, size = 10, color = '#000', thickness = 2 }: ChevronIconProps) => {
  const baseStyle = {
    width: size,
    height: size,
    borderColor: color,
  } as const;

  const offset = size * 0.25;

  const rightStyle = {
    borderRightWidth: thickness,
    borderBottomWidth: thickness,
    transform: [{ rotate: '-45deg' }, { translateX: -offset }, { translateY: -offset }],
  } as const;

  const leftStyle = {
    borderLeftWidth: thickness,
    borderBottomWidth: thickness,
    transform: [{ rotate: '45deg' }, { translateX: offset }, { translateY: -offset }],
  } as const;

  return <View style={[baseStyle, direction === 'right' ? rightStyle : leftStyle]} />;
};

// 종 모양 아이콘 컴포넌트 (웹 호환 - SVG 사용)
const BellIcon = ({ size = 24, color }: { size?: number; color?: string }) => {
  const iconColor = color || '#000';

  if (Platform.OS === 'web') {
    // 웹에서는 SVG 직접 사용 (폰트 로드 문제 없음)
    // React Native Web에서는 웹 컴포넌트를 직접 사용 가능
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.89 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
          fill={iconColor}
        />
      </svg>
    ) as any;
  }

  // 네이티브에서는 MaterialIcons 사용
  const MaterialIcons = require('@expo/vector-icons/MaterialIcons').default;
  return <MaterialIcons name="notifications" size={size} color={iconColor} />;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const dynamicStyles = getDynamicStyles(colorScheme);

  // 헤더 높이 계산: 안전 영역 + 패딩 + 아이콘 높이 + 패딩
  const headerHeight = insets.top + 16 + 28 + 16;

  // 세션 체크: 401이면 /auth로 리다이렉트
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const controller = new AbortController();

    const checkSession = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/calendar`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });
        if (resp.status === 401) {
          window.location.replace('/auth');
          return;
        }
      } catch (error) {
        // 네트워크 오류 등은 무시 (이미 로드된 페이지는 유지)
        console.error('Session check failed:', error);
      }
    };

    checkSession();
    return () => controller.abort();
  }, []);

  return (
    <View style={styles.container}>
      {/* 상단 바 (고정) */}
      <View style={[dynamicStyles.headerBar, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <Image source={require('../../icon.png')} style={styles.appIcon} resizeMode="contain" />
          <ThemedText type="title" style={dynamicStyles.headerTitleLeft}>
            제2정릉 생활관
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/notifications' as any)}
          style={styles.notificationButton}
          accessibilityRole="button"
          accessibilityLabel="알림 내역 보기"
        >
          <BellIcon size={24} color={dynamicStyles.headerTitleLeft.color as string} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight, paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.content}>
          {/* 공지사항 섹션 */}
          <NoticeSection />

          {/* 캘린더 위젯 */}
          <CalendarWidget />
        </ThemedView>
      </ScrollView>
    </View>
  );
}

const getDynamicStyles = (colorScheme: 'light' | 'dark') => {
  const isDarkMode = colorScheme === 'dark';

  const headerBackgroundColor = isDarkMode ? 'rgba(36, 39, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const headerBorderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const headerTextColor = isDarkMode ? '#E0E0E0' : '#000';

  return StyleSheet.create({
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: headerBackgroundColor,
      borderBottomWidth: 1,
      borderBottomColor: headerBorderColor,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    headerTitleLeft: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 10,
      color: headerTextColor,
    },
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
