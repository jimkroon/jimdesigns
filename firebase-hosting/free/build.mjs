import {build} from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const development=process.argv.includes('--development');
const out=path.resolve(root,development?'../../.local-review/firebase-free-preview':'../public');
await fs.mkdir(path.join(out,'notas'),{recursive:true});await fs.mkdir(path.join(out,'firebase'),{recursive:true});
await build({entryPoints:[path.join(root,'src/admin.mjs')],outfile:path.join(out,'notas/firebase.js'),bundle:true,format:'esm',minify:!development,sourcemap:false,define:{__DEV__:String(development)},target:'es2022'});
await build({entryPoints:[path.join(root,'src/contact.mjs')],outfile:path.join(out,'firebase/contact.js'),bundle:true,format:'esm',minify:!development,sourcemap:false,define:{__DEV__:String(development)},target:'es2022'});
const scriptHash=createHash('sha256').update(await fs.readFile(path.join(out,'notas/firebase.js'))).digest('hex').slice(0,12);
await fs.writeFile(path.join(out,'notas/index.html'),(await fs.readFile(path.join(root,'src/admin.html'),'utf8')).replace('/notas/firebase.js','/notas/firebase.js?v='+scriptHash));
await fs.copyFile(path.join(root,'src/admin.css'),path.join(out,'notas/firebase.css'));
await fs.copyFile(path.join(root,'src/contact-loader.js'),path.join(out,'contact.js'));
if(development){
  const base=path.resolve(root,'../public');
  for(const item of ['assets','index.html','site.js','site.css','seo.css','favicon.ico'])await fs.cp(path.join(base,item),path.join(out,item),{recursive:true});
  await fs.copyFile(path.join(base,'notas/style.css'),path.join(out,'notas/style.css'));
}
const contactHash=createHash('sha256').update(await fs.readFile(path.join(out,'firebase/contact.js'))).digest('hex').slice(0,12);
const loader=(await fs.readFile(path.join(out,'contact.js'),'utf8')).replace('/firebase/contact.js','/firebase/contact.js?v='+contactHash);
await fs.writeFile(path.join(out,'contact.js'),loader);
for(const name of await fs.readdir(out)){
  if(!name.endsWith('.html'))continue;
  const target=path.join(out,name);const html=await fs.readFile(target,'utf8');
  await fs.writeFile(target,html.replace(/contact\.js\?[^"']*/g,'contact.js?v=firebase-'+contactHash).replaceAll('Google reCAPTCHA v3','Google reCAPTCHA'));
}
console.log(JSON.stringify({development,output:out}));
