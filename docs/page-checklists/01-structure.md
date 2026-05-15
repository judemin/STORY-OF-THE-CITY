# Checklist 01 — 구조 설계

## 완료 기준
모든 모듈이 ES module로 분리되어 있고, 빌드 없이 브라우저에서 동작한다.

## 체크리스트

- [ ] `src/constants.js` — 고정 상수만 포함 (TILE, GRID, LOGICAL_W/H, PALETTES 등)
- [ ] `src/state.js` — 앱 상태 단일 관리 (running, totalSecs, stage 등)
- [ ] `src/world.js` — 맵 생성 로직, export: cityBuildings, cityTiles, cityTraffic 등
- [ ] `src/render.js` — 렌더링 루프, export: canvas, ctx, resizeCanvas, render
- [ ] `src/ui.js` — HUD 이벤트 핸들러
- [ ] `src/time.js` — 시간대/광원 계산
- [ ] `index.html` — 모듈 진입점만, 로직 없음
- [ ] 순환 import 없음
- [ ] `run.sh` 또는 정적 서버로 실행 가능
