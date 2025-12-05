import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';

// React Native Web 호환 아이콘 컴포넌트
interface ChevronIconProps {
  direction: 'left' | 'right';
  size?: number;
  color?: string;
  thickness?: number;
}

const ChevronIcon = ({
  direction,
  size = 10,
  color = '#000',
  thickness = 2,
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
    ],
  } as const;

  const leftStyle = {
    borderLeftWidth: thickness,
    borderBottomWidth: thickness,
    transform: [
      { rotate: '45deg' },
      { translateX: offset },
      { translateY: -offset },
    ],
  } as const;

  return <View style={[baseStyle, direction === 'right' ? rightStyle : leftStyle]} />;
};

// 목업 알림 데이터
interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: '외박계 신청 승인',
    message: '2024년 3월 15일 ~ 2024년 3월 17일 외박계 신청이 승인되었습니다.',
    date: '2024-03-14',
    type: 'success',
    read: false,
  },
  {
    id: '2',
    title: '관리비 납부 안내',
    message: '2024년 3월 관리비 납부 기한이 3일 남았습니다. 납부 금액: 150,000원',
    date: '2024-03-12',
    type: 'warning',
    read: false,
  },
  {
    id: '3',
    title: '공지사항',
    message: '[중요] 생활관 청소 점호일 변경 안내 (3월 20일 → 3월 21일)',
    date: '2024-03-10',
    type: 'info',
    read: true,
  },
  {
    id: '4',
    title: '외박계 신청 반려',
    message: '2024년 3월 8일 ~ 2024년 3월 10일 외박계 신청이 반려되었습니다. 사유: 신청 기간 초과',
    date: '2024-03-07',
    type: 'error',
    read: true,
  },
  {
    id: '5',
    title: '관리비 납부 완료',
    message: '2024년 2월 관리비 납부가 완료되었습니다. 감사합니다.',
    date: '2024-03-05',
    type: 'success',
    read: true,
  },
  {
    id: '6',
    title: '공지사항',
    message: '생활관 화재 대피 훈련 안내 (3월 25일 오후 2시)',
    date: '2024-03-03',
    type: 'info',
    read: true,
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getDynamicStyles(colorScheme);

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
            알림 내역
          </ThemedText>

          <View style={styles.headerSpacer} />
        </View>

        {/* 메인 콘텐츠 */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {mockNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>알림 내역이 없습니다.</ThemedText>
            </View>
          ) : (
            mockNotifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification,
                  styles[`${notification.type}Notification`],
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <ThemedText style={styles.notificationTitle}>{notification.title}</ThemedText>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                  <ThemedText style={styles.notificationMessage}>{notification.message}</ThemedText>
                  <ThemedText style={styles.notificationDate}>{formatDate(notification.date)}</ThemedText>
                </View>
              </View>
            ))
          )}
        </ScrollView>
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
  const notificationItemBackgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const notificationItemBorderColor = isDarkMode ? '#2C2C2E' : '#EAEAEA';
  const unreadBackgroundColor = isDarkMode ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)';
  const titleColor = isDarkMode ? '#E0E0E0' : '#333';
  const messageColor = isDarkMode ? '#B0B0B0' : '#666';
  const dateColor = isDarkMode ? '#808080' : '#999';

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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 100,
    },
    emptyText: {
      fontSize: 16,
      color: messageColor,
      textAlign: 'center',
    },
    notificationItem: {
      backgroundColor: notificationItemBackgroundColor,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: notificationItemBorderColor,
    },
    unreadNotification: {
      backgroundColor: unreadBackgroundColor,
      borderColor: isDarkMode ? 'rgba(0, 122, 255, 0.3)' : 'rgba(0, 122, 255, 0.2)',
    },
    infoNotification: {
      borderLeftWidth: 3,
      borderLeftColor: isDarkMode ? '#0A84FF' : '#007AFF',
    },
    successNotification: {
      borderLeftWidth: 3,
      borderLeftColor: isDarkMode ? '#30D158' : '#34C759',
    },
    warningNotification: {
      borderLeftWidth: 3,
      borderLeftColor: isDarkMode ? '#FF9F0A' : '#FF9500',
    },
    errorNotification: {
      borderLeftWidth: 3,
      borderLeftColor: isDarkMode ? '#FF453A' : '#FF3B30',
    },
    notificationContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: titleColor,
      flex: 1,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDarkMode ? '#0A84FF' : '#007AFF',
      marginLeft: 8,
    },
    notificationMessage: {
      fontSize: 14,
      color: messageColor,
      lineHeight: 20,
      marginBottom: 8,
    },
    notificationDate: {
      fontSize: 12,
      color: dateColor,
    },
  });
};

