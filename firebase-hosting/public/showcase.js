/* One scroll-directed work reel. Default document and mobile remain fully readable. */
(()=>{
 const cinema=document.querySelector('.work-cinema');if(!cinema||!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const projects=[...cinema.querySelectorAll('.reel-project')],tabs=[...cinema.querySelectorAll('.cinema-bar nav a')];
 const mm=gsap.matchMedia();let activeTimeline;
 mm.add('(min-width:1001px) and (prefers-reduced-motion:no-preference)',()=>{
  cinema.classList.add('is-enhanced');
  gsap.set(projects,{autoAlpha:0});gsap.set(projects[0],{autoAlpha:1});
  let selected=-1;
  const select=i=>{if(selected===i)return;const previous=projects[selected],moveFocus=previous?.contains(document.activeElement);selected=i;projects.forEach((p,n)=>p.inert=n!==i);tabs.forEach((t,n)=>{if(n===i)t.setAttribute('aria-current','true');else t.removeAttribute('aria-current');});if(moveFocus)projects[i].querySelector('.reel-open').focus({preventScroll:true});};select(0);
  const tl=gsap.timeline({scrollTrigger:{trigger:cinema,start:'top 104px',end:()=>'+='+innerHeight*2.6,pin:true,pinSpacing:true,scrub:.35,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>select(Math.min(projects.length-1,Math.floor(self.progress*projects.length)))}});activeTimeline=tl;
  tl.to(projects[0].querySelector('.reel-screen'),{scale:1.025,x:-15,duration:.7,ease:'none'},0);
  projects.slice(1).forEach((project,index)=>{const at=index+1;tl.set(project,{autoAlpha:1,zIndex:at+1},at).fromTo(project,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.55,ease:'power2.inOut'},at).fromTo(project.querySelector('.reel-screen'),{y:75,scale:.94},{y:0,scale:1,duration:.75,ease:'power2.out'},at).fromTo(project.querySelector('.reel-copy'),{y:35},{y:0,duration:.65,ease:'power2.out'},at);});tl.to({}, {duration:.25});
  return()=>{activeTimeline=null;cinema.classList.remove('is-enhanced');projects.forEach(p=>p.inert=false);tabs.forEach(t=>t.removeAttribute('aria-current'));};
 });
 tabs.forEach((tab,i)=>tab.addEventListener('click',event=>{if(!activeTimeline)return;event.preventDefault();const st=activeTimeline.scrollTrigger;const target=(i===0?0:(i+.62)/activeTimeline.duration());window.scrollTo({top:st.start+(st.end-st.start)*Math.min(1,target),behavior:'instant'});activeTimeline.progress(Math.min(1,target));}));
 document.fonts.ready.then(()=>ScrollTrigger.refresh());
 addEventListener('load',()=>{ScrollTrigger.refresh();if(!location.hash)return;const index=projects.findIndex(p=>'#'+p.id===location.hash);if(index>=0&&activeTimeline){tabs[index].click();return;}const target=document.getElementById(location.hash.slice(1));target?.scrollIntoView({behavior:'instant',block:'start'});},{once:true});
 addEventListener('pagehide',()=>mm.revert(),{once:true});
})();
