import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeImage, completeDelivery } from "../services/analysisService";
import type { AnalysisResult } from "../types/analysis";
import { t } from "../utils/i18n";

export function useAnalysis(photoUri?: string) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [editableData, setEditableData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  // 마운트/언마운트 시점 플래그 관리
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadAnalysis = useCallback(async () => {
    if (!photoUri) {
      setError(t("analysis.photoMissing"));
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      setIsLoading(true);
      const result = await analyzeImage(photoUri);
      if (!mountedRef.current) return;
      setAnalysisResult(result);
      setEditableData(result);
    } catch (e: any) {
      if (!mountedRef.current) return;
      setError(e?.message ?? t("analysis.analyzeError"));
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [photoUri]);

  // photoUri 변경 시 초기 로드 트리거
  useEffect(() => {
    if (photoUri) {
      loadAnalysis();
    } else {
      setIsLoading(false);
    }
  }, [photoUri, loadAnalysis]);

  const handleFieldChange = useCallback(
    (field: keyof AnalysisResult, value: string) => {
      setEditableData((prev) =>
        prev ? ({ ...prev, [field]: value } as AnalysisResult) : prev
      );
    },
    []
  );

  const handleComplete = async (): Promise<boolean> => {
    if (!editableData) return false;
    try {
      const success = await completeDelivery(editableData);
      return success;
    } catch {
      return false;
    }
  };

  return {
    isLoading,
    analysisResult,
    editableData,
    error,
    loadAnalysis,
    handleFieldChange,
    handleComplete,
  } as const;
}
