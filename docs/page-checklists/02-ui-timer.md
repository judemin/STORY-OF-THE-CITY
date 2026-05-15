# Checklist 02 — UI & 타이머

## 완료 기준
Start/Pause 버튼이 정확히 동작하고, 누적 시간이 올바르게 증가한다.

## 체크리스트

- [ ] HUD가 화면 상단에 고정 배치됨
- [ ] Start 버튼 클릭 → `state.running = true`, 타이머 시작
- [ ] Pause 버튼 클릭 → `state.running = false`, 타이머 정지
- [ ] 타이머 표시: mm:ss 또는 hh:mm:ss 형식
- [ ] `state.totalSecs`가 누적 시간을 올바르게 추적
- [ ] 페이지 리로드 시 타이머 리셋 (또는 저장 정책 명시)
- [ ] HUD 높이가 Canvas 레이아웃 계산에 반영됨
