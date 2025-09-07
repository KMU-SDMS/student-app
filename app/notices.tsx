import React from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// 더 많은 공지사항을 위한 목 데이터
const allNotices = [
  { id: 1, title: '앱 업데이트 안내', date: '2024-01-15', isImportant: true, content: '새로운 기능이 추가되었습니다. 자세한 내용은 설정에서 확인해주세요.' },
  { id: 2, title: '서비스 점검 안내', date: '2024-01-10', isImportant: false, content: '1월 20일 오전 2시~4시 서비스 점검이 예정되어 있습니다.' },
  { id: 3, title: '이벤트 공지', date: '2024-01-05', isImportant: false, content: '신규 사용자 대상 이벤트가 진행 중입니다. 많은 참여 부탁드립니다.' },
  { id: 4, title: '동계 방학 중 기숙사 운영 안내', date: '2023-12-20', isImportant: true, content: '동계 방학 기간 중 기숙사 운영 시간을 안내드립니다. 자세한 내용은 공지를 확인해주세요.' },
  { id: 5, title: '분실물 찾아가세요', date: '2023-12-18', isImportant: false, content: '학생회관 1층에서 보관 중인 분실물 목록입니다. 기간 내에 찾아가시길 바랍니다.' },
  { id: 6, title: '기숙사 만족도 조사 참여 요청', date: '2023-12-15', isImportant: false, content: '기숙사 운영 개선을 위한 만족도 조사를 실시합니다. 많은 참여 부탁드립니다.' },
  { id: 7, title: '연말 소등 행사 안내', date: '2023-12-12', isImportant: false, content: '12월 31일 23시 50분부터 10분간 전체 소등 행사가 진행됩니다.' },
];

export default function NoticesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof allNotices[0] }) => (
    <View style={[styles.noticeItem, item.isImportant && styles.importantNotice]}>
        <View style={styles.noticeHeader}>
            <View style={styles.noticeTitleContainer}>
            {item.isImportant && (
                <View style={styles.importantBadge}>
                <Text style={styles.importantText}>중요</Text>
                </View>
            )}
            <ThemedText style={styles.noticeTitle} numberOfLines={1}>
                {item.title}
            </ThemedText>
            </View>
            <ThemedText style={styles.noticeDate}>{item.date}</ThemedText>
        </View>
        <View style={styles.noticeContent}>
            <ThemedText style={styles.contentText}>
                {item.content}
            </ThemedText>
        </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={allNotices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
            <ThemedText type="title" style={styles.title}>전체 공지사항</ThemedText>
        )}
      />
      <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { top: insets.top + 10 }]}>
        <View style={styles.backButtonCircle}>
            <Text style={styles.backButtonText}>‹</Text>
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
  backButton: {
      position: 'absolute',
      left: 20,
      zIndex: 1,
  },
  backButtonCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  backButtonText: {
      color: '#000',
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 40, // Center the chevron vertically
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
    alignItems: 'flex-start',
    marginBottom: 8,
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
  noticeContent: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});