import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,updateDoc,deleteDoc,writeBatch,serverTimestamp,Timestamp,setLogLevel} from 'firebase/firestore';
setLogLevel('silent');
import {createInvoice,saveCustomer,exportBackup} from '../src/repository.mjs';
import {OWNER,invoiceInput} from '../src/core.mjs';
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
test('Discounts persist and allow full discounts without changing the original subtotal',async()=>{
  const first=await createInvoice(db,{...input('a'),amount:'420',discount_percent:'10'});
  assert.equal(first.amount_cents,37800);assert.equal(first.discount_cents,4200);
  const stored=(await getDoc(doc(db,'invoices','5'))).data();assert.equal(stored.subtotal_cents,42000);assert.equal(stored.discount_basis_points,1000);
  assert.equal((await createInvoice(db,{...input('b'),amount:'250',discount_percent:'10'})).amount_cents,22500);
  assert.equal((await createInvoice(db,{...input('c'),discount_percent:'100'})).amount_cents,0);
});
test('Rules reject tampered discount math, partial fields and invalid boundaries',async()=>{
  const rawWrite=patch=>{
    const invoice={...invoiceInput({...input('a'),amount:'420',discount_percent:'10'}),number:5,customer:person,seller,created_at:serverTimestamp(),original_file:null,...patch};
    for(const key of Object.keys(invoice))if(invoice[key]===undefined)delete invoice[key];
    const batch=writeBatch(db);batch.set(doc(db,'invoices','5'),invoice);batch.set(doc(db,'requests',invoice.request_key),{number:5});batch.set(doc(db,'settings','sequence'),{next_number:6,latest_date:invoice.date});return batch.commit();
  };
  for(const patch of [{discount_cents:4199},{amount_cents:1},{discount_basis_points:-1},{discount_basis_points:10001},{subtotal_cents:0},{subtotal_cents:100000000},{discount_basis_points:10.5},{discount_cents:undefined},{subtotal_cents:undefined,discount_cents:undefined,discount_basis_points:undefined,amount_cents:0}])await assertFails(rawWrite(patch));
  await assertSucceeds(rawWrite({subtotal_cents:undefined,discount_cents:undefined,discount_basis_points:undefined,amount_cents:42000}));
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
test('Werkblokken houden hun tarief en kunnen één keer op een nota',async()=>{
  const {saveWork,loadHours}=await import('../src/repository.mjs');
  const {workEntry}=await import('../src/hours.mjs');
  const row={customer_id:'1',date:'2026-10-28',description:'Homepage',hours:'2,5',rate:'30'};
  assert.equal((await loadHours(db)).rate,3000);
  const work=workEntry(row);
  assert.equal(work.amount_cents,7500);
  await saveWork(db,'blok',work);
  await saveWork(db,'nieuw',workEntry({...row,rate:'37,50'}));
  assert.equal((await loadHours(db)).rate,3750);
  const raw={...input('a'),work_id:'blok',amount:'75'};
  await assert.rejects(createInvoice(db,{...raw,amount:'80'}));
  assert.equal((await createInvoice(db,raw)).number,5);
  assert.equal((await createInvoice(db,raw)).number,5);
  await assert.rejects(createInvoice(db,{...raw,request_key:'b'.repeat(32)}));
  assert.equal((await getDoc(doc(db,'work_entries','blok'))).data().rate_cents,3000);
  assert.equal((await getDoc(doc(db,'work_entries','blok'))).data().invoice_number,5);
});

test('Verified accounts have separate workspaces, invoice designs and backups',async()=>{
  const {workspace,openSession,initializeWorkspace,load,saveSeller,saveDesign,saveWork}=await import('../src/repository.mjs');
  const {invoicePdf}=await import('../src/pdf.mjs');
  const {workEntry}=await import('../src/hours.mjs');
  const userFor=uid=>({uid,getIdTokenResult:async()=>({claims:{auth_time:authTime}})});
  const scopedDb=(uid,verified=true,provider='password')=>environment.authenticatedContext(uid,{email_verified:verified,auth_time:authTime,firebase:{sign_in_provider:provider}}).firestore();
  const firstDb=scopedDb('account-a'), secondDb=scopedDb('account-b');
  const a=workspace(firstDb,userFor('account-a')), b=workspace(secondDb,userFor('account-b'));
  for(const [ref,uid] of [[a,'account-a'],[b,'account-b']]){
    await openSession(ref,userFor(uid));await initializeWorkspace(ref);
    const empty=await load(ref);assert.equal(empty.sequence.next_number,1);assert.equal(empty.seller.iban,'');
    assert.deepEqual([empty.customers.length,empty.invoices.length,empty.requests.length,empty.hours.entries.length],[0,0,0,0]);
  }
  await saveSeller(a,seller);await saveCustomer(a,person);await saveDesign(a,{accent:'klei',font:'serif'});
  await saveWork(a,'entry',workEntry({customer_id:1,date:'2026-10-28',description:'Design',rate:30,hours:'2,5'}));
  const inv=await createInvoice(a,{...input('c'),amount:75,work_id:'entry'});
  assert.equal(inv.number,1);assert.equal(inv.design.font,'serif');assert.ok((await invoicePdf(inv)).length>1000);
  await saveDesign(a,{accent:'bos',font:'sans'});
  const backup=await exportBackup(a);
  assert.deepEqual(backup.invoices[0].design,{accent:'klei',font:'serif'});
  assert.equal((await exportBackup(b)).invoices.length,0);
  for(const path of ['settings/seller','customers/1','invoices/1','work_entries/entry','settings/design']){
    await assertFails(getDoc(doc(secondDb,'workspaces/account-a/'+path)));
    await assertFails(setDoc(doc(secondDb,'workspaces/account-a/'+path),{}));
    await assertFails(getDoc(doc(firstDb,path)));
  }
  for(const path of ['contact_requests','files','invoices'])await assertFails(getDocs(collection(firstDb,path)));
  const change={name:'Bijgewerkte klant'};
  await assertSucceeds(updateDoc(doc(a,'customers','1'),change));
  await assertFails(updateDoc(doc(secondDb,'workspaces/account-a/customers/1'),change));
  for(const path of ['customers','invoices','work_entries']){
    await assertFails(getDocs(collection(secondDb,'workspaces/account-a/'+path)));
  }
  for(const path of ['settings/sequence','settings/customers','requests/'+input('c').request_key,'sessions/account-a-'+authTime]){
    await assertFails(getDoc(doc(secondDb,'workspaces/account-a/'+path)));
  }
  await environment.withSecurityRulesDisabled(context=>setDoc(doc(context.firestore(),'workspaces/account-a/sessions/account-a-'+authTime),{auth_time:authTime,last_seen:Timestamp.fromMillis(Date.now()-1801000)}));
  await assertFails(getDoc(doc(a,'settings','seller')));
  await assertFails(updateDoc(doc(a,'customers','1'),change));
  for(const [verified,provider] of [[false,'password'],[true,'anonymous']]){
    const authDb=scopedDb('unverified',verified,provider);
    await assertFails(openSession(workspace(authDb,userFor('unverified')),userFor('unverified')));
  }
});
