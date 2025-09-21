// 화면 크기 임계값
export const SMALL_SCREEN_HEIGHT_THRESHOLD = 700;
export const LARGE_SCREEN_HEIGHT_THRESHOLD = 900;

// 카메라 뷰 크기 설정
export const CAMERA_VIEW_WIDTH = {
  small: '98%' as const,
  medium: '90%' as const,
  large: '80%' as const,
};

export const CAMERA_VIEW_HEIGHT = {
  small: '80%' as const,
  medium: '70%' as const,
  large: '60%' as const,
};

// 컨트롤 및 안내 텍스트 오프셋
export const CONTROL_BOTTOM_OFFSET = {
  small: -120,
  medium: -110,
  large: -100,
};

export const GUIDE_TEXT_RIGHT_OFFSET = {
  small: -200,
  medium: -250,
  large: -300,
};
