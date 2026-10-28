/* Genuine video, a staged opening, and a small number of authored scroll moments. */
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const cinemaItems=[...document.querySelectorAll('[data-cinema]')].map(container=>{
 const video=container.querySelector('video');
 const control=document.querySelector(`[data-video-toggle="${video.id}"]`);
 const item={container,video,control,visible:false,manualPaused:false,requested:false};
 const sync=()=>{control.textContent=video.paused?'Speel film':'Pauzeer film';control.dataset.paused=String(video.paused);control.setAttribute('aria-label',video.paused?'Speel achtergrondfilm':'Pauzeer achtergrondfilm');};
 const load=()=>{if(!item.requested){video.src=video.dataset.src;video.load();item.requested=true;}video.muted=true;};
 item.play=()=>{load();video.play().then(sync).catch(sync);};
 control.addEventListener('click',()=>{if(video.paused){item.manualPaused=false;item.play();}else{item.manualPaused=true;video.pause();sync();}});
 video.addEventListener('play',sync);video.addEventListener('pause',sync);video.addEventListener('error',()=>{video.removeAttribute('src');video.load();control.hidden=true;});
 return item;
});
const filmObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
 const item=cinemaItems.find(item=>item.container===entry.target);item.visible=entry.isIntersecting;
 if(item.visible&&!motionPreference.matches&&!navigator.connection?.saveData&&!item.manualPaused&&!document.hidden)item.play();else item.video.pause();
}),{threshold:.18});
cinemaItems.forEach(item=>filmObserver.observe(item.container));
document.addEventListener('visibilitychange',()=>{cinemaItems.forEach(item=>{if(document.hidden)item.video.pause();else if(item.visible&&!item.manualPaused&&!motionPreference.matches&&!navigator.connection?.saveData)item.play();});});
motionPreference.addEventListener('change',()=>{if(motionPreference.matches){cinemaItems.forEach(item=>{item.video.pause();item.container.querySelector('.film-frame').style.transform='none';});document.getAnimations().forEach(animation=>animation.finish());}});

const ease='cubic-bezier(.23,1,.32,1)';
function animateOpening(){
 if(motionPreference.matches)return;
 const title=document.querySelector('h1');
 const direction=document.body.dataset.motion==='noord'?-32:0;
 title?.animate([{opacity:.15,transform:`translate(${direction}px,${direction?0:32}px)`,clipPath:'inset(0 0 18% 0)'},{opacity:1,transform:'translate(0,0)',clipPath:'inset(0)'}],{duration:950,easing:ease,delay:90});
 const movie=document.querySelector('[data-cinema]');
 movie?.animate([{opacity:.5,clipPath:'inset(4% 0 0 0)'},{opacity:1,clipPath:'inset(0)'}],{duration:1200,easing:ease,delay:160});
 const intro=document.querySelector('.hero-copy>p,.hero-info>p,.workshop-panel>p,.salon-hero-copy>p,.bakery-title>p');
 intro?.animate([{opacity:.25,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:260,easing:ease});
}
if(document.readyState==='complete')animateOpening();else window.addEventListener('load',animateOpening,{once:true});

if(!motionPreference.matches){
 const moments=document.querySelectorAll('.office .photo,.baker-section .photo,.maintenance .photo,.atelier>.photo,.salon-interior>.photo,.mos-material>figure,.project-heading,.section-head,.studio-statement');
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;if(motionPreference.matches){revealObserver.unobserve(entry.target);return;}const image=entry.target.matches('.photo,figure');entry.target.animate(image?[{clipPath:'inset(0 0 12% 0)',transform:'translateY(35px)',opacity:.6},{clipPath:'inset(0)',transform:'translateY(0)',opacity:1}]:[{transform:'translateY(28px)',opacity:.35},{transform:'translateY(0)',opacity:1}],{duration:image?1000:750,easing:ease});entry.target.dataset.motionSeen='true';revealObserver.unobserve(entry.target);}),{threshold:.16});
 moments.forEach(moment=>revealObserver.observe(moment));
 let frame=0;
 const update=()=>{frame=0;if(motionPreference.matches)return;for(const item of cinemaItems){if(!item.visible)continue;const box=item.container.getBoundingClientRect();const progress=(box.top+box.height/2-innerHeight/2)/innerHeight;item.container.querySelector('.film-frame').style.transform=`translateY(${Math.max(-18,Math.min(18,progress*22))}px) scale(1.07)`;}};
 const request=()=>{if(motionPreference.matches)return;if(!frame)frame=requestAnimationFrame(update);};
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});request();
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',event=>{if(event.detail===0||motionPreference.matches)return;const group=button.closest('section');const panel=group?.querySelector('.treatment-list,.bouquet-grid,.bread-list');panel?.animate([{opacity:.45,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:ease});}));
}
