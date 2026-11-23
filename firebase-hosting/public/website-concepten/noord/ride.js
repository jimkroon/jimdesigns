(()=>{
 if(!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const mm=gsap.matchMedia();
 mm.add({desktop:'(min-width:761px)',mobile:'(max-width:760px)',motion:'(prefers-reduced-motion:no-preference)'},ctx=>{
  if(!ctx.conditions.motion)return;
  const mobile=ctx.conditions.mobile;
  const aperture=document.querySelector('.ride-aperture');
  const initial=()=>Math.min(innerWidth,innerHeight)*(mobile?.49:.28);
  const final=()=>Math.hypot(innerWidth,innerHeight)*.68;
  const model={r:initial()};
  const draw=()=>{aperture.style.clipPath=`circle(${model.r}px at ${mobile?'50% 52%':'55% 62%'})`;const w=Math.min(model.r*2,innerWidth),h=Math.min(model.r*2,innerHeight);const frame=aperture.querySelector('.film-frame');frame.style.width=w+'px';frame.style.height=h+'px';frame.style.left=Math.min(Math.max(innerWidth*(mobile?.5:.55),w/2),innerWidth-w/2)+'px';frame.style.top=Math.min(Math.max(innerHeight*(mobile?.52:.62),h/2),innerHeight-h/2)+'px';};
  gsap.set('.ride-aperture .film-frame',{xPercent:-50,yPercent:-50,scale:1});draw();
  const tl=gsap.timeline({scrollTrigger:{trigger:'.ride-hero',start:'top top',end:()=>'+='+innerHeight*(mobile?1.1:1.7),pin:true,scrub:.4,anticipatePin:1,invalidateOnRefresh:true,onRefreshInit:()=>{model.r=initial();}}});
  tl.to(model,{r:final,duration:1,ease:'power1.inOut',onUpdate:draw},0)
   .to('.ride-hero>h1',{xPercent:-45,yPercent:-35,rotation:-4,duration:.65,ease:'none'},0)
   .to('.ride-intro',{autoAlpha:0,y:35,duration:.2},0)
   .fromTo('.ride-arrival h2',{xPercent:-20,y:70},{xPercent:0,y:0,duration:.27,ease:'power2.out'},.65)
   .to('.ride-arrival',{autoAlpha:1,duration:.2},.65)
   ;;
  return()=>{aperture.style.clipPath='';const f=aperture.querySelector('.film-frame');for(const key of ['width','height','left','top'])f.style[key]='';};
 });
 document.fonts.ready.then(()=>ScrollTrigger.refresh());
 addEventListener('pagehide',()=>mm.revert(),{once:true});
})();
