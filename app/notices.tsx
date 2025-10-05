import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getNotices } from '@/services/apiService';
import { Notice, NoticesResponse } from '@/types/notice';

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

export default function NoticesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotices = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else if (page === 1) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const response: NoticesResponse = await getNotices(page);

      if (append) {
        setNotices((prev) => [...prev, ...response.notices]);
      } else {
        setNotices(response.notices);
      }

      // 페이지 정보 업데이트 - API 응답의 now_page와 total_page 비교
      setTotalPages(response.page_info.total_page);
      setCurrentPage(response.page_info.now_page);
      setHasMorePages(response.page_info.now_page < response.page_info.total_page);

      console.log('Page info:', {
        currentPage: response.page_info.now_page,
        totalPages: response.page_info.total_page,
        totalNotices: response.page_info.total_notice,
        hasMorePages: response.page_info.now_page < response.page_info.total_page,
        noticesCount: response.notices.length,
      });
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotices(1, false);
  }, []);

  const loadMoreNotices = () => {
    if (!isLoadingMore && !isLoading && hasMorePages) {
      const nextPage = currentPage + 1;
      fetchNotices(nextPage, true);
    }
  };

  const refreshNotices = () => {
    setCurrentPage(1);
    setTotalPages(0);
    setHasMorePages(true);
    setNotices([]); // 기존 데이터 초기화
    fetchNotices(1, false);
  };

  const handleNoticePress = (notice: Notice) => {
    router.push({
      pathname: '/notice-detail',
      params: {
        id: notice.id.toString(),
        title: notice.title,
        content: notice.content,
        date: notice.date,
        is_important: notice.is_important.toString(),
      },
    });
  };

  const renderItem = ({ item }: { item: Notice }) => (
    <TouchableOpacity
      style={[styles.noticeItem, item.is_important && styles.importantNotice]}
      onPress={() => handleNoticePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.noticeHeader}>
        <View style={styles.noticeTitleContainer}>
          {item.is_important && (
            <View style={styles.importantBadge}>
              <Text style={styles.importantText}>중요</Text>
            </View>
          )}
          <ThemedText style={styles.noticeTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
        </View>
        <ThemedText style={styles.noticeDate}>
          {new Date(item.date).toISOString().split('T')[0]}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" style={styles.loadingIndicator} />;
    }

    if (notices.length === 0) {
      return <ThemedText style={styles.emptyText}>등록된 공지사항이 없습니다.</ThemedText>;
    }

    return (
      <FlatList
        data={notices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <ThemedText type="title" style={styles.title}>
            전체 공지사항
          </ThemedText>
        )}
        ListFooterComponent={() => {
          if (isLoadingMore) {
            return <ActivityIndicator size="small" style={styles.loadingMoreIndicator} />;
          }
          if (!hasMorePages && notices.length > 0) {
            return (
              <ThemedText style={styles.noMoreText}>
                모든 공지사항을 불러왔습니다. ({notices.length}개)
              </ThemedText>
            );
          }
          if (totalPages > 0) {
            return (
              <ThemedText style={styles.pageInfoText}>
                {currentPage} / {totalPages} 페이지
              </ThemedText>
            );
          }
          return null;
        }}
        onEndReached={loadMoreNotices}
        onEndReachedThreshold={0.5}
        refreshing={isRefreshing}
        onRefresh={refreshNotices}
      />
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {renderContent()}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 10 }]}
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
      >
        <View style={styles.backButtonCircle}>
          <ChevronIcon direction="left" size={12} color="#000" />
        </View>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    paddingVertical: 16,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
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
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  importantNotice: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.05)',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  importantBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  importantText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  noticeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  noticeDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  loadingMoreIndicator: {
    paddingVertical: 20,
  },
  noMoreText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
    opacity: 0.6,
  },
  pageInfoText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 12,
    opacity: 0.5,
  },
});
