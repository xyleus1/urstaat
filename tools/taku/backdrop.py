"""Bake dotted surface sections from Taku's MJCF visual meshes. Requires NumPy and Pillow.

Usage: python tools/taku/backdrop.py PATH/TO/dyna_taku
Source: dyna-robotics/dyna_robot_description, afa61685f434a9a2a61e255711788bcfe2f42f92.
Coordinates are stored as signed bytes on a square canvas (Y up), alongside
one packed byte for the physical depth plane and intensity of each point.
"""

import argparse
from pathlib import Path
import struct
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def read_obj(path):
    vertices, faces = [], []
    for line in path.read_text().splitlines():
        if line.startswith("v "):
            vertices.append([float(v) for v in line.split()[1:4]])
        elif line.startswith("f "):
            indices = [int(v.split("/")[0]) - 1 for v in line.split()[1:]]
            faces.extend((indices[0], indices[i], indices[i + 1]) for i in range(1, len(indices) - 1))
    return np.array(vertices)[np.array(faces)]


def read_visuals(source):
    xml = ET.parse(source / "taku.xml")
    mesh_files = {m.get("name"): source / "assets" / m.get("file") for m in xml.findall("./asset/mesh")}
    visuals = {}

    def visit(body, offset):
        name = body.get("name")
        offset = offset + np.fromstring(body.get("pos", "0 0 0"), sep=" ")
        if name.startswith("left_gripper_"):
            if name.endswith("front_link"):
                offset[1] -= 0.025
            elif name.endswith("rear_link"):
                offset[1] += 0.025
        for geom in body.findall("geom[@class='visual']"):
            if name in SELECTED:
                # The selected source links and visual geoms have identity orientation.
                assert body.get("quat") is None and geom.get("quat") is None and geom.get("pos") is None
                triangles = read_obj(mesh_files[geom.get("mesh")]) + offset
                visuals.setdefault(name, []).append((triangles, geom.get("material")))
        for child in body.findall("body"):
            visit(child, offset)

    visit(xml.find("./worldbody/body"), np.zeros(3))
    return visuals


HEAD = ("head_roll_link",)
CLAW = ("left_wrist_roll_link", "left_gripper_front_link", "left_gripper_rear_link")
WAIST = ("folding_lower_joint_link", "folding_to_waist_link", "torso_waist_pitch_link")
SELECTED = set(HEAD + CLAW + WAIST)


