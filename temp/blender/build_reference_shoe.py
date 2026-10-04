import bpy
import bmesh
import math
from mathutils import Vector

PREFIX = 'HeroV3'
scene = bpy.context.scene
reference = bpy.data.objects['Original Hero Reference']
collection = bpy.data.collections.new(PREFIX)
scene.collection.children.link(collection)
parts = []

sections = [
    (-0.605, 0.065, 0.014, 0.394, 0.420, 0.0),
    (-0.585, 0.077, 0.066, 0.380, 0.457, 0.0),
    (-0.545, 0.087, 0.124, 0.378, 0.500, 0.0),
    (-0.480, 0.111, 0.174, 0.382, 0.547, 0.0),
    (-0.400, 0.130, 0.206, 0.390, 0.575, 0.0),
    (-0.300, 0.145, 0.216, 0.403, 0.621, 0.0),
    (-0.200, 0.157, 0.206, 0.421, 0.675, 0.0),
    (-0.110, 0.177, 0.178, 0.442, 0.718, 0.0),
    (-0.045, 0.184, 0.158, 0.448, 0.729, 0.0),
    (0.005, 0.184, 0.143, 0.440, 0.745, 0.58),
    (0.075, 0.181, 0.137, 0.419, 0.777, 0.99),
    (0.155, 0.174, 0.139, 0.396, 0.805, 1.17),
    (0.240, 0.169, 0.143, 0.380, 0.819, 1.17),
    (0.310, 0.165, 0.131, 0.382, 0.820, 1.08),
    (0.365, 0.161, 0.096, 0.398, 0.801, 0.90),
    (0.398, 0.158, 0.050, 0.437, 0.756, 0.53),
    (0.414, 0.157, 0.012, 0.487, 0.682, 0.0),
]


def sample(x):
    for i in range(len(sections) - 1):
        a, b = sections[i], sections[i + 1]
        if x <= b[0]:
            t = max(0.0, min(1.0, (x - a[0]) / (b[0] - a[0])))
            values = [x]
            for k in range(1, 6):
                prev = sections[max(0, i - 1)]
                after = sections[min(len(sections) - 1, i + 2)]
                m0 = (b[k] - prev[k]) / (b[0] - prev[0]) * (b[0] - a[0])
                m1 = (after[k] - a[k]) / (after[0] - a[0]) * (b[0] - a[0])
                v = (2*t**3 - 3*t*t + 1)*a[k] + (t**3 - 2*t*t + t)*m0 + (-2*t**3 + 3*t*t)*b[k] + (t**3 - t*t)*m1
                values.append(max(0.0, v) if k == 5 else v)
            return values
    return sections[-1]


def bend(point):
    x, y, z = point
    flex = max(0.0, -x - 0.22)
    return (x, y, z - 0.40 * flex * flex)


def mesh_object(name, vertices, faces):
    mesh = bpy.data.meshes.new(PREFIX + ' ' + name)
    mesh.from_pydata([bend(v) for v in vertices], [], faces)
    mesh.update()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.000001)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(PREFIX + ' ' + name, mesh)
    collection.objects.link(obj)
    obj.matrix_world = reference.matrix_world.copy()
    obj.color = (0.55, 0.58, 0.62, 1.0)
    for face in mesh.polygons:
        face.use_smooth = True
    parts.append(obj)
    return obj


def apply(obj, modifier):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def tube(name, points, radius, sides=6, closed=False):
    vertices, faces = [], []
    for i, p in enumerate(points):
        before = Vector(points[(i - 1) % len(points)] if closed or i > 0 else points[0])
        after = Vector(points[(i + 1) % len(points)] if closed or i < len(points) - 1 else points[-1])
        tangent = (after - before).normalized()
        normal = tangent.cross(Vector((0, 0, 1)))
        if normal.length < 0.01:
            normal = tangent.cross(Vector((0, 1, 0)))
        normal.normalize()
        binormal = tangent.cross(normal).normalized()
        for j in range(sides):
            theta = 2 * math.pi * j / sides
            vertices.append(Vector(p) + radius * (normal * math.cos(theta) + binormal * math.sin(theta)))
    for i in range(len(points) if closed else len(points) - 1):
        for j in range(sides):
            faces.append((i*sides+j, i*sides+(j+1)%sides, ((i+1)%len(points))*sides+(j+1)%sides, ((i+1)%len(points))*sides+j))
    if not closed:
        faces.extend([tuple(reversed(range(sides))), tuple((len(points)-1)*sides+j for j in range(sides))])
    return mesh_object(name, vertices, faces)


