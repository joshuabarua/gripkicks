import bpy
import math

RING_N = 18
SUPER = 2.4

X_PIVOT = 0.62
SOLE_PIVOT = 0.050
R_WRAP = 0.36

# (x, half_width, sole_y, top_y, cz, asym) - neutral last, downturn applied via wrap
STATIONS = [
    (0.000, 0.030, 0.140, 0.210, -0.005, 0.00),
    (0.030, 0.100, 0.100, 0.270, -0.010, 0.00),
    (0.070, 0.145, 0.085, 0.335, -0.012, 0.00),
    (0.120, 0.160, 0.085, 0.350, -0.012, 0.00),
    (0.180, 0.168, 0.090, 0.342, -0.010, 0.00),
    (0.240, 0.162, 0.100, 0.308, -0.008, 0.00),
    (0.310, 0.160, 0.115, 0.290, -0.004, 0.00),
    (0.380, 0.165, 0.105, 0.278,  0.000, 0.00),
    (0.440, 0.175, 0.085, 0.272,  0.002, 0.00),
    (0.500, 0.188, 0.070, 0.262,  0.004, 0.01),
    (0.560, 0.198, 0.060, 0.256,  0.006, 0.02),
    (0.620, 0.208, 0.050, 0.240,  0.008, 0.03),
    (0.680, 0.208, 0.045, 0.215,  0.012, 0.05),
    (0.740, 0.196, 0.042, 0.196,  0.018, 0.09),
    (0.800, 0.178, 0.040, 0.176,  0.024, 0.14),
    (0.850, 0.158, 0.040, 0.156,  0.030, 0.18),
    (0.900, 0.132, 0.042, 0.132,  0.037, 0.23),
    (0.940, 0.108, 0.044, 0.110,  0.043, 0.27),
    (0.970, 0.072, 0.045, 0.092,  0.048, 0.30),
    (1.000, 0.030, 0.048, 0.074,  0.052, 0.32),
]

RIDGE_CENTERS = (0.44, 0.56)
RIDGE_SIGMA = 0.030
RIDGE_HEIGHT = 0.024


def sexp(v, e):
    return math.copysign(abs(v) ** e, v)


def ridge_at(x):
    return RIDGE_HEIGHT * max(
        math.exp(-((x - c) / RIDGE_SIGMA) ** 2) for c in RIDGE_CENTERS
    )


def wrap(x, y):
    if x <= X_PIVOT:
        return x, y
    th = (x - X_PIVOT) / R_WRAP
    r = R_WRAP + (y - SOLE_PIVOT)
    return X_PIVOT + r * math.sin(th), SOLE_PIVOT - R_WRAP + r * math.cos(th)


def build_mesh():
    n_st = len(STATIONS)
    centers = [(s[0], (s[2] + s[3]) * 0.5) for s in STATIONS]
    slopes = []
    for i in range(n_st):
        i0 = max(0, i - 1)
        i1 = min(n_st - 1, i + 1)
        dx = centers[i1][0] - centers[i0][0]
        dy = centers[i1][1] - centers[i0][1]
        slopes.append(dy / dx if dx else 0.0)

    verts = []
    for i, (x, w, sole_y, top_y, cz, asym) in enumerate(STATIONS):
        cy = (sole_y + top_y) * 0.5
        htop = top_y - cy
        hbot = cy - sole_y
        phi = math.atan(slopes[i])
        sin_phi = math.sin(phi)
        cos_phi = math.cos(phi)
        ridge = ridge_at(x)
        rand_puff = 1.0 + 0.05 * max(0.0, (x - 0.74) / 0.26)
        for j in range(RING_N):
            th = 2.0 * math.pi * j / RING_N
            s = math.sin(th)
            c = math.cos(th)
            su = sexp(s, 2.0 / SUPER)
            sv = sexp(c, 2.0 / SUPER)
            z = su * w * (1.0 + asym * su) * rand_puff
            if sv < -0.2:
                z *= 1.0 + 0.12 * (-sv)
            v = sv * htop if sv > 0.0 else -hbot * (abs(sv) ** 0.65)
            if sv > 0.3:
                v += ridge * sv
            px = x - v * sin_phi
            py = cy + v * cos_phi
            px, py = wrap(px, py)
            verts.append((px, py, cz + z))

    faces = []
    for i in range(n_st - 1):
        a = i * RING_N
        b = (i + 1) * RING_N
        for j in range(RING_N):
            jn = (j + 1) % RING_N
            faces.append((a + j, a + jn, b + jn, b + j))

    faces.append(tuple(reversed(range(0, RING_N))))
    last = (n_st - 1) * RING_N
    faces.append(tuple(last + j for j in range(RING_N)))

    xs = [v[0] for v in verts]
    ys = [v[1] for v in verts]
    zs = [v[2] for v in verts]
    mid = ((min(xs) + max(xs)) * 0.5, (min(ys) + max(ys)) * 0.5, (min(zs) + max(zs)) * 0.5)
    verts = [(v[0] - mid[0], v[1] - mid[1], v[2] - mid[2]) for v in verts]

    mesh = bpy.data.meshes.new("CimbingShoe")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    return mesh


bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for m in list(bpy.data.meshes):
    if m.users == 0:
        bpy.data.meshes.remove(m)

mesh = build_mesh()
for p in mesh.polygons:
    p.use_smooth = True

obj = bpy.data.objects.new("CimbingShoe", mesh)
bpy.context.collection.objects.link(obj)
obj.color = (0.93, 0.32, 0.18, 1.0)

sub = obj.modifiers.new("subd", "SUBSURF")
sub.subdivision_type = "CATMULL_CLARK"
sub.levels = 1
sub.render_levels = 1

bpy.context.view_layer.objects.active = obj

bpy.ops.wm.save_as_mainfile(
    filepath=r"C:\Users\Josh\Documents\WorkProjects\gripkicks\temp\blender\shoe.blend"
)

depsgraph = bpy.context.evaluated_depsgraph_get()
eval_mesh = obj.evaluated_get(depsgraph).to_mesh()
result = {
    "base_verts": len(mesh.vertices),
    "eval_verts": len(eval_mesh.vertices),
    "eval_polys": len(eval_mesh.polygons),
    "dims": [round(d, 4) for d in obj.dimensions],
}
