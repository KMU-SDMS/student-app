import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

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

export default function RepairRequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const repairUrl = 'https://dormitory.kookmin.ac.kr/community/repair/?sc=318';
  const [isLoading, setIsLoading] = useState(true);

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
              <ChevronIcon direction="left" size={12} color="#000" />
            </View>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.headerTitle}>
            수리 요구
          </ThemedText>

          <View style={styles.headerSpacer} />
        </View>

        {/* WebView or iframe */}
        <View style={styles.webViewContainer}>
          {Platform.OS === 'web' ? (
            <>
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <ThemedText style={styles.loadingText}>페이지를 불러오는 중...</ThemedText>
                </View>
              )}
              <iframe
                src={repairUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                }}
                onLoad={() => setIsLoading(false)}
                title="수리 요구"
              />
            </>
          ) : (
            <WebView
              source={{ uri: repairUrl }}
              style={styles.webView}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <ThemedText style={styles.loadingText}>페이지를 불러오는 중...</ThemedText>
                </View>
              )}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
              }}
            />
          )}
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
  },
  headerSpacer: {
    width: 40,
  },
  backButton: {
    // position과 zIndex 제거
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
});
