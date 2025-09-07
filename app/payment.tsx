import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Clipboard, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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

  const handlePaymentComplete = () => {
    Alert.alert(
      "납부 처리 완료",
      "납부 완료 처리되었습니다. 홈 화면으로 이동합니다.",
      [
        { text: "확인", onPress: () => router.push('/') }
      ]
    );
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("계좌번호 복사", `${text}가 클립보드에 복사되었습니다.`);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { top: insets.top + 10 }]}>
        <View style={styles.backButtonCircle}>
            <Text style={styles.backButtonText}>‹</Text>
        </View>
      </TouchableOpacity>

      {/* 메인 콘텐츠 */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>관리비 납부</ThemedText>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>이번 달 관리비</ThemedText>
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
          <ThemedText type="subtitle" style={styles.cardTitle}>입금 계좌 안내</ThemedText>
          {bankAccounts.map((account, index) => (
            <TouchableOpacity key={index} onPress={() => copyToClipboard(account.number)} style={styles.accountRow}>
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
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <TouchableOpacity style={styles.button} onPress={handlePaymentComplete}>
          <Text style={styles.buttonText}>납부 완료</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 64, // 뒤로가기 버튼과 제목을 위한 공간 확보
  },
  title: {
    textAlign: 'center',
    marginBottom: 24, // 제목과 카드 사이의 여백
  },
  backButton: {
      position: 'absolute',
      left: 20,
      zIndex: 1,
  },
  backButtonCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  backButtonText: {
      color: '#000',
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 15,
    color: '#666',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bankName: {
    fontSize: 15,
    color: '#555',
  },
  accountNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  accountNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  copyText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007AFF',
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
