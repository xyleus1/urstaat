"""Bake the viewer's GGX studio into finish captures for software WebGL."""
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
LAMP = [([2.3, 4.5, -2.5], [2.16, 2.04, 1.88]), ([1.7, .45, 2.1], [.32, .38, .45]),
        ([-2.1, 1.8, 1.4], [2.05, 2.3, 2.6])]


def linear(v):
    v = np.asarray(v, dtype=float)
    return np.where(v <= .04045, v/12.92, ((v+.055)/1.055)**2.4)


def norm(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1.e-8)


def dot(a, b):
    return np.maximum(np.sum(a*b, axis=-1, keepdims=True), 0.)


def display(rgb):
    # Exact ACES matrix and fit from Three r182 with the viewer's .99 exposure.
    rgb = (.99/.6)*rgb @ np.array([[.59719,.07600,.02840],[.35458,.90834,.13383],[.04823,.01566,.83777]])
    rgb = (rgb*(rgb+.0245786)-.000090537)/(rgb*(.983729*rgb+.432951)+.238081)
    rgb = np.clip(rgb @ np.array([[1.60475,-.10208,-.00327],[-.53108,1.10813,-.07276],
                                  [-.07367,-.00605,1.07602]]), 0., 1.)
    return np.where(rgb <= .0031308, 12.92*rgb, 1.055*rgb**(1/2.4)-.055)


def read_finishes():
    raw = (ASSETS/"taku-desktop.glb").read_bytes()
    n = struct.unpack_from("<I", raw, 12)[0]
    doc = json.loads(raw[20:20+n])
    binary = raw[28+n:]
    by_name = {m["name"].split(" · ")[-1]:m for m in doc["materials"]}
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
        out.append((paint,p.get("roughnessFactor",1),p.get("metallicFactor",1),
                    coat.get("clearcoatFactor",0),coat.get("clearcoatRoughnessFactor",.28)))
    for color, metal, rough in [(0x768185,.72,.34),(0xa8b0af,.72,.25),(0x30393b,.16,.57),(0x495153,.54,.36)]:
        out.append((linear(np.array([(color>>16)&255,(color>>8)&255,color&255])/255),rough,metal,0,.28))
    return out


def reflection(studio, d, rough):
    # Inverse of the CubeUV lookup used by the hardware renderer.
    if rough >= .8: mip = (1-rough)*5-2
    elif rough >= .4: mip = (.8-rough)*7.5-1
    elif rough >= .305: mip = (.4-rough)/.095+2
    elif rough >= .21: mip = (.305-rough)/.095+3
    else: mip = -2*np.log2(1.16*rough)
    mip = np.clip(mip,-2,6)
    x,y,z = np.moveaxis(d,-1,0)
    axis = np.argmax(np.abs(d),axis=-1)
    face = np.choose(axis,[np.where(x>0,0,3),np.where(y>0,1,4),np.where(z>0,2,5)])
    major = np.max(abs(d),axis=-1)
    u = .5+.5*np.choose(face,[z,-x,-x,-z,-x,x])/major
    v = .5+.5*np.choose(face,[y,-z,y,y,z,y])/major

    def level(k):
        size=2**max(4,k)
        a = u*(size-2)+.5+(face%3)*size+max(4-k,0)*48
        b = v*(size-2)+.5+(face//3)*size+4*(64-size)
        i=a.astype(int); j=b.astype(int); ax=(a-i)[...,None];by=(b-j)[...,None]
        return ((1-by)*((1-ax)*studio[j,i]+ax*studio[j,i+1]) +
                by*((1-ax)*studio[j+1,i]+ax*studio[j+1,i+1]))
    lo=int(np.floor(mip)); f=mip-lo
    return level(lo)*(1-f)+level(min(6,lo+1))*f


def capture(studio, finish, normal, view, reflected):
    p,r,m,coat,cr=finish
    r=np.clip(r,.11,1); cr=np.clip(cr,.12,1)
    a=max(r**4,.00015); ca=max(cr**4,.0002)
    nv=np.maximum(dot(normal,view),.002)
    f0=.04*(1-m)+p*m
    rgb=np.zeros_like(normal)
    for pos,power in LAMP:
        light=norm(np.array(pos)); half=norm(light+view)
        nl=dot(normal,light); nh=dot(normal,half); vh=dot(view,half)
        f=f0+(1-f0)*(1-vh)**5; cf=coat*(.04+.96*(1-vh)**5)
        vis=.5/np.maximum(nl*np.sqrt(nv*nv*(1-a)+a)+nv*np.sqrt(nl*nl*(1-a)+a),.004)
        d=a/np.maximum(np.pi*(nh*nh*(a-1)+1)**2,.000015)
        cd=ca/np.maximum(np.pi*(nh*nh*(ca-1)+1)**2,.000015)
        rgb += np.array(power)*nl*((p*(1-m)*(1-f)*.31831+f*d*vis)*(1-cf)+cf*cd*vis)
    hemi=.5+.5*normal[...,1:2]
    rgb += ((1-hemi)*[.055,.060,.062]+hemi*[.23,.26,.29])*p*(1-m)
    env_f=f0+(1-f0)*(1-nv)**5; cf=coat*(.04+.96*(1-nv)**5)
    rgb += .78*reflection(studio,reflected,r)*env_f*(1-.42*r)*(1-cf)
    if coat: rgb += .78*reflection(studio,reflected,cr)*cf
    return np.rint(255*display(rgb)).astype("uint8")


def main():
    finishes=read_finishes()
    studio=linear(np.asarray(Image.open(ASSETS/"taku-studio.png").convert("RGB"))[::-1]/255)*6
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
                result[row*SIZE:(row+1)*SIZE,col*SIZE:(col+1)*SIZE]=capture(studio,finish,normal,view,reflected)
    output=ASSETS/"taku-finishes.webp"
    Image.fromarray(result).save(output,quality=96,method=4)
    print(f"{output.name}: {output.stat().st_size:,} bytes, {result.shape[1]} × {result.shape[0]}")


if __name__=="__main__":
    main()
