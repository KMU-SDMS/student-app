import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useRouter } from 'expo-router';
import { getOvernightStayHistory, OvernightStaySummary, OvernightStayItem } from '@/services/apiService';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function OvernightStayWidget() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const maxApplications = 3;
  const [summary, setSummary] = useState<OvernightStaySummary | null>(null);
  const [history, setHistory] = useState<OvernightStayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getOvernightStayHistory();
        if (response) {
          if (response.summary) {
            setSummary(response.summary);
          }
          if (response.data) {
            // 필터링: pending은 항상 표시, approved는 종료일이 오늘 이후인 것만
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const filtered = response.data.filter((item) => {
              if (item.status === 'pending') {
                return true;
              }
              if (item.status === 'approved') {
                const endDate = new Date(item.endDate);
                endDate.setHours(0, 0, 0, 0);
                return endDate >= today;
              }
              return false;
            });
            
            setHistory(filtered);
          }
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

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  // 상태별 색상 및 텍스트
  const getStatusStyle = (status: string) => {
    const isDarkMode = colorScheme === 'dark';
    switch (status) {
      case 'pending':
        return {
          backgroundColor: isDarkMode ? '#3A2F1F' : '#FFF4E6',
          textColor: isDarkMode ? '#FFD700' : '#D97706',
          label: '대기 중',
        };
      case 'approved':
        return {
          backgroundColor: isDarkMode ? '#1F3A1F' : '#ECFDF5',
          textColor: isDarkMode ? '#90EE90' : '#059669',
          label: '승인됨',
        };
      default:
        return {
          backgroundColor: isDarkMode ? '#3A1F1F' : '#FDECEC',
          textColor: isDarkMode ? '#FF6B6B' : '#DC2626',
          label: '거부됨',
        };
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

      {/* 신청 내역 */}
      {!isLoading && history.length > 0 && (
        <View style={styles.historyContainer}>
          <ThemedText type="subtitle" style={styles.historyTitle}>
            신청 내역
          </ThemedText>
          {history.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyItemHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <ThemedText style={[styles.statusText, { color: statusStyle.textColor }]}>
                      {statusStyle.label}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.historyDate}>
                    {formatDate(item.startDate)} ~ {formatDate(item.endDate)}
                  </ThemedText>
                </View>
                <ThemedText style={styles.historyReason} numberOfLines={1}>
                  {item.reason}
                </ThemedText>
              </View>
            );
          })}
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
  historyContainer: {
    marginTop: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  historyItem: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  historyReason: {
    fontSize: 13,
    opacity: 0.8,
  },
});
