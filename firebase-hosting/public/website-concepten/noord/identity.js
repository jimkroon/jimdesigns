(()=>{
 const data={
  wiel:{number:'01',label:'BAND & WIEL',title:'Loopt je band<br>steeds leeg?',description:'Een lek is niet altijd zichtbaar. Vertel of de band meteen leegloopt of pas na een paar dagen. Dat helpt de werkplaats gericht zoeken.',pick:'Band of wiel',cta:'Bespreek band of wiel'},
  rem:{number:'02',label:'REMMEN',title:'Je knijpt.<br>Er gebeurt te weinig.',description:'Piepen, aanlopen of weinig remkracht? Vertel wat je voelt en hoort. We bespreken welke controle je fiets nodig heeft.',pick:'Remmen of versnellingen',cta:'Bespreek je remmen'},
  ketting:{number:'03',label:'AANDRIJVING',title:'Wel trappen.<br>Niet lekker rijden.',description:'Slaat je ketting over, schakelt je fiets stroef of hoor je een tik? Geef aan in welke versnelling het gebeurt en wanneer je het merkt.',pick:'Remmen of versnellingen',cta:'Bespreek je aandrijving'}
 };
 let selected='wiel';const buttons=[...document.querySelectorAll('[data-part]')];
 function select(part){const d=data[part];if(!d)return;selected=part;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===part)));document.querySelector('.check-number').textContent=d.number;document.querySelector('.check-label').textContent='DE FIETSCHECK / '+d.label;document.querySelector('#check-title').innerHTML=d.title;document.querySelector('#check-description').textContent=d.description;const cta=document.querySelector('#check-cta');cta.dataset.pick=d.pick;cta.innerHTML=d.cta+' <span class="icon" aria-hidden="true"></span>';document.querySelector('#noord-keuze').value=d.pick;}
 buttons.forEach(b=>b.addEventListener('click',()=>{select(b.dataset.part);if(b.classList.contains('marker'))document.querySelector('#fietscheck').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}));
 document.querySelector('#check-cta').addEventListener('click',()=>{const select=document.querySelector('#noord-keuze');select.value=data[selected].pick;});
})();
