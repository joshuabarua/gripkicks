import bpy
import bmesh
from mathutils import Vector

reference = bpy.data.objects['Original Hero Reference']
scene = bpy.context.scene
mesh = bpy.data.meshes.new('Refined Hero Geometry')
bm = bmesh.new()
bm.from_mesh(reference.data)
bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.00001)
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.verts.ensure_lookup_table()
mesh.from_pydata([tuple(v.co) for v in bm.verts], [], [tuple(v.index for v in f.verts) for f in bm.faces])
bm.free()
mesh.update()
shoe = bpy.data.objects.new('Refined Hero Candidate', mesh)
scene.collection.objects.link(shoe)
shoe.matrix_world = reference.matrix_world.copy()
shoe.color = (0.55, 0.58, 0.62, 1.0)
bpy.ops.object.select_all(action='DESELECT')
shoe.select_set(True)
bpy.context.view_layer.objects.active = shoe
smooth = shoe.modifiers.new('Surface cleanup', 'SMOOTH')
smooth.factor = 0.65
smooth.iterations = 5
bpy.ops.object.modifier_apply(modifier=smooth.name)
for vertex in shoe.data.vertices:
    flex = max(0.0, -vertex.co.x - 0.22)
    vertex.co.z -= 0.55 * flex * flex
simplify = shoe.modifiers.new('Mobile mesh budget', 'DECIMATE')
simplify.ratio = 0.62
simplify.use_collapse_triangulate = True
bpy.ops.object.modifier_apply(modifier=simplify.name)
for face in shoe.data.polygons:
    face.use_smooth = True
reference.hide_render = True
reference.hide_set(True)
scene.camera.location = Vector((0.071, -0.165, 0.634)) + Vector((1.2, -1.8, 1.1))
scene.camera.rotation_euler = (Vector((0.071, -0.165, 0.634)) - scene.camera.location).to_track_quat('-Z', 'Y').to_euler()
scene.render.filepath = r'C:\Users\Josh\Documents\WorkProjects\gripkicks\temp\blender\preview\refined-draft.png'
bpy.ops.render.render(write_still=True)
shoe.data.calc_loop_triangles()
result = {'name': shoe.name, 'vertices': len(shoe.data.vertices), 'triangles': len(shoe.data.loop_triangles)}
