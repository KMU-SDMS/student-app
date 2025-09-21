import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';

import { IMAGE_QUALITY, ERROR_MESSAGE_TIMEOUT } from '../constants/cameraConstants';
import { logger } from '../utils/logger';
import { t } from '../utils/i18n';
import type { AnalysisRouteParams } from '../types/navigation';

type CameraRef = React.MutableRefObject<CameraView | null>;

export function useCameraCapture() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCameraReady, setCameraReady] = useState(false);

  const clearError = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };
  }, []);

  const capture = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setErrorMessage(null);
    try {
      const camera = cameraRef.current;
      if (!camera) {
        setIsCapturing(false);
        return;
      }
      const photo = await camera.takePictureAsync({
        quality: IMAGE_QUALITY,
        skipProcessing: false,
      });
      if (photo?.uri) {
        const params: AnalysisRouteParams = { photoUri: photo.uri };
        router.push({ pathname: '/analysis', params });
      }
    } catch (e) {
      logger.error('Capture error', e, {
        screen: 'Scan',
        event: 'takePicture',
      });
      const capturedErrorMessage = e instanceof Error ? e.message : t('scan.unknownError');
      setErrorMessage(`${t('scan.captureErrorPrefix')}${capturedErrorMessage}`);

      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setErrorMessage(null);
        errorTimeoutRef.current = null;
      }, ERROR_MESSAGE_TIMEOUT);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, router]);

  return {
    cameraRef: cameraRef as CameraRef,
    capture,
    isCapturing,
    errorMessage,
    clearError,
    isCameraReady,
    setCameraReady,
  };
}
