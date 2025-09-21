// API Gateway를 통한 이미지 분석 서비스
// 실제 구현 시에는 API Gateway 엔드포인트로 교체
import type { AnalysisResult } from "../types/analysis";
import { logger } from "../utils/logger";

// 모킹 데이터 생성 함수
const generateMockData = (): AnalysisResult => {
  const names = ['김철수', '이영희', '박민수', '최지영', '정현우'];
  const addresses = [
    '서울시 강남구 테헤란로 123',
    '서울시 서초구 서초대로 456',
    '서울시 송파구 올림픽로 789',
    '서울시 마포구 홍대입구역 101',
    '서울시 종로구 세종대로 202',
  ];
  const packageTypes = ['일반택배', '당일배송', '익일배송', '특급택배'];
  const statuses = ['배송완료', '배송중', '배송준비중', '배송지연'];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
  const randomPackageType = packageTypes[Math.floor(Math.random() * packageTypes.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    recipientName: randomName,
    recipientPhone: `010-${Math.floor(Math.random() * 9000) + 1000}-${
      Math.floor(Math.random() * 9000) + 1000
    }`,
    recipientAddress: randomAddress,
    senderName: names[Math.floor(Math.random() * names.length)],
    senderPhone: `010-${Math.floor(Math.random() * 9000) + 1000}-${
      Math.floor(Math.random() * 9000) + 1000
    }`,
    trackingNumber: Math.floor(Math.random() * 9000000000) + 1000000000 + '',
    packageType: randomPackageType,
    weight: `${(Math.random() * 5 + 0.5).toFixed(1)}kg`,
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: `${Math.floor(Math.random() * 12) + 9}:${Math.floor(Math.random() * 60)
      .toString()
      .padStart(2, '0')}`,
    status: randomStatus,
    notes: Math.random() > 0.5 ? '경비실에 맡김' : '문앞에 놓음',
  };
};

// 실제 API 호출 함수 (현재는 모킹)
export const analyzeImage = async (imageUri: string): Promise<AnalysisResult> => {
  try {
    // 2초 로딩 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 실제 구현 시에는 다음과 같이 API 호출
    /*
    const response = await fetch('https://your-api-gateway-url/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourAuthToken}`,
      },
      body: JSON.stringify({
        imageUri: imageUri,
      }),
    });
    
    if (!response.ok) {
      throw new Error('분석 요청 실패');
    }
    
    return await response.json();
    */

    // 현재는 모킹 데이터 반환
    const result = generateMockData();
    logger.info("이미지 분석 모킹 데이터 반환", { event: "analyzeImage.mock" });
    return result;
  } catch (error) {

    logger.error("이미지 분석 중 오류 발생", error, {
      event: "analyzeImage.error",
    });
    throw new Error("이미지 분석에 실패했습니다. 다시 시도해 주세요.");
  }
};

// 수령 완료 API (모킹)
export const completeDelivery = async (analysisData: AnalysisResult): Promise<boolean> => {
  try {
    // 1초 로딩 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 실제 구현 시에는 다음과 같이 API 호출
    /*
    const response = await fetch('https://your-api-gateway-url/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourAuthToken}`,
      },
      body: JSON.stringify(analysisData),
    });
    
    return response.ok;
    */

    // 현재는 성공으로 모킹

    logger.info("수령 완료 처리 성공", { event: "completeDelivery.mock" });
    return true;
  } catch (error) {
    logger.error("수령 완료 처리 중 오류 발생", error, {
      event: "completeDelivery.error",
    });
    throw new Error("수령 완료 처리에 실패했습니다. 다시 시도해 주세요.");
  }
};
