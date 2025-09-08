import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { CameraView } from 'expo-camera';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useCameraPermission } from '../../hooks/useCameraPermission';
import { ERROR_MESSAGE_TIMEOUT } from '../../constants/cameraConstants';
import { scanStyles } from '../../styles/scanStyles';
import { CameraControls } from '../../components/CameraControls';
import { useScanLayout } from '../../hooks/useScanLayout';
import { t } from '../../utils/i18n';
import { useCameraCapture } from '../../hooks/useCameraCapture';
import { useTimedMessage } from '../../hooks/useTimedMessage';

export default function ScanTabScreen() {
  const {
    cameraRef,
    capture,
    isCapturing,
    errorMessage,
    clearError,
    isCameraReady,
    setCameraReady,
  } = useCameraCapture();
  const { requestPermission, isLoading, isGranted } = useCameraPermission();
  const [torchOn, setTorchOn] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const {
    message: timedMessage,
    show: showMessage,
    clear: clearMessage,
  } = useTimedMessage(ERROR_MESSAGE_TIMEOUT);
  const { cameraViewWidth, cameraViewHeight, controlBottomOffset } = useScanLayout();
  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        clearError();
        clearMessage();
        setTorchOn(false);
        setCameraReady(false);
      };
    }, []),
  );

  const handleCapture = useCallback(async () => {
    if (!isCameraReady || !isFocused) {
      showMessage(t('scan.cameraNotReady'), 1500);
      return;
    }
    await capture();
  }, [capture, isCameraReady, isFocused, showMessage]);

  const handleToggleTorch = useCallback(() => {
    if (!isCameraReady || !isFocused) {
      showMessage(t('scan.cameraNotReady'), 1500);
      return;
    }
    setTorchOn((v) => !v);
  }, [isCameraReady, isFocused, showMessage]);

  React.useEffect(() => {
    if (errorMessage) {
      showMessage(errorMessage, ERROR_MESSAGE_TIMEOUT);
    }
  }, [errorMessage, showMessage]);

  if (isLoading) {
    return (
      <View style={scanStyles.center}>
        <Text accessibilityRole="text" accessibilityLabel={t('scan.loadingPermission')}>
          {t('scan.loadingPermission')}
        </Text>
      </View>
    );
  }

  if (!isGranted) {
    return (
      <View style={scanStyles.center}>
        <Text accessibilityRole="text" accessibilityLabel={t('scan.permissionRequired')}>
          {t('scan.permissionRequired')}
        </Text>
        <TouchableOpacity
          style={scanStyles.primaryButton}
          onPress={requestPermission}
          accessibilityRole="button"
          accessibilityLabel={t('scan.allowPermission')}
          accessibilityHint={t('scan.allowPermissionHint')}
        >
          <Text style={scanStyles.primaryText}>{t('scan.allowPermission')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={scanStyles.container}>
      {isFocused && (
        <View
          style={[
            scanStyles.cameraView,
            {
              width: cameraViewWidth,
              height: cameraViewHeight,
            },
          ]}
        >
          <CameraView
            ref={(ref) => {
              cameraRef.current = ref;
            }}
            style={scanStyles.cameraViewInner}
            facing="back"
            enableTorch={torchOn}
            onCameraReady={() => setCameraReady(true)}
          />
          <View
            style={[
              scanStyles.guideTextContainer,
              {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Text
              style={scanStyles.guideText}
              accessibilityRole="text"
              accessibilityLabel={t('scan.guideText')}
            >
              {t('scan.guideText')}
            </Text>
          </View>
        </View>
      )}
      {timedMessage && (
        <View style={scanStyles.errorContainer}>
          <Text
            style={scanStyles.errorText}
            accessibilityLiveRegion="polite"
            accessibilityRole="text"
            accessibilityLabel={timedMessage}
          >
            {timedMessage}
          </Text>
        </View>
      )}

      <CameraControls
        torchOn={torchOn}
        onTorchToggle={handleToggleTorch}
        onCapture={handleCapture}
        isCapturing={isCapturing || !isCameraReady || !isFocused}
        bottomOffset={tabBarHeight + controlBottomOffset}
        insetsBottom={insets.bottom}
      />
    </View>
  );
}
