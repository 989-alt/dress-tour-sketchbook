# 드레스 투어 스케치북

웨딩드레스 시착 매장에서 본 드레스를 그림 솜씨와 무관하게 슬라이더/체크박스만으로 디지털 재구성하는 도구.

## 특징
- 모든 처리는 브라우저 안에서만 일어남 (사진은 서버로 전송되지 않음)
- MediaPipe Pose로 신부 사진의 인체 키포인트 자동 추출
- 9종 실루엣 + (T11~T22 진행 예정인) 11축 파라메트릭 빌더
- 펜 스케치 오버레이로 합성이 못 잡는 디테일 보완
- IndexedDB에 자동 저장 (수동 백업 권장)

## 빠른 시작
- npm install
- npm run dev (개발 서버, http://localhost:5173)
- npm test (단위 테스트)
- npm run build (정적 빌드)
- npm run preview (빌드 결과 미리보기)

## MediaPipe 모델 설치
포즈 검출을 위해 다음 파일을 `public/mediapipe-models/`에 배치해야 합니다:
- (자세한 안내는 `public/mediapipe-models/README.txt` 참조)

모델이 없어도 앱은 작동합니다 — 포즈 검출 실패 시 수동 앵커 모드로 진행됩니다.

## 배포
- Vercel 단일 URL 정적 호스팅
- 백엔드 / 인증 / 외부 API 호출 없음

## 라이선스
사적 사용 한정.
