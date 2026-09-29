(function (root) {
  'use strict';

  const experiments = new Set([
    'a-ai-only', 'b-design-md', 'c-design-figma-mcp', 'd-design-figma-mcp-actively'
  ]);

  function getVersion(search) {
    const version = new URLSearchParams(search).get('version');
    return version === '1' || version === '2' || version === '3' ? Number(version) : 3;
  }

  function getExperimentUrl(slug, version) {
    if (!experiments.has(slug)) throw new Error('Unknown experiment');
    const targetVersion = slug === 'd-design-figma-mcp-actively' ? 1 : version;
    return `https://luckybridge.github.io/knollab-001-${slug}/?version=${targetVersion}`;
  }

  function initialize() {
    const version = getVersion(root.location.search);
    const frame = root.document.getElementById('versionFrame');
    frame.src = `versions/v${version}/index.html`;
    frame.title = `실험 A, 버전 ${version} 카페 주문 연습`;
    root.document.getElementById('currentLabel').textContent = `AI만 사용 · 버전 ${version}`;

    for (const link of root.document.querySelectorAll('.version-link')) {
      if (Number(link.dataset.version) === version) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    for (const link of root.document.querySelectorAll('.experiment-link')) {
      link.href = getExperimentUrl(link.dataset.experiment, version);
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getVersion, getExperimentUrl };
  }
  if (root && root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', initialize);
    else initialize();
  }
})(typeof window !== 'undefined' ? window : globalThis);
