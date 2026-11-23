"""Pack Taku's camera-motion LOD into one world-space Y-up vertex/index stream."""
import argparse
import json
from pathlib import Path
import shutil
import struct
import subprocess
import tempfile

import numpy as np


MATERIALS = (
    "satin porcelain shell", "graphite", "bead-blasted alloy", "elastomer", "smoke optical glass",
    "optical surround", "satin joint cap", "DynaClaw grip surface", "chest print",
)
VERTEX = np.dtype([("position", "<u2", 3), ("normal", "i1", 2), ("material", "u1"), ("padding", "u1", 3)])
TYPES = {5120: "i1", 5121: "u1", 5122: "<i2", 5123: "<u2", 5125: "<u4", 5126: "<f4"}


def local_matrix(node):
    if "matrix" in node:
        return np.asarray(node["matrix"]).reshape(4, 4).T
    x, y, z, w = node.get("rotation", [0, 0, 0, 1])
    result = np.eye(4)
    result[:3, :3] = np.array([
        [1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
        [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
        [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)],
    ]) @ np.diag(node.get("scale", [1, 1, 1]))
    result[:3, 3] = node.get("translation", [0, 0, 0])
    return result


def encode_normals(normals):
    octa = normals / np.abs(normals).sum(axis=1, keepdims=True)
    xy = octa[:, :2].copy()
    lower = octa[:, 2] < 0
    xy[lower] = (1 - np.abs(xy[lower, ::-1])) * np.where(xy[lower] >= 0, 1, -1)
    return np.rint(xy * 127).astype(np.int8)


def pack(simplified, output):
    data = simplified.read_bytes()
    if data[:4] != b"glTF" or data[16:20] != b"JSON":
        raise ValueError("Expected a binary glTF with a JSON chunk")
    length, = struct.unpack_from("<I", data, 12)
    doc = json.loads(data[20:20+length])
    if data[24+length:28+length] != b"BIN\0":
        raise ValueError("Expected one embedded geometry buffer")
    binary = memoryview(data)[28+length:]

    def accessor(index):
        a = doc["accessors"][index]
        v = doc["bufferViews"][a["bufferView"]]
        if v["buffer"] != 0 or a.get("sparse") or a.get("normalized"):
            raise ValueError("Generate the intermediate with gltfpack -noq, without compression")
        dtype = np.dtype(TYPES[a["componentType"]])
        width = {"SCALAR": 1, "VEC3": 3}[a["type"]]
        offset = v.get("byteOffset", 0) + a.get("byteOffset", 0)
        return np.ndarray((a["count"], width), dtype, binary, offset,
                          (v.get("byteStride", width*dtype.itemsize), dtype.itemsize))

    positions, normals, materials, indices = [], [], [], []
    vertex_count = 0
    def visit(index, parent):
        nonlocal vertex_count
        node = doc["nodes"][index]
        world = parent @ local_matrix(node)
        linear = world[:3, :3]
        if "mesh" in node:
            for primitive in doc["meshes"][node["mesh"]]["primitives"]:
                m = doc["materials"][primitive["material"]]
                slot = MATERIALS.index(m["name"].split(" · ")[-1])
                if slot == 8:
                    # The texture is lettering over an existing shell; its untextured duplicate would flicker.
                    continue
                factor = m.get("pbrMetallicRoughness", {}).get("baseColorFactor", [1, 1, 1, 1])
                if len(factor) != 4 or not np.isfinite(factor).all():
                    raise ValueError(f"Invalid base color on {m['name']}")
                if primitive.get("mode", 4) != 4:
                    raise ValueError("Motion geometry must consist of indexed triangles")
                attrs = primitive["attributes"]
                p = accessor(attrs["POSITION"]) @ linear.T + world[:3, 3]
                n = accessor(attrs["NORMAL"]) @ np.linalg.inv(linear)
                norm = np.linalg.norm(n, axis=1, keepdims=True)
                if not (np.isfinite(p).all() and np.isfinite(norm).all() and (norm > 1e-7).all()):
                    raise ValueError("Invalid transformed position or normal")
                n /= norm
                tri = accessor(primitive["indices"]).reshape(-1, 3).astype(np.int64)
                if tri.max() >= len(p):
                    raise ValueError("Triangle references a missing vertex")
                if np.linalg.det(linear) < 0:
                    tri = tri[:, [0, 2, 1]]
                positions.append(p)
                normals.append(n)
                materials.append(np.full(len(p), slot, dtype="u1"))
                indices.append(tri + vertex_count)
                vertex_count += len(p)
        for child in node.get("children", []):
            visit(child, world)

    for index in doc["scenes"][doc.get("scene", 0)]["nodes"]:
        visit(index, np.eye(4))
    if not 0 < vertex_count < 65536:
        raise ValueError(f"Motion LOD needs 1 to 65535 vertices, got {vertex_count}")
    p, n, slots, tri = map(np.concatenate, (positions, normals, materials, indices))
    low, high = p.min(axis=0), p.max(axis=0)
    v = np.zeros(vertex_count, dtype=VERTEX)
    v["position"] = np.rint((p - low) / (high - low) * 65535)
    v["normal"] = encode_normals(n)
    v["material"] = slots
    face_normal = np.cross(p[tri[:, 1]]-p[tri[:, 0]], p[tri[:, 2]]-p[tri[:, 0]])
    signed = np.einsum("ij,ij->i", face_normal, n[tri].mean(axis=1))
    areas = np.linalg.norm(face_normal, axis=1)
    aligned = areas[signed >= 0].sum() / areas.sum()
    if aligned < .97:
        raise ValueError(f"Winding and smooth normals disagree on {1-aligned:.1%} of triangle area")
    header = struct.pack("<4sII6f", b"TKM1", vertex_count, tri.size, *low, *high)
    payload = header + v.tobytes() + tri.astype("<u2").tobytes()
    output.write_bytes(payload)
    print(f"{output.name}: {len(payload):,} bytes, {vertex_count:,} vertices, {len(tri):,} triangles, "
          f"{aligned:.3%} of area agrees with normals; bounds {low.round(4)} to {high.round(4)}")


def build_motion(source, output):
    with tempfile.TemporaryDirectory(dir=source.parent) as temp:
        intermediate = Path(temp) / "motion.glb"
        subprocess.run([shutil.which("npm.cmd") or "npm", "exec", "--yes", "--package=gltfpack@1.3.0",
                        "--", "gltfpack", "-i", str(source), "-o", str(intermediate), "-si", "0.015",
                        "-se", "0.012", "-sp", "-noq", "-km"], check=True)
        pack(intermediate, output)


if __name__ == "__main__":
    arg = argparse.ArgumentParser(description=__doc__)
    arg.add_argument("source", type=Path)
    arg.add_argument("output", type=Path)
    arg.add_argument("--simplified", action="store_true", help="Source is already the uncompressed reduced GLB")
    opt = arg.parse_args()
    (pack if opt.simplified else build_motion)(opt.source.resolve(), opt.output.resolve())
