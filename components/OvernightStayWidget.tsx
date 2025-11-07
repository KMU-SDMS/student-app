import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useRouter } from 'expo-router';
import { getOvernightStayHistory, OvernightStaySummary } from '@/services/apiService';

export default function OvernightStayWidget() {
  const router = useRouter();
  const maxApplications = 3;
  const [summary, setSummary] = useState<OvernightStaySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getOvernightStayHistory();
        if (response?.summary) {
          setSummary(response.summary);
        }
      } catch (error) {
        console.error('Failed to fetch overnight stay summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const remainingApplications = summary?.remainingCount ?? 0;
  const isDisabled = remainingApplications === 0;

  const handlePress = () => {
    if (!isDisabled) {
      router.push('/overnight-stay');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          외박계 신청
        </ThemedText>
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <View style={[styles.badge, isDisabled && styles.badgeDisabled]}>
            <ThemedText style={styles.badgeText}>
              {remainingApplications}/{maxApplications}
            </ThemedText>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.cardButton, isDisabled && styles.cardButtonDisabled]}
        onPress={handlePress}
        activeOpacity={isDisabled ? 1 : 0.7}
        disabled={isDisabled}
      >
        <View style={[styles.iconContainer, isDisabled && styles.iconContainerDisabled]}>
          <ThemedText style={styles.icon}>🏠</ThemedText>
        </View>
        <View style={styles.content}>
          <ThemedText style={[styles.cardTitle, isDisabled && styles.cardTitleDisabled]}>
            외박계 신청하기
          </ThemedText>
          <ThemedText style={[styles.cardDescription, isDisabled && styles.cardDescriptionDisabled]}>
            {isLoading
              ? '로딩 중...'
              : isDisabled
                ? '신청 가능 횟수를 모두 사용했습니다'
                : `남은 신청 횟수: ${remainingApplications}회`}
          </ThemedText>
        </View>
        <ThemedText style={[styles.arrow, isDisabled && styles.arrowDisabled]}>›</ThemedText>
      </TouchableOpacity>

      {isDisabled && !isLoading && (
        <View style={styles.warningContainer}>
          <ThemedText style={styles.warningText}>
            ⚠️ 이번 학기 신청 가능 횟수를 모두 사용했습니다
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
  badgeDisabled: {
    backgroundColor: '#999',
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
  cardButtonDisabled: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
  cardTitleDisabled: {
    opacity: 0.5,
  },
  cardDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  cardDescriptionDisabled: {
    opacity: 0.4,
  },
  arrow: {
    fontSize: 28,
    opacity: 0.3,
    fontWeight: '300',
  },
  arrowDisabled: {
    opacity: 0.15,
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
