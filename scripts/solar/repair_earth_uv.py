import bpy, math, pathlib, json, hashlib
root=pathlib.Path(__file__).resolve().parents[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
# Native Z-up UV sphere exported as glTF Y-up; no inherited atlas coordinates.
bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,radius=1)
body=bpy.context.object;body.name='Earth_equirectangular_surface'
for p in body.data.polygons:p.use_smooth=True
mat=bpy.data.materials.new('NASA_Blue_Marble_correct_UV');mat.use_nodes=True
bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Roughness'].default_value=.78;bsdf.inputs['Specular IOR Level'].default_value=.18
image=bpy.data.images.load(str(root/'tmp/solar-nasa-originals/earth-blue-marble.png'));image.scale(2048,1024);image.pack()
tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;mat.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color']);body.data.materials.append(mat)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'assets-source/solar/earth-v2.blend'))
bpy.ops.export_scene.gltf(filepath=str(root/'public/models/solar-v2/earth.glb'),export_format='GLB',use_selection=True,export_image_format='JPEG',export_jpeg_quality=88,export_yup=True)
p=root/'public/models/solar-v2/earth.glb'
(root/'public/models/solar-v2/provenance.json').write_text(json.dumps({'source':'NASA Earth Observatory Blue Marble','sourceUrl':'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.png','change':'New Blender UV sphere: equirectangular UVs instead of inherited NASA atlas UVs. Y-up sphere, 64 segments / 32 rings.','bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()},indent=2))
from mathutils import Vector
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=320;scene.render.resolution_y=320;scene.render.resolution_percentage=100;scene.render.film_transparent=True
scene.world=bpy.data.worlds.new('Thumbnail_world');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35
bpy.ops.object.camera_add(location=(3,-5,2));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=2.5;scene.camera=camera
for location,power,size in [((3,-4,5),600,5),((-4,-2,2),350,4)]:
 bpy.ops.object.light_add(type='AREA',location=location);light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size;light.rotation_euler=(-light.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(root/'public/models/solar-v2/earth.png');bpy.ops.render.render(write_still=True)
