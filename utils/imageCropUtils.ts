// 이미지 크롭 관련 타입 정의
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageInfo {
  width: number;
  height: number;
  uri: string;
}

/**
 * 이미지의 orientation을 보정합니다.
 * @param imageUri - 보정할 이미지 URI
 * @returns orientation이 보정된 이미지 정보
 */
export const correctImageOrientation = async (
  imageUri: string
): Promise<ImageInfo> => {
  const { manipulateAsync } = await import("expo-image-manipulator");

  // orientation 보정을 위해 이미지를 한 번 처리
  const correctedImage = await manipulateAsync(
    imageUri,
    [], // 빈 배열로 orientation만 보정
    {
      format: "jpeg" as any,
      compress: 1.0, // 최고 품질로 보정
    }
  );

  return {
    width: correctedImage.width,
    height: correctedImage.height,
    uri: correctedImage.uri,
  };
};

/**
 * 카메라 뷰 좌표를 이미지 좌표로 변환하여 크롭 영역을 계산합니다.
 * @param imageInfo - 이미지 정보 (너비, 높이, URI)
 * @param cropArea - 화면상의 크롭 영역
 * @param cameraViewWidth - 카메라 뷰 너비
 * @param cameraViewHeight - 카메라 뷰 높이
 * @param insets - 안전 영역 정보
 * @returns 이미지 좌표계에서의 크롭 영역
 */
export const calculateImageCropArea = (
  imageInfo: ImageInfo,
  cropArea: CropArea,
  cameraViewWidth: number,
  cameraViewHeight: number,
  insets: { top: number; bottom: number }
): CropArea => {
  // 카메라 뷰 기준으로 좌표 변환
  const cameraCropArea = {
    x: cropArea.x,
    y: cropArea.y - insets.top,
    width: cropArea.width,
    height: cropArea.height,
  };

  // 카메라 뷰와 이미지의 aspect ratio 계산
  const cameraAspectRatio = cameraViewWidth / cameraViewHeight;
  const imageAspectRatio = imageInfo.width / imageInfo.height;

  // aspect ratio가 다를 경우, 이미지가 카메라 뷰에 어떻게 맞춰지는지 계산
  let imageDisplayWidth: number,
    imageDisplayHeight: number,
    offsetX: number,
    offsetY: number;

  if (imageAspectRatio > cameraAspectRatio) {
    // 이미지가 더 넓은 경우 - 높이에 맞춤
    imageDisplayHeight = cameraViewHeight;
    imageDisplayWidth = cameraViewHeight * imageAspectRatio;
    offsetX = (cameraViewWidth - imageDisplayWidth) / 2;
    offsetY = 0;
  } else {
    // 이미지가 더 높은 경우 - 너비에 맞춤
    imageDisplayWidth = cameraViewWidth;
    imageDisplayHeight = cameraViewWidth / imageAspectRatio;
    offsetX = 0;
    offsetY = (cameraViewHeight - imageDisplayHeight) / 2;
  }

  // 카메라 뷰 좌표를 이미지 좌표로 변환 (aspect ratio 고려)
  const scaleX = imageInfo.width / imageDisplayWidth;
  const scaleY = imageInfo.height / imageDisplayHeight;

  const imageCropArea = {
    x: (cameraCropArea.x - offsetX) * scaleX,
    y: (cameraCropArea.y - offsetY) * scaleY,
    width: cameraCropArea.width * scaleX,
    height: cameraCropArea.height * scaleY,
  };

  // 크롭 영역이 이미지 범위를 벗어나지 않도록 검증
  return {
    x: Math.max(
      0,
      Math.min(imageCropArea.x, imageInfo.width - imageCropArea.width)
    ),
    y: Math.max(
      0,
      Math.min(imageCropArea.y, imageInfo.height - imageCropArea.height)
    ),
    width: Math.min(imageCropArea.width, imageInfo.width),
    height: Math.min(imageCropArea.height, imageInfo.height),
  };
};

/**
 * 크롭 영역이 유효한지 검사합니다.
 * @param cropArea - 검사할 크롭 영역
 * @param imageInfo - 이미지 정보
 * @throws 크롭 영역이 유효하지 않은 경우 에러를 던집니다
 */
export const validateCropArea = (
  cropArea: CropArea,
  imageInfo: ImageInfo
): void => {
  if (cropArea.width <= 0 || cropArea.height <= 0) {
    throw new Error("Invalid crop area: width or height is zero or negative");
  }

  if (cropArea.x < 0 || cropArea.y < 0) {
    throw new Error("Invalid crop area: x or y is negative");
  }

  if (
    cropArea.x + cropArea.width > imageInfo.width ||
    cropArea.y + cropArea.height > imageInfo.height
  ) {
    throw new Error("Invalid crop area: exceeds image boundaries");
  }
};
