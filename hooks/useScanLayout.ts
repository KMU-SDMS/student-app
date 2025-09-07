import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import {
  SMALL_SCREEN_HEIGHT_THRESHOLD,
  LARGE_SCREEN_HEIGHT_THRESHOLD,
  CAMERA_VIEW_WIDTH,
  CAMERA_VIEW_HEIGHT,
  CONTROL_BOTTOM_OFFSET,
  GUIDE_TEXT_RIGHT_OFFSET,
} from "../constants/layoutConstants";

export function useScanLayout() {
  const { height: windowHeight } = useWindowDimensions();

  const layout = useMemo(() => {
    const isSmallScreen = windowHeight < SMALL_SCREEN_HEIGHT_THRESHOLD;
    const isLargeScreen = windowHeight > LARGE_SCREEN_HEIGHT_THRESHOLD;

    const cameraViewWidth = isSmallScreen
      ? CAMERA_VIEW_WIDTH.small
      : isLargeScreen
      ? CAMERA_VIEW_WIDTH.large
      : CAMERA_VIEW_WIDTH.medium;

    const cameraViewHeight = isSmallScreen
      ? CAMERA_VIEW_HEIGHT.small
      : isLargeScreen
      ? CAMERA_VIEW_HEIGHT.large
      : CAMERA_VIEW_HEIGHT.medium;

    const controlBottomOffset = isSmallScreen
      ? CONTROL_BOTTOM_OFFSET.small
      : isLargeScreen
      ? CONTROL_BOTTOM_OFFSET.large
      : CONTROL_BOTTOM_OFFSET.medium;

    const guideTextRightOffset = isSmallScreen
      ? GUIDE_TEXT_RIGHT_OFFSET.small
      : isLargeScreen
      ? GUIDE_TEXT_RIGHT_OFFSET.large
      : GUIDE_TEXT_RIGHT_OFFSET.medium;

    return {
      isSmallScreen,
      isLargeScreen,
      cameraViewWidth,
      cameraViewHeight,
      controlBottomOffset,
      guideTextRightOffset,
    } as const;
  }, [windowHeight]);

  return layout;
}
