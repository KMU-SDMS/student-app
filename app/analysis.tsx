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

          <TextField
            label="수령인"
            value={editableData.recipientName}
            onChangeText={(value) => handleFieldChange("recipientName", value)}
            placeholder="수령인 이름"
          />

          <TextField
            label="수령인 연락처"
            value={editableData.recipientPhone}
            onChangeText={(value) => handleFieldChange("recipientPhone", value)}
            placeholder="수령인 연락처"
            keyboardType="phone-pad"
          />

          <TextField
            label="수령인 주소"
            value={editableData.recipientAddress}
            onChangeText={(value) =>
              handleFieldChange("recipientAddress", value)
            }
            placeholder="수령인 주소"
            multiline
          />

          <TextField
            label="발송인"
            value={editableData.senderName}
            onChangeText={(value) => handleFieldChange("senderName", value)}
            placeholder="발송인 이름"
          />

          <TextField
            label="발송인 연락처"
            value={editableData.senderPhone}
            onChangeText={(value) => handleFieldChange("senderPhone", value)}
            placeholder="발송인 연락처"
            keyboardType="phone-pad"
          />

          <TextField
            label="운송장 번호"
            value={editableData.trackingNumber}
            onChangeText={(value) => handleFieldChange("trackingNumber", value)}
            placeholder="운송장 번호"
          />

          <TextField
            label="택배 종류"
            value={editableData.packageType}
            onChangeText={(value) => handleFieldChange("packageType", value)}
            placeholder="택배 종류"
          />

          <TextField
            label="무게"
            value={editableData.weight}
            onChangeText={(value) => handleFieldChange("weight", value)}
            placeholder="무게"
          />

          <TextField
            label="배송일"
            value={editableData.deliveryDate}
            onChangeText={(value) => handleFieldChange("deliveryDate", value)}
            placeholder="배송일"
          />

          <TextField
            label="배송시간"
            value={editableData.deliveryTime}
            onChangeText={(value) => handleFieldChange("deliveryTime", value)}
            placeholder="배송시간"
          />

          <TextField
            label="배송상태"
            value={editableData.status}
            onChangeText={(value) => handleFieldChange("status", value)}
            placeholder="배송상태"
          />

          <TextField
            label="특이사항"
            value={editableData.notes}
            onChangeText={(value) => handleFieldChange("notes", value)}
            placeholder="특이사항"
            multiline
          />
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
