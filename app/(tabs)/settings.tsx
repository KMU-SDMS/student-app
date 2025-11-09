import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import NotificationPermission from '@/components/NotificationPermission';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { updateSubscriptionStatus } from '@/services/apiService';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL as string;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getDynamicStyles(colorScheme);

  const handleLogout = async () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      Alert.alert('알림', '현재 웹 전용 기능입니다.');
      return;
    }

    const confirmed = window.confirm('로그아웃 하시겠습니까?');
    if (!confirmed) return;

    // 로그인 URL로 보내기 전에 백엔드 구독 상태 비활성화
    try {
      await updateSubscriptionStatus(false);
      console.log('구독 상태 비활성화 완료');
    } catch (error) {
      console.error('구독 상태 비활성화 오류:', error);
      // 오류가 발생해도 로그아웃은 진행
    }

    // 로그인과 동일한 방식으로 서버의 /auth/logout으로 리다이렉트
    // redirect 파라미터로 로그아웃 후 이동할 페이지 지정
    const redirect = new URL('/auth', window.location.origin).toString();
    window.location.href = `${API_BASE}/auth/logout?redirect=${encodeURIComponent(redirect)}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={[styles.content, { paddingTop: insets.top + 20 }]}>
        <ThemedView style={styles.headerSection}>
          <ThemedText type="title" style={styles.headerTitle}>
            설정
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>알림 및 앱 설정을 관리합니다</ThemedText>
        </ThemedView>

        <View style={styles.sectionContainer}>
          <NotificationPermission showTitle={true} compact={false} />
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const getDynamicStyles = (colorScheme: 'light' | 'dark') => {
  const isDarkMode = colorScheme === 'dark';
  const logoutButtonBg = isDarkMode ? '#3A1F1F' : '#FDECEC';
  const logoutButtonText = isDarkMode ? '#FF6B6B' : '#DC2626';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
    },
    headerSection: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    headerTitle: {
      marginBottom: 8,
    },
    headerSubtitle: {
      opacity: 0.7,
    },
    sectionContainer: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    logoutButton: {
      backgroundColor: logoutButtonBg,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? '#6B2B2B' : '#F5C2C7',
    },
    logoutButtonText: {
      color: logoutButtonText,
      fontSize: 16,
      fontWeight: '600',
    },
  });
};
