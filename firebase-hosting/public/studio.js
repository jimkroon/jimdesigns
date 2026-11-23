(()=>{
 if(!window.gsap||!window.ScrollTrigger)return;gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
 mm.add({desktop:'(min-width:761px)',motion:'(prefers-reduced-motion:no-preference)'},ctx=>{
  if(!ctx.conditions.motion)return;
  if(ctx.conditions.desktop){const cases=[...document.querySelectorAll('.studio-case')];cases.forEach((card,i)=>{if(i===cases.length-1)return;gsap.to(card,{scale:.92,y:-10,ease:'none',scrollTrigger:{trigger:cases[i+1],start:'top bottom',end:'top 32px',scrub:.3}});});}
  document.querySelectorAll('.poster-pair>a').forEach((poster,i)=>gsap.fromTo(poster,{rotation:i?5:-5,y:50},{rotation:0,y:0,ease:'none',scrollTrigger:{trigger:poster,start:'top bottom',end:'center 60%',scrub:.35}}));
  const lines=document.querySelectorAll('.statement-line');lines.forEach((el,i)=>gsap.fromTo(el,{xPercent:i?8:-8},{xPercent:i?-2:3,ease:'none',scrollTrigger:{trigger:'.moving-statement',start:'top 85%',end:'center 35%',scrub:.2}}));
  if(document.querySelector('.footer-wordmark'))gsap.fromTo('.footer-wordmark',{yPercent:25},{yPercent:0,ease:'none',scrollTrigger:{trigger:'.motion-footer',start:'top bottom',end:'bottom bottom',scrub:.3}});
 });
 document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>ScrollTrigger.refresh()));document.fonts.ready.then(()=>ScrollTrigger.refresh());addEventListener('pagehide',()=>mm.revert(),{once:true});
})();
