import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Text,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function OvernightStayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (dateString: string) => {
    const selectedDate = new Date(dateString);
    setStartDate(selectedDate);
    if (selectedDate > endDate) {
      setEndDate(selectedDate);
    }
  };

  const handleEndDateChange = (dateString: string) => {
    const selectedDate = new Date(dateString);
    if (selectedDate < startDate) {
      Alert.alert('오류', '종료일은 시작일 이후여야 합니다.');
      return;
    }
    setEndDate(selectedDate);
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      Alert.alert('입력 오류', '외박 사유를 입력해주세요.');
      return;
    }

    // 실제로는 API 호출을 해야 함
    Alert.alert('신청 완료', '외박계 신청이 완료되었습니다.', [
      {
        text: '확인',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
              <ChevronIcon direction="left" size={12} color="#000" />
            </View>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.headerTitle}>
            외박계 신청
          </ThemedText>

          <View style={styles.headerSpacer} />
        </View>

        {/* 메인 콘텐츠 */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 날짜 선택 카드 */}
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              외박 기간
            </ThemedText>

            {/* 시작일 */}
            <View style={styles.dateRow}>
              <ThemedText style={styles.dateLabel}>시작일</ThemedText>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={formatDateForInput(startDate)}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={formatDateForInput(new Date())}
                  style={{
                    backgroundColor: '#F7F7F7',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '15px',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: '#333',
                    fontWeight: '500',
                  }}
                />
              ) : (
                <View style={styles.dateValueContainer}>
                  <ThemedText style={styles.dateValue}>{formatDate(startDate)}</ThemedText>
                </View>
              )}
            </View>

            {/* 종료일 */}
            <View style={styles.dateRow}>
              <ThemedText style={styles.dateLabel}>종료일</ThemedText>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={formatDateForInput(endDate)}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={formatDateForInput(startDate)}
                  style={{
                    backgroundColor: '#F7F7F7',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '15px',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: '#333',
                    fontWeight: '500',
                  }}
                />
              ) : (
                <View style={styles.dateValueContainer}>
                  <ThemedText style={styles.dateValue}>{formatDate(endDate)}</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* 사유 입력 카드 */}
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              외박 사유
            </ThemedText>
            <TextInput
              style={styles.textInput}
              placeholder="외박 사유를 입력해주세요"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
            />
          </View>

          {/* 안내 사항 카드 */}
          <View style={styles.infoCard}>
            <ThemedText style={styles.infoTitle}>📌 안내사항</ThemedText>
            <ThemedText style={styles.infoText}>• 월 최대 3회까지 신청 가능합니다</ThemedText>
            <ThemedText style={styles.infoText}>• 외박은 승인 후 효력이 발생합니다</ThemedText>
            <ThemedText style={styles.infoText}>
              • 허위 사유 작성 시 불이익을 받을 수 있습니다
            </ThemedText>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View
          style={[
            styles.bottomContainer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 },
          ]}
        >
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>신청하기</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </>
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
    paddingTop: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
  },
  headerSpacer: {
    width: 40,
  },
  backButton: {
    // position과 zIndex 제거
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
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
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateLabel: {
    fontSize: 15,
    color: '#666',
  },
  dateValueContainer: {
    backgroundColor: '#F7F7F7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  textInput: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
    color: '#333',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
