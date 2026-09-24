import bpy
import math
from mathutils import Vector

OUT = r"C:\Users\Josh\Documents\WorkProjects\gripkicks\temp\blender\preview\glass.png"

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

bpy.ops.import_scene.gltf(
    filepath=r"C:\Users\Josh\Documents\WorkProjects\gripkicks\temp\blender\HeroShoe.glb"
)
shoe = bpy.context.selected_objects[0]
shoe.rotation_euler = (math.radians(8), math.radians(-25), math.radians(10))

mat = bpy.data.materials.new("glass")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (1.0, 0.98, 0.94, 1.0)
bsdf.inputs["Roughness"].default_value = 0.15
bsdf.inputs["IOR"].default_value = 1.2
bsdf.inputs["Transmission Weight"].default_value = 1.0
shoe.data.materials.clear()
shoe.data.materials.append(mat)

world = bpy.data.worlds.new("w")
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.035, 0.035, 0.05, 1.0)
bg.inputs[1].default_value = 1.0
bpy.context.scene.world = world

for name, loc, energy, size, color in (
    ("key", (1.6, 1.4, 1.2), 900, 0.6, (1.0, 0.85, 0.75)),
    ("rim", (-1.4, 0.8, -1.0), 1100, 0.4, (1.0, 0.45, 0.30)),
    ("fill", (0.3, -1.2, 0.8), 500, 0.5, (0.6, 0.7, 1.0)),
):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy = energy
    ld.shape = "DISK"
    ld.size = size
    ld.color = color
    lo = bpy.data.objects.new(name, ld)
    bpy.context.collection.objects.link(lo)
    lo.location = loc
    lo.rotation_euler = (Vector((0, 0, 0)) - lo.location).to_track_quat("-Z", "Y").to_euler()

cam_data = bpy.data.cameras.new("c")
cam = bpy.data.objects.new("c", cam_data)
bpy.context.collection.objects.link(cam)
bpy.context.scene.camera = cam
cam.location = (0.85, 0.32, 1.35)
cam.rotation_euler = (Vector((0.0, 0.05, 0.0)) - cam.location).to_track_quat("-Z", "Y").to_euler()
cam_data.lens = 58

sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.samples = 48
sc.cycles.use_denoising = True
sc.render.resolution_x = 720
sc.render.resolution_y = 540
sc.render.film_transparent = False
sc.view_settings.look = "AgX - Medium High Contrast"
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)

result = {"done": True}
