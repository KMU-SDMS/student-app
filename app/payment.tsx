import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Clipboard,
  ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BankInfo } from '@/services/apiService';

// React Native Web 호환 아이콘 컴포넌트
interface ChevronIconProps {
  direction: 'left' | 'right';
  size?: number;
  color?: string;
  thickness?: number;
  offsetX?: number;
  offsetY?: number;
}

const ChevronIcon = ({
  direction,
  size = 10,
  color = '#000',
  thickness = 2,
  offsetX = 0,
  offsetY = 0,
}: ChevronIconProps) => {
  const baseStyle = {
    width: size,
    height: size,
    borderColor: color,
  } as const;

  const offset = size * 0.25;

  const rightStyle = {
    borderRightWidth: thickness,
    borderBottomWidth: thickness,
    transform: [
      { rotate: '-45deg' },
      { translateX: -offset },
      { translateY: -offset },
      { translateX: offsetX },
      { translateY: offsetY },
    ],
  } as const;

  const leftStyle = {
    borderLeftWidth: thickness,
    borderBottomWidth: thickness,
    transform: [
      { rotate: '45deg' },
      { translateX: offset },
      { translateY: -offset },
      { translateX: offsetX },
      { translateY: offsetY },
    ],
  } as const;

  return <View style={[baseStyle, direction === 'right' ? rightStyle : leftStyle]} />;
};

interface PaymentFee {
  id: number;
  month: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  isOverdue: boolean;
  type: string;
  bankInfo: BankInfo[];
}

// 날짜 형식 변환
const formatDateDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  } catch {
    return dateString;
  }
};

// 금액 포맷팅
const formatAmount = (amount: number): string => {
  return amount.toLocaleString() + '원';
};

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getDynamicStyles(colorScheme);
  const [fee, setFee] = useState<PaymentFee | null>(null);
  const [showCopyToast, setShowCopyToast] = useState<boolean>(false);

  useEffect(() => {
    if (params.fee) {
      try {
        const parsedFee = JSON.parse(params.fee as string) as PaymentFee;
        setFee(parsedFee);
      } catch (error) {
        console.error('관리비 데이터 파싱 오류:', error);
        Alert.alert('오류', '관리비 정보를 불러올 수 없습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      }
    } else {
      Alert.alert('오류', '관리비 정보가 없습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    }
  }, [params.fee, router]);

  const handlePaymentComplete = () => {
    Alert.alert('납부 처리 완료', '납부 완료 처리되었습니다. 홈 화면으로 이동합니다.', [
      { text: '확인', onPress: () => router.push('/') },
    ]);
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    setShowCopyToast(true);
    // 2초 후 토스트 메시지 자동 숨김
    setTimeout(() => {
      setShowCopyToast(false);
    }, 2000);
  };

  if (!fee) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
          >
            <View style={styles.backButtonCircle}>
              <ChevronIcon direction="left" size={12} color={styles.headerTitle.color as string} />
            </View>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            관리비 납부
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>관리비 정보를 불러오는 중...</Text>
        </View>
      </ThemedView>
    );
  }

  const paymentDetails = {
    amount: formatAmount(fee.amount),
    dueDate: formatDateDisplay(fee.dueDate),
  };

  const bankAccounts = fee.bankInfo.map((bank) => ({
    bank: bank.bank_name,
    number: bank.bank_number,
  }));

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* 상단 헤더 바 */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <View style={styles.backButtonCircle}>
            <ChevronIcon direction="left" size={12} color={styles.headerTitle.color as string} />
          </View>
        </TouchableOpacity>

        <ThemedText type="title" style={styles.headerTitle}>
          관리비 납부
        </ThemedText>

        <View style={styles.headerSpacer} />
      </View>

      {/* 메인 콘텐츠 */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            이번 달 관리비
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>납부 금액</ThemedText>
            <ThemedText style={[styles.value, styles.amount]}>{paymentDetails.amount}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>납부 기한</ThemedText>
            <ThemedText style={styles.value}>{paymentDetails.dueDate}</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            입금 계좌 안내
          </ThemedText>
          {bankAccounts.map((account, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => copyToClipboard(account.number)}
              style={styles.accountRow}
            >
              <ThemedText style={styles.bankName}>{account.bank}</ThemedText>
              <View style={styles.accountNumberContainer}>
                <ThemedText style={styles.accountNumber}>{account.number}</ThemedText>
                <ThemedText style={styles.copyText}>복사</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}
      >
        <TouchableOpacity style={styles.button} onPress={handlePaymentComplete}>
          <Text style={styles.buttonText}>납부 완료</Text>
        </TouchableOpacity>
      </View>

      {/* 복사 완료 토스트 메시지 */}
      {showCopyToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toast}>
            <ThemedText style={styles.toastText}>복사 완료</ThemedText>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const getDynamicStyles = (colorScheme: 'light' | 'dark') => {
  const isDarkMode = colorScheme === 'dark';

  const containerBackgroundColor = isDarkMode ? '#121212' : '#F4F5F7';
  const headerBackgroundColor = isDarkMode ? 'rgba(36, 39, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const headerBorderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const headerTextColor = isDarkMode ? '#E0E0E0' : '#000';
  const cardBackgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const cardTitleColor = isDarkMode ? '#E0E0E0' : '#333';
  const infoRowBorderColor = isDarkMode ? '#2C2C2E' : '#F0F0F0';
  const labelColor = isDarkMode ? '#B0B0B0' : '#666';
  const valueColor = isDarkMode ? '#E0E0E0' : '#333';
  const amountColor = isDarkMode ? '#0A84FF' : '#007AFF';
  const bankNameColor = isDarkMode ? '#C0C0C0' : '#555';
  const accountNumberContainerColor = isDarkMode ? '#2C2C2E' : '#F7F7F7';
  const bottomContainerBackgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const bottomContainerBorderColor = isDarkMode ? '#2C2C2E' : '#EFEFEF';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: containerBackgroundColor,
    },
    contentScroll: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
      paddingTop: 20,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: headerBackgroundColor,
      borderBottomWidth: 1,
      borderBottomColor: headerBorderColor,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '600',
      marginHorizontal: 20,
      color: headerTextColor,
    },
    headerSpacer: {
      width: 40,
    },
    backButton: {},
    backButtonCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: cardBackgroundColor,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: isDarkMode ? 0.1 : 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 10,
      color: cardTitleColor,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: infoRowBorderColor,
    },
    label: {
      fontSize: 15,
      color: labelColor,
    },
    value: {
      fontSize: 15,
      fontWeight: '500',
      color: valueColor,
    },
    amount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: amountColor,
    },
    accountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: infoRowBorderColor,
    },
    bankName: {
      fontSize: 15,
      color: bankNameColor,
    },
    accountNumberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: accountNumberContainerColor,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
    },
    accountNumber: {
      fontSize: 14,
      fontWeight: '500',
      color: valueColor,
    },
    copyText: {
      marginLeft: 8,
      fontSize: 12,
      color: amountColor,
      fontWeight: '600',
    },
    bottomContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: bottomContainerBorderColor,
      backgroundColor: bottomContainerBackgroundColor,
    },
    button: {
      backgroundColor: amountColor,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      fontSize: 14,
      opacity: 0.7,
      color: headerTextColor,
    },
    toastContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      pointerEvents: 'none',
    },
    toast: {
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.8)',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toastText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
  });
};
