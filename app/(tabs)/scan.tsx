import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function ScanTabScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState(0); // 카메라 재마운트를 위한 key
  const [isFocused, setIsFocused] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomOffset = tabBarHeight; // 카메라는 전체로 두고, 컨트롤만 탭바 만큼 올림

  // 탭 포커스 상태 관리
  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      // 탭이 포커스될 때마다 카메라를 재마운트
      setCameraKey(prev => prev + 1);
      
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View style={styles.center}><Text>권한 확인 중...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setErrorMessage(null);
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (photo?.uri) {
        // 분석 페이지로 이동 (사진 URI 전달)
        router.push({
          pathname: '/analysis',
          params: { photoUri: photo.uri }
        });
      }
    } catch (e) {
      setErrorMessage('촬영 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsCapturing(false);
    }
  };

  // 갤러리 선택 기능 제거됨

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          key={cameraKey}
          ref={(ref) => { cameraRef.current = ref; }}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
        />
      )}

      {/* 하단 컨트롤 */}
      <View style={[styles.controls, { bottom: bottomOffset + 16 + insets.bottom }]}> 
        <View style={styles.ctrlLeft}>
          <TouchableOpacity onPress={() => setTorchOn((v) => !v)} style={styles.ctrlButton}>
            <Text style={styles.ctrlText}>{torchOn ? '플래시 끔' : '플래시 켬'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.shutter} onPress={handleCapture} disabled={isCapturing}>
          <View style={[styles.shutterInner, isCapturing && { opacity: 0.6 }]} />
        </TouchableOpacity>

        <View style={styles.ctrlSpacer} />
      </View>
    </View>
  );
}

const FRAME_SIZE = 260;
const CORNER = 22;
const BORDER = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
  },
  hint: {
    marginTop: 12,
    color: '#fff',
  },
  errorText: {
    marginTop: 6,
    color: '#ffb4b4',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctrlLeft: {
    minWidth: 84,
    alignItems: 'flex-start',
  },
  ctrlSpacer: {
    minWidth: 84,
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#e6e6e6',
  },
  ctrlButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  ctrlText: {
    color: '#fff',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#2f6ef6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
  },
});


