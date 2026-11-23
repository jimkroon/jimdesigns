(()=>{
 if(!window.gsap||!window.ScrollTrigger)return;gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
 mm.add('(prefers-reduced-motion:no-preference)',()=>{
  gsap.fromTo('.hero-croissant',{rotation:-13,y:-15},{rotation:8,y:70,xPercent:8,ease:'none',scrollTrigger:{trigger:'.counter-hero',start:'top top',end:'bottom top',scrub:.4}});
  const words=document.querySelectorAll('.counter-hero h1 span');words.forEach((word,i)=>gsap.to(word,{xPercent:i?12:-18,ease:'none',scrollTrigger:{trigger:'.counter-hero',start:'top top',end:'bottom top',scrub:.25}}));
  document.querySelectorAll('.counter-product .product-photo img').forEach(img=>gsap.fromTo(img,{scale:1.08},{scale:1,ease:'none',scrollTrigger:{trigger:img.closest('.counter-product'),start:'top bottom',end:'bottom center',scrub:.3}}));
  gsap.to('.product-croissant',{scale:.9,ease:'none',scrollTrigger:{trigger:'.product-bun',start:'top bottom',end:'top top',scrub:.35}});
  document.querySelectorAll('.product-copy h2').forEach((title,i)=>gsap.fromTo(title,{xPercent:i?10:-8},{xPercent:0,ease:'none',scrollTrigger:{trigger:title.closest('.counter-product'),start:'top 85%',end:'top 35%',scrub:.2}}));
  document.querySelectorAll('.oven-scene h2 span').forEach((word,i)=>gsap.fromTo(word,{xPercent:i?8:0},{xPercent:i?0:5,ease:'none',scrollTrigger:{trigger:'.oven-scene',start:'top 85%',end:'bottom 55%',scrub:.2}}));
  gsap.fromTo('.baking-note figure',{rotation:4,y:60},{rotation:0,y:0,ease:'none',scrollTrigger:{trigger:'.baking-note',start:'top bottom',end:'center center',scrub:.4}});
 });document.fonts.ready.then(()=>ScrollTrigger.refresh());addEventListener('pagehide',()=>mm.revert(),{once:true});
})();
