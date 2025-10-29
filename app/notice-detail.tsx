import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getNoticeById } from '@/services/apiService';
import { Notice } from '@/types/notice';
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

export default function NoticeDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme() ?? 'light';
  const styles = getDynamicStyles(colorScheme);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const noticeId = params.id ? parseInt(params.id as string) : 0;
        if (noticeId === 0) {
          setError('잘못된 공지사항 ID입니다.');
          return;
        }

        const noticeData = await getNoticeById(noticeId);
        if (noticeData) {
          setNotice(noticeData);
        } else {
          setError('공지사항을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('Failed to fetch notice:', err);
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotice();
  }, [params.id]);

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" style={styles.loadingIndicator} />;
    }

    if (error) {
      return <ThemedText style={styles.errorText}>{error}</ThemedText>;
    }

    if (!notice) {
      return <ThemedText style={styles.errorText}>공지사항을 찾을 수 없습니다.</ThemedText>;
    }

    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {notice.is_important && (
              <View style={styles.importantBadge}>
                <Text style={styles.importantText}>중요</Text>
              </View>
            )}
            <ThemedText style={styles.title}>{notice.title}</ThemedText>
          </View>
          <ThemedText style={styles.date}>
            {new Date(notice.date).toISOString().split('T')[0]}
          </ThemedText>
        </View>

        <View style={styles.contentContainer}>
          <ThemedText style={styles.content}>{notice.content}</ThemedText>
        </View>
      </ScrollView>
    );
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
          공지사항 상세
        </ThemedText>

        <View style={styles.headerSpacer} />
      </View>

      {renderContent()}
    </ThemedView>
  );
}

const getDynamicStyles = (colorScheme: 'light' | 'dark') => {
  const isDarkMode = colorScheme === 'dark';

  const headerBackgroundColor = isDarkMode ? 'rgba(36, 39, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const headerBorderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const headerTextColor = isDarkMode ? '#E0E0E0' : '#000';
  const contentBackgroundColor = isDarkMode ? '#2C2C2E' : '#FFFFFF';
  const contentBorderColor = isDarkMode ? '#3A3A3C' : '#EAEAEA';
  const importantBadgeColor = isDarkMode ? '#FF453A' : '#FF3B30';

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 20,
    },
    header: {
      marginTop: 20,
      marginBottom: 24,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    importantBadge: {
      backgroundColor: importantBadgeColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginRight: 12,
    },
    importantText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    title: {
      flex: 1,
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    date: {
      fontSize: 14,
      opacity: 0.7,
    },
    contentContainer: {
      backgroundColor: contentBackgroundColor,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: contentBorderColor,
    },
    content: {
      fontSize: 16,
      lineHeight: 24,
      opacity: 0.9,
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
    loadingIndicator: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: importantBadgeColor,
    },
  });
};
