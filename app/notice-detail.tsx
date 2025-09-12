import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function NoticeDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // URL 파라미터에서 공지사항 데이터 추출
  const notice = {
    id: params.id ? parseInt(params.id as string) : 0,
    title: params.title as string || '',
    content: params.content as string || '',
    date: params.date as string || '',
    is_important: params.is_important === 'true',
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
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
      
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 10 }]}
      >
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 60, // 돌아가기 버튼 아래로 여백 추가
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
    backgroundColor: '#FF3B30',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
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
    lineHeight: 40,
  },
});
