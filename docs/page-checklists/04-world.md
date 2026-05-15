# Checklist 04 — 월드/맵 생성

## 완료 기준
새로고침마다 다른 도시가 생성되고, 화면 안에 빈 공간이 없다.

## 체크리스트

- [ ] 시드가 매 호출마다 새로 생성됨 (`Date.now() ^ Math.random()`)
- [ ] 42×42 그리드 정상 생성
- [ ] 타일 타입 (road/plaza/walk/park/service/lot) 올바르게 할당
- [ ] H_ROADS / V_ROADS 기준 도로망 구성
- [ ] Hero block 13개 건물 배치 (lot 타일에만)
- [ ] `canPlace()` 점유 충돌 방지 동작
- [ ] Perimeter fill — 화면 상단/하단 가장자리 빈 공간 없음
- [ ] Stage별 아키타입 풀(STAGE_ARCHETYPE) 적용
- [ ] 교통(cityTraffic) 생성, Stage별 밀도 차이 있음
- [ ] cityBackdrop export 및 render.js 연결 완료
