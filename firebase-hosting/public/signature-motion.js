(() => {
 if(!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const mm=gsap.matchMedia();
 mm.add('(prefers-reduced-motion:no-preference)',()=>{
  // Opposing text movement resolves over a short scroll distance as requested.
  const lines=document.querySelectorAll('.signature-work-heading h2>span');
  if(lines.length){gsap.fromTo(lines[0],{xPercent:0},{xPercent:12,ease:'none',scrollTrigger:{trigger:'.signature-work-heading',start:'top 80%',end:'bottom 40%',scrub:.15}});gsap.fromTo(lines[1],{xPercent:8},{xPercent:0,ease:'none',scrollTrigger:{trigger:'.signature-work-heading',start:'top 80%',end:'bottom 40%',scrub:.15}});}
  document.querySelectorAll('.signature-case-picture').forEach((el,i)=>{gsap.fromTo(el,{scale:i===0?.89:.95,rotationX:i===0?8:0,transformPerspective:1200},{scale:1,rotationX:0,ease:'none',scrollTrigger:{trigger:el.closest('.signature-case'),start:'top 90%',end:'center 45%',scrub:.25}});});
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
 });
 window.addEventListener('pagehide',()=>mm.revert(),{once:true});
})();
