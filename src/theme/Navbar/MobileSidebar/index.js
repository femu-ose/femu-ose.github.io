import React, {useEffect} from 'react';
import MobileSidebar from '@theme-original/Navbar/MobileSidebar';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';

export default function KeyboardMobileSidebar(props) {
  const {shown, toggle} = useNavbarMobileSidebar();

  useEffect(() => {
    if (!shown) return undefined;
    const sidebar = document.querySelector('.navbar-sidebar');
    const trigger = document.querySelector('.navbar__toggle');
    if (!sidebar) return undefined;

    const focusable = () => Array.from(sidebar.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]',
    )).filter((element) => element.tabIndex >= 0 && !element.disabled &&
      !element.closest('[inert]') && element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== 'hidden');

    const focusMenu = () => {
      if (!sidebar.contains(document.activeElement)) {
        sidebar.querySelector('.navbar-sidebar__close')?.focus();
      }
    };
    focusMenu();
    const handleKey = (event) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        toggle();
        trigger?.focus();
      } else if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (!first) return;
        const current = document.activeElement;
        if (!items.includes(current) || (event.shiftKey && current === first) ||
            (!event.shiftKey && current === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (sidebar.contains(document.activeElement)) trigger?.focus();
    };
  }, [shown, toggle]);

  return <MobileSidebar {...props} />;
}
