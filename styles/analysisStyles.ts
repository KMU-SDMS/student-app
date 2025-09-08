import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const createAnalysisStyles = (mode: 'light' | 'dark') => {
  const palette = Colors[mode];
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      margin: 16,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: palette.background,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    capturedImage: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    analysisContainer: {
      margin: 16,
      backgroundColor: palette.background,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: palette.text,
      marginBottom: 16,
    },
    bottomContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      backgroundColor: palette.background,
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    completeButton: {
      backgroundColor: palette.tint,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    completeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: palette.icon,
    },
    errorText: {
      fontSize: 16,
      color: '#ff6b6b',
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: palette.tint,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
};
