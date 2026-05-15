# Design Guidelines — Story of the City

## 프로젝트 목적
픽셀 아트 힐링 집중 타이머. 타이머가 실행되는 동안 살아있는 도시가 성장하는 것을 감상한다.

---

## 고정 규칙 (변경 불가)

### 투영
- **아이소메트릭 2.5D 고정**. 탑다운/사이드뷰 금지.
- `iso(x, y, z) = { x: ox + (x−y)*(tw/2), y: oy + (x+y)*(th/2) − z*fh }`

### 해상도
- 논리 해상도 **960×540** 고정
- HiDPI: CSS 크기와 백킹 해상도를 분리, `devicePixelRatio` 반영
- 픽셀 스무딩 금지: `image-rendering: pixelated`

### 캔버스 레이아웃
- HUD 영역을 제외한 전체 화면을 Canvas가 점유
- 가로세로비 **16:9 고정**, letterbox/pillarbox로 여백 처리
- 양쪽 독립 stretch 금지

### 애니메이션
- **Start 상태에서만** 모든 도시 애니메이션 진행
- **Pause 시 완전 정지** — 차량, 조명, 깜빡임, 구름 등 모든 움직임 포함

### 맵 생성
- 새로고침/재접속 시 **매번 새로운 시드로 맵 재생성**
- 영구적 맵 재사용 금지

---

## 도시 발전 단계

| Stage | 누적 시간 | 특징 |
|-------|-----------|------|
| 0 | 0–2h | 낮은 밀도, 기초 건물 |
| 1 | 2–4h | 상업지구 확장 |
| 2 | 4–6h | 중층 건물 증가 |
| 3 | 6–8h | 고층 건물 등장 |
| 4 | 8h+ | 최고 밀도, 랜드마크 완성 |

- 각 단계는 구조적 변화 (아키타입 풀, 건물 높이, 교통 밀도)로 구분

---

## 시간대별 조명

| 시간대 | 조명 규칙 |
|--------|-----------|
| dawn | 낮은 채도, 청보라 앰비언트 |
| morning | 햇빛 우측상단, 긴 그림자 |
| day | 밝은 앰비언트, 선명한 그림자 |
| afternoon | 햇빛 좌측, 주황 틴트 |
| evening | 창문/가로등/네온 점등 시작 |
| night | 완전 야경, 차량 라이트 활성 |

---

## 불투명 규칙
- 건물, 자동차, 나무, 기타 모든 시각 요소 **완전 불투명**
- `rgba` / `globalAlpha` 사용 금지 (그림자 포함)
- 면 색상은 `hexRgb()`에서 직접 계산한 RGB로만 표현

---

## 건물/인프라 디자인 원칙
- 단순한 박스 형태 금지 — 지붕, 측면, 파사드, 창문, 간판, 구조물, 그림자 필수
- 8개 아키타입 (cornerCommercial, verticalTower, rooftopMidrise, lowCommercialBlock, steppedMass, landmarkTower, hubBuilding, backdropSimple)
- 도로, 광장, 통로, 브릿지, 공원은 의도적 공간으로 설계

## 차량 디자인 원칙
- 단순 블록/점 금지 — body + cab + windshield + wheels + lights 필수
- 주간: 차체 실루엣으로 판독 가능
- 야간: 헤드라이트/테일라이트 표현

## 프레이밍 규칙
- 카메라 시야 내에 빈 하늘/땅이 보이면 안 됨
- Foreground, hero midground, background 모두 화면을 적극 점유
