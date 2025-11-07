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
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { submitOvernightStay } from '@/services/apiService';

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
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getDynamicStyles(colorScheme);

  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  // 초기 날짜를 다음날로 설정
  const getTomorrow = () => addDays(new Date(), 1);

  const [startDate, setStartDate] = useState(getTomorrow());
  const [endDate, setEndDate] = useState(addDays(getTomorrow(), 1));
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webErrorBanner, setWebErrorBanner] = useState<string | null>(null);
  const [webSuccessBanner, setWebSuccessBanner] = useState<string | null>(null);

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

  // 현재 날짜를 기반으로 학기 계산 (1학기: 3-8월, 2학기: 9-2월)
  const getCurrentSemester = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12

    // 3월 ~ 8월: 1학기
    if (month >= 3 && month <= 8) {
      return `${year}-1`;
    }
    // 9월 ~ 12월: 2학기
    else if (month >= 9 && month <= 12) {
      return `${year}-2`;
    }
    // 1월 ~ 2월: 이전 해의 2학기
    else {
      return `${year - 1}-2`;
    }
  };

  const handleStartDateChange = (dateString: string) => {
    const selectedDate = new Date(dateString);
    setStartDate(selectedDate);
    if (selectedDate > endDate) {
      setEndDate(selectedDate);
    } else {
      // 시작일이 변경되면 종료일이 14일을 넘지 않도록 조정
      const maxEndDate = addDays(selectedDate, 14);
      if (endDate > maxEndDate) {
        setEndDate(maxEndDate);
      }
    }
  };

  const handleEndDateChange = (dateString: string) => {
    const selectedDate = new Date(dateString);
    if (selectedDate <= startDate) {
      if (Platform.OS === 'web') setWebErrorBanner('종료일은 시작일 다음 날 이상이어야 합니다.');
      else Alert.alert('오류', '종료일은 시작일 다음 날 이상이어야 합니다.');
      return;
    }

    // 외박 기간이 14일을 넘는지 확인
    const daysDiff = Math.ceil(
      (selectedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff > 14) {
      if (Platform.OS === 'web')
        setWebErrorBanner('외박 기간은 최대 2주(14일)까지 신청 가능합니다.');
      else Alert.alert('입력 오류', '외박 기간은 최대 2주(14일)까지 신청 가능합니다.');
      return;
    }

    setEndDate(selectedDate);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      if (Platform.OS === 'web') setWebErrorBanner('외박 사유를 입력해주세요.');
      else Alert.alert('입력 오류', '외박 사유를 입력해주세요.');
      return;
    }

    // 당일 및 과거일 신청 금지 (서버 유효성에 맞춤)
    const todayYMD = formatDateForInput(new Date());
    const startYMD = formatDateForInput(startDate);
    if (startYMD <= todayYMD) {
      if (Platform.OS === 'web')
        setWebErrorBanner('당일 및 과거 일자는 신청할 수 없습니다. 내일부터 선택해주세요.');
      else
        Alert.alert('입력 오류', '당일 및 과거 일자는 신청할 수 없습니다. 내일부터 선택해주세요.');
      return;
    }

    // 최소 1박 검증
    const endYMD = formatDateForInput(endDate);
    if (endYMD <= startYMD) {
      if (Platform.OS === 'web') setWebErrorBanner('종료일은 시작일 다음 날 이상이어야 합니다.');
      else Alert.alert('입력 오류', '종료일은 시작일 다음 날 이상이어야 합니다.');
      return;
    }

    // 외박 기간이 14일을 넘는지 확인
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 14) {
      if (Platform.OS === 'web')
        setWebErrorBanner('외박 기간은 최대 2주(14일)까지 신청 가능합니다.');
      else Alert.alert('입력 오류', '외박 기간은 최대 2주(14일)까지 신청 가능합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const semester = getCurrentSemester(startDate);
      const payload = {
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate),
        reason: reason.trim(),
        semester: semester,
      };

      await submitOvernightStay(payload);

      if (Platform.OS === 'web') {
        setWebSuccessBanner('외박계 신청이 완료되었습니다. 결과는 알림으로 전송됩니다.');
      } else {
        Alert.alert('신청 완료', '외박계 신청이 완료되었습니다.');
      }
    } catch (error) {
      // 서버가 내려준 구체 메시지를 우선 노출
      const anyErr: any = error;
      const serverBody = anyErr?.body;
      let messageFromServer = '';
      if (serverBody && typeof serverBody === 'object') {
        messageFromServer = serverBody.message || serverBody.error || '';
      } else if (typeof serverBody === 'string') {
        messageFromServer = serverBody;
      }
      const fallbackMessage =
        error instanceof Error ? error.message : '외박계 신청 중 오류가 발생했습니다.';
      let finalMessage = messageFromServer || fallbackMessage;

      // 서버 에러 메시지 매핑: 중복 신청(대기 중) 안내 한글화
      const normalized = (messageFromServer || '').toString().toLowerCase();
      if (
        anyErr?.status === 400 &&
        normalized.includes('pending overnight stay request already exists')
      ) {
        finalMessage = '이미 진행 중인 외박 신청이 있어 추가로 신청할 수 없습니다.';
      }
      // 서버 에러 메시지 매핑: 학기별 신청 한도 초과 안내 한글화
      if (
        anyErr?.status === 400 &&
        normalized.includes('overnight stay limit exceeded for this semester')
      ) {
        finalMessage = '외박계 신청 한도 (3회)를 초과하여 신청하실 수 없습니다.';
      }
      console.error('Overnight stay submit failed', {
        status: anyErr?.status,
        url: anyErr?.url,
        body: anyErr?.body,
      });
      if (Platform.OS === 'web') setWebErrorBanner(finalMessage);
      else Alert.alert('신청 실패', finalMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 웹 <input> 색상 동적 적용
  const isDarkMode = colorScheme === 'dark';
  const webInputBg = isDarkMode ? '#2C2C2E' : '#F7F7F7';
  const webInputText = isDarkMode ? '#E0E0E0' : '#333';

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
              <ChevronIcon direction="left" size={12} color={styles.headerTitle.color as string} />
            </View>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.headerTitle}>
            외박계 신청
          </ThemedText>

          <View style={styles.headerSpacer} />
        </View>

        {/* 웹 오류 배너 */}
        {Platform.OS === 'web' && webErrorBanner && (
          <View style={styles.bannerError} role="alert" aria-live="polite">
            <Text style={styles.bannerText}>{webErrorBanner}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="오류 닫기"
              onPress={() => setWebErrorBanner(null)}
              style={styles.bannerClose}
            >
              <Text style={styles.bannerCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 웹 성공 배너 */}
        {Platform.OS === 'web' && webSuccessBanner && (
          <View style={styles.bannerSuccess} role="alert" aria-live="polite">
            <Text style={styles.bannerSuccessText}>{webSuccessBanner}</Text>
          </View>
        )}

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
                  min={formatDateForInput(addDays(new Date(), 1))}
                  style={{
                    backgroundColor: webInputBg,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '15px',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: webInputText,
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
                  min={formatDateForInput(addDays(startDate, 1))}
                  max={formatDateForInput(addDays(startDate, 14))}
                  style={{
                    backgroundColor: webInputBg,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '15px',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: webInputText,
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
            <ThemedText style={styles.infoText}>
              • 한 학기에 최대 3회까지 신청 가능합니다
            </ThemedText>
            <ThemedText style={styles.infoText}>
              • 외박 기간은 한 번에 최대 2주(14일)까지 신청 가능합니다
            </ThemedText>
            <ThemedText style={styles.infoText}>• 당일에 신청하는 것은 효력이 없습니다</ThemedText>
            <ThemedText style={styles.infoText}>
              • 청소 점호일에 신청하는 것은 효력이 없습니다
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
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>신청하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
    </>
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
  const accentColor = isDarkMode ? '#0A84FF' : '#007AFF';
  const infoCardBg = isDarkMode ? '#203246' : '#E8F4FF';
  const bottomContainerBg = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const bottomContainerBorderColor = isDarkMode ? '#2C2C2E' : '#EFEFEF';
  const bannerErrorBg = isDarkMode ? '#3A1F1F' : '#FDECEC';
  const bannerErrorBorder = isDarkMode ? '#6B2B2B' : '#F5C2C7';
  const bannerErrorText = isDarkMode ? '#FFD6D6' : '#5F2120';
  const bannerSuccessBg = isDarkMode ? '#1F3A1F' : '#ECFDF5';
  const bannerSuccessBorder = isDarkMode ? '#2B6B2B' : '#C2F5D0';
  const bannerSuccessText = isDarkMode ? '#D6FFD6' : '#205F20';

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
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: infoRowBorderColor,
    },
    dateLabel: {
      fontSize: 15,
      color: labelColor,
    },
    dateValueContainer: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#F7F7F7',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
    },
    dateValue: {
      fontSize: 15,
      fontWeight: '500',
      color: valueColor,
    },
    textInput: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#F7F7F7',
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      minHeight: 120,
      color: valueColor,
      lineHeight: 22,
    },
    infoCard: {
      backgroundColor: infoCardBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      color: cardTitleColor,
    },
    infoText: {
      fontSize: 13,
      color: labelColor,
      marginBottom: 4,
      lineHeight: 20,
    },
    bannerError: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: bannerErrorBg,
      borderColor: bannerErrorBorder,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginHorizontal: 20,
      marginTop: 10,
      borderRadius: 8,
      gap: 8,
    },
    bannerText: {
      flex: 1,
      color: bannerErrorText,
      fontSize: 13,
    },
    bannerClose: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: 'transparent',
    },
    bannerCloseText: {
      color: bannerErrorText,
      fontSize: 13,
      fontWeight: '600',
    },
    bannerSuccess: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: bannerSuccessBg,
      borderColor: bannerSuccessBorder,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginHorizontal: 20,
      marginTop: 10,
      borderRadius: 8,
    },
    bannerSuccessText: {
      flex: 1,
      color: bannerSuccessText,
      fontSize: 13,
    },
    bottomContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: bottomContainerBorderColor,
      backgroundColor: bottomContainerBg,
    },
    submitButton: {
      backgroundColor: accentColor,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });
};
