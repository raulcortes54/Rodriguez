/* =========================================================
   PEPITO'S STORE — SCRIPT.JS
   1. Utilidades / estado
   2. Menú móvil (hamburguesa)
   3. Buscador móvil
   4. Carrito de compras
   5. Favoritos
   6. Notificaciones (toast)
   7. Animaciones de scroll (IntersectionObserver)
   8. Hero: parallax ligero
   9. Scroll suave para anclas
   ========================================================= */

(function () {
    'use strict';

    /* ============ 1. UTILIDADES / ESTADO ============ */
    const STORAGE_KEYS = {
        cart: 'pepitos-cart',
        favorites: 'pepitos-favorites'
    };

    function readStorage(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (err) {
            console.warn('No se pudo leer localStorage:', err);
            return fallback;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn('No se pudo escribir en localStorage:', err);
        }
    }

    let cart = readStorage(STORAGE_KEYS.cart, []);
    let favorites = readStorage(STORAGE_KEYS.favorites, []);

    /* ============ 2. MENÚ MÓVIL (HAMBURGUESA) ============ */
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navClose = document.getElementById('nav-close');
    const navOverlay = document.getElementById('nav-overlay');

    function openMenu() {
        navMenu.classList.add('is-open');
        navOverlay.classList.add('is-visible');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navMenu.classList.remove('is-open');
        navOverlay.classList.remove('is-visible');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('is-open');
            isOpen ? closeMenu() : openMenu();
        });
    }
    if (navClose) navClose.addEventListener('click', closeMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);

    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 760) closeMenu();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    /* ============ 3. BUSCADOR MÓVIL ============ */
    const searchToggle = document.getElementById('search-toggle');
    const searchForm = document.querySelector('.search-form');
    if (searchToggle && searchForm) {
        searchToggle.addEventListener('click', () => {
            searchForm.style.display = searchForm.style.display === 'flex' ? 'none' : 'flex';
            if (searchForm.style.display === 'flex') {
                searchForm.style.position = 'absolute';
                searchForm.style.top = 'calc(100% + 6px)';
                searchForm.style.right = '20px';
                searchForm.style.zIndex = '50';
                searchForm.querySelector('input').focus();
            }
        });
    }

    /* ============ 4. CARRITO DE COMPRAS ============ */
    const cartCountEl = document.getElementById('cart-count');

    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCountEl.textContent = totalItems;
        cartCountEl.classList.remove('bump');
        // Forzar reflow para reiniciar la animación
        void cartCountEl.offsetWidth;
        cartCountEl.classList.add('bump');
    }

    function addToCart(id, name, price, buttonEl) {
        const existing = cart.find((item) => item.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id, name, price, qty: 1 });
        }
        writeStorage(STORAGE_KEYS.cart, cart);
        updateCartBadge();
        showToast(`${name} se agregó al carrito`);

        if (buttonEl) {
            const originalText = buttonEl.dataset.originalText || buttonEl.textContent;
            buttonEl.dataset.originalText = originalText;
            buttonEl.textContent = 'Agregado ✓';
            buttonEl.classList.add('is-added');
            setTimeout(() => {
                buttonEl.textContent = originalText;
                buttonEl.classList.remove('is-added');
            }, 1600);
        }
    }

    document.querySelectorAll('.btn--cart').forEach((btn) => {
        btn.addEventListener('click', () => {
            const { id, name, price } = btn.dataset;
            addToCart(id, name, Number(price), btn);
        });
    });

    /* ============ 5. FAVORITOS ============ */
    const favCountEl = document.getElementById('fav-count');

    function updateFavBadge() {
        favCountEl.textContent = favorites.length;
        favCountEl.classList.remove('bump');
        void favCountEl.offsetWidth;
        favCountEl.classList.add('bump');
    }

    function toggleFavorite(id, buttonEl) {
        const index = favorites.indexOf(id);
        const isNowFavorite = index === -1;

        if (isNowFavorite) {
            favorites.push(id);
        } else {
            favorites.splice(index, 1);
        }

        writeStorage(STORAGE_KEYS.favorites, favorites);
        updateFavBadge();

        buttonEl.setAttribute('aria-pressed', String(isNowFavorite));
        buttonEl.classList.add('pop');
        setTimeout(() => buttonEl.classList.remove('pop'), 350);

        showToast(isNowFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos');
    }

    document.querySelectorAll('.fav-toggle').forEach((btn) => {
        const id = btn.dataset.id;
        if (favorites.includes(id)) {
            btn.setAttribute('aria-pressed', 'true');
        }
        btn.addEventListener('click', () => toggleFavorite(id, btn));
    });

    /* ============ 6. NOTIFICACIONES (TOAST) ============ */
    const toastEl = document.getElementById('toast');
    let toastTimer = null;

    function showToast(message) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastEl.classList.remove('is-visible');
        }, 2200);
    }

    /* ============ 7. ANIMACIONES DE SCROLL ============ */
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Pequeño retraso escalonado para elementos dentro de una misma grilla
                        const delay = entry.target.dataset.revealDelay || 0;
                        setTimeout(() => entry.target.classList.add('active'), delay);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        revealEls.forEach((el, i) => {
            // Escalonar ligeramente tarjetas dentro del mismo grid
            if (el.closest('.cat-grid, .prod-grid, .col-grid, .ben-grid')) {
                el.dataset.revealDelay = (i % 6) * 70;
            }
            observer.observe(el);
        });
    } else {
        // Fallback: mostrar todo si el navegador no soporta IntersectionObserver
        revealEls.forEach((el) => el.classList.add('active'));
    }

    /* ============ 8. HERO: PARALLAX LIGERO ============ */
    const heroFigure = document.getElementById('hero-figure');
    const hero = document.getElementById('hero');

    if (heroFigure && hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = hero.offsetHeight;
            if (scrollY < heroHeight) {
                const offset = scrollY * 0.12;
                heroFigure.style.transform = `translateY(${offset}px)`;
            }
        }, { passive: true });
    }

    /* ============ 9. SCROLL SUAVE PARA ANCLAS ============ */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId.length > 1) {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    const headerOffset = document.getElementById('site-header').offsetHeight;
                    const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset - 10;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
        });
    });

    /* ============ INICIALIZACIÓN ============ */
    updateCartBadge();
    updateFavBadge();
})();
