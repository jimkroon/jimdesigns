import {signInAnonymously} from 'firebase/auth';
import {doc,runTransaction,serverTimestamp} from 'firebase/firestore';
import {connect,foreground} from './firebase.mjs';
import {requestKey,errorMessage} from './core.mjs';
const form=document.querySelector('#contact-form');
if(form) {
  const status=form.querySelector('.form-status'),button=form.querySelector('.form-submit');
  await foreground();
  const {auth,db}=connect('contact');let busy=false,ready=false,key=requestKey();
  const message=(value,error=false)=>{status.textContent=value;status.classList.toggle('is-error',error);};
  async function initialize(){
    busy=true;button.disabled=true;
    try{await auth.authStateReady();if(!auth.currentUser)await signInAnonymously(auth);ready=true;button.type='submit';button.textContent='Bericht versturen';message('Je aanvraag komt beveiligd bij Jim binnen.');}
    catch(error){console.warn('Contactformulier kon niet initialiseren.',error?.code);button.type='button';button.textContent='Opnieuw proberen';message(errorMessage(error)+' Je kunt ook mailen naar info@jimdesigns.nl.',true);}
    finally{busy=false;button.disabled=false;}
  }
  button.addEventListener('click',event=>{if(!ready){event.preventDefault();if(!busy)initialize();}});
  await initialize();
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!ready||!form.reportValidity())return;
    const input=Object.fromEntries(new FormData(form));
    if(input.company_url){message('Versturen is niet gelukt. Mail info@jimdesigns.nl.',true);return;}
    const data={name:String(input.name||'').trim(),email:String(input.email||'').trim(),website:String(input.website||'').trim(),message:String(input.message||'').trim()};
    if(data.name.length<2||data.name.length>100||data.message.length<10||data.message.length>5000){message('Vul je naam en een bericht van 10 tot 5.000 tekens in.',true);return;}
    if(data.website){try{const url=new URL(data.website);if(!['https:','http:'].includes(url.protocol))throw Error();}catch{message('Gebruik bij je website een webadres met https://, of laat het veld leeg.',true);return;}}
    busy=true;button.disabled=true;button.textContent='Bericht versturen…';form.setAttribute('aria-busy','true');message('Je aanvraag wordt opgeslagen…');
    try{
      const uid=auth.currentUser.uid;
      await runTransaction(db,async tx=>{
        const limitRef=doc(db,'contact_limits',uid);const previous=await tx.get(limitRef);
        if(previous.exists()&&previous.data().request_id===key)return;
        if(previous.exists()&&Date.now()-previous.data().last_seen.toMillis()<60000)throw new Error('Je hebt net een bericht verstuurd. Wacht een minuut en probeer opnieuw.');
        tx.set(doc(db,'contact_requests',key),{...data,uid,created_at:serverTimestamp(),status:'new'});
        tx.set(limitRef,{last_seen:serverTimestamp(),request_id:key});
      });
      form.reset();key=requestKey();message('Je bericht is ontvangen. Bedankt, Jim neemt contact met je op.');status.tabIndex=-1;status.focus();
    }catch(error){message(errorMessage(error)+' Je kunt ook mailen naar info@jimdesigns.nl.',true);}
    finally{busy=false;button.disabled=false;button.textContent='Bericht versturen';form.removeAttribute('aria-busy');}
  });
}
