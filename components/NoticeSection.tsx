import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useRouter } from 'expo-router';

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

const mockNotices: Notice[] = [
  {
    id: 1,
    title: '앱 업데이트 안내',
    content: '새로운 기능이 추가되었습니다. 자세한 내용은 설정에서 확인해주세요.',
    date: '2024-01-15',
    isImportant: true,
  },
  {
    id: 2,
    title: '서비스 점검 안내',
    content: '1월 20일 오전 2시~4시 서비스 점검이 예정되어 있습니다.',
    date: '2024-01-10',
    isImportant: false,
  },
  {
    id: 3,
    title: '이벤트 공지',
    content: '신규 사용자 대상 이벤트가 진행 중입니다. 많은 참여 부탁드립니다.',
    date: '2024-01-05',
    isImportant: false,
  },
];

export default function NoticeSection() {
  const [expandedNotice, setExpandedNotice] = useState<number | null>(null);
  const router = useRouter();

  const toggleExpanded = (id: number) => {
    setExpandedNotice(expandedNotice === id ? null : id);
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
        {mockNotices.map((notice) => (
          <TouchableOpacity
            key={notice.id}
            style={[
              styles.noticeItem,
              notice.isImportant && styles.importantNotice,
            ]}
            onPress={() => toggleExpanded(notice.id)}
          >
            <View style={styles.noticeHeader}>
              <View style={styles.noticeTitleContainer}>
                {notice.isImportant && (
                  <View style={styles.importantBadge}>
                    <Text style={styles.importantText}>중요</Text>
                  </View>
                )}
                <ThemedText style={styles.noticeTitle} numberOfLines={1}>
                  {notice.title}
                </ThemedText>
              </View>
              <ThemedText style={styles.noticeDate}>{notice.date}</ThemedText>
            </View>
            
            {expandedNotice === notice.id && (
              <View style={styles.noticeContent}>
                <ThemedText style={styles.contentText}>
                  {notice.content}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
    maxHeight: 300,
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
  noticeContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  contentText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
});