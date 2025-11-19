import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
// TODO: API 연동 및 기능 구현 예정
import MaintenancePayment from '@/components/MaintenancePayment';
import OvernightStayWidget from '@/components/OvernightStayWidget';
import RepairRequestWidget from '@/components/RepairRequestWidget';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ServiceScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={[styles.content, { paddingTop: insets.top + 20 }]}>
        <ThemedView style={styles.headerSection}>
          <ThemedText type="title" style={styles.headerTitle}>
            서비스
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            다양한 기숙사 서비스를 이용하실 수 있습니다
          </ThemedText>
        </ThemedView>

        {/* 관리비 납부 섹션 */}
        {/* TODO: API 연동 및 기능 구현 예정 */}
        <MaintenancePayment />

        {/* 외박계 신청 섹션 */}
        <OvernightStayWidget />

        {/* 수리 요구 섹션 */}
        <RepairRequestWidget />
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
});
