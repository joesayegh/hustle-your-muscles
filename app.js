'use strict';

// ── Nav scroll state ──────────────────────────────────────────
const nav = document.querySelector('.nav');
const SCROLL_THRESHOLD = 40;

function onScroll() {
  nav.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Mobile nav ────────────────────────────────────────────────
const hamburger = document.querySelector('.nav__hamburger');
const mobileMenu = document.querySelector('.nav__mobile');
const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

function closeMobileMenu() {
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('is-open');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  mobileMenu.classList.toggle('is-open', !expanded);
  document.body.style.overflow = !expanded ? 'hidden' : '';
});

mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu?.classList.contains('is-open')) {
    closeMobileMenu();
    hamburger?.focus();
  }
});

// ── Reveal on scroll ─────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings
        const siblings = entry.target.parentElement?.querySelectorAll('.reveal');
        let delay = 0;
        if (siblings) {
          siblings.forEach((sib, idx) => {
            if (sib === entry.target) delay = idx * 80;
          });
        }
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
} else {
  // Fallback: show all
  reveals.forEach(el => el.classList.add('is-visible'));
}

// ── Smooth scroll for anchor links ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    closeMobileMenu();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Ticker duplicate for seamless loop ────────────────────────
const ticker = document.querySelector('.ticker__track');
if (ticker) {
  ticker.innerHTML += ticker.innerHTML;
}

// ── Contact form ──────────────────────────────────────────────
const form = document.querySelector('.contact__form-el');
const successMsg = document.querySelector('.contact__success');

form?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('.btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  // Simulate submission (replace with real endpoint)
  setTimeout(() => {
    form.style.display = 'none';
    if (successMsg) {
      successMsg.style.display = 'block';
    }
  }, 1000);
});

// ── Hero video: autoplay fallback & reduced-motion pause ─────
const heroVideo = document.querySelector('.hero__video');

if (heroVideo) {
  // Respect prefers-reduced-motion — pause video if user prefers no motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    heroVideo.pause();
    heroVideo.removeAttribute('autoplay');
  }
  prefersReduced.addEventListener('change', e => {
    e.matches ? heroVideo.pause() : heroVideo.play().catch(() => {});
  });

  // Ensure autoplay resumes after any browser suspension
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !prefersReduced.matches) {
      heroVideo.play().catch(() => {});
    }
  });
}

// ── Parallax hero video (subtle, RAF-based) ───────────────────
let ticking = false;

if (heroVideo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        heroVideo.style.transform = `translateY(${window.scrollY * 0.25}px) scale(1.05)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ── Active nav link ───────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

if (sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.removeAttribute('aria-current');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.setAttribute('aria-current', 'page');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));
}
