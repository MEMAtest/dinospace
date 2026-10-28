import sys,json,zipfile,hashlib,re
from pathlib import Path
from xml.etree import ElementTree as ET
stage=sys.argv[1];base=Path('docs/qa-evidence/code-writing-20261028');rows=[]
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
normalize=lambda s:re.sub(r'\s+',' ',s).strip()
for report in base.glob(f'{stage}-writing-*.json'):
 data=json.loads(report.read_text());assert data['passed']
 for row in data['rows']:
  p=Path(row['exportFile'])
  with zipfile.ZipFile(p) as archive:
   document=ET.fromstring(archive.read('word/document.xml'))
   text='\n'.join(''.join(x.itertext()) for x in document.findall('.//w:t',ns))
   # A paragraph's individual runs may split text at formatting boundaries.
   text='\n'.join(''.join(x.text or '' for x in paragraph.findall('.//w:t',ns)) for paragraph in document.findall('.//w:body/w:p',ns))
   assert normalize(text)==normalize(row['authoredText']),(str(p),'authored/export text differs')
   assert document.find('.//w:rPr/w:b',ns) is not None
   if row['project']!='space-postcard':assert document.find('.//w:rPr/w:i',ns) is not None
   if row['project']=='planet-mini-report':assert any(n.attrib.get('{'+ns['w']+'}val')=='center' for n in document.findall('.//w:pPr/w:jc',ns))
   media=[n for n in archive.namelist() if n.startswith('word/media/') and n.endswith('.png')];assert len(media)==1
   model={'space-postcard':'solar-v2/earth.png','planet-field-notes':'solar-v1/mars.png','planet-mini-report':'solar-v1/saturn.png'}[row['project']]
   sha=lambda b:hashlib.sha256(b).hexdigest();assert sha(archive.read(media[0]))==sha(Path('public/models',model).read_bytes())
   rows.append({'file':str(p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes()),'authoredTextMatches':True,'bold':True,'italicRequired':row['project']!='space-postcard','embeddedImageMatches':model})
assert rows,'no completed export reports'
out=base/f'{stage}-word-inspection.json';out.write_text(json.dumps({'passed':True,'files':rows},indent=2)+'\n');print(json.dumps({'passed':True,'files':len(rows),'report':str(out)}))
