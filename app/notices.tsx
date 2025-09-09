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
import { Notice } from '@/types/notice';

export default function NoticesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await getNotices();
        setNotices(data);
      } catch (error) {
        console.error('Failed to fetch notices:', error);
        // Optionally, set an error state to show a message to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const renderItem = ({ item }: { item: Notice }) => (
    <View
      style={[styles.noticeItem, item.is_important && styles.importantNotice]}
    >
      <View style={styles.noticeHeader}>
        <View style={styles.noticeTitleContainer}>
          {item.is_important && (
            <View style={styles.importantBadge}>
              <Text style={styles.importantText}>중요</Text>
            </View>
          )}
          <ThemedText style={styles.noticeTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
        </View>
        <ThemedText style={styles.noticeDate}>
          {new Date(item.date).toISOString().split('T')[0]}
        </ThemedText>
      </View>
      <View style={styles.noticeContent}>
        <ThemedText style={styles.contentText}>{item.content}</ThemedText>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator size="large" style={styles.loadingIndicator} />
      );
    }

    if (notices.length === 0) {
      return (
        <ThemedText style={styles.emptyText}>
          등록된 공지사항이 없습니다.
        </ThemedText>
      );
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
      />
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
