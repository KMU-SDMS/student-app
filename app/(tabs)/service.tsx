import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
// TODO: API 연동 및 기능 구현 예정
// import MaintenancePayment from '@/components/MaintenancePayment';
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
        {/* <MaintenancePayment /> */}
        <ThemedView style={styles.maintenanceContainer}>
          <View style={styles.maintenanceHeader}>
            <ThemedText type="subtitle" style={styles.maintenanceTitle}>
              관리비 납부
            </ThemedText>
          </View>
          <View style={styles.maintenanceComingSoon}>
            <ThemedText style={styles.comingSoonText}>현재 준비 중입니다.</ThemedText>
          </View>
        </ThemedView>

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
  maintenanceContainer: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 8,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  maintenanceTitle: {
    fontWeight: '600',
  },
  maintenanceComingSoon: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  comingSoonText: {
    opacity: 0.7,
    fontSize: 14,
  },
});
