import React from 'react';
import { StyleSheet, View, TouchableOpacity, Linking, Platform } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

export default function RepairRequestWidget() {
  const repairUrl = 'https://dormitory.kookmin.ac.kr/community/repair/?sc=318';

  const handlePress = () => {
    if (Platform.OS === 'web') {
      window.open(repairUrl, '_blank');
    } else {
      Linking.openURL(repairUrl);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          수리 요구
        </ThemedText>
      </View>

      <TouchableOpacity style={styles.cardButton} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.iconContainer}>
          <ThemedText style={styles.icon}>🔧</ThemedText>
        </View>
        <View style={styles.content}>
          <ThemedText style={styles.cardTitle}>시설물 수리 요구</ThemedText>
          <ThemedText style={styles.cardDescription}>쾌적한 생활을 위한 수리 서비스</ThemedText>
        </View>
        <ThemedText style={styles.arrow}>›</ThemedText>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>
          💡 세면대, 샤워기, 세탁기 등 시설물 고장 시 신청해주세요
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
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
  cardButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  arrow: {
    fontSize: 28,
    opacity: 0.3,
    fontWeight: '300',
  },
  infoContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.05)',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
});
