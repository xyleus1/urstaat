"""Bake the main robot's exploded-study lighting into software material captures."""
import io
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image


ASSETS = Path(__file__).resolve().parents[2] / "research/part-2/assets"
SIZE, COLS, YAWS = 80, 16, 8
PITCH = [-55, 0, 55]
NAMES = ["satin porcelain shell", "graphite", "bead-blasted alloy", "elastomer", "smoke optical glass",
         "optical surround", "satin joint cap", "DynaClaw grip surface", "chest print"]
def linear(v):
    v = np.asarray(v, dtype=float)
    return np.where(v <= .04045, v/12.92, ((v+.055)/1.055)**2.4)


def norm(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1.e-8)


def dot(a, b):
    return np.maximum(np.sum(a*b, axis=-1, keepdims=True), 0.)


def read_finishes():
    raw = (ASSETS/"taku-desktop.glb").read_bytes()
    n = struct.unpack_from("<I", raw, 12)[0]
    doc = json.loads(raw[20:20+n])
    binary = raw[28+n:]
    by_name = {m["name"].split(" · ")[-1]:m for m in doc["materials"]}
    overrides=json.loads((ASSETS.parents[2]/"hero/taku-finishes.json").read_text())
    out = []
    for name in NAMES:
        source = by_name[name]
        p = source.get("pbrMetallicRoughness", {})
        coat = source.get("extensions", {}).get("KHR_materials_clearcoat", {})
        paint = np.array(p.get("baseColorFactor", [1,1,1,1])[:3])
        if name == "chest print":
            image = doc["images"][doc["textures"][p["baseColorTexture"]["index"]]["source"]]
            view = doc["bufferViews"][image["bufferView"]]
            start = view.get("byteOffset",0)
            pixels = np.asarray(Image.open(io.BytesIO(binary[start:start+view["byteLength"]])).convert("RGB").resize((512,512)))
            pixels = linear(pixels/255)
            chroma = pixels[:,:,0]-pixels[:,:,2]
            paint = paint*pixels[chroma > .85*chroma.max()].mean(axis=0)
        finish = overrides.get(name,{})
        paint *= finish.get("tint",1)
        out.append((paint,finish.get("roughness",p.get("roughnessFactor",1)),finish.get("metalness",p.get("metallicFactor",1)),
                    coat.get("clearcoatFactor",0),coat.get("clearcoatRoughnessFactor",.28)))
    for color, metal, rough in [(0x768185,.72,.34),(0xa8b0af,.72,.25),(0x30393b,.16,.57),(0x495153,.54,.36)]:
        out.append((linear(np.array([(color>>16)&255,(color>>8)&255,color&255])/255),rough,metal,0,.28))
    return out


def softbox(reflected, center, extents, rough):
    center = norm(np.array(center))
    x = norm(np.cross(center, [0, 0, 1]))
    y = np.cross(x, center)
    facing = np.sum(reflected * center, axis=-1)
    q = np.abs(np.stack((reflected @ x, reflected @ y), axis=-1)) / np.maximum(facing[..., None], 1e-8) - extents
    edge = np.max(q, axis=-1)
    t = np.clip((edge + .08 + rough*.65) / (.16 + rough*1.45), 0, 1)
    return ((1-t*t*(3-2*t))*(facing>0))[..., None]


def strips(reflected, rough):
    return (.044+.09*(.5+.5*reflected[..., 2:3])
            +2.05*softbox(reflected, [-.28,-.70,.89], [.73,.29], rough)
            +1.56*softbox(reflected, [.87,.46,.41], [.195,.81], rough)
            +1.12*softbox(reflected, [-.90,.31,-.16], [.16,.61], rough*.72))


def capture(finish, normal, view, reflected):
    paint, rough, metal, coat, coat_rough = finish
    def studio(vec):
        return np.stack((vec[...,2], -vec[...,0], vec[...,1]), axis=-1)
    n, v, r = studio(normal), studio(view), studio(reflected)
    sky = .062+.16*(.5+.5*n[...,2:3])+.04*np.maximum(0, -n[...,0:1])
    key = dot(n,norm(np.array([-.62,-.5,.76])))
    fill = dot(n,norm(np.array([.9,.2,.3])))
    rim = (1-dot(n,v))**3
    diffuse = paint*(sky+1.08*key*[1.025,1.,.965]+.16*fill*[.95,1.,1.07])*(1-.78*metal)
    spec = (1-metal)*.045+paint*metal
    radiance = diffuse+spec*strips(r,rough)*(.92-.35*rough)+.046*rim
    if coat:
        radiance += coat*(.027+.12*rim)*strips(r,coat_rough)
    t=np.clip(radiance/.13,0,1)
    radiance *= .53+.47*t*t*(3-2*t)
    color = (1.24*radiance/(radiance+.72))**(1/2.2)
    return np.rint(255*np.clip(color,0,1)).astype('uint8')


def main():
    finishes=read_finishes()
    tile_count=len(finishes)*len(PITCH)*YAWS
    result=np.zeros((SIZE*((tile_count+COLS-1)//COLS),SIZE*COLS,3),dtype="uint8")
    # Stereographic parameterization retains resolution at the outline of a
    # sphere. Duplicate the edge outside the disk for safe bilinear filtering.
    q=(np.arange(SIZE)-1.5)/(SIZE-4)*2-1
    x,y=np.meshgrid(q,q); length=np.maximum(1,np.sqrt(x*x+y*y));x=x/length;y=y/length
    inv=1/(1+x*x+y*y)
    nx,ny,nz=2*x*inv,2*y*inv,(1-x*x-y*y)*inv
    for j,angle in enumerate(np.radians(PITCH)):
        for i in range(YAWS):
            az=i*2*np.pi/YAWS
            view=np.array([np.sin(az)*np.cos(angle),np.sin(angle),np.cos(az)*np.cos(angle)])
            right=np.array([np.cos(az),0,-np.sin(az)]);up=np.cross(view,right)
            normal=nx[...,None]*right+ny[...,None]*up+nz[...,None]*view
            reflected=2*dot(normal,view)*normal-view
            for material,finish in enumerate(finishes):
                tile=material*YAWS*len(PITCH)+j*YAWS+i
                row,col=divmod(tile,COLS)
                result[row*SIZE:(row+1)*SIZE,col*SIZE:(col+1)*SIZE]=capture(finish,normal,view,reflected)
    output=ASSETS/"taku-finishes.webp"
    Image.fromarray(result).save(output,quality=96,method=4)
    print(f"{output.name}: {output.stat().st_size:,} bytes, {result.shape[1]} × {result.shape[0]}")


if __name__=="__main__":
    main()
