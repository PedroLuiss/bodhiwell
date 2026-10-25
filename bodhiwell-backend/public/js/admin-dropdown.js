(function () {
  'use strict';

  const MOVE_ATTR = '__moved_to_body';

  function positionMenu(toggle, menu) {
    if (!toggle || !menu) return;
    const rect = toggle.getBoundingClientRect();
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY;
    const menuWidth = menu.offsetWidth || 0;
    const maxRight = window.innerWidth - 8;
    if (left + menuWidth > maxRight) {
      left = Math.max(8, maxRight - menuWidth);
    }
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  function moveMenuToBody(toggle, menu) {
    if (!menu || menu[MOVE_ATTR]) return;
    menu.__originalParent = menu.parentElement;
    document.body.appendChild(menu);
    menu.style.position = 'absolute';
    menu.style.zIndex = '9999';
    menu[MOVE_ATTR] = true;
    positionMenu(toggle, menu);
    menu.__repositionHandler = () => positionMenu(toggle, menu);
    window.addEventListener('scroll', menu.__repositionHandler, { passive: true });
    window.addEventListener('resize', menu.__repositionHandler);
  }

  function restoreMenu(menu) {
    if (!menu || !menu[MOVE_ATTR]) return;
    if (menu.__repositionHandler) {
      window.removeEventListener('scroll', menu.__repositionHandler);
      window.removeEventListener('resize', menu.__repositionHandler);
      delete menu.__repositionHandler;
    }
    menu.style.position = '';
    menu.style.left = '';
    menu.style.top = '';
    menu.style.zIndex = '';
    if (menu.__originalParent) {
      menu.__originalParent.appendChild(menu);
      delete menu.__originalParent;
    }
    delete menu[MOVE_ATTR];
  }

  if (typeof window.bootstrap === 'object' || typeof window.jQuery !== 'undefined') {
    document.addEventListener('show.bs.dropdown', (ev) => {
      const dropdown = ev.target;
      const toggle = dropdown.querySelector && (dropdown.querySelector('.dropdown-toggle') || ev.target);
      const menu = dropdown.querySelector && dropdown.querySelector('.dropdown-menu');
      if (menu && toggle) moveMenuToBody(toggle, menu);
    });

    document.addEventListener('hidden.bs.dropdown', (ev) => {
      const dropdown = ev.target;
      const menu = dropdown.querySelector && dropdown.querySelector('.dropdown-menu');
      if (menu) restoreMenu(menu);
    });
  } else {
    document.addEventListener('click', function (e) {
      const toggle = e.target.closest && e.target.closest('.dropdown-toggle');
      if (!toggle) return;
      const wrapper = toggle.closest && toggle.closest('.dropdown');
      if (!wrapper) return;
      const menu = wrapper.querySelector && wrapper.querySelector('.dropdown-menu');
      if (!menu) return;

      if (menu[MOVE_ATTR]) {
        restoreMenu(menu);
        return;
      }

      moveMenuToBody(toggle, menu);

      const onDocClick = (ev) => {
        if (!menu.contains(ev.target) && !toggle.contains(ev.target)) {
          restoreMenu(menu);
          document.removeEventListener('click', onDocClick);
        }
      };
      setTimeout(() => document.addEventListener('click', onDocClick), 0);
    });
  }

  window.addEventListener('beforeunload', () => {
    document.querySelectorAll('.dropdown-menu').forEach(restoreMenu);
  });
})();
