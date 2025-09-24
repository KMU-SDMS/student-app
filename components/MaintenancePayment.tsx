import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useRouter } from 'expo-router';

interface MaintenanceFee {
  id: number;
  month: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  isOverdue: boolean;
}

const mockMaintenanceFees: MaintenanceFee[] = [
  {
    id: 1,
    month: '2025년 9월 전기세',
    amount: 30000,
    dueDate: '2025-09-31',
    isPaid: false,
    isOverdue: true,
  },
  {
    id: 2,
    month: '2025년 9월 가스비',
    amount: 120000,
    dueDate: '2025-09-15',
    isPaid: false,
    isOverdue: false,
  },
  {
    id: 3,
    month: '2025년 8월 수도세',
    amount: 10000,
    dueDate: '2025-8-31',
    isPaid: true,
    isOverdue: false,
  },
];

export default function MaintenancePayment() {
  const router = useRouter();
  const allFees = mockMaintenanceFees;
  const hasFees = allFees.length > 0;

  const handlePayment = (fee: MaintenanceFee) => {
    if (fee.isPaid) return; // 이미 납부 완료된 경우 무시

    // 결제 화면으로 이동
    router.push({
      pathname: '/payment',
      params: {
        fee: JSON.stringify(fee),
      },
    });
  };

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
        {allFees.map((fee) => (
          <View key={fee.id} style={styles.feeItem}>
            <View style={styles.feeInfo}>
              <ThemedText style={styles.feeMonth}>{fee.month}</ThemedText>
              <ThemedText style={styles.feeAmount}>{formatAmount(fee.amount)}</ThemedText>
              <ThemedText style={styles.dueDate}>납부기한: {fee.dueDate}</ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.payButton, fee.isPaid && styles.completedButton]}
              onPress={() => handlePayment(fee)}
              disabled={fee.isPaid}
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
});
