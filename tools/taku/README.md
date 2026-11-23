# Taku model and studio

The Part 2 viewer uses Dyna Robotics’ published Taku model. Its four wheel assemblies, folding waist, head, dual seven-joint arms and DynaClaw grippers come from the manufacturer's simulation package. The source revision is `afa61685f434a9a2a61e255711788bcfe2f42f92`. [Dyna’s original assets](https://github.com/dyna-robotics/dyna_robot_description/tree/afa61685f434a9a2a61e255711788bcfe2f42f92/dyna_taku) · [Dyna’s introduction to Taku](https://www.dyna.co/dyna-2.1)

## Rebuild the model

Run these commands from the website repository root with Git, uv and npm on the path. The example keeps the source checkout and editable Blender file in a sibling authoring folder.

```powershell
git clone https://github.com/dyna-robotics/dyna_robot_description.git ../urstaat-authoring/dyna_robot_description
git -C ../urstaat-authoring/dyna_robot_description checkout --detach afa61685f434a9a2a61e255711788bcfe2f42f92
uv run --isolated --python 3.11 --with bpy==4.5.3 --with mujoco==3.4.0 python tools/taku/build.py --source ../urstaat-authoring/dyna_robot_description --master ../urstaat-authoring/Taku.blend
```

`build.py` registers each of the 104 source visual meshes to its link using MuJoCo forward kinematics. It keeps both arms’ named links, adds named camera targets, packs the original chest texture, and saves a Blender scene with an editable camera and three area lights. The website receives the rig and materials. The full-precision intermediate is written to `.qa/taku-authoring.glb`.

The web exports face +X, use metres and have +Y up. The anatomical left arm lies on the −Z side. Seven `view_*` anchors target the face, left shoulder, elbow, wrist, claw, waist and base. Four `view_right_*` anchors mirror the arm details. Both exports preserve the same 265 nodes. The viewer needs a meshopt decoder for the compressed geometry.

| Export | Triangles | File size |
| --- | ---: | ---: |
| `taku-mobile.glb` | 203,341 | 1,330,824 bytes |
| `taku-desktop.glb` | 499,576 | 2,520,452 bytes |

The exporter pins `gltfpack@1.3.0`, preserves named nodes and materials, and uses mesh quantization and EXT meshopt compression. Its simplification targets are 28% for mobile and 74% for desktop. The maximum relative error settings are 0.0019 and 0.0008 respectively.

## Studio and stills

From the repository root, generate the environment texture, then render the viewer's stills after building the site. `studio.py` uses NumPy and Pillow to bake the softboxes into a CubeUV atlas for the viewer's physical materials.

```powershell
uv run --isolated --python 3.11 --with numpy --with pillow python tools/taku/studio.py
npm --prefix hero ci
npm --prefix hero run build:taku
npm --prefix site ci
npm --prefix site run render:taku-stills
```

## Adaptations and attribution

The inspection pose starts from Dyna’s home frame. To separate the wrist and hand from the waist in close-ups, the left arm uses shoulder pitch −0.14, shoulder roll +0.15 and elbow −1.02 radians. The right arm uses −0.09, −0.10 and −0.47 radians respectively. Each gripper’s opposing jaws move 12 mm apiece along their documented prismatic joints, opening the gap by 24 mm.

The studio treatment gives the shell a satin finish and separates joint plates, rubber and gripper pads by material. Each elbow’s source mesh contains a fork and two disconnected round end plates. The dark finish follows the complete end plates to their original molded edges on both arms. Two shallow optical covers fit inside the original black face surrounds. Their curvature and finish are editorial render details. The stills show the exterior surfaces represented in Dyna’s source model.

Copyright © 2026 dyna robotics. Dyna released the model, meshes and texture under Apache License 2.0. The site distributes a copy alongside the modified GLBs. [Original license](https://github.com/dyna-robotics/dyna_robot_description/blob/afa61685f434a9a2a61e255711788bcfe2f42f92/dyna_taku/LICENSE) · [Distributed license](../../research/part-2/assets/LICENSE-Dyna.txt)
