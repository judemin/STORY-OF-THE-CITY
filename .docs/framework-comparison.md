# Framework Comparison

## 비교 항목

| 항목 | 순수 Canvas 2D | PixiJS | Phaser | Three.js |
|------|----------------|--------|--------|----------|
| 픽셀 아트 적합성 | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ |
| 애니메이션 제어 | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ |
| 유지보수성 | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ |
| 현재 프로젝트 적합성 | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ |

## 세부 분석

**순수 Canvas 2D API** (렌더링 레이어 — 현재 사용 중)
- 의존성 0, 표준 Web API
- `image-rendering: pixelated`로 픽셀 스무딩 직접 제어
- `state.running` 기반 animTick 정지가 가장 직관적
- HiDPI backing 해상도 완전 제어
- 렌더링 로직은 React 비의존 — `src/*.js` 모듈로 분리 유지

**Vite + React** (빌드/쉘 레이어 — 현재 사용 중)
- Canvas 렌더링 로직에 관여하지 않음
- `App.jsx`가 DOM 구조(HUD + canvas + overlay)를 JSX로 선언
- `useEffect`에서 `import('./main.js')` → 기존 부트스트랩 코드 그대로 실행
- Vercel Git 연동 자동 빌드/배포 지원
- `npm run dev / build / preview` 표준 워크플로

**PixiJS**
- WebGL 가속, 스프라이트 기반
- 픽셀 아트 설정 가능하나 기본값이 아님
- 번들 필요, 오버헤드 존재

**Phaser**
- 게임 엔진 전용, 타이머 앱에 과도
- 엔진 생명주기에 맞춰야 해서 state 제어 복잡

**Three.js**
- 3D WebGL, 픽셀 아트 감성과 근본적으로 맞지 않음

## 결론

- **렌더링**: 순수 Canvas 2D API 유지 (960×540 고정, 완전 불투명, Start/Pause 제어, 픽셀 스무딩 금지)
- **빌드/배포 쉘**: Vite + React (Vercel 자동 배포, 표준 개발 워크플로)
- Canvas 로직과 React 쉘은 서로 독립적이며, React는 DOM 마운트 포인트 역할만 담당
