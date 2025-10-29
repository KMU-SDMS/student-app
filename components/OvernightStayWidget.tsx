import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useRouter } from 'expo-router';

export default function OvernightStayWidget() {
  const router = useRouter();
  const maxApplications = 3;
  const usedApplications = 1; // 현재 사용한 횟수 (실제로는 API에서 가져와야 함)
  const remainingApplications = maxApplications - usedApplications;

  const handlePress = () => {
    router.push('/overnight-stay');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          외박계 신청
        </ThemedText>
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>
            {remainingApplications}/{maxApplications}
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity style={styles.cardButton} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.iconContainer}>
          <ThemedText style={styles.icon}>🏠</ThemedText>
        </View>
        <View style={styles.content}>
          <ThemedText style={styles.cardTitle}>외박계 신청하기</ThemedText>
          <ThemedText style={styles.cardDescription}>
            남은 신청 횟수: {remainingApplications}회
          </ThemedText>
        </View>
        <ThemedText style={styles.arrow}>›</ThemedText>
      </TouchableOpacity>

      {remainingApplications === 0 && (
        <View style={styles.warningContainer}>
          <ThemedText style={styles.warningText}>
            ⚠️ 이번 달 신청 가능 횟수를 모두 사용했습니다
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  arrow: {
    fontSize: 28,
    opacity: 0.3,
    fontWeight: '300',
  },
  warningContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
});
