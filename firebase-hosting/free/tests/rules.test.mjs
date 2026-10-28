import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,updateDoc,deleteDoc,writeBatch,serverTimestamp,Timestamp,setLogLevel} from 'firebase/firestore';
setLogLevel('silent');
import {createInvoice,saveCustomer,exportBackup} from '../src/repository.mjs';
import {OWNER} from '../src/core.mjs';
let environment,db;const authTime=Math.floor(Date.now()/1000);const person={id:1,name:'Synthetische klant',company:'Test BV',address:'Teststraat 1',city:'1234 AB Teststad'};const seller={name:'Synthetische afzender',company:'',address:'Teststraat 2',city:'1234 AB Teststad',iban:'NL91ABNA0417164300'};
before(async()=>{environment=await initializeTestEnvironment({projectId:'demo-jimdesigns',firestore:{host:'127.0.0.1',port:8383,rules:await fs.readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});});
after(async()=>{await environment?.cleanup();});
beforeEach(async()=>{
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async context=>{
    const admin=context.firestore();const batch=writeBatch(admin);
    batch.set(doc(admin,'customers','1'),person);batch.set(doc(admin,'settings','seller'),seller);batch.set(doc(admin,'settings','customers'),{next_id:2});
    batch.set(doc(admin,'settings','sequence'),{next_number:5,latest_date:'2026-10-01'});
    batch.set(doc(admin,'sessions',OWNER+'-'+authTime),{auth_time:authTime,last_seen:Timestamp.now()});await batch.commit();
  });
  db=environment.authenticatedContext(OWNER,{auth_time:authTime,firebase:{sign_in_provider:'password'}}).firestore();
});
const input=key=>({request_key:key.repeat(32),customer_id:'1',amount:'300,50',date:'2026-10-28',description:'E-mailmarketing'});
test('Anonymous and unrelated accounts cannot read private administration',async()=>{
  for(const context of [environment.unauthenticatedContext(),environment.authenticatedContext('unrelated',{auth_time:authTime})]){
    for(const path of ['customers/1','settings/seller','invoices/5','files/nota-004.pdf'])await assertFails(getDoc(doc(context.firestore(),path)));
    await assertFails(getDocs(collection(context.firestore(),'customers')));
  }
  await assertSucceeds(getDoc(doc(db,'customers','1')));
});
test('Invoices require their atomic sequence, request key and current snapshots',async()=>{
  const first=await createInvoice(db,input('a'));assert.equal(first.number,5);assert.equal(first.amount_cents,30050);
  const again=await createInvoice(db,input('a'));assert.equal(again.number,5);
  assert.equal((await getDoc(doc(db,'settings','sequence'))).data().next_number,6);
  await assertFails(updateDoc(doc(db,'invoices','5'),{amount_cents:1}));await assertFails(deleteDoc(doc(db,'invoices','5')));
  await assertFails(updateDoc(doc(db,'settings','sequence'),{next_number:7}));
  await assertFails(setDoc(doc(db,'invoices','6'),{...first,number:6,request_key:'b'.repeat(32)}));
});
test('Concurrent repeated and distinct submissions do not duplicate invoice numbers',async()=>{
  const duplicate=await Promise.all([createInvoice(db,input('a')),createInvoice(db,input('a'))]);assert.deepEqual(duplicate.map(i=>i.number),[5,5]);
  const distinct=await Promise.all([createInvoice(db,input('b')),createInvoice(db,input('c'))]);assert.deepEqual(distinct.map(i=>i.number).sort(),[6,7]);
});
test('Customer edits leave invoice snapshots intact and new IDs are atomic',async()=>{
  await createInvoice(db,input('a'));await saveCustomer(db,{...person,name:'Gewijzigde klant'},1);
  assert.equal((await getDoc(doc(db,'invoices','5'))).data().customer.name,person.name);
  assert.equal(await saveCustomer(db,{...person,name:'Nieuwe klant'},null),2);
  assert.equal((await getDoc(doc(db,'settings','customers'))).data().next_id,3);
});
test('Expired sessions cannot read data or revive the same login',async()=>{
  await environment.withSecurityRulesDisabled(context=>setDoc(doc(context.firestore(),'sessions',OWNER+'-'+authTime),{auth_time:authTime,last_seen:Timestamp.fromMillis(Date.now()-1801000)}));
  await assertFails(getDoc(doc(db,'customers','1')));await assertFails(setDoc(doc(db,'sessions',OWNER+'-'+authTime),{auth_time:authTime,last_seen:serverTimestamp()}));
  const fresh=environment.authenticatedContext(OWNER,{auth_time:authTime+1,firebase:{sign_in_provider:'password'}}).firestore();
  await assertSucceeds(setDoc(doc(fresh,'sessions',OWNER+'-'+(authTime+1)),{auth_time:authTime+1,last_seen:serverTimestamp()}));
  const ancient=environment.authenticatedContext(OWNER,{auth_time:authTime-28801,firebase:{sign_in_provider:'password'}}).firestore();await assertFails(getDoc(doc(ancient,'customers','1')));
});
test('Public contact writes require auth, validation and an atomic per-user time limit',async()=>{
  const visitor=environment.authenticatedContext('synthetic-visitor',{firebase:{sign_in_provider:'anonymous'}}).firestore();
  const contact={uid:'synthetic-visitor',name:'Synthetische aanvraag',email:'test@example.invalid',website:'https://example.invalid',message:'Dit is een synthetisch testbericht.',created_at:serverTimestamp(),status:'new'};
  const submit=async(id,data=contact)=>{const batch=writeBatch(visitor);batch.set(doc(visitor,'contact_requests',id),data);batch.set(doc(visitor,'contact_limits','synthetic-visitor'),{last_seen:serverTimestamp(),request_id:id});return batch.commit();};
  await assertFails(setDoc(doc(visitor,'contact_requests','a'.repeat(32)),contact));
  await assertFails(submit('a'.repeat(32),{...contact,email:'ongeldig'}));
  await assertSucceeds(submit('a'.repeat(32)));
  await assertFails(submit('b'.repeat(32)));
  await assertFails(getDoc(doc(visitor,'contact_requests','a'.repeat(32))));
  await assertSucceeds(getDoc(doc(db,'contact_requests','a'.repeat(32))));
  await assertSucceeds(updateDoc(doc(db,'contact_requests','a'.repeat(32)),{status:'read'}));
  await assertFails(updateDoc(doc(db,'contact_requests','a'.repeat(32)),{email:'ander@example.invalid'}));
});
test('Full backup excludes authentication secrets',async()=>{
  await createInvoice(db,input('a'));const backup=await exportBackup(db);assert.equal(backup.next_number,6);assert.equal(backup.invoices.length,1);assert.equal(JSON.stringify(backup).includes('password'),false);
});
