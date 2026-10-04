/*
 * Page-view counting with GoatCounter: no cookies and no personal data kept.
 *
 * Docusaurus swaps pages in the browser after the first load, so a plain
 * counter script would see only the landing page. The script's own onload
 * count is turned off and every route change is counted here instead,
 * including the first render. Only the published site counts; the dev server
 * and local builds do not.
 */
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

const ENDPOINT = 'https://femu.goatcounter.com/count';
const SITE_HOST = 'femu-ose.github.io';

let pending = [];

function enabled() {
  return ExecutionEnvironment.canUseDOM && window.location.hostname === SITE_HOST;
}

/* count.js loads asynchronously; hold page views until it is ready. */
function flush() {
  const gc = window.goatcounter;
  if (!gc || typeof gc.count !== 'function') return;
  pending.forEach((path) => gc.count({path}));
  pending = [];
}

if (enabled()) {
  window.goatcounter = {no_onload: true};
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = ENDPOINT;
  script.onload = flush;
  document.head.appendChild(script);
}

export function onRouteDidUpdate({location, previousLocation}) {
  if (!enabled()) return;
  /* A jump to an anchor on the same page is not a new page view. */
  if (previousLocation && location.pathname === previousLocation.pathname) return;
  pending.push(location.pathname);
  flush();
}
