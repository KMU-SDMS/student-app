import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useCalendar } from '../hooks/useCalendar';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CalendarWidgetProps {
  onDateSelect?: (date: Date) => void;
}

interface ChevronIconProps {
  direction: 'left' | 'right';
  size?: number;
  color?: string;
  thickness?: number;
  offsetX?: number; // 사용자 정의 X축 보정(px)
  offsetY?: number; // 사용자 정의 Y축 보정(px)
}

const ChevronIcon = ({
  direction,
  size = 10,
  color = '#007AFF',
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

export default function CalendarWidget({ onDateSelect }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const {
    isLoading,
    error,
    hasRollCallOnDate,
    getRollCallTypeOnDate,
    hasPaymentOnDate,
    getPaymentTypeOnDate,
    loadAllEvents,
  } = useCalendar();

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 해당 월의 첫 번째 날과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0: 일요일, 1: 월요일, ...

  // 오늘인지 확인하는 함수 (연/월/일 단위로 비교)
  const isSameYMD = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isToday = (date: Date) => isSameYMD(date, today);

  // API에서 가져온 데이터로 점호 여부 확인
  const hasRegularRollCall = (date: Date) => {
    const rollCallType = getRollCallTypeOnDate(date);
    return rollCallType === '일반';
  };

  // API에서 가져온 데이터로 청소 점호 여부 확인
  const hasCleaningRollCall = (date: Date) => {
    const rollCallType = getRollCallTypeOnDate(date);
    return rollCallType === '청소';
  };

  // 관비 납부 마감 일정이 있는지 확인
  const hasPayment = (date: Date) => {
    return hasPaymentOnDate(date);
  };

  // 월이 변경될 때마다 전체 일정 다시 로드
  useEffect(() => {
    loadAllEvents();
  }, [year, month, loadAllEvents]);

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 날짜 선택
  const selectDate = (day: number) => {
    const selectedDate = new Date(year, month, day);
    onDateSelect?.(selectedDate);
  };

  const colorScheme = useColorScheme() ?? 'light';

  const styles = getDynamicStyles(colorScheme);

  // 달력 날짜들 생성
  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = lastDay.getDate();

    // 빈 칸들 (이전 달의 마지막 주)
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <View key={`empty-${year}-${month}-empty-${i}`} style={styles.dayContainer}>
          <Text style={styles.emptyDay}></Text>
        </View>,
      );
    }

    // 해당 월의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isTodayDay = isToday(date);
      const hasRegular = hasRegularRollCall(date);
      const hasCleaning = hasCleaningRollCall(date);
      const hasPaymentEvent = hasPayment(date);

      days.push(
        <TouchableOpacity
          key={`${year}-${month}-${day}`}
          style={styles.dayContainer}
          onPress={() => selectDate(day)}
        >
          {isTodayDay ? (
            <View style={styles.todayContainer}>
              <Text style={[styles.dayText, styles.todayText]}>{day}</Text>
            </View>
          ) : (
            <Text style={styles.dayText}>{day}</Text>
          )}
          <View style={styles.dotsRow}>
            {hasRegular && <View style={[styles.dotBase, styles.dotRegular]} />}
            {hasCleaning && <View style={[styles.dotBase, styles.dotCleaning]} />}
            {hasPaymentEvent && <View style={[styles.dotBase, styles.dotPayment]} />}
          </View>
        </TouchableOpacity>,
      );
    }

    return days;
  };

  const monthNames = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <View>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          일정
        </ThemedText>
      </View>
      <ThemedView style={styles.container}>
        <View style={styles.cardBody}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goToPreviousMonth}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="이전 달"
          >
            <ChevronIcon direction="left" color={styles.navButtonText.color} />
          </TouchableOpacity>

          <ThemedText style={styles.monthYear}>
            {year}년 {monthNames[month]}
          </ThemedText>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="다음 달"
          >
            <ChevronIcon direction="right" color={styles.navButtonText.color} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysContainer}>
          {weekDays.map((day, index) => (
            <View key={day} style={styles.weekDayContainer}>
              <Text
                style={[
                  styles.weekDayText,
                  index === 0 && styles.sundayText,
                  index === 6 && styles.saturdayText,
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={styles.navButtonText.color} />
            <Text style={styles.loadingText}>일정을 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>일정을 불러올 수 없습니다</Text>
            <Text style={styles.errorSubText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={styles.legendRegularDot} />
            <Text style={styles.legendRegularText}>일반 점호</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendCleaningDot} />
            <Text style={styles.legendCleaningText}>청소 점호</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendPaymentDot} />
            <Text style={styles.legendPaymentText}>관비 납부 마감</Text>
          </View>
        </View>
      </View>
      </ThemedView>
    </View>
  );
}

const getDynamicStyles = (colorScheme: 'light' | 'dark' | null | undefined) => {
  const isDarkMode = colorScheme === 'dark';

  const containerBackgroundColor = isDarkMode ? 'rgba(36, 39, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const cardBodyBackgroundColor = isDarkMode ? 'rgba(36, 39, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const headerBackgroundColor = isDarkMode ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.05)';
  const monthYearColor = isDarkMode ? '#E0E0E0' : '#1C1C1E';
  const weekDaysContainerBackgroundColor = isDarkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)';
  const weekDayTextColor = isDarkMode ? '#9E9E9E' : '#8E8E93';
  const dayTextColor = isDarkMode ? '#E0E0E0' : '#1C1C1E';
  const legendBackgroundColor = isDarkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)';
  const loadingTextColor = isDarkMode ? '#9E9E9E' : '#8E8E93';
  const errorSubTextColor = isDarkMode ? '#9E9E9E' : '#8E8E93';
  const navButtonTextColor = isDarkMode ? '#0A84FF' : '#007AFF';

  return StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 15,
      borderRadius: 20,
      backgroundColor: containerBackgroundColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      marginHorizontal: 16,
    },
    sectionTitle: {
      fontWeight: '600',
    },
    cardBody: {
      backgroundColor: cardBodyBackgroundColor,
      paddingBottom: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: headerBackgroundColor,
    },
    navButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    navButtonText: {
      fontSize: 20,
      fontWeight: '700',
      color: navButtonTextColor,
    },
    monthYear: {
      fontSize: 20,
      fontWeight: '700',
      color: monthYearColor,
    },
    weekDaysContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: weekDaysContainerBackgroundColor,
    },
    weekDayContainer: {
      width: '14.28%',
      alignItems: 'center',
    },
    weekDayText: {
      fontSize: 13,
      fontWeight: '600',
      color: weekDayTextColor,
    },
    sundayText: {
      color: '#FF3B30',
    },
    saturdayText: {
      color: navButtonTextColor, // Use the same color as navButtonText for consistency
      fontWeight: '700',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      paddingVertical: 8,
      height: 280, // 더 많은 공간 확보
    },
    dayContainer: {
      width: '14.28%',
      height: 40, // aspectRatio 대신 고정 높이 사용
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginVertical: 2,
    },
    emptyDay: {
      fontSize: 16,
    },
    dayText: {
      fontSize: 16,
      fontWeight: '500',
      color: dayTextColor,
    },
    todayContainer: {
      width: 28,
      height: 28,
      borderRadius: 18,
      backgroundColor: '#6296ffff',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#007AFF',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    todayText: {
      color: 'white',
      fontWeight: '700',
    },
    regularRollCallDot: {
      display: 'none',
    },
    cleaningRollCallDot: {
      display: 'none',
    },
    legend: {
      flex: 1,
      marginTop: 0,
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: legendBackgroundColor,
      alignItems: 'center',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    legendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    legendRegularDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFD700',
      marginRight: 8,
    },
    legendCleaningDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#007AFF',
      marginRight: 8,
    },
    legendRegularText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFD700',
    },
    legendCleaningText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#007AFF',
    },
    paymentDot: {
      display: 'none',
    },
    dotsRow: {
      position: 'absolute',
      bottom: 2,
      flexDirection: 'row',
      gap: 2,
    },
    dotBase: {
      width: 6,
      height: 6,
      borderRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    dotRegular: {
      backgroundColor: '#FFD700',
      shadowColor: '#FFD700',
    },
    dotCleaning: {
      backgroundColor: '#007AFF',
      shadowColor: '#007AFF',
    },
    dotPayment: {
      backgroundColor: '#34C759',
      shadowColor: '#34C759',
    },
    legendPaymentDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#34C759',
      marginRight: 8,
    },
    legendPaymentText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#34C759',
    },
    loadingContainer: {
      height: 280,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: loadingTextColor,
      fontWeight: '500',
    },
    errorContainer: {
      height: 280,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 16,
      color: '#FF3B30',
      fontWeight: '600',
      textAlign: 'center',
    },
    errorSubText: {
      marginTop: 8,
      fontSize: 14,
      color: errorSubTextColor,
      textAlign: 'center',
    },
  });
};
