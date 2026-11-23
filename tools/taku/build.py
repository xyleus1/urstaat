"""Prepare an editable, source-registered Blender master and the Taku web models."""
import argparse
import json
import math
from pathlib import Path
import shutil
import subprocess
import xml.etree.ElementTree as ET

import bpy
import mujoco
from mathutils import Matrix, Quaternion, Vector
from motion import build_motion


REVISION = "afa61685f434a9a2a61e255711788bcfe2f42f92"
ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(__doc__)
parser.add_argument("--source", type=Path, required=True, help="Pinned Dyna Git checkout")
parser.add_argument("--master", type=Path, required=True, help="Destination editable .blend")
parser.add_argument("--cache", type=Path, default=ROOT / ".qa")
parser.add_argument("--output", type=Path, default=ROOT / "research/part-2/assets")
args = parser.parse_args()
args.source = args.source.resolve()
args.master = args.master.resolve()
args.cache.mkdir(parents=True, exist_ok=True)
args.master.parent.mkdir(parents=True, exist_ok=True)
args.output.mkdir(parents=True, exist_ok=True)
head = subprocess.check_output(
    ["git", "-c", f"safe.directory={args.source.as_posix()}", "-C", str(args.source), "rev-parse", "HEAD"],
    text=True,
).strip()
if head != REVISION:
    raise ValueError(f"Expected source {REVISION}, got {head}")
source = args.source / "dyna_taku"
description = ET.parse(source / "taku.xml").getroot()
model = mujoco.MjModel.from_xml_path(str(source / "scene.xml"))
state = mujoco.MjData(model)
mujoco.mj_resetDataKeyframe(model, state, model.key("home").id)
# Bring the near forearm forward so the wrist and jaws clear the folding waist.
# Every offset is inside the manufacturer's published joint limits.
for side, pitch, roll, elbow in (("left", -.14, .15, -1.02), ("right", -.09, -.10, -.47)):
    for name, angle in (("shoulder_pitch", pitch), ("shoulder_roll", roll), ("elbow", elbow)):
        joint = model.joint(f"{side}_{name}_joint")
        state.qpos[joint.qposadr[0]] = angle
# Open each opposing jaw by 12 mm along its real, coupled prismatic joint.
for side in ("left", "right"):
    for finger, offset in (("rear", .012), ("front", -.012)):
        joint = model.joint(f"{side}_gripper_{finger}_joint")
        state.qpos[joint.qposadr[0]] = offset
mujoco.mj_forward(model, state)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.render.resolution_x = 1440
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.world = bpy.data.worlds.new("Soft studio")
scene.world.color = (.21, .23, .25)
studio = bpy.data.collections.new("Studio · excluded from web exports")
scene.collection.children.link(studio)
rig = bpy.data.collections.new("Taku · registered visual assembly")
scene.collection.children.link(rig)


def empty(name, parent=None):
    obj = bpy.data.objects.new(name, None)
    rig.objects.link(obj)
    obj.parent = parent
    obj.empty_display_size = .012
    return obj


def material(name, rgb, roughness, metal=0, coat=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*rgb, 1)
    mat.use_nodes = True
    node = mat.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = (*rgb, 1)
    node.inputs["Roughness"].default_value = roughness
    node.inputs["Metallic"].default_value = metal
    node.inputs["Coat Weight"].default_value = coat
    node.inputs["Coat Roughness"].default_value = max(.12, roughness - .08)
    return mat


shell = material("Taku · satin porcelain shell", (.72, .755, .765), .36, .035, .15)
black = material("Taku · graphite", (.017, .021, .023), .42, .10)
silver = material("Taku · bead-blasted alloy", (.34, .36, .365), .33, .64)
cap = material("Taku · satin joint cap", (.11, .13, .14), .39, .47, .06)
rubber = material("Taku · elastomer", (.016, .019, .020), .68)
green = material("Taku · DynaClaw grip surface", (.071, .31, .115), .58)
rim = material("Taku · optical surround", (.012, .014, .016), .30, .30)
glass = material("Taku · smoke optical glass", (.023, .032, .041), .22, .26, .36)
logo = shell.copy()
logo.name = "Taku · chest print"
tex = logo.node_tree.nodes.new("ShaderNodeTexImage")
tex.image = bpy.data.images.load(str(source / "assets/textures/chest_albedo.png"))
tex.image.pack()
logo.node_tree.links.new(tex.outputs["Color"], logo.node_tree.nodes.get("Principled BSDF").inputs["Base Color"])
materials = {"photo_white": shell, "photo_black": black, "photo_gray": silver, "photo_green": green, "chest_logo": logo}

