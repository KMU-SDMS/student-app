import { StyleSheet, ScrollView, View, Image, Platform } from 'react-native';
import { useEffect } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import CalendarWidget from '@/components/CalendarWidget';
import NoticeSection from '@/components/NoticeSection';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL as string) || '';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
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
});
