import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useRouter } from 'expo-router';
import { getBills, BillResponse, BankInfo } from '@/services/apiService';

interface MaintenanceFee {
  id: number;
  month: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  isOverdue: boolean;
  type: string;
  bankInfo: BankInfo[];
}

// 관리비 타입을 한글로 변환
const getTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    water: '수도세',
    electricity: '전기세',
    gas: '가스비',
  };
  return typeMap[type] || type;
};

// 날짜 형식 변환 및 월 추출
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월`;
  } catch {
    return dateString;
  }
};

// 날짜가 지났는지 확인
const isOverdue = (endDate: string): boolean => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(endDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  } catch {
    return false;
  }
};

// API 응답을 MaintenanceFee로 변환
const transformBillToFee = (bill: BillResponse): MaintenanceFee => {
  const month = formatDate(bill.endDate);
  const typeLabel = getTypeLabel(bill.type);

  return {
    id: bill.id,
    month: `${month} ${typeLabel}`,
    amount: bill.amount,
    dueDate: bill.endDate,
    isPaid: bill.is_paid,
    isOverdue: isOverdue(bill.endDate),
    type: bill.type,
    bankInfo: bill.bankInfo,
  };
};

export default function MaintenancePayment() {
  const router = useRouter();
  const [fees, setFees] = useState<MaintenanceFee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const bills = await getBills();
      const transformedFees = bills.map(transformBillToFee);
      setFees(transformedFees);
    } catch (err) {
      console.error('관리비 조회 오류:', err);
      setError('관리비를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // 납부 완료 이벤트 리스너 등록
  useEffect(() => {
    const handlePaymentComplete = () => {
      fetchBills();
    };

    // 웹 환경
    if (typeof window !== 'undefined') {
      window.addEventListener('billPaymentComplete', handlePaymentComplete);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('billPaymentComplete', handlePaymentComplete);
      }
    };
  }, [fetchBills]);

  const hasFees = fees.length > 0;

  const handlePayment = (fee: MaintenanceFee) => {
    // 결제 화면으로 이동
    router.push({
      pathname: '/payment',
      params: {
        fee: JSON.stringify(fee),
      },
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            관리비 납부
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <ThemedText style={styles.loadingText}>관리비를 불러오는 중...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            관리비 납부
          </ThemedText>
        </View>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + '원';
  };

  const getButtonText = (fee: MaintenanceFee) => {
    if (fee.isPaid) return '납부 완료';
    return '납부하기';
  };

  if (!hasFees) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            관리비 납부
          </ThemedText>
        </View>
        <View style={styles.noFeesContainer}>
          <ThemedText style={styles.noFeesIcon}>✅</ThemedText>
          <ThemedText style={styles.noFeesText}>관리비 내역이 없습니다</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          관리비 납부
        </ThemedText>
      </View>

      <View style={styles.feeList}>
        {fees.map((fee) => (
          <View key={fee.id} style={styles.feeItem}>
            <View style={styles.feeInfo}>
              <ThemedText style={styles.feeMonth}>{fee.month}</ThemedText>
              <ThemedText style={styles.feeAmount}>{formatAmount(fee.amount)}</ThemedText>
              <ThemedText style={styles.dueDate}>
                납부기한: {fee.dueDate.split('T')[0]}
                {fee.isOverdue && <Text style={styles.overdueText}> (연체)</Text>}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.payButton, fee.isPaid && styles.completedButton]}
              onPress={() => handlePayment(fee)}
            >
              <Text style={[styles.payButtonText, fee.isPaid && styles.completedButtonText]}>
                {getButtonText(fee)}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 0,
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
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noFeesContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noFeesIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noFeesText: {
    opacity: 0.7,
    fontSize: 14,
  },
  feeList: {
    gap: 12,
  },
  feeItem: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeInfo: {
    flex: 1,
    marginRight: 12,
  },
  feeMonth: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completedButton: {
    backgroundColor: '#34C759',
  },
  payButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completedButtonText: {
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    opacity: 0.7,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    opacity: 0.8,
  },
  overdueText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});
