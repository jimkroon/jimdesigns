const previewRatios={"01-maison-rue":3.195,"02-bruin-welkom":2.308333333333333,"03-bruin-ritueel":2.1733333333333333,"04-bruin-terug":1.54,"05-casa-lento":3.1683333333333334,"06-forme":2.815,"07-flora":3.0933333333333333,"08-pace":2.9433333333333334,"09-serein":2.62,"10-forno":3.4133333333333336,"11-lijn":3.095,"12-north":3.1533333333333333,"13-bello":3.02,"14-aure":3.3116666666666665,"15-nocte":3.6066666666666665,"16-folio":3.74,"17-zing":3.3566666666666665,"18-scoop":3.8583333333333334};
const data = window.COLLECTION;
const grid = document.querySelector('#grid');
const dialog = document.querySelector('#viewer');
const frame = document.querySelector('#emailFrame');
const status = document.querySelector('.viewer-status');
const sets = {new:[],perfume:[],luxe:[0,4,5,8,13,14,15],color:[6,9,12,16,17],flow:[1,2,3,6,7,12],serious:[5,7,10,11]};
data.forEach((r,i)=>(r.tags||[]).forEach(tag=>{if(sets[tag]&&!sets[tag].includes(i))sets[tag].push(i);}));
const featured = [18, 19, 3, 39, 46, 43, 58, 55, 38];
const order = [...featured,...data.map((_,i)=>i).filter(i=>!featured.includes(i))];
const params = new URLSearchParams(location.search);
let activeFilter = sets[params.get('filter')] ? params.get('filter') : 'all';
let expanded = params.get('expanded') === '1';
let current = 0, previousFocus = null, loadTimer;
const selectedOrder = () => order.filter(i => !sets[activeFilter] || sets[activeFilter].includes(i));
function updateURL(hash = location.hash) {
 const url = new URL(location.href);
 activeFilter === 'all' ? url.searchParams.delete('filter') : url.searchParams.set('filter', activeFilter);
 expanded ? url.searchParams.set('expanded', '1') : url.searchParams.delete('expanded');
 url.hash = hash;
 history.replaceState(null, '', url.pathname + url.search + url.hash);
}
grid.innerHTML = order.map((i, position) => {
 const r=data[i];
 return `<article class="card" data-index="${i}"><button class="preview-button" data-open="${i}" aria-label="Bekijk ${r.brand}: ${r.type}"><img class="${r.cover?'campaign-cover':''}" src="previews/${r.id}-${r.cover?'cover':'desktop'}.webp?v=20261025-layouts8" alt="Preview van ${r.brand} ${r.type}" loading="${position<6?'eager':'lazy'}" decoding="async" width="600" height="${Math.round(600*(r.coverRatio||r.previewRatio||previewRatios[r.id]||3))}"></button><div class="card-meta"><div><h2>${r.brand}</h2><p>${r.industry} / ${r.type}</p></div></div></article>`;
}).join('');
function closeViewer(){ updateURL(''); dialog.close(); }
dialog.addEventListener('cancel',e=>{e.preventDefault();closeViewer();});
function viewerKeys(e) {
 if(!dialog.open) return;
 if(e.key === 'Escape') { e.preventDefault(); closeViewer(); }
 if(e.key === 'ArrowRight') { e.preventDefault(); step(1); }
 if(e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
}
frame.addEventListener('load', () => {
 clearTimeout(loadTimer);
 try {
  if(!frame.contentDocument?.querySelector('h1')) throw new Error('missing design');
  status.hidden=true;
  frame.contentDocument.addEventListener('keydown', viewerKeys);
 } catch { status.textContent='Dit ontwerp kon niet laden. Sluit de preview en probeer opnieuw.'; status.hidden=false; }
 frame.setAttribute('aria-busy','false');
});
function openEmail(index) {
 current=index;
 const r=data[current];
 document.querySelector('#viewerBrand').textContent=r.brand;
 document.querySelector('#viewerType').textContent=r.type;
 const sequence=selectedOrder();
 document.querySelector('#viewerIndex').textContent=sequence.includes(current)?`Ontwerp ${sequence.indexOf(current)+1} van ${sequence.length}`:'E-mailconcept';
 document.querySelector('#viewerHeadline').textContent=r.headline;
 for(const key of ['Industry','Subject','Preheader']) document.querySelector('#viewer'+key).textContent=r[key.toLowerCase()];
 clearTimeout(loadTimer);
 status.textContent='Ontwerp laden…';status.hidden=false;frame.setAttribute('aria-busy','true');
 frame.src='emails/'+r.id+'.html?v=20261025-layouts8';frame.title=r.brand+' · '+r.type;
 document.querySelector('#standalone').href=frame.src;
 loadTimer=setTimeout(()=>{status.textContent='Het laden duurt langer. Sluit de preview en probeer opnieuw.';},12000);
 if(!dialog.open){previousFocus=document.activeElement;dialog.showModal();document.body.style.overflow='hidden';document.querySelector('#close').focus();}
 updateURL(r.id);
}
function step(direction){const sequence=selectedOrder();const position=sequence.indexOf(current);openEmail(sequence[(Math.max(0,position)+direction+sequence.length)%sequence.length]);}
document.addEventListener('click',e=>{const target=e.target.closest('[data-open]');if(target)openEmail(Number(target.dataset.open));});
document.querySelector('#close').onclick=closeViewer;
dialog.addEventListener('close',()=>{clearTimeout(loadTimer);document.body.style.overflow='';updateURL('');previousFocus?.focus({preventScroll:true});});
dialog.addEventListener('click',e=>{if(e.target===dialog)closeViewer();});
document.querySelector('#prev').onclick=()=>step(-1);
document.querySelector('#next').onclick=()=>step(1);
document.addEventListener('keydown',viewerKeys);
function setSize(size){frame.style.width=size+'px';document.querySelectorAll('[data-size]').forEach(b=>{const active=b.dataset.size===String(size);b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
document.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>setSize(Number(b.dataset.size)));
setSize(matchMedia('(max-width:760px)').matches?360:600);
function renderFilter(){let n=0;document.querySelectorAll('.card').forEach(c=>{const match=selectedOrder().includes(Number(c.dataset.index));c.hidden=!match||(activeFilter==='all'&&!expanded&&n>=9);if(match)n++;});const shown=activeFilter==='all'&&!expanded?Math.min(9,n):n;document.querySelector('#resultCount').textContent=shown===n?n+' ontwerpen':shown+' van '+n+' ontwerpen';document.querySelector('#showMore').hidden=activeFilter!=='all'||expanded;document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===activeFilter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{activeFilter=b.dataset.filter;renderFilter();updateURL();});
document.querySelector('#showMore').onclick=()=>{const next=document.querySelector('.card[hidden] [data-open]');expanded=true;renderFilter();updateURL();next?.focus();};
document.querySelector('[data-filter=all] span').textContent=data.length;
document.querySelector('[data-filter=new] span').textContent=sets.new.length;
document.querySelector('[data-filter=perfume] span').textContent=sets.perfume.length;
document.querySelector('#showMore').innerHTML='Bekijk alle '+data.length+' ontwerpen <span aria-hidden="true">↓</span>';
renderFilter();
const initial=data.findIndex(r=>location.hash==='#'+r.id);if(initial>=0)openEmail(initial);
// Direct links can also change within an already open portfolio page.
window.addEventListener('hashchange', () => {
 const index=data.findIndex(r=>location.hash==='#'+r.id);
 if(index>=0)openEmail(index);
 else if(dialog.open&&!location.hash)closeViewer();
});
