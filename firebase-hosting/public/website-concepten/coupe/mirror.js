(()=>{
 if(!window.gsap||!window.ScrollTrigger)return;gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
 mm.add({desktop:'(min-width:761px)',motion:'(prefers-reduced-motion:no-preference)'},ctx=>{
  if(!ctx.conditions.motion)return;const desktop=ctx.conditions.desktop;
  const timeline=gsap.timeline({scrollTrigger:{trigger:'.mirror-hero',start:'top top',end:()=>'+='+innerHeight*(desktop?1.25:.9),pin:true,scrub:.4,invalidateOnRefresh:true}});
  timeline.to('.mirror-frame',{width:'100%',height:'100%',right:'0%',top:'0%',borderRadius:'0%',rotation:0,duration:1,ease:'power1.inOut'},0).to('.mirror-intro',{xPercent:-15,autoAlpha:0,duration:.27},0).to('.mirror-arrival',{autoAlpha:1,duration:.25},.65).fromTo('.mirror-arrival h2',{y:60},{y:0,duration:.35,ease:'power2.out'},.6);
  document.querySelectorAll('.cut-treatment summary>span').forEach((el,i)=>gsap.fromTo(el,{xPercent:i%2?6:0},{xPercent:i%2?0:3,ease:'none',scrollTrigger:{trigger:el.closest('.cut-treatment'),start:'top 85%',end:'top 40%',scrub:.2}}));
  gsap.fromTo('.salon-panorama>img',{xPercent:-10},{xPercent:0,ease:'none',scrollTrigger:{trigger:'.salon-panorama',start:'top bottom',end:'bottom top',scrub:.4}});
  gsap.fromTo('.salon-conversation h2',{xPercent:-6},{xPercent:0,ease:'none',scrollTrigger:{trigger:'.salon-conversation',start:'top 90%',end:'center 50%',scrub:.25}});
 });document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>ScrollTrigger.refresh()));document.fonts.ready.then(()=>ScrollTrigger.refresh());addEventListener('pagehide',()=>mm.revert(),{once:true});
})();
