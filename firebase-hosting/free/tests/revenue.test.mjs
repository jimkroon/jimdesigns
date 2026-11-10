import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const root = new URL('../', import.meta.url);
async function module(file) {
  const result = await build({entryPoints:[new URL(file,root).pathname],bundle:true,platform:'node',format:'esm',write:false});
  return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const core = await module('src/revenue/core.ts');
const {handle} = await module('../revenue-worker/src/index.ts');
const {RevenueApi} = await module('../revenue-worker/src/klaviyo.ts');
const row=(type,id,message,cents,orders)=>({groupings:{[`${type}_id`]:id,[`${type}_message_id`]:message,send_channel:'email'},statistics:{conversion_value:cents/100,conversions:orders}});

test('flow messages and welcome versions count once; all filter combinations and CSV match',()=>{
  const rows=[...core.aggregateRevenue([row('campaign','c','c1',2995,1),row('campaign','c','c2',5,1)],'campaign'),...core.aggregateRevenue([row('flow','w1','a',1000,1),row('flow','w2','b',2000,1),row('flow','cart','c',4000,2)],'flow')];
  for(const campaigns of [false,true])for(const flows of [false,true])for(const welcome of [false,true]){
    const selected=core.selectRevenue(rows,{campaigns,flows,welcome,welcomeIds:['w1','w2'],excluded:[]});
    assert.equal(core.revenueTotal(selected).cents,(campaigns?3000:0)+(flows?4000+(welcome?3000:0):0));
  }
  assert.equal(core.revenueTotal(core.selectRevenue(rows,{campaigns:true,flows:true,welcome:true,welcomeIds:[],excluded:['flow:cart']})).cents,6000);
  const duplicate=row('flow','w','m',10,1);assert.throws(()=>core.aggregateRevenue([duplicate,duplicate],'flow'),/dubbel/);
  assert.throws(()=>core.aggregateRevenue([{...duplicate,statistics:{conversions:1,conversion_value:null}}],'flow'),/onvolledige/);
  const csv=core.revenueCsv({start:'2026-10-01',end:'2026-10-31',fetchedAt:'2026-11-10T08:00:00Z',metadata:{timezone:'Europe/Amsterdam',currency:'EUR'}},[{id:'x',type:'flow',name:'=SUM(1,2)',cents:2995,orders:1}]);
  assert.match(csv,/'=SUM/);assert.match(csv,/29,95/);assert.match(csv,/Verzenddatum/);
});
test('inclusive dates, DST and leap years split without gaps or overlap',()=>{
  assert.deepEqual(core.revenueTimeframes('2026-03-29','2026-03-29','Europe/Amsterdam'),[{start:'2026-03-28T23:00:00.000Z',end:'2026-03-29T21:59:59.000Z'}]);
  assert.deepEqual(core.revenueTimeframes('2026-10-25','2026-10-25','Europe/Amsterdam'),[{start:'2026-10-24T22:00:00.000Z',end:'2026-10-25T22:59:59.000Z'}]);
  const chunks=core.revenueTimeframes('2024-01-01','2026-11-10','Europe/Amsterdam');
  for(let i=1;i<chunks.length;i++)assert.equal(Date.parse(chunks[i].start)-Date.parse(chunks[i-1].end),1000);
  assert.throws(()=>core.validateRevenueRange('2026-02-30','2026-03-02'));assert.throws(()=>core.validateRevenueRange('2026-11-10','2026-11-01'));
});
const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',keys.publicKey),kid:'test-key'};
const now=Math.floor(Date.now()/1000);
async function token(changes={}){
  const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const input=encode({alg:'RS256',kid:'test-key'})+'.'+encode({iss:'https://securetoken.google.com/jimdesigns',aud:'jimdesigns',sub:'jimdesigns-owner',iat:now,exp:now+3600,auth_time:now,...changes});
  return input+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',keys.privateKey,Buffer.from(input))).toString('base64url');
}
function upstream({seen=Date.now(),sessionStatus=200}={}) {return async (url,options)=>{
  assert.equal(options.redirect,'manual');
  if(String(url).includes('service_accounts'))return Response.json({keys:[jwk]});
  if(String(url).includes('firestore.googleapis.com'))return Response.json({fields:{auth_time:{integerValue:String(now)},last_seen:{timestampValue:new Date(seen).toISOString()}}},{status:sessionStatus});
  throw Error('Unexpected upstream request');
};}
function request(jwt='',origin='https://jimdesigns.nl',part='status'){return new Request('https://worker.test/revenue?part='+part,{headers:{Origin:origin,...(jwt?{Authorization:'Bearer '+jwt}:{})}});}
test('anonymous, other UID, expired, wrong project, tampered token and idle sessions are denied',async()=>{
  const good=await token();
  assert.equal((await handle(request(),{},upstream())).status,401);
  for(const claims of [{sub:'other-owner'},{aud:'different-project'},{exp:now-1},{auth_time:now-28801}])assert.equal((await handle(request(await token(claims)),{},upstream())).status,401);
  const parts=good.split('.');const claims=JSON.parse(Buffer.from(parts[1],'base64url'));claims.exp+=100;parts[1]=Buffer.from(JSON.stringify(claims)).toString('base64url');
  assert.equal((await handle(request(parts.join('.')),{},upstream())).status,401);
  assert.equal((await handle(request(good),{},upstream({seen:Date.now()-1801000}))).status,401);
  assert.equal((await handle(request(good),{},upstream({sessionStatus:403}))).status,401);
  assert.equal((await handle(request(good,'https://evil.test'),{},upstream())).status,403);
  const success=await handle(request(good),{},upstream());assert.equal(success.status,200);assert.deepEqual(await success.json(),{connected:false});assert.match(success.headers.get('Cache-Control'),/no-store/);
  const missing=await handle(request(good,'https://jimdesigns.nl','metadata'),{},upstream());assert.equal(missing.status,503);assert.ok(!JSON.stringify(await missing.json()).includes('cents'));
});
test('Klaviyo pagination preserves metric and channel; rejects foreign links; cache isolates keys',async()=>{
  let calls=0;const bodies=[];
  const api=new RevenueApi({KLAVIYO_REPORTING_KEY:'synthetic-a'},undefined,async(url,options)=>{assert.equal(options.redirect,'manual');calls++;bodies.push(JSON.parse(options.body));return Response.json({data:{attributes:{results:[row('flow','f','m'+calls,10,1)]}},links:{next:calls===1?'https://a.klaviyo.com/api/flow-values-reports/?page_cursor=second':null}});});
  const one=await api.reportPage('flow','2026-10-01T00:00:00Z','2026-10-31T23:59:59Z','placed');
  await api.reportPage('flow','2026-10-01T00:00:00Z','2026-10-31T23:59:59Z','placed',one.value.next);assert.deepEqual(bodies[0],bodies[1]);assert.equal(bodies[0].data.attributes.filter,'equals(send_channel,"email")');
  assert.equal((await api.reportPage('flow','2026-10-01T00:00:00Z','2026-10-31T23:59:59Z','placed')).cached,true);assert.equal(calls,2);
  await assert.rejects(api.call('https://evil.test/api/metrics'),/rapportverwijzing/);assert.equal(calls,2);
  const denied=new RevenueApi({KLAVIYO_REPORTING_KEY:'synthetic-b'},undefined,async()=>new Response('',{status:403}));await assert.rejects(denied.call('metrics/'),/leesrechten/);
  const limited=new RevenueApi({KLAVIYO_REPORTING_KEY:'synthetic-c'},undefined,async()=>new Response('',{status:429,headers:{'Retry-After':'40'}}));await assert.rejects(limited.call('flow-values-reports/'),error=>error.status===429&&error.retryAfter===40);
});

test('upstream redirects are rejected without forwarding the private key',async()=>{
 let calls=0;
 const api=new RevenueApi({KLAVIYO_REPORTING_KEY:'synthetic-redirect'},undefined,async(url,options)=>{calls++;assert.equal(options.redirect,'manual');return new Response(null,{status:302,headers:{Location:'https://foreign.test/'}});});
 await assert.rejects(api.call('metrics/'),/niet ophalen/);assert.equal(calls,1);
});

test('the platform fetch function is invoked without a class receiver',async()=>{
 const api=new RevenueApi({KLAVIYO_REPORTING_KEY:'synthetic-native-fetch'},undefined,async function(url,options){assert.equal(this,undefined);assert.equal(options.redirect,'manual');return Response.json({data:[]});});
 assert.deepEqual(await api.call('metrics/'),{data:[]});
});
