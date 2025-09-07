import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { AnalysisRouteParams } from "../types/navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { analyzeImage, completeDelivery } from "../services/analysisService";

interface AnalysisResult {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  senderName: string;
  senderPhone: string;
  trackingNumber: string;
  packageType: string;
  weight: string;
  deliveryDate: string;
  deliveryTime: string;
  status: string;
  notes: string;
}

export default function AnalysisScreen() {
  const { photoUri } = useLocalSearchParams<AnalysisRouteParams>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [editableData, setEditableData] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (photoUri) {
      loadAnalysis();
    }
  }, [photoUri]);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      const result = await analyzeImage(photoUri);
      setAnalysisResult(result);
      setEditableData(result);
    } catch (error) {
      console.error("분석 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof AnalysisResult, value: string) => {
    if (editableData) {
      setEditableData({
        ...editableData,
        [field]: value,
      });
    }
  };

  const handleComplete = async () => {
    if (!editableData) return;

    try {
      const success = await completeDelivery(editableData);
      if (success) {
        Alert.alert("수령 완료", "택배 수령이 완료되었습니다.", [
          {
            text: "확인",
            onPress: () => router.push("/(tabs)"),
          },
        ]);
      }
    } catch (error) {
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

  if (!analysisResult || !editableData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>분석 결과를 불러올 수 없습니다.</Text>
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

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>수령인</Text>
            <TextInput
              style={styles.fieldInput}
              value={editableData.recipientName}
              onChangeText={(value) =>
                handleFieldChange("recipientName", value)
              }
              placeholder="수령인 이름"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>수령인 연락처</Text>
            <TextInput
              style={styles.fieldInput}
              value={editableData.recipientPhone}
              onChangeText={(value) =>
                handleFieldChange("recipientPhone", value)
              }
              placeholder="수령인 연락처"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>수령인 주소</Text>
            <TextInput
              style={[styles.fieldInput, styles.multilineInput]}
              value={editableData.recipientAddress}
              onChangeText={(value) =>
                handleFieldChange("recipientAddress", value)
              }
              placeholder="수령인 주소"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>발송인</Text>
            <TextInput
              style={styles.fieldInput}
              value={editableData.senderName}
              onChangeText={(value) => handleFieldChange("senderName", value)}
              placeholder="발송인 이름"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>발송인 연락처</Text>
            <TextInput
              style={styles.fieldInput}
              value={editableData.senderPhone}
              onChangeText={(value) => handleFieldChange("senderPhone", value)}
              placeholder="발송인 연락처"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>운송장 번호</Text>
            <TextInput
              style={styles.fieldInput}
              value={editableData.trackingNumber}
              onChangeText={(value) =>
                handleFieldChange("trackingNumber", value)
              }
              placeholder="운송장 번호"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>택배 종류</Text>
            <TextInput
              style={styles.fieldInput}
              value={editableData.packageType}
              onChangeText={(value) => handleFieldChange("packageType", value)}
              placeholder="택배 종류"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>무게</Text>
            <TextInput
              style={styles.fieldInput}
              value={editableData.weight}
              onChangeText={(value) => handleFieldChange("weight", value)}
              placeholder="무게"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>배송일</Text>
            <TextInput
              style={styles.fieldInput}
              value={editableData.deliveryDate}
              onChangeText={(value) => handleFieldChange("deliveryDate", value)}
              placeholder="배송일"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>배송시간</Text>
            <TextInput
              style={styles.fieldInput}
              value={editableData.deliveryTime}
              onChangeText={(value) => handleFieldChange("deliveryTime", value)}
              placeholder="배송시간"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>배송상태</Text>
            <TextInput
              style={styles.fieldInput}
              value={editableData.status}
              onChangeText={(value) => handleFieldChange("status", value)}
              placeholder="배송상태"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>특이사항</Text>
            <TextInput
              style={[styles.fieldInput, styles.multilineInput]}
              value={editableData.notes}
              onChangeText={(value) => handleFieldChange("notes", value)}
              placeholder="특이사항"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      {/* 수령 완료 버튼 */}
      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}
      >
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
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
