import bpy

TARGET_LEN = 1.025
OUT_GLB = r"C:\Users\Josh\Documents\WorkProjects\gripkicks\temp\blender\HeroShoe.glb"
FINAL_GLB = r"C:\Users\Josh\Documents\WorkProjects\gripkicks\packages\web\public\glb\HeroShoe.glb"

obj = bpy.data.objects["CimbingShoe"]
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

xspan = max(v.co.x for v in obj.data.vertices) - min(v.co.x for v in obj.data.vertices)
scale = TARGET_LEN / xspan
for v in obj.data.vertices:
    v.co = v.co * scale

bpy.ops.object.modifier_apply(modifier="subd")

bpy.ops.object.select_all(action="DESELECT")
obj.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB,
    export_format="GLB",
    use_selection=True,
    export_yup=True,
    export_apply=True,
    export_texcoords=False,
    export_normals=True,
    export_materials="NONE",
    export_cameras=False,
    export_lights=False,
)

import os, json
result = {
    "verts": len(obj.data.vertices),
    "polys": len(obj.data.polygons),
    "dims": [round(d, 4) for d in obj.dimensions],
    "glb_bytes": os.path.getsize(OUT_GLB),
}
