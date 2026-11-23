/* JimDesigns motion: native document scrolling, one rehearsed work sequence.
   Local GSAP 3.13.0 + ScrollTrigger. No smooth-scroll interception. */
(() => {
  const menu = document.querySelector('.motion-menu');
  const navigation = document.querySelector('#motion-navigation');
  function setMenu(open, restoreFocus = false) {
    if (!menu || !navigation) return;
    menu.setAttribute('aria-expanded', String(open));
    navigation.hidden = !open;
    if (restoreFocus) menu.focus();
  }
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  navigation?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false, menu?.getAttribute('aria-expanded') === 'true'); });
  document.addEventListener('click', e => { if (!e.target.closest('.motion-header')) setMenu(false); });
  matchMedia('(min-width:621px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  document.querySelectorAll('[data-website-package],[data-project-package]').forEach(link => link.addEventListener('click', () => {
    const field = document.querySelector('#contact-message');
    if (field && !field.value.trim()) field.value = `Hoi Jim, ik wil graag meer weten over ${link.dataset.projectPackage||link.dataset.websitePackage}.\n\nMijn plannen: `;
  }));
  const projectChoice=new URLSearchParams(location.search).get('project');const projectMessage=document.querySelector('#contact-message');if(projectChoice&&projectMessage&&!projectMessage.value.trim())projectMessage.value=`Hoi Jim, ik wil graag meer weten over ${projectChoice.slice(0,160)}.\n\nMijn plannen: `;
  const form = document.querySelector('#contact-form');
  if (form && ['127.0.0.1', 'localhost'].includes(location.hostname)) {
    const status = form.querySelector('.form-status');
    if (status) status.textContent = 'Lokale ontwerpversie. Je kunt rechtstreeks mailen naar info@jimdesigns.nl.';
  }
  if (!window.gsap || !window.ScrollTrigger || !document.querySelector('.zoom-sequence')) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  // A failed enhancement leaves a fully readable document with ordinary scrolling.
  media.add({desktop:'(min-width:761px)', mobile:'(max-width:760px)', motion:'(prefers-reduced-motion:no-preference)'}, context => {
    if (!context.conditions.motion) return;
    document.documentElement.classList.add('has-motion');
    const desktop = context.conditions.desktop;
    const timeline = gsap.timeline({scrollTrigger:{trigger:'.zoom-sequence',start:desktop?'top top':'top 45%',end:desktop?()=>`+=${innerHeight}`:'bottom 10%',pin:desktop,scrub:.15,anticipatePin:1,invalidateOnRefresh:true}});
    timeline.fromTo('.zoom-image',{clipPath:desktop?'inset(8% 31% 7% 31%)':'inset(9% 15% 9% 15%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1,ease:'power2.inOut'},0)
      .to('.zoom-image img',{scale:1.15,duration:1.3,ease:'none'},0)
      .to('.zoom-line-one',{xPercent:desktop?-105:-45,y:-30,opacity:0,duration:.42,ease:'power2.in'},0)
      .to('.zoom-line-two',{xPercent:desktop?105:45,y:30,opacity:0,duration:.42,ease:'power2.in'},0)
      .to('.zoom-shade',{opacity:1,duration:.6},.5);
    if (desktop) timeline.fromTo('.zoom-caption',{y:45,opacity:0},{y:0,opacity:1,duration:.45},.7);
    else timeline.to('.zoom-caption',{y:-6,duration:.3},.6);
    gsap.fromTo('.statement-line:first-child',{xPercent:desktop?-15:0},{xPercent:desktop?15:0,ease:'none',scrollTrigger:{trigger:'.moving-statement',start:'top 85%',end:'center 30%',scrub:true}});
    gsap.fromTo('.statement-line:last-child',{xPercent:desktop?15:0},{xPercent:desktop?-15:0,ease:'none',scrollTrigger:{trigger:'.moving-statement',start:'top 85%',end:'center 30%',scrub:true}});
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => document.documentElement.classList.remove('has-motion');
  });
  // Native details change the document's height; refresh the geometry after that change.
  document.querySelectorAll('details').forEach(d => d.addEventListener('toggle', () => ScrollTrigger.refresh()));
  window.addEventListener('pagehide', () => media.revert(), {once:true});
})();
