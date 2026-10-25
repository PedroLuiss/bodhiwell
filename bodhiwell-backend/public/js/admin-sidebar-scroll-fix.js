/**
 * Sidebar Scroll Fix para EasyAdmin
 * 
 * Asegura que el menú lateral tenga scroll independiente
 * cuando el contenido excede la altura de la pantalla.
 */

(function () {
    'use strict';

    function applyScrollFix() {
        const sidebar = document.querySelector('aside.sidebar');

        document.body.style.overflowY = 'auto';
        document.body.style.height = 'auto';
        document.body.style.minHeight = '100vh';

        const wrapper = document.querySelector('.wrapper');
        if (wrapper) {
            wrapper.style.overflow = 'visible';
            wrapper.style.height = 'auto';
            wrapper.style.minHeight = '100%';
        }

        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.style.overflow = 'visible';
            contentWrapper.style.height = 'auto';
            contentWrapper.style.minHeight = 'calc(100vh - 57px)';
        }

        if (!sidebar) return;

        if (window.innerWidth >= 992) {
            const header = sidebar.querySelector('header');
            const nav = sidebar.querySelector('nav');

            sidebar.style.cssText = `
                display: flex !important;
                flex-direction: column !important;
                height: 100vh !important;
                overflow: hidden !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                bottom: 0 !important;
            `;

            if (header) {
                header.style.cssText = `
                    flex: 0 0 auto !important;
                    overflow: hidden !important;
                `;
            }

            if (nav) {
                nav.style.cssText = `
                    flex: 1 1 auto !important;
                    min-height: 0 !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                `;
            }
        } else {
            sidebar.style.cssText = '';
            const header = sidebar.querySelector('header');
            const nav = sidebar.querySelector('nav');
            if (header) header.style.cssText = '';
            if (nav) nav.style.cssText = '';
        }
    }

    window.addEventListener('resize', applyScrollFix);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(applyScrollFix, 100));
    } else {
        setTimeout(applyScrollFix, 100);
    }

    setTimeout(applyScrollFix, 1000);

})();
