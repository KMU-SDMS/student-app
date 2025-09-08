import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { AnalysisRouteParams } from '../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnalysis } from '../hooks/useAnalysis';
import TextField from '../components/form/TextField';
import type { AnalysisResult } from '../types/analysis';
import type { KeyboardTypeOptions } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';
import { createAnalysisStyles } from '../styles/analysisStyles';
import { t } from '../utils/i18n';
import { Colors } from '../constants/Colors';

export default function AnalysisScreen() {
  const { photoUri } = useLocalSearchParams<AnalysisRouteParams>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const styles = createAnalysisStyles(colorScheme === 'dark' ? 'dark' : 'light');
  const palette = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const {
    isLoading,
    analysisResult,
    editableData,
    error,
    loadAnalysis,
    handleFieldChange,
    handleComplete,
  } = useAnalysis(photoUri);

  // 필드 구성/핸들러는 훅 규칙 위반을 피하기 위해 조건부 렌더 이전에 정의
  const fieldConfigs: {
    key: keyof AnalysisResult;
    label: string;
    placeholder?: string;
    multiline?: boolean;
    keyboardType?: KeyboardTypeOptions;
  }[] = [
    {
      key: 'recipientName',
      label: t('analysis.recipientName'),
      placeholder: t('analysis.recipientNamePlaceholder'),
    },
    {
      key: 'recipientPhone',
      label: t('analysis.recipientPhone'),
      keyboardType: 'phone-pad',
      placeholder: t('analysis.recipientPhonePlaceholder'),
    },
    {
      key: 'recipientAddress',
      label: t('analysis.recipientAddress'),
      placeholder: t('analysis.recipientAddressPlaceholder'),
      multiline: true,
    },
    {
      key: 'senderName',
      label: t('analysis.senderName'),
      placeholder: t('analysis.senderNamePlaceholder'),
    },
    {
      key: 'senderPhone',
      label: t('analysis.senderPhone'),
      keyboardType: 'phone-pad',
      placeholder: t('analysis.senderPhonePlaceholder'),
    },
    {
      key: 'trackingNumber',
      label: t('analysis.trackingNumber'),
      placeholder: t('analysis.trackingNumberPlaceholder'),
    },
    {
      key: 'packageType',
      label: t('analysis.packageType'),
      placeholder: t('analysis.packageTypePlaceholder'),
    },
    {
      key: 'weight',
      label: t('analysis.weight'),
      placeholder: t('analysis.weightPlaceholder'),
    },
    {
      key: 'deliveryDate',
      label: t('analysis.deliveryDate'),
      placeholder: t('analysis.deliveryDatePlaceholder'),
    },
    {
      key: 'deliveryTime',
      label: t('analysis.deliveryTime'),
      placeholder: t('analysis.deliveryTimePlaceholder'),
    },
    {
      key: 'status',
      label: t('analysis.status'),
      placeholder: t('analysis.statusPlaceholder'),
    },
    {
      key: 'notes',
      label: t('analysis.notes'),
      placeholder: t('analysis.notesPlaceholder'),
      multiline: true,
    },
  ];

  const changeHandlers = React.useMemo(() => {
    const handlers = {} as Record<keyof AnalysisResult, (v: string) => void>;
    fieldConfigs.forEach((cfg) => {
      handlers[cfg.key] = (v: string) => handleFieldChange(cfg.key, v);
    });
    return handlers;
  }, [handleFieldChange]);

  const onPressComplete = async () => {
    const success = await handleComplete();
    if (success) {
      Alert.alert(t('analysis.completeTitle'), t('analysis.completeMessage'), [
        {
          text: t('analysis.confirm'),
          onPress: () => router.push('/(tabs)'),
        },
      ]);
    } else {
      Alert.alert(t('analysis.errorTitle'), t('analysis.completeError'));
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={palette.tint} />
        <Text style={styles.loadingText}>{t('analysis.loading')}</Text>
      </View>
    );
  }

  if (error || !analysisResult || !editableData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error ?? t('analysis.errorGeneric')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalysis}>
          <Text style={styles.retryButtonText}>{t('analysis.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 촬영한 사진 */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: photoUri }} style={styles.capturedImage} />
        </View>

        {/* 분석 결과 */}
        <View style={styles.analysisContainer}>
          <Text style={styles.sectionTitle}>{t('analysis.resultTitle')}</Text>

          {fieldConfigs.map((cfg) => (
            <TextField
              key={cfg.key as string}
              label={cfg.label}
              value={editableData[cfg.key]}
              onChangeText={changeHandlers[cfg.key]}
              placeholder={cfg.placeholder}
              multiline={cfg.multiline}
              keyboardType={cfg.keyboardType}
            />
          ))}
        </View>
      </ScrollView>

      {/* 수령 완료 버튼 */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.completeButton} onPress={onPressComplete}>
          <Text style={styles.completeButtonText}>{t('analysis.complete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
