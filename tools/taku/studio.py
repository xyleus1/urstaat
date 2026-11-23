"""Bake the photographic softboxes into the CubeUV atlas sampled by Three.js r182."""
from pathlib import Path
import numpy as np
from PIL import Image


def softbox(u, v, cx, cy, rx, ry):
    x = np.abs((u - cx + .5) % 1 - .5) / rx
    y = np.abs(v - cy) / ry
    return np.exp(-np.minimum(3, x) ** 12 - np.minimum(3, y) ** 12)


def studio(directions):
    x, y, z = np.moveaxis(directions, -1, 0)
    u = np.arctan2(z, x) / (2 * np.pi) + .5
    v = np.arcsin(np.clip(y, -1, 1)) / np.pi + .5
    key = softbox(u, v, .39, .72, .12, .15)
    strip = softbox(u, v, .70, .60, .026, .23)
    rim = softbox(u, v, .93, .64, .052, .16)
    ambient = .015 + .055 * v + .1 * v ** 3
    return (ambient[..., None] + key[..., None] * [4.8, 4.65, 4.35]
            + strip[..., None] * [2.6, 2.9, 3.2] + rim[..., None] * [4.4, 4.5, 4.8])


def directions(size, face):
    # The outer texels are the one-pixel gutter that bilinearCubeUV expects.
    x, y = np.meshgrid((np.arange(size) - .5) / (size - 2) * 2 - 1,
                       (np.arange(size) - .5) / (size - 2) * 2 - 1)
    one = np.ones_like(x)
    axes = [(one,y,x), (-x,one,-y), (-x,y,one), (-one,y,-x), (-x,-one,y), (x,y,-one)]
    direction = np.stack(axes[face], axis=-1).reshape(-1, 3)
    return direction / np.linalg.norm(direction, axis=1, keepdims=True)


def prefilter(normal, roughness):
    if roughness == 0:
        return studio(normal)
    # Hammersley samples of the GGX half-vector distribution, with V = N.
    count = 256
    sample = np.arange(count)
    theta = 2 * np.pi * (sample + .5) / count
    xi = np.array([int(f'{i:08b}'[::-1], 2) + .5 for i in sample]) / count
    cos_h = np.sqrt((1 - xi) / (1 + (roughness ** 4 - 1) * xi))
    sin_h = np.sqrt(1 - cos_h ** 2)
    weight = np.maximum(0, 2 * cos_h ** 2 - 1)
    local = np.stack((2*cos_h*sin_h*np.cos(theta), 2*cos_h*sin_h*np.sin(theta), 2*cos_h**2-1), axis=1)
    result = []
    for normals in np.array_split(normal, max(1, (len(normal) + 127) // 128)):
        up = np.zeros_like(normals)
        up[:, 1] = np.abs(normals[:, 1]) < .98
        up[:, 0] = 1 - up[:, 1]
        tangent = np.cross(up, normals)
        tangent /= np.linalg.norm(tangent, axis=1, keepdims=True)
        frame = np.stack((tangent, np.cross(normals, tangent), normals), axis=1)
        samples = np.einsum('si,nij->nsj', local, frame)
        result.append((studio(samples) * weight[None, :, None]).sum(axis=1) / weight.sum())
    return np.concatenate(result)


def main():
    edge = 64
    atlas = np.zeros((4 * edge, 3 * max(7*16, edge), 3))
    # Inverse of Three's roughnessToMip(), including its extra 16px blur levels.
    for mip, roughness in [(6,0), (5,.15), (4,.21), (3,.305), (2,.4), (1,.5333), (0,.6667), (-1,.8), (-2,1)]:
        size = 2 ** max(4, mip)
        for face in range(6):
            x = size * (face % 3) + max(4 - mip, 0) * 48
            y = size * (face // 3) + 4 * (edge - size)
            atlas[y:y+size, x:x+size] = prefilter(directions(size, face), roughness).reshape(size,size,3)
    linear = np.clip(atlas / 6, 0, 1)
    srgb = np.where(linear <= .0031308, 12.92 * linear, 1.055 * linear ** (1/2.4) - .055)
    output = Path(__file__).resolve().parents[2] / 'research/part-2/assets/taku-studio.png'
    Image.fromarray(np.rint(255 * srgb[::-1]).astype('uint8')).save(output, optimize=True)
    print(f'{output.name}: {output.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
