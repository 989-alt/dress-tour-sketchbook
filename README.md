# 드레스 투어 스케치북

웨딩드레스 시착 매장에서 본 드레스를, **Google Gemini** 로 신부 사진에 합성해 시각적으로 비교하는 도구.

## 기능

- 신부 사진 업로드 (얼굴은 외부 도구로 사전 마스킹 권장)
- 11축 파라메터(실루엣/넥라인/소매/보디스/등판/원단/컬러/스커트/장식/베일/헤어) 조합 → 자동 영문 프롬프트 생성
- 선택적 레퍼런스 드레스 사진 첨부 → AI가 그 디자인을 기반으로 합성
- 자유 텍스트 프롬프트 추가 ("더 빈티지한 느낌으로", "소매를 짧게" 등)
- 결과 이미지를 **PNG로 다운로드**
- 펜 스케치 오버레이 + 메타데이터(별점/장단점/인용/메모) 기록
- 여러 드레스를 그리드로 비교
- IndexedDB 영속 저장, JSON으로 백업/복원

## 아키텍처

- **프론트엔드**: Vite + React 18 + TypeScript + Tailwind
- **백엔드**: Vercel Node 서버리스 함수 (`api/generate.ts`) → Google Gemini API 프록시
- **저장소**: IndexedDB (idb) — 사진과 모든 엔트리가 브라우저 내부에만 저장됨
- **PWA**: 서비스 워커로 오프라인 자산 캐싱 (단, AI 합성은 네트워크 필요)

## 배포

### Vercel (권장 — AI 기능 작동)

1. Vercel 계정 + 이 저장소 import
2. Build & Output Settings: Vite preset 자동 인식 (별도 설정 불필요)
3. Environment Variables 설정:
   - `GEMINI_API_KEY` = Google AI Studio 발급 API 키
   - (선택) `GEMINI_MODEL` = 사용할 모델 ID (기본 `gemini-2.0-flash-exp`)
4. Deploy. 첫 빌드 후 단일 URL 제공.

### GitHub Pages (백업 — AI 미작동)

`main` 브랜치 push 시 자동 빌드/배포 (`.github/workflows/deploy-pages.yml`).
- URL: https://989-alt.github.io/dress-tour-sketchbook/
- ⚠️ Pages는 서버리스 함수를 지원하지 않으므로 **AI 합성 버튼이 작동하지 않습니다**. UI 탐색, 펜 스케치, 메타 입력은 가능.

## 로컬 개발

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 단위 테스트 (Vitest)
npm run build      # 정적 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

로컬에서 AI 기능을 시험하려면:
```bash
# .env.local 파일 생성
echo "GEMINI_API_KEY=your-key-here" > .env.local

# Vercel CLI로 dev 모드 실행 (서버리스 함수까지 같이 띄움)
npm i -g vercel
vercel dev
```

`npm run dev`는 Vite만 띄우므로 `/api/generate`가 404. `vercel dev`를 써야 함수가 같이 작동.

## 비용 / 프라이버시 안내

- **비용**: AI 합성 1회당 약 $0.04~0.10 USD (모델/이미지 크기 따라 변동). Google AI Studio의 무료 티어 한도 내에서 시도 권장.
- **프라이버시**: 신부 사진은 Vercel 서버를 거쳐 Google Gemini API로 전송됨. **얼굴은 업로드 전에 외부 도구로 마스킹(블러/모자이크) 처리하는 것을 강력히 권장.**
- Google API 정책상 입력 데이터는 24시간 내 삭제, 학습에는 사용 안 됨 (2024 정책 기준 — 최신 정책 확인 필요).
- 우리 백엔드는 사진을 디스크에 저장하지 않음 (메모리 통과 후 즉시 폐기).

## 라이선스

사적 사용 한정.
