import {collection,doc,getDoc,getDocs,runTransaction,serverTimestamp,setDoc,query,orderBy,limit,updateDoc} from 'firebase/firestore';
import {OWNER,invoiceInput,party} from './core.mjs';
export async function openSession(db,user) {
  const token=await user.getIdTokenResult();
  await setDoc(doc(db,'sessions',OWNER+'-'+token.claims.auth_time),{auth_time:Number(token.claims.auth_time),last_seen:serverTimestamp()});
  return Number(token.claims.auth_time)*1000;
}
export async function load(db) {
  const [customers,invoices,seller,sequence,requests]=await Promise.all([
    getDocs(query(collection(db,'customers'),orderBy('id'))),getDocs(query(collection(db,'invoices'),orderBy('number','desc'),limit(200))),
    getDoc(doc(db,'settings','seller')),getDoc(doc(db,'settings','sequence')),getDocs(query(collection(db,'contact_requests'),orderBy('created_at','desc'),limit(100)))
  ]);
  if(!seller.exists()||!sequence.exists())throw new Error('Je administratie wordt nog overgezet. Probeer het later opnieuw.');
  return {customers:customers.docs.map(d=>d.data()),invoices:invoices.docs.map(d=>d.data()),seller:seller.data(),sequence:sequence.data(),requests:requests.docs.map(d=>({id:d.id,...d.data()}))};
}
export async function createInvoice(db,raw) {
  const input=invoiceInput(raw);
  const execute=()=>runTransaction(db,async tx=>{
    const keyRef=doc(db,'requests',input.request_key);const duplicate=await tx.get(keyRef);
    if(duplicate.exists()) {
      const existing=await tx.get(doc(db,'invoices',String(duplicate.data().number)));
      if(!existing.exists())throw new Error('Deze aanvraag moet worden gecontroleerd. Maak geen tweede nota.');
      return existing.data();
    }
    const customer=await tx.get(doc(db,'customers',String(input.customer_id)));
    const sequence=await tx.get(doc(db,'settings','sequence'));const seller=await tx.get(doc(db,'settings','seller'));
    if(!customer.exists())throw new Error('Selecteer een opgeslagen klant.');
    if(!sequence.exists()||!seller.exists())throw new Error('Je administratie is nog niet beschikbaar.');
    const number=sequence.data().next_number;
    if(input.date<sequence.data().latest_date)throw new Error('De datum mag niet vóór de vorige nota liggen.');
    const invoice={...input,number,customer:customer.data(),seller:seller.data(),created_at:serverTimestamp(),original_file:null};
    tx.set(doc(db,'invoices',String(number)),invoice);tx.set(keyRef,{number});
    tx.set(doc(db,'settings','sequence'),{next_number:number+1,latest_date:input.date});return invoice;
  });
  for(let attempt=0;attempt<3;attempt++){
    try{return await execute();}catch(error){
      // Concurrent counter changes can fail the rule comparison before an
      // aborted transaction is reported. Reuse the original idempotency key.
      if(error.code!=='permission-denied'||attempt===2)throw error;
      await new Promise(resolve=>setTimeout(resolve,50*(attempt+1)));
    }
  }
}
export async function saveCustomer(db,raw,id) {
  const data=party(raw);
  return runTransaction(db,async tx=>{
    if(id) {const ref=doc(db,'customers',String(id));if(!(await tx.get(ref)).exists())throw new Error('Deze klant bestaat niet meer.');tx.set(ref,{id,...data});return id;}
    const ref=doc(db,'settings','customers');const counter=await tx.get(ref);const next=counter.data().next_id;
    tx.set(doc(db,'customers',String(next)),{id:next,...data});tx.set(ref,{next_id:next+1});return next;
  });
}
export const saveSeller=(db,raw)=>setDoc(doc(db,'settings','seller'),party(raw,true));
export const markRequest=(db,id,status)=>updateDoc(doc(db,'contact_requests',id),{status});
export async function exportBackup(db) {
  const [customers,invoices,seller,sequence,requests,files]=await Promise.all([
    getDocs(collection(db,'customers')),getDocs(collection(db,'invoices')),getDoc(doc(db,'settings','seller')),getDoc(doc(db,'settings','sequence')),getDocs(collection(db,'contact_requests')),getDocs(collection(db,'files'))
  ]);
  return {format:'jimdesigns-firebase-v1',exported_at:new Date().toISOString(),next_number:sequence.data().next_number,seller:seller.data(),customers:customers.docs.map(d=>d.data()),invoices:invoices.docs.map(d=>d.data()),contact_requests:requests.docs.map(d=>({id:d.id,...d.data()})),files:files.docs.map(d=>({id:d.id,...d.data()}))};
}
export async function historicalPdf(db,name) {
  const result=await getDoc(doc(db,'files',name));
  if(!result.exists())throw new Error('De oorspronkelijke PDF is niet beschikbaar. Probeer het opnieuw.');
  const file=result.data();const bytes=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0));
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
  if(hash!==file.sha256)throw new Error('De oorspronkelijke PDF moet worden gecontroleerd.');return bytes;
}
