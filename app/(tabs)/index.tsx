import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return <ThemedView style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