asset_files = {n.get("name"): source / "assets" / n.get("file") for n in description.findall("asset/mesh")}
body_nodes = {}
world_matrices = {}
root = empty("Taku")
root["attribution"] = "Taku by dyna robotics, Apache-2.0. Urstaat: material, pose and LOD adaptation."


def transform(xyz, quat):
    return Matrix.Translation(Vector(xyz)) @ Quaternion(quat).to_matrix().to_4x4()


def add_body(element, parent, parent_world):
    name = element.get("name")
    idx = model.body(name).id
    world = transform(state.xpos[idx], state.xquat[idx])
    body = empty(name, parent)
    body.matrix_basis = parent_world.inverted() @ world
    body_nodes[name] = body
    world_matrices[name] = world
    for geom in element.findall("geom[@class='visual']"):
        mesh_name = geom.get("mesh")
        bpy.ops.wm.obj_import(filepath=str(asset_files[mesh_name]), forward_axis="NEGATIVE_Y", up_axis="Z")
        obj, = bpy.context.selected_objects
        for collection in list(obj.users_collection):
            collection.objects.unlink(obj)
        rig.objects.link(obj)
        obj.name = mesh_name
        obj.parent = body
        obj.matrix_basis = transform(
            tuple(map(float, geom.get("pos", "0 0 0").split())),
            tuple(map(float, geom.get("quat", "1 0 0 0").split())),
        )
        mat = materials[geom.get("material")]
        if mesh_name == "head_roll_link_surface_3":
            mat = rim
        elif mat == black and ("wheel" in mesh_name or "gripper" in mesh_name):
            mat = rubber
        obj.data.materials.clear()
        obj.data.materials.append(mat)
        if "_elbow_link_surface_3" in mesh_name:
            # This source OBJ contains three disconnected CAD solids on each arm.
            # Both caps end above z=-34.6 mm; the white fork ends below -38.7 mm.
            # The plane lies in the gap, so it assigns entire solids.
            obj.data.materials.append(cap)
            on_cap = [vertex.co.z > -.0365 for vertex in obj.data.vertices]
            for poly in obj.data.polygons:
                cap_membership = {on_cap[index] for index in poly.vertices}
                if len(cap_membership) != 1:
                    raise ValueError(f"{mesh_name}: elbow cap material would split a face")
                poly.material_index = int(cap_membership.pop())
    for child in element.findall("body"):
        add_body(child, body, world)


add_body(description.find("worldbody/body"), root, Matrix.Identity(4))

# Shallow optical covers fit inside the original two pill-shaped surrounds. The
# submillimetre crown catches a softbox at macro distance without implying an
# undocumented internal lens or changing the manufacturer's silhouette.
def optical_cover(label, center_y):
    verts = []
    faces = []
    radius, half_straight = .0121, .0091
    steps = 24
    outline = []
    for angle0, center_z in ((0, half_straight), (math.pi, -half_straight)):
        for i in range(steps + 1):
            a = angle0 + math.pi * i / steps
            outline.append((radius * math.cos(a), center_z + radius * math.sin(a)))
    count = len(outline)
    for k, scale in enumerate((1, .87, .64, .35, .12)):
        x = .08159 + .00084 * (1 - scale * scale)
        for y, z in outline:
            verts.append((x, center_y + y * scale, .03803 + z * scale))
        if k:
            for i in range(count):
                n = (i + 1) % count
                faces.append(((k-1)*count+i, (k-1)*count+n, k*count+n, k*count+i))
    center = len(verts)
    verts.append((.08243, center_y, .03803))
    for i in range(count):
        faces.append((4*count+i, 4*count+(i+1) % count, center))
    mesh = bpy.data.meshes.new(f"{label} optical cover")
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(glass)
    for poly in mesh.polygons:
        poly.use_smooth = True
    obj = bpy.data.objects.new(f"head_optical_cover_{label}", mesh)
    rig.objects.link(obj)
    obj.parent = body_nodes["head_roll_link"]


