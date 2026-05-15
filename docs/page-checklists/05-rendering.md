# Checklist 05 — 렌더링 시스템

## 완료 기준
960×540 논리 해상도로 HiDPI 대응되며, 화면이 깨끗하게 가득 찬다.

## 체크리스트

- [ ] Canvas 논리 해상도 960×540 고정
- [ ] `devicePixelRatio` 반영한 backing 해상도 설정
- [ ] `image-rendering: pixelated` 적용, 스무딩 없음
- [ ] 16:9 letterbox/pillarbox resize 동작 (독립 stretch 없음)
- [ ] HUD 높이 반영한 availH 계산
- [ ] painter's algorithm — `sortKey = (x+y)*100 + z` 기준 정렬
- [ ] 건물 left/right/top face 색상 — hexRgb 직접 계산, rgba 없음
- [ ] 지면 타일 다이아몬드 렌더링
- [ ] Backdrop 건물 `tBack = t*0.6+0.10` 대기 틴트 렌더링
- [ ] `state.running` false 시 `animTick` 정지
- [ ] 차량 픽셀아트 렌더링 (body/cab/windshield/wheels/lights)
