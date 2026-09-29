# 카페 주문 연습 — 실험 A

GitHub Pages 루트는 실험과 버전을 고르는 체험 화면입니다. 주소에 `?version=1`, `?version=2`, `?version=3`을 붙이면 해당 버전이 바로 열립니다. 버전 지정이 없거나 올바르지 않으면 버전 3을 표시합니다.

각 버전의 원본은 `versions/v1/`, `versions/v2/`, `versions/v3/`에 그대로 보관합니다. 상단 전환 화면은 루트의 `index.html`, `shell.css`, `shell.js`로 구성되며 원본 페이지를 iframe 안에 표시합니다. 이전 루트 버전 3의 `script.js`, `style.css`, `v2-overrides.css`, `v3-overrides.css`, `v3.js`도 보존합니다.

D 실험은 버전 1만 제공하므로 어느 버전에서 이동하더라도 버전 1로 연결됩니다.

로컬 확인: `node --test shell.test.js`