optical_cover("left", .02975)
optical_cover("right", -.03025)
anchors = {
    "face": ("head_roll_link", (.071, 0, .041)),
    "waist": ("folding_to_waist_link", (-.12, 0, .063)),
    "base": ("agv_base_link", (0, 0, .16)),
}
for side, direction in (("left", 1), ("right", -1)):
    prefix = "" if side == "left" else "right_"
    anchors.update({
        prefix + "shoulder": (f"{side}_shoulder_roll_link", (0, .018*direction, -.040)),
        prefix + "elbow": (f"{side}_elbow_link", (0, .030*direction, 0)),
        prefix + "wrist": (f"{side}_wrist_roll_link", (0, .008*direction, -.035)),
        prefix + "claw": (f"{side}_wrist_roll_link", (-.028, 0, -.219)),
    })
for label, (link, xyz) in anchors.items():
    empty("view_" + label, body_nodes[link]).location = xyz


def aim(obj, xyz):
    obj.rotation_euler = (Vector(xyz) - obj.location).to_track_quat("-Z", "Y").to_euler()


camera = bpy.data.objects.new("Studio overview", bpy.data.cameras.new("Overview lens"))
studio.objects.link(camera)
camera.location = (2.7, 1.35, 1.34)
camera.data.type = "ORTHO"
camera.data.ortho_scale = 1.82
aim(camera, (.0, 0, .69))
scene.camera = camera
for name, xyz, watts, width in (("Key", (2, 1.7, 3), 145, 2.5), ("Fill", (1, -2, 1.3), 76, 2), ("Rim", (-1.5, .6, 2), 130, 1.8)):
    lamp = bpy.data.lights.new(name, "AREA")
    lamp.energy, lamp.shape, lamp.size = watts, "DISK", width
    obj = bpy.data.objects.new(name, lamp)
    studio.objects.link(obj)
    obj.location = xyz
    aim(obj, (0, 0, .72))

bpy.context.view_layer.update()
for area in bpy.context.screen.areas:
    if area.type == "VIEW_3D":
        area.spaces.active.region_3d.view_perspective = "CAMERA"
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.object.select_all(action="DESELECT")
bpy.ops.wm.save_as_mainfile(filepath=str(args.master), compress=True)
for obj in rig.objects:
    obj.select_set(True)
raw = args.cache / "taku-authoring.glb"
bpy.ops.export_scene.gltf(filepath=str(raw.resolve()), use_selection=True, export_yup=True, export_extras=True)
shutil.copyfile(source / "LICENSE", args.output / "LICENSE-Dyna.txt")

for tier, ratio, max_error, budget in (("mobile", "0.12", "0.0019", 2.6), ("desktop", "0.74", "0.0008", 5.9)):
    dest = args.output / f"taku-{tier}.glb"
    command = [shutil.which("npm.cmd") or "npm", "exec", "--yes", "--package=gltfpack@1.3.0", "--", "gltfpack",
               "-i", str(raw), "-o", str(dest), "-cc", "-ce", "ext", "-kn", "-km", "-ke", "-si", ratio, "-se", max_error]
    subprocess.run(command, check=True)
    if dest.stat().st_size > budget * 1048576:
        raise ValueError(f"{tier} exceeds {budget} MiB")
    print(f"{tier}: {dest.stat().st_size:,} bytes", flush=True)
build_motion(raw, args.output / "taku-motion.bin")
print("Anchor positions in Y-up glTF metres:")
for label, (link, xyz) in anchors.items():
    x, y, z = world_matrices[link] @ Vector(xyz)
    print(label, tuple(round(v, 5) for v in (x, z, -y)))