xs = sorted(set([s[0] for s in sections] + [(a[0]+b[0])/2 for a,b in zip(sections, sections[1:])]))
segments = 24
vertices, faces, collar_left, collar_right = [], [], [], []
for i, x in enumerate(xs):
    _, cy, width, sole, top, opening = sample(x)
    middle = sole + (top - sole) * 0.36
    for j in range(segments + 1):
        theta = opening + (2 * math.pi - 2 * opening) * j / segments
        s, c = math.sin(theta), math.cos(theta)
        y = cy + width * math.copysign(abs(s)**0.83, s)
        z = middle + (top-middle)*c if c >= 0 else middle + (middle-sole)*c
        vertices.append((x, y, z))
    if x >= -0.045:
        collar_left.append(vertices[i*(segments+1)])
        collar_right.append(vertices[i*(segments+1)+segments])
for i in range(len(xs) - 1):
    for j in range(segments):
        a, b = i*(segments+1)+j, (i+1)*(segments+1)+j
        faces.append((a, a+1, b+1, b))
pole = len(vertices)
vertices.append((-0.610, 0.065, 0.405))
for j in range(segments):
    faces.append((pole, j+1, j))
last = (len(xs)-1)*(segments+1)
faces.append(tuple(last+j for j in range(segments)))
upper = mesh_object('Upper', vertices, faces)
solid = upper.modifiers.new('Lined upper', 'SOLIDIFY')
solid.thickness = 0.007
solid.offset = -1
solid.use_even_offset = True
apply(upper, solid)

collar = collar_left + list(reversed(collar_right[1:-1]))
tube('Collar piping', collar, 0.005, sides=6, closed=True)

vertices, faces = [], []
sole_segments = 16
for i, x in enumerate(xs):
    _, cy, width, sole, top, opening = sample(x)
    for j in range(sole_segments):
        theta = 2*math.pi*j/sole_segments
        y = cy + width*0.88*math.sin(theta)
        taper = min(1.0, 0.25 + (x-xs[0])/0.030)
        z = sole + 0.021 - 0.036*taper*math.cos(theta)
        vertices.append((x, y, z))
for i in range(len(xs)-1):
    for j in range(sole_segments):
        a, b = i*sole_segments+j, (i+1)*sole_segments+j
        faces.append((a, i*sole_segments+(j+1)%sole_segments, (i+1)*sole_segments+(j+1)%sole_segments, b))
faces.extend([tuple(reversed(range(sole_segments))), tuple((len(xs)-1)*sole_segments+j for j in range(sole_segments))])
mesh_object('Rubber sole', vertices, faces)

def surface_point(x, theta, height=0.0):
    _, cy, width, sole, top, _ = sample(x)
    middle = sole + (top-sole)*0.36
    s, c = math.sin(theta), math.cos(theta)
    y = cy + (width+height)*math.copysign(abs(s)**0.83, s)
    z = middle + ((top-middle) if c >= 0 else (middle-sole))*c + height*c
    return Vector((x,y,z))


for name, center_x, width_x, diagonal in [('Front strap', -0.258, 0.070, 0.035), ('Upper strap', -0.088, 0.081, -0.025)]:
    vertices, faces = [], []
    steps = 14
    across = [-1.0,-0.866,-0.5,0.0,0.5,0.866,1.0]
    for i in range(steps+1):
        fraction = i/steps
        for u in across:
            rounding = math.sqrt(max(0.0,1-u*u))
            theta = -1.12 + 2.28*fraction
            theta += 0.22*rounding*max(0.0,(fraction-0.80)/0.20)
            theta -= 0.07*rounding*max(0.0,(0.15-fraction)/0.15)
            x = center_x + u*width_x/2 + diagonal*math.sin(theta)
            edge_roll = 0.007 + 0.004*(1-u*u)
            vertices.append(surface_point(x,theta,edge_roll))
    for i in range(steps):
        for j in range(len(across)-1):
            a,b=i*len(across)+j,(i+1)*len(across)+j
            faces.append((a,a+1,b+1,b))
    strap=mesh_object(name,vertices,faces)
    solid=strap.modifiers.new('Strap thickness','SOLIDIFY')
    solid.thickness=0.008
    solid.offset=-1
    apply(strap,solid)
    points=[]
    half_width=width_x/2+0.007
    for corner_x,corner_theta,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for j in range(4):
            angle=math.radians(start+90*j/3)
            dx=corner_x*(half_width-0.009)+0.009*math.cos(angle)
            theta=0.92+corner_theta*0.085+0.065*math.sin(angle)
            x=center_x+dx+diagonal*math.sin(theta)
            points.append(surface_point(x,theta,0.013))
    tube(name+' fastening loop',points,0.0045,sides=6,closed=True)

