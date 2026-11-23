(()=>{
 document.addEventListener('click',event=>{const link=event.target.closest?.('a[data-pick]');if(link){const choice=document.querySelector('#noord-keuze');if(choice)choice.value=link.dataset.pick;}});
 if(!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const mm=gsap.matchMedia();
 mm.add('(prefers-reduced-motion:no-preference)',()=>{
  const mobile=matchMedia('(max-width:760px)').matches;
  const visual=document.querySelector('.repair-visual>img');
  gsap.fromTo(visual,{scale:1.05,xPercent:-2},{scale:1.35,xPercent:7,ease:'none',scrollTrigger:{trigger:'.repair-story',start:'top top',end:'bottom bottom',scrub:.35}});
  document.querySelectorAll('.repair-chapter').forEach((chapter,i)=>{
   gsap.fromTo(chapter.querySelector('h2'),{xPercent:i%2?-12:12,y:25},{xPercent:0,y:0,ease:'power1.out',scrollTrigger:{trigger:chapter,start:mobile?'top 80%':'top 85%',end:mobile?'top 55%':'top 45%',scrub:.2}});
   ScrollTrigger.create({trigger:chapter,start:mobile?'top 60%':'top 55%',end:mobile?'bottom 60%':'bottom 55%',onToggle:self=>{if(!self.isActive)return;document.querySelectorAll('.part-navigation a').forEach(a=>a.setAttribute('aria-current',String(a.hash==='#'+chapter.id)));}});
  });
  const lines=document.querySelectorAll('.everyday-rides h2>span');
  lines.forEach((line,i)=>gsap.fromTo(line,{xPercent:i%2?10:-9},{xPercent:i%2?-3:3,ease:'none',scrollTrigger:{trigger:'.everyday-rides',start:'top 90%',end:'bottom 50%',scrub:.2}}));
  gsap.fromTo('.footer .logo',{yPercent:25},{yPercent:0,ease:'none',scrollTrigger:{trigger:'.footer',start:'top bottom',end:'bottom bottom',scrub:.3}});
 });
 document.fonts.ready.then(()=>ScrollTrigger.refresh());
 addEventListener('pagehide',()=>mm.revert(),{once:true});
})();
