/* Executes the real service-worker script against an in-memory CacheStorage.
   This checks logic and packaged assets, not physical-device installability. */
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),origin='https://example.test',scope=origin+'/repo/';
const stores=new Map(),events={},networkLog=[];let activated=0,skip=0,passed=0;
const key=x=>typeof x==='string'?x:x.url;
const caches={keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),open:async name=>{
 if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);
 return{keys:async()=>[...store.keys()].map(x=>new Request(x)),match:async req=>store.get(key(req))?.clone(),addAll:async requests=>{
 const results=await Promise.all(requests.map(async req=>[key(req),await asset(req)]));results.forEach(([k,r])=>store.set(k,r));
 }};
}};
async function asset(req){let u=new URL(key(req));assert.equal(u.origin,origin);assert.ok(u.pathname.startsWith('/repo/'));let path=u.pathname.slice(6)||'index.html';if(path==='')path='index.html';const bytes=await readFile(new URL(path,root));return new Response(bytes,{status:200});}
const self={registration:{scope},location:{origin},addEventListener:(name,fn)=>events[name]=fn,clients:{claim:async()=>activated++},skipWaiting:()=>skip++};
const context=vm.createContext({self,caches,Request,Response,URL,fetch:async req=>{networkLog.push(key(req));throw Error('offline');}});
vm.runInContext(await readFile(new URL('sw.js',root),'utf8'),context);
async function fire(name,request=null){let pending,result;events[name]({request,waitUntil:p=>pending=p,respondWith:p=>result=p});if(pending)await pending;return result?await result:undefined;}
function check(name,fn){fn();passed++;}
await fire('install');let names=await caches.keys(),current=names.find(n=>n.startsWith('mates-batx-'));
check('cache version name',()=>assert.ok(current.includes('2.0.0')));
check('all 23 assets cached',()=>assert.equal(stores.get(current).size,23));
let cache=stores.get(current);for(const path of ['js/worker.mjs','data/presets.json','docs/curriculum-matematiques.pdf','icons/maskable-512.png'])check('cached '+path,()=>assert.ok(cache.has(scope+path)));
stores.set('mates-batx-%2Frepo%2F-1.9.0',new Map());stores.set('unrelated-app-v3',new Map());stores.set('mates-docent-v1',new Map([[scope+'index.html',new Response('old')]]));
await fire('activate');names=await caches.keys();
check('claims client',()=>assert.equal(activated,1));check('old same-scope cache removed',()=>assert.ok(!names.includes('mates-batx-%2Frepo%2F-1.9.0')));check('v1 safely migrated',()=>assert.ok(!names.includes('mates-docent-v1')));check('unrelated cache retained',()=>assert.ok(names.includes('unrelated-app-v3')));
let response=await fire('fetch',new Request(scope+'data/topics.json'));check('offline topic fetch',()=>assert.equal(response.status,200));const topics=await response.json();check('offline full data',()=>assert.equal(topics.length,31));check('cache fetch needs no network',()=>assert.equal(networkLog.length,0));
response=await fire('fetch',{url:scope+'unknown-route',method:'GET',mode:'navigate'});let body=await response.text();check('navigation fallback',()=>assert.ok(body.includes('lang="ca"')));
response=await fire('fetch',new Request('https://universitats.gencat.cat/example.pdf'));check('external PDFs not intercepted',()=>assert.equal(response,undefined));
response=await fire('fetch',new Request(origin+'/another-app/index.html'));check('other paths not intercepted',()=>assert.equal(response,undefined));
response=await fire('fetch',new Request(scope+'data',{method:'POST',body:'hello'}));check('POST not intercepted',()=>assert.equal(response,undefined));
events.message({data:{type:'SKIP_WAITING'}});check('explicit update accepted',()=>assert.equal(skip,1));
let manifest=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
check('relative start URL',()=>assert.equal(manifest.start_url,'./'));check('standalone mode',()=>assert.equal(manifest.display,'standalone'));
for(const i of manifest.icons){await readFile(new URL(i.src,root));check('icon '+i.src,()=>assert.ok(['192x192','512x512'].includes(i.sizes)));}
console.log(JSON.stringify({suite:'service-worker-and-manifest-simulation',passed,failed:0,scope,limitation:'In-memory execution; not a real browser service worker installation.'},null,2));
