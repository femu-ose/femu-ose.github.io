import React, {useEffect, useRef} from 'react';
import {useHistory, useLocation} from '@docusaurus/router';

// Mermaid renders after the router's hash scroll. Finish that navigation once
// preceding diagrams have their height, unless the reader has taken control.
export default function Root({children}) {
  const {pathname, hash, key} = useLocation();
  const history = useHistory();
  const positions = useRef(new Map());
  const entry = useRef(key);
  useEffect(() => history.listen(location => {
    positions.current.set(entry.current, window.scrollY);
    if (positions.current.size > 50) {
      positions.current.delete(positions.current.keys().next().value);
    }
    entry.current = location.key;
  }), [history]);
  useEffect(() => {
    // Docusaurus also scrolls to the hash on POP. Restore the saved position
    // after that lifecycle and the diagrams, instead of repeating hash scroll.
    const restoring = history.action === 'POP' && positions.current.has(key);
    const saved = positions.current.get(key);
    if (restoring ? saved === undefined : !hash) return undefined;
    let anchor;
    try { anchor = decodeURIComponent(hash.slice(1)); } catch { return undefined; }
    let stopped = false;
    let frame;
    let settle;
    let deadline;
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    const stop = () => {
      stopped = true;
      observer.disconnect();
      clearTimeout(settle);
      clearTimeout(deadline);
      cancelAnimationFrame(frame);
      events.forEach(event => window.removeEventListener(event, stop, true));
    };
    const check = () => {
      if (stopped) return;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical || new URL(canonical.href).pathname.replace(/\/$/, '') !== pathname.replace(/\/$/, '')) return;
      const target = document.getElementById(anchor);
      if (!restoring && !target) return;
      const preceding = [...document.querySelectorAll('.diagram-frame')]
        .filter(diagram => restoring || (diagram.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING));
      if ((!restoring && !preceding.length) || preceding.some(diagram => !diagram.querySelector('svg'))) return;
      clearTimeout(settle);
      settle = setTimeout(() => {
        frame = requestAnimationFrame(() => {
          if (!stopped) {
            if (restoring) window.scrollTo({top: saved, behavior: 'instant'});
            else target.scrollIntoView({block: 'start', behavior: 'instant'});
          }
          stop();
        });
      }, 100);
    };
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['href'],
    });
    events.forEach(event => window.addEventListener(event, stop, {capture: true, passive: true}));
    deadline = setTimeout(stop, 10000);
    check();
    return stop;
  }, [pathname, hash, key, history]);
  return <>{children}</>;
}
