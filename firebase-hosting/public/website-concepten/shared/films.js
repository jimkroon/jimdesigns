/* Native real-footage controls, offscreen pause and reduced-motion handling. No page-load text choreography. */
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

