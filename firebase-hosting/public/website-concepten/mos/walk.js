(()=>{
 if(!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();let walkTrigger=null;
 const buttons=[...document.querySelectorAll('[data-walk]')];
 buttons.forEach(b=>b.addEventListener('click',()=>{if(walkTrigger){const i=Number(b.dataset.walk);window.scrollTo({top:walkTrigger.start+(walkTrigger.end-walkTrigger.start)*i/2,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}}));
 mm.add({desktop:'(min-width:761px)',motion:'(prefers-reduced-motion:no-preference)'},ctx=>{
  if(!ctx.conditions.motion)return;
  if(ctx.conditions.desktop){
   const hero=gsap.timeline({scrollTrigger:{trigger:'.mos-cinema-hero',start:'top top',end:()=>'+='+innerHeight*.95,pin:true,scrub:.4,invalidateOnRefresh:true}});
   hero.to('.mos-cinema-visual',{clipPath:'inset(13% 6% 13% 48%)',duration:1,ease:'none'},0).to('.mos-cinema-copy h1',{color:'#153b2c',fontSize:'5.8vw',yPercent:-8,duration:.65},.25).to('.mos-cinema-copy>div',{autoAlpha:0,duration:.18},0).to('.mos-cinema-hero',{'--mos-shade':0,duration:.5},0);
   const track=document.querySelector('.garden-walk-track');
   gsap.to(track,{x:()=>-innerWidth*2,ease:'none',scrollTrigger:{trigger:'.garden-walk',start:'top top',end:()=>'+='+innerWidth*1.6,pin:'.garden-walk-pin',scrub:.4,invalidateOnRefresh:true,onUpdate:self=>{const index=Math.round(self.progress*2);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));},onRefresh:self=>walkTrigger=self}});
  }
  gsap.fromTo('.studio-statement h2',{xPercent:-4},{xPercent:2,ease:'none',scrollTrigger:{trigger:'.mos-intro',start:'top 90%',end:'bottom 40%',scrub:.25}});
  gsap.fromTo('.mos-material>figure img',{scale:1.16,yPercent:-5},{scale:1,yPercent:5,ease:'none',scrollTrigger:{trigger:'.mos-material',start:'top bottom',end:'bottom top',scrub:.5}});
  return()=>{walkTrigger=null;};
 });
 document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>ScrollTrigger.refresh()));document.fonts.ready.then(()=>ScrollTrigger.refresh());addEventListener('pagehide',()=>mm.revert(),{once:true});
})();
