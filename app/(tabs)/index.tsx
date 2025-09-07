import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import CalendarWidget from '@/components/CalendarWidget';
import NoticeSection from '@/components/NoticeSection';
import MaintenancePayment from '@/components/MaintenancePayment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 60 }]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={[styles.content, { paddingTop: insets.top + 20 }]}>
        {/* 환영 메시지 */}
        <ThemedView style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            안녕하세요! 👋
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            스마트 기숙사 시스템에 오신 것을 환영합니다
          </ThemedText>
        </ThemedView>

        {/* 캘린더 위젯 */}
        <CalendarWidget />

        {/* 공지사항 섹션 */}
        <NoticeSection />

        {/* 관리비 납부 섹션 */}
        <MaintenancePayment />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
});
