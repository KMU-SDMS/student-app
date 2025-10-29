import React from 'react';
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
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

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

// 임시 데이터
const paymentDetails = {
  issueDate: '2025년 9월 5일',
  amount: '30000원',
  dueDate: '2025년 9월 31일',
};

const bankAccounts = [
  { bank: '하나은행', number: '123-456789-01234' },
  { bank: '국민은행', number: '456-789012-34567' },
  { bank: '신한은행', number: '789-012345-67890' },
];

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getDynamicStyles(colorScheme);

  const handlePaymentComplete = () => {
    Alert.alert('납부 처리 완료', '납부 완료 처리되었습니다. 홈 화면으로 이동합니다.', [
      { text: '확인', onPress: () => router.push('/') },
    ]);
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('계좌번호 복사', `${text}가 클립보드에 복사되었습니다.`);
  };

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
            <ThemedText style={styles.label}>청구일</ThemedText>
            <ThemedText style={styles.value}>{paymentDetails.issueDate}</ThemedText>
          </View>
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
  });
};
