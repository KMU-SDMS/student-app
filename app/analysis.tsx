import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { AnalysisRouteParams } from "../types/navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAnalysis } from "../hooks/useAnalysis";
import TextField from "../components/form/TextField";
import type { AnalysisResult } from "../types/analysis";
import type { KeyboardTypeOptions } from "react-native";
import { useColorScheme } from "../hooks/useColorScheme";
import { createAnalysisStyles } from "../styles/analysisStyles";

export default function AnalysisScreen() {
  const { photoUri } = useLocalSearchParams<AnalysisRouteParams>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const styles = createAnalysisStyles(
    colorScheme === "dark" ? "dark" : "light"
  );

  const {
    isLoading,
    analysisResult,
    editableData,
    error,
    loadAnalysis,
    handleFieldChange,
    handleComplete,
  } = useAnalysis(photoUri);

  const onPressComplete = async () => {
    const success = await handleComplete();
    if (success) {
      Alert.alert("수령 완료", "택배 수령이 완료되었습니다.", [
        {
          text: "확인",
          onPress: () => router.push("/(tabs)"),
        },
      ]);
    } else {
      Alert.alert("오류", "수령 완료 처리 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2f6ef6" />
        <Text style={styles.loadingText}>사진을 분석하고 있습니다...</Text>
      </View>
    );
  }

  if (error || !analysisResult || !editableData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>
          {error ?? "분석 결과를 불러올 수 없습니다."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalysis}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fieldConfigs: {
    key: keyof AnalysisResult;
    label: string;
    placeholder?: string;
    multiline?: boolean;
    keyboardType?: KeyboardTypeOptions;
  }[] = [
    { key: "recipientName", label: "수령인", placeholder: "수령인 이름" },
    {
      key: "recipientPhone",
      label: "수령인 연락처",
      keyboardType: "phone-pad",
      placeholder: "수령인 연락처",
    },
    {
      key: "recipientAddress",
      label: "수령인 주소",
      placeholder: "수령인 주소",
      multiline: true,
    },
    { key: "senderName", label: "발송인", placeholder: "발송인 이름" },
    {
      key: "senderPhone",
      label: "발송인 연락처",
      keyboardType: "phone-pad",
      placeholder: "발송인 연락처",
    },
    { key: "trackingNumber", label: "운송장 번호", placeholder: "운송장 번호" },
    { key: "packageType", label: "택배 종류", placeholder: "택배 종류" },
    { key: "weight", label: "무게", placeholder: "무게" },
    { key: "deliveryDate", label: "배송일", placeholder: "배송일" },
    { key: "deliveryTime", label: "배송시간", placeholder: "배송시간" },
    { key: "status", label: "배송상태", placeholder: "배송상태" },
    {
      key: "notes",
      label: "특이사항",
      placeholder: "특이사항",
      multiline: true,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 촬영한 사진 */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: photoUri }} style={styles.capturedImage} />
        </View>

        {/* 분석 결과 */}
        <View style={styles.analysisContainer}>
          <Text style={styles.sectionTitle}>분석 결과</Text>

          {fieldConfigs.map((cfg) => (
            <TextField
              key={cfg.key as string}
              label={cfg.label}
              value={editableData[cfg.key]}
              onChangeText={(v) => handleFieldChange(cfg.key, v)}
              placeholder={cfg.placeholder}
              multiline={cfg.multiline}
              keyboardType={cfg.keyboardType}
            />
          ))}
        </View>
      </ScrollView>

      {/* 수령 완료 버튼 */}
      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}
      >
        <TouchableOpacity
          style={styles.completeButton}
          onPress={onPressComplete}
        >
          <Text style={styles.completeButtonText}>수령 완료</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
