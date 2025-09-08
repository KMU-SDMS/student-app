import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface CalendarWidgetProps {
  onDateSelect?: (date: Date) => void;
}

export default function CalendarWidget({ onDateSelect }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 해당 월의 첫 번째 날과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0: 일요일, 1: 월요일, ...

  // 월요일인지 확인하는 함수
  const isMonday = (date: Date) => {
    return date.getDay() === 1;
  };

  // 오늘인지 확인하는 함수
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  // 해당 날짜에 일반 점호가 있는지 확인하는 함수
  const hasRegularRollCall = (date: Date) => {
    return isMonday(date);
  };

  // 해당 날짜에 청소 점호가 있는지 확인하는 함수 (격주 월요일)
  const hasCleaningRollCall = (date: Date) => {
    if (!isMonday(date)) return false;

    // 2024년 1월 1일을 기준으로 격주 계산
    const baseDate = new Date(2024, 0, 1); // 2024년 1월 1일
    const timeDiff = date.getTime() - baseDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const weeksDiff = Math.floor(daysDiff / 7);

    // 홀수 주차에 청소 점호
    return weeksDiff % 2 === 1;
  };

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
        <View key={`empty-${i}`} style={styles.dayContainer}>
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

      days.push(
        <TouchableOpacity key={day} style={styles.dayContainer} onPress={() => selectDate(day)}>
          <View style={isTodayDay ? styles.todayContainer : undefined}>
            <Text style={[styles.dayText, isTodayDay && styles.todayText]}>{day}</Text>
          </View>
          {hasRegular && !hasCleaning && <View style={styles.regularRollCallDot} />}
          {hasCleaning && <View style={styles.cleaningRollCallDot} />}
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

      <View style={styles.calendarGrid}>{renderCalendarDays()}</View>

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
    height: 420, // 범례를 포함한 전체 높이로 조정
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
    height: 240, // 범례 공간을 위해 높이 조정
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
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
    bottom: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
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
    bottom: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
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
});
