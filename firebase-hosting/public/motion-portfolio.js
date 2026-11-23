/* Actual local collection data drives every preview, label and original link. */
(() => {
 const grid=document.querySelector('#motion-grid');if(!grid)return;
 const emails=window.COLLECTION||[];
 const websiteInfo=[['mos','MOS','Tuinstudio','#b8c3a6'],['korst','KORST','Bakkerij','#e8d894'],['noord','NOORD','Fietsenwerkplaats','#b6c4c6'],['coupe','COUPE','Kapsalon','#e5d5d1']];
 const websites=websiteInfo.map(([id,brand,industry,bg])=>({id,brand,industry,bg,kind:'website',type:'Webdesign & development',src:["mos","noord","korst","coupe"].includes(id)?`/previews/${id}-studio.jpg`:`/website-concepten/shared/previews/${id}.png`,url:`/website-concepten/${id}/?design=studio`}));
 const previousEmailProjects=[{"id": "squeeze-peach", "brand": "Squeeze", "industry": "Drinks", "type": "Productlancering", "kind": "email", "src": "/previews/squeeze-peach.jpg", "url": "/emails/squeeze-peach.html", "bg": "#feddb3"}, {"id": "squeeze-welcome", "brand": "Squeeze", "industry": "Drinks", "type": "Welkom", "kind": "email", "src": "/previews/squeeze-welcome.jpg", "url": "/emails/squeeze-welcome.html", "bg": "#feddb3"}, {"id": "squeeze-serve", "brand": "Squeeze", "industry": "Drinks", "type": "Productverhaal", "kind": "email", "src": "/previews/squeeze-serve.jpg", "url": "/emails/squeeze-serve.html", "bg": "#feddb3"},{id:'studio-noord',brand:'NOORD',industry:'Fietsenwerkplaats',type:'Campagneconcept',kind:'email',src:'/previews/studio-noord.jpg',url:'/emails/studio-noord.html',bg:'#d8e0d7'},{id:'studio-korst',brand:'KORST',industry:'Bakkerij',type:'Campagneconcept',kind:'email',src:'/previews/studio-korst.jpg',url:'/emails/studio-korst.html',bg:'#e6d6a7'}];
 const emailProjects=[...(window.STUDIO_EMAILS||[]).map(m=>({id:m.id,brand:m.brandName,industry:m.category,type:m.flow,kind:"email",src:m.preview,url:m.url,bg:m.bg,reference:m.reference})),...previousEmailProjects];
 const graphicProjects=[{id:'merkidentiteiten',brand:'Merkidentiteiten',industry:'MOS · KORST · COUPE',type:'Logo’s & huisstijl',kind:'graphic',src:'/ontwerpen/assets/merkidentiteiten.svg',url:'/ontwerpen/merkidentiteiten.html',bg:'#e8ece5'},{id:'korst-poster',brand:'KORST',industry:'Poster',type:'Posterconcept',kind:'graphic',src:'/ontwerpen/assets/korst-poster.svg',url:'/ontwerpen/korst-poster.html',bg:'#dce3f3'},{id:'coupe-poster',brand:'COUPE',industry:'Typografie',type:'Posterconcept',kind:'graphic',src:'/ontwerpen/assets/coupe-poster.svg',url:'/ontwerpen/coupe-poster.html',bg:'#daddd7'}];
 const projects=[websites[0],emailProjects[0],graphicProjects[0],websites[1],emailProjects[6],graphicProjects[1],websites[2],emailProjects[1],websites[3],emailProjects[7],graphicProjects[2],emailProjects[2],...emailProjects.filter((_,i)=>![0,6,1,7,2].includes(i))];
 const referenceNote=document.createElement('p');referenceNote.className='email-reference-note';document.querySelector('.viewer-controls').after(referenceNote);
 const conceptLabel=p=>p.kind==='website'?'websiteconcept':p.kind==='graphic'?'grafisch ontwerp':'e-mailconcept';
 const params=new URLSearchParams(location.search);let kind=params.get('kind')||'all';if(!['all','website','email','graphic'].includes(kind))kind='all';
 const legacyGroups={new:[],perfume:[],luxe:[0,4,5,8,13,14,15],color:[6,9,12,16,17],flow:[1,2,3,6,7,12],serious:[5,7,10,11]};
 emails.forEach((e,i)=>(e.tags||[]).forEach(tag=>{if(legacyGroups[tag]&&!legacyGroups[tag].includes(i))legacyGroups[tag].push(i);}));
 let legacy=Object.hasOwn(legacyGroups,params.get('filter'))?params.get('filter'):null;
 if(legacy||location.hash==='#emaildesign')kind='email';else if(location.hash==='#websites')kind='website';
 let limit=12;const perPage=12;let visible=[];let current=0;let returnFocus=null;let loadTimer;
 const filters=[...document.querySelectorAll('[data-kind]')];const more=document.querySelector('#motion-more');const count=document.querySelector('#motion-result');
 const dialog=document.querySelector('#motion-viewer');const frame=document.querySelector('#motion-frame');const loading=document.querySelector('.viewer-loading');
 function render(){
  grid.dataset.kind=kind;
  visible=projects.filter(p=>(kind==='all'||p.kind===kind)&&(!legacy||p.kind==='email'));grid.replaceChildren();
  const shown=visible.slice(0,limit);
  for(const project of shown){
   const article=document.createElement('article');article.className='portfolio-card';
   const button=document.createElement('button');button.className='portfolio-preview';button.type='button';button.dataset.type=project.kind;button.setAttribute('aria-label',`Bekijk ${project.brand}: ${project.type}`);button.style.background=project.bg||'#d5d8ce';
   const image=document.createElement('img');image.src=project.src;image.alt=`${project.brand}: zelfstandig ${conceptLabel(project)}`;image.loading='lazy';image.decoding='async';image.width=project.kind==='website'?960:600;image.height=project.kind==='website'?720:1385;
   const open=document.createElement('span');open.className='work-open';open.setAttribute('aria-hidden','true');const icon=document.createElement('i');icon.className='icon';open.append(icon);button.append(image,open);
   button.addEventListener('click',()=>openProject(visible.indexOf(project),button));
   const meta=document.createElement('div');meta.className='work-meta';const title=document.createElement('h2');title.textContent=project.brand;const type=document.createElement('span');type.textContent=project.kind==='website'?'Websiteconcept':project.kind==='graphic'?project.type:'E-mailconcept';meta.append(title,type);
   const subtitle=document.createElement('p');subtitle.className='portfolio-subtitle';subtitle.textContent=`${project.industry} · ${project.type}`;article.append(button,meta,subtitle);grid.append(article);
  }
  filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.kind===kind)));
  count.textContent=`${shown.length} van ${visible.length} ontwerpen`;more.hidden=shown.length>=visible.length;
 }
 function openProject(index,source){
  if(source)returnFocus=source;current=(index+visible.length)%visible.length;const project=visible[current];
  referenceNote.replaceChildren();referenceNote.hidden=!project.reference;if(project.reference){const a=document.createElement('a');a.href=project.reference.url;a.target='_blank';a.rel='noopener';a.textContent=project.reference.name;referenceNote.append('Ontwerpreferentie: ',a,'. '+project.reference.lesson+' Eigen fictief merkconcept.');}
  document.querySelector('#motion-viewer-title').textContent=project.brand;
  document.querySelector('#motion-viewer-kind').textContent=`Eigen ${conceptLabel(project)} · ${project.industry}`;
  document.querySelector('#motion-original').href=project.url;document.querySelector('.viewer-canvas').dataset.type=project.kind;
  loading.textContent='Ontwerp wordt geladen…';loading.hidden=false;
  frame.title=`${project.brand} ontwerpconcept`;frame.src=project.url;
  clearTimeout(loadTimer);loadTimer=setTimeout(()=>{loading.textContent='Laden duurt langer. Gebruik ‘Open volledig’ om het ontwerp apart te bekijken.';},12000);
  if(!dialog.open)dialog.showModal();document.body.style.overflow='hidden';
  const url=new URL(location.href);url.hash=project.id;history.replaceState(null,'',url);
 }
 frame.addEventListener('load',()=>{if(frame.getAttribute('src')!=='about:blank'){loading.hidden=true;clearTimeout(loadTimer);}});
 function close(){dialog.close();}
 dialog.querySelector('.viewer-close').addEventListener('click',close);
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
 dialog.addEventListener('close',()=>{clearTimeout(loadTimer);frame.src='about:blank';document.body.style.overflow='';const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);returnFocus?.focus({preventScroll:true});});
 document.querySelector('#motion-prev').addEventListener('click',()=>openProject(current-1));document.querySelector('#motion-next').addEventListener('click',()=>openProject(current+1));
 filters.forEach(button=>button.addEventListener('click',()=>{kind=button.dataset.kind;legacy=null;limit=12;const url=new URL(location.href);url.searchParams.delete('filter');kind==='all'?url.searchParams.delete('kind'):url.searchParams.set('kind',kind);url.hash='';history.replaceState(null,'',url);render();}));
 more.addEventListener('click',()=>{const before=limit;limit+=perPage;render();grid.children[before]?.querySelector('button')?.focus({preventScroll:true});});
 render();
 const initialHash=decodeURIComponent(location.hash.slice(1));const initial=visible.findIndex(p=>p.id===initialHash);if(initial>=0)openProject(initial);
})();
