import React from "react";
import {
  StyleSheet,
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

export default function AnalysisScreen() {
  const { photoUri } = useLocalSearchParams<AnalysisRouteParams>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  capturedImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  analysisContainer: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
    color: "#333",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  completeButton: {
    backgroundColor: "#2f6ef6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2f6ef6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
