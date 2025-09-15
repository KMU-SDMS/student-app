import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useRouter } from 'expo-router';
import { getNotices } from '@/services/apiService';
import { Notice, NoticesResponse } from '@/types/notice';

export default function NoticeSection() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response: NoticesResponse = await getNotices();
        setNotices(response.notices.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch notices for NoticeSection:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, []);

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

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator style={styles.centered} />;
    }
    if (notices.length === 0) {
      return <ThemedText style={styles.emptyText}>등록된 공지사항이 없습니다.</ThemedText>;
    }
    return notices.map((notice) => (
      <TouchableOpacity
        key={notice.id}
        style={[styles.noticeItem, notice.is_important && styles.importantNotice]}
        onPress={() => handleNoticePress(notice)}
        activeOpacity={0.7}
      >
        <View style={styles.noticeHeader}>
          <View style={styles.noticeTitleContainer}>
            {notice.is_important && (
              <View style={styles.importantBadge}>
                <Text style={styles.importantText}>중요</Text>
              </View>
            )}
            <ThemedText style={styles.noticeTitle} numberOfLines={2}>
              {notice.title}
            </ThemedText>
          </View>
          <ThemedText style={styles.noticeDate}>
            {new Date(notice.date).toISOString().split('T')[0]}
          </ThemedText>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          공지사항
        </ThemedText>
        <TouchableOpacity style={styles.moreButton} onPress={() => router.push('/notices')}>
          <ThemedText style={styles.moreText}>더보기</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.noticeList} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
  },
  moreButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moreText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  noticeList: {
    minHeight: 100, // Set a min height to ensure the empty message is visible
  },
  centered: {
    paddingVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    opacity: 0.6,
  },
  noticeItem: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  importantNotice: {
    borderLeftColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.05)',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    fontSize: 14,
    fontWeight: '500',
  },
  noticeDate: {
    fontSize: 12,
    opacity: 0.6,
  },
});
