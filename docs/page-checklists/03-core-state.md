# Checklist 03 — 코어 상태/시간 흐름

## 완료 기준
Stage 전환과 시간대 계산이 정확히 동작한다.

## 체크리스트

- [ ] `state.running` 변화가 렌더 루프에 즉시 반영됨
- [ ] Stage 0–4 전환이 올바른 누적 시간 기준으로 발생 (0/2/4/6/8h)
- [ ] Stage 전환 시 `buildCity()` 재호출 또는 시각 변화 발생
- [ ] `getTimeOfDay()` 가 실제 시스템 시각 기반으로 동작
- [ ] dawn/morning/day/afternoon/evening/night 6구간 정확히 분기
- [ ] `state.stage`와 `tod`가 렌더링에 올바르게 전달됨
