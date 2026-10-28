(() => {
  const form=document.querySelector('#contact-form');if(!form)return;
  let loaded=false;
  const load=()=>{if(loaded)return;loaded=true;import('/firebase/contact.js').catch(()=>{const status=form.querySelector('.form-status');status.textContent='Het formulier kon niet laden. Vernieuw de pagina of mail info@jimdesigns.nl.';status.classList.add('is-error');});};
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();load();}},{rootMargin:'200px'});observer.observe(form);}else load();
})();
