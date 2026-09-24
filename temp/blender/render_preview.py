import bpy
import math
from mathutils import Vector

OUT = r"C:\Users\Josh\Documents\WorkProjects\gripkicks\temp\blender\preview"
RES = (720, 540)

scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.render.resolution_x = RES[0]
scene.render.resolution_y = RES[1]
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"

shading = scene.display.shading
shading.light = "STUDIO"
shading.studio_light = "paint.sl"
shading.color_type = "OBJECT"
shading.show_cavity = True
shading.cavity_type = "WORLD"
shading.curvature_ridge_factor = 1.5
shading.curvature_valley_factor = 1.0
shading.show_shadows = True
shading.show_object_outline = False

shoe = bpy.data.objects["CimbingShoe"]
bpy.context.view_layer.objects.active = shoe
shoe.select_set(True)

cam_data = bpy.data.cameras.get("PreviewCam") or bpy.data.cameras.new("PreviewCam")
cam = bpy.data.objects.get("PreviewCam") or bpy.data.objects.new("PreviewCam", cam_data)
if cam.name not in scene.collection.objects:
    scene.collection.objects.link(cam)
scene.camera = cam
cam_data.lens = 60

views = {
    "side": (0.0, 0.0, 1.85),
    "front34": (0.95, 0.4, 1.4),
    "top": (0.02, 1.9, 0.1),
    "back34": (-1.35, 0.45, -1.2),
    "bottom34": (0.25, -1.3, 1.0),
}

center = Vector((0.0, 0.0, 0.0))
for name, loc in views.items():
    cam.location = Vector(loc)
    direction = center - Vector(loc)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = OUT + "\\" + name + ".png"
    bpy.ops.render.render(write_still=True)

result = {"rendered": list(views.keys())}
