# Phase Plan — Story of the City

> 구현 전에 이 문서와 design-guidelines.md를 먼저 읽는다.

## 빌드 환경

- **프레임워크**: Vite + React (JavaScript)
- **진입점**: `src/main.jsx` → `src/App.jsx`
- **로직 모듈**: `src/*.js` (기존 그대로 유지, React 비의존)
- **CSS**: `styles/*.css` (기존 그대로, `src/main.jsx`에서 import)

## Phase 1 — 구조 설계 ✅
- [x] 모듈 분리: constants / state / world / render / ui / time
- [x] ES module import/export 구조 확정
- [x] 순환 import 없음
- [x] Vite + React 기반 빌드/서빙 구조로 전환
- [x] `src/App.jsx`: DOM 구조 JSX, `useEffect`에서 `import('./main.js')` 호출
- [x] `src/main.jsx`: React 진입점 + CSS import

## Phase 2 — 기본 UI & 타이머 ✅
- [x] HUD: Start/Pause 버튼, 시간 표시
- [x] `state.running` 토글 정확히 동작
- [x] `state.totalSecs` 누적 정확히 동작
- [x] HUD 높이 Canvas 레이아웃에 반영

## Phase 3 — 코어 상태/시간 흐름 ✅
- [x] Stage 0–4 전환 (0/2/4/6/8h 기준)
- [x] `getTimeOfDay()` 실제 시각 기반
- [x] dawn/morning/day/afternoon/evening/night 분기
- [x] stage + tod → render에 전달

## Phase 4 — 월드/맵 생성 ✅
- [x] 시드 매 호출마다 새로 생성
- [x] 42×42 그리드, 타일 타입 할당
- [x] Hero block 고정 배치 (lot 타일에만)
- [x] Perimeter fill (화면 가장자리 빈 공간 방지)
- [x] Stage별 아키타입 풀 적용
- [x] cityBackdrop export

## Phase 5 — 렌더링 시스템 ✅
- [x] 960×540 논리 해상도, HiDPI 대응
- [x] zoom-fill resize (PC/모바일 각각)
- [x] painter's algorithm 정렬
- [x] 건물 face 색상 (hexRgb 직접 계산, rgba 없음)
- [x] Backdrop 대기 틴트 렌더링
- [x] `state.running` false 시 animTick 정지

## Phase 6 — 도시 발전 시스템 ✅
- [x] Stage별 아키타입 풀 (STAGE_ARCHETYPE)
- [x] Stage별 heroH 높이 변화
- [x] Stage별 교통 밀도/속도
- [x] 단계 전환 시 시각적 구조 변화 명확

## Phase 7 — 시간대/광원 시스템 ✅
- [x] 앰비언트 색상 6구간 변화
- [x] 창문/가로등/네온 evening~night 점등
- [x] 주간 그림자 방향 변화
- [x] 야간 차량 헤드라이트/테일라이트

## Phase 8 — 차량/생활감 시스템 ✅
- [x] 차량 픽셀아트 (body+cab+windshield+wheels+lights)
- [x] 도로 방향별 이동
- [x] Stage별 차량 밀도 차이

## Phase 9 — 디자인 폴리시 ✅
- [x] 8개 아키타입 시각 품질 검수
- [x] 모든 요소 완전 불투명 확인
- [x] 빈 카메라 공간 없음 확인
- [x] Stage 0도 이미 도시처럼 보임

## Phase 10 — 테스트/검수
- [ ] blackbox-test.md 전항목 통과
- [ ] HiDPI 환경 확인
- [ ] 30분 이상 실행 안정성
- [ ] 콘솔 에러 없음
