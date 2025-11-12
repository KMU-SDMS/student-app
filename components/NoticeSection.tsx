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

// 화살표 아이콘 컴포넌트
const ChevronIcon = ({ expanded }: { expanded: boolean }) => {
  const chevronStyle = {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FF3B30',
    transform: [{ rotate: expanded ? '225deg' : '45deg' }] as any,
  };

  return <View style={chevronStyle} />;
};

export default function NoticeSection() {
  const [importantNotices, setImportantNotices] = useState<Notice[]>([]);
  const [regularNotices, setRegularNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportantExpanded, setIsImportantExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response: NoticesResponse = await getNotices();
        // 중요공지와 일반공지 분리
        const important = response.notices.filter((notice) => notice.is_important);
        const regular = response.notices.filter((notice) => !notice.is_important);

        setImportantNotices(important);
        // 일반공지는 최대 3개만 표시
        setRegularNotices(regular.slice(0, 3));
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

  const renderNoticeItem = (notice: Notice) => (
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
  );

  const renderImportantSection = () => {
    if (importantNotices.length === 0) {
      return null;
    }

    return (
      <View style={styles.importantSection}>
        <TouchableOpacity
          style={styles.importantHeader}
          onPress={() => setIsImportantExpanded(!isImportantExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.importantHeaderLeft}>
            <View style={styles.importantBadge}>
              <Text style={styles.importantText}>중요</Text>
            </View>
            <ThemedText style={styles.importantSectionTitle}>
              중요 공지사항 {importantNotices.length}개
            </ThemedText>
          </View>
          <ChevronIcon expanded={isImportantExpanded} />
        </TouchableOpacity>

        {isImportantExpanded && (
          <View style={styles.importantContent}>
            {importantNotices.map((notice) => renderNoticeItem(notice))}
          </View>
        )}
      </View>
    );
  };

  const renderRegularContent = () => {
    if (isLoading) {
      return <ActivityIndicator style={styles.centered} />;
    }

    if (importantNotices.length === 0 && regularNotices.length === 0) {
      return <ThemedText style={styles.emptyText}>등록된 공지사항이 없습니다.</ThemedText>;
    }

    if (regularNotices.length === 0) {
      return null;
    }

    return regularNotices.map((notice) => renderNoticeItem(notice));
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
        {renderImportantSection()}
        {renderRegularContent()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 8,
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
  importantSection: {
    marginBottom: 12,
  },
  importantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  importantHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  importantSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  importantContent: {
    marginTop: 8,
  },
});
