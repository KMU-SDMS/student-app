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

export default function NoticeDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      {renderContent()}
      
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
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#FF3B30',
  },
});
