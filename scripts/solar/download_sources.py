"""Download hash-verified NASA inputs; no runtime network dependency is introduced."""
import pathlib,json,urllib.request,hashlib
root=pathlib.Path(__file__).resolve().parents[2]
out=root/'tmp/solar-nasa-originals';out.mkdir(parents=True,exist_ok=True)
rows=json.loads((root/'assets-source/solar/nasa-sources.json').read_text())
for row in rows:
 path=out/f"{row['name'].lower()}.glb"
 data=path.read_bytes() if path.exists() else urllib.request.urlopen(row['url'],timeout=90).read()
 if hashlib.sha256(data).hexdigest()!=row['sha256']:raise ValueError(f"Source changed: {row['name']}; review before regenerating")
 path.write_bytes(data)
(out/'sources.json').write_text(json.dumps(rows,indent=2))
print('Verified NASA originals:',len(rows))

for row in json.loads((root/'assets-source/solar/supplemental-textures.json').read_text()):
 path=out/row['filename']
 data=path.read_bytes() if path.exists() else urllib.request.urlopen(row['url'],timeout=90).read()
 if hashlib.sha256(data).hexdigest()!=row['sha256']:raise ValueError('Supplemental texture changed')
 path.write_bytes(data)
