import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useCalendar } from '../hooks/useCalendar';

interface CalendarWidgetProps {
  onDateSelect?: (date: Date) => void;
}

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
          {hasRegular && !hasCleaning && <View style={styles.regularRollCallDot} />}
          {hasCleaning && <View style={styles.cleaningRollCallDot} />}
          {hasPaymentEvent && !hasRegular && !hasCleaning && <View style={styles.paymentDot} />}
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
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        <ThemedText style={styles.monthYear}>
          {year}년 {monthNames[month]}
        </ThemedText>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <View key={day} style={styles.weekDayContainer}>
            <Text
              style={[
                styles.weekDayText,
                index === 0 && styles.sundayText,
                index === 1 && styles.mondayText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    height: 460, // 범례를 포함한 전체 높이로 조정
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,122,255,0.05)',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,122,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  sundayText: {
    color: '#FF3B30',
  },
  mondayText: {
    color: '#007AFF',
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
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
    color: '#1C1C1E',
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
    position: 'absolute',
    bottom: 2, // bottom: -6에서 2로 변경하여 컨테이너 내부에 위치
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  cleaningRollCallDot: {
    position: 'absolute',
    bottom: 2, // bottom: -6에서 2로 변경하여 컨테이너 내부에 위치
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  legend: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.02)',
    alignItems: 'center',
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
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
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
    color: '#8E8E93',
    textAlign: 'center',
  },
});
