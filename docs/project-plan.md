# Project Plan — Story of the City

각 단계 체크리스트는 `docs/page-checklists/` 참조.

---

## Phase 1 — 구조 설계
- [ ] 파일/모듈 분리 (constants, state, world, render, ui, time)
- [ ] ES module import/export 구조 확정
- [ ] 빌드 없이 순수 모듈로 동작 확인

## Phase 2 — 기본 UI와 타이머
- [ ] HUD 레이아웃 (Start/Pause, 시간 표시)
- [ ] 타이머 누적 시간 정확히 동작
- [ ] Start/Pause 상태 전환 정확히 동작

## Phase 3 — 코어 상태/시간 흐름
- [ ] `state.running`, `state.totalSecs` 관리
- [ ] Stage 전환 로직 (0~4단계)
- [ ] 실제 시각 기반 시간대(tod) 계산

## Phase 4 — 월드/맵 생성
- [ ] 시드 기반 랜덤 (새로고침마다 새 시드)
- [ ] 42×42 그리드, 타일 타입 할당
- [ ] Hero block 배치 (고정 디자인)
- [ ] 블록 채우기, 도로/광장/공원 구조
- [ ] Perimeter fill (화면 가장자리 빈 공간 방지)

## Phase 5 — 렌더링 시스템
- [ ] 960×540 논리 해상도, HiDPI 대응
- [ ] 16:9 letterbox/pillarbox resize
- [ ] painter's algorithm 정렬
- [ ] 건물 면 색상 (left/right/top face)
- [ ] 지면 타일 렌더링
- [ ] Backdrop 건물 대기 틴트 렌더링

## Phase 6 — 도시 발전 시스템
- [ ] Stage별 아키타입 풀 (STAGE_ARCHETYPE)
- [ ] Stage별 건물 높이 (heroH)
- [ ] Stage별 교통 밀도, 차량 속도
- [ ] 단계 전환 시 시각적 구조 변화 명확

## Phase 7 — 시간대/광원 시스템
- [ ] dawn/morning/day/afternoon/evening/night 6구간
- [ ] 앰비언트 색상 변화
- [ ] 창문 점등 (evening~night)
- [ ] 가로등/네온 점등
- [ ] 주간 그림자 방향

## Phase 8 — 차량/생활감 시스템
- [ ] 차량 픽셀아트 (body+cab+windshield+wheels+lights)
- [ ] 도로 방향별 이동
- [ ] 야간 헤드라이트/테일라이트
- [ ] Stage별 차량 밀도

## Phase 9 — 디자인 폴리시
- [ ] 건물 아키타입 시각 품질 검수
- [ ] 모든 요소 완전 불투명 확인
- [ ] 빈 카메라 공간 없음 확인
- [ ] 시간대별 조명 자연스러움

## Phase 10 — 테스트/검수
- [ ] 블랙박스 테스트 전항목 통과 (`.docs/blackbox-test.md` 기준)
- [ ] 해상도/HiDPI 멀티 환경 확인
- [ ] 장시간 실행 안정성
