from pathlib import Path
from html.parser import HTMLParser
import re
from urllib.parse import urlsplit,unquote
root=Path(__file__).resolve().parent/'public'
projects=['atelier-faye','luwte','korst','noord','mos','coupe']
expected={'index.html':['€750','€1.250','€2.000','€3.000'],'website-laten-maken.html':['€750','€2.000','€3.000'],'webshop-laten-maken.html':['€1.250','€2.000','€3.000']}
for page,prices in expected.items():
 text=(root/page).read_text()
 for price in prices:assert price in text,(page,price)
 assert '/firebase/contact.js' not in text or 'contact.js' in text
for slug in projects:
 assert (root/f'website-concepten/{slug}/index.html').is_file()
 assert f'/website-concepten/{slug}/' in (root/'portfolio.html').read_text()
assert 'fictief concept' in (root/'portfolio.html').read_text()
assert '/firebase/contact.js' in (root/'contact.js').read_text()
assert (root/'notas/index.html').is_file() and (root/'notas/firebase.js').is_file()
assert not list(root.rglob('*.php')) and not list(root.rglob('*.sqlite*')) and not list(root.rglob('*.db'))
class Scan(HTMLParser):
 def __init__(self,file):super().__init__();self.file=file;self.ids=[];self.refs=[]
 def handle_starttag(self,t,a):
  d=dict(a)
  if 'id'in d:self.ids.append(d['id'])
  for k in ['src','href','poster','data-src']:
   if k in d:self.refs.append(d[k])
checks=0
pages=[root/n for n in expected]+[root/'portfolio.html']+list((root/'website-concepten').rglob('*.html'))
for file in pages:
 scan=Scan(file);scan.feed(file.read_text())
 assert len(scan.ids)==len(set(scan.ids)),file
 for ref in scan.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc or not u.path:continue
  dest=(root/u.path.lstrip('/'))if u.path.startswith('/')else(file.parent/unquote(u.path))
  if dest.is_dir():dest=dest/'index.html'
  assert dest.is_file(),(str(file.relative_to(root)),ref)
  checks+=1
for file in (root/'website-concepten').rglob('*.css'):
 for ref in re.findall(r'url\([\"\']?([^\"\')]+)',file.read_text()):
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  assert (file.parent/unquote(u.path)).is_file(),(file,ref)
  checks+=1
print(f'Validated current prices, six concepts, Firebase runtime and {checks} local references.')
