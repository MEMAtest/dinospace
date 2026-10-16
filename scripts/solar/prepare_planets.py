"""Blender 4.5: optimise NASA reference models and produce editable assets/thumbnails.
Run: Blender --background --python scripts/solar/prepare_planets.py
Inputs: tmp/solar-nasa-originals/{planet}.glb and sources.json (documented sources).
"""
import bpy, json, math, pathlib, hashlib
from mathutils import Vector
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/models/solar-v1'
SOURCE = ROOT / 'assets-source/solar'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.context.preferences.filepaths.save_version=0
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.render.resolution_x = scene.render.resolution_y = 320
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.view_settings.view_transform = 'AgX'
scene.world.color = (0.16, 0.16, 0.16)
# Soft studio lights; material itself remains PBR in the exported GLBs.
for loc, energy, size in [((-3,-4,5),650,4),((4,1,2),220,3),((0,3,4),400,2)]:
 bpy.ops.object.light_add(type='AREA',location=loc)
 light=bpy.context.object;light.data.energy=energy;light.data.shape='DISK';light.data.size=size
 light.rotation_euler=(-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(0,-6,2.1))
camera=bpy.context.object;camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=2.65;scene.camera=camera
sources=json.loads((ROOT/'tmp/solar-nasa-originals/sources.json').read_text())
report=[]
for entry in sources:
 name=entry['name'];slug=name.lower();before=set(bpy.data.objects)
 bpy.ops.import_scene.gltf(filepath=str(ROOT/f'tmp/solar-nasa-originals/{slug}.glb'))
 imported=[obj for obj in bpy.data.objects if obj not in before]
 meshes=[obj for obj in imported if obj.type=='MESH']
 # Apply the NASA import transforms before normalising the planet body (not its rings).
 bpy.context.view_layer.update()
 for obj in meshes:
  matrix=obj.matrix_world.copy();obj.parent=None;obj.matrix_world=matrix
 body=max((o for o in meshes if min(o.dimensions)>max(o.dimensions)*0.6),key=lambda o:max(o.dimensions))
 center=body.matrix_world @ (sum((Vector(c) for c in body.bound_box), Vector())/8)
 radius=max(body.dimensions)/2
 for obj in meshes:
  obj.location=(obj.location-center)/radius;obj.scale/=radius
  obj.select_set(True)
  bpy.context.view_layer.objects.active=obj
  bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
  for poly in obj.data.polygons:poly.use_smooth=True
  # Smooth silhouettes using one subdivision, with a bounded final triangle budget.
  if obj==body:
   # glTF splits vertices at UV seams; weld before subdivision to prevent cracks.
   bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
   bpy.ops.mesh.remove_doubles(threshold=0.0001);bpy.ops.object.mode_set(mode='OBJECT')
   mod=obj.modifiers.new('Smooth planet silhouette','SUBSURF');mod.levels=1
   bpy.ops.object.modifier_apply(modifier=mod.name)
   if len(obj.data.polygons)>5000:
    dec=obj.modifiers.new('Mobile mesh budget','DECIMATE');dec.ratio=5000/len(obj.data.polygons)
    bpy.ops.object.modifier_apply(modifier=dec.name)
  for mat in obj.data.materials:
   if not mat or not mat.use_nodes:continue
   for node in mat.node_tree.nodes:
    if node.type=='BSDF_PRINCIPLED':
     node.inputs['Metallic'].default_value=0
     node.inputs['Roughness'].default_value=0.76 if name=='Earth' else 0.85
     node.inputs['Specular IOR Level'].default_value=0.25
    if node.type=='NORMAL_MAP':node.inputs['Strength'].default_value=0.25
    if node.type=='TEX_IMAGE' and node.image:
     if name=='Earth' and 'diff' in node.image.name.lower():
      node.image=bpy.data.images.load(str(ROOT/'tmp/solar-nasa-originals/earth-blue-marble.png'),check_existing=True)
     image=node.image
     if max(image.size)>1024:
      scale=1024/max(image.size);image.scale(max(1,int(image.size[0]*scale)),max(1,int(image.size[1]*scale)))
     # Re-encode resized images so no large original packed payload survives.
     alpha='ring' in image.name.lower()
     image.file_format='PNG' if alpha else 'JPEG'
     image.filepath_raw=str(ROOT / (f'tmp/solar-nasa-originals/{slug}-{image.name.replace("/","_")}.' + ('png' if alpha else 'jpg')))
     image.save();image.pack()
  obj.name=f'{name}_{"surface" if obj==body else "rings"}_{obj.name}'
 # Hide previous worlds while exporting / rendering this world's own meshes.
 for obj in bpy.data.objects:
  if obj.type=='MESH':obj.hide_render=obj not in meshes
 bpy.ops.object.select_all(action='DESELECT')
 for obj in meshes:obj.select_set(True)
 bpy.context.view_layer.objects.active=body
 bpy.ops.export_scene.gltf(filepath=str(OUT/f'{slug}.glb'),export_format='GLB',use_selection=True,export_cameras=False,export_lights=False,export_animations=False,export_image_format='AUTO',export_extras=True)
 camera.data.ortho_scale=5.1 if name=='Saturn' else 2.65
 scene.render.filepath=str(OUT/f'{slug}.png');bpy.ops.render.render(write_still=True)
 for obj in imported:
  if obj.type!='MESH':bpy.data.objects.remove(obj,do_unlink=True)
 # Save each editable planet separately with its packed, optimised textures.
 bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/f'{slug}.blend'),compress=True)
 data=(OUT/f'{slug}.glb').read_bytes()
 report.append({**entry,'output':f'/models/solar-v1/{slug}.glb','outputBytes':len(data),'outputSha256':hashlib.sha256(data).hexdigest(),'triangles':sum(len(o.data.loop_triangles) for o in meshes),'bodyRadius':1,'credit':'NASA/JPL-Caltech' if name=='Mars' else 'NASA Visualization Technology Applications and Development (VTAD)','adaptation':'Blender 4.5.3 LTS: normalised body, smoothed silhouette, mobile texture budget, PBR materials and studio thumbnail'})
 # Each .blend is standalone; don't accumulate earlier worlds in subsequent files.
 for obj in meshes:bpy.data.objects.remove(obj,do_unlink=True)
 bpy.data.orphans_purge(do_recursive=True)
 for image in list(bpy.data.images):
  if image.users==0:bpy.data.images.remove(image)
(OUT/'manifest.json').write_text(json.dumps({'version':1,'tool':'Blender 4.5.3 LTS','notToScale':True,'supplementalTextures':json.loads((SOURCE/'supplemental-textures.json').read_text()),'models':report},indent=2)+'\n')
print('PLANET_PACKAGE_COMPLETE',sum(r['outputBytes'] for r in report),flush=True)
