import { useEffect } from "react";
import { useCameraPermissions } from "expo-camera";

/**
 * 카메라 권한을 관리하는 커스텀 훅
 * @returns 카메라 권한 상태와 권한 요청 함수
 */
export const useCameraPermission = () => {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  return {
    permission,
    requestPermission,
    isLoading: !permission,
    isGranted: permission?.granted ?? false,
  };
};
