const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
const header = document.querySelector('.site-header');
const mobileNavigation = matchMedia('(max-width:620px)');
const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');

// Keyboard navigation should respond immediately, including menus and previews.
document.addEventListener('keydown', () => document.documentElement.classList.add('keyboard-input'), {capture:true});
document.addEventListener('pointerdown', () => document.documentElement.classList.remove('keyboard-input'), {capture:true, passive:true});

function setMenu(open, restoreFocus = false) {
 toggle?.setAttribute('aria-expanded', String(open));
 nav?.classList.toggle('is-open', open);
 if (nav) nav.inert = mobileNavigation.matches && !open;
 if (restoreFocus) toggle?.focus({preventScroll:true});
}
setMenu(false);
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', event => {
 if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
 if (event.key === 'Escape' && nav?.classList.contains('is-open')) setMenu(false, true);
});
document.addEventListener('click', event => {
 if (nav?.classList.contains('is-open') && !header?.contains(event.target)) setMenu(false);
});
mobileNavigation.addEventListener('change', () => setMenu(false));

if (document.body.classList.contains('home') && (/^#\d{2}-/.test(location.hash) || new URLSearchParams(location.search).has('filter'))) {
 location.replace('portfolio.html' + location.search + location.hash);
}

// Carry a chosen package into the contact form without replacing a draft.
document.querySelectorAll('[data-website-package]').forEach(link => link.addEventListener('click', () => {
 const message = document.querySelector('#contact-message');
 if (message && !message.value.trim()) message.value = 'Hoi Jim, ik wil graag meer weten over ' + link.dataset.websitePackage + '.\n\nMijn plannen: ';
}));

let headerFrame = 0;
function updateHeader() {
 header?.classList.toggle('is-scrolled', window.scrollY > 12);
 headerFrame = 0;
}
window.addEventListener('scroll', () => {
 if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
}, {passive:true});
updateHeader();

function initMotion() {
 if (reducedMotion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

 const pending = new Set();
 const running = new Map();
 const ease = 'cubic-bezier(0.23,1,0.32,1)';
 const finish = element => {
  observer.unobserve(element);
  pending.delete(element);
  element.removeAttribute('data-motion-pending');
  running.get(element)?.cancel();
  running.delete(element);
 };
 const finishAll = () => {
  [...pending, ...running.keys()].forEach(finish);
 };

 const observer = new IntersectionObserver(entries => {
  entries.filter(entry => entry.isIntersecting).forEach(entry => {
   const element = entry.target;
   const bounds = element.getBoundingClientRect();
   // Begin before the viewport edge. Anchor jumps and fast scrolling must never
   // turn an already visible card transparent or make visitors wait for it.
   if (reducedMotion.matches || document.hidden || bounds.top < innerHeight - 32 || element.contains(document.activeElement)) {
    finish(element);
    return;
   }
   const siblings = [...element.parentElement.children];
   const row = siblings.filter(item => Math.abs(item.offsetTop - element.offsetTop) < 4);
   const delay = Math.min(Math.max(0, row.indexOf(element)) * 40, 120);
   const animation = element.animate([
    {opacity:0, transform:'translate3d(0,14px,0)'},
    {opacity:1, transform:'translate3d(0,0,0)'}
   ], {duration:400, delay, easing:ease, fill:'backwards'});
   observer.unobserve(element);
   pending.delete(element);
   element.removeAttribute('data-motion-pending');
   running.set(element, animation);
   animation.finished.then(() => {
    if (running.get(element) === animation) running.delete(element);
   }, () => {});
  });
 }, {threshold:0, rootMargin:'80px 0px 80px 0px'});

 // Motion belongs to the offer groups and the email composition. Text, forms,
 // FAQ answers and portfolio filtering stay immediately readable and usable.
 document.querySelectorAll('.service-choices > a,.web-plan,.plan,.service-options > article,.journey-art').forEach(element => {
  if (element.closest('[hidden]') || element.getBoundingClientRect().top < innerHeight + 80) return;
  element.setAttribute('data-motion-pending', '');
  pending.add(element);
  observer.observe(element);
 });

 // Settle anything a visitor acts on, including the destination of a local link.
 const revealTarget = target => {
  [...pending, ...running.keys()].forEach(element => {
   if (element.contains(target) || target.contains(element)) finish(element);
  });
 };
 document.addEventListener('focusin', event => revealTarget(event.target));
 document.addEventListener('pointerdown', event => revealTarget(event.target), {passive:true});
 document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  const destination = new URL(link.href, location.href);
  if (destination.origin !== location.origin || destination.pathname !== location.pathname || !destination.hash) return;
  let target;
  try { target = document.getElementById(decodeURIComponent(destination.hash.slice(1))); } catch { return; }
  if (target) revealTarget(target);
 });
 window.addEventListener('resize', () => {
  pending.forEach(element => {
   if (element.getBoundingClientRect().top < innerHeight + 80) finish(element);
  });
 }, {passive:true});
 reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) { finishAll(); observer.disconnect(); }
 });
 document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
 window.addEventListener('pagehide', finishAll);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMotion, {once:true});
else initMotion();