def sample_contours(visuals, parts, azimuth, elevation, tilt):
    meshes = [mesh for name in parts for mesh in visuals[name]]
    triangles = np.concatenate([mesh for mesh, _ in meshes])
    dark = np.concatenate([np.full(len(mesh), material == "photo_black") for mesh, material in meshes])
    yaw, pitch, roll = np.radians([azimuth, elevation, tilt])
    # Camera basis in the original Z-up MJCF frame. Intersect physical,
    # horizontal planes, then keep the camera-facing envelope of each section.
    right = np.array([-np.sin(yaw), np.cos(yaw), 0])
    front = np.array([np.cos(yaw), np.sin(yaw), 0])
    triangles -= (triangles.min(axis=(0, 1)) + triangles.max(axis=(0, 1))) / 2
    projected = np.stack([triangles @ right, triangles @ front, triangles[:, :, 2]], axis=2)
    lo, hi = projected.min(axis=(0, 1)), projected.max(axis=(0, 1))
    width, _, height = hi - lo
    points = []
    rows = 42
    for row in range(rows):
        z = lo[2] + (row + 0.5) * height / rows
        cuts = (projected[:, :, 2].min(axis=1) < z) & (projected[:, :, 2].max(axis=1) >= z)
        adjacent = projected[cuts]
        if not len(adjacent):
            continue
        segments = np.empty((len(adjacent), 2, 2))
        written = np.zeros(len(adjacent), dtype=int)
        for i in range(3):
            a, b = adjacent[:, i], adjacent[:, (i + 1) % 3]
            hit = (a[:, 2] < z) != (b[:, 2] < z)
            t = (z - a[hit, 2]) / (b[hit, 2] - a[hit, 2])
            segments[hit, written[hit]] = a[hit, :2] + t[:, None] * (b[hit, :2] - a[hit, :2])
            written[hit] += 1
        start, end = segments[:, 0], segments[:, 1]
        # The stagger avoids a rectilinear grid on broad, flat shells.
        count = 83
        for column in range(count):
            x = lo[0] + width * (column + (0.75 if row % 2 else 0.25)) / count
            hit = (start[:, 0] < x) != (end[:, 0] < x)
            if not hit.any():
                continue
            t = (x - start[hit, 0]) / (end[hit, 0] - start[hit, 0])
            depths = start[hit, 1] + t * (end[hit, 1] - start[hit, 1])
            closest = depths.argmax()
            if parts == HEAD and dark[cuts][hit][closest]:
                continue  # The two dark sensor apertures cut through the halftone.
            depth = depths[closest]
            y = z * np.cos(pitch) - depth * np.sin(pitch)
            silhouette = (depth - lo[1]) / (hi[1] - lo[1])
            period = (row // 3 + column // 19) % 5
            strength = int(np.clip(12 + 15 * silhouette + 3 * np.cos(row * 0.27), 5, 31))
            points.append((x * np.cos(roll) - y * np.sin(roll), y * np.cos(roll) + x * np.sin(roll), period, strength))
    # Sample the CAD boundary separately so the outline and sensor apertures
    # survive thumbnail downsampling. Painter's order preserves the black
    # sensors visible through the surrounding white face shell.
    x = projected[:, :, 0]
    y = projected[:, :, 2] * np.cos(pitch) - projected[:, :, 1] * np.sin(pitch)
    screen = np.stack((x * np.cos(roll) - y * np.sin(roll), y * np.cos(roll) + x * np.sin(roll)), axis=2)
    flat = screen.reshape(-1, 2)
    center = (flat.min(axis=0) + flat.max(axis=0)) / 2
    scale = 248 / np.ptp(flat, axis=0).max()
    canvas = Image.new("L", (512, 512))
    draw = ImageDraw.Draw(canvas)
    pixels = np.rint((screen - center) * (2 * scale) + 256).astype(int)
    camera_depth = projected[:, :, 1] * np.cos(pitch) + projected[:, :, 2] * np.sin(pitch)
    for face in camera_depth.mean(axis=1).argsort():
        draw.polygon(pixels[face].reshape(-1).tolist(), fill=0 if parts == HEAD and dark[face] else 255)
    outline = np.asarray(canvas) > np.asarray(canvas.filter(ImageFilter.MinFilter(3)))
    ys, xs = np.nonzero(outline)
    quantized = np.rint((np.array([p[:2] for p in points]) - center) * scale).astype(int)
    records = [(x, y, p[2] * 32 + p[3]) for (x, y), p in zip(quantized, points)]
    # Walk the exact boundary with a reproducible spacing between pinpoints.
    nearby = np.zeros((512, 512), dtype=bool)
    for j in np.random.default_rng(37).permutation(len(xs)):
        px, py = xs[j], ys[j]
        if nearby[py, px]:
            continue
        nearby[max(0, py - 7):py + 8, max(0, px - 7):px + 8] = True
        plane = 5 + (py // 31 + px // 65) % 3
        records.append((round((px - 256) / 2), round((py - 256) / 2), plane * 32 + 31))
    return b"".join(struct.pack("<bbB", x, y, style) for x, y, style in records)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    args = parser.parse_args()
    visuals = read_visuals(args.source)
    output = Path(__file__).resolve().parents[2] / "research/part-2/assets/taku-dots.bin"
    shapes = [sample_contours(visuals, *spec) for spec in [
        (HEAD, -34, 25, 8), (CLAW, 16, 21, -27), (WAIST, -76, 14, 12),
    ]]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(struct.pack("<4s3H", b"TKD1", *(len(s) // 3 for s in shapes)) + b"".join(shapes))
    print(f"{output.name}: {[len(s) // 3 for s in shapes]} points / {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