vertices,faces=[],[]
steps=20
for i in range(steps+1):
    theta=-1.95+3.90*i/steps
    boundary_x=-0.374-0.057*abs(math.sin(theta))**1.3
    taper=0.3+0.7*math.sin(math.pi*i/steps)**0.4
    for across,height in [(-0.005,0.0003),(0,0.003),(0.005,0.0003)]:
        vertices.append(surface_point(boundary_x+across*taper,theta,height*taper))
for i in range(steps):
    for j in range(2):
        a,b=i*3+j,(i+1)*3+j
        faces.append((a,a+1,b+1,b))
patch=mesh_object('Toe rubber edge',vertices,faces)
solid=patch.modifiers.new('Toe edge thickness','SOLIDIFY')
solid.thickness=0.003
solid.offset=-1
apply(patch,solid)

vertices,faces=[],[]
steps=24
for i in range(steps+1):
    theta=-math.pi/2+math.pi*i/steps
    direction=Vector((math.cos(theta),math.sin(theta),0))
    band_center=0.538+0.052*math.cos(theta)
    taper=0.70+0.30*math.sin(math.pi*i/steps)
    for across,height in [(-1,0.001),(-0.72,0.004),(0.72,0.004),(1,0.001)]:
        origin=Vector((0.165,0.168,band_center+0.016*across*taper))+direction*0.5
        hit,location,normal,_=upper.ray_cast(origin,-direction,distance=0.8)
        if not hit:
            raise ValueError('Heel band missed upper surface')
        vertices.append(location+normal*height)
for i in range(steps):
    for j in range(3):
        a,b=i*4+j,(i+1)*4+j
        faces.append((a,a+1,b+1,b))
band=mesh_object('Heel tension band',vertices,faces)
solid=band.modifiers.new('Tension band thickness','SOLIDIFY')
solid.thickness=0.004
solid.offset=-1
apply(band,solid)

for side in (-1,1):
    vertices,faces=[],[]
    profile=[(-0.014,-0.002),(-0.014,0.002),(-0.012,0.004),(0.012,0.004),(0.014,0.002),(0.014,-0.002),(0.012,-0.004),(-0.012,-0.004)]
    for i in range(20):
        t=2*math.pi*i/20
        center=Vector((0.350+0.030*math.sin(t),0.162+side*0.092,0.750+0.073*math.cos(t)))
        radial=Vector((0.073*math.sin(t),0,0.030*math.cos(t))).normalized()
        for width,thickness in profile:
            vertices.append(center+Vector((0,width,0))+radial*thickness)
    for i in range(20):
        for j in range(8):
            faces.append((i*8+j,i*8+(j+1)%8,((i+1)%20)*8+(j+1)%8,((i+1)%20)*8+j))
    mesh_object('Heel pull '+str(side),vertices,faces)

for obj in scene.objects:
    if obj.type=='MESH' and obj not in parts:
        obj.hide_render=True
        obj.hide_set(True)

center=sum((reference.matrix_world @ Vector(c) for c in reference.bound_box),Vector())/8
scene.camera.location=center+Vector((1.2,-1.8,1.1))
scene.camera.rotation_euler=(center-scene.camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=r'C:\Users\Josh\Documents\WorkProjects\gripkicks\temp\blender\preview\v3-detail-draft.png'
bpy.ops.render.render(write_still=True)
triangles=0
for obj in parts:
    obj.data.calc_loop_triangles()
    triangles+=len(obj.data.loop_triangles)
result={'objects':[obj.name for obj in parts],'vertices':sum(len(obj.data.vertices) for obj in parts),'triangles':triangles}
