import bpy
import bmesh
import os
from pathlib import Path
from mathutils import Vector

root = Path(r'C:\Users\Josh\Documents\WorkProjects\gripkicks\temp\blender')
scene = bpy.context.scene
reference = bpy.data.objects['Original Hero Reference']
source = [o for o in scene.objects if o.type == 'MESH' and o.name.startswith('HeroV3') and not o.hide_render]
optimized = []
for obj in source:
    copy = obj.copy()
    copy.data = obj.data.copy()
    scene.collection.objects.link(copy)
    bpy.ops.object.select_all(action='DESELECT')
    copy.hide_set(False)
    copy.select_set(True)
    bpy.context.view_layer.objects.active = copy
    part = obj.name.split(' ',1)[1].split('.')[0]
    ratio = 0.70 if part in ('Upper','Rubber sole') else 0.80
    modifier = copy.modifiers.new('Export simplification', 'DECIMATE')
    modifier.ratio = ratio
    modifier.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    optimized.append(copy)
    obj.hide_render = True
    obj.hide_set(True)

bpy.ops.object.select_all(action='DESELECT')
for obj in optimized:
    obj.select_set(True)
bpy.context.view_layer.objects.active = optimized[0]
bpy.ops.object.join()
shoe = bpy.context.object
shoe.name = 'Hero Shoe V3 Preview'
shoe.data.name = 'Hero Shoe V3 Geometry'
shoe.data.materials.clear()
shoe.data.calc_loop_triangles()
bm = bmesh.new()
bm.from_mesh(shoe.data)
validation = {
    'vertices': len(shoe.data.vertices),
    'triangles': len(shoe.data.loop_triangles),
    'boundary_edges': sum(e.is_boundary for e in bm.edges),
    'nonmanifold_edges': sum(not e.is_manifold for e in bm.edges),
    'degenerate_faces': sum(f.calc_area() < 1e-12 for f in bm.faces),
}
bm.free()

old_named = bpy.data.objects.get('CimbingShoe')
if old_named:
    old_named.name = 'CimbingShoe existing preview'
shoe.name = 'CimbingShoe'
bpy.ops.export_scene.gltf(
    filepath=str(root / 'HeroShoe.v3-preview.glb'),
    export_format='GLB',
    use_selection=True,
    use_active_scene=True,
    export_yup=True,
    export_apply=True,
    export_texcoords=False,
    export_normals=True,
    export_materials='NONE',
    export_animations=False,
    export_cameras=False,
    export_lights=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
)
shoe.name = 'Hero Shoe V3 Preview'
if old_named:
    old_named.name = 'CimbingShoe'
validation['glb_bytes'] = (root / 'HeroShoe.v3-preview.glb').stat().st_size

center = sum((reference.matrix_world @ Vector(c) for c in reference.bound_box), Vector()) / 8
for name, direction in [('v3-three-quarter', (1.2,-1.8,1.1)), ('v3-side', (0,-2,0.12)), ('v3-heel', (-1.4,-1.5,0.9))]:
    scene.camera.location = center + Vector(direction)
    scene.camera.rotation_euler = (center-scene.camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath = str(root / 'preview' / (name+'.png'))
    bpy.ops.render.render(write_still=True)

scene.camera.location = center + Vector((1.2,-1.8,1.1))
scene.camera.rotation_euler = (center-scene.camera.location).to_track_quat('-Z','Y').to_euler()
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        space = area.spaces.active
        space.region_3d.view_location = center
        space.region_3d.view_distance = 1.65
        space.region_3d.view_rotation = scene.camera.rotation_euler.to_quaternion()
        space.region_3d.view_perspective = 'ORTHO'
        space.overlay.show_overlays = False
        space.shading.type = 'SOLID'
        space.shading.light = 'STUDIO'
        space.shading.color_type = 'OBJECT'
        space.shading.show_cavity = True
        space.shading.cavity_type = 'BOTH'

bpy.ops.wm.save_as_mainfile(filepath=str(root / 'HeroShoe.v3-review.blend'), copy=True)
result = validation
