var M0=Object.defineProperty;var w0=(i,e)=>()=>(i&&(e=i(i=0)),e);var S0=(i,e)=>{for(var t in e)M0(i,t,{get:e[t],enumerable:!0})};var rg={};S0(rg,{default:()=>w1});var w1,sg=w0(()=>{w1=`"use strict";(()=>{var Oe=self,Ee={width:0,height:0,left:0,top:0,hidden:!1,reducedMotion:!1,darkScheme:!1};for(let e of["HTMLElement","HTMLImageElement","HTMLVideoElement","HTMLCanvasElement","Element"])typeof Oe[e]!="function"&&(Oe[e]=class{});var Hn=e=>({addEventListener(t,n){e.has(t)||e.set(t,new Set),e.get(t).add(n)},removeEventListener(t,n){e.get(t)?.delete(n)}}),Wr=(e,t,n)=>{for(let a of[...e.get(t)??[]])a(n)},uo=new Map,Xn={...Hn(uo),load:()=>Promise.resolve([]),check:()=>!0,ready:Promise.resolve(),announce(e){Wr(uo,"loadingdone",Object.assign(new Event("loadingdone"),{fontfaces:[{family:e}]}))}},zn=new Map;Oe.document={...Hn(zn),get hidden(){return Ee.hidden},fonts:Xn,documentElement:null,body:null,createElement(e){if(e==="canvas")return new OffscreenCanvas(1,1);throw new Error(\`A glyph field in a worker cannot create a <\${e}>.\`)}};var qn=e=>{Ee.hidden=e,Wr(zn,"visibilitychange",new Event("visibilitychange"))};Oe.window=self;typeof Oe.devicePixelRatio!="number"&&(Oe.devicePixelRatio=1);var Nn=new Map,fo=e=>/reduced-motion/.test(e)?Ee.reducedMotion:/color-scheme:\\s*dark/.test(e)?Ee.darkScheme:!1;Oe.matchMedia=e=>{let t=Nn.get(e);t||Nn.set(e,t={matches:fo(e),events:new Map});let n=t;return{media:e,get matches(){return n.matches},...Hn(n.events)}};var Vn=(e,t)=>{Ee.reducedMotion=e,Ee.darkScheme=t;for(let[n,a]of Nn){let i=fo(n);i!==a.matches&&(a.matches=i,Wr(a.events,"change",Object.assign(new Event("change"),{matches:i,media:n})))}},Or=new Set;Oe.ResizeObserver=class{constructor(e){this.callback=e}observe(){Or.add(this.callback)}unobserve(){Or.delete(this.callback)}disconnect(){Or.delete(this.callback)}};var Br=new Set,jn=null,ho=!0;Oe.IntersectionObserver=class{constructor(e){this.callback=e}observe(e){jn=e,Br.add(this.callback),queueMicrotask(()=>this.callback([{target:e,isIntersecting:ho}]))}unobserve(){Br.delete(this.callback)}disconnect(){Br.delete(this.callback)}};var $n=(e,t,n,a)=>{let i=e!==Ee.width||t!==Ee.height;if(Object.assign(Ee,{width:e,height:t,left:n,top:a}),i)for(let l of[...Or])l([{target:jn}])},Kn=e=>{ho=e;for(let t of[...Br])t([{target:jn,isIntersecting:e}])},mo=(e,t)=>{if(e==="pointerleave"){Wr(zn,"pointerleave",new Event("pointerleave"));return}let n=Object.assign(new Event(e),t,{composedPath:()=>[]});Oe.dispatchEvent(n)};typeof Oe.requestAnimationFrame!="function"&&(Oe.requestAnimationFrame=e=>setTimeout(()=>e(performance.now()),16),Oe.cancelAnimationFrame=e=>clearTimeout(e));function po(e){let t=e;return Object.defineProperties(t,{clientWidth:{get:()=>Ee.width,configurable:!0},clientHeight:{get:()=>Ee.height,configurable:!0},ownerDocument:{value:void 0,configurable:!0}}),t.getBoundingClientRect=()=>({left:Ee.left,top:Ee.top,x:Ee.left,y:Ee.top,width:Ee.width,height:Ee.height,right:Ee.left+Ee.width,bottom:Ee.top+Ee.height}),t.setAttribute=()=>{},t.removeAttribute=()=>{},t.dataset={},t.style={},e}var Yn=e=>Object.keys(e.params);function go(e){if(!e.length)return null;let t=e.map((l,c)=>{let o=Yn(l);return\`struct Fx\${c}Params{\${o.length?o.map(f=>\`float \${f};\`).join(""):"float unused;"}};\`}).join(\`
\`),n=(l,c)=>{let o=Yn(l),f=o.length?o.map((d,m)=>\`uFx[\${c*2+(m>>2)}].\${"xyzw"[m&3]}\`).join(","):"0.";return\`Fx\${c}Params params=Fx\${c}Params(\${f});\`},a={displace:["vec2 at=sampleAt;","sampleAt=at;"],shade:["vec3 color=rgb;vec3 ink=fxInk;float inkAmount=fxInkAmount;float glyph=fxGlyph;","fxInk=ink;fxInkAmount=inkAmount;fxGlyph=glyph;"]},i=l=>e.map((c,o)=>c[l]?\`{// effect "\${c.name}"
\${n(c,o)}\${a[l][0]}
\${c[l]}
\${a[l][1]}}\`:"").filter(Boolean).join(\`
\`);return{declarations:\`uniform vec4 uFx[8];
uniform vec4 uFxPointer;
uniform float uFxTime;
\${t}\`,displace:i("displace"),shade:i("shade")}}function bo(e,t=new Float32Array(32)){return t.fill(0),e.slice(0,4).forEach((n,a)=>{Yn(n).forEach((i,l)=>{t[a*8+l]=n.params[i]})}),t}var zi={none:3,flow:1,orb:2,drift:4,swell:5,caustics:6,contour:7,aurora:8,ripple:9,halo:10,interference:11,mesh:12,cascade:13,constellation:14},vo=e=>zi[e]??3,yo=\`#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}\`,Eo=e=>e?\`
const float VSCALE=6.;
vec4 decodeFluid(vec4 t){return vec4((t.xy*2.-1.)*VSCALE,t.z,t.w);}
vec4 encodeFluid(vec4 v){return vec4(clamp(v.xy/VSCALE*.5+.5,0.,1.),clamp(v.z,0.,1.),1.);}\`:\`
vec4 decodeFluid(vec4 t){return t;}
vec4 encodeFluid(vec4 v){return vec4(v.xyz,1.);}\`,Mo=e=>\`#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uPrevious;
uniform vec2 uSize;
uniform float uAspect, uDt, uDecay, uEnergyDecay, uRadius, uSplat;
uniform vec2 uFrom, uTo, uForce;
out vec4 outColor;
\${Eo(e)}
float segment(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.,1.);return length(pa-ba*h);}
void main(){
  vec2 uv=gl_FragCoord.xy/uSize;
  vec4 here=decodeFluid(texture(uPrevious,uv));
  vec4 state=decodeFluid(texture(uPrevious,uv-uDt*here.xy*vec2(1./uAspect,1.)));
  state.xy*=exp(-uDt*uDecay);
  state.z*=exp(-uDt*uEnergyDecay);
  if(uSplat>.5){
    vec2 scale=vec2(uAspect,1.);
    float d=segment(uv*scale,uFrom*scale,uTo*scale);
    float g=exp(-d*d/(uRadius*uRadius));
    state.xy+=uForce*g;
    state.z=min(1.,state.z+g*min(1.,length(uForce)*.5+.08));
  }
  float speed=length(state.xy);
  if(speed>5.)state.xy*=5./speed;
  outColor=encodeFluid(state);
}\`,qi=e=>\`#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uSource, uFluid;
uniform vec2 uResolution, uCell;
uniform float uCount, uBlend;
const float BAYER[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
uniform vec3 uRamp[6];
uniform float uRampCount;
// The gradient map: the tone run through the ramp's stops, evenly spaced, faintest first.
vec3 rampAt(float t){
  float x=clamp(t,0.,1.)*(uRampCount-1.);
  int i=int(min(floor(x),uRampCount-2.));
  vec3 a=uRamp[0],b=uRamp[1];
  for(int k=1;k<5;k++)if(k==i){a=uRamp[k];b=uRamp[k+1];}
  return mix(a,b,clamp(x-float(i),0.,1.));
}
uniform vec4 uSourceMap;
uniform int uScene;
uniform vec3 uInk, uHighlight;
uniform vec4 uBackground;
uniform float uBrightness, uContrast, uGamma, uInvert, uVignette, uSourceColor;
uniform float uRefraction, uGlow, uTime, uDrift, uFluidOn, uLod, uSaturation, uBackdrop, uShade, uHighlightAuto, uFluidMode;
uniform vec2 uFluidTexel;
uniform int uHoverMode;
uniform vec3 uLight;
uniform vec3 uTrail[12];
uniform float uLightRadius, uLightGain, uClock, uFlicker, uTrailAmount;
uniform sampler2D uTrailMap, uScope;
uniform float uScopeMode;
uniform vec2 uLevels;
// A moving source's levels, measured on the GPU (field-measure.ts), when uLevelsFromMap is set.
uniform sampler2D uLevelMap;
uniform float uLevelsFromMap;
// Shape sampling: each cell read in 3 by 5 parts and matched to the glyphs' own ink in those parts (see GlyphFieldOptions.sample).
uniform float uShapeOn, uShapeLod, uShapeTone, uShapeWindow, uShapeGate;
uniform sampler2D uShapes;
uniform int uMark;
uniform float uScale, uClearFeather, uClearShape, uOrder, uClearPointer;
// Text order by rows: each word's first glyph index and length, and how many words there are (0 reads the charset as one stream).
uniform vec2 uWords[8];
uniform float uWordCount;
uniform vec4 uClear;
uniform vec4 uPulse[4];
uniform sampler2D uTapMap;
uniform float uTapOn;
uniform sampler2D uClearMap;
uniform float uClearMapOn, uClearBend;
uniform vec2 uClearTexel;
layout(location=0) out vec4 outInk;
layout(location=1) out vec4 outUnder;
// The cell's light for bloom: its ink weighted by its tone, empty where the cell is blank. Only kept when bloom is on.
layout(location=2) out vec4 outGlow;
\${Eo(e)}
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
vec3 generated(vec2 uv,float aspect){
  vec2 p=(uv-.5)*vec2(aspect,1.)*uScale;
  if(uScene==1){
    float t=uTime*.08;
    vec2 q=vec2(fbm(p*1.6+t),fbm(p*1.6-t+3.1));
    return vec3(smoothstep(.28,.86,fbm(p*1.8+q*1.6+vec2(t*.6,-t*.4))));
  }
  if(uScene==2){
    float r=.36,d=length(p),a=uTime*.25;
    vec3 l=normalize(vec3(cos(a)*.8,.55,sin(a)*.6+.6));
    if(d<r){
      vec3 n=normalize(vec3(p.x,-p.y,sqrt(r*r-d*d)));
      float diffuse=max(dot(n,l),0.),rim=pow(1.-n.z,2.5);
      float lon=atan(n.x,n.z)+uTime*.35,lat=asin(clamp(n.y,-1.,1.));
      float bands=.5+.25*sin(lat*14.)+.25*sin(lon*6.);
      return vec3(clamp(diffuse*.85+rim*.5+bands*.12,0.,1.));
    }
    return vec3(exp(-pow((d-r)*9.,2.))*.35);
  }
  if(uScene==4){
    // Drift: a few broad lobes that wander slowly. Built for halftone, where large soft shapes read best.
    float t=uTime*.045;
    vec2 q=p*1.15;
    vec2 w=vec2(fbm(q*.7+vec2(t,-t*.7)),fbm(q*.7+vec2(4.3-t*.8,t+1.7)));
    float n=fbm(q+w*1.3+vec2(t*.4,t*.25));
    return vec3(smoothstep(.36,.74,n));
  }
  if(uScene==5){
    // Swell: three crossing swells, the second bent by the first, so crests roll diagonally instead of pooling.
    float t=uTime;
    float s=sin((dot(p,vec2(.94,.33))/.95-t/9.)*6.2831853);
    float c=sin((dot(p,vec2(.6,-.8))/.58-t/13.)*6.2831853+s*.9);
    float k=sin((dot(p,vec2(-.29,.96))/.36+t/17.)*6.2831853);
    return vec3(smoothstep(.3,.9,.5+.5*(s*.5+c*.35+k*.15)));
  }
  // The kit's background scenes. Each starts a little way in, so a reduced-motion still is already composed.
  float t=uTime+40.,px=uCell.y/uResolution.y*uScale;
  if(uScene==6){
    // Caustics: light focused by a moving water surface. Two layers of warped sine waves drift against each other; each draws
    // smooth filaments along its zero line, about a character wide. Where they cross the light lifts a little, never to a blot.
    float tt=t*.12,a=0.,b=0.;
    for(int l=0;l<2;l++){
      float f=float(l),sc=5.4+f*2.4;
      vec2 q=(l==0?p:mat2(.8,-.6,.6,.8)*p)*sc;
      q+=vec2(sin(q.y*.45+tt*(1.+f*.3)),cos(q.x*.4-tt*(.8+f*.4)))*1.3;
      float v=sin(q.x+1.4*sin(q.y*.7+tt))+sin(q.y*1.1+1.2*sin(q.x*.8-tt*1.3))*.9;
      float wv=max(fwidth(v),1e-4);
      float line=(1.-smoothstep(.2,1.5,abs(v)/wv))*(l==0?.78:.62)+exp(-abs(v)/(wv*5.))*.16;
      if(l==0)a=line;else b=line;
    }
    float pulse=.85+.15*sin(tt*3.+p.x*1.7-p.y*1.1);
    float light=max(a,b)+.3*min(a,b);
    return vec3(clamp(light*light*pulse,0.,.78));
  }
  if(uScene==7){
    // Contour: a slow terrain read as survey lines about a character wide at any size; every fifth is an index line.
    float tt=t*.02;
    vec2 q=p*1.15+vec2(tt,-tt*.6);
    float h=noise(q)*.62+noise(q*2.07+3.1)*.27+noise(q*4.3-tt+7.)*.11;
    h+=.08*sin(tt*2.+p.x*.8);
    float k=h*13.,w=max(fwidth(k),1e-4),d=abs(fract(k+.5)-.5)/w;
    float major=mod(floor(k+.5),5.)<.5?1.:0.;
    return vec3((1.-smoothstep(.35,1.25-major*.25,d))*mix(.55,1.,major));
  }
  if(uScene==8){
    // Aurora: three curtains at different distances hang from the top. Far ones sit higher and dimmer; the nearest is tallest
    // and brightest. Each folds slowly and is brightest along its lower hem, fading upward. The rays are set per character
    // column, so the curtains read as vertical strokes at any stage size, from a small card to a phone.
    float tt=t*.05,a=0.,cw=uCell.x/uResolution.x;
    float col=floor(uv.x/cw+.5);
    for(int n=0;n<3;n++){
      float f=float(n),near=f/2.;
      float x=p.x*(1.3-near*.4)+f*3.7;
      float hem=-.28+near*.3+.16*sin(x*1.3+tt*(.9+f*.25)+f*2.)+.045*sin(x*3.4-tt*1.5+f);
      float d=hem-p.y;
      float body=d>0.?exp(-d/(.14+near*.26))*(.45+.55*exp(-d/.03)):exp(-d*d/.0002);
      float fold=.5+.5*sin(x*2.1+tt*.9+f*1.7+.7*sin(x*.8-tt*.6));
      float ray=mix(hash(vec2(col,f*7.1)),noise(vec2(col*.18+f*9.,tt*.7+f)),.55);
      float layer=clamp(body*(.1+.9*fold*fold)*(.2+.8*ray)*(.4+near*.6)*4.2,0.,1.);
      a=1.-(1.-a)*(1.-layer);
    }
    return vec3(smoothstep(.12,.9,a));
  }
  if(uScene==9){
    // Ripple: still water. Drops land here and there, each a few rings that widen and fade; the pointer drops its own.
    float tone=0.,g=.72;
    vec2 q=p/g,id=floor(q);
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
      vec2 c=id+vec2(i,j),h=vec2(hash(c),hash(c+7.3));
      float period=5.+h.x*5.,age=fract(t*.3/period*4.+h.y);
      vec2 at=(c+.2+.6*h)*g;
      float d=length(p-at),r=age*.62;
      float rings=max(0.,cos((d-r)*34.))*exp(-pow((d-r)/.11,2.));
      tone+=rings*pow(1.-age,1.8)*smoothstep(0.,.06,age)*(.7+.3*h.x);
    }
    return vec3(clamp(tone*1.25,0.,1.));
  }
  if(uScene==10){
    // Halo: a slow breathing corona that frames the content, its rays turning. The ring fits the stage: wide on a desktop
    // hero, tall on a phone, so the whole halo stays on screen; the middle stays empty for a headline.
    vec2 r=vec2(min(.46,aspect*.4),min(.34,.36/max(aspect,.01)*.5+.2));
    vec2 e=p/r;
    float d=length(e),a=atan(e.y,e.x),tt=t*.07,k=min(r.x,r.y);
    float breathe=1.+.04*sin(tt*3.1);
    float rays=.5+.5*noise(vec2(a*3.2+tt,tt*.5))*(.6+.4*noise(vec2(a*7.-tt*1.2,3.+tt*.4)));
    float s=(d-breathe)*k;
    float rim=exp(-pow(s/.03,2.));
    float corona=exp(-max(0.,s)/(.1+.08*rays))*smoothstep(-.04,.015,s)*rays*smoothstep(.36,.12,s);
    return vec3(clamp(rim*(.55+.45*rays)+corona*.85,0.,1.));
  }
  if(uScene==11){
    // Interference: two ring grids from slowly orbiting centres. Where they cross, broad moire bands open and close.
    float tt=t*.05;
    vec2 a=vec2(-.3+.12*sin(tt),.07*cos(tt*1.3)),b=vec2(.3+.1*cos(tt*.8),-.06*sin(tt*1.1));
    float f=6.2831853/max(px*4.6,.004);
    float m=cos(length(p-a)*f)+cos(length(p-b)*f);
    return vec3(smoothstep(.7,2.,m));
  }
  if(uScene==12){
    // Mesh: four soft lights on slow Lissajous paths, a gradient mesh written in characters.
    float tt=t*.07,m=0.;
    for(int n=0;n<4;n++){
      float f=float(n)*1.7;
      vec2 c=vec2(.66*sin(tt*(.7+f*.13)+f),.34*cos(tt*(.9-f*.07)+f*1.3));
      float s=.3+.07*sin(tt+f);
      m+=exp(-dot(p-c,p-c)/(s*s))*(.8-float(n)*.1);
    }
    return vec3(smoothstep(.06,1.1,m));
  }
  if(uScene==13){
    // Cascade: streaks fall in three depths. Far ones are frequent, faint, short and slow; near ones rare, long, bright and
    // quick. Each has a bright head and a tail that fades behind it, and a column can carry two streaks at once.
    float tone=0.,cw=uCell.x/uResolution.x,ch=uCell.y/uResolution.y;
    float col=floor(uv.x/cw+.5);
    for(int n=0;n<3;n++){
      float f=float(n);
      for(int k=0;k<2;k++){
        float seed=f*13.1+float(k)*41.7,h=hash(vec2(col,seed));
        if(h<1.-(.5-f*.15))continue;
        float speed=(.045+f*.07)*(.75+.5*hash(vec2(col,seed+2.)));
        float tail=.12+f*.16,y=fract(t*speed+hash(vec2(col,seed+5.)))*(1.+tail*2.)-tail;
        float d=y-uv.y;
        if(d<0.||d>tail)continue;
        float head=d<ch*1.2?1.:0.;
        tone=max(tone,max(head*(.55+f*.22),pow(1.-d/tail,1.7)*(.28+f*.3)));
      }
    }
    return vec3(clamp(tone,0.,1.));
  }
  if(uScene==14){
    // Constellation: points wander in their own cells; neighbours close enough are linked by fine lines. Each point is a
    // bright core in a soft halo, so it reads at card size as well as full width.
    float g=.23,tt=t*.18;
    vec2 q=p/g,id=floor(q);
    vec2 pts[9];
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
      vec2 c=id+vec2(i,j);
      float h=hash(c),k=hash(c+3.7);
      pts[(j+1)*3+i+1]=c+.5+.36*vec2(sin(tt*(.6+h)+h*6.28),cos(tt*(.5+k)+k*6.28));
    }
    float line=0.,star=0.,lw=max(px/g,.02);
    for(int n=0;n<9;n++){
      vec2 e=q-pts[n];
      float d2=dot(e,e),tw=.8+.2*sin(tt*3.+float(n)*1.7);
      star=max(star,max(exp(-d2/(lw*lw*1.6)),.38*exp(-d2/(lw*lw*7.)))*tw);
      for(int m=n+1;m<9;m++){
        vec2 a=pts[n],ba=pts[m]-a;
        float len=length(ba);
        if(len>1.35)continue;
        float hh=clamp(dot(q-a,ba)/dot(ba,ba),0.,1.);
        float d=length(q-a-ba*hh);
        line=max(line,(1.-smoothstep(lw*.3,lw*.75,d))*smoothstep(1.35,.6,len)*.72);
      }
    }
    return vec3(clamp(max(line,star),0.,1.));
  }
  return vec3(0.);
}
// The source's brightness to the field's tone: levels, contrast and brightness, gamma, invert.
float transfer(float tone){
  vec2 levels=uLevelsFromMap>.5?texelFetch(uLevelMap,ivec2(0),0).rg:uLevels;
  tone=clamp((tone-levels.x)/max(levels.y-levels.x,.01),0.,1.);
  tone=clamp((tone-.5)*uContrast+.5+uBrightness,0.,1.);
  tone=pow(tone,1./uGamma);
  return uInvert>.5?1.-tone:tone;
}
// Hover scope: 1 where the pointer response may act. The map holds the source's soft subject coverage in alpha.
float hoverScope(vec2 uv){
  if(uScopeMode<.5||uScene!=0)return 1.;
  vec2 s=uv*uSourceMap.xy+uSourceMap.zw;
  vec4 scope=texture(uScope,clamp(s,0.,1.));
  // Red set: a source with no subject to key (measured on the GPU), where every scope acts everywhere.
  if(scope.r>.5)return 1.;
  float c=(s.x<0.||s.y<0.||s.x>1.||s.y>1.)?0.:scope.a;
  return uScopeMode<1.5?c:1.-c;
}
void main(){
  vec2 cell=floor(gl_FragCoord.xy);
  vec2 uv=(cell+.5)*uCell/uResolution;
  float aspect=uResolution.x/uResolution.y;
  float hs=hoverScope(uv);
  vec4 fluid=vec4(0.);
  // lift: signed tone change. The solver's flow brightens one side of each eddy and opens the other into gaps.
  float lift=0.,wake=0.,bend=1.,swirl=0.,speed=0.;
  if(uFluidOn>.5){
    vec4 raw=texture(uFluid,vec2(uv.x,1.-uv.y));
    if(uFluidMode>.5){
      vec2 v=raw.xy*uFluidTexel*vec2(aspect,1.)*hs;
      fluid=vec4(v,0.,1.);
      swirl=clamp(dot(v,vec2(.4,.65))*uGlow*.32,-.65,.65);
      speed=clamp(length(v)*uGlow*.055,0.,.38);
      bend=.4;
    } else {
      fluid=decodeFluid(raw);
      fluid.xyz*=hs;
      wake=clamp(fluid.z*uGlow,0.,1.);
      lift=wake*.55;
    }
  }
  vec2 drift=uDrift*.006*vec2(sin(uv.y*5.3+uTime*.6),cos(uv.x*4.1-uTime*.5));
  vec2 sampleAt=uv-vec2(fluid.x/aspect,-fluid.y)*uRefraction*bend+drift;
  float keep=0.;
  if(uClearMapOn>0.){
    // Text-shaped clear map: quiet right behind the content, and the field leans away from its edges so it flows round them.
    keep=texture(uClearMap,uv).r;
    vec2 t=uClearTexel*1.5;
    vec2 g=vec2(texture(uClearMap,uv+vec2(t.x,0.)).r-texture(uClearMap,uv-vec2(t.x,0.)).r,texture(uClearMap,uv+vec2(0.,t.y)).r-texture(uClearMap,uv-vec2(0.,t.y)).r);
    sampleAt+=g*vec2(1./aspect,1.)*uClearBend;
  }
  float spot=0.;
  if(uHoverMode==4||uHoverMode==5){
    vec2 d=(uv-uLight.xy)*vec2(aspect,1.);
    float q2=dot(d,d)/(uLightRadius*uLightRadius*2.2);
    // Loupe: flat-topped zoom with a soft rim. Reveal: a soft spot in the source's colours.
    if(uHoverMode==4) sampleAt-=(uv-uLight.xy)*exp(-q2*q2)*.45*uLight.z*min(1.,uLightGain*1.6)*hs;
    else spot=exp(-q2*1.6)*uLight.z*min(1.,uLightGain*1.6)*hs;
  }
  vec3 rgb,glow=vec3(0.);
  float sub[15];float subMean=-1.,subLo=0.,subHi=0.;
  if(uScene==0){
    vec2 s=sampleAt*uSourceMap.xy+uSourceMap.zw;
    bool inside=!(s.x<0.||s.y<0.||s.x>1.||s.y>1.);
    rgb=inside?textureLod(uSource,s,uLod).rgb:vec3(0.);
    if(uShapeOn>.5){
      vec2 cu=uCell/uResolution;
      subMean=0.;subLo=1.;subHi=0.;
      for(int j=0;j<5;j++)for(int i=0;i<3;i++){
        vec2 o=(vec2((float(i)+.5)/3.,(float(j)+.5)/5.)-.5)*cu,ss=(sampleAt+o)*uSourceMap.xy+uSourceMap.zw;
        float v=(ss.x<0.||ss.y<0.||ss.x>1.||ss.y>1.)?transfer(0.):transfer(dot(textureLod(uSource,ss,uShapeLod).rgb,vec3(.2126,.7152,.0722)));
        sub[j*3+i]=v;subMean+=v;subLo=min(subLo,v);subHi=max(subHi,v);
      }
      subMean/=15.;
    }
    if(uBackdrop>0.){
      vec2 b=(uv-vec2(fluid.x/aspect,-fluid.y)*uRefraction*bend*.5)*uSourceMap.xy+uSourceMap.zw;
      glow=(b.x<0.||b.y<0.||b.x>1.||b.y>1.)?vec3(0.):textureLod(uSource,b,uLod+3.).rgb*uBackdrop;
    }
  } else rgb=generated(sampleAt,aspect);
  float tone=transfer(dot(rgb,vec3(.2126,.7152,.0722)));
  // Shape sampling takes its tone from its parts, so the character's ink matches the cell's.
  if(subMean>=0.)tone=subMean;
  float flick=0.,trailFold=0.;
  // Reveal: under the spot the characters take the source's own colour and a little more ink.
  if(spot>0.)lift=spot*.22;
  if(uHoverMode==2){
    // Lantern: a soft light and its fading tail lift the characters they pass. Nothing moves the image.
    vec2 ap=vec2(aspect,1.),d=(uv-uLight.xy)*ap;
    float r2=uLightRadius*uLightRadius,glowL=uLight.z*exp(-dot(d,d)/r2);
    for(int i=0;i<12;i++){vec2 e=(uv-uTrail[i].xy)*ap;glowL+=uTrail[i].z*exp(-dot(e,e)/(r2*.55));}
    glowL=min(glowL,1.)*hs;
    float grain=fract(sin(dot(cell,vec2(12.9898,78.233)))*43758.5453);
    lift=glowL*uLightGain*(.7+.6*grain);
    wake=glowL*.4;
    // A few letters at the light's rim step up the ramp and back, as if being retyped.
    flick=uFlicker*step(.9,fract(grain*13.7+floor(uClock*7.+grain*5.)*.37))*glowL*(1.-glowL)*4.;
  }
  if(uHoverMode==3){
    // Trail: the studio's ink field, as a 16-bit density. Sparse marks fill in, dense marks open up.
    vec4 ink=texture(uTrailMap,uv);
    float density=(ink.r*65280.+ink.g*255.)/65535.*uTrailAmount;
    float t=clamp(density/.38,0.,1.);
    trailFold=t*t*(3.-2.*t)*hs;
  }
  if(uFluidMode>.5&&uHoverMode==1){
    // Dark ground: any motion lights the characters. Lit ground: the flow lights one side of each eddy and opens the other.
    // A little cell-to-cell grain keeps the lit area a shimmer of letters rather than a solid block.
    float grain=fract(sin(dot(cell,vec2(12.9898,78.233)))*43758.5453);
    lift=mix(abs(swirl)*.5+speed,swirl+speed*.35,smoothstep(.12,.55,tone))*(.65+.7*grain);
    wake=clamp(lift*1.6,0.,1.);
  }
  // The resting tone, before the pointer's response: a clear zone may quiet the one and keep part of the other.
  float calm=tone;
  tone=clamp(tone+lift,0.,1.);
  tone+=(1.-2.*tone)*trailFold;
  // Pulses: rings sent by the interface (field.pulse()), e.g. on a save or a notification.
  for(int i=0;i<4;i++){
    if(uPulse[i].w<=0.)continue;
    float dist=length((uv-uPulse[i].xy)*vec2(aspect,1.)),front=uPulse[i].z*.95;
    float ring=exp(-pow((dist-front)/.1,2.))*uPulse[i].w*exp(-uPulse[i].z*.85);
    tone=clamp(tone+ring*.85,0.,1.);
  }
  if(uTapOn>0.){
    // A surface tap: a signed lift (16 bits) and a glint, worked out on the CPU over the photo's own medium.
    vec4 tap=texture(uTapMap,uv);
    float lift=(tap.r*65280.+tap.g*255.)/65535.*2.-1.;
    tone=clamp(tone+(lift*1.25+tap.b)*uTapOn,0.,1.);
  }
  tone*=1.-uVignette*smoothstep(.35,1.05,length((uv-.5)*vec2(min(aspect,1.8),1.)*2.));
  if(uClearMapOn>0.)tone*=1.-uClearMapOn*smoothstep(0.,1.,keep);
  if(uClear.z>0.){
    // Clear zone: the field fades out around content so text above it stays readable.
    vec2 half_=uClear.zw*.5*vec2(aspect,1.),q=(uv-uClear.xy-uClear.zw*.5)*vec2(aspect,1.);
    float dz;
    if(uClearShape>.5){vec2 e=abs(q)-half_;dz=length(max(e,0.))+min(max(e.x,e.y),0.);}
    else dz=(length(q/max(half_,vec2(1e-4)))-1.)*min(half_.x,half_.y);
    float keepZone=smoothstep(0.,uClearFeather,dz);
    tone=calm*keepZone+(tone-calm)*mix(keepZone,1.,uClearPointer);
  }
  // Blend: a shade between two characters takes the upper one in the share of cells a 4x4 Bayer pattern gives it.
  float level=tone*(uCount-1.),upper=fract(level)>=.5?1.:0.;
  if(uBlend>.5&&tone>.02&&tone<.98){
    ivec2 q=ivec2(mod(gl_FragCoord.xy,4.));
    upper=fract(level)>(BAYER[q.y*4+q.x]+.5)/16.?1.:0.;
  }
  if(subMean>=0.&&uOrder<.5&&tone>.008){
    // Shape: among the characters near the cell's tone, the one whose ink in each part best matches the cell's parts after the
    // hovers' lift. Each glyph's ink is scaled to its place on the ramp, so shape decides among glyphs and the ramp keeps the tone.
    float n=uCount-1.,d=tone-subMean,best=1e9,c0=floor(tone*n+.5);
    upper=0.;
    level=c0;
    // A cell without an edge in it keeps the character its tone gives: shape only decides where there is shape to follow.
    if(subHi-subLo>=uShapeGate)for(int k=-6;k<=6;k++){
      float g=c0+float(k);
      if(abs(float(k))>uShapeWindow||g<1.||g>n)continue;
      float r=g/n,scale=r/max(texelFetch(uShapes,ivec2(15,int(g)),0).r,.004),e=0.;
      for(int i=0;i<15;i++){float q=clamp(sub[i]+d,0.,1.)-texelFetch(uShapes,ivec2(i,int(g)),0).r*scale;e+=q*q;}
      e=e/15.+uShapeTone*(tone-r)*(tone-r);
      if(e<best){best=e;level=g;}
    }
  }
  float index=min(uCount-1.,floor(level)+upper+(flick>.5&&tone>.02?1.:0.));
  if(uOrder>1.5){
    // Scatter order: each cell keeps one character picked from the charset by a hash of its place, and the tone sets how
    // strongly it shows rather than which character it is, so a field of letters brightens and fades like a lit screen.
    index=tone>.008?1.+min(uCount-2.,floor(hash(cell*.731+vec2(19.17,3.71))*(uCount-1.))):0.;
  } else if(uOrder>.5){
    // Text order: the charset after its blank is read in sequence along each row, each row a few letters on, so words stay
    // legible. Every letter is there; the tone sets how strongly it shows, so the words fade out toward the field's quiet edges.
    float n=max(1.,uCount-1.);
    index=tone>.015?1.+mod(cell.x+cell.y*(floor(n*.38)+1.),n):0.;
    if(uWordCount>.5&&tone>.015){
      // One word a row, repeated with a space between, rows taking the words in turn and each a few letters along.
      int k=int(mod(cell.y,uWordCount));
      vec2 word=uWords[0];
      for(int i=1;i<8;i++)if(i==k)word=uWords[i];
      float at=mod(cell.x+cell.y*3.,word.y+1.);
      index=at<word.y?word.x+at:0.;
    }
  }
  vec3 hue=rgb/max(max(rgb.r,rgb.g),max(rgb.b,.03));
  hue=mix(vec3(dot(hue,vec3(.2126,.7152,.0722))),hue,uSaturation);
  vec3 base=uRampCount>1.5?rampAt(tone):uInk;
  vec3 ink=mix(base*mix(1.,.3+.7*tone,uRampCount>1.5?0.:uShade),clamp(hue*(.38+.62*tone),0.,1.),uSourceColor);
  // Scatter, text and inlay carry the tone in the ink's strength, which the pixel pass reads back as opacity or tile shade.
  if(uOrder>1.5||(uOrder>.5&&uMark==0)||uMark==17)ink=mix(uInk,hue,uSourceColor)*tone;
  vec3 lifted=uHighlightAuto>.5?ink/max(max(ink.r,ink.g),max(ink.b,.06)):uHighlight;
  ink=mix(ink,lifted,wake*.7);
  if(spot>0.)ink=mix(ink,clamp(rgb/max(max(rgb.r,rgb.g),max(rgb.b,.08))*(.45+.55*tone),0.,1.),spot);
  float underAlpha=max(uBackground.a,min(1.,max(glow.r,max(glow.g,glow.b))));
  vec3 under=min(uBackground.rgb*uBackground.a+glow,vec3(underAlpha));
  // Glyphs keep their atlas index, exact in 8 bits; the other marks keep the tone, and empty where the charset is blank.
  outInk=vec4(ink,uMark==0||uMark==17?index/255.:uMark==1?(tone>.003?tone:0.):index>0.?max(tone,1./255.):0.);
  outUnder=vec4(under,underAlpha);
  // Highlights carry most of the light, as a lens blooms: the tone squared, so mid tones glow a little and shadows not at all.
  float lit=outInk.a>0.?tone*tone:0.;
  outGlow=vec4(ink*lit,lit);
}\`,Nr=(e,t=[])=>{let n=qi(e),a=go(t);if(!a)return n;let i=(c,o,f,d=!1)=>{let m=c.indexOf(o);if(m<0||c.indexOf(o,m+1)>=0)throw new Error(\`The cell pass lost its effect anchor: \${o}\`);return d?c.slice(0,m)+f+c.slice(m):c.slice(0,m+o.length)+f+c.slice(m+o.length)},l=i(n,"void main(){",\`\${a.declarations}
\`,!0);return l=i(l,"float aspect=uResolution.x/uResolution.y;",\`
  vec2 pointer=uFxPointer.xy;float pointerOn=uFxPointer.z,motion=uFxPointer.w,time=uFxTime;
  vec3 fxInk=vec3(0.);float fxInkAmount=0.,fxGlyph=0.;\`),l=i(l,\`+drift;
\`,\`\${a.displace}
\`),l=i(l,"  tone*=1.-uVignette*",\`\${a.shade}
  tone=clamp(tone,0.,1.);
\`,!0),l=i(l,"+(flick>.5&&tone>.02?1.:0.));",\`
  if(tone>.008)index=clamp(index+floor(fxGlyph+.5),tone>.008?1.:0.,uCount-1.);\`),l=i(l,"ink=mix(ink,lifted,wake*.7);",\`
  ink=mix(ink,clamp(fxInk,0.,1.),clamp(fxInkAmount,0.,1.));\`),l},Vi=\`#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uAtlas, uCells, uUnder;
uniform vec2 uResolution, uCell, uPitch;
uniform float uColumns, uDotScale, uSourceColor;
uniform vec2 uDir;
uniform int uMark;
// Inlay accents: share of tiles, letter shuffle span, a seed that steps a few times a second, charset length.
uniform vec4 uInlay;
// Line marks: pitch in cell heights, weight, the share of cells that sparkle.
uniform vec4 uLine;
uniform vec4 uFade;
// Finishing passes: bloom amount and radius in cells, scanlines, grain; chromatic split, curvature, time, rows per scanline pair.
uniform vec4 uPost, uPost2;
uniform sampler2D uGlow;
out vec4 outColor;
const float BAYER[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
uniform vec3 uRamp[6];
uniform float uRampCount;
// The gradient map: the tone run through the ramp's stops, evenly spaced, faintest first.
vec3 rampAt(float t){
  float x=clamp(t,0.,1.)*(uRampCount-1.);
  int i=int(min(floor(x),uRampCount-2.));
  vec3 a=uRamp[0],b=uRamp[1];
  for(int k=1;k<5;k++)if(k==i){a=uRamp[k];b=uRamp[k+1];}
  return mix(a,b,clamp(x-float(i),0.,1.));
}
// The Studio's print defaults: roughness .35, seed 7, registration .2 and its coral second ink. The screen angle is uDir (-35deg).
const float ROUGH=.35,SEED=7.;
const vec3 SECOND=vec3(.925,.404,.322);
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
// Coverage of a signed distance given in device pixels.
float cover(float d){return clamp(.5-d,0.,1.);}
float box(vec2 p,vec2 lo,vec2 hi){vec2 a=clamp(p-lo,0.,1.)*clamp(hi-p,0.,1.);return a.x*a.y;}
float disc(vec2 p,vec2 c,float r){return r>.05?cover(length(p-c)-r):0.;}
float ellipse(vec2 p,vec2 c,vec2 r,float a){vec2 d=p-c;d=vec2(cos(a)*d.x+sin(a)*d.y,-sin(a)*d.x+cos(a)*d.y);float k=length(d/r);return cover((k-1.)*min(r.x,r.y));}
// World-anchored parallel cuts across direction d: period and width in cell heights, so lines run on from cell to cell.
float cuts(vec2 w,vec2 d,float period,float width,float px){
  if(width<=0.)return 0.;
  float proj=dot(vec2(-d.y,d.x),w);
  return cover((abs(fract(proj/period+.5)-.5)*period-width*.5)*px);
}
// Lays an ink over what is already down, multiplying where they overlap, as transparent inks do on paper.
void lay(inout vec3 rgb,inout float a,vec3 c,float k){
  float next=a+k*(1.-a);
  rgb=next>0.?(rgb*a*(1.-k)+mix(c,rgb*c,a)*k)/next:c;
  a=next;
}
vec4 drawAt(vec2 frag){
  vec2 DIR=uDir;
  // The pitch is the atlas cell, or a fractional one under cellFit 'fill', where each glyph sits centred in its stretched cell.
  vec2 cell=floor(frag/uPitch);
  vec4 ink=texelFetch(uCells,ivec2(cell),0),under=texelFetch(uUnder,ivec2(cell),0);
  vec2 local=frag-cell*uPitch;
  float coverage;
  vec3 rgb=ink.rgb;
  // Scatter and inlay: the cell's strength, read back from its ink, and the ink itself at full strength.
  float strength=1.;
  if(uFade.w>.5){
    float top=max(rgb.r,max(rgb.g,rgb.b));
    strength=uSourceColor>.5?top:clamp(top/max(max(uFade.r,max(uFade.g,uFade.b)),.004),0.,1.);
    rgb=uSourceColor>.5?rgb/max(top,.004):uFade.rgb;
  }
  if(uMark==0||uMark==17){
    float index=floor(ink.a*255.+.5);
    // Inlay shuffle: every tiled cell takes a letter from the upper charset, traded for a neighbour a few times a second, so a
    // tiled body flickers through its letters rather than banding by tone; the tile's shade still carries the tone.
    float hs=hash(cell*.917+uInlay.z*1.37);
    if(uMark==17&&uInlay.y>0.&&index>0.&&(index>=uInlay.w*.62||strength>=.2))index=clamp(max(index,ceil(uInlay.w*.62)+1.)+floor((hs-.5)*(2.*uInlay.y+1.)),ceil(uInlay.w*.62),uInlay.w-1.);
    ivec2 tile=ivec2(int(mod(index,uColumns)),int(floor(index/uColumns)));
    vec2 texel=floor(local-floor((uPitch-uCell)*.5));
    coverage=all(greaterThanEqual(texel,vec2(0.)))&&all(lessThan(texel,uCell))?texelFetch(uAtlas,tile*ivec2(uCell)+ivec2(texel),0).a:0.;
    if(uMark==17){
      // Inlay: a gapped tile in the ink, lighter the denser the cell, with its character set into it in a darker shade. Faint
      // cells keep only the character, so a shape's edge frays into specks; empty cells show a hairline grid.
      vec2 p=local+.5;
      float gap=max(1.,floor(min(uPitch.x,uPitch.y)*.08+.5));
      float plate=index>0.?smoothstep(.2,.32,strength)*box(p,vec2(0.),uPitch-gap):0.;
      // Tile and letter are the ink at two strengths over whatever ground lies below, so the inlay reads on light and dark pages:
      // the tile strengthens with the tone and the letter is cut back toward the ground.
      float face=(.18+.8*smoothstep(.05,.8,strength))*plate;
      // With shuffle on, tiles also vary a little in shade, as worn inlay does.
      if(uInlay.y>0.)face*=.8+.34*hs;
      float speck=coverage*min(1.,strength*6.)*(1.-plate);
      float grid=index>0.?0.:(1.-box(p,vec2(0.),uPitch-1.))*.035;
      float a=mix(face,face*.22,coverage*plate)+speck;
      // Accents: a few lit tiles carry a coloured letter, a tinted tile or a white glint, picked afresh with the seed.
      float ha=hash(cell*1.31+uInlay.z*.71+vec2(7.3,1.9));
      if(plate>0.&&ha<uInlay.x){
        float pick=hash(cell+uInlay.z*2.11+vec2(3.1,8.7));
        vec3 hue=pick<.16?vec3(.86,.27,.27):pick<.3?vec3(.92,.55,.2):pick<.42?vec3(.9,.78,.25):pick<.58?vec3(.35,.72,.38):pick<.72?vec3(.3,.72,.8):pick<.84?vec3(.32,.42,.92):vec3(.66,.42,.86);
        float kind=ha/uInlay.x;
        if(kind<.55){float k=coverage*plate;rgb=mix(rgb,hue,k);a=mix(a,1.,k);}
        else if(kind<.88){rgb=mix(rgb,hue,.55);}
        else{float k=coverage*plate;rgb=mix(rgb,vec3(1.),1.-k);a=mix(max(a,.96),face*.3,k);}
      }
      coverage=a>0.?a:grid;
    } else coverage*=strength;
  } else if(uMark==1){
    // Halftone: dot area follows tone, so midtones read true; edges are antialiased to one device pixel.
    float r=sqrt(ink.a)*min(uPitch.x,uPitch.y)*.5*uDotScale;
    coverage=ink.a>.003?clamp(r-length(local-uPitch*.5)+.5,0.,1.):0.;
  } else if(ink.a<=0.){
    coverage=0.;
  } else {
    float tone=ink.a,side=min(uPitch.x,uPitch.y);
    vec2 q=local/uPitch,c=uPitch*.5,p=local+.5;
    // Tiles fade with the tone in one ink, as the Studio's do; in source colour the colour already carries it.
    float fade=uSourceColor>.5?1.:tone,gap=max(.5,uPitch.x*.06),grain=hash(cell+SEED);
    vec2 w=(cell+q)*uPitch/uPitch.y;
    if(uMark==2)coverage=fade;
    else if(uMark==3)coverage=box(p,vec2(0.),uPitch-gap)*fade;
    else if(uMark==4){
      // Lego: a gapped brick, lit from above, with a raised stud ringed by its shadow.
      coverage=box(p,vec2(0.),uPitch-gap)*fade;
      rgb*=1.06-.14*q.y;
      float r=side*.28,d=length(local-c)-r,lit=clamp(dot(c-local,vec2(.6,.8))/r,-1.,1.);
      rgb=mix(rgb,mix(rgb,vec3(1.),.2+.12*lit),cover(d));
      rgb=mix(rgb,rgb*.72,cover(abs(d)-max(.5,side*.04)));
    } else if(uMark==5){
      // Voxel: an isometric cube; top, left and right faces at full, .72 and .42 strength.
      float h=.5*abs(q.x-.5);
      coverage=cover(-min(q.y-h,1.-h-q.y)*uPitch.y)*cover(-min(q.x,1.-q.x)*uPitch.x);
      coverage*=mix(q.x<.5?.72:.42,1.,cover((q.y-(.5-h))*uPitch.y))*fade;
    } else if(uMark==6){
      // Disco: a gapped mirror tile, its upper facet catching light and its lower in shade.
      coverage=box(p,vec2(0.),uPitch-gap)*fade;
      rgb=q.y<.35?mix(rgb,vec3(1.),.1+grain*.25):q.y>.65?rgb*.75:rgb;
    } else if(uMark==18){
      // Tick: a printed glow. A smooth wash carries the light; over it every cell holds one short upright tick whose strength
      // steps through four levels by a 4x4 ordered threshold, so the mid tones read as a crisp dither of ticks that brightens
      // toward the light and melts into the wash at its core. With a ramp the wash runs through it and the ticks sit a step up.
      ivec2 b=ivec2(mod(cell,4.));
      float th=(BAYER[b.y*4+b.x]+.5)/16.;
      float tw=max(1.,floor(uPitch.x*.28+.5)),tl=max(2.,floor(uPitch.y*.46+.5));
      vec2 lo=floor(c-vec2(tw,tl)*.5);
      float bar=box(p,lo,lo+vec2(tw,tl));
      float lvl=clamp(floor(tone*4.+th)/4.,0.,1.);
      float melt=1.-smoothstep(.7,.96,tone);
      float at=bar*melt*(.42+.58*lvl);
      bool ramped=uRampCount>1.5&&uSourceColor<.5;
      float aw=ramped?pow(smoothstep(.08,.88,tone),1.4):tone*tone*.92;
      vec3 W=ramped?rampAt(tone):rgb,T=ramped?rampAt(min(1.,lvl+.38)):rgb;
      float a=at+aw*(1.-at);
      rgb=a>0.?(T*at+W*aw*(1.-at))/a:W;
      coverage=a;
    } else if(uMark==19){
      // Bayer: one gapped square a cell, on or off by a 4x4 ordered threshold at two strengths, so a picture steps through
      // empty, half and full squares in the brand's tones, as pixel-dithered art does.
      ivec2 b=ivec2(mod(cell,4.));
      float th=(BAYER[b.y*4+b.x]+.5)/16.,g=max(1.,floor(min(uPitch.x,uPitch.y)*(1.-uDotScale)+.5));
      float lvl=tone>.5+th*.5?1.:tone>th*.5?.5:0.;
      // An empty cell keeps a small faint square, so the ground reads as a dot grid that the picture fills.
      vec2 d=floor(c-max(1.,floor(min(uPitch.x,uPitch.y)*.3))*.5);
      coverage=lvl>0.?box(p,vec2(0.),uPitch-g)*lvl:box(p,d,d+max(1.,floor(min(uPitch.x,uPitch.y)*.3)))*.35;
    } else if(uMark==7){
      // Dither: an ordered 4x4 Bayer screen at about five dots a cell, lit where the cell's tone passes the threshold.
      ivec2 b=ivec2(mod(floor(frag/max(1.,floor(side/5.))),4.));
      coverage=tone>(BAYER[b.y*4+b.x]+.5)/16.?1.:0.;
    } else if(uMark==8){
      // Hex: a flat-topped hexagon filling the cell.
      vec2 h=abs((local-c)/(uPitch*.49));
      coverage=cover(max(h.y-.866,h.x*.866+h.y*.5-.866)*side*.49)*fade;
    } else if(uMark==9){
      // LED: a round lamp with a soft halo and a specular glint, separated by an unlit matrix.
      float r=side*.39,d=length(local-c);
      coverage=max(cover(d-r),.3*exp(-pow(max(0.,d-r)/(side*.12),2.)))*fade;
      rgb=mix(rgb,vec3(1.),.35*disc(local,uPitch*vec2(.43,.4),side*.11));
    } else if(uMark==10){
      // CMYK: the cell's hue separated into offset cyan, magenta and yellow dots, each sized by its share of the tone. The
      // key screen carries the neutral share in the ink's own lightness, since a light ink on a dark page has no black.
      float top=max(rgb.r,max(rgb.g,rgb.b)),low=min(rgb.r,min(rgb.g,rgb.b));
      vec3 cmy=(top-rgb)/max(top,.001);
      float a=0.;vec3 col=vec3(1.);
      lay(col,a,vec3(top),disc(local,c,side*.48*sqrt(tone*low/max(top,.001))));
      lay(col,a,vec3(0.,1.,1.),disc(local,uPitch*vec2(.36,.36),side*.48*sqrt(tone*cmy.x)));
      lay(col,a,vec3(1.,0.,1.),disc(local,uPitch*vec2(.64,.36),side*.48*sqrt(tone*cmy.y)));
      lay(col,a,vec3(1.,1.,0.),disc(local,uPitch*vec2(.5,.66),side*.48*sqrt(tone*cmy.z)));
      rgb=col;coverage=a;
    } else if(uMark==11||uMark==16){
      // Stipple and pointillism: four jittered marks a cell, their size following the tone.
      coverage=0.;vec3 col=rgb;
      for(int m=0;m<4;m++){
        vec2 o=vec2(float(m%2),float(m/2));
        float j=hash(cell*2.+o+SEED),jy=hash(cell+o*11.+SEED+1.);
        vec2 at=((o+.5)/2.+(vec2(j,jy)-.5)*ROUGH*.28)*uPitch;
        float r=min(min(min(at.x,uPitch.x-at.x),min(at.y,uPitch.y-at.y)),side*min(.245,.21*sqrt(tone)*(1.-ROUGH*j*.35)));
        float k=uMark==11?disc(local,at,r):ellipse(local,at,vec2(r,r*.64),j*3.14159);
        if(uMark==16&&k>coverage)col=uSourceColor>.5?clamp(rgb+(j-.5)*ROUGH*.25*vec3(1.,-.4,-1.),0.,1.):rgb*(1.+(j-.5)*ROUGH*.5);
        coverage=max(coverage,k);
      }
      rgb=col;
    } else if(uMark==12||uMark==13){
      // Engraving and crosshatch: parallel cuts whose weight follows the tone; crossings join only in the darker tones.
      float cv=tone*(1.-ROUGH*grain*.3),px=uPitch.y,P=uLine.x,W=uLine.y*.72*P;
      coverage=cuts(w,DIR,P,min(.94*P,W*cv),px);
      if(uMark==13){
        coverage=max(coverage,cuts(w,vec2(-DIR.y,DIR.x),P,min(.94*P,W*max(0.,cv*1.5-.3)),px)*step(.2,cv));
        coverage=max(coverage,cuts(w,normalize(DIR+vec2(-DIR.y,DIR.x)),P,min(.94*P,W*max(0.,cv*2.-1.2)),px)*step(.6,cv));
      }
      // Sparkle: now and then a lit cell catches a small bright square, picked afresh a few times a second.
      if(uLine.z>0.&&tone>.2&&hash(cell*1.7+uInlay.z*.53)<uLine.z){float sq=max(1.,floor(side*.3+.5));vec2 lo=floor(c-sq*.5);float k=box(p,lo,lo+sq);coverage=max(coverage,k);rgb=mix(rgb,vec3(1.),k*.6);}
    } else if(uMark==14){
      // Woodblock: broad carved bands in five stepped weights, their edges wavering along the grain.
      float cv=ceil(tone*(1.-ROUGH*grain*.3)*5.)/5.,width=min(.94,.72*cv);
      float proj=dot(vec2(-DIR.y,DIR.x),w),line=floor(proj+.5),along=dot(DIR,w);
      float cut=sin(along*5.3+line*1.9+SEED)*.5+sin(along*13.1+line)*.25;
      coverage=cover((abs(proj-line)-width*.5*(1.+ROUGH*cut*.5))*uPitch.y);
    } else if(uMark==15){
      // Risograph: two offset screens, the main ink and the coral second ink, misregistered along the screen angle.
      float split=uSourceColor>.5?clamp(.5+(rgb.r-rgb.b)*.5,0.,1.):.5,r=side*min(.48,.44*sqrt(tone));
      float a=0.;vec3 col=rgb;
      lay(col,a,rgb,disc(local,c,r*sqrt(.35+(1.-split)*.65)));
      lay(col,a,SECOND,disc(local,c+DIR*.2*.38*side,r*sqrt(.3+split*.7)*(1.-ROUGH*hash(cell+SEED+13.)*.3)));
      rgb=col;coverage=a;
    } else coverage=0.;
  }
  return vec4(rgb*coverage+under.rgb*(1.-coverage),coverage+under.a*(1.-coverage));
}
void main(){
  vec2 frag=vec2(gl_FragCoord.x,uResolution.y-gl_FragCoord.y);
  if(uPost2.y>0.){
    // Curvature: the picture bows outward as on a tube, normalised so its corners stay near the frame; outside it is empty.
    vec2 q=frag/uResolution-.5;
    float k=uPost2.y*.5;
    q=q*(1.+k*dot(q,q)*vec2(1.,1.))/(1.+k*.5);
    frag=(q+.5)*uResolution;
    if(frag.x<0.||frag.y<0.||frag.x>=uResolution.x||frag.y>=uResolution.y){outColor=vec4(0.);return;}
  }
  vec4 c=drawAt(frag);
  if(uPost2.x>0.){
    // Chromatic split: red and blue drawn a little apart, more toward the edges.
    vec2 q=frag/uResolution-.5,d=q*dot(q,q)*uPost2.x*uResolution.y*.08+normalize(q+1e-5)*uPost2.x*1.5;
    vec4 r=drawAt(clamp(frag+d,vec2(0.),uResolution-1.)),b=drawAt(clamp(frag-d,vec2(0.),uResolution-1.));
    c=vec4(r.r,c.g,b.b,max(c.a,max(r.a,b.a)));
  }
  if(uPost.x>0.){
    // Bloom: the cells' light, blurred through its mip chain at two radii, laid over in screen-like fashion.
    vec2 uv=frag/uPitch/vec2(textureSize(uGlow,0));
    float l=log2(max(uPost.y,.5));
    vec3 g=textureLod(uGlow,uv,l).rgb*.55+textureLod(uGlow,uv,l+1.5).rgb*.45;
    vec3 add=g*uPost.x;
    c.rgb=c.rgb+add*(1.-c.rgb*.5);
    c.a=max(c.a,min(1.,max(add.r,max(add.g,add.b))));
  }
  if(uPost.z>0.){
    // Scanlines: two thin dark bands a text row, as on a tube.
    float s=.5-.5*cos(frag.y*6.2831853*uPost2.w/uPitch.y);
    c.rgb*=1.-uPost.z*.45*s;
  }
  if(uPost.w>0.){
    // Film grain, new each frame, in the drawn light only so a transparent ground stays clear.
    float n=hash(floor(frag)+fract(uPost2.z*7.13)*vec2(91.7,37.3))-.5;
    c.rgb=clamp(c.rgb+n*uPost.w*.22*c.a,0.,1.);
  }
  outColor=c;
}\`,xo=new Map;function fr(e,t=!1){let n=\`\${e}\${t?"p":""}\`,a=xo.get(n);return a||(a=Vi.replace("uniform int uMark;",\`const int uMark=\${e};\`),t||(a=a.replace("uniform vec4 uPost, uPost2;","const vec4 uPost=vec4(0.), uPost2=vec4(0.,0.,0.,2.);")),xo.set(n,a)),a}var yt=\`#version 300 es
precision highp float;
precision highp sampler2D;
uniform vec2 uTexel;
out vec4 outColor;
vec2 here(){return gl_FragCoord.xy*uTexel;}
\`,ji=yt+\`
uniform sampler2D uVelocity;
uniform vec2 uFrom, uTo, uForce;
uniform float uAspect, uRadius;
float segment(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.,1.);return length(pa-ba*h);}
void main(){
  vec2 uv=here(),scale=vec2(uAspect,1.);
  float d=segment(uv*scale,uFrom*scale,uTo*scale);
  outColor=vec4(texture(uVelocity,uv).xy+uForce*exp(-d*d/(uRadius*uRadius)),0.,1.);
}\`,$i=yt+\`
uniform sampler2D uVelocity;
void main(){
  vec2 uv=here();
  float l=texture(uVelocity,uv-vec2(uTexel.x,0.)).y,r=texture(uVelocity,uv+vec2(uTexel.x,0.)).y;
  float t=texture(uVelocity,uv+vec2(0.,uTexel.y)).x,b=texture(uVelocity,uv-vec2(0.,uTexel.y)).x;
  outColor=vec4(.5*(r-l-t+b),0.,0.,1.);
}\`,Ki=yt+\`
uniform sampler2D uVelocity, uCurl;
uniform float uStrength, uDt;
void main(){
  vec2 uv=here();
  float l=texture(uCurl,uv-vec2(uTexel.x,0.)).x,r=texture(uCurl,uv+vec2(uTexel.x,0.)).x;
  float t=texture(uCurl,uv+vec2(0.,uTexel.y)).x,b=texture(uCurl,uv-vec2(0.,uTexel.y)).x,c=texture(uCurl,uv).x;
  vec2 force=.5*vec2(abs(t)-abs(b),abs(r)-abs(l));
  force=force/(length(force)+1e-4)*uStrength*c;
  force.y=-force.y;
  outColor=vec4(clamp(texture(uVelocity,uv).xy+force*uDt,-1000.,1000.),0.,1.);
}\`,Yi=yt+\`
uniform sampler2D uVelocity;
void main(){
  vec2 uv=here(),c=texture(uVelocity,uv).xy;
  float l=texture(uVelocity,uv-vec2(uTexel.x,0.)).x,r=texture(uVelocity,uv+vec2(uTexel.x,0.)).x;
  float t=texture(uVelocity,uv+vec2(0.,uTexel.y)).y,b=texture(uVelocity,uv-vec2(0.,uTexel.y)).y;
  if(uv.x-uTexel.x<0.)l=-c.x;
  if(uv.x+uTexel.x>1.)r=-c.x;
  if(uv.y+uTexel.y>1.)t=-c.y;
  if(uv.y-uTexel.y<0.)b=-c.y;
  outColor=vec4(.5*(r-l+t-b),0.,0.,1.);
}\`,Qi=yt+\`
uniform sampler2D uSource;
uniform float uAmount;
void main(){outColor=vec4(texture(uSource,here()).x*uAmount,0.,0.,1.);}\`,Zi=yt+\`
uniform sampler2D uPressure, uDivergence;
void main(){
  vec2 uv=here();
  float l=texture(uPressure,uv-vec2(uTexel.x,0.)).x,r=texture(uPressure,uv+vec2(uTexel.x,0.)).x;
  float t=texture(uPressure,uv+vec2(0.,uTexel.y)).x,b=texture(uPressure,uv-vec2(0.,uTexel.y)).x;
  outColor=vec4((l+r+b+t-texture(uDivergence,uv).x)*.25,0.,0.,1.);
}\`,Ji=yt+\`
uniform sampler2D uPressure, uVelocity;
void main(){
  vec2 uv=here();
  float l=texture(uPressure,uv-vec2(uTexel.x,0.)).x,r=texture(uPressure,uv+vec2(uTexel.x,0.)).x;
  float t=texture(uPressure,uv+vec2(0.,uTexel.y)).x,b=texture(uPressure,uv-vec2(0.,uTexel.y)).x;
  outColor=vec4(texture(uVelocity,uv).xy-vec2(r-l,t-b),0.,1.);
}\`,el=yt+\`
uniform sampler2D uVelocity;
uniform float uDt, uDissipation;
void main(){
  vec2 uv=here();
  vec2 back=uv-uDt*texture(uVelocity,uv).xy*uTexel;
  outColor=vec4(texture(uVelocity,back).xy/(1.+uDissipation*uDt),0.,1.);
}\`,tl=20;function To(e,t,n){let a={splat:t(ji),curl:t($i),vorticity:t(Ki),divergence:t(Yi),fade:t(Qi),pressure:t(Zi),gradient:t(Ji),advect:t(el)},i=Object.values(a),l=0,c=0,o=[],f=[],d=null,m=null,g=A=>{let r=e.createTexture();e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,A),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,A),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,l,c,0,e.RGBA,e.HALF_FLOAT,null);let E=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,E),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE?(e.deleteFramebuffer(E),e.deleteTexture(r),null):(e.viewport(0,0,l,c),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),{texture:r,buffer:E})},w=A=>{A&&(e.deleteTexture(A.texture),e.deleteFramebuffer(A.buffer))},T=()=>{[...o,...f,d,m].forEach(w),o=[],f=[],d=m=null},M=(A,r)=>{let E=A.locations;return e.useProgram(A.program),e.bindFramebuffer(e.FRAMEBUFFER,r.buffer),e.uniform2f(E.uTexel,1/l,1/c),E},x=(A,r,E,L)=>{e.activeTexture(e.TEXTURE0+E),e.bindTexture(e.TEXTURE_2D,L),e.uniform1i(A[r],E)},F=()=>e.drawArrays(e.TRIANGLES,0,3),v=A=>{let r=A[0];A[0]=A[1],A[1]=r};return{resize(A,r){T(),l=A,c=r;let E=[g(e.LINEAR),g(e.LINEAR),g(e.NEAREST),g(e.NEAREST),g(e.NEAREST),g(e.NEAREST)];return e.bindFramebuffer(e.FRAMEBUFFER,null),E.some(L=>!L)?(E.forEach(w),!1):(o=[E[0],E[1]],f=[E[2],E[3]],d=E[4],m=E[5],!0)},ready(){return i.every(n)},step(A,r){if(!o.length||!d||!m)return;e.viewport(0,0,l,c);let E;A&&(E=M(a.splat,o[1]),x(E,"uVelocity",0,o[0].texture),e.uniform2f(E.uFrom,A.from[0],A.from[1]),e.uniform2f(E.uTo,A.to[0],A.to[1]),e.uniform2f(E.uForce,A.force[0],A.force[1]),e.uniform1f(E.uAspect,r.aspect),e.uniform1f(E.uRadius,r.radius),F(),v(o)),r.curl>0&&(E=M(a.curl,m),x(E,"uVelocity",0,o[0].texture),F(),E=M(a.vorticity,o[1]),x(E,"uVelocity",0,o[0].texture),x(E,"uCurl",1,m.texture),e.uniform1f(E.uStrength,r.curl),e.uniform1f(E.uDt,r.dt),F(),v(o)),E=M(a.divergence,d),x(E,"uVelocity",0,o[0].texture),F(),E=M(a.fade,f[1]),x(E,"uSource",0,f[0].texture),e.uniform1f(E.uAmount,.8),F(),v(f);for(let L=0;L<tl;L++)E=M(a.pressure,f[1]),x(E,"uPressure",0,f[0].texture),x(E,"uDivergence",1,d.texture),F(),v(f);E=M(a.gradient,o[1]),x(E,"uPressure",0,f[0].texture),x(E,"uVelocity",1,o[0].texture),F(),v(o),E=M(a.advect,o[1]),x(E,"uVelocity",0,o[0].texture),e.uniform1f(E.uDt,r.dt),e.uniform1f(E.uDissipation,r.dissipation),F(),v(o),e.bindFramebuffer(e.FRAMEBUFFER,null)},get velocity(){return o[0]?.texture??null},get size(){return[l,c]},release:T,dispose(){T(),i.forEach(({program:A})=>e.deleteProgram(A))}}}function Hr(e,t,n){let a=0;for(;Math.max(e>>a,t>>a)>n&&e>>a+1>=1&&t>>a+1>=1;)a++;return{level:a,width:Math.max(1,e>>a),height:Math.max(1,t>>a)}}function Fo(e){let t=null,n=null,a=null,i=0,l=0,c=0,o=!1,f=null,d=-1;return{get pending(){return!!a},request(m,g,w,T){if(a||o||!g||!w)return!1;let M=Hr(g,w,T);try{t??(t=e.createFramebuffer()),n??(n=e.createBuffer());let x=e.getParameter(e.FRAMEBUFFER_BINDING);if(e.bindFramebuffer(e.FRAMEBUFFER,t),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,m,M.level),f!==m||d!==M.level){if(e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)return e.bindFramebuffer(e.FRAMEBUFFER,x),o=!0,!1;f=m,d=M.level}let F=M.width*M.height*4;return e.bindBuffer(e.PIXEL_PACK_BUFFER,n),F!==i&&(e.bufferData(e.PIXEL_PACK_BUFFER,F,e.STREAM_READ),i=F),e.pixelStorei(e.PACK_ALIGNMENT,4),e.readPixels(0,0,M.width,M.height,e.RGBA,e.UNSIGNED_BYTE,0),e.bindBuffer(e.PIXEL_PACK_BUFFER,null),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,null,0),e.bindFramebuffer(e.FRAMEBUFFER,x),a=e.fenceSync(e.SYNC_GPU_COMMANDS_COMPLETE,0),e.flush(),l=M.width,c=M.height,!!a}catch{return o=!0,!1}},poll(){if(!a)return null;let m=e.clientWaitSync(a,0,0);if(m!==e.ALREADY_SIGNALED&&m!==e.CONDITION_SATISFIED)return m===e.WAIT_FAILED&&(e.deleteSync(a),a=null,o=!0),null;e.deleteSync(a),a=null;let g=new Uint8Array(l*c*4);return e.bindBuffer(e.PIXEL_PACK_BUFFER,n),e.getBufferSubData(e.PIXEL_PACK_BUFFER,0,g),e.bindBuffer(e.PIXEL_PACK_BUFFER,null),{data:g,width:l,height:c}},dispose(){a&&e.deleteSync(a),t&&e.deleteFramebuffer(t),n&&e.deleteBuffer(n),a=t=n=null}}}var rl=\`#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}\`,wo=\`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uSource;
uniform int uLevel;
float lum(vec3 c){ return dot(c,vec3(.2126,.7152,.0722)); }
\`,nl=\`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uSource;
uniform int uLevel, uWidth;
void main(){
  vec4 c=texelFetch(uSource,ivec2(gl_VertexID%uWidth,gl_VertexID/uWidth),uLevel);
  float bin=floor(dot(c.rgb,vec3(.2126,.7152,.0722))*255.+.5);
  gl_Position=c.a*255.<8.?vec4(2.,2.,0.,1.):vec4((bin+.5)/128.-1.,0.,0.,1.);
  gl_PointSize=1.;
}\`,al=\`#version 300 es
precision highp float;
out vec4 o;
void main(){ o=vec4(1.); }\`,ol=\`#version 300 es
precision highp float;
uniform sampler2D uHistogram;
out vec4 o;
void main(){
  float count=0.;
  for(int v=0;v<256;v++)count+=texelFetch(uHistogram,ivec2(v,0),0).r;
  if(count<.5){o=vec4(0.,1.,0.,1.);return;}
  float low=1.,high=1.,seen=0.;bool lowFound=false;
  for(int v=0;v<256;v++){
    seen+=texelFetch(uHistogram,ivec2(v,0),0).r;
    if(!lowFound&&seen>=count*.02){low=float(v)/255.;lowFound=true;}
    if(seen>=count*.98){high=float(v)/255.;break;}
  }
  o=high-low<.08?vec4(0.,1.,0.,1.):vec4(low,high,0.,1.);
}\`,il=\`\${wo}
uniform ivec2 uSize;
out vec4 o;
void main(){
  int ring=max(1,int(floor(float(min(uSize.x,uSize.y))*.03+.5)));
  float clear=0.,sum=0.,square=0.,count=0.;
  for(int y=0;y<128;y++){
    if(y>=uSize.y)break;
    for(int x=0;x<128;x++){
      if(x>=uSize.x)break;
      vec4 c=texelFetch(uSource,ivec2(x,y),uLevel);
      if(c.a*255.<249.5)clear+=1.;
      if(x>=ring&&y>=ring&&x<uSize.x-ring&&y<uSize.y-ring)continue;
      float l=lum(c.rgb);sum+=l;square+=l*l;count+=1.;
    }
  }
  float ground=sum/max(1.,count);
  o=vec4(clear/float(uSize.x*uSize.y),ground,sqrt(max(0.,square/max(1.,count)-ground*ground)),1.);
}\`,ll=\`\${wo}
uniform sampler2D uStats;
out vec4 o;
void main(){
  vec4 stats=texelFetch(uStats,ivec2(0),0);
  vec4 c=texelFetch(uSource,ivec2(gl_FragCoord.xy),uLevel);
  if(stats.x>.01){o=vec4(0.,0.,0.,c.a);return;}
  if(stats.z>=.07){o=vec4(1.,0.,0.,1.);return;}
  float t=clamp((abs(lum(c.rgb)-stats.y)-.035)/.12,0.,1.);
  o=vec4(0.,0.,0.,t*t*(3.-2.*t));
}\`,sl=\`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uImage;
uniform ivec2 uStep;
uniform int uRadius;
out vec4 o;
void main(){
  ivec2 at=ivec2(gl_FragCoord.xy),last=textureSize(uImage,0)-1;
  float sum=0.,total=0.;
  for(int k=-16;k<=16;k++){
    if(k<-2*uRadius||k>2*uRadius)continue;
    float w=float(2*uRadius+1-abs(k));
    sum+=texelFetch(uImage,clamp(at+uStep*k,ivec2(0),last),0).a*w;total+=w;
  }
  o=vec4(texelFetch(uImage,at,0).r,0.,0.,sum/total);
}\`,Qn=new WeakMap,ko=e=>{Qn.delete(e)};function Ao(e){if(!e.getExtension("EXT_color_buffer_float")||!e.getExtension("EXT_float_blend"))return null;let t=(v,A=rl)=>{let r=(re,J)=>{let ne=e.createShader(re);return e.shaderSource(ne,J),e.compileShader(ne),ne},E=e.createProgram(),L=r(e.VERTEX_SHADER,A),Y=r(e.FRAGMENT_SHADER,v);if(e.attachShader(E,L),e.attachShader(E,Y),e.linkProgram(E),e.deleteShader(L),e.deleteShader(Y),!e.getProgramParameter(E,e.LINK_STATUS))return e.deleteProgram(E),null;let Q=new Map;return{program:E,at:re=>(Q.has(re)||Q.set(re,e.getUniformLocation(E,re)),Q.get(re))}},n=Qn.get(e);n||Qn.set(e,n=new Map);let a=n,i=(v,A)=>{let r=a.get(v);if(r)return r;let E=A();if(!E)throw new Error("The glyph field could not build its GPU measure.");return a.set(v,E),E},l=[],c=(v,A,r,E)=>{let L=e.createTexture(),Y=e.createFramebuffer();e.bindTexture(e.TEXTURE_2D,L);for(let[re,J]of[[e.TEXTURE_MIN_FILTER,E],[e.TEXTURE_MAG_FILTER,E],[e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE],[e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE]])e.texParameteri(e.TEXTURE_2D,re,J);let Q={texture:L,buffer:Y,width:0,height:0,format:v,type:A,base:r};return l.push(Q),Q},o=(v,A,r)=>{let E=v;v.width===A&&v.height===r||(v.width=A,v.height=r,e.bindTexture(e.TEXTURE_2D,v.texture),e.texImage2D(e.TEXTURE_2D,0,E.format,A,r,0,E.base,E.type,null),e.bindFramebuffer(e.FRAMEBUFFER,v.buffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,v.texture,0))},f=null,d=null,m=null,g=null,w=null,T=null,M=e.createVertexArray(),x=(v,A)=>{e.bindFramebuffer(e.FRAMEBUFFER,A.buffer),e.viewport(0,0,A.width,A.height),e.useProgram(v.program)},F=(v,A,r)=>{e.activeTexture(e.TEXTURE11),e.bindTexture(e.TEXTURE_2D,v),e.uniform1i(A.at(r),11)};return{get levels(){return d?.texture??null},get scope(){return T?.texture??null},measureLevels(v,A,r){let E=Hr(A,r,128),L=i("histogram",()=>t(al,nl)),Y=i("levels",()=>t(ol));f??(f=c(e.R32F,e.FLOAT,e.RED,e.NEAREST)),d??(d=c(e.RGBA32F,e.FLOAT,e.RGBA,e.NEAREST)),o(f,256,1),o(d,1,1),x(L,f),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),F(v,L,"uSource"),e.uniform1i(L.at("uLevel"),E.level),e.uniform1i(L.at("uWidth"),E.width),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE),e.bindVertexArray(M),e.drawArrays(e.POINTS,0,E.width*E.height),e.disable(e.BLEND),x(Y,d),F(f.texture,Y,"uHistogram"),e.drawArrays(e.TRIANGLES,0,3)},measureScope(v,A,r){let E=Hr(A,r,128),L=Math.min(128,E.width),Y=Math.min(128,E.height),Q=i("stats",()=>t(il)),re=i("subject",()=>t(ll)),J=i("blur",()=>t(sl));m??(m=c(e.RGBA32F,e.FLOAT,e.RGBA,e.NEAREST)),g??(g=c(e.RGBA8,e.UNSIGNED_BYTE,e.RGBA,e.NEAREST)),w??(w=c(e.RGBA8,e.UNSIGNED_BYTE,e.RGBA,e.NEAREST)),T??(T=c(e.RGBA8,e.UNSIGNED_BYTE,e.RGBA,e.LINEAR)),o(m,1,1),o(g,L,Y),o(w,L,Y),o(T,L,Y),e.bindVertexArray(M),x(Q,m),F(v,Q,"uSource"),e.uniform1i(Q.at("uLevel"),E.level),e.uniform2i(Q.at("uSize"),L,Y),e.drawArrays(e.TRIANGLES,0,3),x(re,g),F(v,re,"uSource"),e.uniform1i(re.at("uLevel"),E.level),e.activeTexture(e.TEXTURE12),e.bindTexture(e.TEXTURE_2D,m.texture),e.uniform1i(re.at("uStats"),12),e.drawArrays(e.TRIANGLES,0,3);let ne=Math.min(8,Math.max(1,Math.round(Math.min(L,Y)*.02)));x(J,w),F(g.texture,J,"uImage"),e.uniform2i(J.at("uStep"),1,0),e.uniform1i(J.at("uRadius"),ne),e.drawArrays(e.TRIANGLES,0,3),x(J,T),F(w.texture,J,"uImage"),e.uniform2i(J.at("uStep"),0,1),e.drawArrays(e.TRIANGLES,0,3)},dispose(){for(let v of l)e.deleteTexture(v.texture),e.deleteFramebuffer(v.buffer);M&&e.deleteVertexArray(M),l.length=0,f=d=m=g=w=T=null}}}var cl=\`#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}\`,Yt=new Set,Ro=new Set,Et=0,ra=0,So=null,Vr=120,No=new Float64Array(Vr),Qt=0,Ho=(e=Qt)=>{let t=Math.min(e,Qt),n=new Array(t);for(let a=0;a<t;a++)n[a]=No[(pr-t+a)%Vr];return n},Kt=0,pr=0,mr=1,Xr=0,Lo=0;function ul(e){Et=0,Kt&&e>Kt&&(No[pr%Vr]=e-Kt,pr++,Qt<Vr&&Qt++),Kt=e,ra=performance.now();let t=Yt;Yt=Ro,Ro=t;for(let a of t)try{a(e)}catch(i){typeof console<"u"&&console.error(i)}t.clear(),Mt?.endFrame(e);let n=performance.now()-ra;if(Xr=Xr*.9+n*.1,e-Lo>500){Lo=e;let a=zo(),i=!!Mt?.overloaded;(Xr>a*.5||i)&&mr<3?mr++:Xr<a*.2&&!i&&mr>1&&mr--}Yt.size||(Kt=0)}var Xo=()=>mr;function aa(e){Yt.add(e),Et&&So!==requestAnimationFrame&&(Et=0),Et||(So=requestAnimationFrame,Et=requestAnimationFrame(ul))}function oa(e){Yt.delete(e),!Yt.size&&Et&&(cancelAnimationFrame(Et),Et=0,Kt=0)}var Co=1e3/60,_o=-1/0;function zo(){if(Qt<20)return 1e3/60;if(pr-_o<15)return Co;_o=pr;let e=Ho().sort((t,n)=>t-n);return Co=Math.min(1e3/60,Math.max(1e3/360,e[Math.floor(e.length*.2)]))}var gr=new Set,ia=new Set,la=new Set,qo=new Set,sa=new Set,Zn=!1,Po=null,Jn=null,ea=null,zr=null,Do=e=>{let t=null;for(let n of gr){if(n.target===window){(!n.near||n.near()||n.inside)&&n.move(e);continue}t??(t=e.composedPath()),t.includes(n.target)?(n.inside=!0,n.move(e)):n.inside&&(n.inside=!1,n.leave())}},fl=()=>{for(let e of gr)e.inside=!1,e.leave()},hl=()=>{for(let e of[...ia])e()},dl=()=>{for(let e of[...la])e()},Go=()=>{for(let e of[...qo])e()},ml=e=>{for(let t of[...sa])t(e)},pl=()=>typeof document>"u"?void 0:document.fonts;function Io(){let e=gr.size+ia.size+la.size+qo.size+sa.size>0;if(typeof document>"u"||(Po!==document&&(Zn=!1,Po=document,Jn=ea=null,zr=null),e===Zn))return;Zn=e;let t=e?"addEventListener":"removeEventListener";if(typeof window<"u"&&(window[t]?.("pointermove",Do,{capture:!0,passive:!0}),window[t]?.("pointerdown",Do,{capture:!0,passive:!0})),document[t]?.("pointerleave",fl),document[t]?.("visibilitychange",hl),pl()?.[t]?.("loadingdone",ml),Jn??(Jn=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null),ea??(ea=typeof matchMedia=="function"?matchMedia("(prefers-color-scheme: dark)"):null),Jn?.[t]?.("change",dl),ea?.[t]?.("change",Go),e){zr??(zr=typeof MutationObserver=="function"?new MutationObserver(Go):null);for(let n of[document.documentElement,document.body])n&&zr?.observe(n,{attributes:!0,attributeFilter:["class","data-theme","data-mode","style"]})}else zr?.disconnect()}var br=(e,t)=>(e.add(t),Io(),()=>{e.delete(t)&&Io()});function Vo(e){let t=e.target;if(typeof window>"u"||t===window||typeof document>"u")return br(gr,e);let n=t,a=n.getRootNode?.();if(n.ownerDocument===document&&(!a||a===document))return br(gr,e);let i=e.move,l=()=>e.leave();return n.addEventListener("pointermove",i,{passive:!0}),n.addEventListener("pointerdown",i,{passive:!0}),n.addEventListener("pointerleave",l),()=>{n.removeEventListener("pointermove",i),n.removeEventListener("pointerdown",i),n.removeEventListener("pointerleave",l)}}var jo=e=>br(ia,e),$o=e=>br(la,e);var Ko=e=>br(sa,e),hr=new Map,dr=null,ta=new Map,Yo=e=>t=>{for(let n of t)for(let a of[...e.get(n.target)??[]])a(n)},Qo=(e,t,n)=>{let a=e.get(t);return a?(a.add(n),!1):(e.set(t,new Set([n])),!0)},Zo=(e,t,n)=>{let a=e.get(t);return!a?.delete(n)||a.size?!1:(e.delete(t),!0)};function jr(e,t){return typeof ResizeObserver!="function"?()=>{}:(dr??(dr=new ResizeObserver(Yo(hr))),Qo(hr,e,t)?dr.observe(e):queueMicrotask(()=>{hr.get(e)?.has(t)&&t({target:e})}),()=>{Zo(hr,e,t)&&dr?.unobserve(e),hr.size||(dr?.disconnect(),dr=null)})}function Jo(e,t,n){if(typeof IntersectionObserver!="function")return()=>{};let a=ta.get(t);if(!a){let c=new Map;a={observer:new IntersectionObserver(Yo(c),{rootMargin:t}),watch:c},ta.set(t,a)}let{observer:i,watch:l}=a;return Qo(l,e,n)||i.unobserve(e),i.observe(e),()=>{Zo(l,e,n)&&i.unobserve(e),l.size||(i.disconnect(),ta.delete(t))}}var Uo=new WeakMap;function ca(e){let t=Uo.get(e);if(t)return t;let n={activeTexture:e.activeTexture.bind(e),bindTexture:e.bindTexture.bind(e),deleteTexture:e.deleteTexture.bind(e),useProgram:e.useProgram.bind(e),deleteProgram:e.deleteProgram.bind(e),bindFramebuffer:e.bindFramebuffer.bind(e),deleteFramebuffer:e.deleteFramebuffer.bind(e),viewport:e.viewport.bind(e),pixelStorei:e.pixelStorei.bind(e)},a=e.TEXTURE0,i=e.TEXTURE_2D,l=e.FRAMEBUFFER,c=[],o=-1,f,d,m="",g=new Map,w=()=>{c.length=0,o=-1,f=void 0,d=void 0,m="",g.clear()},T=e;return T.activeTexture=M=>{let x=M-a;x!==o&&(o=x,n.activeTexture(M))},T.bindTexture=(M,x)=>{if(M===i&&o>=0){if(c[o]===x)return;c[o]=x}else M===i&&(c.length=0);n.bindTexture(M,x)},T.deleteTexture=M=>{for(let x=0;x<c.length;x++)c[x]===M&&(c[x]=void 0);n.deleteTexture(M)},T.useProgram=M=>{M!==f&&(f=M,n.useProgram(M))},T.deleteProgram=M=>{M===f&&(f=void 0),n.deleteProgram(M)},T.bindFramebuffer=(M,x)=>{if(M===l){if(x===d)return;d=x}else d=void 0;n.bindFramebuffer(M,x)},T.deleteFramebuffer=M=>{M===d&&(d=void 0),n.deleteFramebuffer(M)},T.pixelStorei=(M,x)=>{g.get(M)!==x&&(g.set(M,x),n.pixelStorei(M,x))},T.viewport=(M,x,F,v)=>{let A=\`\${M},\${x},\${F},\${v}\`;A!==m&&(m=A,n.viewport(M,x,F,v))},Uo.set(e,w),w}var gl=3e3,Oo=256*1024*1024,bl=32,qr=[1,.85,.7,.58,.5],xr=class{constructor(t,n){this.gl=t;this.onChange=n;this.level=0;this.overloaded=!1;this.queries=[];this.open=null;this.drew=!1;this.gpuMs=[];this.cpuMs=[];this.changedAt=0;this.checkedAt=-1/0;this.frameNo=0;this.timer=t.getExtension("EXT_disjoint_timer_query_webgl2")}begin(){if(!this.drew&&(this.drew=!0,this.timer&&!this.open&&this.queries.length<4&&(this.frameNo++&7)===0)){let t=this.gl.createQuery();t&&(this.gl.beginQuery(this.timer.TIME_ELAPSED_EXT,t),this.open=t)}}end(t,n){let a=this.gl,i=this.timer;if(this.drew&&(this.cpuMs.push(n),this.cpuMs.length>60&&this.cpuMs.shift(),i&&this.open&&(a.endQuery(i.TIME_ELAPSED_EXT),this.queries.push({query:this.open,frame:t}),this.open=null)),this.drew=!1,i&&this.queries.length&&a.getQueryParameter(this.queries[0].query,a.QUERY_RESULT_AVAILABLE)){let l=a.getParameter(i.GPU_DISJOINT_EXT);for(;this.queries.length&&a.getQueryParameter(this.queries[0].query,a.QUERY_RESULT_AVAILABLE);){let{query:c}=this.queries.shift();l||(this.gpuMs.push(a.getQueryParameter(c,a.QUERY_RESULT)/1e6),this.gpuMs.length>60&&this.gpuMs.shift()),a.deleteQuery(c)}}this.adapt(t)}skip(){this.drew=!1}reset(){this.queries=[],this.open=null,this.gpuMs=[],this.cpuMs=[]}adapt(t){if(t-this.checkedAt<250)return;this.checkedAt=t;let n=zo(),a=this.gpuMs.length>=5&&Math.min(...this.gpuMs.slice(-5))>n*1.5,i=this.gpuMs.length>=10||a?this.gpuMs:null,l;if(i)l=i.slice().sort((o,f)=>o-f)[Math.floor(i.length*.75)]/n;else{if(Qt<30||this.cpuMs.length<10)return;let o=Ho(30).sort((d,m)=>d-m),f=this.cpuMs.slice().sort((d,m)=>d-m)[this.cpuMs.length>>1];l=o[Math.floor(o.length*.75)]/n>1.6&&f<n*.5?1:.5}if(this.overloaded=l>.8&&this.atMinimum,t-this.changedAt<(l>.8?800:4e3))return;let c=this.level;l>2?c=qr.length-1:l>.8&&c<qr.length-1?c++:l<.3&&c>0&&c--,c!==this.level&&(this.level=c,this.changedAt=t,this.gpuMs=[],this.cpuMs=[],this.onChange())}get scale(){return qr[this.level]}get atMinimum(){return this.level===qr.length-1}},na=class{constructor(){this.lost=!1;this.programs=new Map;this.atlases=new Map;this.vertex=null;this.vao=null;this.clients=new Set;this.parallel=null;this.lostTimer=0;this.renderer="";this.forgetState=()=>{};this.onLost=t=>{t.preventDefault(),this.lost=!0,this.forgetState(),this.reset();for(let n of[...this.clients])n.lost();clearTimeout(this.lostTimer),this.lostTimer=setTimeout(()=>{if(this.lost){this.canvas.removeEventListener?.("webglcontextlost",this.onLost),this.canvas.removeEventListener?.("webglcontextrestored",this.onRestored);try{this.create()}catch{return}this.restored()}},1e3)};this.onRestored=()=>{clearTimeout(this.lostTimer),this.lost=!1,this.forgetState(),this.restored()};this.idleTimer=0;this.create()}create(){let t=null,n=null,a={alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!0,powerPreference:"high-performance"};if(typeof document<"u"&&(t=document.createElement("canvas"),n=t.getContext("webgl2",a)),!n&&typeof OffscreenCanvas=="function")try{t=new OffscreenCanvas(1,1),n=t.getContext("webgl2",a)}catch{n=null}if(!n||!t)throw new Error("WebGL2 is not available for the glyph field.");this.canvas=t,this.gl=n,this.forgetState=ca(n),this.lost=!1,t.width=t.height=1,this.parallel=n.getExtension("KHR_parallel_shader_compile");let i=this.frames?.level??0;this.frames=new xr(n,()=>{for(let o of[...this.clients])o.rescale()}),this.frames.level=i;let l=n.getExtension("WEBGL_debug_renderer_info");this.renderer=String(n.getParameter(l?l.UNMASKED_RENDERER_WEBGL:n.RENDERER)??""),t.addEventListener?.("webglcontextlost",this.onLost),t.addEventListener?.("webglcontextrestored",this.onRestored);let c=!n.getExtension("EXT_color_buffer_float")&&!n.getExtension("EXT_color_buffer_half_float");this.program(Nr(c)),this.program(fr(0))}restored(){for(let t of[...this.clients])t.restored()}reset(){this.programs.clear(),this.atlases.clear(),this.vertex=null,this.vao=null,this.frames.reset()}join(t){this.clients.add(t),clearTimeout(this.idleTimer)}leave(t){if(this.clients.delete(t),this.clients.size){this.fit();return}this.lost||(this.canvas.width=this.canvas.height=1,this.frames.level=0),clearTimeout(this.idleTimer),this.idleTimer=setTimeout(()=>{this.clients.size||this.dispose()},gl)}dispose(){if(clearTimeout(this.lostTimer),this.canvas.removeEventListener?.("webglcontextlost",this.onLost),this.canvas.removeEventListener?.("webglcontextrestored",this.onRestored),!this.lost)try{this.gl.getExtension("WEBGL_lose_context")?.loseContext()}catch{}this.reset(),Mt===this&&(Mt=null)}program(t){let n=this.programs.get(t);if(n)return n;let a=this.gl,i=(f,d)=>{let m=a.createShader(f);return a.shaderSource(m,d),a.compileShader(m),m};this.vertex??(this.vertex=i(a.VERTEX_SHADER,cl));let l=a.createProgram(),c=i(a.FRAGMENT_SHADER,t);a.attachShader(l,this.vertex),a.attachShader(l,c),a.linkProgram(l);let o={program:l,locations:null,fragment:c};return this.programs.set(t,o),o}linked(t,n=!1){if(t.locations)return!0;let a=this.gl;if(!n&&this.parallel&&!a.getProgramParameter(t.program,this.parallel.COMPLETION_STATUS_KHR))return!1;if(!a.getProgramParameter(t.program,a.LINK_STATUS)){if(a.isContextLost())return!1;throw new Error(t.fragment&&a.getShaderInfoLog(t.fragment)||a.getProgramInfoLog(t.program)||"Glyph field program failed to link.")}let i={};for(let l=a.getProgramParameter(t.program,a.ACTIVE_UNIFORMS)-1;l>=0;l--){let c=a.getActiveUniform(t.program,l).name.replace(/\\[0\\]$/,"");i[c]=a.getUniformLocation(t.program,c)}return t.locations=i,!0}get canCompileInParallel(){return!!this.parallel}vertexArray(){return this.vao??(this.vao=this.gl.createVertexArray())}atlas(t,n,a){let i=this.atlases.get(t);if(i)i.refs||(this.atlases.delete(t),this.atlases.set(t,i));else{let l=this.gl,c=l.createTexture();l.bindTexture(l.TEXTURE_2D,c);for(let[o,f]of[[l.TEXTURE_MIN_FILTER,l.NEAREST],[l.TEXTURE_MAG_FILTER,l.NEAREST],[l.TEXTURE_WRAP_S,l.CLAMP_TO_EDGE],[l.TEXTURE_WRAP_T,l.CLAMP_TO_EDGE]])l.texParameteri(l.TEXTURE_2D,o,f);i={key:t,texture:c,refs:0,final:!1,users:new Set,bytes:0},this.atlases.set(t,i),this.paintAtlas(i,n)}return i.refs++,i.users.add(a),i}hasAtlas(t){return this.atlases.has(t)}paintAtlas(t,n){let a=this.gl,{image:i,final:l}=n();a.bindTexture(a.TEXTURE_2D,t.texture),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,!1),a.texImage2D(a.TEXTURE_2D,0,a.RGBA8,a.RGBA,a.UNSIGNED_BYTE,i),t.bytes=i.width*i.height*4,t.final=l;for(let c of[...t.users])c()}releaseAtlas(t,n){!t||!t.users.delete(n)||--t.refs>0||this.evictAtlases()}evictAtlases(){let t=[...this.atlases.values()].filter(a=>!a.refs),n=t.length-bl;for(let a of t){if(n<=0&&!this.overBudget)break;n--,this.atlases.delete(a.key),this.lost||this.gl.deleteTexture(a.texture)}}fit(){if(this.lost)return;let t=1,n=1;for(let l of this.clients){let[c,o]=l.size();t=Math.max(t,c),n=Math.max(n,o)}let a=this.canvas,i=l=>Math.ceil(l/256)*256;a.width*a.height>i(t)*i(n)*2&&(a.width=i(t),a.height=i(n))}get bytes(){let t=this.canvas.width*this.canvas.height*4*2;for(let n of this.clients)t+=n.bytes();for(let n of this.atlases.values())t+=n.bytes;return t}get overBudget(){return this.bytes>Oo}get roomy(){return this.bytes<Oo*.85}begin(t,n){let a=this.canvas;if(a.width<t||a.height<n){let i=l=>Math.ceil(l/256)*256;a.width=Math.max(a.width,i(t)),a.height=Math.max(a.height,i(n))}this.frames.begin()}present(t,n,a){t.globalCompositeOperation="copy",t.imageSmoothingEnabled=!1,t.drawImage(this.canvas,0,this.canvas.height-a,n,a,0,0,n,a)}endFrame(t){if(this.lost){this.frames.skip();return}this.frames.end(t,performance.now()-ra)}get level(){return this.frames.level}get overloaded(){return this.frames.overloaded}get scale(){return this.frames.scale}get atMinimum(){return this.frames.atMinimum}},Mt=null,Bo=!1;function ei(){if(Mt||Bo)return Mt;try{Mt=new na}catch{Bo=!0}return Mt}var Wo=new WeakSet,ti=(e,t)=>{t?Wo.add(e):Wo.delete(e)};var xl=/^[\\u1100-\\u115f\\u2e80-\\ua4cf\\uac00-\\ud7a3\\uf900-\\ufaff\\ufe30-\\ufe4f\\uff00-\\uff60\\uffe0-\\uffe6]|^[\\u{20000}-\\u{3fffd}]/u,$r=e=>xl.test(e),ri='"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", YuGothic, "Noto Sans JP", "Noto Sans CJK JP", Meiryo, sans-serif';var Kr=class{constructor(t,n,a){this.previous=null;this.peak=0;this.width=t,this.height=n,this.span=a??Math.min(t,n);let i=t*n;this.pixels=new Uint8Array(i*4),this.signal=new Float32Array(i),this.offsetX=new Float32Array(i),this.offsetY=new Float32Array(i),this.driftX=new Float32Array(i),this.driftY=new Float32Array(i),this.u=new Float32Array(i),this.v=new Float32Array(i),this.ink=new Float32Array(i),this.a=new Float32Array(i),this.b=new Float32Array(i),this.c=new Float32Array(i),this.pressure=new Float32Array(i),this.pressureNext=new Float32Array(i),this.divergence=new Float32Array(i),this.curl=new Float32Array(i)}get active(){return this.peak>2e-4}clear(){for(let t of[this.u,this.v,this.ink,this.a,this.b,this.c,this.pressure,this.pressureNext,this.divergence,this.curl,this.signal,this.pixels,this.offsetX,this.offsetY,this.driftX,this.driftY])t.fill(0);this.previous=null,this.peak=0}leave(){this.previous=null}move(t,n,a,i=performance.now()){if(!Number.isFinite(t+n+a+i))return;t=Math.max(0,Math.min(1,t)),n=Math.max(0,Math.min(1,n)),a=Math.max(.1,Math.min(1,a));let l=this.previous;if(this.previous={x:t,y:n,time:i},!l)return;let c=(t-l.x)*(this.width-1),o=(n-l.y)*(this.height-1),f=Math.hypot(c,o);if(f<.001)return;let d=this.span,m=i>l.time?Math.max(1/240,(i-l.time)/1e3):1/60,g=Math.min(12,f/d/m),w=1-Math.exp(-g/2.2),T=d*(.022+a*.075)*(.65+w*.95),M=Math.min(128,Math.max(1,Math.ceil(f/(T*.4)))),x=f/T*(.32+w*.22)/M,F=c/f,v=o/f,A=-v,r=F,E=f*(2+w*18)/M;for(let L=0;L<M;L++){let Y=(L+.5)/M,Q=(l.x+(t-l.x)*Y)*(this.width-1),re=(l.y+(n-l.y)*Y)*(this.height-1),J=Math.max(1,Math.floor(Q-T*3)),ne=Math.min(this.width-2,Math.ceil(Q+T*3)),_=Math.max(1,Math.floor(re-T*3)),ee=Math.min(this.height-2,Math.ceil(re+T*3));for(let K=_;K<=ee;K++)for(let S=J;S<=ne;S++){let D=((S-Q)*F+(K-re)*v)/T,Z=((S-Q)*A+(K-re)*r)/T,q=Math.exp(-D*D*.65-Z*Z*1.7),C=K*this.width+S;this.ink[C]=1-(1-this.ink[C])*Math.exp(-q*x);let U=1-Z*Z*.55,H=D*Z*.7;this.u[C]=Math.max(-80,Math.min(80,this.u[C]+(F*U+A*H)*q*E)),this.v[C]=Math.max(-80,Math.min(80,this.v[C]+(v*U+r*H)*q*E))}}this.peak=1}read(t,n,a){n=Math.max(.5,Math.min(this.width-1.5,n)),a=Math.max(.5,Math.min(this.height-1.5,a));let i=n|0,l=a|0,c=n-i,o=a-l,f=l*this.width+i;return(t[f]*(1-c)+t[f+1]*c)*(1-o)+(t[f+this.width]*(1-c)+t[f+this.width+1]*c)*o}sample(t,n){return this.read(this.signal,t*(this.width-1),n*(this.height-1))}displacement(t,n,a){a[0]=this.read(this.offsetX,t*(this.width-1),n*(this.height-1)),a[1]=this.read(this.offsetY,t*(this.width-1),n*(this.height-1))}step(t){if(!this.active||!Number.isFinite(t))return;let n=Math.max(0,Math.min(.05,t)),a=this.width,i=this.height;for(;n>1e-7;){let l=Math.min(.016666666666666666,n);n-=l;let c=Math.exp(-1.9*l),o=Math.exp(-3.2*l);for(let d=1;d<i-1;d++)for(let m=1;m<a-1;m++){let g=d*a+m,w=Math.max(.5,Math.min(a-1.5,m-this.u[g]*l)),T=Math.max(.5,Math.min(i-1.5,d-this.v[g]*l)),M=w|0,x=T|0,F=w-M,v=T-x,A=x*a+M,r=(1-F)*(1-v),E=F*(1-v),L=(1-F)*v,Y=F*v;this.a[g]=(this.u[A]*r+this.u[A+1]*E+this.u[A+a]*L+this.u[A+a+1]*Y)*c,this.b[g]=(this.v[A]*r+this.v[A+1]*E+this.v[A+a]*L+this.v[A+a+1]*Y)*c,this.c[g]=(this.ink[A]*r+this.ink[A+1]*E+this.ink[A+a]*L+this.ink[A+a+1]*Y)*o}[this.u,this.a]=[this.a,this.u],[this.v,this.b]=[this.b,this.v],[this.ink,this.c]=[this.c,this.ink];for(let d=1;d<i-1;d++)for(let m=1;m<a-1;m++){let g=d*a+m;this.curl[g]=(this.v[g+1]-this.v[g-1]-this.u[g+a]+this.u[g-a])*.5}for(let d=1;d<i-1;d++)for(let m=1;m<a-1;m++){let g=d*a+m,w=Math.abs(this.curl[g+1])-Math.abs(this.curl[g-1]),T=Math.abs(this.curl[g+a])-Math.abs(this.curl[g-a]),M=Math.hypot(w,T)+1e-4,x=this.curl[g]*l*10,F=Math.hypot(this.u[g],this.v[g]);this.u[g]+=T/M*x,this.v[g]-=w/M*x;let v=Math.min(1,F/(Math.hypot(this.u[g],this.v[g])+1e-6));this.u[g]*=v,this.v[g]*=v,this.divergence[g]=-.5*(this.u[g+1]-this.u[g-1]+this.v[g+a]-this.v[g-a])}this.pressure.fill(0);for(let d=0;d<4;d++){for(let m=1;m<i-1;m++)for(let g=1;g<a-1;g++){let w=m*a+g;this.pressureNext[w]=(this.divergence[w]+this.pressure[w-1]+this.pressure[w+1]+this.pressure[w-a]+this.pressure[w+a])*.25}[this.pressure,this.pressureNext]=[this.pressureNext,this.pressure]}let f=0;for(let d=1;d<i-1;d++)for(let m=1;m<a-1;m++){let g=d*a+m;this.u[g]=Math.max(-80,Math.min(80,this.u[g]-(this.pressure[g+1]-this.pressure[g-1])*.5)),this.v[g]=Math.max(-80,Math.min(80,this.v[g]-(this.pressure[g+a]-this.pressure[g-a])*.5)),this.driftX[g]+=(this.u[g]*3.6-58*this.offsetX[g]-12*this.driftX[g])*l,this.driftY[g]+=(this.v[g]*3.6-58*this.offsetY[g]-12*this.driftY[g])*l,this.offsetX[g]=Math.max(-2,Math.min(2,this.offsetX[g]+this.driftX[g]*l)),this.offsetY[g]=Math.max(-2,Math.min(2,this.offsetY[g]+this.driftY[g]*l)),this.signal[g]=1-Math.exp(-Math.hypot(this.u[g],this.v[g])*.06-this.ink[g]*.16),f=Math.max(f,this.signal[g])}this.peak=f}if(!this.active){this.clear();return}for(let l=0;l<this.ink.length;l++){let c=Math.round(Math.min(1,this.signal[l])*65535);this.pixels[l*4]=c>>>8,this.pixels[l*4+1]=c&255,this.pixels[l*4+2]=Math.round(128+this.offsetX[l]*63.5),this.pixels[l*4+3]=Math.round(128+this.offsetY[l]*63.5)}}};var ni=e=>e==="subject"||e==="outside"?e:"all";function ye(e,t,n,a,i){if(!(i<1))for(let l=0;l<2;l++){for(let c=0;c<a;c++){let o=0,f=c*n;for(let d=-i;d<=i;d++)o+=e[f+Math.max(0,Math.min(n-1,d))];for(let d=0;d<n;d++)t[f+d]=o/(i*2+1),o+=e[f+Math.min(n-1,d+i+1)]-e[f+Math.max(0,d-i)]}for(let c=0;c<n;c++){let o=0;for(let f=-i;f<=i;f++)o+=t[Math.max(0,Math.min(a-1,f))*n+c];for(let f=0;f<a;f++)e[f*n+c]=o/(i*2+1),o+=t[Math.min(a-1,f+i+1)*n+c]-t[Math.max(0,f-i)*n+c]}}}var ua=new Float32Array(0);function Yr(e,t,n,a,i){let l=t*n,c=i&&i.width===t&&i.height===n?i:{width:t,height:n,subject:new Float32Array(l),depth:new Float32Array(l),key:"none"},{subject:o,depth:f}=c,d=0;for(let M=0;M<l;M++)e[M*4+3]<250&&d++;let m=M=>(e[M*4]*.2126+e[M*4+1]*.7152+e[M*4+2]*.0722)/255,g="none",w=0;if(d>l*.01)g="alpha";else if(a)g="mask";else{let M=0,x=0,F=0,v=Math.max(1,Math.round(Math.min(t,n)*.03));for(let r=0;r<n;r++)for(let E=0;E<t;E++){if(E>=v&&r>=v&&E<t-v&&r<n-v)continue;let L=m(r*t+E);M+=L,x+=L*L,F++}w=M/Math.max(1,F),Math.sqrt(Math.max(0,x/Math.max(1,F)-w*w))<.07&&(g="ground")}for(let M=0;M<l;M++){let x=e[M*4+3]/255,F=m(M),v=1;if(g==="alpha")v=x;else if(g==="ground"){let A=Math.max(0,Math.min(1,(Math.abs(F-w)-.035)/.12));v=A*A*(3-2*A)}o[M]=v*(a?Math.max(0,Math.min(1,a[M])):1),f[M]=F*x}c.key=g,ua.length<l&&(ua=new Float32Array(l));let T=ua;return ye(o,T,t,n,Math.max(1,Math.round(Math.min(t,n)*.02))),ye(f,T,t,n,Math.max(1,Math.round(Math.min(t,n)*.035))),c}var Gt=11,Be=e=>Math.max(0,Math.min(1,e)),G=(e,t,n)=>{let a=Be((n-e)/(t-e));return a*a*(3-2*a)};function je(e,t,n=256){let a=0;for(let o=0;o<e.length;o++)e[o]>a&&(a=e[o]);if(a<=0)return 0;let i=new Uint32Array(n);for(let o=0;o<e.length;o++)i[Math.min(n-1,Math.floor(Math.max(0,e[o])/a*n))]++;let l=0,c=e.length*t;for(let o=0;o<n;o++)if(l+=i[o],l>=c)return(o+1)/n*a;return a}var vl=12e3,da=class{constructor(t){this.n=t;this.arrays=[];this.next=0}take(t){this.next===this.arrays.length&&this.arrays.push(new Float32Array(this.n));let n=this.arrays[this.next++];return t?n.set(t):n.fill(0),n}reset(){this.next=0}},Qr=null;function yl(e,t,n,a,i,l,c,o,f){let d=i*l,m=f.take(),g=S=>(Dt(S,m,i,l,c),S),w=(S,D)=>{let Z=f.take();for(let q=0;q<d;q++)Z[q]=S[q]*D[q];return g(Z)},T=g(f.take(t)),M=g(f.take(n)),x=g(f.take(a)),F=g(f.take(e)),v=w(t,t),A=w(t,n),r=w(t,a),E=w(n,n),L=w(n,a),Y=w(a,a),Q=w(t,e),re=w(n,e),J=w(a,e),ne=f.take(),_=f.take(),ee=f.take(),K=f.take();for(let S=0;S<d;S++){let D=Q[S]-T[S]*F[S],Z=re[S]-M[S]*F[S],q=J[S]-x[S]*F[S],C=v[S]-T[S]*T[S]+o,U=A[S]-T[S]*M[S],H=r[S]-T[S]*x[S],te=E[S]-M[S]*M[S]+o,le=L[S]-M[S]*x[S],pe=Y[S]-x[S]*x[S]+o,De=te*pe-le*le,V=H*le-U*pe,ae=U*le-H*te,Re=C*pe-H*H,Me=U*H-C*le,xe=C*te-U*U,Le=C*De+U*V+H*ae,Te=Math.abs(Le)>1e-12?1/Le:0;ne[S]=(De*D+V*Z+ae*q)*Te,_[S]=(V*D+Re*Z+Me*q)*Te,ee[S]=(ae*D+Me*Z+xe*q)*Te,K[S]=F[S]-ne[S]*T[S]-_[S]*M[S]-ee[S]*x[S]}g(ne),g(_),g(ee),g(K);for(let S=0;S<d;S++)e[S]=ne[S]*t[S]+_[S]*n[S]+ee[S]*a[S]+K[S]}function Dt(e,t,n,a,i){let l=i*2+1;for(let c=0;c<a;c++){let o=c*n,f=0;for(let d=-i;d<=i;d++)f+=e[o+Math.max(0,Math.min(n-1,d))];for(let d=0;d<n;d++)t[o+d]=f/l,f+=e[o+Math.min(n-1,d+i+1)]-e[o+Math.max(0,d-i)]}for(let c=0;c<n;c++){let o=0;for(let f=-i;f<=i;f++)o+=t[Math.max(0,Math.min(a-1,f))*n+c];for(let f=0;f<a;f++)e[f*n+c]=o/l,o+=t[Math.min(a-1,f+i+1)*n+c]-t[Math.max(0,f-i)*n+c]}}function fa(e,t,n,a,i,l,c){let o=n*a,f=c.take(),d=c.take(t),m=c.take(e),g=c.take(),w=c.take();for(let T=0;T<o;T++)g[T]=t[T]*t[T],w[T]=t[T]*e[T];Dt(d,f,n,a,i),Dt(m,f,n,a,i),Dt(g,f,n,a,i),Dt(w,f,n,a,i);for(let T=0;T<o;T++){let M=(w[T]-d[T]*m[T])/(g[T]-d[T]*d[T]+l);g[T]=M,w[T]=m[T]-M*d[T]}Dt(g,f,n,a,i),Dt(w,f,n,a,i);for(let T=0;T<o;T++)e[T]=g[T]*t[T]+w[T]}function ha(e,t,n,a,i,l=2){for(let c=0;c<l;c++){for(let o=0;o<a;o++)for(let f=0;f<n;f++){let d=o*n+f,m=e[d];f>0&&(m=Math.max(m,Math.min(t[d],e[d-1]*i))),o>0&&(m=Math.max(m,Math.min(t[d],e[d-n]*i),f>0?Math.min(t[d],e[d-n-1]*i):0,f<n-1?Math.min(t[d],e[d-n+1]*i):0)),e[d]=m}for(let o=a-1;o>=0;o--)for(let f=n-1;f>=0;f--){let d=o*n+f,m=e[d];f<n-1&&(m=Math.max(m,Math.min(t[d],e[d+1]*i))),o<a-1&&(m=Math.max(m,Math.min(t[d],e[d+n]*i),f>0?Math.min(t[d],e[d+n-1]*i):0,f<n-1?Math.min(t[d],e[d+n+1]*i):0)),e[d]=m}}}function Zr(e,t,n,a,i){for(let l=0;l<a;l++)for(let c=0;c<n;c++){let o=1;for(let f=Math.max(0,c-i);f<=Math.min(n-1,c+i);f++)o=Math.min(o,e[l*n+f]);t[l*n+c]=o}for(let l=0;l<a;l++)for(let c=0;c<n;c++){let o=1;for(let f=Math.max(0,l-i);f<=Math.min(a-1,l+i);f++)o=Math.min(o,t[f*n+c]);e[l*n+c]=o}}function El(e,t,n,a,i){let l=n*a,c=Math.min(n,a),o=i.take(),f=i.take(),d=i.take(),m=i.take(),g=i.take();for(let h=0;h<l;h++){let P=e[h*4+3]/255;g[h]=P,o[h]=t[h*4]/255*P,f[h]=t[h*4+1]/255*P,d[h]=t[h*4+2]/255*P,m[h]=(e[h*4]*.299+e[h*4+1]*.587+e[h*4+2]*.114)/255*P}let w=i.take(),T=(h,P)=>{let R=i.take(h);return ye(R,w,n,a,P),R},M=Math.max(2,Math.round(c*.04)),x=Math.max(M+2,Math.round(c*.12)),F=Math.max(2,Math.round(c*.05)),v=T(m,1),A=T(m,M),r=T(m,x),E=i.take(),L=i.take(),Y=i.take(),Q=i.take(),re=i.take();for(let h=0;h<a;h++)for(let P=0;P<n;P++){let R=h*n+P;E[R]=Math.abs(m[R]-v[R]),L[R]=Math.abs(v[R]-A[R]),Y[R]=Math.abs(A[R]-r[R]),Q[R]=Math.abs(m[h*n+Math.min(n-1,P+1)]-m[h*n+Math.max(0,P-1)]),re[R]=Math.abs(m[Math.min(a-1,h+1)*n+P]-m[Math.max(0,h-1)*n+P])}ye(E,w,n,a,F),ye(L,w,n,a,F),ye(Y,w,n,a,F),ye(Q,w,n,a,2),ye(re,w,n,a,2);let J=Math.max(.01,je(E,.9)+je(L,.9)),ne=T(o,1),_=T(f,1),ee=T(d,1),K=i.take(),S=i.take(),D=i.take(),Z=0;for(let h=0;h<l;h++){let P=ne[h],R=_[h],ge=ee[h],ce=Math.max(P,R,ge),j=Math.min(P,R,ge),ue=ce-j;D[h]=ce,S[h]=ce>.001?ue/ce:0,Z+=ue;let me=0;ue>1e-4&&(me=ce===P?((R-ge)/ue+6)%6:ce===R?(ge-P)/ue+2:(P-R)/ue+4),K[h]=me*60}let q=G(.02,.07,Z/l),C=Math.max(2,Math.round(a*.06)),U=new Float32Array(a);for(let h=0;h<a;h++){let P=0;for(let R=0;R<n;R++)P+=E[h*n+R]+L[h*n+R];U[h]=P/n}let H=.5,te=0;for(let h=Math.max(C,Math.round(a*.12));h<=Math.min(a-C,Math.round(a*.88));h++){let P=0,R=0,ge=0,ce=0;for(let X=0;X<n;X++){let ie=0,fe=0,Ce=0,Se=0,Ge=0,Ie=0;for(let _e=1;_e<=C;_e++){let lt=(h-_e)*n+X,Ze=(h+_e-1)*n+X;ie+=ne[lt],fe+=_[lt],Ce+=ee[lt],Se+=ne[Ze],Ge+=_[Ze],Ie+=ee[Ze]}let ze=(Math.abs(ie-Se)+Math.abs(fe-Ge)+Math.abs(Ce-Ie))/C;P+=ze,R+=ze>.12?1:0}let j=Math.max(2,Math.round(a*.15)),ue=Math.max(0,h-j),me=Math.min(a,h+j);for(let X=ue;X<h;X++)ge+=U[X];for(let X=h;X<me;X++)ce+=U[X];ge/=h-ue,ce/=me-h;let I=G(-.05,.3,(ce-ge)/(ce+ge+1e-4)),B=G(.08,.35,P/n)*(R/n)*I;B>te&&(te=B,H=h/a)}let le=G(.15,.45,te),pe=i.take(),De=i.take(),V=i.take();for(let h=0;h<l;h++)pe[h]=Math.min(o[h],f[h],d[h]);Zr(pe,w,n,a,1),ye(pe,w,n,a,M);for(let h=0;h<l;h++)De[h]=L[h]+Y[h];let ae=0,Re=0,Me=0;for(let h=0;h<l;h++)ae+=ne[h],Re+=_[h],Me+=ee[h];ae/=l,Re/=l,Me/=l;let xe=T(ne,M),Le=T(_,M),Te=T(ee,M),$e=T(ne,x),tt=T(_,x),O=T(ee,x);for(let h=0;h<l;h++){let P=Math.hypot(xe[h]-ae,Le[h]-Re,Te[h]-Me),R=Math.hypot(xe[h]-$e[h],Le[h]-tt[h],Te[h]-O[h]);V[h]=(P+R*1.5)*(.4+.6*S[h]*q+.4*(1-q))}let ve=i.take(),He=i.take(),Ke=i.take(),de=i.take(),Ye=i.take(),Xe=i.take(),Fe=i.take(),rt=i.take(),ht=i.take(),nt=i.take();for(let h=0;h<a;h++)for(let P=0;P<n;P++)nt[h*n+P]=Math.abs(m[Math.min(a-1,h+1)*n+P]-m[Math.max(0,h-1)*n+P]);ye(nt,w,n,a,1);for(let h=0;h<a;h++)for(let P=0;P<n;P++){let R=h*n+P,ge=(h+.5)/a,ce=K[R],j=S[R]*q,ue=D[R],me=E[R]+L[R],I=G(175,200,ce)*(1-G(250,275,ce))*G(.08,.25,j),B=(1-G(45,65,ce)+G(290,330,ce))*G(.2,.45,j)*G(.3,.55,ue),X=(1-G(.15,.35,j))*G(.45,.7,ue)*le,ie=(1-G(.08,.2,ue))*le,fe=le>.3?1-G(H,H+.1,ge):1-G(.4,.8,ge),Ce=1-G(.02,.06,me),Se=1-G(.03,.09,me);He[R]=Math.max(I*Ce,ie*.7*(1-G(.008,.025,me)),B*Se*.9)*fe,Ke[R]=Math.max(He[R],X*Ce*fe),ve[R]=h===0?He[R]:0,de[R]=G(150,172,ce)*(1-G(232,250,ce))*G(.25,.45,j),Fe[R]=G(1.3,2.2,(Q[R]+.004)/(re[R]+.004))*G(.35,.55,v[R])*(1-G(.1,.18,S[R]*q))*G(.025,.07,me)*G(.025,.045,nt[R]);let Ge=1-G(.18,.4,j),Ie=G(.55,.8,ue)*G(.05,.12,me);Ye[R]=Math.max(de[R],Ge*.85,Ie*.8)}ha(ve,He,n,a,.995,1),ha(ve,Ke,n,a,.8,1);let dt=0;for(let h=0;h<l;h++)dt+=ve[h];let at=dt>l*.04&&le>.3;if(at)for(let h=0;h<a;h++)for(let P=0;P<n;P++)de[h*n+P]*=G(H,H+.05,(h+.5)/a);if(at){let h=i.take(),P=i.take(),R=i.take();for(let I=0;I<l;I++)h[I]=xe[I]*.299+Le[I]*.587+Te[I]*.114;for(let I=0;I<a;I++)for(let B=0;B<n;B++)P[I*n+B]=v[Math.min(a-1,I+1)*n+B]-v[Math.max(0,I-1)*n+B];let ge=new Uint8Array(l);for(let I=1;I<a-1;I++)for(let B=0;B<n;B++){let X=Math.abs(P[I*n+B]),ie=X>.03;for(let fe=-3;fe<=3&&ie;fe++)fe&&I+fe>=0&&I+fe<a&&Math.abs(P[(I+fe)*n+B])>X&&(ie=!1);ge[I*n+B]=ie?1:0}let ce=(I,B,X,ie=!0)=>{let fe=xe[B]+Le[B]+Te[B]+.05,Ce=xe[X]+Le[X]+Te[X]+.05,Se=Math.abs(xe[B]/fe-xe[X]/Ce)+Math.abs(Le[B]/fe-Le[X]/Ce)+Math.abs(Te[B]/fe-Te[X]/Ce),Ge=Math.min(Math.abs(K[B]-K[X]),360-Math.abs(K[B]-K[X])),Ie=Math.max(1-G(.1,.25,Se),(1-G(15,35,Ge))*G(.15,.3,Math.min(S[B],S[X]))),ze=Math.max(G(2,3,(re[B]+.004)/(Q[B]+.004))*G(.015,.04,E[B]+L[B])*G(.4,.55,E[B]/(E[B]+L[B]+1e-4)),1-G(.12,.25,h[B]));return Ie*(ie?ze:1)*(1-G(h[X]*.82+.02,h[X]*1.02+.05,h[B]))},j=0,ue=0;for(let I=Math.max(3,Math.round(a*Math.max(.25,H)));I<Math.round(a*.88);I++){let B=0;for(let ie=0;ie<n;ie++)(ge[(I-1)*n+ie]||ge[I*n+ie]||ge[(I+1)*n+ie])&&B++;if(B<n*.5)continue;let X=0;for(let ie=I+1;ie<Math.min(a,2*I);ie++)for(let fe=0;fe<n;fe++)X+=ce(I,ie*n+fe,(2*I-ie)*n+fe);X>ue&&(ue=X,j=I)}let me=G(.05,.1,ue/l);if(me>0)for(let I=j+1;I<Math.min(a,2*j);I++)for(let B=0;B<n;B++){let X=I*n+B;rt[X]=ce(j,X,(2*j-I)*n+B)*me,ht[X]=ce(j,X,(2*j-I)*n+B,!1)*me,R[X]=rt[X]}ye(R,w,n,a,1);for(let I=0;I<l;I++)rt[I]=Math.max(rt[I],R[I]),de[I]=Math.max(de[I],rt[I])}let ot=T(de,x);for(let h=0;h<l;h++)de[h]*=G(.15,.35,ot[h]);let Tr=T(de,M);for(let h=0;h<l;h++){de[h]*=1-He[h]*.8;let P=Math.min(Math.abs(K[h]-200),360-Math.abs(K[h]-200));Xe[h]=G(.28,.45,S[h]*q)*G(55,80,P)*(1-G(.3,.6,ht[h]))}let Fr=T(Xe,M);for(let h=0;h<l;h++)Xe[h]=Math.max(Xe[h]*(1-(1-G(.15,.3,Fr[h]))*G(.55,.7,D[h])*G(.5,.65,S[h])),1-g[h]),Ye[h]=Math.min(Math.max(Ye[h],ht[h]*.9),Math.max(de[h],G(.25,.6,Tr[h])))*(1-ve[h])*(1-Xe[h]);ha(de,Ye,n,a,.97);let Bt=i.take(Fe),it=Math.max(2,Math.round(a*.12));for(let h=0;h<n;h++){let P=0;for(let R=-it;R<=it;R++)P+=Fe[Math.max(0,Math.min(a-1,R))*n+h];for(let R=0;R<a;R++)Bt[R*n+h]=P/(it*2+1),P+=Fe[Math.min(a-1,R+it+1)*n+h]-Fe[Math.max(0,R-it)*n+h]}ye(Bt,w,n,a,1);for(let h=0;h<l;h++)Fe[h]=G(.2,.45,Bt[h])*G(.2,.5,Fe[h]+Bt[h]*.5)*(1-ve[h]);fa(ve,m,n,a,Math.max(2,Math.round(c*.04)),.002,i),fa(de,m,n,a,Math.max(2,Math.round(c*.04)),.002,i),fa(Fe,m,n,a,Math.max(2,Math.round(c*.03)),.002,i),ye(Xe,w,n,a,1);for(let h=0;h<l;h++)ve[h]=G(.3,.7,ve[h])*g[h],Fe[h]=G(.3,.7,Fe[h])*g[h]*(1-ve[h]),de[h]=G(.3,.7,de[h])*(1-ve[h])*(1-Fe[h])*(1-G(.15,.4,Xe[h]));Zr(ve,w,n,a,2),Zr(de,w,n,a,2),Zr(Fe,w,n,a,1),ye(ve,w,n,a,1),ye(de,w,n,a,1),ye(Fe,w,n,a,1);let Qe=1/Math.max(.02,je(V,.97)),tr=1/Math.max(.01,je(De,.9)),mt=je(pe,.97),se=je(pe,.1),Ve=G(.06,.25,mt-se),ke=i.take();for(let h=0;h<a;h++)for(let P=0;P<n;P++){let R=h*n+P,ge=(P+.5)/n,ce=(h+.5)/a,j=Math.max(ve[R],de[R]),ue=E[R]+L[R]+Y[R],me=Be(((E[R]+L[R]*.6)/(ue+.004)-.25)/.55)*.6+Be((E[R]+L[R])/J)*.4,I=G(.04,.35,ue/J)*(1-j),B=Be((pe[R]-se)/Math.max(.05,mt-se))*.55+(1-Be(De[R]*tr))*.25+Be((ee[R]-ne[R])*2+.3)*.2*q,X=Ve*G(.12,.35,A[R])*(.4+.6*le),ie=ce<H?.45:.45+.55*G(0,1,(ce-H)/Math.max(.15,1-H)),fe=le*ie+(1-le)*(.5+(ce-.5)*.4),Ce=E[R]/(E[R]+L[R]+1e-4),Se=G(.2,.7,(E[R]+L[R])/J)*(.35+.65*le)*(1-j),Ge=1-Be(Math.hypot((ge-.5)*1.2,ce-.52)*1.5),Ie=Be(V[R]*Qe)*(.55+.45*Ge),ze=.3*I,_e=.25*X,lt=.12+.45*le,Ze=.12*Se,st=.35*(1-.4*le)*(1-j);ke[R]=(ze*me+_e*(1-B)+lt*fe+Ze*Be(1.6-Ce*1.6)+st*Ie+.08*.5)/(ze+_e+lt+Ze+st+.08)*(1-.85*ve[R])*(1-.45*de[R]*(1-le))}let At=Yr(e,n,a);if(At.key!=="none")for(let h=0;h<l;h++)ke[h]=At.subject[h]*.7+ke[h]*.3;return ye(ke,w,n,a,Math.max(1,Math.round(c*.03))),yl(ke,ne,_,ee,n,a,Math.max(2,Math.round(c*.07)),.004,i),{depth:ke,water:de,sky:ve,falls:Fe}}function Jr(e,t,n,a,i,l,c){if(t===l&&n===c)return e[i*l+a];let o=Math.max(0,Math.min(t-1,(a+.5)*t/l-.5)),f=Math.max(0,Math.min(n-1,(i+.5)*n/c-.5)),d=Math.min(t-2,Math.floor(o)),m=Math.min(n-2,Math.floor(f)),g=o-d,w=f-m;if(d<0||m<0)return e[Math.round(f)*t+Math.round(o)];let T=m*t+d,M=T+t;return(e[T]*(1-g)+e[T+1]*g)*(1-w)+(e[M]*(1-g)+e[M+1]*g)*w}function ai(e,t,n,a,i=e){let l=t*n,c=a?.length===l*Gt?a:new Float32Array(l*Gt);if(!l)return c;let o=Math.min(t,n),f=new Float32Array(l),d=new Float32Array(l),m=new Float32Array(l),g=new Float32Array(l),w=new Float32Array(l),T=new Float32Array(l);for(let C=0;C<l;C++){let U=e[C*4+3]/255;f[C]=(e[C*4]*.299+e[C*4+1]*.587+e[C*4+2]*.114)/255*U}d.set(f),ye(d,T,t,n,Math.max(1,Math.round(o*.012))),m.set(f),ye(m,T,t,n,Math.max(1,Math.round(o*.03)));for(let C=0;C<l;C++){g[C]=Math.abs(f[C]-d[C]);let U=Math.max(0,f[C]-.55)/.45;w[C]=U*U}ye(g,T,t,n,Math.max(1,Math.round(o*.02)));let M=1/Math.max(.02,je(g,.95));ye(w,T,t,n,Math.max(1,Math.round(o*.05)));let x=1/Math.max(.03,je(w,.98)),F=Math.max(1,Math.ceil(Math.sqrt(l/vl))),v=Math.max(1,Math.floor(t/F)),A=Math.max(1,Math.floor(n/F)),r=v*A,E=e,L=i;if(F>1){let C=new Uint8ClampedArray(r*4),U=i===e?C:new Uint8ClampedArray(r*4);for(let H=0;H<A;H++)for(let te=0;te<v;te++){let le=[0,0,0,0,0,0,0];for(let V=H*F;V<(H+1)*F;V++)for(let ae=te*F;ae<(te+1)*F;ae++){let Re=(V*t+ae)*4;for(let Me=0;Me<4;Me++)le[Me]+=e[Re+Me];if(U!==C)for(let Me=0;Me<3;Me++)le[4+Me]+=i[Re+Me]}let pe=(H*v+te)*4,De=F*F;for(let V=0;V<4;V++)C[pe+V]=le[V]/De;if(U!==C){for(let V=0;V<3;V++)U[pe+V]=le[4+V]/De;U[pe+3]=C[pe+3]}}E=C,L=U}Qr?.n!==r&&(Qr=new da(r)),Qr.reset();let{depth:Y,water:Q,sky:re,falls:J}=El(E,L,v,A,Qr),ne=je(Y,.03),_=je(Y,.97),ee=Math.max(.05,_-ne),K=0,S=0,D=0,Z=new Float32Array(l);for(let C=0;C<n;C++)for(let U=0;U<t;U++){let H=C*t+U,te=H*Gt,le=Be((Jr(Y,v,A,U,C,t,n)-ne)/ee);c[te+1]=le,c[te+8]=Be(Jr(Q,v,A,U,C,t,n)),c[te+9]=Be(Jr(re,v,A,U,C,t,n)),c[te+10]=Be(Jr(J,v,A,U,C,t,n));let pe=le*le*le*(.25+f[H]);K+=(U+.5)/t*pe,S+=(C+.5)/n*pe,D+=pe,Z[H]=Math.hypot(m[C*t+Math.min(t-1,U+1)]-m[C*t+Math.max(0,U-1)],m[Math.min(n-1,C+1)*t+U]-m[Math.max(0,C-1)*t+U])}K=D>0?Math.max(.3,Math.min(.7,K/D)):.5,S=D>0?Math.max(.3,Math.min(.7,S/D)):.5;let q=1/Math.max(.004,je(Z,.97));for(let C=0;C<n;C++)for(let U=0;U<t;U++){let H=C*t+U,te=H*Gt,le=(m[C*t+Math.min(t-1,U+1)]-m[C*t+Math.max(0,U-1)])*q,pe=(m[Math.min(n-1,C+1)*t+U]-m[Math.max(0,C-1)*t+U])*q;c[te]=m[H],c[te+2]=Math.min(1,w[H]*x),c[te+3]=Math.min(1,g[H]*M),c[te+4]=Math.max(-1,Math.min(1,-le)),c[te+5]=Math.max(-1,Math.min(1,-pe)),c[te+6]=K,c[te+7]=S}return c}var Zt=(e,t,n)=>{let a=Math.max(0,Math.min(1,(n-e)/(t-e)));return a*a*(3-2*a)},en=class{constructor(t,n){this.base=40;this.mass=0;this.calm=0;this.drift=[0,0];this.fade=3;this.age=0;this.peak=0;this.front=0;this.live=!1;this.bins=new Uint32Array(64);this.spare=new Float32Array(0);this.cols=Math.max(3,t|0),this.rows=Math.max(3,n|0);let a=this.cols*this.rows;this.h=new Float32Array(a),this.p=new Float32Array(a),this.speed=new Float32Array(a).fill(1),this.damp=new Float32Array(a).fill(1),this.wall=new Float32Array(a),this.trace=new Float32Array(a)}clear(){this.h.fill(0),this.p.fill(0),this.trace.fill(0),this.live=!1,this.peak=0}drop(t,n,a=1,i=3){let{cols:l,rows:c,h:o,p:f}=this,d=Math.max(1,i),m=Math.ceil(d*3);for(let g=Math.max(1,Math.floor(n-m));g<Math.min(c-1,Math.ceil(n+m));g++)for(let w=Math.max(1,Math.floor(t-m));w<Math.min(l-1,Math.ceil(t+m));w++){let T=w-t,M=g-n,x=(T*T+M*M)/(d*d),F=a*(1-x)*Math.exp(-x),v=g*l+w;o[v]+=F,f[v]+=F}this.age=0,this.live=!0,this.peak=Math.max(this.peak,a),this.front=Math.max(this.front,a)}step(t,n=1){if(!this.live||!(t>0))return this.live;t=Math.min(.05,t),this.age+=t;let{cols:a,rows:i,speed:l,damp:c,wall:o,trace:f}=this,d=Math.max(0,this.base*n),m=0;for(let _=0;_<l.length;_++)l[_]>m&&(m=l[_]);let g=Math.max(1,Math.min(8,Math.ceil(d*t*Math.sqrt(m)/.6))),w=this.calm,T=t/g,M=d*T*(d*T),x=this.mass*T*T,F=this.h,v=this.p;for(let _=0;_<g;_++){for(let K=1;K<i-1;K++)for(let S=1,D=K*a+1;S<a-1;S++,D++){let Z=F[D],q=F[D-1]+F[D+1]+F[D-a]+F[D+a]-4*Z,C=f[D],U=C>.02?Math.max(0,1-Math.abs(Z)/C):0,H=w*U*U*T,te=1-Math.min(.5,c[D]*T+H);v[D]=(Z+(Z-v[D])*te+M*l[D]*q-x*Z)*(1-o[D])*(1-Math.min(.5,H*.5))}let ee=F;F=v,v=ee}this.h=F,this.p=v;let A=this.drift[0]*t,r=this.drift[1]*t;(A||r)&&(this.carry(F,A,r),this.carry(v,A,r));for(let _=0;_<a;_++)F[_]=F[a+_]*.5,F[(i-1)*a+_]=F[(i-2)*a+_]*.5;for(let _=0;_<i;_++)F[_*a]=F[_*a+1]*.5,F[_*a+a-1]=F[_*a+a-2]*.5;let E=Math.exp(-t*this.fade),L=0;for(let _=0;_<F.length;_++){let ee=Math.abs(F[_]);ee>L&&(L=ee);let K=f[_]*E;f[_]=ee>=K?ee:K<1e-4?0:K}this.peak=L;let Y=this.bins.fill(0),Q=L*.05,re=0;for(let _=0;_<F.length;_++)F[_]>Q&&(Y[Math.min(63,F[_]/L*64|0)]++,re++);let J=0,ne=63;for(;ne>0&&(J+=Y[ne],!(J>=re*.08));ne--);return this.front=Math.max(L*.15,(ne+1)/64*L),L<.004?(this.clear(),!1):!0}carry(t,n,a){let{cols:i,rows:l}=this;this.spare.length!==t.length&&(this.spare=new Float32Array(t.length));let c=this.spare;for(let o=0,f=0;o<l;o++){let d=Math.min(l-1.001,Math.max(0,o-a)),m=d|0,g=d-m;for(let w=0;w<i;w++,f++){let T=Math.min(i-1.001,Math.max(0,w-n)),M=T|0,x=T-M,F=m*i+M;c[f]=(t[F]*(1-x)+t[F+1]*x)*(1-g)+(t[F+i]*(1-x)+t[F+i+1]*x)*g}}t.set(c)}slope(t,n){let{h:a,cols:i}=this,l=a.length;return n[0]=(a[Math.min(l-1,t+1)]-a[Math.max(0,t-1)])*.5,n[1]=(a[Math.min(l-1,t+i)]-a[Math.max(0,t-i)])*.5,n}};function ii(e,t,n=[-.5,-.8],a=e.cols,i=e.rows){let{cols:l,rows:c,speed:o,damp:f,wall:d}=e,m=Gt;if(t.length!==a*i*m)return n;let g=0,w=0,T=0;for(let M=0,x=0;M<c;M++){let F=Math.min(i-1,M*i/c|0);for(let v=0;v<l;v++,x++){let A=Math.min(a-1,v*a/l|0),r=(F*a+A)*m,E=t[r+3],L=t[r+8],Y=t[r+9],Q=t[r+2],re=t[r+1],J=A<a-1?m:0,ne=A>0?-m:0,_=F<i-1?a*m:0,ee=F>0?-a*m:0,K=Math.hypot(t[r+1+J]-t[r+1+ne],t[r+1+_]-t[r+1+ee]),S=Math.hypot(t[r+4],t[r+5]),D=Math.max(L,Y*.9),Z=1-Zt(.2,.8,E),q=Math.max(.12,Math.max(D,.2+.65*Z)*(1-.45*Zt(.55,.95,re)*(1-L)));o[x]=q*q;let C=Math.max(0,1-D);f[x]=.9*L+1.6*Y*(1-L)+C*(1.4+6.5*Zt(.25,.9,E)),d[x]=Math.min(.4,.35*Zt(.12,.35,K)*(1-L*.6)+.1*Zt(.6,1,S)*(1-D)),g+=(v/(l-1)-.5)*Q,w+=(M/(c-1)-.5)*Q,T+=Q}}if(oi(o,l,c,2),oi(f,l,c,1),T>.5){let M=Math.hypot(g,w);M/T>.02&&(n[0]=g/M,n[1]=w/M)}return n}function oi(e,t,n,a){let i=new Float32Array(e.length);for(let l=0;l<2;l++){let c=l?i:e,o=l?e:i;for(let f=0;f<n;f++)for(let d=0;d<t;d++){let m=0,g=0;for(let w=-a;w<=a;w++){let T=l?d:d+w,M=l?f+w:f;T<0||M<0||T>=t||M>=n||(m+=c[M*t+T],g++)}o[f*t+d]=m/g}}}function li(e,t,n,a,i=1,l=e.cols,c=e.rows){let{cols:o,rows:f,h:d,trace:m}=e,g=Gt,w=i/Math.max(.01,e.front),T=n[0],M=n[1],x=t.length===l*c*g;for(let F=0,v=0;F<f;F++){let A=Math.min(c-1,F*c/f|0);for(let r=0;r<o;r++,v++){let E=d[v]*w,L=(A*l+Math.min(l-1,r*l/o|0))*g,Y=x?t[L+9]:0,Q=x?Math.max(t[L+8],.75*(1-Zt(.1,.45,t[L+3]))*(1-Y)):0,re=Math.max(0,1-Math.max(Q,Y)),J=(d[r<o-1?v+1:v]-d[r>0?v-1:v])*.5*w,ne=(d[F<f-1?v+o:v]-d[F>0?v-o:v])*.5*w,_=-J*6+(x?t[L+4]*.35:0),ee=-ne*6+(x?t[L+5]*.35:0),K=_*T+ee*M,S=Math.max(-1,Math.min(1,K)),D=E>0?E:E*.45,Z=Q*(D*.8+S*.4*Math.min(1,Math.abs(E)*4))+Y*(Math.min(1,m[v]*w)*.3+D*.15)+re*(D*.55+S*.25*Math.min(1,Math.abs(E)*4)),q=Q*Math.max(0,S)**3*Math.min(1,Math.max(0,E)*3)*.9+re*Math.max(0,S)**4*Math.min(1,Math.max(0,E)*3)*.25;Z=Math.max(-1,Math.min(1,Z));let C=Math.round(Z*32767+32768);a[v*4]=C>>>8,a[v*4+1]=C&255,a[v*4+2]=Math.round(Math.min(1,q)*255),a[v*4+3]=255}}return a}var Ml=["none","flow","orb","drift","swell","caustics","contour","aurora","ripple","halo","interference","mesh","cascade","constellation"],It=["glyph","dot","pixel","mosaic","lego","voxel","disco","dither","hex","led","cmyk","stipple","engraving","crosshatch","woodblock","risograph","pointillism","inlay","tick","bayer"],Tl=[{value:"fluid",label:"Fluid",description:"An ink-in-water wake that bends the image and swirls the characters."},{value:"lantern",label:"Lantern",description:"A soft light follows the pointer and lifts the characters it passes, without distortion."},{value:"trail",label:"Trail",description:"The Asciify Trail: in the wake, sparse characters fill in and dense ones open up, then settle. No distortion."},{value:"loupe",label:"Loupe",description:"A glass loupe glides after the pointer and magnifies the characters it covers."},{value:"reveal",label:"Reveal",description:"Under a soft spotlight the characters take the source image's own colours. Best over a photo or video in one ink."},{value:"none",label:"Off",description:"The field stays still under the pointer."}],Fl={radius:.13,strength:.5,trail:.45,follow:12},wl={bloom:0,bloomRadius:2,scanlines:0,grain:0,chroma:0,curvature:0},kl={strength:.55,radius:.45},ft={radius:.075,force:1,dissipation:1.6,refraction:.03,glow:.55,resolution:128,curl:24},Al={charset:" .,:-=+*#%@",cellSize:12,cellAspect:1,cellFit:"pixel",font:'ui-monospace, "SF Mono", Menlo, Consolas, monospace',fontWeight:500,glyphScale:.8,mark:"glyph",dotScale:.9,markAngle:-35,accents:0,shuffle:0,sample:"area",linePitch:.5,lineWeight:1,sparkle:0,textRepeat:"flow",glyphOrder:"tone",color:"ink",ink:"#f3ba32",highlight:"auto",background:"transparent",brightness:0,contrast:1,gamma:1,invert:!1,levels:"auto",blend:"auto",saturation:1.1,ramp:[],shade:.5,backdrop:0,fit:"cover",focus:{x:.5,y:.5},vignette:0,drift:0,scene:"flow",scale:1,clear:!1,speed:1,hover:"fluid",fluid:ft,lantern:Fl,trail:kl,post:wl,scope:"all",tap:"surface",maxPixelRatio:2,respectReducedMotion:!0},z=(e,t,n,a)=>typeof e=="number"&&Number.isFinite(e)?Math.min(n,Math.max(t,e)):a,rn=(e,t)=>typeof e=="string"&&/^#([\\da-f]{3}|[\\da-f]{6})$/i.test(e.trim())?e.trim().toLowerCase():t,si=/^[\\u0020-\\u007e\\u00a0-\\u02ff\\u0370-\\u0482\\u048a-\\u052f\\u2010-\\u20cf\\u2100-\\u2bff]*$/,tn;function Tt(e){return nn(e).slice()}var vr=new Map;function nn(e){let t=vr.get(e);if(t)return t;let n=Rl(e);return vr.size>=32&&vr.delete(vr.keys().next().value),vr.set(e,n),n}function Rl(e){if(!si.test(e)&&tn===void 0){let n=Intl.Segmenter;tn=n?new n(void 0,{granularity:"grapheme"}):null}return(tn&&!si.test(e)?Array.from(tn.segment(e),n=>n.segment):Array.from(e)).filter(n=>n!==\`
\`&&n!=="\\r"&&n!=="	").slice(0,256)}function Sl(e){let t=Tt(e).filter(n=>n.trim());return t.length>0&&t.filter($r).length*2>t.length}var Ll=(e,t,n)=>{let a=It.includes(e)?e:t;return(a==="glyph"||a==="inlay")&&Sl(n)},Cl=(e,t)=>{if(!Array.isArray(e))return t;let n=e.map(a=>rn(a,"")).filter(Boolean).slice(0,6);return n.length>=2?n:[]};function ma(e={},t=Al){let n=typeof e.charset=="string"&&Tt(e.charset).length>=2?e.charset:t.charset,a=t.fluid||ft,i=e.fluid===void 0?t.fluid:e.fluid,l=i===!1?!1:(()=>{let m=i===!0||!i?a:{...a,...i};return{radius:z(m.radius,.005,.5,ft.radius),force:z(m.force,0,8,ft.force),dissipation:z(m.dissipation,.05,20,ft.dissipation),refraction:z(m.refraction,0,.5,ft.refraction),glow:z(m.glow,0,2,ft.glow),resolution:Math.round(z(m.resolution,16,512,ft.resolution)),curl:z(m.curl,0,80,ft.curl)}})(),c=Ml.includes(e.scene)?e.scene:t.scene,o=!!e.clear&&typeof e.clear=="object"&&("element"in e.clear||"nodeType"in e.clear||"rects"in e.clear),f=e.clear===void 0||o?t.clear:e.clear,d=f?{x:z(f.x,-.5,1.5,.25),y:z(f.y,-.5,1.5,.3),width:z(f.width,0,2,.5),height:z(f.height,0,2,.4),feather:z(f.feather,.005,1,.12),shape:f.shape==="rect"?"rect":"ellipse",pointer:z(f.pointer,0,1,0)}:!1;return{charset:n,cellSize:z(e.cellSize,1,96,t.cellSize),cellAspect:Ll(e.mark,t.mark,n)?Math.max(1,z(e.cellAspect,.3,2,t.cellAspect)):z(e.cellAspect,.3,2,t.cellAspect),cellFit:e.cellFit==="fill"||e.cellFit==="pixel"?e.cellFit:t.cellFit,font:typeof e.font=="string"&&e.font.trim()?e.font:t.font,fontWeight:Math.round(z(e.fontWeight,100,900,t.fontWeight)),glyphScale:z(e.glyphScale,.3,1.6,t.glyphScale),mark:It.includes(e.mark)?e.mark:t.mark,dotScale:z(e.dotScale,.1,1.4,t.dotScale),markAngle:z(e.markAngle,-360,360,t.markAngle),accents:z(e.accents,0,.3,t.accents),shuffle:z(e.shuffle,0,4,t.shuffle),sample:e.sample==="point"||e.sample==="area"||e.sample==="shape"?e.sample:t.sample,linePitch:z(e.linePitch,.2,4,t.linePitch),lineWeight:z(e.lineWeight,.2,3,t.lineWeight),sparkle:z(e.sparkle,0,.05,t.sparkle),textRepeat:e.textRepeat==="row"||e.textRepeat==="flow"?e.textRepeat:t.textRepeat,glyphOrder:e.glyphOrder==="text"||e.glyphOrder==="tone"||e.glyphOrder==="scatter"?e.glyphOrder:t.glyphOrder,color:e.color==="source"||e.color==="ink"?e.color:t.color,ink:rn(e.ink,t.ink),highlight:e.highlight==="auto"?"auto":rn(e.highlight,t.highlight),ramp:Cl(e.ramp,t.ramp),background:e.background==="transparent"?"transparent":rn(e.background,t.background),brightness:z(e.brightness,-1,1,t.brightness),contrast:z(e.contrast,0,4,t.contrast),gamma:z(e.gamma,.2,5,t.gamma),invert:typeof e.invert=="boolean"?e.invert:t.invert,levels:e.levels==="none"||e.levels==="auto"?e.levels:t.levels,blend:e.blend==="auto"||e.blend==="coarse"||e.blend==="on"||e.blend==="off"?e.blend:t.blend,saturation:z(e.saturation,0,3,t.saturation),shade:z(e.shade,0,1,t.shade),backdrop:z(e.backdrop,0,1,t.backdrop),fit:e.fit==="contain"||e.fit==="cover"?e.fit:t.fit,focus:{x:z(e.focus?.x,0,1,t.focus.x),y:z(e.focus?.y,0,1,t.focus.y)},vignette:z(e.vignette,0,1,t.vignette),drift:z(e.drift,0,2,t.drift),scene:c,scale:z(e.scale,.2,6,t.scale),clear:d,speed:z(e.speed,0,5,t.speed),hover:Tl.some(m=>m.value===e.hover)?e.hover:t.hover,fluid:l,lantern:{radius:z(e.lantern?.radius,.02,.6,t.lantern.radius),strength:z(e.lantern?.strength,0,1.5,t.lantern.strength),trail:z(e.lantern?.trail,0,3,t.lantern.trail),follow:z(e.lantern?.follow,1,60,t.lantern.follow)},trail:{strength:z(e.trail?.strength,0,1,t.trail.strength),radius:z(e.trail?.radius,.1,1,t.trail.radius)},post:{bloom:z(e.post?.bloom,0,2,t.post.bloom),bloomRadius:z(e.post?.bloomRadius,.5,8,t.post.bloomRadius),scanlines:z(e.post?.scanlines,0,1,t.post.scanlines),grain:z(e.post?.grain,0,1,t.post.grain),chroma:z(e.post?.chroma,0,1,t.post.chroma),curvature:z(e.post?.curvature,0,1,t.post.curvature)},scope:e.scope===void 0?t.scope:ni(e.scope),tap:e.tap==="ring"||e.tap==="none"||e.tap==="surface"?e.tap:t.tap,maxPixelRatio:z(e.maxPixelRatio,.5,4,t.maxPixelRatio),respectReducedMotion:typeof e.respectReducedMotion=="boolean"?e.respectReducedMotion:t.respectReducedMotion}}function pa(e,t,n,a,i,l={x:.5,y:.5}){if(!(e>0&&t>0&&n>0&&a>0))return{scale:[1,1],offset:[0,0]};let c=e/t,o=n/a,f=o>c,d=i==="cover"?f?[c/o,1]:[1,o/c]:f?[1,o/c]:[c/o,1],m=i==="cover"?[(1-d[0])*l.x,(1-d[1])*l.y]:[(1-d[0])*.5,(1-d[1])*.5];return{scale:d,offset:m}}function ci(e,t,n,a,i,l,c=8){if(!(n>=16&&a>=16&&e>0&&t>0&&i>0))return 1;let o=l==="cover"?Math.min(e/n,t/a):Math.max(e/n,t/a),f=c/i/o;return f>.5?1:2**-Math.floor(Math.log2(1/f))}function ui(e,t,n,a,i,l,c){if(e!=="fill"||!(i>0&&l>0))return[c.width,c.height];let o=t*a,f=o*n;return[i/Math.max(1,Math.floor(i/f+1e-6)),l/Math.max(1,Math.floor(l/o+1e-6))]}function an(e,t,n,a){let i=Math.max(2,Math.round(e*n)),l=Math.max(2,Math.round(i*t)),c=Math.min(16,Math.max(1,a)),o=Math.ceil(a/c);return{width:l,height:i,columns:c,rows:o,atlasWidth:c*l,atlasHeight:o*i}}function yr(e){let t=e.replace("#",""),n=t.length===3?t.split("").map(i=>i+i).join(""):t,a=Number.parseInt(n,16);return Number.isFinite(a)&&n.length===6?[(a>>16&255)/255,(a>>8&255)/255,(a&255)/255]:[0,0,0]}function ga(e){let t=new Uint32Array(256),n=0;for(let c=0;c+3<e.length;c+=4)e[c+3]<8||(t[Math.round(.2126*e[c]+.7152*e[c+1]+.0722*e[c+2])]++,n++);if(!n)return[0,1];let a=c=>{let o=0;for(let f=0;f<256;f++)if(o+=t[f],o>=n*c)return f/255;return 1},i=a(.02),l=a(.98);return l-i<.08?[0,1]:[i,l]}var Jt=e=>e.hover==="fluid"&&!e.fluid?"none":e.hover;function fi(e,t,n=24,a=.12,i="ellipse"){return e.width>0&&e.height>0?{x:(t.left-n-e.left)/e.width,y:(t.top-n-e.top)/e.height,width:(t.width+n*2)/e.width,height:(t.height+n*2)/e.height,feather:a,shape:i}:!1}function hi(e){let t=Tt(e),n=[];for(let a=0;a<t.length&&n.length<16;){if(!t[a].trim()){a++;continue}let i=a;for(;a<t.length&&t[a].trim();)a++;n.push(i,a-i)}return n}function di(e,t,n=256){let a=Math.min(.16666666666666666,n/Math.max(1,e,t));return[Math.max(2,Math.round(e*a)),Math.max(2,Math.round(t*a))]}function mi(e,t,n,a,i=8,l=28,c=new Uint8Array(n*a)){let o=n*a;if(c.length!==o&&(c=new Uint8Array(o)),c.fill(0),!(t.width>0&&t.height>0)||!e.length)return c;let f=n/t.width,d=a/t.height,m=Math.max(0,Math.round(l/2.56*f)),g=i+l*.5;for(let x of e){if(!(x.width>0&&x.height>0))continue;let F=Math.max(0,Math.round((x.left-g-t.left)*f)),v=Math.min(n,Math.round((x.left+x.width+g-t.left)*f)),A=Math.max(0,Math.round((x.top-g-t.top)*d)),r=Math.min(a,Math.round((x.top+x.height+g-t.top)*d));for(let E=A;E<r;E++)c.fill(255,(a-1-E)*n+F,(a-1-E)*n+Math.max(F,v))}if(!m)return c;let w=new Float32Array(Math.max(n,a)),T=new Float32Array(Math.max(n,a)+1),M=(x,F,v)=>{for(let A=0;A<3;A++){for(let r=0;r<x;r++)w[r]=c[v+r*F];T[0]=0;for(let r=0;r<x;r++)T[r+1]=T[r]+w[r];for(let r=0;r<x;r++){let E=Math.max(0,r-m),L=Math.min(x,r+m+1);c[v+r*F]=Math.round((T[L]-T[E])/(L-E))}}};for(let x=0;x<a;x++)M(n,1,x*n);for(let x=0;x<n;x++)M(a,n,x);return c}var _l=20,Pl=3,Dl=.15,Gl=/\\.(mp4|webm|mov|m4v|ogv)(\\?|#|$)/i;var Il=()=>{let e=typeof navigator>"u"?void 0:navigator;return 1e3/(!!e&&(e.hardwareConcurrency>0&&e.hardwareConcurrency<=2||!!e.deviceMemory&&e.deviceMemory<=2||!!e.connection?.saveData)?30:60)-2},Ul=3840*2160;var pi=new WeakMap;function wt(e,t){let n=pi.get(e);(!n||n.length!==t.length)&&pi.set(e,n=new Float64Array(t.length).fill(NaN));let a=!1;for(let i=0;i<t.length;i++)n[i]!==t[i]&&(a=!0,n[i]=t[i]);return a}var Ol=[new Float64Array(1),new Float64Array(2),new Float64Array(3),new Float64Array(4)],Mr=(e,t,n,a)=>{let i=a!==void 0?4:n!==void 0?3:t!==void 0?2:1,l=Ol[i-1];return l[0]=e,i>1&&(l[1]=t),i>2&&(l[2]=n),i>3&&(l[3]=a),l},N=(e,t,n)=>{t&&wt(t,Mr(n))&&e.uniform1f(t,n)},Ae=(e,t,n)=>{t&&wt(t,Mr(n))&&e.uniform1i(t,n)},We=(e,t,n,a)=>{t&&wt(t,Mr(n,a))&&e.uniform2f(t,n,a)},Bl=(e,t,n,a,i)=>{t&&wt(t,Mr(n,a,i))&&e.uniform3f(t,n,a,i)},Ft=(e,t,n,a,i,l)=>{t&&wt(t,Mr(n,a,i,l))&&e.uniform4f(t,n,a,i,l)},Wl=(e,t,n)=>{t&&wt(t,n)&&e.uniform2fv(t,n)},Er=(e,t,n)=>{t&&wt(t,n)&&e.uniform3fv(t,n)},xa=(e,t,n)=>{t&&wt(t,n)&&e.uniform4fv(t,n)},va=0,Nl=2,Hl=1280*720,on={alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"high-performance"},ya=(e,t)=>\`\${e.fontWeight} \${Math.max(1,t.height*e.glyphScale)}px \${e.font}\`,gi=(e,t)=>\`\${nn(e.charset).join("")}\\0\${ya(e,t)}\\0\${t.width}x\${t.height}x\${t.columns}\`;function Xl(e,t,n,a){let i=Math.min(globalThis.devicePixelRatio||1,e.maxPixelRatio,Math.sqrt(Ul/Math.max(1,t*n)));return a<1&&i>1?Math.max(1,i*a):i}var Ut={atlas:(e,t,n)=>xi(e,t,n),shapes:e=>zl(e)},bi=(e,t)=>gi(e,t);function xi(e,t,n){let a=Tt(e.charset),i=document.createElement("canvas");i.width=t.atlasWidth,i.height=t.atlasHeight;let l=i.getContext("2d");l.fillStyle="#fff",l.textAlign="center",l.textBaseline="alphabetic";let c=ya(e,t),o=Math.max(1,t.height*e.glyphScale),f=\`\${e.fontWeight} \${o}px \${ri}, \${e.font}\`;l.font=c;let d=l.measureText("M"),m=d.actualBoundingBoxAscent||t.height*e.glyphScale*.7,g=d.actualBoundingBoxDescent||0,w=(t.height+m-g)/2;a.forEach((x,F)=>{let v=F%t.columns*t.width+t.width/2,A=Math.floor(F/t.columns)*t.height+w,r=$r(x);if(l.save(),l.beginPath(),l.rect(v-t.width/2,A-w,t.width,t.height),l.clip(),r){l.font=f;let E=l.measureText(x),L=Math.max(E.width,(E.actualBoundingBoxLeft||0)+(E.actualBoundingBoxRight||0)),Y=(E.actualBoundingBoxAscent||o*.88)+(E.actualBoundingBoxDescent||o*.12),Q=Math.min(1,t.width*.94/Math.max(1,L),t.height*.94/Math.max(1,Y));l.translate(v,Math.floor(F/t.columns)*t.height+t.height/2),l.scale(Q,Q),l.translate(((E.actualBoundingBoxLeft||0)-(E.actualBoundingBoxRight||0))/2,((E.actualBoundingBoxAscent||o*.88)-(E.actualBoundingBoxDescent||o*.12))/2),l.fillText(x,0,0),l.font=c}else{let E=l.measureText(x).width;l.translate(v,A),E>t.width*.96&&l.scale(t.width*.96/E,1),l.fillText(x,0,0)}l.restore()});let T=!0,M=document.fonts;try{T=M?.check?M.check(c,a.join("")):!0}catch{}return n&&queueMicrotask(()=>{i.width=i.height=1}),{image:i,final:T}}function zl(e){let t=Tt(e.charset),n=new Uint8Array(t.length*16),a=an(60,e.cellAspect,1,t.length);try{let{image:i}=xi(e,a,!1),l=i,c=l.width,o=l.getContext("2d",{willReadFrequently:!0}).getImageData(0,0,l.width,l.height).data;l.width=l.height=1,t.forEach((f,d)=>{let m=d%a.columns*a.width,g=Math.floor(d/a.columns)*a.height,w=new Float64Array(15),T=new Float64Array(15),M=0;for(let x=0;x<a.height;x++)for(let F=0;F<a.width;F++){let v=o[((g+x)*c+m+F)*4+3]/255,A=Math.min(4,Math.floor(x*5/a.height))*3+Math.min(2,Math.floor(F*3/a.width));w[A]+=v,T[A]++,M+=v}for(let x=0;x<15;x++)n[d*16+x]=Math.round(255*w[x]/Math.max(1,T[x]));n[d*16+15]=Math.round(255*M/(a.width*a.height))})}catch{}return n}var ql=(e,t)=>e.length===t.length&&e.every((n,a)=>n===t[a]);function vi(e,t={}){let n=s=>typeof HTMLElement<"u"&&s instanceof HTMLElement,a=s=>{let u=s.clear;return i(u)?{element:null,rest:{...s,clear:!1}}:n(u)?{element:{element:u},rest:{...s,clear:void 0}}:u&&typeof u=="object"&&n(u.element)?{element:u,rest:{...s,clear:void 0}}:{element:null,rest:s}},i=s=>!!s&&typeof s=="object"&&"rects"in s,l=a(t).element,c=i(t.clear)?t.clear:null,o=ma(a(t).rest),f=t.onError,d=e.ownerDocument,m=!d||typeof document>"u"||d===document,g=t.context??"auto",w=()=>{let s=e.clientWidth||0,u=e.clientHeight||0,b=Math.min(globalThis.devicePixelRatio||1,o.maxPixelRatio);return s*u*b*b},M=!m||g==="own"||g==="auto"&&va<Nl&&w()>=Hl?e.getContext("webgl2",on):null,x=!M&&m?ei():null,F=x?e.getContext("2d",{alpha:!0}):null,v=!!(x&&F),A=v?x.gl:M??e.getContext("webgl2",on);if(!A)throw new Error("WebGL2 is not available for the glyph field.");let r=A;v||va++;let E=ca(r),L=v?null:r.getContextAttributes(),Y=!!L&&Object.keys(on).every(s=>L[s]===on[s]),Q=v?null:new xr(r,()=>{Lt()&&he()}),re=()=>v?x.frames:Q;v&&ti(e,!0),e.setAttribute("role","img"),e.setAttribute("aria-label",t.label??"ASCII artwork"),e.dataset.renderer="glyph-field";let J=!1,ne=v?null:r.getExtension("KHR_parallel_shader_compile"),_=null,ee=null,K=null,S,D,Z=null,q=null,C=[],U=[],H=null,te=!1,le=null,pe=null,De=[],V=0,ae=0,Re=1,Me=0,xe=an(o.cellSize,o.cellAspect,1,2),Le=2,Te=0,$e=0,tt=0,O=null,ve=!1,He=null,Ke=0,de=0,Ye=0,Xe=null,Fe=0,rt=0,ht=0,nt=!0,dt=0,at=[0,1],ot=-1/0,Tr=-1/0,Fr=!1,Bt=Il(),it=new Float32Array(16),Qe=!1,tr=0,mt=0,se=!0,Ve=!1,ke=!1,At=!1,h=!1,P=!0,R=(t.effects??[]).slice(0,4),ge=!!t.live,ce=[],j={target:null,at:[-1,-1],presence:0,data:new Float32Array(32)},ue=null,me=null,I=1/60,B=0,X=0,ie=[],fe=new Float32Array(16),Ce=()=>{if(!l)return;let{element:s,padding:u=32,feather:b=.16,shape:y="rect",pointer:p=0}=l,k=fi(e.getBoundingClientRect(),s.getBoundingClientRect(),u,b,y),$=k&&p>0?{...k,pointer:Math.min(1,Math.max(0,p))}:k,W=o.clear;JSON.stringify(W)!==JSON.stringify($)&&(o={...o,clear:$},se=!0)},Se=null,Ge=new Uint8Array(0),Ie=0,ze=0,_e=!1,lt=null,Ze=new Float64Array(0),st=!0,Ti=()=>{if(!c){_e&&(_e=!1,se=!0);return}let s=c.rects,u=typeof s=="function"?s():s;if(u===lt&&!st)return;lt=u;let b=e.getBoundingClientRect(),[y,p]=di(b.width,b.height),k=new Float64Array(u.length*4+6);k[0]=b.left,k[1]=b.top,k[2]=b.width,k[3]=b.height,k[4]=c.padding??8,k[5]=c.softness??28,u.forEach((W,oe)=>{k[6+oe*4]=W.left,k[7+oe*4]=W.top,k[8+oe*4]=W.width,k[9+oe*4]=W.height});let $=!st&&k.length===Ze.length&&k.every((W,oe)=>W===Ze[oe]);st=!1,!($&&_e)&&(Ze=k,Ge=mi(u,b,y,p,k[4],k[5],Ge),!ke&&(Se??(Se=Je(r.LINEAR)),r.bindTexture(r.TEXTURE_2D,Se),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),y!==Ie||p!==ze?r.texImage2D(r.TEXTURE_2D,0,r.R8,y,p,0,r.RED,r.UNSIGNED_BYTE,Ge):r.texSubImage2D(r.TEXTURE_2D,0,0,0,y,p,r.RED,r.UNSIGNED_BYTE,Ge),r.pixelStorei(r.UNPACK_ALIGNMENT,4),Ie=y,ze=p,_e=!0,se=!0))},Ta=()=>{se=!0,he()},Fa=!1,cn=()=>{let s=!!c&&typeof c.rects=="function"&&typeof window<"u"&&typeof window.addEventListener=="function";s!==Fa&&(Fa=s,s?window.addEventListener("scroll",Ta,{passive:!0,capture:!0}):window.removeEventListener("scroll",Ta,{capture:!0}))},un=s=>s==="lantern"||s==="loupe"||s==="reveal",we={target:null,at:null,strength:0,trail:[]},rr=new Float32Array(36),Ue=null,pt=null,wr=!1,wa=()=>{if(!V||!ae)return null;let s=V/ae,u=Math.round(s>=1?128:128*s),b=Math.round(s>=1?128/s:128);return(!Ue||Ue.width!==u||Ue.height!==b)&&(Ue=new Kr(u,b),pt||(pt=Je(r.LINEAR)),r.bindTexture(r.TEXTURE_2D,pt),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,u,b,0,r.RGBA,r.UNSIGNED_BYTE,Ue.pixels),wr=!0),Ue},Fi=s=>{let u=wa();return!u||!u.active?!1:(u.step(s),r.bindTexture(r.TEXTURE_2D,pt),r.texSubImage2D(r.TEXTURE_2D,0,0,0,u.width,u.height,r.RGBA,r.UNSIGNED_BYTE,u.pixels),wr=!0,!0)},be=null,Wt=null,fn=new Uint8Array(0),gt=!1,nr=null,Nt=null,hn=-1,ka=[-.5,-.8],kr=[0,0],Aa=()=>{if(!(!be||!O))try{if(Nt??(Nt=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})),!Nt)return;let s=O instanceof HTMLVideoElement,u=s?be.cols>>1:be.cols,b=s?be.rows>>1:be.rows,y=Nt.canvas;y.width!==u||y.height!==b?(y.width=u,y.height=b):Nt.clearRect(0,0,u,b);let p=Ke||1,k=de||1;Nt.drawImage(O,et.offset[0]*p,et.offset[1]*k,et.scale[0]*p,et.scale[1]*k,0,0,u,b),nr=ai(Nt.getImageData(0,0,u,b).data,u,b,nr),kr[0]=u,kr[1]=b,ii(be,nr,ka,u,b)}catch{}},Ra=(s,u,b)=>{if(!V||!ae)return;let y=V/ae,p=Math.round(y>=1?128:128*y),k=Math.round(y>=1?128/y:128);(!be||be.cols!==p||be.rows!==k)&&(be=new en(p,k),nr=null,fn=new Uint8Array(p*k*4),Wt??(Wt=Je(r.LINEAR)),r.bindTexture(r.TEXTURE_2D,Wt),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,p,k,0,r.RGBA,r.UNSIGNED_BYTE,null)),be.base=Math.min(p,k)*1.1,be.mass=0,be.calm=7,be.fade=1.6,Aa(),hn=ht,be.drop(s*(p-1),u*(k-1),b,2.2),he()},wi=s=>{if(!be?.live||!Wt)return gt?(gt=!1,!0):!1;O instanceof HTMLVideoElement&&hn!==ht&&(Aa(),hn=ht),be.step(s,.45+.55*Math.exp(-be.age/.7));let u=Math.min(1,Math.exp(-(be.age-.9)/.5));return u<.02?(be.clear(),gt=!1,!0):(li(be,nr??new Float32Array(0),ka,fn,u,kr[0],kr[1]),r.bindTexture(r.TEXTURE_2D,Wt),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.texSubImage2D(r.TEXTURE_2D,0,0,0,be.cols,be.rows,r.RGBA,r.UNSIGNED_BYTE,fn),gt=!0,!0)},ki=(s,u)=>{let b=o.lantern,y=we.target;if(y){let k=we.at;if(!k)we.at=[y[0],y[1]];else if(bt())k[0]=y[0],k[1]=y[1];else{let oe=1-Math.exp(-b.follow*s);k[0]+=(y[0]-k[0])*oe,k[1]+=(y[1]-k[1])*oe}let $=we.at,W=we.trail[we.trail.length-1];b.trail>0&&(!W||u-W.born>28&&Math.hypot($[0]-W.x,$[1]-W.y)>.004)&&(we.trail.push({x:$[0],y:$[1],born:u}),we.trail.length>12&&we.trail.shift())}we.strength+=((y?1:0)-we.strength)*(1-Math.exp(-s*(y?9:5)));let p=we.trail;for(let k=p.length-1;k>=0;k--)b.trail>0&&u-p[k].born<b.trail*4e3||p.splice(k,1);rr.fill(0);for(let k=0;k<p.length;k++){let $=p[k];rr[k*3]=$.x,rr[k*3+1]=$.y,rr[k*3+2]=.55*Math.exp(-(u-$.born)/1e3/Math.max(.01,b.trail))}return we.strength>.003||p.length>0},dn=0,Sa=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,La=!!Sa?.matches,bt=()=>o.respectReducedMotion&&La,mn,Ai=new Promise(s=>{mn=s}),Rt=!0,Ht=s=>f?.(s instanceof Error?s:new Error(String(s))),Ca=(s,u)=>{let b=r.createShader(s);return De.push(b),r.shaderSource(b,u),r.compileShader(b),b},ar=s=>{if(v)return x.program(s);pe??(pe=Ca(r.VERTEX_SHADER,yo));let u=r.createProgram(),b=Ca(r.FRAGMENT_SHADER,s);return r.attachShader(u,pe),r.attachShader(u,b),r.linkProgram(u),{program:u,locations:null,fragment:b}},Ar=(s,u=!1)=>{if(s.locations)return!0;if(v)return x.linked(s,u);let{program:b,fragment:y}=s;if(!u&&ne&&!r.getProgramParameter(b,ne.COMPLETION_STATUS_KHR))return!1;if(!r.getProgramParameter(b,r.LINK_STATUS)){if(r.isContextLost())return!1;throw new Error(r.getShaderInfoLog(y)||r.getProgramInfoLog(b)||"Glyph field program failed to link.")}let p={};for(let k=r.getProgramParameter(b,r.ACTIVE_UNIFORMS)-1;k>=0;k--){let $=r.getActiveUniform(b,k).name.replace(/\\[0\\]$/,"");p[$]=r.getUniformLocation(b,$)}return s.locations=p,!0},pn=(s=!1)=>{if(!_||!ee)return!1;try{if(!Ar(_,s))return!1}catch(u){if(!R.length)throw u;let b=R.map(y=>y.name).join(", ");return Ln([]),Sr(),Ht(new Error(\`Field effects (\${b}) did not compile, so the field draws without them. \${u instanceof Error?u.message:String(u)}\`)),!1}return Ar(ee,s)},Je=s=>{let u=r.createTexture();return r.bindTexture(r.TEXTURE_2D,u),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,s),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,s===r.LINEAR_MIPMAP_LINEAR?r.LINEAR:s),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),u},gn=()=>{q&&(r.deleteTexture(q.ink),r.deleteTexture(q.under),r.deleteFramebuffer(q.buffer),q.glow&&r.deleteTexture(q.glow),q=null)},_a=()=>ui(o.cellFit,o.cellSize,o.cellAspect,Re,V,ae,xe),Ri=()=>{let[s,u]=_a(),b=Math.ceil(V/s-1e-4),y=Math.ceil(ae/u-1e-4),p=o.post.bloom>0;if(q&&q.columns===b&&q.rows===y&&!!q.glow===p)return q;gn();let k=()=>{let ut=Je(r.NEAREST);return r.texStorage2D(r.TEXTURE_2D,1,J?r.RGBA8:r.RGBA16F,b,y),ut},$=k(),W=k(),oe=r.createFramebuffer();r.bindFramebuffer(r.FRAMEBUFFER,oe),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,$,0),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT1,r.TEXTURE_2D,W,0);let qe=null;return p&&(qe=Je(r.LINEAR_MIPMAP_LINEAR),r.texStorage2D(r.TEXTURE_2D,Math.floor(Math.log2(Math.max(b,y)))+1,r.RGBA8,b,y),r.bindFramebuffer(r.FRAMEBUFFER,oe),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT2,r.TEXTURE_2D,qe,0)),r.drawBuffers(qe?[r.COLOR_ATTACHMENT0,r.COLOR_ATTACHMENT1,r.COLOR_ATTACHMENT2]:[r.COLOR_ATTACHMENT0,r.COLOR_ATTACHMENT1]),q={ink:$,under:W,glow:qe,buffer:oe,columns:b,rows:y}},bn=()=>!!o.fluid&&Jt(o)==="fluid",xn=()=>{H?.release(),te=!1,C.forEach(s=>r.deleteTexture(s)),U.forEach(s=>r.deleteFramebuffer(s)),C=[],U=[]};function Pa(){K&&!v&&r.deleteProgram(K.program),K=ar(Mo(J)),v?H?.release():H?.dispose(),H=J?null:To(r,ar,s=>Ar(s))}let Da=()=>{xn();let s=o.fluid;if(!s||!bn()||!V||!ae)return;K||Pa();let u=s.resolution,b=V/ae;if(Te=b>=1?u:Math.max(8,Math.round(u*b)),$e=b>=1?Math.max(8,Math.round(u/b)):u,te=!!H&&H.resize(Te,$e),te){tt=0;return}let y=()=>{xn();for(let p=0;p<2;p++){let k=Je(r.LINEAR);r.texImage2D(r.TEXTURE_2D,0,J?r.RGBA8:r.RGBA16F,Te,$e,0,r.RGBA,J?r.UNSIGNED_BYTE:r.HALF_FLOAT,null);let $=r.createFramebuffer();r.bindFramebuffer(r.FRAMEBUFFER,$),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,k,0),C.push(k),U.push($)}return r.checkFramebufferStatus(r.FRAMEBUFFER)===r.FRAMEBUFFER_COMPLETE};if(!y()){if(J)throw new Error("The glyph field could not allocate its fluid buffers.");J=!0,Sr(),Pa(),y()}for(let p of U)r.bindFramebuffer(r.FRAMEBUFFER,p),r.viewport(0,0,Te,$e),r.clearColor(J?.5:0,J?.5:0,0,1),r.clear(r.COLOR_BUFFER_BIT);r.bindFramebuffer(r.FRAMEBUFFER,null),tt=0},Rr=-1,or=!1,vn=s=>s.post.bloom>0||s.post.scanlines>0||s.post.grain>0||s.post.chroma>0||s.post.curvature>0;function Sr(){_&&!v&&r.deleteProgram(_.program),ee&&!v&&r.deleteProgram(ee.program),gn(),_=ar(Nr(J,R)),Rr=It.indexOf(o.mark),or=vn(o),ee=ar(fr(Rr,or)),(v?!x.canCompileInParallel:!ne)&&pn(!0)}let Ga=()=>ya(o,xe),yn=()=>{se=!0,he()},En=()=>gi(o,xe),Mn=()=>{if(Le=Tt(o.charset).length,xe=an(o.cellSize,o.cellAspect,Re,Le),Me=Re,v){let b=En();if(Z?.key!==b){let y=Z;Z=x.atlas(b,Tn,yn),x.releaseAtlas(y,yn),S=Z.texture}se=!0;return}let{image:u}=Tn();r.bindTexture(r.TEXTURE_2D,S),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,r.RGBA,r.UNSIGNED_BYTE,u),typeof u.getContext=="function"&&(u.width=u.height=1),se=!0};function Tn(){return Ut.atlas(o,xe,v)}let Ia=typeof document>"u"?void 0:document.fonts,Fn=()=>{if(!Ia?.load)return;let s=Ga();Ia.load(s,Tt(o.charset).join("")).then(()=>{if(!(Ve||ke||Ga()!==s)){if(_r++,!v){Mn(),he();return}Z&&!Z.final&&Z.key===En()&&x.paintAtlas(Z,Tn)}},()=>{})},Ua=s=>s.trim().replace(/^["']|["']$/g,"").toLowerCase(),Si=s=>{let u=s.fontfaces??[],b=o.font.split(",").map(Ua);u.some(y=>b.includes(Ua(y.family)))&&Fn()},wn=()=>{if(at=[0,1],Dr=!1,!(!O||o.levels==="none"))try{let s=document.createElement("canvas");s.width=s.height=64;let u=s.getContext("2d",{willReadFrequently:!0});O===Xe&&(u.imageSmoothingQuality="medium"),u.drawImage(O,0,0,64,64),at=ga(u.getImageData(0,0,64,64).data)}catch{at=[0,1]}},Xt=null,Lr=null,zt=!1,xt=-1/0,Cr=new Uint8Array(0),qt=null,kn=()=>{if(zt=!1,lr=!1,!O||o.scope==="all")return;let s=Ke||1,u=de||1,b=Math.max(8,Math.round(s>=u?96:96*s/u)),y=Math.max(8,Math.round(u>=s?96:96*u/s));try{if(qt??(qt=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})),!qt)return;let p=qt.canvas;p.width!==b||p.height!==y?(p.width=b,p.height=y):qt.clearRect(0,0,b,y),qt.drawImage(O,0,0,b,y),Oa(qt.getImageData(0,0,b,y).data,b,y)}catch{return}},Oa=(s,u,b)=>{if(zt=!1,lr=!1,!(!O||o.scope==="all")&&(Lr=Yr(s,u,b,null,Lr),Lr.key!=="none")){Cr.length!==u*b*4&&(Cr=new Uint8Array(u*b*4));for(let y=0;y<u*b;y++)Cr[y*4+3]=Math.round(Lr.subject[y]*255);Xt??(Xt=Je(r.LINEAR)),r.bindTexture(r.TEXTURE_2D,Xt),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,u,b,0,r.RGBA,r.UNSIGNED_BYTE,Cr),zt=!0}},St=null,An="",_r=0,Ba="",Wa=null,Na=null,Ha=-1,vt=!1,Vt=null,ir={levels:!1,scope:!1},Pr=0,Rn=-1/0,ct,Dr=!1,lr=!1,Li=()=>{let s=Vt?.poll();s&&(ir.levels&&o.levels!=="none"&&(at=ga(s.data)),ir.scope&&Oa(s.data,s.width,s.height),(ir.levels||ir.scope)&&(se=!0))},Xa=null,za=0,qa=0,sr=()=>{if(!O)return;let s=performance.now(),u=O instanceof HTMLVideoElement||ge;u&&ct===void 0&&(ct=Ao(r));let b=u&&!!ct;u&&!b&&Li(),Pr++;let y=Pr-Rn>=8,p=!u||ot===-1/0?"now":s-ot>1500&&y&&o.levels!=="none"?"later":null,k=!u||xt===-1/0?"now":s-xt>160&&y&&o.scope!=="all"&&o.hover!=="none"?"later":null;!b&&p==="now"&&(wn(),ot=s),!b&&k==="now"&&(kn(),xt=s),r.bindTexture(r.TEXTURE_2D,D),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1);try{let $=O,W=$.videoWidth||$.naturalWidth||$.width,oe=$.videoHeight||$.naturalHeight||$.height;if(Xa===D&&za===W&&qa===oe&&W&&oe?r.texSubImage2D(r.TEXTURE_2D,0,0,0,r.RGBA,r.UNSIGNED_BYTE,O):(r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,r.RGBA,r.UNSIGNED_BYTE,O),Xa=D,za=W,qa=oe),u?vt=!0:(r.generateMipmap(r.TEXTURE_2D),vt=!1),rt=W*oe*4*4/3,b){let jt=!!p&&o.levels!=="none",ur=!!k&&o.scope!=="all"&&o.hover!=="none";(jt||ur)&&(vt&&(r.generateMipmap(r.TEXTURE_2D),vt=!1),jt&&(ct.measureLevels(D,W,oe),Dr=!0),ur&&(ct.measureScope(D,W,oe),lr=!0,zt=!0),Rn=Pr,se=!0),p&&(ot=s),k&&(xt=s);return}let qe=p==="later",ut=k==="later";(qe||ut)&&!Vt?.pending&&(Vt??(Vt=Fo(r)),vt&&(r.generateMipmap(r.TEXTURE_2D),vt=!1),Vt.request(D,W,oe,128)?(ir={levels:qe,scope:ut},Rn=Pr,qe&&(ot=s),ut&&(xt=s)):(qe&&(wn(),ot=s),ut&&(kn(),xt=s)))}catch($){Ht($)}},Va=()=>{Vt=null,St=null,An="",J=!r.getExtension("EXT_color_buffer_float")&&!r.getExtension("EXT_color_buffer_half_float"),Sr(),le=v?x.vertexArray():r.createVertexArray(),v||(S=Je(r.NEAREST)),D=Je(r.LINEAR_MIPMAP_LINEAR),r.bindTexture(r.TEXTURE_2D,D),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,1,1,0,r.RGBA,r.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),r.generateMipmap(r.TEXTURE_2D),V=ae=0,Me=0,Lt(),Fn(),O&&sr()};function Lt(){let s=e.clientWidth||e.clientHeight?{width:e.clientWidth,height:e.clientHeight}:e.getBoundingClientRect();Fr=!s.width||!s.height;let u=Xl(o,s.width,s.height,re().scale),b=Math.max(1,Math.round(s.width*u)),y=Math.max(1,Math.round(s.height*u));if(b===V&&y===ae&&u===Re)return!1;let p=!V||Math.abs(b/y-V/ae)>.01;return Re=u,V=b,ae=y,e.width=V,e.height=ae,Me!==Re&&Mn(),(p||bn()&&!C.length&&!te)&&Da(),se=!0,!0}let Ci=()=>h||X>=2&&!(O instanceof HTMLVideoElement)?!1:O instanceof HTMLVideoElement&&!O.paused&&!O.ended?!0:bt()?!1:!O&&o.scene!=="none"||o.drift>0||o.post.grain>0||R.some(u=>u.animate),_i=(s,u)=>{let b=o.fluid;if(!b||!U.length&&!te||(te?!H?.ready():!K||!Ar(K)))return;let y=V/ae,p=me;if(me=null,te&&H){let oe=5200*b.force*(bt()?.35:1);p&&(dn=u+Math.min(9,6/Math.max(.3,b.dissipation))*1e3),H.step(p?{from:p.from,to:p.to,force:[(p.to[0]-p.from[0])*oe,(p.to[1]-p.from[1])*oe]}:null,{dt:Math.min(s,1/60),radius:b.radius*1.1,curl:b.curl,dissipation:b.dissipation,aspect:y});return}let k=0,$=0;if(p){let oe=(bt()?1:3)*b.force;k=(p.to[0]-p.from[0])*y*oe*4,$=(p.to[1]-p.from[1])*oe*4,dn=u+7/Math.min(b.dissipation,b.dissipation*1.1)*1e3}let W=K.locations;r.bindFramebuffer(r.FRAMEBUFFER,U[1-tt]),r.viewport(0,0,Te,$e),r.useProgram(K.program),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,C[tt]),Ae(r,W.uPrevious,0),We(r,W.uSize,Te,$e),N(r,W.uAspect,y),N(r,W.uDt,s),N(r,W.uDecay,b.dissipation),N(r,W.uEnergyDecay,b.dissipation*1.1),N(r,W.uRadius,b.radius),N(r,W.uSplat,p?1:0),We(r,W.uFrom,p?.from[0]??0,p?.from[1]??0),We(r,W.uTo,p?.to[0]??0,p?.to[1]??0),We(r,W.uForce,k,$),r.drawArrays(r.TRIANGLES,0,3),tt=1-tt},ja=null,Gr=new Float32Array(18),cr=[0,0,0],$a=[1,1,1],Ka=[0,0,0,0],et=pa(1,1,1,1,"cover"),Ya=null,Qa=0,Za=0,Ja=0,eo=0,Pi=()=>{ja!==o&&(ja=o,cr=yr(o.ink),$a=yr(o.highlight==="auto"?"#ffffff":o.highlight),Ka=o.background==="transparent"?[0,0,0,0]:[...yr(o.background),1],Gr.fill(0),o.ramp.forEach((s,u)=>Gr.set(yr(s),u*3))),(Ya!==o||Qa!==V||Za!==ae||Ja!==Ke||eo!==de)&&(Ya=o,Qa=V,Za=ae,Ja=Ke,eo=de,et=pa(V,ae,Ke||1,de||1,o.fit,o.focus))},to=()=>{Pi(),v?x.begin(V,ae):Q.begin();let s=o.fluid,u=O&&Fe?xe.height/ae*Fe*et.scale[1]:1,b=o.sample==="point"?0:Math.max(0,Math.log2(Math.max(1,u))-.5);vt&&O&&(b>0||o.backdrop>0)&&(r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,D),r.generateMipmap(r.TEXTURE_2D),vt=!1);let y=Ri(),p=_.locations,k=ee.locations,$=Jt(o),W=!bt();r.bindFramebuffer(r.FRAMEBUFFER,y.buffer),r.viewport(0,0,y.columns,y.rows),r.useProgram(_.program),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,D),Ae(r,p.uSource,0),r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,(te?H?.velocity:C[tt])??D),Ae(r,p.uFluid,2),r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,pt??D),Ae(r,p.uTrailMap,3),r.activeTexture(r.TEXTURE6),r.bindTexture(r.TEXTURE_2D,(lr?ct?.scope:Xt)??D),Ae(r,p.uScope,6);let oe=Dr&&O&&o.levels==="auto"?ct?.levels??null:null;r.activeTexture(r.TEXTURE11),r.bindTexture(r.TEXTURE_2D,oe??D),Ae(r,p.uLevelMap,11),N(r,p.uLevelsFromMap,oe?1:0),r.activeTexture(r.TEXTURE7),r.bindTexture(r.TEXTURE_2D,Wt??D),Ae(r,p.uTapMap,7),N(r,p.uTapOn,gt&&O&&ve?1:0),N(r,p.uScopeMode,zt&&o.scope!=="all"?o.scope==="subject"?1:2:0),N(r,p.uFluidMode,te?1:0),Ae(r,p.uHoverMode,$==="fluid"?1:$==="lantern"?2:$==="trail"&&wr?3:$==="loupe"?4:$==="reveal"?5:0),N(r,p.uTrailAmount,o.trail.strength),Bl(r,p.uLight,we.at?.[0]??-1,we.at?.[1]??-1,un($)?we.strength:0),Er(r,p.uTrail,rr),N(r,p.uLightRadius,o.lantern.radius),N(r,p.uLightGain,o.lantern.strength),N(r,p.uClock,performance.now()/1e3),N(r,p.uFlicker,W?1:0),We(r,p.uFluidTexel,1/Math.max(1,Te),1/Math.max(1,$e)),We(r,p.uResolution,V,ae);let[qe,ut]=_a();We(r,p.uCell,qe,ut),N(r,p.uCount,Le),N(r,p.uBlend,o.blend==="on"||Le<=9&&(o.blend==="coarse"||o.blend==="auto"&&ve)?1:0),Ft(r,p.uSourceMap,et.scale[0],et.scale[1],et.offset[0],et.offset[1]),Ae(r,p.uScene,O?0:vo(o.scene)),Ae(r,p.uMark,It.indexOf(o.mark)),N(r,p.uOrder,o.glyphOrder==="text"?1:o.glyphOrder==="scatter"&&o.mark==="glyph"?2:0);let jt=o.sample==="shape"&&!!O&&o.mark==="glyph"&&o.glyphOrder!=="text"&&o.glyphOrder!=="scatter"&&xe.height>=8;if(jt){(Wa!==o||Na!==xe||Ha!==_r)&&(Wa=o,Na=xe,Ha=_r,Ba=\`\${En()}|\${_r}\`);let _t=Ba;if(An!==_t||!St){An=_t;let Pt=Ut.shapes(o);r.activeTexture(r.TEXTURE9),St??(St=Je(r.NEAREST)),r.bindTexture(r.TEXTURE_2D,St),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texImage2D(r.TEXTURE_2D,0,r.R8,16,Math.max(1,Pt.length/16),0,r.RED,r.UNSIGNED_BYTE,Pt),r.pixelStorei(r.UNPACK_ALIGNMENT,4)}}r.activeTexture(r.TEXTURE9),r.bindTexture(r.TEXTURE_2D,jt&&St||D),Ae(r,p.uShapes,9),N(r,p.uShapeOn,jt?1:0),N(r,p.uShapeLod,Math.max(0,Math.log2(Math.max(1,u/5))-.5)),N(r,p.uShapeTone,_l),N(r,p.uShapeWindow,Pl),N(r,p.uShapeGate,Dl);let ur=o.glyphOrder==="text"&&o.textRepeat==="row"?hi(o.charset):[];it.fill(0),it.set(ur),Wl(r,p.uWords,it),N(r,p.uWordCount,ur.length/2),N(r,p.uScale,o.scale);let Pe=o.clear;Ft(r,p.uClear,Pe?Pe.x:0,Pe?Pe.y:0,Pe?Pe.width:0,Pe?Pe.height:0),N(r,p.uClearFeather,Pe?Pe.feather:.1),N(r,p.uClearShape,Pe&&Pe.shape==="rect"?1:0),N(r,p.uClearPointer,Pe?Pe.pointer??0:0),r.activeTexture(r.TEXTURE8),r.bindTexture(r.TEXTURE_2D,Se??D),Ae(r,p.uClearMap,8);let co=_e&&!!c&&!!Se;N(r,p.uClearMapOn,co?Math.min(1,Math.max(0,c.strength??.85)):0),N(r,p.uClearBend,co?Math.min(1,Math.max(0,c.bend??.5))*.035:0),We(r,p.uClearTexel,1/Math.max(1,Ie),1/Math.max(1,ze));let Xi=performance.now();fe.fill(0);for(let _t=0;_t<ie.length;_t++){let Pt=ie[_t],Ur=_t*4;fe[Ur]=Pt.x,fe[Ur+1]=Pt.y,fe[Ur+2]=(Xi-Pt.born)/1e3,fe[Ur+3]=Pt.strength}xa(r,p.uPulse,fe),Er(r,p.uInk,cr),Er(r,p.uRamp,Gr),N(r,p.uRampCount,o.color==="source"?0:o.ramp.length),Er(r,p.uHighlight,$a),N(r,p.uHighlightAuto,o.highlight==="auto"?1:0),xa(r,p.uBackground,Ka),N(r,p.uBrightness,o.brightness),N(r,p.uContrast,o.contrast),N(r,p.uGamma,o.gamma),N(r,p.uInvert,o.invert?1:0),N(r,p.uVignette,o.vignette),N(r,p.uSourceColor,o.color==="source"?1:0),N(r,p.uRefraction,s?s.refraction*(W?1:.25):0),N(r,p.uGlow,s?s.glow:0),N(r,p.uTime,mt),N(r,p.uDrift,W?o.drift:0),N(r,p.uFluidOn,s&&$==="fluid"&&(C.length||te)?1:0),N(r,p.uLod,b),N(r,p.uSaturation,o.saturation),N(r,p.uShade,o.shade),N(r,p.uBackdrop,O?o.backdrop:0),We(r,p.uLevels,O&&o.levels==="auto"?at[0]:0,O&&o.levels==="auto"?at[1]:1),R.length&&Gi(_.locations),r.bindVertexArray(le),r.drawArrays(r.TRIANGLES,0,3),y.glow&&(r.activeTexture(r.TEXTURE10),r.bindTexture(r.TEXTURE_2D,y.glow),r.generateMipmap(r.TEXTURE_2D)),r.bindFramebuffer(r.FRAMEBUFFER,null),r.viewport(0,0,V,ae),r.useProgram(ee.program),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,S),Ae(r,k.uAtlas,1),r.activeTexture(r.TEXTURE4),r.bindTexture(r.TEXTURE_2D,y.ink),Ae(r,k.uCells,4),r.activeTexture(r.TEXTURE5),r.bindTexture(r.TEXTURE_2D,y.under),Ae(r,k.uUnder,5),We(r,k.uResolution,V,ae),We(r,k.uCell,xe.width,xe.height),We(r,k.uPitch,qe,ut),N(r,k.uColumns,xe.columns),N(r,k.uDotScale,o.dotScale),We(r,k.uDir,Math.cos(o.markAngle*Math.PI/180),Math.sin(o.markAngle*Math.PI/180)),Ae(r,k.uMark,It.indexOf(o.mark)),Ft(r,k.uLine,o.linePitch,o.lineWeight,o.sparkle,0),Ft(r,k.uInlay,o.accents,o.shuffle,Math.floor(mt*7),nn(o.charset).length),N(r,k.uSourceColor,o.color==="source"?1:0),Er(r,k.uRamp,Gr),N(r,k.uRampCount,o.color==="source"?0:o.ramp.length),Ft(r,k.uFade,cr[0],cr[1],cr[2],o.mark==="inlay"||o.glyphOrder!=="tone"&&o.mark==="glyph"?1:0);let $t=o.post;r.activeTexture(r.TEXTURE10),r.bindTexture(r.TEXTURE_2D,y.glow??D),Ae(r,k.uGlow,10),Ft(r,k.uPost,y.glow?$t.bloom:0,$t.bloomRadius,$t.scanlines,$t.grain),Ft(r,k.uPost2,$t.chroma,$t.curvature,mt,2),r.drawArrays(r.TRIANGLES,0,3),v&&x.present(F,V,ae)},Sn=typeof document<"u"&&document.hidden,ro=()=>!Ve&&!ke&&!At&&!Fr&&(P||Rt)&&!Sn;function Ln(s){ce.forEach(b=>b()),R=s.slice(0,4);let u=()=>{se=!0,he()};ce=R.map(b=>b.subscribe(u)),R.length||(j.target=null,j.presence=0)}function Di(s){let u=j.target&&!h?1:0,b=!1;if(j.target){j.presence===0&&(j.at=[...j.target]);let y=1-Math.exp(-s/.035),p=j.target[0]-j.at[0],k=j.target[1]-j.at[1];Math.abs(p)+Math.abs(k)>1e-4&&(j.at=[j.at[0]+p*y,j.at[1]+k*y],b=!0)}if(j.presence!==u){let y=s/.15;j.presence=u>j.presence?Math.min(u,j.presence+y):Math.max(u,j.presence-y),b=!0}return b}function Gi(s){xa(r,s.uFx,bo(R,j.data)),Ft(r,s.uFxPointer,j.at[0],j.at[1],j.presence,bt()?0:1),N(r,s.uFxTime,mt)}Ln(R);let Ir=s=>{if(Qe=!1,!ro())return;let u=performance.now(),b=(s-tr)/1e3,y=Math.min(1/30,Math.max(1/480,b));tr=s,I=I*.9+Math.min(b,.25)*.1,B=I>1/24?B+1:0;try{re().overloaded&&X<2&&B>10&&(X=2),B>45&&X<2&&re().atMinimum&&(B=0,X++,X===1&&Re>1?(o={...o,maxPixelRatio:1},Lt()):X=2);let p=pn(),k=Ci();k&&(mt+=y*o.speed),ge&&O&&!(O instanceof HTMLVideoElement)&&!h&&(sr(),se=!0),O instanceof HTMLVideoElement&&O.readyState>=2&&nt&&("requestVideoFrameCallback"in O?nt=!1:nt=!0,sr(),ht++,se=!0);let $=Jt(o),W=$==="fluid"&&(me!==null||s<dn);if(W?_i(y,s):me=null,un($)&&(W=ki(y,s)||W),$==="trail"){let oe=!!Ue?.active;W=Fi(y)||W,oe&&!Ue?.active&&(se=!0)}if((be?.live||gt)&&(W=wi(y)||W,gt||(se=!0)),R.length&&Di(y)&&(W=!0),ie.length){for(let oe=ie.length-1;oe>=0;oe--)s-ie[oe].born>=2400&&ie.splice(oe,1);W=!0,ie.length||(se=!0)}c&&Ti(),p&&(W||se||k&&s-Tr>=Bt*Xo())&&(to(),Tr=s,se=!1,Rt&&(!Ye||O)&&(Rt=!1,mn())),(k||W||me||!p||ge&&O&&!h)&&(Qe=!0,aa(Ir)),Q&&!ke&&Q.end(s,performance.now()-u)}catch(p){At=!0,Ht(p)}};function he(){Qe||!ro()||(tr=performance.now(),Qe=!0,aa(Ir))}let Cn=(s,u)=>{let b=e.getBoundingClientRect();if(!b.width||!b.height)return null;let y=(s-b.left)/b.width,p=(u-b.top)/b.height;return y<-.05||y>1.05||p<-.05||p>1.05?null:[y,1-p]},_n=s=>{R.length&&!h&&(j.target=s?[s[0],1-s[1]]:null,he());let u=Jt(o);if(u==="none"||h){ue=null,we.target=null;return}if(un(u)){we.target=s?[s[0],1-s[1]]:null,ue=null,he();return}if(u==="trail"){let b=wa();if(!b)return;s?b.move(s[0],1-s[1],o.trail.radius,performance.now()):b.leave(),ue=null,he();return}if(!s){ue=null;return}ue&&(me=me?{from:me.from,to:s}:{from:ue,to:s}),ue=s,he()},Ii=s=>{s.type==="pointerdown"&&Oi(s);let u=Cn(s.clientX,s.clientY);no===window&&(ao.inside=!!u),_n(u)},Ui=()=>{ue=null,Ue?.leave(),j.target&&(j.target=null,he()),we.target&&(we.target=null,he())},no=t.interactionTarget??window,ao={target:no,move:Ii,leave:Ui,near:()=>P},Ct=[Vo(ao)];function Oi(s){if(o.tap==="none"||!O||!ve||h||Ve||bt()||s.button!==0||typeof Element<"u"&&s.target instanceof Element&&s.target.closest("button, a, input, select, summary, textarea, label"))return;let u=Cn(s.clientX,s.clientY);!u||u[0]<0||u[0]>1||u[1]<0||u[1]>1||(o.tap==="surface"?Ra(u[0],1-u[1],1):(ie=[...ie,{x:u[0],y:1-u[1],born:performance.now(),strength:1}].slice(-4),he()))}let Pn=()=>{let s=Lt();Ce(),c&&(st=!0,se=!0),(s||se)&&he()},Dn=l?jr(l.element,Pn):()=>{};Ct.push(jr(e,Pn),()=>Dn()),Ct.push(Jo(e,"25% 0px",s=>{P=s.isIntersecting,P&&(se=!0,he())})),Ct.push(jo(()=>{Sn=document.hidden,Sn||(se=!0,he())})),Ct.push($o(()=>{La=!!Sa?.matches,se=!0,he()})),Ct.push(Ko(Si)),cn(),Ct.push(()=>{c=null,cn()});let Gn=s=>{s?.preventDefault(),ke=!0,v||E(),Qe&&oa(Ir),Qe=!1},In=()=>{ke=!1,v?r=x.gl:E(),Q?.reset(),De.length=0,pe=null,Z=null,_=ee=K=null,q=null,C=[],U=[],H=null,te=!1,pt=null,Ue=null,wr=!1,Xt=null,zt=!1,Wt=null,be=null,gt=!1,ko(r),ct=void 0,Dr=lr=!1,Se=null,_e=!1,Ie=ze=0,st=!0;try{Va(),se=!0,he()}catch(s){Ht(s)}},oo={lost:()=>Gn(),restored:In,rescale:()=>{Lt()&&he()},size:()=>[V,ae],bytes:()=>{let s=J?4:8;return V*ae*4+rt+(q?q.columns*q.rows*(s*2+(q.glow?16/3:0)):0)+Te*$e*s*(te?6:C.length)+(Ue?Ue.width*Ue.height*4:0)}};v?x.join(oo):(e.addEventListener("webglcontextlost",Gn),e.addEventListener("webglcontextrestored",In));let Un=()=>{He&&(He.pause(),He.removeAttribute("src"),He.load(),He=null),dt&&O instanceof HTMLVideoElement&&"cancelVideoFrameCallback"in O&&O.cancelVideoFrameCallback(dt),dt=0},On=()=>{Xe?.close(),Xe=null},Bi=s=>{let u=s;if(!u.requestVideoFrameCallback)return;let b=()=>{Ve||O!==s||(nt=!0,he(),dt=u.requestVideoFrameCallback(b))};dt=u.requestVideoFrameCallback(b)},Wi=async s=>{let u=await createImageBitmap(s,{premultiplyAlpha:"none"}),b=[u.width,u.height],y=ci(u.width,u.height,V,ae,xe.height,o.fit);if(y===1)return{element:u,owned:!0,natural:b};try{return{element:await createImageBitmap(u,{resizeWidth:Math.max(1,Math.round(u.width*y)),resizeHeight:Math.max(1,Math.round(u.height*y)),resizeQuality:"medium",premultiplyAlpha:"none"}),owned:!0,natural:b}}finally{u.close()}},Bn=s=>new Promise((u,b)=>{let y=new Image;y.crossOrigin="anonymous",y.decoding="async",y.onload=()=>u({element:y,owned:!1}),y.onerror=()=>b(new Error("The glyph field could not load this image.")),y.src=s}),Ni=async s=>{if(typeof s!="string")return s instanceof HTMLImageElement&&!s.complete?s.decode().then(()=>({element:s,owned:!1})):s instanceof HTMLVideoElement&&s.readyState<2?new Promise((y,p)=>{s.addEventListener("loadeddata",()=>y({element:s,owned:!1}),{once:!0}),s.addEventListener("error",()=>p(new Error("The glyph field could not load this video.")),{once:!0})}):{element:s,owned:!1};if(Gl.test(s))return new Promise((y,p)=>{let k=document.createElement("video");k.crossOrigin="anonymous",k.muted=!0,k.loop=!0,k.playsInline=!0,k.preload="auto",k.addEventListener("loadeddata",()=>{k.play().catch(()=>{}),y({element:k,owned:!0})},{once:!0}),k.addEventListener("error",()=>p(new Error("The glyph field could not load this video.")),{once:!0}),k.src=s});if(typeof createImageBitmap!="function"||typeof fetch!="function")return Bn(s);let u;try{u=await(await fetch(s).then(y=>{if(!y.ok)throw new Error("The glyph field could not load this image.");return y})).blob()}catch(y){if(y instanceof Error&&y.message.startsWith("The glyph field"))throw y;return Bn(s)}if(!/svg/i.test(u.type))try{return await Wi(u)}catch{}let b=URL.createObjectURL(u);try{return await Bn(b)}finally{URL.revokeObjectURL(b)}},io=(s,u,b)=>{let{element:y,owned:p}=s;if(Ve||b!==Ye){p&&y instanceof HTMLVideoElement?(y.pause(),y.removeAttribute("src"),y.load()):p&&y.close();return}y!==O&&(Un(),On()),He=p&&y instanceof HTMLVideoElement?y:null,p&&!(y instanceof HTMLVideoElement)&&(Xe=y);let k=y!==O;O=y,ve=typeof u=="string"||u instanceof HTMLImageElement||u instanceof HTMLVideoElement,Fe=y instanceof HTMLVideoElement?y.videoHeight:y instanceof HTMLImageElement?y.naturalHeight:y.height,Ke=s.natural?.[0]??(y instanceof HTMLVideoElement?y.videoWidth:y instanceof HTMLImageElement?y.naturalWidth:y.width),de=s.natural?.[1]??Fe,nt=!0,k&&(ot=xt=-1/0),y instanceof HTMLVideoElement&&k&&Bi(y),ke||sr(),se=!0,he()},lo=(s,u)=>{Rt&&s===Ye&&(Rt=!1,mn()),Ht(u)},Hi=s=>typeof s!="string"&&!(s instanceof HTMLImageElement&&!s.complete)&&!(s instanceof HTMLVideoElement&&s.readyState<2),Wn=s=>{let u=++Ye;if(!s)return Un(),On(),O=null,Ke=de=Fe=rt=0,ve=!1,se=!0,he(),Promise.resolve();if(Hi(s)){try{io({element:s,owned:!1},s,u)}catch(b){lo(u,b)}return Promise.resolve()}return Ni(s).then(b=>io(b,s,u),b=>lo(u,b))};Va(),Ce();let so=t.source??null;return so?(Ye=1,Wn(so)):he(),{canvas:e,ready:Ai,get settings(){return o},update(s){let u=o,{element:b,rest:y}=a(s);if("clear"in s&&l?.element!==b?.element?(Dn(),l=b,Dn=b?jr(b.element,Pn):()=>{}):"clear"in s&&(l=b),"clear"in s){let $=i(s.clear)?s.clear:null;$!==c&&(c=$,st=!0,se=!0,cn(),he())}o=ma(b?{...y,clear:o.clear}:y,o),Ce(),s.label&&e.setAttribute("aria-label",s.label),o.maxPixelRatio!==u.maxPixelRatio&&Lt(),(o.charset!==u.charset||o.cellSize!==u.cellSize||o.cellAspect!==u.cellAspect||o.font!==u.font||o.fontWeight!==u.fontWeight||o.glyphScale!==u.glyphScale)&&(Mn(),Fn()),o.levels!==u.levels&&wn(),o.scope!==u.scope&&!ke&&(kn(),xt=performance.now()),((!!u.fluid&&Jt(u)==="fluid")!==bn()||o.fluid&&u.fluid&&o.fluid.resolution!==u.fluid.resolution)&&Da(),"source"in s&&Wn(s.source??null),"live"in s&&(ge=!!s.live),"effects"in s&&!ql(s.effects??[],R)?(Ln(s.effects??[]),ke||Sr()):(o.mark!==u.mark||vn(o)!==or)&&!ke&&(ee&&!v&&r.deleteProgram(ee.program),Rr=It.indexOf(o.mark),or=vn(o),ee=ar(fr(Rr,or))),se=!0,he()},setSource:Wn,pointer(s,u=0){if(s===null){_n(null);return}let b=e.getBoundingClientRect();_n(Cn(b.left+s,b.top+u))},redraw(){if(!(Ve||ke||At||!V))try{pn(!(Rt&&(v?x.canCompileInParallel:ne)))&&(ge&&O&&!(O instanceof HTMLVideoElement)&&sr(),to(),Rt||(se=!1))}catch(s){At=!0,Ht(s)}},pulse(s={}){if(Ve||bt())return;let u=e.getBoundingClientRect();if(!u.width||!u.height)return;let b=s.x??u.width/2,y=s.y??u.height/2;if(s.element){let k=s.element.getBoundingClientRect();b=k.left+k.width/2-u.left,y=k.top+k.height/2-u.top}let p=Math.max(0,Math.min(2,s.strength??1));if(o.tap==="surface"&&O&&ve){Ra(b/u.width,y/u.height,p);return}ie=[...ie,{x:b/u.width,y:y/u.height,born:performance.now(),strength:p}].slice(-4),he()},play(){h=!1,O instanceof HTMLVideoElement&&O.play().catch(()=>{}),se=!0,he()},pause(){h=!0,O instanceof HTMLVideoElement&&O.pause()},resize(){Lt()&&he()},destroy(){if(!Ve){if(Ve=!0,v||va--,Qe&&oa(Ir),Qe=!1,Ct.forEach(s=>s()),ce.forEach(s=>s()),v?x.leave(oo):(e.removeEventListener("webglcontextlost",Gn),e.removeEventListener("webglcontextrestored",In)),Un(),On(),O=null,!ke)if(xn(),gn(),r.deleteTexture(D),pt&&r.deleteTexture(pt),Xt&&r.deleteTexture(Xt),Vt?.dispose(),ct?.dispose(),St&&r.deleteTexture(St),Se&&r.deleteTexture(Se),v)x.releaseAtlas(Z,yn),H?.release();else{r.deleteTexture(S);for(let s of[_,ee,K])s&&r.deleteProgram(s.program);H?.dispose(),De.forEach(s=>r.deleteShader(s)),le&&r.deleteVertexArray(le),Y&&r.getExtension("WEBGL_lose_context")?.loseContext()}Z=null}}}}var kt=(e,t=[])=>self.postMessage(e,t),Ne=null,Ot=null,yi=null,er=!1,ln=new Map,Mi=new Map,sn=new Set,Vl=e=>\`\${e.charset}\\0\${e.fontWeight} \${e.font}\\0\${e.glyphScale}\`,jl=Ut.atlas,$l=Ut.shapes;Ut.atlas=(e,t,n)=>{let a=bi(e,t),i=ln.get(a);return i?{image:i,final:!0}:(sn.has(a)||(sn.add(a),kt({type:"atlas",key:a,settings:e,layout:t})),{...jl(e,t,n),final:!1})};Ut.shapes=e=>{let t=Vl(e),n=Mi.get(t);return n||(sn.has(\`shapes:\${t}\`)||(sn.add(\`shapes:\${t}\`),kt({type:"shapes",key:t,settings:e})),$l(e))};var Ei=()=>{let e=Ne?.settings.font.split(",")[0]?.trim().replace(/^["']|["']$/g,"");e&&Xn.announce(e)},Kl=e=>{let t="displayWidth"in e?e.displayWidth:e.width,n="displayHeight"in e?e.displayHeight:e.height;Ot??(Ot=new OffscreenCanvas(t,n)),(Ot.width!==t||Ot.height!==n)&&(Ot.width=t,Ot.height=n),yi??(yi=Ot.getContext("2d")),yi?.drawImage(e,0,0),e.close()};self.onmessage=({data:e})=>{try{switch(e.type){case"init":{self.devicePixelRatio=e.ratio,$n(...e.box),qn(e.hidden),Vn(e.reducedMotion,e.darkScheme),Kn(e.visible),er=e.streaming;let t=po(e.canvas);Ne=vi(t,{...e.options,context:"own",live:er,source:e.url??null,onError:n=>kt({type:"error",message:n.message})}),Ne.ready.then(()=>kt({type:"ready"}),n=>kt({type:"error",message:String(n?.message??n)}));break}case"box":$n(...e.box);break;case"visible":Kn(e.value);break;case"hidden":qn(e.value);break;case"media":Vn(e.reducedMotion,e.darkScheme);break;case"ratio":self.devicePixelRatio=e.value,Ne?.resize();break;case"pointer":mo(e.event,{clientX:e.clientX,clientY:e.clientY,pointerType:e.pointerType,buttons:e.buttons});break;case"frame":{if(Kl(e.frame),Ma||(Ma=!0,requestAnimationFrame(()=>requestAnimationFrame(()=>{Ma=!1,kt({type:"took"})}))),!Ne)break;e.streaming!==er&&(er=e.streaming,Ne.update({live:er})),(!er||!Ea)&&(Ne.setSource(Ot),Ea=!0);break}case"url":Ea=!1,Ne?.setSource(e.url);break;case"update":Ne?.update(e.options);break;case"call":{Ne?.[e.method]?.apply(Ne,e.args);break}case"atlas":ln.set(e.key,e.image),Ei();break;case"shapes":Mi.set(e.key,e.data),Ei();break;case"destroy":Ne?.destroy(),Ne=null;for(let t of ln.values())t.close();ln.clear(),self.close();break}}catch(t){kt({type:"error",message:String(t?.message??t)})}};var Ea=!1,Ma=!1;kt({type:"loaded"});})();
`});var zp=0,Su=1,Gp=2;var oo=1,Hp=2,ea=3,Si=0,Xn=1,mi=2,Wi=0,es=1,Tu=2,Eu=3,Au=4,Vp=5,Pr=100,Wp=101,Xp=102,qp=103,jp=104,Yp=200,Kp=201,$p=202,Jp=203,gl=204,xl=205,Zp=206,Qp=207,em=208,tm=209,nm=210,im=211,rm=212,sm=213,am=214,Ul=0,Nl=1,Ol=2,ts=3,Bl=4,zl=5,Gl=6,Hl=7,Ru=0,om=1,lm=2,Ai=0,Cu=1,Pu=2,Iu=3,lo=4,Fu=5,Lu=6,Du=7,du="attached",cm="detached",ku=300,Dr=301,cs=302,Vl=303,Wl=304,co=306,Ir=1e3,di=1001,Bs=1002,fn=1003,Xl=1004;var hs=1005;var dn=1006,ta=1007;var Ri=1008;var Zn=1009,Uu=1010,Nu=1011,na=1012,ql=1013,Ci=1014,oi=1015,Xi=1016,jl=1017,Yl=1018,ia=1020,Ou=35902,Bu=35899,zu=1021,Gu=1022,li=1023,Oi=1026,kr=1027,Kl=1028,$l=1029,us=1030,Jl=1031;var Zl=1033,ho=33776,uo=33777,fo=33778,po=33779,Ql=35840,ec=35841,tc=35842,nc=35843,ic=36196,rc=37492,sc=37496,ac=37488,oc=37489,lc=37490,cc=37491,hc=37808,uc=37809,fc=37810,dc=37811,pc=37812,mc=37813,gc=37814,xc=37815,vc=37816,bc=37817,yc=37818,_c=37819,Mc=37820,wc=37821,Sc=36492,Tc=36494,Ec=36495,Ac=36283,Rc=36284,Cc=36285,Pc=36286;var ns=2300,is=2301,ml=2302,pu=2400,mu=2401,gu=2402,hm=2500;var Hu=0,mo=1,ra=2,um=3200;var Vu=0,fm=1,dr="",un="srgb",Pn="srgb-linear",Da="linear",jt="srgb";var Qr=7680;var xu=519,dm=512,pm=513,mm=514,Ic=515,gm=516,xm=517,Fc=518,vm=519,vl=35044;var Wu="300 es",Mi=2e3,ka=2001;function Xu(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function T0(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function zs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function bm(){let i=zs("canvas");return i.style.display="block",i}var sp={},Gs=null;function Ua(...i){let e="THREE."+i.shift();Gs?Gs("log",e,...i):console.log(e,...i)}function ct(...i){let e="THREE."+i.shift();Gs?Gs("warn",e,...i):console.warn(e,...i)}function bt(...i){let e="THREE."+i.shift();Gs?Gs("error",e,...i):console.error(e,...i)}function Hs(...i){let e=i.join(" ");e in sp||(sp[e]=!0,ct(...i))}function ym(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}var or=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let r=n.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}},Un=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ap=1234567,Fa=Math.PI/180,rs=180/Math.PI;function wi(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Un[i&255]+Un[i>>8&255]+Un[i>>16&255]+Un[i>>24&255]+"-"+Un[e&255]+Un[e>>8&255]+"-"+Un[e>>16&15|64]+Un[e>>24&255]+"-"+Un[t&63|128]+Un[t>>8&255]+"-"+Un[t>>16&255]+Un[t>>24&255]+Un[n&255]+Un[n>>8&255]+Un[n>>16&255]+Un[n>>24&255]).toLowerCase()}function Nt(i,e,t){return Math.max(e,Math.min(t,i))}function qu(i,e){return(i%e+e)%e}function E0(i,e,t,n,r){return n+(i-e)*(r-n)/(t-e)}function A0(i,e,t){return i!==e?(t-i)/(e-i):0}function La(i,e,t){return(1-t)*i+t*e}function R0(i,e,t,n){return La(i,e,1-Math.exp(-t*n))}function C0(i,e=1){return e-Math.abs(qu(i,e*2)-e)}function P0(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function I0(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function F0(i,e){return i+Math.floor(Math.random()*(e-i+1))}function L0(i,e){return i+Math.random()*(e-i)}function D0(i){return i*(.5-Math.random())}function k0(i){i!==void 0&&(ap=i);let e=ap+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function U0(i){return i*Fa}function N0(i){return i*rs}function O0(i){return(i&i-1)===0&&i!==0}function B0(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function z0(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function G0(i,e,t,n,r){let s=Math.cos,a=Math.sin,o=s(t/2),c=a(t/2),h=s((e+n)/2),u=a((e+n)/2),f=s((e-n)/2),d=a((e-n)/2),p=s((n-e)/2),m=a((n-e)/2);switch(r){case"XYX":i.set(o*u,c*f,c*d,o*h);break;case"YZY":i.set(c*d,o*u,c*f,o*h);break;case"ZXZ":i.set(c*f,c*d,o*u,o*h);break;case"XZX":i.set(o*u,c*m,c*p,o*h);break;case"YXY":i.set(c*p,o*u,c*m,o*h);break;case"ZYZ":i.set(c*m,c*p,o*u,o*h);break;default:ct("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function _i(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Kt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var sa={DEG2RAD:Fa,RAD2DEG:rs,generateUUID:wi,clamp:Nt,euclideanModulo:qu,mapLinear:E0,inverseLerp:A0,lerp:La,damp:R0,pingpong:C0,smoothstep:P0,smootherstep:I0,randInt:F0,randFloat:L0,randFloatSpread:D0,seededRandom:k0,degToRad:U0,radToDeg:N0,isPowerOfTwo:O0,ceilPowerOfTwo:B0,floorPowerOfTwo:z0,setQuaternionFromProperEuler:G0,normalize:Kt,denormalize:_i},zt=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Nt(this.x,e.x,t.x),this.y=Nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Nt(this.x,e,t),this.y=Nt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*r+e.x,this.y=s*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},pi=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,a,o){let c=n[r+0],h=n[r+1],u=n[r+2],f=n[r+3],d=s[a+0],p=s[a+1],m=s[a+2],x=s[a+3];if(o<=0){e[t+0]=c,e[t+1]=h,e[t+2]=u,e[t+3]=f;return}if(o>=1){e[t+0]=d,e[t+1]=p,e[t+2]=m,e[t+3]=x;return}if(f!==x||c!==d||h!==p||u!==m){let g=c*d+h*p+u*m+f*x;g<0&&(d=-d,p=-p,m=-m,x=-x,g=-g);let l=1-o;if(g<.9995){let w=Math.acos(g),T=Math.sin(w);l=Math.sin(l*w)/T,o=Math.sin(o*w)/T,c=c*l+d*o,h=h*l+p*o,u=u*l+m*o,f=f*l+x*o}else{c=c*l+d*o,h=h*l+p*o,u=u*l+m*o,f=f*l+x*o;let w=1/Math.sqrt(c*c+h*h+u*u+f*f);c*=w,h*=w,u*=w,f*=w}}e[t]=c,e[t+1]=h,e[t+2]=u,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,r,s,a){let o=n[r],c=n[r+1],h=n[r+2],u=n[r+3],f=s[a],d=s[a+1],p=s[a+2],m=s[a+3];return e[t]=o*m+u*f+c*p-h*d,e[t+1]=c*m+u*d+h*f-o*p,e[t+2]=h*m+u*p+o*d-c*f,e[t+3]=u*m-o*f-c*d-h*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,c=Math.sin,h=o(n/2),u=o(r/2),f=o(s/2),d=c(n/2),p=c(r/2),m=c(s/2);switch(a){case"XYZ":this._x=d*u*f+h*p*m,this._y=h*p*f-d*u*m,this._z=h*u*m+d*p*f,this._w=h*u*f-d*p*m;break;case"YXZ":this._x=d*u*f+h*p*m,this._y=h*p*f-d*u*m,this._z=h*u*m-d*p*f,this._w=h*u*f+d*p*m;break;case"ZXY":this._x=d*u*f-h*p*m,this._y=h*p*f+d*u*m,this._z=h*u*m+d*p*f,this._w=h*u*f-d*p*m;break;case"ZYX":this._x=d*u*f-h*p*m,this._y=h*p*f+d*u*m,this._z=h*u*m-d*p*f,this._w=h*u*f+d*p*m;break;case"YZX":this._x=d*u*f+h*p*m,this._y=h*p*f+d*u*m,this._z=h*u*m-d*p*f,this._w=h*u*f-d*p*m;break;case"XZY":this._x=d*u*f-h*p*m,this._y=h*p*f-d*u*m,this._z=h*u*m+d*p*f,this._w=h*u*f+d*p*m;break;default:ct("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],s=t[8],a=t[1],o=t[5],c=t[9],h=t[2],u=t[6],f=t[10],d=n+o+f;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(u-c)*p,this._y=(s-h)*p,this._z=(a-r)*p}else if(n>o&&n>f){let p=2*Math.sqrt(1+n-o-f);this._w=(u-c)/p,this._x=.25*p,this._y=(r+a)/p,this._z=(s+h)/p}else if(o>f){let p=2*Math.sqrt(1+o-n-f);this._w=(s-h)/p,this._x=(r+a)/p,this._y=.25*p,this._z=(c+u)/p}else{let p=2*Math.sqrt(1+f-n-o);this._w=(a-r)/p,this._x=(s+h)/p,this._y=(c+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Nt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,s=e._z,a=e._w,o=t._x,c=t._y,h=t._z,u=t._w;return this._x=n*u+a*o+r*h-s*c,this._y=r*u+a*c+s*o-n*h,this._z=s*u+a*h+n*c-r*o,this._w=a*u-n*o-r*c-s*h,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let n=e._x,r=e._y,s=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,s=-s,a=-a,o=-o);let c=1-t;if(o<.9995){let h=Math.acos(o),u=Math.sin(h);c=Math.sin(c*h)/u,t=Math.sin(t*h)/u,this._x=this._x*c+n*t,this._y=this._y*c+r*t,this._z=this._z*c+s*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+r*t,this._z=this._z*c+s*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},W=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(op.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(op.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,s=e.x,a=e.y,o=e.z,c=e.w,h=2*(a*r-o*n),u=2*(o*t-s*r),f=2*(s*n-a*t);return this.x=t+c*h+a*f-o*u,this.y=n+c*u+o*h-s*f,this.z=r+c*f+s*u-a*h,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Nt(this.x,e.x,t.x),this.y=Nt(this.y,e.y,t.y),this.z=Nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Nt(this.x,e,t),this.y=Nt(this.y,e,t),this.z=Nt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,s=e.z,a=t.x,o=t.y,c=t.z;return this.x=r*c-s*o,this.y=s*a-n*c,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Gh.copy(this).projectOnVector(e),this.sub(Gh)}reflect(e){return this.sub(Gh.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Gh=new W,op=new pi,Ct=class i{constructor(e,t,n,r,s,a,o,c,h){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,c,h)}set(e,t,n,r,s,a,o,c,h){let u=this.elements;return u[0]=e,u[1]=r,u[2]=o,u[3]=t,u[4]=s,u[5]=c,u[6]=n,u[7]=a,u[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[3],c=n[6],h=n[1],u=n[4],f=n[7],d=n[2],p=n[5],m=n[8],x=r[0],g=r[3],l=r[6],w=r[1],T=r[4],y=r[7],E=r[2],R=r[5],P=r[8];return s[0]=a*x+o*w+c*E,s[3]=a*g+o*T+c*R,s[6]=a*l+o*y+c*P,s[1]=h*x+u*w+f*E,s[4]=h*g+u*T+f*R,s[7]=h*l+u*y+f*P,s[2]=d*x+p*w+m*E,s[5]=d*g+p*T+m*R,s[8]=d*l+p*y+m*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],c=e[6],h=e[7],u=e[8];return t*a*u-t*o*h-n*s*u+n*o*c+r*s*h-r*a*c}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],c=e[6],h=e[7],u=e[8],f=u*a-o*h,d=o*c-u*s,p=h*s-a*c,m=t*f+n*d+r*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/m;return e[0]=f*x,e[1]=(r*h-u*n)*x,e[2]=(o*n-r*a)*x,e[3]=d*x,e[4]=(u*t-r*c)*x,e[5]=(r*s-o*t)*x,e[6]=p*x,e[7]=(n*c-h*t)*x,e[8]=(a*t-n*s)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,a,o){let c=Math.cos(s),h=Math.sin(s);return this.set(n*c,n*h,-n*(c*a+h*o)+a+e,-r*h,r*c,-r*(-h*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Hh.makeScale(e,t)),this}rotate(e){return this.premultiply(Hh.makeRotation(-e)),this}translate(e,t){return this.premultiply(Hh.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Hh=new Ct,lp=new Ct().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),cp=new Ct().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function H0(){let i={enabled:!0,workingColorSpace:Pn,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===jt&&(r.r=ar(r.r),r.g=ar(r.g),r.b=ar(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===jt&&(r.r=Os(r.r),r.g=Os(r.g),r.b=Os(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===dr?Da:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return Hs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return Hs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Pn]:{primaries:e,whitePoint:n,transfer:Da,toXYZ:lp,fromXYZ:cp,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:un},outputColorSpaceConfig:{drawingBufferColorSpace:un}},[un]:{primaries:e,whitePoint:n,transfer:jt,toXYZ:lp,fromXYZ:cp,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:un}}}),i}var Ut=H0();function ar(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Os(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ss,bl=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ss===void 0&&(Ss=zs("canvas")),Ss.width=e.width,Ss.height=e.height;let r=Ss.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=Ss}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=zs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=ar(s[a]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ar(t[n]/255)*255):t[n]=ar(t[n]);return{data:t,width:e.width,height:e.height}}else return ct("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},V0=0,Vs=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:V0++}),this.uuid=wi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(Vh(r[a].image)):s.push(Vh(r[a]))}else s=Vh(r);n.url=s}return t||(e.images[this.uuid]=n),n}};function Vh(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?bl.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(ct("Texture: Unable to serialize Texture."),{})}var W0=0,Wh=new W,Rn=class i extends or{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=di,r=di,s=dn,a=Ri,o=li,c=Zn,h=i.DEFAULT_ANISOTROPY,u=dr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:W0++}),this.uuid=wi(),this.name="",this.source=new Vs(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=h,this.format=o,this.internalFormat=null,this.type=c,this.offset=new zt(0,0),this.repeat=new zt(1,1),this.center=new zt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ct,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Wh).x}get height(){return this.source.getSize(Wh).y}get depth(){return this.source.getSize(Wh).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){ct(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){ct(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ku)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ir:e.x=e.x-Math.floor(e.x);break;case di:e.x=e.x<0?0:1;break;case Bs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ir:e.y=e.y-Math.floor(e.y);break;case di:e.y=e.y<0?0:1;break;case Bs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Rn.DEFAULT_IMAGE=null;Rn.DEFAULT_MAPPING=ku;Rn.DEFAULT_ANISOTROPY=1;var Qt=class i{constructor(e=0,t=0,n=0,r=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s,c=e.elements,h=c[0],u=c[4],f=c[8],d=c[1],p=c[5],m=c[9],x=c[2],g=c[6],l=c[10];if(Math.abs(u-d)<.01&&Math.abs(f-x)<.01&&Math.abs(m-g)<.01){if(Math.abs(u+d)<.1&&Math.abs(f+x)<.1&&Math.abs(m+g)<.1&&Math.abs(h+p+l-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let T=(h+1)/2,y=(p+1)/2,E=(l+1)/2,R=(u+d)/4,P=(f+x)/4,B=(m+g)/4;return T>y&&T>E?T<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(T),r=R/n,s=P/n):y>E?y<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(y),n=R/r,s=B/r):E<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(E),n=P/s,r=B/s),this.set(n,r,s,t),this}let w=Math.sqrt((g-m)*(g-m)+(f-x)*(f-x)+(d-u)*(d-u));return Math.abs(w)<.001&&(w=1),this.x=(g-m)/w,this.y=(f-x)/w,this.z=(d-u)/w,this.w=Math.acos((h+p+l-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Nt(this.x,e.x,t.x),this.y=Nt(this.y,e.y,t.y),this.z=Nt(this.z,e.z,t.z),this.w=Nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Nt(this.x,e,t),this.y=Nt(this.y,e,t),this.z=Nt(this.z,e,t),this.w=Nt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},yl=class extends or{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:dn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Qt(0,0,e,t),this.scissorTest=!1,this.viewport=new Qt(0,0,e,t);let r={width:e,height:t,depth:n.depth},s=new Rn(r);this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:dn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let r=Object.assign({},e.textures[t].image);this.textures[t].source=new Vs(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},si=class extends yl{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Na=class extends Rn{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=fn,this.minFilter=fn,this.wrapR=di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var _l=class extends Rn{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=fn,this.minFilter=fn,this.wrapR=di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var In=class{constructor(e=new W(1/0,1/0,1/0),t=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(vi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(vi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=vi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,vi):vi.fromBufferAttribute(s,a),vi.applyMatrix4(e.matrixWorld),this.expandByPoint(vi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Xo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Xo.copy(n.boundingBox)),Xo.applyMatrix4(e.matrixWorld),this.union(Xo)}let r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,vi),vi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ta),qo.subVectors(this.max,Ta),Ts.subVectors(e.a,Ta),Es.subVectors(e.b,Ta),As.subVectors(e.c,Ta),wr.subVectors(Es,Ts),Sr.subVectors(As,Es),Kr.subVectors(Ts,As);let t=[0,-wr.z,wr.y,0,-Sr.z,Sr.y,0,-Kr.z,Kr.y,wr.z,0,-wr.x,Sr.z,0,-Sr.x,Kr.z,0,-Kr.x,-wr.y,wr.x,0,-Sr.y,Sr.x,0,-Kr.y,Kr.x,0];return!Xh(t,Ts,Es,As,qo)||(t=[1,0,0,0,1,0,0,0,1],!Xh(t,Ts,Es,As,qo))?!1:(jo.crossVectors(wr,Sr),t=[jo.x,jo.y,jo.z],Xh(t,Ts,Es,As,qo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,vi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(vi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(er[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),er[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),er[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),er[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),er[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),er[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),er[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),er[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(er),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},er=[new W,new W,new W,new W,new W,new W,new W,new W],vi=new W,Xo=new In,Ts=new W,Es=new W,As=new W,wr=new W,Sr=new W,Kr=new W,Ta=new W,qo=new W,jo=new W,$r=new W;function Xh(i,e,t,n,r){for(let s=0,a=i.length-3;s<=a;s+=3){$r.fromArray(i,s);let o=r.x*Math.abs($r.x)+r.y*Math.abs($r.y)+r.z*Math.abs($r.z),c=e.dot($r),h=t.dot($r),u=n.dot($r);if(Math.max(-Math.max(c,h,u),Math.min(c,h,u))>o)return!1}return!0}var X0=new In,Ea=new W,qh=new W,Yn=class{constructor(e=new W,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):X0.setFromPoints(e).getCenter(n);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ea.subVectors(e,this.center);let t=Ea.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Ea,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(qh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ea.copy(e.center).add(qh)),this.expandByPoint(Ea.copy(e.center).sub(qh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},tr=new W,jh=new W,Yo=new W,Tr=new W,Yh=new W,Ko=new W,Kh=new W,ss=class{constructor(e=new W,t=new W(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,tr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=tr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(tr.copy(this.origin).addScaledVector(this.direction,t),tr.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){jh.copy(e).add(t).multiplyScalar(.5),Yo.copy(t).sub(e).normalize(),Tr.copy(this.origin).sub(jh);let s=e.distanceTo(t)*.5,a=-this.direction.dot(Yo),o=Tr.dot(this.direction),c=-Tr.dot(Yo),h=Tr.lengthSq(),u=Math.abs(1-a*a),f,d,p,m;if(u>0)if(f=a*c-o,d=a*o-c,m=s*u,f>=0)if(d>=-m)if(d<=m){let x=1/u;f*=x,d*=x,p=f*(f+a*d+2*o)+d*(a*f+d+2*c)+h}else d=s,f=Math.max(0,-(a*d+o)),p=-f*f+d*(d+2*c)+h;else d=-s,f=Math.max(0,-(a*d+o)),p=-f*f+d*(d+2*c)+h;else d<=-m?(f=Math.max(0,-(-a*s+o)),d=f>0?-s:Math.min(Math.max(-s,-c),s),p=-f*f+d*(d+2*c)+h):d<=m?(f=0,d=Math.min(Math.max(-s,-c),s),p=d*(d+2*c)+h):(f=Math.max(0,-(a*s+o)),d=f>0?s:Math.min(Math.max(-s,-c),s),p=-f*f+d*(d+2*c)+h);else d=a>0?-s:s,f=Math.max(0,-(a*d+o)),p=-f*f+d*(d+2*c)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,f),r&&r.copy(jh).addScaledVector(Yo,d),p}intersectSphere(e,t){tr.subVectors(e.center,this.origin);let n=tr.dot(this.direction),r=tr.dot(tr)-n*n,s=e.radius*e.radius;if(r>s)return null;let a=Math.sqrt(s-r),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,a,o,c,h=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,d=this.origin;return h>=0?(n=(e.min.x-d.x)*h,r=(e.max.x-d.x)*h):(n=(e.max.x-d.x)*h,r=(e.min.x-d.x)*h),u>=0?(s=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),n>a||s>r||((s>n||isNaN(n))&&(n=s),(a<r||isNaN(r))&&(r=a),f>=0?(o=(e.min.z-d.z)*f,c=(e.max.z-d.z)*f):(o=(e.max.z-d.z)*f,c=(e.min.z-d.z)*f),n>c||o>r)||((o>n||n!==n)&&(n=o),(c<r||r!==r)&&(r=c),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,tr)!==null}intersectTriangle(e,t,n,r,s){Yh.subVectors(t,e),Ko.subVectors(n,e),Kh.crossVectors(Yh,Ko);let a=this.direction.dot(Kh),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Tr.subVectors(this.origin,e);let c=o*this.direction.dot(Ko.crossVectors(Tr,Ko));if(c<0)return null;let h=o*this.direction.dot(Yh.cross(Tr));if(h<0||c+h>a)return null;let u=-o*Tr.dot(Kh);return u<0?null:this.at(u/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},It=class i{constructor(e,t,n,r,s,a,o,c,h,u,f,d,p,m,x,g){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,c,h,u,f,d,p,m,x,g)}set(e,t,n,r,s,a,o,c,h,u,f,d,p,m,x,g){let l=this.elements;return l[0]=e,l[4]=t,l[8]=n,l[12]=r,l[1]=s,l[5]=a,l[9]=o,l[13]=c,l[2]=h,l[6]=u,l[10]=f,l[14]=d,l[3]=p,l[7]=m,l[11]=x,l[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Rs.setFromMatrixColumn(e,0).length(),s=1/Rs.setFromMatrixColumn(e,1).length(),a=1/Rs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(r),h=Math.sin(r),u=Math.cos(s),f=Math.sin(s);if(e.order==="XYZ"){let d=a*u,p=a*f,m=o*u,x=o*f;t[0]=c*u,t[4]=-c*f,t[8]=h,t[1]=p+m*h,t[5]=d-x*h,t[9]=-o*c,t[2]=x-d*h,t[6]=m+p*h,t[10]=a*c}else if(e.order==="YXZ"){let d=c*u,p=c*f,m=h*u,x=h*f;t[0]=d+x*o,t[4]=m*o-p,t[8]=a*h,t[1]=a*f,t[5]=a*u,t[9]=-o,t[2]=p*o-m,t[6]=x+d*o,t[10]=a*c}else if(e.order==="ZXY"){let d=c*u,p=c*f,m=h*u,x=h*f;t[0]=d-x*o,t[4]=-a*f,t[8]=m+p*o,t[1]=p+m*o,t[5]=a*u,t[9]=x-d*o,t[2]=-a*h,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let d=a*u,p=a*f,m=o*u,x=o*f;t[0]=c*u,t[4]=m*h-p,t[8]=d*h+x,t[1]=c*f,t[5]=x*h+d,t[9]=p*h-m,t[2]=-h,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let d=a*c,p=a*h,m=o*c,x=o*h;t[0]=c*u,t[4]=x-d*f,t[8]=m*f+p,t[1]=f,t[5]=a*u,t[9]=-o*u,t[2]=-h*u,t[6]=p*f+m,t[10]=d-x*f}else if(e.order==="XZY"){let d=a*c,p=a*h,m=o*c,x=o*h;t[0]=c*u,t[4]=-f,t[8]=h*u,t[1]=d*f+x,t[5]=a*u,t[9]=p*f-m,t[2]=m*f-p,t[6]=o*u,t[10]=x*f+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(q0,e,j0)}lookAt(e,t,n){let r=this.elements;return ii.subVectors(e,t),ii.lengthSq()===0&&(ii.z=1),ii.normalize(),Er.crossVectors(n,ii),Er.lengthSq()===0&&(Math.abs(n.z)===1?ii.x+=1e-4:ii.z+=1e-4,ii.normalize(),Er.crossVectors(n,ii)),Er.normalize(),$o.crossVectors(ii,Er),r[0]=Er.x,r[4]=$o.x,r[8]=ii.x,r[1]=Er.y,r[5]=$o.y,r[9]=ii.y,r[2]=Er.z,r[6]=$o.z,r[10]=ii.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[4],c=n[8],h=n[12],u=n[1],f=n[5],d=n[9],p=n[13],m=n[2],x=n[6],g=n[10],l=n[14],w=n[3],T=n[7],y=n[11],E=n[15],R=r[0],P=r[4],B=r[8],M=r[12],_=r[1],F=r[5],z=r[9],L=r[13],D=r[2],H=r[6],Y=r[10],G=r[14],re=r[3],fe=r[7],ge=r[11],Te=r[15];return s[0]=a*R+o*_+c*D+h*re,s[4]=a*P+o*F+c*H+h*fe,s[8]=a*B+o*z+c*Y+h*ge,s[12]=a*M+o*L+c*G+h*Te,s[1]=u*R+f*_+d*D+p*re,s[5]=u*P+f*F+d*H+p*fe,s[9]=u*B+f*z+d*Y+p*ge,s[13]=u*M+f*L+d*G+p*Te,s[2]=m*R+x*_+g*D+l*re,s[6]=m*P+x*F+g*H+l*fe,s[10]=m*B+x*z+g*Y+l*ge,s[14]=m*M+x*L+g*G+l*Te,s[3]=w*R+T*_+y*D+E*re,s[7]=w*P+T*F+y*H+E*fe,s[11]=w*B+T*z+y*Y+E*ge,s[15]=w*M+T*L+y*G+E*Te,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],a=e[1],o=e[5],c=e[9],h=e[13],u=e[2],f=e[6],d=e[10],p=e[14],m=e[3],x=e[7],g=e[11],l=e[15],w=c*p-h*d,T=o*p-h*f,y=o*d-c*f,E=a*p-h*u,R=a*d-c*u,P=a*f-o*u;return t*(x*w-g*T+l*y)-n*(m*w-g*E+l*R)+r*(m*T-x*E+l*P)-s*(m*y-x*R+g*P)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],c=e[6],h=e[7],u=e[8],f=e[9],d=e[10],p=e[11],m=e[12],x=e[13],g=e[14],l=e[15],w=f*g*h-x*d*h+x*c*p-o*g*p-f*c*l+o*d*l,T=m*d*h-u*g*h-m*c*p+a*g*p+u*c*l-a*d*l,y=u*x*h-m*f*h+m*o*p-a*x*p-u*o*l+a*f*l,E=m*f*c-u*x*c-m*o*d+a*x*d+u*o*g-a*f*g,R=t*w+n*T+r*y+s*E;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let P=1/R;return e[0]=w*P,e[1]=(x*d*s-f*g*s-x*r*p+n*g*p+f*r*l-n*d*l)*P,e[2]=(o*g*s-x*c*s+x*r*h-n*g*h-o*r*l+n*c*l)*P,e[3]=(f*c*s-o*d*s-f*r*h+n*d*h+o*r*p-n*c*p)*P,e[4]=T*P,e[5]=(u*g*s-m*d*s+m*r*p-t*g*p-u*r*l+t*d*l)*P,e[6]=(m*c*s-a*g*s-m*r*h+t*g*h+a*r*l-t*c*l)*P,e[7]=(a*d*s-u*c*s+u*r*h-t*d*h-a*r*p+t*c*p)*P,e[8]=y*P,e[9]=(m*f*s-u*x*s-m*n*p+t*x*p+u*n*l-t*f*l)*P,e[10]=(a*x*s-m*o*s+m*n*h-t*x*h-a*n*l+t*o*l)*P,e[11]=(u*o*s-a*f*s-u*n*h+t*f*h+a*n*p-t*o*p)*P,e[12]=E*P,e[13]=(u*x*r-m*f*r+m*n*d-t*x*d-u*n*g+t*f*g)*P,e[14]=(m*o*r-a*x*r-m*n*c+t*x*c+a*n*g-t*o*g)*P,e[15]=(a*f*r-u*o*r+u*n*c-t*f*c-a*n*d+t*o*d)*P,this}scale(e){let t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),s=1-n,a=e.x,o=e.y,c=e.z,h=s*a,u=s*o;return this.set(h*a+n,h*o-r*c,h*c+r*o,0,h*o+r*c,u*o+n,u*c-r*a,0,h*c-r*o,u*c+r*a,s*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,a){return this.set(1,n,s,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,s=t._x,a=t._y,o=t._z,c=t._w,h=s+s,u=a+a,f=o+o,d=s*h,p=s*u,m=s*f,x=a*u,g=a*f,l=o*f,w=c*h,T=c*u,y=c*f,E=n.x,R=n.y,P=n.z;return r[0]=(1-(x+l))*E,r[1]=(p+y)*E,r[2]=(m-T)*E,r[3]=0,r[4]=(p-y)*R,r[5]=(1-(d+l))*R,r[6]=(g+w)*R,r[7]=0,r[8]=(m+T)*P,r[9]=(g-w)*P,r[10]=(1-(d+x))*P,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;if(e.x=r[12],e.y=r[13],e.z=r[14],this.determinant()===0)return n.set(1,1,1),t.identity(),this;let s=Rs.set(r[0],r[1],r[2]).length(),a=Rs.set(r[4],r[5],r[6]).length(),o=Rs.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),bi.copy(this);let h=1/s,u=1/a,f=1/o;return bi.elements[0]*=h,bi.elements[1]*=h,bi.elements[2]*=h,bi.elements[4]*=u,bi.elements[5]*=u,bi.elements[6]*=u,bi.elements[8]*=f,bi.elements[9]*=f,bi.elements[10]*=f,t.setFromRotationMatrix(bi),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,r,s,a,o=Mi,c=!1){let h=this.elements,u=2*s/(t-e),f=2*s/(n-r),d=(t+e)/(t-e),p=(n+r)/(n-r),m,x;if(c)m=s/(a-s),x=a*s/(a-s);else if(o===Mi)m=-(a+s)/(a-s),x=-2*a*s/(a-s);else if(o===ka)m=-a/(a-s),x=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return h[0]=u,h[4]=0,h[8]=d,h[12]=0,h[1]=0,h[5]=f,h[9]=p,h[13]=0,h[2]=0,h[6]=0,h[10]=m,h[14]=x,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,t,n,r,s,a,o=Mi,c=!1){let h=this.elements,u=2/(t-e),f=2/(n-r),d=-(t+e)/(t-e),p=-(n+r)/(n-r),m,x;if(c)m=1/(a-s),x=a/(a-s);else if(o===Mi)m=-2/(a-s),x=-(a+s)/(a-s);else if(o===ka)m=-1/(a-s),x=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return h[0]=u,h[4]=0,h[8]=0,h[12]=d,h[1]=0,h[5]=f,h[9]=0,h[13]=p,h[2]=0,h[6]=0,h[10]=m,h[14]=x,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Rs=new W,bi=new It,q0=new W(0,0,0),j0=new W(1,1,1),Er=new W,$o=new W,ii=new W,hp=new It,up=new pi,Ti=class i{constructor(e=0,t=0,n=0,r=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,s=r[0],a=r[4],o=r[8],c=r[1],h=r[5],u=r[9],f=r[2],d=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(Nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(d,h),this._z=0);break;case"YXZ":this._x=Math.asin(-Nt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,h)):(this._y=Math.atan2(-f,s),this._z=0);break;case"ZXY":this._x=Math.asin(Nt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-a,h)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-Nt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,h));break;case"YZX":this._z=Math.asin(Nt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,h),this._y=Math.atan2(-f,s)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,h),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:ct("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return hp.makeRotationFromQuaternion(e),this.setFromRotationMatrix(hp,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return up.setFromEuler(this),this.setFromQuaternion(up,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ti.DEFAULT_ORDER="XYZ";var Oa=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Y0=0,fp=new W,Cs=new pi,nr=new It,Jo=new W,Aa=new W,K0=new W,$0=new pi,dp=new W(1,0,0),pp=new W(0,1,0),mp=new W(0,0,1),gp={type:"added"},J0={type:"removed"},Ps={type:"childadded",child:null},$h={type:"childremoved",child:null},on=class i extends or{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Y0++}),this.uuid=wi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new W,t=new Ti,n=new pi,r=new W(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new It},normalMatrix:{value:new Ct}}),this.matrix=new It,this.matrixWorld=new It,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Oa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Cs.setFromAxisAngle(e,t),this.quaternion.multiply(Cs),this}rotateOnWorldAxis(e,t){return Cs.setFromAxisAngle(e,t),this.quaternion.premultiply(Cs),this}rotateX(e){return this.rotateOnAxis(dp,e)}rotateY(e){return this.rotateOnAxis(pp,e)}rotateZ(e){return this.rotateOnAxis(mp,e)}translateOnAxis(e,t){return fp.copy(e).applyQuaternion(this.quaternion),this.position.add(fp.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(dp,e)}translateY(e){return this.translateOnAxis(pp,e)}translateZ(e){return this.translateOnAxis(mp,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(nr.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Jo.copy(e):Jo.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Aa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?nr.lookAt(Aa,Jo,this.up):nr.lookAt(Jo,Aa,this.up),this.quaternion.setFromRotationMatrix(nr),r&&(nr.extractRotation(r.matrixWorld),Cs.setFromRotationMatrix(nr),this.quaternion.premultiply(Cs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(bt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(gp),Ps.child=e,this.dispatchEvent(Ps),Ps.child=null):bt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(J0),$h.child=e,this.dispatchEvent($h),$h.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),nr.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),nr.multiply(e.parent.matrixWorld)),e.applyMatrix4(nr),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(gp),Ps.child=e,this.dispatchEvent(Ps),Ps.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Aa,e,K0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Aa,$0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let h=0,u=c.length;h<u;h++){let f=c[h];s(e.shapes,f)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,h=this.material.length;c<h;c++)o.push(s(e.materials,this.material[c]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];r.animations.push(s(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),h=a(e.textures),u=a(e.images),f=a(e.shapes),d=a(e.skeletons),p=a(e.animations),m=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),h.length>0&&(n.textures=h),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),m.length>0&&(n.nodes=m)}return n.object=r,n;function a(o){let c=[];for(let h in o){let u=o[h];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let r=e.children[n];this.add(r.clone())}return this}};on.DEFAULT_UP=new W(0,1,0);on.DEFAULT_MATRIX_AUTO_UPDATE=!0;on.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var yi=new W,ir=new W,Jh=new W,rr=new W,Is=new W,Fs=new W,xp=new W,Zh=new W,Qh=new W,eu=new W,tu=new Qt,nu=new Qt,iu=new Qt,Cr=class i{constructor(e=new W,t=new W,n=new W){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),yi.subVectors(e,t),r.cross(yi);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){yi.subVectors(r,t),ir.subVectors(n,t),Jh.subVectors(e,t);let a=yi.dot(yi),o=yi.dot(ir),c=yi.dot(Jh),h=ir.dot(ir),u=ir.dot(Jh),f=a*h-o*o;if(f===0)return s.set(0,0,0),null;let d=1/f,p=(h*c-o*u)*d,m=(a*u-o*c)*d;return s.set(1-p-m,m,p)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,rr)===null?!1:rr.x>=0&&rr.y>=0&&rr.x+rr.y<=1}static getInterpolation(e,t,n,r,s,a,o,c){return this.getBarycoord(e,t,n,r,rr)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,rr.x),c.addScaledVector(a,rr.y),c.addScaledVector(o,rr.z),c)}static getInterpolatedAttribute(e,t,n,r,s,a){return tu.setScalar(0),nu.setScalar(0),iu.setScalar(0),tu.fromBufferAttribute(e,t),nu.fromBufferAttribute(e,n),iu.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(tu,s.x),a.addScaledVector(nu,s.y),a.addScaledVector(iu,s.z),a}static isFrontFacing(e,t,n,r){return yi.subVectors(n,t),ir.subVectors(e,t),yi.cross(ir).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return yi.subVectors(this.c,this.b),ir.subVectors(this.a,this.b),yi.cross(ir).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,s=this.c,a,o;Is.subVectors(r,n),Fs.subVectors(s,n),Zh.subVectors(e,n);let c=Is.dot(Zh),h=Fs.dot(Zh);if(c<=0&&h<=0)return t.copy(n);Qh.subVectors(e,r);let u=Is.dot(Qh),f=Fs.dot(Qh);if(u>=0&&f<=u)return t.copy(r);let d=c*f-u*h;if(d<=0&&c>=0&&u<=0)return a=c/(c-u),t.copy(n).addScaledVector(Is,a);eu.subVectors(e,s);let p=Is.dot(eu),m=Fs.dot(eu);if(m>=0&&p<=m)return t.copy(s);let x=p*h-c*m;if(x<=0&&h>=0&&m<=0)return o=h/(h-m),t.copy(n).addScaledVector(Fs,o);let g=u*m-p*f;if(g<=0&&f-u>=0&&p-m>=0)return xp.subVectors(s,r),o=(f-u)/(f-u+(p-m)),t.copy(r).addScaledVector(xp,o);let l=1/(g+x+d);return a=x*l,o=d*l,t.copy(n).addScaledVector(Is,a).addScaledVector(Fs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},_m={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ar={h:0,s:0,l:0},Zo={h:0,s:0,l:0};function ru(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var _t=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=un){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ut.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Ut.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ut.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Ut.workingColorSpace){if(e=qu(e,1),t=Nt(t,0,1),n=Nt(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=ru(a,s,e+1/3),this.g=ru(a,s,e),this.b=ru(a,s,e-1/3)}return Ut.colorSpaceToWorking(this,r),this}setStyle(e,t=un){function n(s){s!==void 0&&parseFloat(s)<1&&ct("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:ct("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);ct("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=un){let n=_m[e.toLowerCase()];return n!==void 0?this.setHex(n,t):ct("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ar(e.r),this.g=ar(e.g),this.b=ar(e.b),this}copyLinearToSRGB(e){return this.r=Os(e.r),this.g=Os(e.g),this.b=Os(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=un){return Ut.workingToColorSpace(Nn.copy(this),e),Math.round(Nt(Nn.r*255,0,255))*65536+Math.round(Nt(Nn.g*255,0,255))*256+Math.round(Nt(Nn.b*255,0,255))}getHexString(e=un){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ut.workingColorSpace){Ut.workingToColorSpace(Nn.copy(this),t);let n=Nn.r,r=Nn.g,s=Nn.b,a=Math.max(n,r,s),o=Math.min(n,r,s),c,h,u=(o+a)/2;if(o===a)c=0,h=0;else{let f=a-o;switch(h=u<=.5?f/(a+o):f/(2-a-o),a){case n:c=(r-s)/f+(r<s?6:0);break;case r:c=(s-n)/f+2;break;case s:c=(n-r)/f+4;break}c/=6}return e.h=c,e.s=h,e.l=u,e}getRGB(e,t=Ut.workingColorSpace){return Ut.workingToColorSpace(Nn.copy(this),t),e.r=Nn.r,e.g=Nn.g,e.b=Nn.b,e}getStyle(e=un){Ut.workingToColorSpace(Nn.copy(this),e);let t=Nn.r,n=Nn.g,r=Nn.b;return e!==un?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Ar),this.setHSL(Ar.h+e,Ar.s+t,Ar.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ar),e.getHSL(Zo);let n=La(Ar.h,Zo.h,t),r=La(Ar.s,Zo.s,t),s=La(Ar.l,Zo.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Nn=new _t;_t.NAMES=_m;var Z0=0,Kn=class extends or{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Z0++}),this.uuid=wi(),this.name="",this.type="Material",this.blending=es,this.side=Si,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=gl,this.blendDst=xl,this.blendEquation=Pr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new _t(0,0,0),this.blendAlpha=0,this.depthFunc=ts,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=xu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Qr,this.stencilZFail=Qr,this.stencilZPass=Qr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){ct(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){ct(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==es&&(n.blending=this.blending),this.side!==Si&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==gl&&(n.blendSrc=this.blendSrc),this.blendDst!==xl&&(n.blendDst=this.blendDst),this.blendEquation!==Pr&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ts&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==xu&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Qr&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Qr&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Qr&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){let a=[];for(let o in s){let c=s[o];delete c.metadata,a.push(c)}return a}if(t){let s=r(e.textures),a=r(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Ei=class extends Kn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new _t(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ti,this.combine=Ru,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var gn=new W,Qo=new zt,Q0=0,xn=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Q0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=vl,this.updateRanges=[],this.gpuType=oi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Qo.fromBufferAttribute(this,t),Qo.applyMatrix3(e),this.setXY(t,Qo.x,Qo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)gn.fromBufferAttribute(this,t),gn.applyMatrix3(e),this.setXYZ(t,gn.x,gn.y,gn.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)gn.fromBufferAttribute(this,t),gn.applyMatrix4(e),this.setXYZ(t,gn.x,gn.y,gn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)gn.fromBufferAttribute(this,t),gn.applyNormalMatrix(e),this.setXYZ(t,gn.x,gn.y,gn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)gn.fromBufferAttribute(this,t),gn.transformDirection(e),this.setXYZ(t,gn.x,gn.y,gn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=_i(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Kt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=_i(t,this.array)),t}setX(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=_i(t,this.array)),t}setY(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=_i(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=_i(t,this.array)),t}setW(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array),r=Kt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array),r=Kt(r,this.array),s=Kt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==vl&&(e.usage=this.usage),e}};var Ba=class extends xn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var za=class extends xn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Vn=class extends xn{constructor(e,t,n){super(new Float32Array(e),t,n)}},ex=0,fi=new It,su=new on,Ls=new W,ri=new In,Ra=new In,En=new W,Wn=class i extends or{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ex++}),this.uuid=wi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Xu(e)?za:Ba)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new Ct().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return fi.makeRotationFromQuaternion(e),this.applyMatrix4(fi),this}rotateX(e){return fi.makeRotationX(e),this.applyMatrix4(fi),this}rotateY(e){return fi.makeRotationY(e),this.applyMatrix4(fi),this}rotateZ(e){return fi.makeRotationZ(e),this.applyMatrix4(fi),this}translate(e,t,n){return fi.makeTranslation(e,t,n),this.applyMatrix4(fi),this}scale(e,t,n){return fi.makeScale(e,t,n),this.applyMatrix4(fi),this}lookAt(e){return su.lookAt(e),su.updateMatrix(),this.applyMatrix4(su.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ls).negate(),this.translate(Ls.x,Ls.y,Ls.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let r=0,s=e.length;r<s;r++){let a=e[r];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Vn(n,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&ct("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new In);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){bt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){let s=t[n];ri.setFromBufferAttribute(s),this.morphTargetsRelative?(En.addVectors(this.boundingBox.min,ri.min),this.boundingBox.expandByPoint(En),En.addVectors(this.boundingBox.max,ri.max),this.boundingBox.expandByPoint(En)):(this.boundingBox.expandByPoint(ri.min),this.boundingBox.expandByPoint(ri.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&bt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Yn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){bt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new W,1/0);return}if(e){let n=this.boundingSphere.center;if(ri.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){let o=t[s];Ra.setFromBufferAttribute(o),this.morphTargetsRelative?(En.addVectors(ri.min,Ra.min),ri.expandByPoint(En),En.addVectors(ri.max,Ra.max),ri.expandByPoint(En)):(ri.expandByPoint(Ra.min),ri.expandByPoint(Ra.max))}ri.getCenter(n);let r=0;for(let s=0,a=e.count;s<a;s++)En.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(En));if(t)for(let s=0,a=t.length;s<a;s++){let o=t[s],c=this.morphTargetsRelative;for(let h=0,u=o.count;h<u;h++)En.fromBufferAttribute(o,h),c&&(Ls.fromBufferAttribute(e,h),En.add(Ls)),r=Math.max(r,n.distanceToSquared(En))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&bt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){bt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new xn(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],c=[];for(let B=0;B<n.count;B++)o[B]=new W,c[B]=new W;let h=new W,u=new W,f=new W,d=new zt,p=new zt,m=new zt,x=new W,g=new W;function l(B,M,_){h.fromBufferAttribute(n,B),u.fromBufferAttribute(n,M),f.fromBufferAttribute(n,_),d.fromBufferAttribute(s,B),p.fromBufferAttribute(s,M),m.fromBufferAttribute(s,_),u.sub(h),f.sub(h),p.sub(d),m.sub(d);let F=1/(p.x*m.y-m.x*p.y);isFinite(F)&&(x.copy(u).multiplyScalar(m.y).addScaledVector(f,-p.y).multiplyScalar(F),g.copy(f).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(F),o[B].add(x),o[M].add(x),o[_].add(x),c[B].add(g),c[M].add(g),c[_].add(g))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let B=0,M=w.length;B<M;++B){let _=w[B],F=_.start,z=_.count;for(let L=F,D=F+z;L<D;L+=3)l(e.getX(L+0),e.getX(L+1),e.getX(L+2))}let T=new W,y=new W,E=new W,R=new W;function P(B){E.fromBufferAttribute(r,B),R.copy(E);let M=o[B];T.copy(M),T.sub(E.multiplyScalar(E.dot(M))).normalize(),y.crossVectors(R,M);let F=y.dot(c[B])<0?-1:1;a.setXYZW(B,T.x,T.y,T.z,F)}for(let B=0,M=w.length;B<M;++B){let _=w[B],F=_.start,z=_.count;for(let L=F,D=F+z;L<D;L+=3)P(e.getX(L+0)),P(e.getX(L+1)),P(e.getX(L+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new xn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);let r=new W,s=new W,a=new W,o=new W,c=new W,h=new W,u=new W,f=new W;if(e)for(let d=0,p=e.count;d<p;d+=3){let m=e.getX(d+0),x=e.getX(d+1),g=e.getX(d+2);r.fromBufferAttribute(t,m),s.fromBufferAttribute(t,x),a.fromBufferAttribute(t,g),u.subVectors(a,s),f.subVectors(r,s),u.cross(f),o.fromBufferAttribute(n,m),c.fromBufferAttribute(n,x),h.fromBufferAttribute(n,g),o.add(u),c.add(u),h.add(u),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(g,h.x,h.y,h.z)}else for(let d=0,p=t.count;d<p;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),u.subVectors(a,s),f.subVectors(r,s),u.cross(f),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)En.fromBufferAttribute(e,t),En.normalize(),e.setXYZ(t,En.x,En.y,En.z)}toNonIndexed(){function e(o,c){let h=o.array,u=o.itemSize,f=o.normalized,d=new h.constructor(c.length*u),p=0,m=0;for(let x=0,g=c.length;x<g;x++){o.isInterleavedBufferAttribute?p=c[x]*o.data.stride+o.offset:p=c[x]*u;for(let l=0;l<u;l++)d[m++]=h[p++]}return new xn(d,u,f)}if(this.index===null)return ct("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,r=this.attributes;for(let o in r){let c=r[o],h=e(c,n);t.setAttribute(o,h)}let s=this.morphAttributes;for(let o in s){let c=[],h=s[o];for(let u=0,f=h.length;u<f;u++){let d=h[u],p=e(d,n);c.push(p)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let h=a[o];t.addGroup(h.start,h.count,h.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let h in c)c[h]!==void 0&&(e[h]=c[h]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let h=n[c];e.data.attributes[c]=h.toJSON(e.data)}let r={},s=!1;for(let c in this.morphAttributes){let h=this.morphAttributes[c],u=[];for(let f=0,d=h.length;f<d;f++){let p=h[f];u.push(p.toJSON(e.data))}u.length>0&&(r[c]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let h in r){let u=r[h];this.setAttribute(h,u.clone(t))}let s=e.morphAttributes;for(let h in s){let u=[],f=s[h];for(let d=0,p=f.length;d<p;d++)u.push(f[d].clone(t));this.morphAttributes[h]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let h=0,u=a.length;h<u;h++){let f=a[h];this.addGroup(f.start,f.count,f.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},vp=new It,Jr=new ss,el=new Yn,bp=new W,tl=new W,nl=new W,il=new W,au=new W,rl=new W,yp=new W,sl=new W,Fn=class extends on{constructor(e=new Wn,t=new Ei){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){let o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(s&&o){rl.set(0,0,0);for(let c=0,h=s.length;c<h;c++){let u=o[c],f=s[c];u!==0&&(au.fromBufferAttribute(f,e),a?rl.addScaledVector(au,u):rl.addScaledVector(au.sub(t),u))}t.add(rl)}return t}raycast(e,t){let n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),el.copy(n.boundingSphere),el.applyMatrix4(s),Jr.copy(e.ray).recast(e.near),!(el.containsPoint(Jr.origin)===!1&&(Jr.intersectSphere(el,bp)===null||Jr.origin.distanceToSquared(bp)>(e.far-e.near)**2))&&(vp.copy(s).invert(),Jr.copy(e.ray).applyMatrix4(vp),!(n.boundingBox!==null&&Jr.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Jr)))}_computeIntersections(e,t,n){let r,s=this.geometry,a=this.material,o=s.index,c=s.attributes.position,h=s.attributes.uv,u=s.attributes.uv1,f=s.attributes.normal,d=s.groups,p=s.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,x=d.length;m<x;m++){let g=d[m],l=a[g.materialIndex],w=Math.max(g.start,p.start),T=Math.min(o.count,Math.min(g.start+g.count,p.start+p.count));for(let y=w,E=T;y<E;y+=3){let R=o.getX(y),P=o.getX(y+1),B=o.getX(y+2);r=al(this,l,e,n,h,u,f,R,P,B),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{let m=Math.max(0,p.start),x=Math.min(o.count,p.start+p.count);for(let g=m,l=x;g<l;g+=3){let w=o.getX(g),T=o.getX(g+1),y=o.getX(g+2);r=al(this,a,e,n,h,u,f,w,T,y),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}else if(c!==void 0)if(Array.isArray(a))for(let m=0,x=d.length;m<x;m++){let g=d[m],l=a[g.materialIndex],w=Math.max(g.start,p.start),T=Math.min(c.count,Math.min(g.start+g.count,p.start+p.count));for(let y=w,E=T;y<E;y+=3){let R=y,P=y+1,B=y+2;r=al(this,l,e,n,h,u,f,R,P,B),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{let m=Math.max(0,p.start),x=Math.min(c.count,p.start+p.count);for(let g=m,l=x;g<l;g+=3){let w=g,T=g+1,y=g+2;r=al(this,a,e,n,h,u,f,w,T,y),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}}};function tx(i,e,t,n,r,s,a,o){let c;if(e.side===Xn?c=n.intersectTriangle(a,s,r,!0,o):c=n.intersectTriangle(r,s,a,e.side===Si,o),c===null)return null;sl.copy(o),sl.applyMatrix4(i.matrixWorld);let h=t.ray.origin.distanceTo(sl);return h<t.near||h>t.far?null:{distance:h,point:sl.clone(),object:i}}function al(i,e,t,n,r,s,a,o,c,h){i.getVertexPosition(o,tl),i.getVertexPosition(c,nl),i.getVertexPosition(h,il);let u=tx(i,e,t,n,tl,nl,il,yp);if(u){let f=new W;Cr.getBarycoord(yp,tl,nl,il,f),r&&(u.uv=Cr.getInterpolatedAttribute(r,o,c,h,f,new zt)),s&&(u.uv1=Cr.getInterpolatedAttribute(s,o,c,h,f,new zt)),a&&(u.normal=Cr.getInterpolatedAttribute(a,o,c,h,f,new W),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let d={a:o,b:c,c:h,normal:new W,materialIndex:0};Cr.getNormal(tl,nl,il,d.normal),u.face=d,u.barycoord=f}return u}var Ws=class i extends Wn{constructor(e=1,t=1,n=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:a};let o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);let c=[],h=[],u=[],f=[],d=0,p=0;m("z","y","x",-1,-1,n,t,e,a,s,0),m("z","y","x",1,-1,n,t,-e,a,s,1),m("x","z","y",1,1,e,n,t,r,a,2),m("x","z","y",1,-1,e,n,-t,r,a,3),m("x","y","z",1,-1,e,t,n,r,s,4),m("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(c),this.setAttribute("position",new Vn(h,3)),this.setAttribute("normal",new Vn(u,3)),this.setAttribute("uv",new Vn(f,2));function m(x,g,l,w,T,y,E,R,P,B,M){let _=y/P,F=E/B,z=y/2,L=E/2,D=R/2,H=P+1,Y=B+1,G=0,re=0,fe=new W;for(let ge=0;ge<Y;ge++){let Te=ge*F-L;for(let qe=0;qe<H;qe++){let Re=qe*_-z;fe[x]=Re*w,fe[g]=Te*T,fe[l]=D,h.push(fe.x,fe.y,fe.z),fe[x]=0,fe[g]=0,fe[l]=R>0?1:-1,u.push(fe.x,fe.y,fe.z),f.push(qe/P),f.push(1-ge/B),G+=1}}for(let ge=0;ge<B;ge++)for(let Te=0;Te<P;Te++){let qe=d+Te+H*ge,Re=d+Te+H*(ge+1),Q=d+(Te+1)+H*(ge+1),we=d+(Te+1)+H*ge;c.push(qe,Re,we),c.push(Re,Q,we),re+=6}o.addGroup(p,re,M),p+=re,d+=G}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function fs(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(ct("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function On(i){let e={};for(let t=0;t<i.length;t++){let n=fs(i[t]);for(let r in n)e[r]=n[r]}return e}function nx(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function ju(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ut.workingColorSpace}var Mm={clone:fs,merge:On},ix=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ai=class extends Kn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ix,this.fragmentShader=rx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=fs(e.uniforms),this.uniformsGroups=nx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Ga=class extends on{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new It,this.projectionMatrix=new It,this.projectionMatrixInverse=new It,this.coordinateSystem=Mi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Rr=new W,_p=new zt,Mp=new zt,An=class extends Ga{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=rs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Fa*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return rs*2*Math.atan(Math.tan(Fa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Rr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Rr.x,Rr.y).multiplyScalar(-e/Rr.z),Rr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Rr.x,Rr.y).multiplyScalar(-e/Rr.z)}getViewSize(e,t){return this.getViewBounds(e,_p,Mp),t.subVectors(Mp,_p)}setViewOffset(e,t,n,r,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Fa*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,h=a.fullHeight;s+=a.offsetX*r/c,t-=a.offsetY*n/h,r*=a.width/c,n*=a.height/h}let o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ds=-90,ks=1,Ml=class extends on{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new An(Ds,ks,e,t);r.layers=this.layers,this.add(r);let s=new An(Ds,ks,e,t);s.layers=this.layers,this.add(s);let a=new An(Ds,ks,e,t);a.layers=this.layers,this.add(a);let o=new An(Ds,ks,e,t);o.layers=this.layers,this.add(o);let c=new An(Ds,ks,e,t);c.layers=this.layers,this.add(c);let h=new An(Ds,ks,e,t);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,s,a,o,c]=t;for(let h of t)this.remove(h);if(e===Mi)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===ka)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let h of t)this.add(h),h.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,a,o,c,h,u]=this.children,f=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,c),e.setRenderTarget(n,4,r),e.render(t,h),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,r),e.render(t,u),e.setRenderTarget(f,d,p),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},Ha=class extends Rn{constructor(e=[],t=Dr,n,r,s,a,o,c,h,u){super(e,t,n,r,s,a,o,c,h,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Va=class extends si{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Ha(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Ws(5,5,5),s=new ai({name:"CubemapFromEquirect",uniforms:fs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Xn,blending:Wi});s.uniforms.tEquirect.value=t;let a=new Fn(r,s),o=t.minFilter;return t.minFilter===Ri&&(t.minFilter=dn),new Ml(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,r);e.setRenderTarget(s)}},jn=class extends on{constructor(){super(),this.isGroup=!0,this.type="Group"}},sx={type:"move"},Xs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new jn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new jn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new jn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,a=null,o=this._targetRay,c=this._grip,h=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(h&&e.hand){a=!0;for(let x of e.hand.values()){let g=t.getJointPose(x,n),l=this._getHandJoint(h,x);g!==null&&(l.matrix.fromArray(g.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,l.jointRadius=g.radius),l.visible=g!==null}let u=h.joints["index-finger-tip"],f=h.joints["thumb-tip"],d=u.position.distanceTo(f.position),p=.02,m=.005;h.inputState.pinching&&d>p+m?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!h.inputState.pinching&&d<=p-m&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(sx)))}return o!==null&&(o.visible=r!==null),c!==null&&(c.visible=s!==null),h!==null&&(h.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new jn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}};var Wa=class extends on{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ti,this.environmentIntensity=1,this.environmentRotation=new Ti,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},qs=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=vl,this.updateRanges=[],this.version=0,this.uuid=wi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=wi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=wi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Hn=new W,js=class i{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Hn.fromBufferAttribute(this,t),Hn.applyMatrix4(e),this.setXYZ(t,Hn.x,Hn.y,Hn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Hn.fromBufferAttribute(this,t),Hn.applyNormalMatrix(e),this.setXYZ(t,Hn.x,Hn.y,Hn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Hn.fromBufferAttribute(this,t),Hn.transformDirection(e),this.setXYZ(t,Hn.x,Hn.y,Hn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=_i(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Kt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Kt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Kt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Kt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Kt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=_i(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=_i(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=_i(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=_i(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array),r=Kt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array),r=Kt(r,this.array),s=Kt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){Ua("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new xn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Ua("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}};var wp=new W,Sp=new Qt,Tp=new Qt,ax=new W,Ep=new It,ol=new W,ou=new Yn,Ap=new It,lu=new ss,Xa=class extends Fn{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=du,this.bindMatrix=new It,this.bindMatrixInverse=new It,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new In),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ol),this.boundingBox.expandByPoint(ol)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Yn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ol),this.boundingSphere.expandByPoint(ol)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ou.copy(this.boundingSphere),ou.applyMatrix4(r),e.ray.intersectsSphere(ou)!==!1&&(Ap.copy(r).invert(),lu.copy(e.ray).applyMatrix4(Ap),!(this.boundingBox!==null&&lu.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,lu)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new Qt,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);let s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===du?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===cm?this.bindMatrixInverse.copy(this.bindMatrix).invert():ct("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,r=this.geometry;Sp.fromBufferAttribute(r.attributes.skinIndex,e),Tp.fromBufferAttribute(r.attributes.skinWeight,e),wp.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){let a=Tp.getComponent(s);if(a!==0){let o=Sp.getComponent(s);Ep.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(ax.copy(wp).applyMatrix4(Ep),a)}}return t.applyMatrix4(this.bindMatrixInverse)}},Ys=class extends on{constructor(){super(),this.isBone=!0,this.type="Bone"}},Ks=class extends Rn{constructor(e=null,t=1,n=1,r,s,a,o,c,h=fn,u=fn,f,d){super(null,a,o,c,h,u,r,s,f,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Rp=new It,ox=new It,qa=class i{constructor(e=[],t=[]){this.uuid=wi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){ct("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,r=this.bones.length;n<r;n++)this.boneInverses.push(new It)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new It;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let s=0,a=e.length;s<a;s++){let o=e[s]?e[s].matrixWorld:ox;Rp.multiplyMatrices(o,t[s]),Rp.toArray(n,s*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Ks(t,e,e,li,oi);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let r=this.bones[t];if(r.name===e)return r}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){let s=e.bones[n],a=t[s];a===void 0&&(ct("Skeleton: No bone found with UUID:",s),a=new Ys),this.bones.push(a),this.boneInverses.push(new It().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let r=0,s=t.length;r<s;r++){let a=t[r];e.bones.push(a.uuid);let o=n[r];e.boneInverses.push(o.toArray())}return e}},Fr=class extends xn{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Us=new It,Cp=new It,ll=[],Pp=new In,lx=new It,Ca=new Fn,Pa=new Yn,ja=class extends Fn{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Fr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,lx)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new In),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Us),Pp.copy(e.boundingBox).applyMatrix4(Us),this.boundingBox.union(Pp)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Yn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Us),Pa.copy(e.boundingSphere).applyMatrix4(Us),this.boundingSphere.union(Pa)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=n.length+1,a=e*s+1;for(let o=0;o<n.length;o++)n[o]=r[a+o]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Ca.geometry=this.geometry,Ca.material=this.material,Ca.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Pa.copy(this.boundingSphere),Pa.applyMatrix4(n),e.ray.intersectsSphere(Pa)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,Us),Cp.multiplyMatrices(n,Us),Ca.matrixWorld=Cp,Ca.raycast(e,ll);for(let a=0,o=ll.length;a<o;a++){let c=ll[a];c.instanceId=s,c.object=this,t.push(c)}ll.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Fr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ks(new Float32Array(r*this.count),r,this.count,Kl,oi));let s=this.morphTexture.source.data.data,a=0;for(let h=0;h<n.length;h++)a+=n[h];let o=this.geometry.morphTargetsRelative?1:1-a,c=r*e;s[c]=o,s.set(n,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},cu=new W,cx=new W,hx=new Ct,Ui=class{constructor(e=new W(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=cu.subVectors(n,t).cross(cx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(cu),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||hx.getNormalMatrix(e),r=this.coplanarPoint(cu).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Zr=new Yn,ux=new zt(.5,.5),cl=new W,$s=class{constructor(e=new Ui,t=new Ui,n=new Ui,r=new Ui,s=new Ui,a=new Ui){this.planes=[e,t,n,r,s,a]}set(e,t,n,r,s,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Mi,n=!1){let r=this.planes,s=e.elements,a=s[0],o=s[1],c=s[2],h=s[3],u=s[4],f=s[5],d=s[6],p=s[7],m=s[8],x=s[9],g=s[10],l=s[11],w=s[12],T=s[13],y=s[14],E=s[15];if(r[0].setComponents(h-a,p-u,l-m,E-w).normalize(),r[1].setComponents(h+a,p+u,l+m,E+w).normalize(),r[2].setComponents(h+o,p+f,l+x,E+T).normalize(),r[3].setComponents(h-o,p-f,l-x,E-T).normalize(),n)r[4].setComponents(c,d,g,y).normalize(),r[5].setComponents(h-c,p-d,l-g,E-y).normalize();else if(r[4].setComponents(h-c,p-d,l-g,E-y).normalize(),t===Mi)r[5].setComponents(h+c,p+d,l+g,E+y).normalize();else if(t===ka)r[5].setComponents(c,d,g,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Zr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Zr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Zr)}intersectsSprite(e){Zr.center.set(0,0,0);let t=ux.distanceTo(e.center);return Zr.radius=.7071067811865476+t,Zr.applyMatrix4(e.matrixWorld),this.intersectsSphere(Zr)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(cl.x=r.normal.x>0?e.max.x:e.min.x,cl.y=r.normal.y>0?e.max.y:e.min.y,cl.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(cl)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Js=class extends Kn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new _t(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},wl=new W,Sl=new W,Ip=new It,Ia=new ss,hl=new Yn,hu=new W,Fp=new W,as=class extends on{constructor(e=new Wn,t=new Js){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let r=1,s=t.count;r<s;r++)wl.fromBufferAttribute(t,r-1),Sl.fromBufferAttribute(t,r),n[r]=n[r-1],n[r]+=wl.distanceTo(Sl);e.setAttribute("lineDistance",new Vn(n,1))}else ct("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),hl.copy(n.boundingSphere),hl.applyMatrix4(r),hl.radius+=s,e.ray.intersectsSphere(hl)===!1)return;Ip.copy(r).invert(),Ia.copy(e.ray).applyMatrix4(Ip);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){let p=Math.max(0,a.start),m=Math.min(u.count,a.start+a.count);for(let x=p,g=m-1;x<g;x+=h){let l=u.getX(x),w=u.getX(x+1),T=ul(this,e,Ia,c,l,w,x);T&&t.push(T)}if(this.isLineLoop){let x=u.getX(m-1),g=u.getX(p),l=ul(this,e,Ia,c,x,g,m-1);l&&t.push(l)}}else{let p=Math.max(0,a.start),m=Math.min(d.count,a.start+a.count);for(let x=p,g=m-1;x<g;x+=h){let l=ul(this,e,Ia,c,x,x+1,x);l&&t.push(l)}if(this.isLineLoop){let x=ul(this,e,Ia,c,m-1,p,m-1);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){let o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}};function ul(i,e,t,n,r,s,a){let o=i.geometry.attributes.position;if(wl.fromBufferAttribute(o,r),Sl.fromBufferAttribute(o,s),t.distanceSqToSegment(wl,Sl,hu,Fp)>n)return;hu.applyMatrix4(i.matrixWorld);let h=e.ray.origin.distanceTo(hu);if(!(h<e.near||h>e.far))return{distance:h,point:Fp.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Lp=new W,Dp=new W,Ya=class extends as{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let r=0,s=t.count;r<s;r+=2)Lp.fromBufferAttribute(t,r),Dp.fromBufferAttribute(t,r+1),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+Lp.distanceTo(Dp);e.setAttribute("lineDistance",new Vn(n,1))}else ct("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Ka=class extends as{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Zs=class extends Kn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new _t(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},kp=new It,vu=new ss,fl=new Yn,dl=new W,$a=class extends on{constructor(e=new Wn,t=new Zs){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),fl.copy(n.boundingSphere),fl.applyMatrix4(r),fl.radius+=s,e.ray.intersectsSphere(fl)===!1)return;kp.copy(r).invert(),vu.copy(e.ray).applyMatrix4(kp);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=n.index,f=n.attributes.position;if(h!==null){let d=Math.max(0,a.start),p=Math.min(h.count,a.start+a.count);for(let m=d,x=p;m<x;m++){let g=h.getX(m);dl.fromBufferAttribute(f,g),Up(dl,g,c,r,e,t,this)}}else{let d=Math.max(0,a.start),p=Math.min(f.count,a.start+a.count);for(let m=d,x=p;m<x;m++)dl.fromBufferAttribute(f,m),Up(dl,m,c,r,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){let o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}};function Up(i,e,t,n,r,s,a){let o=vu.distanceSqToPoint(i);if(o<t){let c=new W;vu.closestPointToPoint(i,c),c.applyMatrix4(n);let h=r.ray.origin.distanceTo(c);if(h<r.near||h>r.far)return;s.push({distance:h,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Lr=class extends Rn{constructor(e,t,n=Ci,r,s,a,o=fn,c=fn,h,u=Oi,f=1){if(u!==Oi&&u!==kr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:f};super(d,r,s,a,o,c,u,n,h),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Vs(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Tl=class extends Lr{constructor(e,t=Ci,n=Dr,r,s,a=fn,o=fn,c,h=Oi){let u={width:e,height:e,depth:1},f=[u,u,u,u,u,u];super(e,e,t,n,r,s,a,o,c,h),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ja=class extends Rn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var Za=class i extends Wn{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let s=e/2,a=t/2,o=Math.floor(n),c=Math.floor(r),h=o+1,u=c+1,f=e/o,d=t/c,p=[],m=[],x=[],g=[];for(let l=0;l<u;l++){let w=l*d-a;for(let T=0;T<h;T++){let y=T*f-s;m.push(y,-w,0),x.push(0,0,1),g.push(T/o),g.push(1-l/c)}}for(let l=0;l<c;l++)for(let w=0;w<o;w++){let T=w+h*l,y=w+h*(l+1),E=w+1+h*(l+1),R=w+1+h*l;p.push(T,y,R),p.push(y,E,R)}this.setIndex(p),this.setAttribute("position",new Vn(m,3)),this.setAttribute("normal",new Vn(x,3)),this.setAttribute("uv",new Vn(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var El=class extends ai{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},os=class extends Kn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new _t(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new _t(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Vu,this.normalScale=new zt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ti,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},$n=class extends os{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new zt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Nt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new _t(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new _t(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new _t(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Al=class extends Kn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=um,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Rl=class extends Kn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function pl(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function fx(i){function e(r,s){return i[r]-i[s]}let t=i.length,n=new Array(t);for(let r=0;r!==t;++r)n[r]=r;return n.sort(e),n}function Np(i,e,t){let n=i.length,r=new i.constructor(n);for(let s=0,a=0;a!==n;++s){let o=t[s]*e;for(let c=0;c!==e;++c)r[a++]=i[o+c]}return r}function wm(i,e,t,n){let r=1,s=i[0];for(;s!==void 0&&s[n]===void 0;)s=i[r++];if(s===void 0)return;let a=s[n];if(a!==void 0)if(Array.isArray(a))do a=s[n],a!==void 0&&(e.push(s.time),t.push(...a)),s=i[r++];while(s!==void 0);else if(a.toArray!==void 0)do a=s[n],a!==void 0&&(e.push(s.time),a.toArray(t,t.length)),s=i[r++];while(s!==void 0);else do a=s[n],a!==void 0&&(e.push(s.time),t.push(a)),s=i[r++];while(s!==void 0)}var lr=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let a;t:{i:if(!(e<r)){for(let o=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=r,r=t[++n],e<r)break e}a=t.length;break t}if(!(e>=s)){let o=t[1];e<o&&(n=2,s=o);for(let c=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(r=s,s=t[--n-1],e>=s)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let a=0;a!==r;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Cl=class extends lr{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:pu,endingEnd:pu}}intervalChanged_(e,t,n){let r=this.parameterPositions,s=e-2,a=e+1,o=r[s],c=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case mu:s=e,o=2*t-n;break;case gu:s=r.length-2,o=t+r[s]-r[s+1];break;default:s=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case mu:a=e,c=2*n-t;break;case gu:a=1,c=n+r[1]-r[0];break;default:a=e-1,c=t}let h=(n-t)*.5,u=this.valueSize;this._weightPrev=h/(t-o),this._weightNext=h/(c-n),this._offsetPrev=s*u,this._offsetNext=a*u}interpolate_(e,t,n,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,h=c-o,u=this._offsetPrev,f=this._offsetNext,d=this._weightPrev,p=this._weightNext,m=(n-t)/(r-t),x=m*m,g=x*m,l=-d*g+2*d*x-d*m,w=(1+d)*g+(-1.5-2*d)*x+(-.5+d)*m+1,T=(-1-p)*g+(1.5+p)*x+.5*m,y=p*g-p*x;for(let E=0;E!==o;++E)s[E]=l*a[u+E]+w*a[h+E]+T*a[c+E]+y*a[f+E];return s}},Pl=class extends lr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,h=c-o,u=(n-t)/(r-t),f=1-u;for(let d=0;d!==o;++d)s[d]=a[h+d]*f+a[c+d]*u;return s}},Il=class extends lr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Jn=class{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=pl(t,this.TimeBufferType),this.values=pl(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:pl(e.times,Array),values:pl(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Il(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Pl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Cl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ns:t=this.InterpolantFactoryMethodDiscrete;break;case is:t=this.InterpolantFactoryMethodLinear;break;case ml:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return ct("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ns;case this.InterpolantFactoryMethodLinear:return is;case this.InterpolantFactoryMethodSmooth:return ml}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,s=0,a=r-1;for(;s!==r&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==r){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(bt("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,r=this.values,s=n.length;s===0&&(bt("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){bt("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){bt("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(r!==void 0&&T0(r))for(let o=0,c=r.length;o!==c;++o){let h=r[o];if(isNaN(h)){bt("KeyframeTrack: Value is not a valid number.",this,o,h),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===ml,s=e.length-1,a=1;for(let o=1;o<s;++o){let c=!1,h=e[o],u=e[o+1];if(h!==u&&(o!==1||h!==e[0]))if(r)c=!0;else{let f=o*n,d=f-n,p=f+n;for(let m=0;m!==n;++m){let x=t[f+m];if(x!==t[d+m]||x!==t[p+m]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let f=o*n,d=a*n;for(let p=0;p!==n;++p)t[d+p]=t[f+p]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,c=a*n,h=0;h!==n;++h)t[c+h]=t[o+h];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Jn.prototype.ValueTypeName="";Jn.prototype.TimeBufferType=Float32Array;Jn.prototype.ValueBufferType=Float32Array;Jn.prototype.DefaultInterpolation=is;var cr=class extends Jn{constructor(e,t,n){super(e,t,n)}};cr.prototype.ValueTypeName="bool";cr.prototype.ValueBufferType=Array;cr.prototype.DefaultInterpolation=ns;cr.prototype.InterpolantFactoryMethodLinear=void 0;cr.prototype.InterpolantFactoryMethodSmooth=void 0;var Qa=class extends Jn{constructor(e,t,n,r){super(e,t,n,r)}};Qa.prototype.ValueTypeName="color";var Bi=class extends Jn{constructor(e,t,n,r){super(e,t,n,r)}};Bi.prototype.ValueTypeName="number";var Fl=class extends lr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(r-t),h=e*o;for(let u=h+o;h!==u;h+=4)pi.slerpFlat(s,0,a,h-o,a,h,c);return s}},zi=class extends Jn{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Fl(this.times,this.values,this.getValueSize(),e)}};zi.prototype.ValueTypeName="quaternion";zi.prototype.InterpolantFactoryMethodSmooth=void 0;var hr=class extends Jn{constructor(e,t,n){super(e,t,n)}};hr.prototype.ValueTypeName="string";hr.prototype.ValueBufferType=Array;hr.prototype.DefaultInterpolation=ns;hr.prototype.InterpolantFactoryMethodLinear=void 0;hr.prototype.InterpolantFactoryMethodSmooth=void 0;var Gi=class extends Jn{constructor(e,t,n,r){super(e,t,n,r)}};Gi.prototype.ValueTypeName="vector";var eo=class{constructor(e="",t=-1,n=[],r=hm){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=wi(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,r=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(px(n[a]).scale(r));let s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s.userData=JSON.parse(e.userData||"{}"),s}static toJSON(e){let t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let s=0,a=n.length;s!==a;++s)t.push(Jn.toJSON(n[s]));return r}static CreateFromMorphTargetSequence(e,t,n,r){let s=t.length,a=[];for(let o=0;o<s;o++){let c=[],h=[];c.push((o+s-1)%s,o,(o+1)%s),h.push(0,1,0);let u=fx(c);c=Np(c,1,u),h=Np(h,1,u),!r&&c[0]===0&&(c.push(s),h.push(h[0])),a.push(new Bi(".morphTargetInfluences["+t[o].name+"]",c,h).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let r=e;n=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<n.length;r++)if(n[r].name===t)return n[r];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let r={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){let h=e[o],u=h.name.match(s);if(u&&u.length>1){let f=u[1],d=r[f];d||(r[f]=d=[]),d.push(h)}}let a=[];for(let o in r)a.push(this.CreateFromMorphTargetSequence(o,r[o],t,n));return a}static parseAnimation(e,t){if(ct("AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return bt("AnimationClip: No animation in JSONLoader data."),null;let n=function(f,d,p,m,x){if(p.length!==0){let g=[],l=[];wm(p,g,l,m),g.length!==0&&x.push(new f(d,g,l))}},r=[],s=e.name||"default",a=e.fps||30,o=e.blendMode,c=e.length||-1,h=e.hierarchy||[];for(let f=0;f<h.length;f++){let d=h[f].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let p={},m;for(m=0;m<d.length;m++)if(d[m].morphTargets)for(let x=0;x<d[m].morphTargets.length;x++)p[d[m].morphTargets[x]]=-1;for(let x in p){let g=[],l=[];for(let w=0;w!==d[m].morphTargets.length;++w){let T=d[m];g.push(T.time),l.push(T.morphTarget===x?1:0)}r.push(new Bi(".morphTargetInfluence["+x+"]",g,l))}c=p.length*a}else{let p=".bones["+t[f].name+"]";n(Gi,p+".position",d,"pos",r),n(zi,p+".quaternion",d,"rot",r),n(Gi,p+".scale",d,"scl",r)}}return r.length===0?null:new this(s,c,r,o)}resetDuration(){let e=this.tracks,t=0;for(let n=0,r=e.length;n!==r;++n){let s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function dx(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Bi;case"vector":case"vector2":case"vector3":case"vector4":return Gi;case"color":return Qa;case"quaternion":return zi;case"bool":case"boolean":return cr;case"string":return hr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function px(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=dx(i.type);if(i.times===void 0){let t=[],n=[];wm(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}var Ni={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},Ll=class{constructor(e,t,n){let r=this,s=!1,a=0,o=0,c,h=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,s===!1&&r.onStart!==void 0&&r.onStart(u,a,o),s=!0},this.itemEnd=function(u){a++,r.onProgress!==void 0&&r.onProgress(u,a,o),a===o&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,f){return h.push(u,f),this},this.removeHandler=function(u){let f=h.indexOf(u);return f!==-1&&h.splice(f,2),this},this.getHandler=function(u){for(let f=0,d=h.length;f<d;f+=2){let p=h[f],m=h[f+1];if(p.global&&(p.lastIndex=0),p.test(u))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Sm=new Ll,Hi=class{constructor(e){this.manager=e!==void 0?e:Sm,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Hi.DEFAULT_MATERIAL_NAME="__DEFAULT";var sr={},bu=class extends Error{constructor(e,t){super(e),this.response=t}},Qs=class extends Hi{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=Ni.get(`file:${e}`);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(sr[e]!==void 0){sr[e].push({onLoad:t,onProgress:n,onError:r});return}sr[e]=[],sr[e].push({onLoad:t,onProgress:n,onError:r});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,c=this.responseType;fetch(a).then(h=>{if(h.status===200||h.status===0){if(h.status===0&&ct("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||h.body===void 0||h.body.getReader===void 0)return h;let u=sr[e],f=h.body.getReader(),d=h.headers.get("X-File-Size")||h.headers.get("Content-Length"),p=d?parseInt(d):0,m=p!==0,x=0,g=new ReadableStream({start(l){w();function w(){f.read().then(({done:T,value:y})=>{if(T)l.close();else{x+=y.byteLength;let E=new ProgressEvent("progress",{lengthComputable:m,loaded:x,total:p});for(let R=0,P=u.length;R<P;R++){let B=u[R];B.onProgress&&B.onProgress(E)}l.enqueue(y),w()}},T=>{l.error(T)})}}});return new Response(g)}else throw new bu(`fetch for "${h.url}" responded with ${h.status}: ${h.statusText}`,h)}).then(h=>{switch(c){case"arraybuffer":return h.arrayBuffer();case"blob":return h.blob();case"document":return h.text().then(u=>new DOMParser().parseFromString(u,o));case"json":return h.json();default:if(o==="")return h.text();{let f=/charset="?([^;"\s]*)"?/i.exec(o),d=f&&f[1]?f[1].toLowerCase():void 0,p=new TextDecoder(d);return h.arrayBuffer().then(m=>p.decode(m))}}}).then(h=>{Ni.add(`file:${e}`,h);let u=sr[e];delete sr[e];for(let f=0,d=u.length;f<d;f++){let p=u[f];p.onLoad&&p.onLoad(h)}}).catch(h=>{let u=sr[e];if(u===void 0)throw this.manager.itemError(e),h;delete sr[e];for(let f=0,d=u.length;f<d;f++){let p=u[f];p.onError&&p.onError(h)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Ns=new WeakMap,Dl=class extends Hi{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,a=Ni.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0);else{let f=Ns.get(a);f===void 0&&(f=[],Ns.set(a,f)),f.push({onLoad:t,onError:r})}return a}let o=zs("img");function c(){u(),t&&t(this);let f=Ns.get(this)||[];for(let d=0;d<f.length;d++){let p=f[d];p.onLoad&&p.onLoad(this)}Ns.delete(this),s.manager.itemEnd(e)}function h(f){u(),r&&r(f),Ni.remove(`image:${e}`);let d=Ns.get(this)||[];for(let p=0;p<d.length;p++){let m=d[p];m.onError&&m.onError(f)}Ns.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){o.removeEventListener("load",c,!1),o.removeEventListener("error",h,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",h,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Ni.add(`image:${e}`,o),s.manager.itemStart(e),o.src=e,o}};var to=class extends Hi{constructor(e){super(e)}load(e,t,n,r){let s=new Rn,a=new Dl(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,t!==void 0&&t(s)},n,r),s}},ls=class extends on{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new _t(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}};var uu=new It,Op=new W,Bp=new W,no=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new zt(512,512),this.mapType=Zn,this.map=null,this.mapPass=null,this.matrix=new It,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $s,this._frameExtents=new zt(1,1),this._viewportCount=1,this._viewports=[new Qt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Op.setFromMatrixPosition(e.matrixWorld),t.position.copy(Op),Bp.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Bp),t.updateMatrixWorld(),uu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(uu,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(uu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},yu=class extends no{constructor(){super(new An(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=rs*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;(n!==t.fov||r!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=r,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},io=class extends ls{constructor(e,t,n=0,r=Math.PI/3,s=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(on.DEFAULT_UP),this.updateMatrix(),this.target=new on,this.distance=n,this.angle=r,this.penumbra=s,this.decay=a,this.map=null,this.shadow=new yu}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},_u=class extends no{constructor(){super(new An(90,1,.5,500)),this.isPointLightShadow=!0}},ro=class extends ls{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new _u}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Vi=class extends Ga{constructor(e=-1,t=1,n=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=n-e,a=n+e,o=r+t,c=r-t;if(this.view!==null&&this.view.enabled){let h=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=h*this.view.offsetX,a=s+h*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Mu=class extends no{constructor(){super(new Vi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ur=class extends ls{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(on.DEFAULT_UP),this.updateMatrix(),this.target=new on,this.shadow=new Mu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},so=class extends ls{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var fr=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var fu=new WeakMap,ao=class extends Hi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&ct("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&ct("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,a=Ni.get(`image-bitmap:${e}`);if(a!==void 0){if(s.manager.itemStart(e),a.then){a.then(h=>{if(fu.has(a)===!0)r&&r(fu.get(a)),s.manager.itemError(e),s.manager.itemEnd(e);else return t&&t(h),s.manager.itemEnd(e),h});return}return setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a}let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let c=fetch(e,o).then(function(h){return h.blob()}).then(function(h){return createImageBitmap(h,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(h){return Ni.add(`image-bitmap:${e}`,h),t&&t(h),s.manager.itemEnd(e),h}).catch(function(h){r&&r(h),fu.set(c,h),Ni.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});Ni.add(`image-bitmap:${e}`,c),s.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var kl=class extends An{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Yu="\\[\\]\\.:\\/",mx=new RegExp("["+Yu+"]","g"),Ku="[^"+Yu+"]",gx="[^"+Yu.replace("\\.","")+"]",xx=/((?:WC+[\/:])*)/.source.replace("WC",Ku),vx=/(WCOD+)?/.source.replace("WCOD",gx),bx=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ku),yx=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ku),_x=new RegExp("^"+xx+vx+bx+yx+"$"),Mx=["material","materials","bones","map"],wu=class{constructor(e,t,n){let r=n||Jt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Jt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(mx,"")}static parseTrackName(e){let t=_x.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=n.nodeName.substring(r+1);Mx.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===t||o.uuid===t)return o;let c=n(o.children);if(c)return c}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){ct("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let h=t.objectIndex;switch(n){case"materials":if(!e.material){bt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){bt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){bt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===h){h=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){bt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){bt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){bt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(h!==void 0){if(e[h]===void 0){bt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[h]}}let a=e[r];if(a===void 0){let h=t.nodeName;bt("PropertyBinding: Trying to update property for track: "+h+"."+r+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){bt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){bt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=r;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Jt.Composite=wu;Jt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Jt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Jt.prototype.GetterByBindingType=[Jt.prototype._getValue_direct,Jt.prototype._getValue_array,Jt.prototype._getValue_arrayElement,Jt.prototype._getValue_toArray];Jt.prototype.SetterByBindingTypeAndVersioning=[[Jt.prototype._setValue_direct,Jt.prototype._setValue_direct_setNeedsUpdate,Jt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Jt.prototype._setValue_array,Jt.prototype._setValue_array_setNeedsUpdate,Jt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Jt.prototype._setValue_arrayElement,Jt.prototype._setValue_arrayElement_setNeedsUpdate,Jt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Jt.prototype._setValue_fromArray,Jt.prototype._setValue_fromArray_setNeedsUpdate,Jt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var OM=new Float32Array(1);function $u(i,e,t,n){let r=wx(n);switch(t){case zu:return i*e;case Kl:return i*e/r.components*r.byteLength;case $l:return i*e/r.components*r.byteLength;case us:return i*e*2/r.components*r.byteLength;case Jl:return i*e*2/r.components*r.byteLength;case Gu:return i*e*3/r.components*r.byteLength;case li:return i*e*4/r.components*r.byteLength;case Zl:return i*e*4/r.components*r.byteLength;case ho:case uo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case fo:case po:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ec:case nc:return Math.max(i,16)*Math.max(e,8)/4;case Ql:case tc:return Math.max(i,8)*Math.max(e,8)/2;case ic:case rc:case ac:case oc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case sc:case lc:case cc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case hc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case uc:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case fc:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case dc:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case pc:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case mc:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case gc:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case xc:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case vc:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case bc:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case yc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case _c:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Mc:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case wc:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Sc:case Tc:case Ec:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Ac:case Rc:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Cc:case Pc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function wx(i){switch(i){case Zn:case Uu:return{byteLength:1,components:1};case na:case Nu:case Xi:return{byteLength:2,components:1};case jl:case Yl:return{byteLength:2,components:4};case Ci:case ql:case oi:return{byteLength:4,components:1};case Ou:case Bu:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"182"}}));typeof window<"u"&&(window.__THREE__?ct("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="182");function jm(){let i=null,e=!1,t=null,n=null;function r(s,a){t(s,a),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function Tx(i){let e=new WeakMap;function t(o,c){let h=o.array,u=o.usage,f=h.byteLength,d=i.createBuffer();i.bindBuffer(c,d),i.bufferData(c,h,u),o.onUploadCallback();let p;if(h instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&h instanceof Float16Array)p=i.HALF_FLOAT;else if(h instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)p=i.SHORT;else if(h instanceof Uint32Array)p=i.UNSIGNED_INT;else if(h instanceof Int32Array)p=i.INT;else if(h instanceof Int8Array)p=i.BYTE;else if(h instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:d,type:p,bytesPerElement:h.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,c,h){let u=c.array,f=c.updateRanges;if(i.bindBuffer(h,o),f.length===0)i.bufferSubData(h,0,u);else{f.sort((p,m)=>p.start-m.start);let d=0;for(let p=1;p<f.length;p++){let m=f[d],x=f[p];x.start<=m.start+m.count+1?m.count=Math.max(m.count,x.start+x.count-m.start):(++d,f[d]=x)}f.length=d+1;for(let p=0,m=f.length;p<m;p++){let x=f[p];i.bufferSubData(h,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(i.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let h=e.get(o);if(h===void 0)e.set(o,t(o,c));else if(h.version<o.version){if(h.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(h.buffer,o,c),h.version=o.version}}return{get:r,remove:s,update:a}}var Ex=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ax=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Rx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Cx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Px=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ix=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Fx=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Lx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Dx=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,kx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ux=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Nx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ox=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Bx=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,zx=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Gx=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Hx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Vx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Wx=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Xx=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,qx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,jx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Yx=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Kx=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,$x=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Jx=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Zx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Qx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ev=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,tv=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,nv="gl_FragColor = linearToOutputTexel( gl_FragColor );",iv=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,rv=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,sv=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,av=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ov=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,lv=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,cv=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,hv=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,uv=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fv=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,dv=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,pv=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,mv=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,gv=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,xv=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,vv=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,bv=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,yv=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,_v=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Mv=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,wv=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Sv=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Tv=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ev=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Av=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Rv=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Cv=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Pv=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Iv=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Fv=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Lv=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Dv=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,kv=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Uv=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Nv=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ov=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Bv=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,zv=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Gv=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Hv=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Vv=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Wv=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Xv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,qv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jv=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Yv=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Kv=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,$v=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Jv=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Zv=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Qv=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,eb=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,tb=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,nb=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ib=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,rb=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,sb=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ab=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ob=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,lb=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,cb=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,hb=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,ub=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,fb=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,db=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,pb=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,mb=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,gb=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,xb=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,vb=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,bb=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,yb=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,_b=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Mb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,wb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Sb=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Tb=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Eb=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ab=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Rb=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Pb=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ib=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Fb=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Lb=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Db=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,kb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ub=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Nb=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ob=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Bb=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,zb=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Gb=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Hb=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vb=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Wb=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xb=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,qb=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,jb=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Yb=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Kb=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,$b=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jb=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zb=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qb=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,ey=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ty=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ny=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,iy=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ry=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Dt={alphahash_fragment:Ex,alphahash_pars_fragment:Ax,alphamap_fragment:Rx,alphamap_pars_fragment:Cx,alphatest_fragment:Px,alphatest_pars_fragment:Ix,aomap_fragment:Fx,aomap_pars_fragment:Lx,batching_pars_vertex:Dx,batching_vertex:kx,begin_vertex:Ux,beginnormal_vertex:Nx,bsdfs:Ox,iridescence_fragment:Bx,bumpmap_pars_fragment:zx,clipping_planes_fragment:Gx,clipping_planes_pars_fragment:Hx,clipping_planes_pars_vertex:Vx,clipping_planes_vertex:Wx,color_fragment:Xx,color_pars_fragment:qx,color_pars_vertex:jx,color_vertex:Yx,common:Kx,cube_uv_reflection_fragment:$x,defaultnormal_vertex:Jx,displacementmap_pars_vertex:Zx,displacementmap_vertex:Qx,emissivemap_fragment:ev,emissivemap_pars_fragment:tv,colorspace_fragment:nv,colorspace_pars_fragment:iv,envmap_fragment:rv,envmap_common_pars_fragment:sv,envmap_pars_fragment:av,envmap_pars_vertex:ov,envmap_physical_pars_fragment:vv,envmap_vertex:lv,fog_vertex:cv,fog_pars_vertex:hv,fog_fragment:uv,fog_pars_fragment:fv,gradientmap_pars_fragment:dv,lightmap_pars_fragment:pv,lights_lambert_fragment:mv,lights_lambert_pars_fragment:gv,lights_pars_begin:xv,lights_toon_fragment:bv,lights_toon_pars_fragment:yv,lights_phong_fragment:_v,lights_phong_pars_fragment:Mv,lights_physical_fragment:wv,lights_physical_pars_fragment:Sv,lights_fragment_begin:Tv,lights_fragment_maps:Ev,lights_fragment_end:Av,logdepthbuf_fragment:Rv,logdepthbuf_pars_fragment:Cv,logdepthbuf_pars_vertex:Pv,logdepthbuf_vertex:Iv,map_fragment:Fv,map_pars_fragment:Lv,map_particle_fragment:Dv,map_particle_pars_fragment:kv,metalnessmap_fragment:Uv,metalnessmap_pars_fragment:Nv,morphinstance_vertex:Ov,morphcolor_vertex:Bv,morphnormal_vertex:zv,morphtarget_pars_vertex:Gv,morphtarget_vertex:Hv,normal_fragment_begin:Vv,normal_fragment_maps:Wv,normal_pars_fragment:Xv,normal_pars_vertex:qv,normal_vertex:jv,normalmap_pars_fragment:Yv,clearcoat_normal_fragment_begin:Kv,clearcoat_normal_fragment_maps:$v,clearcoat_pars_fragment:Jv,iridescence_pars_fragment:Zv,opaque_fragment:Qv,packing:eb,premultiplied_alpha_fragment:tb,project_vertex:nb,dithering_fragment:ib,dithering_pars_fragment:rb,roughnessmap_fragment:sb,roughnessmap_pars_fragment:ab,shadowmap_pars_fragment:ob,shadowmap_pars_vertex:lb,shadowmap_vertex:cb,shadowmask_pars_fragment:hb,skinbase_vertex:ub,skinning_pars_vertex:fb,skinning_vertex:db,skinnormal_vertex:pb,specularmap_fragment:mb,specularmap_pars_fragment:gb,tonemapping_fragment:xb,tonemapping_pars_fragment:vb,transmission_fragment:bb,transmission_pars_fragment:yb,uv_pars_fragment:_b,uv_pars_vertex:Mb,uv_vertex:wb,worldpos_vertex:Sb,background_vert:Tb,background_frag:Eb,backgroundCube_vert:Ab,backgroundCube_frag:Rb,cube_vert:Cb,cube_frag:Pb,depth_vert:Ib,depth_frag:Fb,distance_vert:Lb,distance_frag:Db,equirect_vert:kb,equirect_frag:Ub,linedashed_vert:Nb,linedashed_frag:Ob,meshbasic_vert:Bb,meshbasic_frag:zb,meshlambert_vert:Gb,meshlambert_frag:Hb,meshmatcap_vert:Vb,meshmatcap_frag:Wb,meshnormal_vert:Xb,meshnormal_frag:qb,meshphong_vert:jb,meshphong_frag:Yb,meshphysical_vert:Kb,meshphysical_frag:$b,meshtoon_vert:Jb,meshtoon_frag:Zb,points_vert:Qb,points_frag:ey,shadow_vert:ty,shadow_frag:ny,sprite_vert:iy,sprite_frag:ry},ze={common:{diffuse:{value:new _t(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ct},alphaMap:{value:null},alphaMapTransform:{value:new Ct},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ct}},envmap:{envMap:{value:null},envMapRotation:{value:new Ct},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ct}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ct}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ct},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ct},normalScale:{value:new zt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ct},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ct}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ct}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ct}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new _t(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new _t(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ct},alphaTest:{value:0},uvTransform:{value:new Ct}},sprite:{diffuse:{value:new _t(16777215)},opacity:{value:1},center:{value:new zt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ct},alphaMap:{value:null},alphaMapTransform:{value:new Ct},alphaTest:{value:0}}},ji={basic:{uniforms:On([ze.common,ze.specularmap,ze.envmap,ze.aomap,ze.lightmap,ze.fog]),vertexShader:Dt.meshbasic_vert,fragmentShader:Dt.meshbasic_frag},lambert:{uniforms:On([ze.common,ze.specularmap,ze.envmap,ze.aomap,ze.lightmap,ze.emissivemap,ze.bumpmap,ze.normalmap,ze.displacementmap,ze.fog,ze.lights,{emissive:{value:new _t(0)}}]),vertexShader:Dt.meshlambert_vert,fragmentShader:Dt.meshlambert_frag},phong:{uniforms:On([ze.common,ze.specularmap,ze.envmap,ze.aomap,ze.lightmap,ze.emissivemap,ze.bumpmap,ze.normalmap,ze.displacementmap,ze.fog,ze.lights,{emissive:{value:new _t(0)},specular:{value:new _t(1118481)},shininess:{value:30}}]),vertexShader:Dt.meshphong_vert,fragmentShader:Dt.meshphong_frag},standard:{uniforms:On([ze.common,ze.envmap,ze.aomap,ze.lightmap,ze.emissivemap,ze.bumpmap,ze.normalmap,ze.displacementmap,ze.roughnessmap,ze.metalnessmap,ze.fog,ze.lights,{emissive:{value:new _t(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Dt.meshphysical_vert,fragmentShader:Dt.meshphysical_frag},toon:{uniforms:On([ze.common,ze.aomap,ze.lightmap,ze.emissivemap,ze.bumpmap,ze.normalmap,ze.displacementmap,ze.gradientmap,ze.fog,ze.lights,{emissive:{value:new _t(0)}}]),vertexShader:Dt.meshtoon_vert,fragmentShader:Dt.meshtoon_frag},matcap:{uniforms:On([ze.common,ze.bumpmap,ze.normalmap,ze.displacementmap,ze.fog,{matcap:{value:null}}]),vertexShader:Dt.meshmatcap_vert,fragmentShader:Dt.meshmatcap_frag},points:{uniforms:On([ze.points,ze.fog]),vertexShader:Dt.points_vert,fragmentShader:Dt.points_frag},dashed:{uniforms:On([ze.common,ze.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Dt.linedashed_vert,fragmentShader:Dt.linedashed_frag},depth:{uniforms:On([ze.common,ze.displacementmap]),vertexShader:Dt.depth_vert,fragmentShader:Dt.depth_frag},normal:{uniforms:On([ze.common,ze.bumpmap,ze.normalmap,ze.displacementmap,{opacity:{value:1}}]),vertexShader:Dt.meshnormal_vert,fragmentShader:Dt.meshnormal_frag},sprite:{uniforms:On([ze.sprite,ze.fog]),vertexShader:Dt.sprite_vert,fragmentShader:Dt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ct},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Dt.background_vert,fragmentShader:Dt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ct}},vertexShader:Dt.backgroundCube_vert,fragmentShader:Dt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Dt.cube_vert,fragmentShader:Dt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Dt.equirect_vert,fragmentShader:Dt.equirect_frag},distance:{uniforms:On([ze.common,ze.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Dt.distance_vert,fragmentShader:Dt.distance_frag},shadow:{uniforms:On([ze.lights,ze.fog,{color:{value:new _t(0)},opacity:{value:1}}]),vertexShader:Dt.shadow_vert,fragmentShader:Dt.shadow_frag}};ji.physical={uniforms:On([ji.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ct},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ct},clearcoatNormalScale:{value:new zt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ct},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ct},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ct},sheen:{value:0},sheenColor:{value:new _t(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ct},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ct},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ct},transmissionSamplerSize:{value:new zt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ct},attenuationDistance:{value:0},attenuationColor:{value:new _t(0)},specularColor:{value:new _t(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ct},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ct},anisotropyVector:{value:new zt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ct}}]),vertexShader:Dt.meshphysical_vert,fragmentShader:Dt.meshphysical_frag};var Lc={r:0,b:0,g:0},ds=new Ti,sy=new It;function ay(i,e,t,n,r,s,a){let o=new _t(0),c=s===!0?0:1,h,u,f=null,d=0,p=null;function m(T){let y=T.isScene===!0?T.background:null;return y&&y.isTexture&&(y=(T.backgroundBlurriness>0?t:e).get(y)),y}function x(T){let y=!1,E=m(T);E===null?l(o,c):E&&E.isColor&&(l(E,1),y=!0);let R=i.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,a):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function g(T,y){let E=m(y);E&&(E.isCubeTexture||E.mapping===co)?(u===void 0&&(u=new Fn(new Ws(1,1,1),new ai({name:"BackgroundCubeMaterial",uniforms:fs(ji.backgroundCube.uniforms),vertexShader:ji.backgroundCube.vertexShader,fragmentShader:ji.backgroundCube.fragmentShader,side:Xn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(R,P,B){this.matrixWorld.copyPosition(B.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),ds.copy(y.backgroundRotation),ds.x*=-1,ds.y*=-1,ds.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(ds.y*=-1,ds.z*=-1),u.material.uniforms.envMap.value=E,u.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(sy.makeRotationFromEuler(ds)),u.material.toneMapped=Ut.getTransfer(E.colorSpace)!==jt,(f!==E||d!==E.version||p!==i.toneMapping)&&(u.material.needsUpdate=!0,f=E,d=E.version,p=i.toneMapping),u.layers.enableAll(),T.unshift(u,u.geometry,u.material,0,0,null)):E&&E.isTexture&&(h===void 0&&(h=new Fn(new Za(2,2),new ai({name:"BackgroundMaterial",uniforms:fs(ji.background.uniforms),vertexShader:ji.background.vertexShader,fragmentShader:ji.background.fragmentShader,side:Si,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),Object.defineProperty(h.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(h)),h.material.uniforms.t2D.value=E,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.toneMapped=Ut.getTransfer(E.colorSpace)!==jt,E.matrixAutoUpdate===!0&&E.updateMatrix(),h.material.uniforms.uvTransform.value.copy(E.matrix),(f!==E||d!==E.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,f=E,d=E.version,p=i.toneMapping),h.layers.enableAll(),T.unshift(h,h.geometry,h.material,0,0,null))}function l(T,y){T.getRGB(Lc,ju(i)),n.buffers.color.setClear(Lc.r,Lc.g,Lc.b,y,a)}function w(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0)}return{getClearColor:function(){return o},setClearColor:function(T,y=1){o.set(T),c=y,l(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(T){c=T,l(o,c)},render:x,addToRenderList:g,dispose:w}}function oy(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=d(null),s=r,a=!1;function o(_,F,z,L,D){let H=!1,Y=f(L,z,F);s!==Y&&(s=Y,h(s.object)),H=p(_,L,z,D),H&&m(_,L,z,D),D!==null&&e.update(D,i.ELEMENT_ARRAY_BUFFER),(H||a)&&(a=!1,y(_,F,z,L),D!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(D).buffer))}function c(){return i.createVertexArray()}function h(_){return i.bindVertexArray(_)}function u(_){return i.deleteVertexArray(_)}function f(_,F,z){let L=z.wireframe===!0,D=n[_.id];D===void 0&&(D={},n[_.id]=D);let H=D[F.id];H===void 0&&(H={},D[F.id]=H);let Y=H[L];return Y===void 0&&(Y=d(c()),H[L]=Y),Y}function d(_){let F=[],z=[],L=[];for(let D=0;D<t;D++)F[D]=0,z[D]=0,L[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:z,attributeDivisors:L,object:_,attributes:{},index:null}}function p(_,F,z,L){let D=s.attributes,H=F.attributes,Y=0,G=z.getAttributes();for(let re in G)if(G[re].location>=0){let ge=D[re],Te=H[re];if(Te===void 0&&(re==="instanceMatrix"&&_.instanceMatrix&&(Te=_.instanceMatrix),re==="instanceColor"&&_.instanceColor&&(Te=_.instanceColor)),ge===void 0||ge.attribute!==Te||Te&&ge.data!==Te.data)return!0;Y++}return s.attributesNum!==Y||s.index!==L}function m(_,F,z,L){let D={},H=F.attributes,Y=0,G=z.getAttributes();for(let re in G)if(G[re].location>=0){let ge=H[re];ge===void 0&&(re==="instanceMatrix"&&_.instanceMatrix&&(ge=_.instanceMatrix),re==="instanceColor"&&_.instanceColor&&(ge=_.instanceColor));let Te={};Te.attribute=ge,ge&&ge.data&&(Te.data=ge.data),D[re]=Te,Y++}s.attributes=D,s.attributesNum=Y,s.index=L}function x(){let _=s.newAttributes;for(let F=0,z=_.length;F<z;F++)_[F]=0}function g(_){l(_,0)}function l(_,F){let z=s.newAttributes,L=s.enabledAttributes,D=s.attributeDivisors;z[_]=1,L[_]===0&&(i.enableVertexAttribArray(_),L[_]=1),D[_]!==F&&(i.vertexAttribDivisor(_,F),D[_]=F)}function w(){let _=s.newAttributes,F=s.enabledAttributes;for(let z=0,L=F.length;z<L;z++)F[z]!==_[z]&&(i.disableVertexAttribArray(z),F[z]=0)}function T(_,F,z,L,D,H,Y){Y===!0?i.vertexAttribIPointer(_,F,z,D,H):i.vertexAttribPointer(_,F,z,L,D,H)}function y(_,F,z,L){x();let D=L.attributes,H=z.getAttributes(),Y=F.defaultAttributeValues;for(let G in H){let re=H[G];if(re.location>=0){let fe=D[G];if(fe===void 0&&(G==="instanceMatrix"&&_.instanceMatrix&&(fe=_.instanceMatrix),G==="instanceColor"&&_.instanceColor&&(fe=_.instanceColor)),fe!==void 0){let ge=fe.normalized,Te=fe.itemSize,qe=e.get(fe);if(qe===void 0)continue;let Re=qe.buffer,Q=qe.type,we=qe.bytesPerElement,j=Q===i.INT||Q===i.UNSIGNED_INT||fe.gpuType===ql;if(fe.isInterleavedBufferAttribute){let ee=fe.data,be=ee.stride,Ne=fe.offset;if(ee.isInstancedInterleavedBuffer){for(let Ee=0;Ee<re.locationSize;Ee++)l(re.location+Ee,ee.meshPerAttribute);_.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Ee=0;Ee<re.locationSize;Ee++)g(re.location+Ee);i.bindBuffer(i.ARRAY_BUFFER,Re);for(let Ee=0;Ee<re.locationSize;Ee++)T(re.location+Ee,Te/re.locationSize,Q,ge,be*we,(Ne+Te/re.locationSize*Ee)*we,j)}else{if(fe.isInstancedBufferAttribute){for(let ee=0;ee<re.locationSize;ee++)l(re.location+ee,fe.meshPerAttribute);_.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=fe.meshPerAttribute*fe.count)}else for(let ee=0;ee<re.locationSize;ee++)g(re.location+ee);i.bindBuffer(i.ARRAY_BUFFER,Re);for(let ee=0;ee<re.locationSize;ee++)T(re.location+ee,Te/re.locationSize,Q,ge,Te*we,Te/re.locationSize*ee*we,j)}}else if(Y!==void 0){let ge=Y[G];if(ge!==void 0)switch(ge.length){case 2:i.vertexAttrib2fv(re.location,ge);break;case 3:i.vertexAttrib3fv(re.location,ge);break;case 4:i.vertexAttrib4fv(re.location,ge);break;default:i.vertexAttrib1fv(re.location,ge)}}}}w()}function E(){B();for(let _ in n){let F=n[_];for(let z in F){let L=F[z];for(let D in L)u(L[D].object),delete L[D];delete F[z]}delete n[_]}}function R(_){if(n[_.id]===void 0)return;let F=n[_.id];for(let z in F){let L=F[z];for(let D in L)u(L[D].object),delete L[D];delete F[z]}delete n[_.id]}function P(_){for(let F in n){let z=n[F];if(z[_.id]===void 0)continue;let L=z[_.id];for(let D in L)u(L[D].object),delete L[D];delete z[_.id]}}function B(){M(),a=!0,s!==r&&(s=r,h(s.object))}function M(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:B,resetDefaultState:M,dispose:E,releaseStatesOfGeometry:R,releaseStatesOfProgram:P,initAttributes:x,enableAttribute:g,disableUnusedAttributes:w}}function ly(i,e,t){let n;function r(h){n=h}function s(h,u){i.drawArrays(n,h,u),t.update(u,n,1)}function a(h,u,f){f!==0&&(i.drawArraysInstanced(n,h,u,f),t.update(u,n,f))}function o(h,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,h,0,u,0,f);let p=0;for(let m=0;m<f;m++)p+=u[m];t.update(p,n,1)}function c(h,u,f,d){if(f===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<h.length;m++)a(h[m],u[m],d[m]);else{p.multiDrawArraysInstancedWEBGL(n,h,0,u,0,d,0,f);let m=0;for(let x=0;x<f;x++)m+=u[x]*d[x];t.update(m,n,1)}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function cy(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let P=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(P){return!(P!==li&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){let B=P===Xi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(P!==Zn&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&P!==oi&&!B)}function c(P){if(P==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=t.precision!==void 0?t.precision:"highp",u=c(h);u!==h&&(ct("WebGLRenderer:",h,"not supported, using",u,"instead."),h=u);let f=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),l=i.getParameter(i.MAX_VERTEX_ATTRIBS),w=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),T=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),R=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:h,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:x,maxCubemapSize:g,maxAttributes:l,maxVertexUniforms:w,maxVaryings:T,maxFragmentUniforms:y,maxSamples:E,samples:R}}function hy(i){let e=this,t=null,n=0,r=!1,s=!1,a=new Ui,o=new Ct,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(f,d){let p=f.length!==0||d||n!==0||r;return r=d,n=f.length,p},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(f,d){t=u(f,d,0)},this.setState=function(f,d,p){let m=f.clippingPlanes,x=f.clipIntersection,g=f.clipShadows,l=i.get(f);if(!r||m===null||m.length===0||s&&!g)s?u(null):h();else{let w=s?0:n,T=w*4,y=l.clippingState||null;c.value=y,y=u(m,d,T,p);for(let E=0;E!==T;++E)y[E]=t[E];l.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=w}};function h(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(f,d,p,m){let x=f!==null?f.length:0,g=null;if(x!==0){if(g=c.value,m!==!0||g===null){let l=p+x*4,w=d.matrixWorldInverse;o.getNormalMatrix(w),(g===null||g.length<l)&&(g=new Float32Array(l));for(let T=0,y=p;T!==x;++T,y+=4)a.copy(f[T]).applyMatrix4(w,o),a.normal.toArray(g,y),g[y+3]=a.constant}c.value=g,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,g}}function uy(i){let e=new WeakMap;function t(a,o){return o===Vl?a.mapping=Dr:o===Wl&&(a.mapping=cs),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===Vl||o===Wl)if(e.has(a)){let c=e.get(a).texture;return t(c,a.mapping)}else{let c=a.image;if(c&&c.height>0){let h=new Va(c.height);return h.fromEquirectangularTexture(i,a),e.set(a,h),a.addEventListener("dispose",r),t(h.texture,a.mapping)}else return null}}return a}function r(a){let o=a.target;o.removeEventListener("dispose",r);let c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}var Ur=4,Tm=[.125,.215,.35,.446,.526,.582],ms=20,fy=256,go=new Vi,Em=new _t,Ju=null,Zu=0,Qu=0,ef=!1,dy=new W,kc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,s={}){let{size:a=256,position:o=dy}=s;Ju=this._renderer.getRenderTarget(),Zu=this._renderer.getActiveCubeFace(),Qu=this._renderer.getActiveMipmapLevel(),ef=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,r,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Cm(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Rm(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Ju,Zu,Qu),this._renderer.xr.enabled=ef,e.scissorTest=!1,aa(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Dr||e.mapping===cs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ju=this._renderer.getRenderTarget(),Zu=this._renderer.getActiveCubeFace(),Qu=this._renderer.getActiveMipmapLevel(),ef=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:dn,minFilter:dn,generateMipmaps:!1,type:Xi,format:li,colorSpace:Pn,depthBuffer:!1},r=Am(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Am(e,t,n);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=py(s)),this._blurMaterial=gy(s,e,t),this._ggxMaterial=my(s,e,t)}return r}_compileMaterial(e){let t=new Fn(new Wn,e);this._renderer.compile(t,go)}_sceneToCubeUV(e,t,n,r,s){let c=new An(90,1,t,n),h=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,d=f.autoClear,p=f.toneMapping;f.getClearColor(Em),f.toneMapping=Ai,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(r),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Fn(new Ws,new Ei({name:"PMREM.Background",side:Xn,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,g=x.material,l=!1,w=e.background;w?w.isColor&&(g.color.copy(w),e.background=null,l=!0):(g.color.copy(Em),l=!0);for(let T=0;T<6;T++){let y=T%3;y===0?(c.up.set(0,h[T],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x+u[T],s.y,s.z)):y===1?(c.up.set(0,0,h[T]),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y+u[T],s.z)):(c.up.set(0,h[T],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y,s.z+u[T]));let E=this._cubeSize;aa(r,y*E,T>2?E:0,E,E),f.setRenderTarget(r),l&&f.render(x,c),f.render(e,c)}f.toneMapping=p,f.autoClear=d,e.background=w}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===Dr||e.mapping===cs;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Cm()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Rm());let s=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=s;let o=s.uniforms;o.envMap.value=e;let c=this._cubeSize;aa(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,go)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let s=1;s<r;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,s=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let c=a.uniforms,h=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),f=Math.sqrt(h*h-u*u),d=0+h*1.25,p=f*d,{_lodMax:m}=this,x=this._sizeLods[n],g=3*x*(n>m-Ur?n-m+Ur:0),l=4*(this._cubeSize-x);c.envMap.value=e.texture,c.roughness.value=p,c.mipInt.value=m-t,aa(s,g,l,3*x,2*x),r.setRenderTarget(s),r.render(o,go),c.envMap.value=s.texture,c.roughness.value=0,c.mipInt.value=m-n,aa(e,g,l,3*x,2*x),r.setRenderTarget(e),r.render(o,go)}_blur(e,t,n,r,s){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,"latitudinal",s),this._halfBlur(a,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,a,o){let c=this._renderer,h=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&bt("blur direction must be either latitudinal or longitudinal!");let u=3,f=this._lodMeshes[r];f.material=h;let d=h.uniforms,p=this._sizeLods[n]-1,m=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*ms-1),x=s/m,g=isFinite(s)?1+Math.floor(u*x):ms;g>ms&&ct(`sigmaRadians, ${s}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${ms}`);let l=[],w=0;for(let P=0;P<ms;++P){let B=P/x,M=Math.exp(-B*B/2);l.push(M),P===0?w+=M:P<g&&(w+=2*M)}for(let P=0;P<l.length;P++)l[P]=l[P]/w;d.envMap.value=e.texture,d.samples.value=g,d.weights.value=l,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:T}=this;d.dTheta.value=m,d.mipInt.value=T-n;let y=this._sizeLods[r],E=3*y*(r>T-Ur?r-T+Ur:0),R=4*(this._cubeSize-y);aa(t,E,R,3*y,2*y),c.setRenderTarget(t),c.render(f,go)}};function py(i){let e=[],t=[],n=[],r=i,s=i-Ur+1+Tm.length;for(let a=0;a<s;a++){let o=Math.pow(2,r);e.push(o);let c=1/o;a>i-Ur?c=Tm[a-i+Ur-1]:a===0&&(c=0),t.push(c);let h=1/(o-2),u=-h,f=1+h,d=[u,u,f,u,f,f,u,u,f,f,u,f],p=6,m=6,x=3,g=2,l=1,w=new Float32Array(x*m*p),T=new Float32Array(g*m*p),y=new Float32Array(l*m*p);for(let R=0;R<p;R++){let P=R%3*2/3-1,B=R>2?0:-1,M=[P,B,0,P+2/3,B,0,P+2/3,B+1,0,P,B,0,P+2/3,B+1,0,P,B+1,0];w.set(M,x*m*R),T.set(d,g*m*R);let _=[R,R,R,R,R,R];y.set(_,l*m*R)}let E=new Wn;E.setAttribute("position",new xn(w,x)),E.setAttribute("uv",new xn(T,g)),E.setAttribute("faceIndex",new xn(y,l)),n.push(new Fn(E,null)),r>Ur&&r--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function Am(i,e,t){let n=new si(i,e,t);return n.texture.mapping=co,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function aa(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function my(i,e,t){return new ai({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:fy,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Nc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Wi,depthTest:!1,depthWrite:!1})}function gy(i,e,t){let n=new Float32Array(ms),r=new W(0,1,0);return new ai({name:"SphericalGaussianBlur",defines:{n:ms,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Nc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Wi,depthTest:!1,depthWrite:!1})}function Rm(){return new ai({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Nc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Wi,depthTest:!1,depthWrite:!1})}function Cm(){return new ai({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Nc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Wi,depthTest:!1,depthWrite:!1})}function Nc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function xy(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){let c=o.mapping,h=c===Vl||c===Wl,u=c===Dr||c===cs;if(h||u){let f=e.get(o),d=f!==void 0?f.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new kc(i)),f=h?t.fromEquirectangular(o,f):t.fromCubemap(o,f),f.texture.pmremVersion=o.pmremVersion,e.set(o,f),f.texture;if(f!==void 0)return f.texture;{let p=o.image;return h&&p&&p.height>0||u&&p&&r(p)?(t===null&&(t=new kc(i)),f=h?t.fromEquirectangular(o):t.fromCubemap(o),f.texture.pmremVersion=o.pmremVersion,e.set(o,f),o.addEventListener("dispose",s),f.texture):null}}}return o}function r(o){let c=0,h=6;for(let u=0;u<h;u++)o[u]!==void 0&&c++;return c===h}function s(o){let c=o.target;c.removeEventListener("dispose",s);let h=e.get(c);h!==void 0&&(e.delete(c),h.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function vy(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let r=i.getExtension(n);return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let r=t(n);return r===null&&Hs("WebGLRenderer: "+n+" extension not supported."),r}}}function by(i,e,t,n){let r={},s=new WeakMap;function a(f){let d=f.target;d.index!==null&&e.remove(d.index);for(let m in d.attributes)e.remove(d.attributes[m]);d.removeEventListener("dispose",a),delete r[d.id];let p=s.get(d);p&&(e.remove(p),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(f,d){return r[d.id]===!0||(d.addEventListener("dispose",a),r[d.id]=!0,t.memory.geometries++),d}function c(f){let d=f.attributes;for(let p in d)e.update(d[p],i.ARRAY_BUFFER)}function h(f){let d=[],p=f.index,m=f.attributes.position,x=0;if(p!==null){let w=p.array;x=p.version;for(let T=0,y=w.length;T<y;T+=3){let E=w[T+0],R=w[T+1],P=w[T+2];d.push(E,R,R,P,P,E)}}else if(m!==void 0){let w=m.array;x=m.version;for(let T=0,y=w.length/3-1;T<y;T+=3){let E=T+0,R=T+1,P=T+2;d.push(E,R,R,P,P,E)}}else return;let g=new(Xu(d)?za:Ba)(d,1);g.version=x;let l=s.get(f);l&&e.remove(l),s.set(f,g)}function u(f){let d=s.get(f);if(d){let p=f.index;p!==null&&d.version<p.version&&h(f)}else h(f);return s.get(f)}return{get:o,update:c,getWireframeAttribute:u}}function yy(i,e,t){let n;function r(d){n=d}let s,a;function o(d){s=d.type,a=d.bytesPerElement}function c(d,p){i.drawElements(n,p,s,d*a),t.update(p,n,1)}function h(d,p,m){m!==0&&(i.drawElementsInstanced(n,p,s,d*a,m),t.update(p,n,m))}function u(d,p,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,s,d,0,m);let g=0;for(let l=0;l<m;l++)g+=p[l];t.update(g,n,1)}function f(d,p,m,x){if(m===0)return;let g=e.get("WEBGL_multi_draw");if(g===null)for(let l=0;l<d.length;l++)h(d[l]/a,p[l],x[l]);else{g.multiDrawElementsInstancedWEBGL(n,p,0,s,d,0,x,0,m);let l=0;for(let w=0;w<m;w++)l+=p[w]*x[w];t.update(l,n,1)}}this.setMode=r,this.setIndex=o,this.render=c,this.renderInstances=h,this.renderMultiDraw=u,this.renderMultiDrawInstances=f}function _y(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(s/3);break;case i.LINES:t.lines+=o*(s/2);break;case i.LINE_STRIP:t.lines+=o*(s-1);break;case i.LINE_LOOP:t.lines+=o*s;break;case i.POINTS:t.points+=o*s;break;default:bt("WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function My(i,e,t){let n=new WeakMap,r=new Qt;function s(a,o,c){let h=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0,d=n.get(o);if(d===void 0||d.count!==f){let M=function(){P.dispose(),n.delete(o),o.removeEventListener("dispose",M)};d!==void 0&&d.texture.dispose();let p=o.morphAttributes.position!==void 0,m=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],l=o.morphAttributes.normal||[],w=o.morphAttributes.color||[],T=0;p===!0&&(T=1),m===!0&&(T=2),x===!0&&(T=3);let y=o.attributes.position.count*T,E=1;y>e.maxTextureSize&&(E=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let R=new Float32Array(y*E*4*f),P=new Na(R,y,E,f);P.type=oi,P.needsUpdate=!0;let B=T*4;for(let _=0;_<f;_++){let F=g[_],z=l[_],L=w[_],D=y*E*4*_;for(let H=0;H<F.count;H++){let Y=H*B;p===!0&&(r.fromBufferAttribute(F,H),R[D+Y+0]=r.x,R[D+Y+1]=r.y,R[D+Y+2]=r.z,R[D+Y+3]=0),m===!0&&(r.fromBufferAttribute(z,H),R[D+Y+4]=r.x,R[D+Y+5]=r.y,R[D+Y+6]=r.z,R[D+Y+7]=0),x===!0&&(r.fromBufferAttribute(L,H),R[D+Y+8]=r.x,R[D+Y+9]=r.y,R[D+Y+10]=r.z,R[D+Y+11]=L.itemSize===4?r.w:1)}}d={count:f,texture:P,size:new zt(y,E)},n.set(o,d),o.addEventListener("dispose",M)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let x=0;x<h.length;x++)p+=h[x];let m=o.morphTargetsRelative?1:1-p;c.getUniforms().setValue(i,"morphTargetBaseInfluence",m),c.getUniforms().setValue(i,"morphTargetInfluences",h)}c.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:s}}function wy(i,e,t,n){let r=new WeakMap;function s(c){let h=n.render.frame,u=c.geometry,f=e.get(c,u);if(r.get(f)!==h&&(e.update(f),r.set(f,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let d=c.skeleton;r.get(d)!==h&&(d.update(),r.set(d,h))}return f}function a(){r=new WeakMap}function o(c){let h=c.target;h.removeEventListener("dispose",o),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:s,dispose:a}}var Sy={[Cu]:"LINEAR_TONE_MAPPING",[Pu]:"REINHARD_TONE_MAPPING",[Iu]:"CINEON_TONE_MAPPING",[lo]:"ACES_FILMIC_TONE_MAPPING",[Lu]:"AGX_TONE_MAPPING",[Du]:"NEUTRAL_TONE_MAPPING",[Fu]:"CUSTOM_TONE_MAPPING"};function Ty(i,e,t,n,r){let s=new si(e,t,{type:i,depthBuffer:n,stencilBuffer:r}),a=new si(e,t,{type:Xi,depthBuffer:!1,stencilBuffer:!1}),o=new Wn;o.setAttribute("position",new Vn([-1,3,0,-1,-1,0,3,-1,0],3)),o.setAttribute("uv",new Vn([0,2,0,0,2,0],2));let c=new El({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new Fn(o,c),u=new Vi(-1,1,1,-1,0,1),f=null,d=null,p=!1,m,x=null,g=[],l=!1;this.setSize=function(w,T){s.setSize(w,T),a.setSize(w,T);for(let y=0;y<g.length;y++){let E=g[y];E.setSize&&E.setSize(w,T)}},this.setEffects=function(w){g=w,l=g.length>0&&g[0].isRenderPass===!0;let T=s.width,y=s.height;for(let E=0;E<g.length;E++){let R=g[E];R.setSize&&R.setSize(T,y)}},this.begin=function(w,T){if(p||w.toneMapping===Ai&&g.length===0)return!1;if(x=T,T!==null){let y=T.width,E=T.height;(s.width!==y||s.height!==E)&&this.setSize(y,E)}return l===!1&&w.setRenderTarget(s),m=w.toneMapping,w.toneMapping=Ai,!0},this.hasRenderPass=function(){return l},this.end=function(w,T){w.toneMapping=m,p=!0;let y=s,E=a;for(let R=0;R<g.length;R++){let P=g[R];if(P.enabled!==!1&&(P.render(w,E,y,T),P.needsSwap!==!1)){let B=y;y=E,E=B}}if(f!==w.outputColorSpace||d!==w.toneMapping){f=w.outputColorSpace,d=w.toneMapping,c.defines={},Ut.getTransfer(f)===jt&&(c.defines.SRGB_TRANSFER="");let R=Sy[d];R&&(c.defines[R]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=y.texture,w.setRenderTarget(x),w.render(h,u),x=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){s.dispose(),a.dispose(),o.dispose(),c.dispose()}}var Ym=new Rn,rf=new Lr(1,1),Km=new Na,$m=new _l,Jm=new Ha,Pm=[],Im=[],Fm=new Float32Array(16),Lm=new Float32Array(9),Dm=new Float32Array(4);function la(i,e,t){let n=i[0];if(n<=0||n>0)return i;let r=e*t,s=Pm[r];if(s===void 0&&(s=new Float32Array(r),Pm[r]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(s,o)}return s}function yn(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function _n(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Oc(i,e){let t=Im[e];t===void 0&&(t=new Int32Array(e),Im[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Ey(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Ay(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yn(t,e))return;i.uniform2fv(this.addr,e),_n(t,e)}}function Ry(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(yn(t,e))return;i.uniform3fv(this.addr,e),_n(t,e)}}function Cy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yn(t,e))return;i.uniform4fv(this.addr,e),_n(t,e)}}function Py(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(yn(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),_n(t,e)}else{if(yn(t,n))return;Dm.set(n),i.uniformMatrix2fv(this.addr,!1,Dm),_n(t,n)}}function Iy(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(yn(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),_n(t,e)}else{if(yn(t,n))return;Lm.set(n),i.uniformMatrix3fv(this.addr,!1,Lm),_n(t,n)}}function Fy(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(yn(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),_n(t,e)}else{if(yn(t,n))return;Fm.set(n),i.uniformMatrix4fv(this.addr,!1,Fm),_n(t,n)}}function Ly(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Dy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yn(t,e))return;i.uniform2iv(this.addr,e),_n(t,e)}}function ky(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yn(t,e))return;i.uniform3iv(this.addr,e),_n(t,e)}}function Uy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yn(t,e))return;i.uniform4iv(this.addr,e),_n(t,e)}}function Ny(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Oy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yn(t,e))return;i.uniform2uiv(this.addr,e),_n(t,e)}}function By(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yn(t,e))return;i.uniform3uiv(this.addr,e),_n(t,e)}}function zy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yn(t,e))return;i.uniform4uiv(this.addr,e),_n(t,e)}}function Gy(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(rf.compareFunction=t.isReversedDepthBuffer()?Fc:Ic,s=rf):s=Ym,t.setTexture2D(e||s,r)}function Hy(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||$m,r)}function Vy(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||Jm,r)}function Wy(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||Km,r)}function Xy(i){switch(i){case 5126:return Ey;case 35664:return Ay;case 35665:return Ry;case 35666:return Cy;case 35674:return Py;case 35675:return Iy;case 35676:return Fy;case 5124:case 35670:return Ly;case 35667:case 35671:return Dy;case 35668:case 35672:return ky;case 35669:case 35673:return Uy;case 5125:return Ny;case 36294:return Oy;case 36295:return By;case 36296:return zy;case 35678:case 36198:case 36298:case 36306:case 35682:return Gy;case 35679:case 36299:case 36307:return Hy;case 35680:case 36300:case 36308:case 36293:return Vy;case 36289:case 36303:case 36311:case 36292:return Wy}}function qy(i,e){i.uniform1fv(this.addr,e)}function jy(i,e){let t=la(e,this.size,2);i.uniform2fv(this.addr,t)}function Yy(i,e){let t=la(e,this.size,3);i.uniform3fv(this.addr,t)}function Ky(i,e){let t=la(e,this.size,4);i.uniform4fv(this.addr,t)}function $y(i,e){let t=la(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Jy(i,e){let t=la(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Zy(i,e){let t=la(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Qy(i,e){i.uniform1iv(this.addr,e)}function e_(i,e){i.uniform2iv(this.addr,e)}function t_(i,e){i.uniform3iv(this.addr,e)}function n_(i,e){i.uniform4iv(this.addr,e)}function i_(i,e){i.uniform1uiv(this.addr,e)}function r_(i,e){i.uniform2uiv(this.addr,e)}function s_(i,e){i.uniform3uiv(this.addr,e)}function a_(i,e){i.uniform4uiv(this.addr,e)}function o_(i,e,t){let n=this.cache,r=e.length,s=Oc(t,r);yn(n,s)||(i.uniform1iv(this.addr,s),_n(n,s));let a;this.type===i.SAMPLER_2D_SHADOW?a=rf:a=Ym;for(let o=0;o!==r;++o)t.setTexture2D(e[o]||a,s[o])}function l_(i,e,t){let n=this.cache,r=e.length,s=Oc(t,r);yn(n,s)||(i.uniform1iv(this.addr,s),_n(n,s));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||$m,s[a])}function c_(i,e,t){let n=this.cache,r=e.length,s=Oc(t,r);yn(n,s)||(i.uniform1iv(this.addr,s),_n(n,s));for(let a=0;a!==r;++a)t.setTextureCube(e[a]||Jm,s[a])}function h_(i,e,t){let n=this.cache,r=e.length,s=Oc(t,r);yn(n,s)||(i.uniform1iv(this.addr,s),_n(n,s));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||Km,s[a])}function u_(i){switch(i){case 5126:return qy;case 35664:return jy;case 35665:return Yy;case 35666:return Ky;case 35674:return $y;case 35675:return Jy;case 35676:return Zy;case 5124:case 35670:return Qy;case 35667:case 35671:return e_;case 35668:case 35672:return t_;case 35669:case 35673:return n_;case 5125:return i_;case 36294:return r_;case 36295:return s_;case 36296:return a_;case 35678:case 36198:case 36298:case 36306:case 35682:return o_;case 35679:case 36299:case 36307:return l_;case 35680:case 36300:case 36308:case 36293:return c_;case 36289:case 36303:case 36311:case 36292:return h_}}var sf=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Xy(t.type)}},af=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=u_(t.type)}},of=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let s=0,a=r.length;s!==a;++s){let o=r[s];o.setValue(e,t[o.id],n)}}},tf=/(\w+)(\])?(\[|\.)?/g;function km(i,e){i.seq.push(e),i.map[e.id]=e}function f_(i,e,t){let n=i.name,r=n.length;for(tf.lastIndex=0;;){let s=tf.exec(n),a=tf.lastIndex,o=s[1],c=s[2]==="]",h=s[3];if(c&&(o=o|0),h===void 0||h==="["&&a+2===r){km(t,h===void 0?new sf(o,i,e):new af(o,i,e));break}else{let f=t.map[o];f===void 0&&(f=new of(o),km(t,f)),t=f}}}var oa=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);f_(o,c,this)}let r=[],s=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(a):s.push(a);r.length>0&&(this.seq=r.concat(s))}setValue(e,t,n,r){let s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,a=t.length;s!==a;++s){let o=t[s],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,s=e.length;r!==s;++r){let a=e[r];a.id in t&&n.push(a)}return n}};function Um(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var d_=37297,p_=0;function m_(i,e){let t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=r;a<s;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var Nm=new Ct;function g_(i){Ut._getMatrix(Nm,Ut.workingColorSpace,i);let e=`mat3( ${Nm.elements.map(t=>t.toFixed(4))} )`;switch(Ut.getTransfer(i)){case Da:return[e,"LinearTransferOETF"];case jt:return[e,"sRGBTransferOETF"];default:return ct("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Om(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),s=(i.getShaderInfoLog(e)||"").trim();if(n&&s==="")return"";let a=/ERROR: 0:(\d+)/.exec(s);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+s+`

`+m_(i.getShaderSource(e),o)}else return s}function x_(i,e){let t=g_(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var v_={[Cu]:"Linear",[Pu]:"Reinhard",[Iu]:"Cineon",[lo]:"ACESFilmic",[Lu]:"AgX",[Du]:"Neutral",[Fu]:"Custom"};function b_(i,e){let t=v_[e];return t===void 0?(ct("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Dc=new W;function y_(){Ut.getLuminanceCoefficients(Dc);let i=Dc.x.toFixed(4),e=Dc.y.toFixed(4),t=Dc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function __(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(vo).join(`
`)}function M_(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function w_(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){let s=i.getActiveAttrib(e,r),a=s.name,o=1;s.type===i.FLOAT_MAT2&&(o=2),s.type===i.FLOAT_MAT3&&(o=3),s.type===i.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function vo(i){return i!==""}function Bm(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function zm(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var S_=/^[ \t]*#include +<([\w\d./]+)>/gm;function lf(i){return i.replace(S_,E_)}var T_=new Map;function E_(i,e){let t=Dt[e];if(t===void 0){let n=T_.get(e);if(n!==void 0)t=Dt[n],ct('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return lf(t)}var A_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Gm(i){return i.replace(A_,R_)}function R_(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Hm(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var C_={[oo]:"SHADOWMAP_TYPE_PCF",[ea]:"SHADOWMAP_TYPE_VSM"};function P_(i){return C_[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var I_={[Dr]:"ENVMAP_TYPE_CUBE",[cs]:"ENVMAP_TYPE_CUBE",[co]:"ENVMAP_TYPE_CUBE_UV"};function F_(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":I_[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var L_={[cs]:"ENVMAP_MODE_REFRACTION"};function D_(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":L_[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var k_={[Ru]:"ENVMAP_BLENDING_MULTIPLY",[om]:"ENVMAP_BLENDING_MIX",[lm]:"ENVMAP_BLENDING_ADD"};function U_(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":k_[i.combine]||"ENVMAP_BLENDING_NONE"}function N_(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function O_(i,e,t,n){let r=i.getContext(),s=t.defines,a=t.vertexShader,o=t.fragmentShader,c=P_(t),h=F_(t),u=D_(t),f=U_(t),d=N_(t),p=__(t),m=M_(s),x=r.createProgram(),g,l,w=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(vo).join(`
`),g.length>0&&(g+=`
`),l=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(vo).join(`
`),l.length>0&&(l+=`
`)):(g=[Hm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(vo).join(`
`),l=[Hm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ai?"#define TONE_MAPPING":"",t.toneMapping!==Ai?Dt.tonemapping_pars_fragment:"",t.toneMapping!==Ai?b_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Dt.colorspace_pars_fragment,x_("linearToOutputTexel",t.outputColorSpace),y_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(vo).join(`
`)),a=lf(a),a=Bm(a,t),a=zm(a,t),o=lf(o),o=Bm(o,t),o=zm(o,t),a=Gm(a),o=Gm(o),t.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,l=["#define varying in",t.glslVersion===Wu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Wu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+l);let T=w+g+a,y=w+l+o,E=Um(r,r.VERTEX_SHADER,T),R=Um(r,r.FRAGMENT_SHADER,y);r.attachShader(x,E),r.attachShader(x,R),t.index0AttributeName!==void 0?r.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(x,0,"position"),r.linkProgram(x);function P(F){if(i.debug.checkShaderErrors){let z=r.getProgramInfoLog(x)||"",L=r.getShaderInfoLog(E)||"",D=r.getShaderInfoLog(R)||"",H=z.trim(),Y=L.trim(),G=D.trim(),re=!0,fe=!0;if(r.getProgramParameter(x,r.LINK_STATUS)===!1)if(re=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,x,E,R);else{let ge=Om(r,E,"vertex"),Te=Om(r,R,"fragment");bt("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(x,r.VALIDATE_STATUS)+`

Material Name: `+F.name+`
Material Type: `+F.type+`

Program Info Log: `+H+`
`+ge+`
`+Te)}else H!==""?ct("WebGLProgram: Program Info Log:",H):(Y===""||G==="")&&(fe=!1);fe&&(F.diagnostics={runnable:re,programLog:H,vertexShader:{log:Y,prefix:g},fragmentShader:{log:G,prefix:l}})}r.deleteShader(E),r.deleteShader(R),B=new oa(r,x),M=w_(r,x)}let B;this.getUniforms=function(){return B===void 0&&P(this),B};let M;this.getAttributes=function(){return M===void 0&&P(this),M};let _=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=r.getProgramParameter(x,d_)),_},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=p_++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=E,this.fragmentShader=R,this}var B_=0,cf=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new hf(e),t.set(e,n)),n}},hf=class{constructor(e){this.id=B_++,this.code=e,this.usedTimes=0}};function z_(i,e,t,n,r,s,a){let o=new Oa,c=new cf,h=new Set,u=[],f=new Map,d=r.logarithmicDepthBuffer,p=r.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(M){return h.add(M),M===0?"uv":`uv${M}`}function g(M,_,F,z,L){let D=z.fog,H=L.geometry,Y=M.isMeshStandardMaterial?z.environment:null,G=(M.isMeshStandardMaterial?t:e).get(M.envMap||Y),re=G&&G.mapping===co?G.image.height:null,fe=m[M.type];M.precision!==null&&(p=r.getMaxPrecision(M.precision),p!==M.precision&&ct("WebGLProgram.getParameters:",M.precision,"not supported, using",p,"instead."));let ge=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,Te=ge!==void 0?ge.length:0,qe=0;H.morphAttributes.position!==void 0&&(qe=1),H.morphAttributes.normal!==void 0&&(qe=2),H.morphAttributes.color!==void 0&&(qe=3);let Re,Q,we,j;if(fe){let me=ji[fe];Re=me.vertexShader,Q=me.fragmentShader}else Re=M.vertexShader,Q=M.fragmentShader,c.update(M),we=c.getVertexShaderID(M),j=c.getFragmentShaderID(M);let ee=i.getRenderTarget(),be=i.state.buffers.depth.getReversed(),Ne=L.isInstancedMesh===!0,Ee=L.isBatchedMesh===!0,rt=!!M.map,Pe=!!M.matcap,Mt=!!G,Et=!!M.aoMap,st=!!M.lightMap,ht=!!M.bumpMap,Bt=!!M.normalMap,I=!!M.displacementMap,Ft=!!M.emissiveMap,wt=!!M.metalnessMap,vt=!!M.roughnessMap,Oe=M.anisotropy>0,C=M.clearcoat>0,b=M.dispersion>0,U=M.iridescence>0,le=M.sheen>0,ue=M.transmission>0,se=Oe&&!!M.anisotropyMap,je=C&&!!M.clearcoatMap,ye=C&&!!M.clearcoatNormalMap,Le=C&&!!M.clearcoatRoughnessMap,at=U&&!!M.iridescenceMap,ce=U&&!!M.iridescenceThicknessMap,Se=le&&!!M.sheenColorMap,Ae=le&&!!M.sheenRoughnessMap,Xe=!!M.specularMap,_e=!!M.specularColorMap,mt=!!M.specularIntensityMap,v=ue&&!!M.transmissionMap,q=ue&&!!M.thicknessMap,k=!!M.gradientMap,oe=!!M.alphaMap,ie=M.alphaTest>0,J=!!M.alphaHash,de=!!M.extensions,De=Ai;M.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(De=i.toneMapping);let ve={shaderID:fe,shaderType:M.type,shaderName:M.name,vertexShader:Re,fragmentShader:Q,defines:M.defines,customVertexShaderID:we,customFragmentShaderID:j,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:p,batching:Ee,batchingColor:Ee&&L._colorsTexture!==null,instancing:Ne,instancingColor:Ne&&L.instanceColor!==null,instancingMorph:Ne&&L.morphTexture!==null,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:Pn,alphaToCoverage:!!M.alphaToCoverage,map:rt,matcap:Pe,envMap:Mt,envMapMode:Mt&&G.mapping,envMapCubeUVHeight:re,aoMap:Et,lightMap:st,bumpMap:ht,normalMap:Bt,displacementMap:I,emissiveMap:Ft,normalMapObjectSpace:Bt&&M.normalMapType===fm,normalMapTangentSpace:Bt&&M.normalMapType===Vu,metalnessMap:wt,roughnessMap:vt,anisotropy:Oe,anisotropyMap:se,clearcoat:C,clearcoatMap:je,clearcoatNormalMap:ye,clearcoatRoughnessMap:Le,dispersion:b,iridescence:U,iridescenceMap:at,iridescenceThicknessMap:ce,sheen:le,sheenColorMap:Se,sheenRoughnessMap:Ae,specularMap:Xe,specularColorMap:_e,specularIntensityMap:mt,transmission:ue,transmissionMap:v,thicknessMap:q,gradientMap:k,opaque:M.transparent===!1&&M.blending===es&&M.alphaToCoverage===!1,alphaMap:oe,alphaTest:ie,alphaHash:J,combine:M.combine,mapUv:rt&&x(M.map.channel),aoMapUv:Et&&x(M.aoMap.channel),lightMapUv:st&&x(M.lightMap.channel),bumpMapUv:ht&&x(M.bumpMap.channel),normalMapUv:Bt&&x(M.normalMap.channel),displacementMapUv:I&&x(M.displacementMap.channel),emissiveMapUv:Ft&&x(M.emissiveMap.channel),metalnessMapUv:wt&&x(M.metalnessMap.channel),roughnessMapUv:vt&&x(M.roughnessMap.channel),anisotropyMapUv:se&&x(M.anisotropyMap.channel),clearcoatMapUv:je&&x(M.clearcoatMap.channel),clearcoatNormalMapUv:ye&&x(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Le&&x(M.clearcoatRoughnessMap.channel),iridescenceMapUv:at&&x(M.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&x(M.iridescenceThicknessMap.channel),sheenColorMapUv:Se&&x(M.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&x(M.sheenRoughnessMap.channel),specularMapUv:Xe&&x(M.specularMap.channel),specularColorMapUv:_e&&x(M.specularColorMap.channel),specularIntensityMapUv:mt&&x(M.specularIntensityMap.channel),transmissionMapUv:v&&x(M.transmissionMap.channel),thicknessMapUv:q&&x(M.thicknessMap.channel),alphaMapUv:oe&&x(M.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(Bt||Oe),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!H.attributes.uv&&(rt||oe),fog:!!D,useFog:M.fog===!0,fogExp2:!!D&&D.isFogExp2,flatShading:M.flatShading===!0&&M.wireframe===!1,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:be,skinning:L.isSkinnedMesh===!0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:Te,morphTextureStride:qe,numDirLights:_.directional.length,numPointLights:_.point.length,numSpotLights:_.spot.length,numSpotLightMaps:_.spotLightMap.length,numRectAreaLights:_.rectArea.length,numHemiLights:_.hemi.length,numDirLightShadows:_.directionalShadowMap.length,numPointLightShadows:_.pointShadowMap.length,numSpotLightShadows:_.spotShadowMap.length,numSpotLightShadowsWithMaps:_.numSpotLightShadowsWithMaps,numLightProbes:_.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&F.length>0,shadowMapType:i.shadowMap.type,toneMapping:De,decodeVideoTexture:rt&&M.map.isVideoTexture===!0&&Ut.getTransfer(M.map.colorSpace)===jt,decodeVideoTextureEmissive:Ft&&M.emissiveMap.isVideoTexture===!0&&Ut.getTransfer(M.emissiveMap.colorSpace)===jt,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===mi,flipSided:M.side===Xn,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:de&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(de&&M.extensions.multiDraw===!0||Ee)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return ve.vertexUv1s=h.has(1),ve.vertexUv2s=h.has(2),ve.vertexUv3s=h.has(3),h.clear(),ve}function l(M){let _=[];if(M.shaderID?_.push(M.shaderID):(_.push(M.customVertexShaderID),_.push(M.customFragmentShaderID)),M.defines!==void 0)for(let F in M.defines)_.push(F),_.push(M.defines[F]);return M.isRawShaderMaterial===!1&&(w(_,M),T(_,M),_.push(i.outputColorSpace)),_.push(M.customProgramCacheKey),_.join()}function w(M,_){M.push(_.precision),M.push(_.outputColorSpace),M.push(_.envMapMode),M.push(_.envMapCubeUVHeight),M.push(_.mapUv),M.push(_.alphaMapUv),M.push(_.lightMapUv),M.push(_.aoMapUv),M.push(_.bumpMapUv),M.push(_.normalMapUv),M.push(_.displacementMapUv),M.push(_.emissiveMapUv),M.push(_.metalnessMapUv),M.push(_.roughnessMapUv),M.push(_.anisotropyMapUv),M.push(_.clearcoatMapUv),M.push(_.clearcoatNormalMapUv),M.push(_.clearcoatRoughnessMapUv),M.push(_.iridescenceMapUv),M.push(_.iridescenceThicknessMapUv),M.push(_.sheenColorMapUv),M.push(_.sheenRoughnessMapUv),M.push(_.specularMapUv),M.push(_.specularColorMapUv),M.push(_.specularIntensityMapUv),M.push(_.transmissionMapUv),M.push(_.thicknessMapUv),M.push(_.combine),M.push(_.fogExp2),M.push(_.sizeAttenuation),M.push(_.morphTargetsCount),M.push(_.morphAttributeCount),M.push(_.numDirLights),M.push(_.numPointLights),M.push(_.numSpotLights),M.push(_.numSpotLightMaps),M.push(_.numHemiLights),M.push(_.numRectAreaLights),M.push(_.numDirLightShadows),M.push(_.numPointLightShadows),M.push(_.numSpotLightShadows),M.push(_.numSpotLightShadowsWithMaps),M.push(_.numLightProbes),M.push(_.shadowMapType),M.push(_.toneMapping),M.push(_.numClippingPlanes),M.push(_.numClipIntersection),M.push(_.depthPacking)}function T(M,_){o.disableAll(),_.instancing&&o.enable(0),_.instancingColor&&o.enable(1),_.instancingMorph&&o.enable(2),_.matcap&&o.enable(3),_.envMap&&o.enable(4),_.normalMapObjectSpace&&o.enable(5),_.normalMapTangentSpace&&o.enable(6),_.clearcoat&&o.enable(7),_.iridescence&&o.enable(8),_.alphaTest&&o.enable(9),_.vertexColors&&o.enable(10),_.vertexAlphas&&o.enable(11),_.vertexUv1s&&o.enable(12),_.vertexUv2s&&o.enable(13),_.vertexUv3s&&o.enable(14),_.vertexTangents&&o.enable(15),_.anisotropy&&o.enable(16),_.alphaHash&&o.enable(17),_.batching&&o.enable(18),_.dispersion&&o.enable(19),_.batchingColor&&o.enable(20),_.gradientMap&&o.enable(21),M.push(o.mask),o.disableAll(),_.fog&&o.enable(0),_.useFog&&o.enable(1),_.flatShading&&o.enable(2),_.logarithmicDepthBuffer&&o.enable(3),_.reversedDepthBuffer&&o.enable(4),_.skinning&&o.enable(5),_.morphTargets&&o.enable(6),_.morphNormals&&o.enable(7),_.morphColors&&o.enable(8),_.premultipliedAlpha&&o.enable(9),_.shadowMapEnabled&&o.enable(10),_.doubleSided&&o.enable(11),_.flipSided&&o.enable(12),_.useDepthPacking&&o.enable(13),_.dithering&&o.enable(14),_.transmission&&o.enable(15),_.sheen&&o.enable(16),_.opaque&&o.enable(17),_.pointsUvs&&o.enable(18),_.decodeVideoTexture&&o.enable(19),_.decodeVideoTextureEmissive&&o.enable(20),_.alphaToCoverage&&o.enable(21),M.push(o.mask)}function y(M){let _=m[M.type],F;if(_){let z=ji[_];F=Mm.clone(z.uniforms)}else F=M.uniforms;return F}function E(M,_){let F=f.get(_);return F!==void 0?++F.usedTimes:(F=new O_(i,_,M,s),u.push(F),f.set(_,F)),F}function R(M){if(--M.usedTimes===0){let _=u.indexOf(M);u[_]=u[u.length-1],u.pop(),f.delete(M.cacheKey),M.destroy()}}function P(M){c.remove(M)}function B(){c.dispose()}return{getParameters:g,getProgramCacheKey:l,getUniforms:y,acquireProgram:E,releaseProgram:R,releaseShaderCache:P,programs:u,dispose:B}}function G_(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function r(a,o,c){i.get(a)[o]=c}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function H_(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Vm(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Wm(){let i=[],e=0,t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function a(f,d,p,m,x,g){let l=i[e];return l===void 0?(l={id:f.id,object:f,geometry:d,material:p,groupOrder:m,renderOrder:f.renderOrder,z:x,group:g},i[e]=l):(l.id=f.id,l.object=f,l.geometry=d,l.material=p,l.groupOrder=m,l.renderOrder=f.renderOrder,l.z=x,l.group=g),e++,l}function o(f,d,p,m,x,g){let l=a(f,d,p,m,x,g);p.transmission>0?n.push(l):p.transparent===!0?r.push(l):t.push(l)}function c(f,d,p,m,x,g){let l=a(f,d,p,m,x,g);p.transmission>0?n.unshift(l):p.transparent===!0?r.unshift(l):t.unshift(l)}function h(f,d){t.length>1&&t.sort(f||H_),n.length>1&&n.sort(d||Vm),r.length>1&&r.sort(d||Vm)}function u(){for(let f=e,d=i.length;f<d;f++){let p=i[f];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:o,unshift:c,finish:u,sort:h}}function V_(){let i=new WeakMap;function e(n,r){let s=i.get(n),a;return s===void 0?(a=new Wm,i.set(n,[a])):r>=s.length?(a=new Wm,s.push(a)):a=s[r],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function W_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new W,color:new _t};break;case"SpotLight":t={position:new W,direction:new W,color:new _t,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new W,color:new _t,distance:0,decay:0};break;case"HemisphereLight":t={direction:new W,skyColor:new _t,groundColor:new _t};break;case"RectAreaLight":t={color:new _t,position:new W,halfWidth:new W,halfHeight:new W};break}return i[e.id]=t,t}}}function X_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var q_=0;function j_(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Y_(i){let e=new W_,t=X_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)n.probe.push(new W);let r=new W,s=new It,a=new It;function o(h){let u=0,f=0,d=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let p=0,m=0,x=0,g=0,l=0,w=0,T=0,y=0,E=0,R=0,P=0;h.sort(j_);for(let M=0,_=h.length;M<_;M++){let F=h[M],z=F.color,L=F.intensity,D=F.distance,H=null;if(F.shadow&&F.shadow.map&&(F.shadow.map.texture.format===us?H=F.shadow.map.texture:H=F.shadow.map.depthTexture||F.shadow.map.texture),F.isAmbientLight)u+=z.r*L,f+=z.g*L,d+=z.b*L;else if(F.isLightProbe){for(let Y=0;Y<9;Y++)n.probe[Y].addScaledVector(F.sh.coefficients[Y],L);P++}else if(F.isDirectionalLight){let Y=e.get(F);if(Y.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){let G=F.shadow,re=t.get(F);re.shadowIntensity=G.intensity,re.shadowBias=G.bias,re.shadowNormalBias=G.normalBias,re.shadowRadius=G.radius,re.shadowMapSize=G.mapSize,n.directionalShadow[p]=re,n.directionalShadowMap[p]=H,n.directionalShadowMatrix[p]=F.shadow.matrix,w++}n.directional[p]=Y,p++}else if(F.isSpotLight){let Y=e.get(F);Y.position.setFromMatrixPosition(F.matrixWorld),Y.color.copy(z).multiplyScalar(L),Y.distance=D,Y.coneCos=Math.cos(F.angle),Y.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),Y.decay=F.decay,n.spot[x]=Y;let G=F.shadow;if(F.map&&(n.spotLightMap[E]=F.map,E++,G.updateMatrices(F),F.castShadow&&R++),n.spotLightMatrix[x]=G.matrix,F.castShadow){let re=t.get(F);re.shadowIntensity=G.intensity,re.shadowBias=G.bias,re.shadowNormalBias=G.normalBias,re.shadowRadius=G.radius,re.shadowMapSize=G.mapSize,n.spotShadow[x]=re,n.spotShadowMap[x]=H,y++}x++}else if(F.isRectAreaLight){let Y=e.get(F);Y.color.copy(z).multiplyScalar(L),Y.halfWidth.set(F.width*.5,0,0),Y.halfHeight.set(0,F.height*.5,0),n.rectArea[g]=Y,g++}else if(F.isPointLight){let Y=e.get(F);if(Y.color.copy(F.color).multiplyScalar(F.intensity),Y.distance=F.distance,Y.decay=F.decay,F.castShadow){let G=F.shadow,re=t.get(F);re.shadowIntensity=G.intensity,re.shadowBias=G.bias,re.shadowNormalBias=G.normalBias,re.shadowRadius=G.radius,re.shadowMapSize=G.mapSize,re.shadowCameraNear=G.camera.near,re.shadowCameraFar=G.camera.far,n.pointShadow[m]=re,n.pointShadowMap[m]=H,n.pointShadowMatrix[m]=F.shadow.matrix,T++}n.point[m]=Y,m++}else if(F.isHemisphereLight){let Y=e.get(F);Y.skyColor.copy(F.color).multiplyScalar(L),Y.groundColor.copy(F.groundColor).multiplyScalar(L),n.hemi[l]=Y,l++}}g>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ze.LTC_FLOAT_1,n.rectAreaLTC2=ze.LTC_FLOAT_2):(n.rectAreaLTC1=ze.LTC_HALF_1,n.rectAreaLTC2=ze.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=d;let B=n.hash;(B.directionalLength!==p||B.pointLength!==m||B.spotLength!==x||B.rectAreaLength!==g||B.hemiLength!==l||B.numDirectionalShadows!==w||B.numPointShadows!==T||B.numSpotShadows!==y||B.numSpotMaps!==E||B.numLightProbes!==P)&&(n.directional.length=p,n.spot.length=x,n.rectArea.length=g,n.point.length=m,n.hemi.length=l,n.directionalShadow.length=w,n.directionalShadowMap.length=w,n.pointShadow.length=T,n.pointShadowMap.length=T,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=w,n.pointShadowMatrix.length=T,n.spotLightMatrix.length=y+E-R,n.spotLightMap.length=E,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=P,B.directionalLength=p,B.pointLength=m,B.spotLength=x,B.rectAreaLength=g,B.hemiLength=l,B.numDirectionalShadows=w,B.numPointShadows=T,B.numSpotShadows=y,B.numSpotMaps=E,B.numLightProbes=P,n.version=q_++)}function c(h,u){let f=0,d=0,p=0,m=0,x=0,g=u.matrixWorldInverse;for(let l=0,w=h.length;l<w;l++){let T=h[l];if(T.isDirectionalLight){let y=n.directional[f];y.direction.setFromMatrixPosition(T.matrixWorld),r.setFromMatrixPosition(T.target.matrixWorld),y.direction.sub(r),y.direction.transformDirection(g),f++}else if(T.isSpotLight){let y=n.spot[p];y.position.setFromMatrixPosition(T.matrixWorld),y.position.applyMatrix4(g),y.direction.setFromMatrixPosition(T.matrixWorld),r.setFromMatrixPosition(T.target.matrixWorld),y.direction.sub(r),y.direction.transformDirection(g),p++}else if(T.isRectAreaLight){let y=n.rectArea[m];y.position.setFromMatrixPosition(T.matrixWorld),y.position.applyMatrix4(g),a.identity(),s.copy(T.matrixWorld),s.premultiply(g),a.extractRotation(s),y.halfWidth.set(T.width*.5,0,0),y.halfHeight.set(0,T.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),m++}else if(T.isPointLight){let y=n.point[d];y.position.setFromMatrixPosition(T.matrixWorld),y.position.applyMatrix4(g),d++}else if(T.isHemisphereLight){let y=n.hemi[x];y.direction.setFromMatrixPosition(T.matrixWorld),y.direction.transformDirection(g),x++}}}return{setup:o,setupView:c,state:n}}function Xm(i){let e=new Y_(i),t=[],n=[];function r(u){h.camera=u,t.length=0,n.length=0}function s(u){t.push(u)}function a(u){n.push(u)}function o(){e.setup(t)}function c(u){e.setupView(t,u)}let h={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:h,setupLights:o,setupLightsView:c,pushLight:s,pushShadow:a}}function K_(i){let e=new WeakMap;function t(r,s=0){let a=e.get(r),o;return a===void 0?(o=new Xm(i),e.set(r,[o])):s>=a.length?(o=new Xm(i),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var $_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,J_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Z_=[new W(1,0,0),new W(-1,0,0),new W(0,1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1)],Q_=[new W(0,-1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1),new W(0,-1,0),new W(0,-1,0)],qm=new It,xo=new W,nf=new W;function e1(i,e,t){let n=new $s,r=new zt,s=new zt,a=new Qt,o=new Al,c=new Rl,h={},u=t.maxTextureSize,f={[Si]:Xn,[Xn]:Si,[mi]:mi},d=new ai({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new zt},radius:{value:4}},vertexShader:$_,fragmentShader:J_}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let m=new Wn;m.setAttribute("position",new xn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Fn(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=oo;let l=this.type;this.render=function(R,P,B){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||R.length===0)return;R.type===Hp&&(ct("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),R.type=oo);let M=i.getRenderTarget(),_=i.getActiveCubeFace(),F=i.getActiveMipmapLevel(),z=i.state;z.setBlending(Wi),z.buffers.depth.getReversed()===!0?z.buffers.color.setClear(0,0,0,0):z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);let L=l!==this.type;L&&P.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(H=>H.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,H=R.length;D<H;D++){let Y=R[D],G=Y.shadow;if(G===void 0){ct("WebGLShadowMap:",Y,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;r.copy(G.mapSize);let re=G.getFrameExtents();if(r.multiply(re),s.copy(G.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/re.x),r.x=s.x*re.x,G.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/re.y),r.y=s.y*re.y,G.mapSize.y=s.y)),G.map===null||L===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===ea){if(Y.isPointLight){ct("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new si(r.x,r.y,{format:us,type:Xi,minFilter:dn,magFilter:dn,generateMipmaps:!1}),G.map.texture.name=Y.name+".shadowMap",G.map.depthTexture=new Lr(r.x,r.y,oi),G.map.depthTexture.name=Y.name+".shadowMapDepth",G.map.depthTexture.format=Oi,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=fn,G.map.depthTexture.magFilter=fn}else{Y.isPointLight?(G.map=new Va(r.x),G.map.depthTexture=new Tl(r.x,Ci)):(G.map=new si(r.x,r.y),G.map.depthTexture=new Lr(r.x,r.y,Ci)),G.map.depthTexture.name=Y.name+".shadowMap",G.map.depthTexture.format=Oi;let ge=i.state.buffers.depth.getReversed();this.type===oo?(G.map.depthTexture.compareFunction=ge?Fc:Ic,G.map.depthTexture.minFilter=dn,G.map.depthTexture.magFilter=dn):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=fn,G.map.depthTexture.magFilter=fn)}G.camera.updateProjectionMatrix()}let fe=G.map.isWebGLCubeRenderTarget?6:1;for(let ge=0;ge<fe;ge++){if(G.map.isWebGLCubeRenderTarget)i.setRenderTarget(G.map,ge),i.clear();else{ge===0&&(i.setRenderTarget(G.map),i.clear());let Te=G.getViewport(ge);a.set(s.x*Te.x,s.y*Te.y,s.x*Te.z,s.y*Te.w),z.viewport(a)}if(Y.isPointLight){let Te=G.camera,qe=G.matrix,Re=Y.distance||Te.far;Re!==Te.far&&(Te.far=Re,Te.updateProjectionMatrix()),xo.setFromMatrixPosition(Y.matrixWorld),Te.position.copy(xo),nf.copy(Te.position),nf.add(Z_[ge]),Te.up.copy(Q_[ge]),Te.lookAt(nf),Te.updateMatrixWorld(),qe.makeTranslation(-xo.x,-xo.y,-xo.z),qm.multiplyMatrices(Te.projectionMatrix,Te.matrixWorldInverse),G._frustum.setFromProjectionMatrix(qm,Te.coordinateSystem,Te.reversedDepth)}else G.updateMatrices(Y);n=G.getFrustum(),y(P,B,G.camera,Y,this.type)}G.isPointLightShadow!==!0&&this.type===ea&&w(G,B),G.needsUpdate=!1}l=this.type,g.needsUpdate=!1,i.setRenderTarget(M,_,F)};function w(R,P){let B=e.update(x);d.defines.VSM_SAMPLES!==R.blurSamples&&(d.defines.VSM_SAMPLES=R.blurSamples,p.defines.VSM_SAMPLES=R.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new si(r.x,r.y,{format:us,type:Xi})),d.uniforms.shadow_pass.value=R.map.depthTexture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(P,null,B,d,x,null),p.uniforms.shadow_pass.value=R.mapPass.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(P,null,B,p,x,null)}function T(R,P,B,M){let _=null,F=B.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(F!==void 0)_=F;else if(_=B.isPointLight===!0?c:o,i.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let z=_.uuid,L=P.uuid,D=h[z];D===void 0&&(D={},h[z]=D);let H=D[L];H===void 0&&(H=_.clone(),D[L]=H,P.addEventListener("dispose",E)),_=H}if(_.visible=P.visible,_.wireframe=P.wireframe,M===ea?_.side=P.shadowSide!==null?P.shadowSide:P.side:_.side=P.shadowSide!==null?P.shadowSide:f[P.side],_.alphaMap=P.alphaMap,_.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,_.map=P.map,_.clipShadows=P.clipShadows,_.clippingPlanes=P.clippingPlanes,_.clipIntersection=P.clipIntersection,_.displacementMap=P.displacementMap,_.displacementScale=P.displacementScale,_.displacementBias=P.displacementBias,_.wireframeLinewidth=P.wireframeLinewidth,_.linewidth=P.linewidth,B.isPointLight===!0&&_.isMeshDistanceMaterial===!0){let z=i.properties.get(_);z.light=B}return _}function y(R,P,B,M,_){if(R.visible===!1)return;if(R.layers.test(P.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&_===ea)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,R.matrixWorld);let L=e.update(R),D=R.material;if(Array.isArray(D)){let H=L.groups;for(let Y=0,G=H.length;Y<G;Y++){let re=H[Y],fe=D[re.materialIndex];if(fe&&fe.visible){let ge=T(R,fe,M,_);R.onBeforeShadow(i,R,P,B,L,ge,re),i.renderBufferDirect(B,null,L,ge,R,re),R.onAfterShadow(i,R,P,B,L,ge,re)}}}else if(D.visible){let H=T(R,D,M,_);R.onBeforeShadow(i,R,P,B,L,H,null),i.renderBufferDirect(B,null,L,H,R,null),R.onAfterShadow(i,R,P,B,L,H,null)}}let z=R.children;for(let L=0,D=z.length;L<D;L++)y(z[L],P,B,M,_)}function E(R){R.target.removeEventListener("dispose",E);for(let B in h){let M=h[B],_=R.target.uuid;_ in M&&(M[_].dispose(),delete M[_])}}}var t1={[Ul]:Nl,[Ol]:Gl,[Bl]:Hl,[ts]:zl,[Nl]:Ul,[Gl]:Ol,[Hl]:Bl,[zl]:ts};function n1(i,e){function t(){let v=!1,q=new Qt,k=null,oe=new Qt(0,0,0,0);return{setMask:function(ie){k!==ie&&!v&&(i.colorMask(ie,ie,ie,ie),k=ie)},setLocked:function(ie){v=ie},setClear:function(ie,J,de,De,ve){ve===!0&&(ie*=De,J*=De,de*=De),q.set(ie,J,de,De),oe.equals(q)===!1&&(i.clearColor(ie,J,de,De),oe.copy(q))},reset:function(){v=!1,k=null,oe.set(-1,0,0,0)}}}function n(){let v=!1,q=!1,k=null,oe=null,ie=null;return{setReversed:function(J){if(q!==J){let de=e.get("EXT_clip_control");J?de.clipControlEXT(de.LOWER_LEFT_EXT,de.ZERO_TO_ONE_EXT):de.clipControlEXT(de.LOWER_LEFT_EXT,de.NEGATIVE_ONE_TO_ONE_EXT),q=J;let De=ie;ie=null,this.setClear(De)}},getReversed:function(){return q},setTest:function(J){J?ee(i.DEPTH_TEST):be(i.DEPTH_TEST)},setMask:function(J){k!==J&&!v&&(i.depthMask(J),k=J)},setFunc:function(J){if(q&&(J=t1[J]),oe!==J){switch(J){case Ul:i.depthFunc(i.NEVER);break;case Nl:i.depthFunc(i.ALWAYS);break;case Ol:i.depthFunc(i.LESS);break;case ts:i.depthFunc(i.LEQUAL);break;case Bl:i.depthFunc(i.EQUAL);break;case zl:i.depthFunc(i.GEQUAL);break;case Gl:i.depthFunc(i.GREATER);break;case Hl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}oe=J}},setLocked:function(J){v=J},setClear:function(J){ie!==J&&(q&&(J=1-J),i.clearDepth(J),ie=J)},reset:function(){v=!1,k=null,oe=null,ie=null,q=!1}}}function r(){let v=!1,q=null,k=null,oe=null,ie=null,J=null,de=null,De=null,ve=null;return{setTest:function(me){v||(me?ee(i.STENCIL_TEST):be(i.STENCIL_TEST))},setMask:function(me){q!==me&&!v&&(i.stencilMask(me),q=me)},setFunc:function(me,Ye,gt){(k!==me||oe!==Ye||ie!==gt)&&(i.stencilFunc(me,Ye,gt),k=me,oe=Ye,ie=gt)},setOp:function(me,Ye,gt){(J!==me||de!==Ye||De!==gt)&&(i.stencilOp(me,Ye,gt),J=me,de=Ye,De=gt)},setLocked:function(me){v=me},setClear:function(me){ve!==me&&(i.clearStencil(me),ve=me)},reset:function(){v=!1,q=null,k=null,oe=null,ie=null,J=null,de=null,De=null,ve=null}}}let s=new t,a=new n,o=new r,c=new WeakMap,h=new WeakMap,u={},f={},d=new WeakMap,p=[],m=null,x=!1,g=null,l=null,w=null,T=null,y=null,E=null,R=null,P=new _t(0,0,0),B=0,M=!1,_=null,F=null,z=null,L=null,D=null,H=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,G=0,re=i.getParameter(i.VERSION);re.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(re)[1]),Y=G>=1):re.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),Y=G>=2);let fe=null,ge={},Te=i.getParameter(i.SCISSOR_BOX),qe=i.getParameter(i.VIEWPORT),Re=new Qt().fromArray(Te),Q=new Qt().fromArray(qe);function we(v,q,k,oe){let ie=new Uint8Array(4),J=i.createTexture();i.bindTexture(v,J),i.texParameteri(v,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(v,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let de=0;de<k;de++)v===i.TEXTURE_3D||v===i.TEXTURE_2D_ARRAY?i.texImage3D(q,0,i.RGBA,1,1,oe,0,i.RGBA,i.UNSIGNED_BYTE,ie):i.texImage2D(q+de,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ie);return J}let j={};j[i.TEXTURE_2D]=we(i.TEXTURE_2D,i.TEXTURE_2D,1),j[i.TEXTURE_CUBE_MAP]=we(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),j[i.TEXTURE_2D_ARRAY]=we(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),j[i.TEXTURE_3D]=we(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ee(i.DEPTH_TEST),a.setFunc(ts),ht(!1),Bt(Su),ee(i.CULL_FACE),Et(Wi);function ee(v){u[v]!==!0&&(i.enable(v),u[v]=!0)}function be(v){u[v]!==!1&&(i.disable(v),u[v]=!1)}function Ne(v,q){return f[v]!==q?(i.bindFramebuffer(v,q),f[v]=q,v===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=q),v===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=q),!0):!1}function Ee(v,q){let k=p,oe=!1;if(v){k=d.get(q),k===void 0&&(k=[],d.set(q,k));let ie=v.textures;if(k.length!==ie.length||k[0]!==i.COLOR_ATTACHMENT0){for(let J=0,de=ie.length;J<de;J++)k[J]=i.COLOR_ATTACHMENT0+J;k.length=ie.length,oe=!0}}else k[0]!==i.BACK&&(k[0]=i.BACK,oe=!0);oe&&i.drawBuffers(k)}function rt(v){return m!==v?(i.useProgram(v),m=v,!0):!1}let Pe={[Pr]:i.FUNC_ADD,[Wp]:i.FUNC_SUBTRACT,[Xp]:i.FUNC_REVERSE_SUBTRACT};Pe[qp]=i.MIN,Pe[jp]=i.MAX;let Mt={[Yp]:i.ZERO,[Kp]:i.ONE,[$p]:i.SRC_COLOR,[gl]:i.SRC_ALPHA,[nm]:i.SRC_ALPHA_SATURATE,[em]:i.DST_COLOR,[Zp]:i.DST_ALPHA,[Jp]:i.ONE_MINUS_SRC_COLOR,[xl]:i.ONE_MINUS_SRC_ALPHA,[tm]:i.ONE_MINUS_DST_COLOR,[Qp]:i.ONE_MINUS_DST_ALPHA,[im]:i.CONSTANT_COLOR,[rm]:i.ONE_MINUS_CONSTANT_COLOR,[sm]:i.CONSTANT_ALPHA,[am]:i.ONE_MINUS_CONSTANT_ALPHA};function Et(v,q,k,oe,ie,J,de,De,ve,me){if(v===Wi){x===!0&&(be(i.BLEND),x=!1);return}if(x===!1&&(ee(i.BLEND),x=!0),v!==Vp){if(v!==g||me!==M){if((l!==Pr||y!==Pr)&&(i.blendEquation(i.FUNC_ADD),l=Pr,y=Pr),me)switch(v){case es:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Tu:i.blendFunc(i.ONE,i.ONE);break;case Eu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Au:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:bt("WebGLState: Invalid blending: ",v);break}else switch(v){case es:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Tu:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Eu:bt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Au:bt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:bt("WebGLState: Invalid blending: ",v);break}w=null,T=null,E=null,R=null,P.set(0,0,0),B=0,g=v,M=me}return}ie=ie||q,J=J||k,de=de||oe,(q!==l||ie!==y)&&(i.blendEquationSeparate(Pe[q],Pe[ie]),l=q,y=ie),(k!==w||oe!==T||J!==E||de!==R)&&(i.blendFuncSeparate(Mt[k],Mt[oe],Mt[J],Mt[de]),w=k,T=oe,E=J,R=de),(De.equals(P)===!1||ve!==B)&&(i.blendColor(De.r,De.g,De.b,ve),P.copy(De),B=ve),g=v,M=!1}function st(v,q){v.side===mi?be(i.CULL_FACE):ee(i.CULL_FACE);let k=v.side===Xn;q&&(k=!k),ht(k),v.blending===es&&v.transparent===!1?Et(Wi):Et(v.blending,v.blendEquation,v.blendSrc,v.blendDst,v.blendEquationAlpha,v.blendSrcAlpha,v.blendDstAlpha,v.blendColor,v.blendAlpha,v.premultipliedAlpha),a.setFunc(v.depthFunc),a.setTest(v.depthTest),a.setMask(v.depthWrite),s.setMask(v.colorWrite);let oe=v.stencilWrite;o.setTest(oe),oe&&(o.setMask(v.stencilWriteMask),o.setFunc(v.stencilFunc,v.stencilRef,v.stencilFuncMask),o.setOp(v.stencilFail,v.stencilZFail,v.stencilZPass)),Ft(v.polygonOffset,v.polygonOffsetFactor,v.polygonOffsetUnits),v.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):be(i.SAMPLE_ALPHA_TO_COVERAGE)}function ht(v){_!==v&&(v?i.frontFace(i.CW):i.frontFace(i.CCW),_=v)}function Bt(v){v!==zp?(ee(i.CULL_FACE),v!==F&&(v===Su?i.cullFace(i.BACK):v===Gp?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):be(i.CULL_FACE),F=v}function I(v){v!==z&&(Y&&i.lineWidth(v),z=v)}function Ft(v,q,k){v?(ee(i.POLYGON_OFFSET_FILL),(L!==q||D!==k)&&(i.polygonOffset(q,k),L=q,D=k)):be(i.POLYGON_OFFSET_FILL)}function wt(v){v?ee(i.SCISSOR_TEST):be(i.SCISSOR_TEST)}function vt(v){v===void 0&&(v=i.TEXTURE0+H-1),fe!==v&&(i.activeTexture(v),fe=v)}function Oe(v,q,k){k===void 0&&(fe===null?k=i.TEXTURE0+H-1:k=fe);let oe=ge[k];oe===void 0&&(oe={type:void 0,texture:void 0},ge[k]=oe),(oe.type!==v||oe.texture!==q)&&(fe!==k&&(i.activeTexture(k),fe=k),i.bindTexture(v,q||j[v]),oe.type=v,oe.texture=q)}function C(){let v=ge[fe];v!==void 0&&v.type!==void 0&&(i.bindTexture(v.type,null),v.type=void 0,v.texture=void 0)}function b(){try{i.compressedTexImage2D(...arguments)}catch(v){bt("WebGLState:",v)}}function U(){try{i.compressedTexImage3D(...arguments)}catch(v){bt("WebGLState:",v)}}function le(){try{i.texSubImage2D(...arguments)}catch(v){bt("WebGLState:",v)}}function ue(){try{i.texSubImage3D(...arguments)}catch(v){bt("WebGLState:",v)}}function se(){try{i.compressedTexSubImage2D(...arguments)}catch(v){bt("WebGLState:",v)}}function je(){try{i.compressedTexSubImage3D(...arguments)}catch(v){bt("WebGLState:",v)}}function ye(){try{i.texStorage2D(...arguments)}catch(v){bt("WebGLState:",v)}}function Le(){try{i.texStorage3D(...arguments)}catch(v){bt("WebGLState:",v)}}function at(){try{i.texImage2D(...arguments)}catch(v){bt("WebGLState:",v)}}function ce(){try{i.texImage3D(...arguments)}catch(v){bt("WebGLState:",v)}}function Se(v){Re.equals(v)===!1&&(i.scissor(v.x,v.y,v.z,v.w),Re.copy(v))}function Ae(v){Q.equals(v)===!1&&(i.viewport(v.x,v.y,v.z,v.w),Q.copy(v))}function Xe(v,q){let k=h.get(q);k===void 0&&(k=new WeakMap,h.set(q,k));let oe=k.get(v);oe===void 0&&(oe=i.getUniformBlockIndex(q,v.name),k.set(v,oe))}function _e(v,q){let oe=h.get(q).get(v);c.get(q)!==oe&&(i.uniformBlockBinding(q,oe,v.__bindingPointIndex),c.set(q,oe))}function mt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},fe=null,ge={},f={},d=new WeakMap,p=[],m=null,x=!1,g=null,l=null,w=null,T=null,y=null,E=null,R=null,P=new _t(0,0,0),B=0,M=!1,_=null,F=null,z=null,L=null,D=null,Re.set(0,0,i.canvas.width,i.canvas.height),Q.set(0,0,i.canvas.width,i.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:ee,disable:be,bindFramebuffer:Ne,drawBuffers:Ee,useProgram:rt,setBlending:Et,setMaterial:st,setFlipSided:ht,setCullFace:Bt,setLineWidth:I,setPolygonOffset:Ft,setScissorTest:wt,activeTexture:vt,bindTexture:Oe,unbindTexture:C,compressedTexImage2D:b,compressedTexImage3D:U,texImage2D:at,texImage3D:ce,updateUBOMapping:Xe,uniformBlockBinding:_e,texStorage2D:ye,texStorage3D:Le,texSubImage2D:le,texSubImage3D:ue,compressedTexSubImage2D:se,compressedTexSubImage3D:je,scissor:Se,viewport:Ae,reset:mt}}function i1(i,e,t,n,r,s,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new zt,u=new WeakMap,f,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(C,b){return p?new OffscreenCanvas(C,b):zs("canvas")}function x(C,b,U){let le=1,ue=Oe(C);if((ue.width>U||ue.height>U)&&(le=U/Math.max(ue.width,ue.height)),le<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let se=Math.floor(le*ue.width),je=Math.floor(le*ue.height);f===void 0&&(f=m(se,je));let ye=b?m(se,je):f;return ye.width=se,ye.height=je,ye.getContext("2d").drawImage(C,0,0,se,je),ct("WebGLRenderer: Texture has been resized from ("+ue.width+"x"+ue.height+") to ("+se+"x"+je+")."),ye}else return"data"in C&&ct("WebGLRenderer: Image in DataTexture is too big ("+ue.width+"x"+ue.height+")."),C;return C}function g(C){return C.generateMipmaps}function l(C){i.generateMipmap(C)}function w(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(C,b,U,le,ue=!1){if(C!==null){if(i[C]!==void 0)return i[C];ct("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let se=b;if(b===i.RED&&(U===i.FLOAT&&(se=i.R32F),U===i.HALF_FLOAT&&(se=i.R16F),U===i.UNSIGNED_BYTE&&(se=i.R8)),b===i.RED_INTEGER&&(U===i.UNSIGNED_BYTE&&(se=i.R8UI),U===i.UNSIGNED_SHORT&&(se=i.R16UI),U===i.UNSIGNED_INT&&(se=i.R32UI),U===i.BYTE&&(se=i.R8I),U===i.SHORT&&(se=i.R16I),U===i.INT&&(se=i.R32I)),b===i.RG&&(U===i.FLOAT&&(se=i.RG32F),U===i.HALF_FLOAT&&(se=i.RG16F),U===i.UNSIGNED_BYTE&&(se=i.RG8)),b===i.RG_INTEGER&&(U===i.UNSIGNED_BYTE&&(se=i.RG8UI),U===i.UNSIGNED_SHORT&&(se=i.RG16UI),U===i.UNSIGNED_INT&&(se=i.RG32UI),U===i.BYTE&&(se=i.RG8I),U===i.SHORT&&(se=i.RG16I),U===i.INT&&(se=i.RG32I)),b===i.RGB_INTEGER&&(U===i.UNSIGNED_BYTE&&(se=i.RGB8UI),U===i.UNSIGNED_SHORT&&(se=i.RGB16UI),U===i.UNSIGNED_INT&&(se=i.RGB32UI),U===i.BYTE&&(se=i.RGB8I),U===i.SHORT&&(se=i.RGB16I),U===i.INT&&(se=i.RGB32I)),b===i.RGBA_INTEGER&&(U===i.UNSIGNED_BYTE&&(se=i.RGBA8UI),U===i.UNSIGNED_SHORT&&(se=i.RGBA16UI),U===i.UNSIGNED_INT&&(se=i.RGBA32UI),U===i.BYTE&&(se=i.RGBA8I),U===i.SHORT&&(se=i.RGBA16I),U===i.INT&&(se=i.RGBA32I)),b===i.RGB&&(U===i.UNSIGNED_INT_5_9_9_9_REV&&(se=i.RGB9_E5),U===i.UNSIGNED_INT_10F_11F_11F_REV&&(se=i.R11F_G11F_B10F)),b===i.RGBA){let je=ue?Da:Ut.getTransfer(le);U===i.FLOAT&&(se=i.RGBA32F),U===i.HALF_FLOAT&&(se=i.RGBA16F),U===i.UNSIGNED_BYTE&&(se=je===jt?i.SRGB8_ALPHA8:i.RGBA8),U===i.UNSIGNED_SHORT_4_4_4_4&&(se=i.RGBA4),U===i.UNSIGNED_SHORT_5_5_5_1&&(se=i.RGB5_A1)}return(se===i.R16F||se===i.R32F||se===i.RG16F||se===i.RG32F||se===i.RGBA16F||se===i.RGBA32F)&&e.get("EXT_color_buffer_float"),se}function y(C,b){let U;return C?b===null||b===Ci||b===ia?U=i.DEPTH24_STENCIL8:b===oi?U=i.DEPTH32F_STENCIL8:b===na&&(U=i.DEPTH24_STENCIL8,ct("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Ci||b===ia?U=i.DEPTH_COMPONENT24:b===oi?U=i.DEPTH_COMPONENT32F:b===na&&(U=i.DEPTH_COMPONENT16),U}function E(C,b){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==fn&&C.minFilter!==dn?Math.log2(Math.max(b.width,b.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?b.mipmaps.length:1}function R(C){let b=C.target;b.removeEventListener("dispose",R),B(b),b.isVideoTexture&&u.delete(b)}function P(C){let b=C.target;b.removeEventListener("dispose",P),_(b)}function B(C){let b=n.get(C);if(b.__webglInit===void 0)return;let U=C.source,le=d.get(U);if(le){let ue=le[b.__cacheKey];ue.usedTimes--,ue.usedTimes===0&&M(C),Object.keys(le).length===0&&d.delete(U)}n.remove(C)}function M(C){let b=n.get(C);i.deleteTexture(b.__webglTexture);let U=C.source,le=d.get(U);delete le[b.__cacheKey],a.memory.textures--}function _(C){let b=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let le=0;le<6;le++){if(Array.isArray(b.__webglFramebuffer[le]))for(let ue=0;ue<b.__webglFramebuffer[le].length;ue++)i.deleteFramebuffer(b.__webglFramebuffer[le][ue]);else i.deleteFramebuffer(b.__webglFramebuffer[le]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[le])}else{if(Array.isArray(b.__webglFramebuffer))for(let le=0;le<b.__webglFramebuffer.length;le++)i.deleteFramebuffer(b.__webglFramebuffer[le]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let le=0;le<b.__webglColorRenderbuffer.length;le++)b.__webglColorRenderbuffer[le]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[le]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let U=C.textures;for(let le=0,ue=U.length;le<ue;le++){let se=n.get(U[le]);se.__webglTexture&&(i.deleteTexture(se.__webglTexture),a.memory.textures--),n.remove(U[le])}n.remove(C)}let F=0;function z(){F=0}function L(){let C=F;return C>=r.maxTextures&&ct("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),F+=1,C}function D(C){let b=[];return b.push(C.wrapS),b.push(C.wrapT),b.push(C.wrapR||0),b.push(C.magFilter),b.push(C.minFilter),b.push(C.anisotropy),b.push(C.internalFormat),b.push(C.format),b.push(C.type),b.push(C.generateMipmaps),b.push(C.premultiplyAlpha),b.push(C.flipY),b.push(C.unpackAlignment),b.push(C.colorSpace),b.join()}function H(C,b){let U=n.get(C);if(C.isVideoTexture&&wt(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&U.__version!==C.version){let le=C.image;if(le===null)ct("WebGLRenderer: Texture marked for update but no image data found.");else if(le.complete===!1)ct("WebGLRenderer: Texture marked for update but image is incomplete");else{j(U,C,b);return}}else C.isExternalTexture&&(U.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,U.__webglTexture,i.TEXTURE0+b)}function Y(C,b){let U=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&U.__version!==C.version){j(U,C,b);return}else C.isExternalTexture&&(U.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,U.__webglTexture,i.TEXTURE0+b)}function G(C,b){let U=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&U.__version!==C.version){j(U,C,b);return}t.bindTexture(i.TEXTURE_3D,U.__webglTexture,i.TEXTURE0+b)}function re(C,b){let U=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&U.__version!==C.version){ee(U,C,b);return}t.bindTexture(i.TEXTURE_CUBE_MAP,U.__webglTexture,i.TEXTURE0+b)}let fe={[Ir]:i.REPEAT,[di]:i.CLAMP_TO_EDGE,[Bs]:i.MIRRORED_REPEAT},ge={[fn]:i.NEAREST,[Xl]:i.NEAREST_MIPMAP_NEAREST,[hs]:i.NEAREST_MIPMAP_LINEAR,[dn]:i.LINEAR,[ta]:i.LINEAR_MIPMAP_NEAREST,[Ri]:i.LINEAR_MIPMAP_LINEAR},Te={[dm]:i.NEVER,[vm]:i.ALWAYS,[pm]:i.LESS,[Ic]:i.LEQUAL,[mm]:i.EQUAL,[Fc]:i.GEQUAL,[gm]:i.GREATER,[xm]:i.NOTEQUAL};function qe(C,b){if(b.type===oi&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===dn||b.magFilter===ta||b.magFilter===hs||b.magFilter===Ri||b.minFilter===dn||b.minFilter===ta||b.minFilter===hs||b.minFilter===Ri)&&ct("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,fe[b.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,fe[b.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,fe[b.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,ge[b.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,ge[b.minFilter]),b.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,Te[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===fn||b.minFilter!==hs&&b.minFilter!==Ri||b.type===oi&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){let U=e.get("EXT_texture_filter_anisotropic");i.texParameterf(C,U.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,r.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function Re(C,b){let U=!1;C.__webglInit===void 0&&(C.__webglInit=!0,b.addEventListener("dispose",R));let le=b.source,ue=d.get(le);ue===void 0&&(ue={},d.set(le,ue));let se=D(b);if(se!==C.__cacheKey){ue[se]===void 0&&(ue[se]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,U=!0),ue[se].usedTimes++;let je=ue[C.__cacheKey];je!==void 0&&(ue[C.__cacheKey].usedTimes--,je.usedTimes===0&&M(b)),C.__cacheKey=se,C.__webglTexture=ue[se].texture}return U}function Q(C,b,U){return Math.floor(Math.floor(C/U)/b)}function we(C,b,U,le){let se=C.updateRanges;if(se.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,b.width,b.height,U,le,b.data);else{se.sort((ce,Se)=>ce.start-Se.start);let je=0;for(let ce=1;ce<se.length;ce++){let Se=se[je],Ae=se[ce],Xe=Se.start+Se.count,_e=Q(Ae.start,b.width,4),mt=Q(Se.start,b.width,4);Ae.start<=Xe+1&&_e===mt&&Q(Ae.start+Ae.count-1,b.width,4)===_e?Se.count=Math.max(Se.count,Ae.start+Ae.count-Se.start):(++je,se[je]=Ae)}se.length=je+1;let ye=i.getParameter(i.UNPACK_ROW_LENGTH),Le=i.getParameter(i.UNPACK_SKIP_PIXELS),at=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,b.width);for(let ce=0,Se=se.length;ce<Se;ce++){let Ae=se[ce],Xe=Math.floor(Ae.start/4),_e=Math.ceil(Ae.count/4),mt=Xe%b.width,v=Math.floor(Xe/b.width),q=_e,k=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,mt),i.pixelStorei(i.UNPACK_SKIP_ROWS,v),t.texSubImage2D(i.TEXTURE_2D,0,mt,v,q,k,U,le,b.data)}C.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,ye),i.pixelStorei(i.UNPACK_SKIP_PIXELS,Le),i.pixelStorei(i.UNPACK_SKIP_ROWS,at)}}function j(C,b,U){let le=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(le=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(le=i.TEXTURE_3D);let ue=Re(C,b),se=b.source;t.bindTexture(le,C.__webglTexture,i.TEXTURE0+U);let je=n.get(se);if(se.version!==je.__version||ue===!0){t.activeTexture(i.TEXTURE0+U);let ye=Ut.getPrimaries(Ut.workingColorSpace),Le=b.colorSpace===dr?null:Ut.getPrimaries(b.colorSpace),at=b.colorSpace===dr||ye===Le?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,at);let ce=x(b.image,!1,r.maxTextureSize);ce=vt(b,ce);let Se=s.convert(b.format,b.colorSpace),Ae=s.convert(b.type),Xe=T(b.internalFormat,Se,Ae,b.colorSpace,b.isVideoTexture);qe(le,b);let _e,mt=b.mipmaps,v=b.isVideoTexture!==!0,q=je.__version===void 0||ue===!0,k=se.dataReady,oe=E(b,ce);if(b.isDepthTexture)Xe=y(b.format===kr,b.type),q&&(v?t.texStorage2D(i.TEXTURE_2D,1,Xe,ce.width,ce.height):t.texImage2D(i.TEXTURE_2D,0,Xe,ce.width,ce.height,0,Se,Ae,null));else if(b.isDataTexture)if(mt.length>0){v&&q&&t.texStorage2D(i.TEXTURE_2D,oe,Xe,mt[0].width,mt[0].height);for(let ie=0,J=mt.length;ie<J;ie++)_e=mt[ie],v?k&&t.texSubImage2D(i.TEXTURE_2D,ie,0,0,_e.width,_e.height,Se,Ae,_e.data):t.texImage2D(i.TEXTURE_2D,ie,Xe,_e.width,_e.height,0,Se,Ae,_e.data);b.generateMipmaps=!1}else v?(q&&t.texStorage2D(i.TEXTURE_2D,oe,Xe,ce.width,ce.height),k&&we(b,ce,Se,Ae)):t.texImage2D(i.TEXTURE_2D,0,Xe,ce.width,ce.height,0,Se,Ae,ce.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){v&&q&&t.texStorage3D(i.TEXTURE_2D_ARRAY,oe,Xe,mt[0].width,mt[0].height,ce.depth);for(let ie=0,J=mt.length;ie<J;ie++)if(_e=mt[ie],b.format!==li)if(Se!==null)if(v){if(k)if(b.layerUpdates.size>0){let de=$u(_e.width,_e.height,b.format,b.type);for(let De of b.layerUpdates){let ve=_e.data.subarray(De*de/_e.data.BYTES_PER_ELEMENT,(De+1)*de/_e.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ie,0,0,De,_e.width,_e.height,1,Se,ve)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ie,0,0,0,_e.width,_e.height,ce.depth,Se,_e.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ie,Xe,_e.width,_e.height,ce.depth,0,_e.data,0,0);else ct("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else v?k&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ie,0,0,0,_e.width,_e.height,ce.depth,Se,Ae,_e.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ie,Xe,_e.width,_e.height,ce.depth,0,Se,Ae,_e.data)}else{v&&q&&t.texStorage2D(i.TEXTURE_2D,oe,Xe,mt[0].width,mt[0].height);for(let ie=0,J=mt.length;ie<J;ie++)_e=mt[ie],b.format!==li?Se!==null?v?k&&t.compressedTexSubImage2D(i.TEXTURE_2D,ie,0,0,_e.width,_e.height,Se,_e.data):t.compressedTexImage2D(i.TEXTURE_2D,ie,Xe,_e.width,_e.height,0,_e.data):ct("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):v?k&&t.texSubImage2D(i.TEXTURE_2D,ie,0,0,_e.width,_e.height,Se,Ae,_e.data):t.texImage2D(i.TEXTURE_2D,ie,Xe,_e.width,_e.height,0,Se,Ae,_e.data)}else if(b.isDataArrayTexture)if(v){if(q&&t.texStorage3D(i.TEXTURE_2D_ARRAY,oe,Xe,ce.width,ce.height,ce.depth),k)if(b.layerUpdates.size>0){let ie=$u(ce.width,ce.height,b.format,b.type);for(let J of b.layerUpdates){let de=ce.data.subarray(J*ie/ce.data.BYTES_PER_ELEMENT,(J+1)*ie/ce.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,J,ce.width,ce.height,1,Se,Ae,de)}b.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ce.width,ce.height,ce.depth,Se,Ae,ce.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Xe,ce.width,ce.height,ce.depth,0,Se,Ae,ce.data);else if(b.isData3DTexture)v?(q&&t.texStorage3D(i.TEXTURE_3D,oe,Xe,ce.width,ce.height,ce.depth),k&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ce.width,ce.height,ce.depth,Se,Ae,ce.data)):t.texImage3D(i.TEXTURE_3D,0,Xe,ce.width,ce.height,ce.depth,0,Se,Ae,ce.data);else if(b.isFramebufferTexture){if(q)if(v)t.texStorage2D(i.TEXTURE_2D,oe,Xe,ce.width,ce.height);else{let ie=ce.width,J=ce.height;for(let de=0;de<oe;de++)t.texImage2D(i.TEXTURE_2D,de,Xe,ie,J,0,Se,Ae,null),ie>>=1,J>>=1}}else if(mt.length>0){if(v&&q){let ie=Oe(mt[0]);t.texStorage2D(i.TEXTURE_2D,oe,Xe,ie.width,ie.height)}for(let ie=0,J=mt.length;ie<J;ie++)_e=mt[ie],v?k&&t.texSubImage2D(i.TEXTURE_2D,ie,0,0,Se,Ae,_e):t.texImage2D(i.TEXTURE_2D,ie,Xe,Se,Ae,_e);b.generateMipmaps=!1}else if(v){if(q){let ie=Oe(ce);t.texStorage2D(i.TEXTURE_2D,oe,Xe,ie.width,ie.height)}k&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Se,Ae,ce)}else t.texImage2D(i.TEXTURE_2D,0,Xe,Se,Ae,ce);g(b)&&l(le),je.__version=se.version,b.onUpdate&&b.onUpdate(b)}C.__version=b.version}function ee(C,b,U){if(b.image.length!==6)return;let le=Re(C,b),ue=b.source;t.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+U);let se=n.get(ue);if(ue.version!==se.__version||le===!0){t.activeTexture(i.TEXTURE0+U);let je=Ut.getPrimaries(Ut.workingColorSpace),ye=b.colorSpace===dr?null:Ut.getPrimaries(b.colorSpace),Le=b.colorSpace===dr||je===ye?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le);let at=b.isCompressedTexture||b.image[0].isCompressedTexture,ce=b.image[0]&&b.image[0].isDataTexture,Se=[];for(let J=0;J<6;J++)!at&&!ce?Se[J]=x(b.image[J],!0,r.maxCubemapSize):Se[J]=ce?b.image[J].image:b.image[J],Se[J]=vt(b,Se[J]);let Ae=Se[0],Xe=s.convert(b.format,b.colorSpace),_e=s.convert(b.type),mt=T(b.internalFormat,Xe,_e,b.colorSpace),v=b.isVideoTexture!==!0,q=se.__version===void 0||le===!0,k=ue.dataReady,oe=E(b,Ae);qe(i.TEXTURE_CUBE_MAP,b);let ie;if(at){v&&q&&t.texStorage2D(i.TEXTURE_CUBE_MAP,oe,mt,Ae.width,Ae.height);for(let J=0;J<6;J++){ie=Se[J].mipmaps;for(let de=0;de<ie.length;de++){let De=ie[de];b.format!==li?Xe!==null?v?k&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de,0,0,De.width,De.height,Xe,De.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de,mt,De.width,De.height,0,De.data):ct("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):v?k&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de,0,0,De.width,De.height,Xe,_e,De.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de,mt,De.width,De.height,0,Xe,_e,De.data)}}}else{if(ie=b.mipmaps,v&&q){ie.length>0&&oe++;let J=Oe(Se[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,oe,mt,J.width,J.height)}for(let J=0;J<6;J++)if(ce){v?k&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Se[J].width,Se[J].height,Xe,_e,Se[J].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,mt,Se[J].width,Se[J].height,0,Xe,_e,Se[J].data);for(let de=0;de<ie.length;de++){let ve=ie[de].image[J].image;v?k&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de+1,0,0,ve.width,ve.height,Xe,_e,ve.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de+1,mt,ve.width,ve.height,0,Xe,_e,ve.data)}}else{v?k&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Xe,_e,Se[J]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,mt,Xe,_e,Se[J]);for(let de=0;de<ie.length;de++){let De=ie[de];v?k&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de+1,0,0,Xe,_e,De.image[J]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de+1,mt,Xe,_e,De.image[J])}}}g(b)&&l(i.TEXTURE_CUBE_MAP),se.__version=ue.version,b.onUpdate&&b.onUpdate(b)}C.__version=b.version}function be(C,b,U,le,ue,se){let je=s.convert(U.format,U.colorSpace),ye=s.convert(U.type),Le=T(U.internalFormat,je,ye,U.colorSpace),at=n.get(b),ce=n.get(U);if(ce.__renderTarget=b,!at.__hasExternalTextures){let Se=Math.max(1,b.width>>se),Ae=Math.max(1,b.height>>se);ue===i.TEXTURE_3D||ue===i.TEXTURE_2D_ARRAY?t.texImage3D(ue,se,Le,Se,Ae,b.depth,0,je,ye,null):t.texImage2D(ue,se,Le,Se,Ae,0,je,ye,null)}t.bindFramebuffer(i.FRAMEBUFFER,C),Ft(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,le,ue,ce.__webglTexture,0,I(b)):(ue===i.TEXTURE_2D||ue>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ue<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,le,ue,ce.__webglTexture,se),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ne(C,b,U){if(i.bindRenderbuffer(i.RENDERBUFFER,C),b.depthBuffer){let le=b.depthTexture,ue=le&&le.isDepthTexture?le.type:null,se=y(b.stencilBuffer,ue),je=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Ft(b)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,I(b),se,b.width,b.height):U?i.renderbufferStorageMultisample(i.RENDERBUFFER,I(b),se,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,se,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,je,i.RENDERBUFFER,C)}else{let le=b.textures;for(let ue=0;ue<le.length;ue++){let se=le[ue],je=s.convert(se.format,se.colorSpace),ye=s.convert(se.type),Le=T(se.internalFormat,je,ye,se.colorSpace);Ft(b)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,I(b),Le,b.width,b.height):U?i.renderbufferStorageMultisample(i.RENDERBUFFER,I(b),Le,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,Le,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ee(C,b,U){let le=b.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,C),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let ue=n.get(b.depthTexture);if(ue.__renderTarget=b,(!ue.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),le){if(ue.__webglInit===void 0&&(ue.__webglInit=!0,b.depthTexture.addEventListener("dispose",R)),ue.__webglTexture===void 0){ue.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,ue.__webglTexture),qe(i.TEXTURE_CUBE_MAP,b.depthTexture);let at=s.convert(b.depthTexture.format),ce=s.convert(b.depthTexture.type),Se;b.depthTexture.format===Oi?Se=i.DEPTH_COMPONENT24:b.depthTexture.format===kr&&(Se=i.DEPTH24_STENCIL8);for(let Ae=0;Ae<6;Ae++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,0,Se,b.width,b.height,0,at,ce,null)}}else H(b.depthTexture,0);let se=ue.__webglTexture,je=I(b),ye=le?i.TEXTURE_CUBE_MAP_POSITIVE_X+U:i.TEXTURE_2D,Le=b.depthTexture.format===kr?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(b.depthTexture.format===Oi)Ft(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Le,ye,se,0,je):i.framebufferTexture2D(i.FRAMEBUFFER,Le,ye,se,0);else if(b.depthTexture.format===kr)Ft(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Le,ye,se,0,je):i.framebufferTexture2D(i.FRAMEBUFFER,Le,ye,se,0);else throw new Error("Unknown depthTexture format")}function rt(C){let b=n.get(C),U=C.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==C.depthTexture){let le=C.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),le){let ue=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,le.removeEventListener("dispose",ue)};le.addEventListener("dispose",ue),b.__depthDisposeCallback=ue}b.__boundDepthTexture=le}if(C.depthTexture&&!b.__autoAllocateDepthBuffer)if(U)for(let le=0;le<6;le++)Ee(b.__webglFramebuffer[le],C,le);else{let le=C.texture.mipmaps;le&&le.length>0?Ee(b.__webglFramebuffer[0],C,0):Ee(b.__webglFramebuffer,C,0)}else if(U){b.__webglDepthbuffer=[];for(let le=0;le<6;le++)if(t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[le]),b.__webglDepthbuffer[le]===void 0)b.__webglDepthbuffer[le]=i.createRenderbuffer(),Ne(b.__webglDepthbuffer[le],C,!1);else{let ue=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,se=b.__webglDepthbuffer[le];i.bindRenderbuffer(i.RENDERBUFFER,se),i.framebufferRenderbuffer(i.FRAMEBUFFER,ue,i.RENDERBUFFER,se)}}else{let le=C.texture.mipmaps;if(le&&le.length>0?t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),Ne(b.__webglDepthbuffer,C,!1);else{let ue=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,se=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,se),i.framebufferRenderbuffer(i.FRAMEBUFFER,ue,i.RENDERBUFFER,se)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Pe(C,b,U){let le=n.get(C);b!==void 0&&be(le.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),U!==void 0&&rt(C)}function Mt(C){let b=C.texture,U=n.get(C),le=n.get(b);C.addEventListener("dispose",P);let ue=C.textures,se=C.isWebGLCubeRenderTarget===!0,je=ue.length>1;if(je||(le.__webglTexture===void 0&&(le.__webglTexture=i.createTexture()),le.__version=b.version,a.memory.textures++),se){U.__webglFramebuffer=[];for(let ye=0;ye<6;ye++)if(b.mipmaps&&b.mipmaps.length>0){U.__webglFramebuffer[ye]=[];for(let Le=0;Le<b.mipmaps.length;Le++)U.__webglFramebuffer[ye][Le]=i.createFramebuffer()}else U.__webglFramebuffer[ye]=i.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){U.__webglFramebuffer=[];for(let ye=0;ye<b.mipmaps.length;ye++)U.__webglFramebuffer[ye]=i.createFramebuffer()}else U.__webglFramebuffer=i.createFramebuffer();if(je)for(let ye=0,Le=ue.length;ye<Le;ye++){let at=n.get(ue[ye]);at.__webglTexture===void 0&&(at.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&Ft(C)===!1){U.__webglMultisampledFramebuffer=i.createFramebuffer(),U.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,U.__webglMultisampledFramebuffer);for(let ye=0;ye<ue.length;ye++){let Le=ue[ye];U.__webglColorRenderbuffer[ye]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,U.__webglColorRenderbuffer[ye]);let at=s.convert(Le.format,Le.colorSpace),ce=s.convert(Le.type),Se=T(Le.internalFormat,at,ce,Le.colorSpace,C.isXRRenderTarget===!0),Ae=I(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ae,Se,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,U.__webglColorRenderbuffer[ye])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(U.__webglDepthRenderbuffer=i.createRenderbuffer(),Ne(U.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(se){t.bindTexture(i.TEXTURE_CUBE_MAP,le.__webglTexture),qe(i.TEXTURE_CUBE_MAP,b);for(let ye=0;ye<6;ye++)if(b.mipmaps&&b.mipmaps.length>0)for(let Le=0;Le<b.mipmaps.length;Le++)be(U.__webglFramebuffer[ye][Le],C,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Le);else be(U.__webglFramebuffer[ye],C,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0);g(b)&&l(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(je){for(let ye=0,Le=ue.length;ye<Le;ye++){let at=ue[ye],ce=n.get(at),Se=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Se=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Se,ce.__webglTexture),qe(Se,at),be(U.__webglFramebuffer,C,at,i.COLOR_ATTACHMENT0+ye,Se,0),g(at)&&l(Se)}t.unbindTexture()}else{let ye=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ye=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ye,le.__webglTexture),qe(ye,b),b.mipmaps&&b.mipmaps.length>0)for(let Le=0;Le<b.mipmaps.length;Le++)be(U.__webglFramebuffer[Le],C,b,i.COLOR_ATTACHMENT0,ye,Le);else be(U.__webglFramebuffer,C,b,i.COLOR_ATTACHMENT0,ye,0);g(b)&&l(ye),t.unbindTexture()}C.depthBuffer&&rt(C)}function Et(C){let b=C.textures;for(let U=0,le=b.length;U<le;U++){let ue=b[U];if(g(ue)){let se=w(C),je=n.get(ue).__webglTexture;t.bindTexture(se,je),l(se),t.unbindTexture()}}}let st=[],ht=[];function Bt(C){if(C.samples>0){if(Ft(C)===!1){let b=C.textures,U=C.width,le=C.height,ue=i.COLOR_BUFFER_BIT,se=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,je=n.get(C),ye=b.length>1;if(ye)for(let at=0;at<b.length;at++)t.bindFramebuffer(i.FRAMEBUFFER,je.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,je.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,je.__webglMultisampledFramebuffer);let Le=C.texture.mipmaps;Le&&Le.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,je.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,je.__webglFramebuffer);for(let at=0;at<b.length;at++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ue|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ue|=i.STENCIL_BUFFER_BIT)),ye){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,je.__webglColorRenderbuffer[at]);let ce=n.get(b[at]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ce,0)}i.blitFramebuffer(0,0,U,le,0,0,U,le,ue,i.NEAREST),c===!0&&(st.length=0,ht.length=0,st.push(i.COLOR_ATTACHMENT0+at),C.depthBuffer&&C.resolveDepthBuffer===!1&&(st.push(se),ht.push(se),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ht)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,st))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ye)for(let at=0;at<b.length;at++){t.bindFramebuffer(i.FRAMEBUFFER,je.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.RENDERBUFFER,je.__webglColorRenderbuffer[at]);let ce=n.get(b[at]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,je.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.TEXTURE_2D,ce,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,je.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&c){let b=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function I(C){return Math.min(r.maxSamples,C.samples)}function Ft(C){let b=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function wt(C){let b=a.render.frame;u.get(C)!==b&&(u.set(C,b),C.update())}function vt(C,b){let U=C.colorSpace,le=C.format,ue=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||U!==Pn&&U!==dr&&(Ut.getTransfer(U)===jt?(le!==li||ue!==Zn)&&ct("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):bt("WebGLTextures: Unsupported texture color space:",U)),b}function Oe(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(h.width=C.naturalWidth||C.width,h.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(h.width=C.displayWidth,h.height=C.displayHeight):(h.width=C.width,h.height=C.height),h}this.allocateTextureUnit=L,this.resetTextureUnits=z,this.setTexture2D=H,this.setTexture2DArray=Y,this.setTexture3D=G,this.setTextureCube=re,this.rebindTextures=Pe,this.setupRenderTarget=Mt,this.updateRenderTargetMipmap=Et,this.updateMultisampleRenderTarget=Bt,this.setupDepthRenderbuffer=rt,this.setupFrameBufferTexture=be,this.useMultisampledRTT=Ft,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function r1(i,e){function t(n,r=dr){let s,a=Ut.getTransfer(r);if(n===Zn)return i.UNSIGNED_BYTE;if(n===jl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Yl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Ou)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Bu)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Uu)return i.BYTE;if(n===Nu)return i.SHORT;if(n===na)return i.UNSIGNED_SHORT;if(n===ql)return i.INT;if(n===Ci)return i.UNSIGNED_INT;if(n===oi)return i.FLOAT;if(n===Xi)return i.HALF_FLOAT;if(n===zu)return i.ALPHA;if(n===Gu)return i.RGB;if(n===li)return i.RGBA;if(n===Oi)return i.DEPTH_COMPONENT;if(n===kr)return i.DEPTH_STENCIL;if(n===Kl)return i.RED;if(n===$l)return i.RED_INTEGER;if(n===us)return i.RG;if(n===Jl)return i.RG_INTEGER;if(n===Zl)return i.RGBA_INTEGER;if(n===ho||n===uo||n===fo||n===po)if(a===jt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===ho)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===uo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===fo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===po)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===ho)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===uo)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===fo)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===po)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ql||n===ec||n===tc||n===nc)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Ql)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ec)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===tc)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===nc)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ic||n===rc||n===sc||n===ac||n===oc||n===lc||n===cc)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===ic||n===rc)return a===jt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===sc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(n===ac)return s.COMPRESSED_R11_EAC;if(n===oc)return s.COMPRESSED_SIGNED_R11_EAC;if(n===lc)return s.COMPRESSED_RG11_EAC;if(n===cc)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===hc||n===uc||n===fc||n===dc||n===pc||n===mc||n===gc||n===xc||n===vc||n===bc||n===yc||n===_c||n===Mc||n===wc)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===hc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===uc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===fc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===dc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===pc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===mc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===gc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===xc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===vc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===bc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===yc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===_c)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Mc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===wc)return a===jt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Sc||n===Tc||n===Ec)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Sc)return a===jt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Tc)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ec)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ac||n===Rc||n===Cc||n===Pc)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Ac)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Rc)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Cc)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Pc)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ia?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var s1=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,a1=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,uf=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ja(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new ai({vertexShader:s1,fragmentShader:a1,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Fn(new Za(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ff=class extends or{constructor(e,t){super();let n=this,r=null,s=1,a=null,o="local-floor",c=1,h=null,u=null,f=null,d=null,p=null,m=null,x=typeof XRWebGLBinding<"u",g=new uf,l={},w=t.getContextAttributes(),T=null,y=null,E=[],R=[],P=new zt,B=null,M=new An;M.viewport=new Qt;let _=new An;_.viewport=new Qt;let F=[M,_],z=new kl,L=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let ee=E[j];return ee===void 0&&(ee=new Xs,E[j]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(j){let ee=E[j];return ee===void 0&&(ee=new Xs,E[j]=ee),ee.getGripSpace()},this.getHand=function(j){let ee=E[j];return ee===void 0&&(ee=new Xs,E[j]=ee),ee.getHandSpace()};function H(j){let ee=R.indexOf(j.inputSource);if(ee===-1)return;let be=E[ee];be!==void 0&&(be.update(j.inputSource,j.frame,h||a),be.dispatchEvent({type:j.type,data:j.inputSource}))}function Y(){r.removeEventListener("select",H),r.removeEventListener("selectstart",H),r.removeEventListener("selectend",H),r.removeEventListener("squeeze",H),r.removeEventListener("squeezestart",H),r.removeEventListener("squeezeend",H),r.removeEventListener("end",Y),r.removeEventListener("inputsourceschange",G);for(let j=0;j<E.length;j++){let ee=R[j];ee!==null&&(R[j]=null,E[j].disconnect(ee))}L=null,D=null,g.reset();for(let j in l)delete l[j];e.setRenderTarget(T),p=null,d=null,f=null,r=null,y=null,we.stop(),n.isPresenting=!1,e.setPixelRatio(B),e.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){s=j,n.isPresenting===!0&&ct("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&ct("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||a},this.setReferenceSpace=function(j){h=j},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return f===null&&x&&(f=new XRWebGLBinding(r,t)),f},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(j){if(r=j,r!==null){if(T=e.getRenderTarget(),r.addEventListener("select",H),r.addEventListener("selectstart",H),r.addEventListener("selectend",H),r.addEventListener("squeeze",H),r.addEventListener("squeezestart",H),r.addEventListener("squeezeend",H),r.addEventListener("end",Y),r.addEventListener("inputsourceschange",G),w.xrCompatible!==!0&&await t.makeXRCompatible(),B=e.getPixelRatio(),e.getSize(P),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let be=null,Ne=null,Ee=null;w.depth&&(Ee=w.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,be=w.stencil?kr:Oi,Ne=w.stencil?ia:Ci);let rt={colorFormat:t.RGBA8,depthFormat:Ee,scaleFactor:s};f=this.getBinding(),d=f.createProjectionLayer(rt),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new si(d.textureWidth,d.textureHeight,{format:li,type:Zn,depthTexture:new Lr(d.textureWidth,d.textureHeight,Ne,void 0,void 0,void 0,void 0,void 0,void 0,be),stencilBuffer:w.stencil,colorSpace:e.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let be={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,t,be),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),y=new si(p.framebufferWidth,p.framebufferHeight,{format:li,type:Zn,colorSpace:e.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),h=null,a=await r.requestReferenceSpace(o),we.setContext(r),we.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function G(j){for(let ee=0;ee<j.removed.length;ee++){let be=j.removed[ee],Ne=R.indexOf(be);Ne>=0&&(R[Ne]=null,E[Ne].disconnect(be))}for(let ee=0;ee<j.added.length;ee++){let be=j.added[ee],Ne=R.indexOf(be);if(Ne===-1){for(let rt=0;rt<E.length;rt++)if(rt>=R.length){R.push(be),Ne=rt;break}else if(R[rt]===null){R[rt]=be,Ne=rt;break}if(Ne===-1)break}let Ee=E[Ne];Ee&&Ee.connect(be)}}let re=new W,fe=new W;function ge(j,ee,be){re.setFromMatrixPosition(ee.matrixWorld),fe.setFromMatrixPosition(be.matrixWorld);let Ne=re.distanceTo(fe),Ee=ee.projectionMatrix.elements,rt=be.projectionMatrix.elements,Pe=Ee[14]/(Ee[10]-1),Mt=Ee[14]/(Ee[10]+1),Et=(Ee[9]+1)/Ee[5],st=(Ee[9]-1)/Ee[5],ht=(Ee[8]-1)/Ee[0],Bt=(rt[8]+1)/rt[0],I=Pe*ht,Ft=Pe*Bt,wt=Ne/(-ht+Bt),vt=wt*-ht;if(ee.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(vt),j.translateZ(wt),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),Ee[10]===-1)j.projectionMatrix.copy(ee.projectionMatrix),j.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{let Oe=Pe+wt,C=Mt+wt,b=I-vt,U=Ft+(Ne-vt),le=Et*Mt/C*Oe,ue=st*Mt/C*Oe;j.projectionMatrix.makePerspective(b,U,le,ue,Oe,C),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function Te(j,ee){ee===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(ee.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(r===null)return;let ee=j.near,be=j.far;g.texture!==null&&(g.depthNear>0&&(ee=g.depthNear),g.depthFar>0&&(be=g.depthFar)),z.near=_.near=M.near=ee,z.far=_.far=M.far=be,(L!==z.near||D!==z.far)&&(r.updateRenderState({depthNear:z.near,depthFar:z.far}),L=z.near,D=z.far),z.layers.mask=j.layers.mask|6,M.layers.mask=z.layers.mask&3,_.layers.mask=z.layers.mask&5;let Ne=j.parent,Ee=z.cameras;Te(z,Ne);for(let rt=0;rt<Ee.length;rt++)Te(Ee[rt],Ne);Ee.length===2?ge(z,M,_):z.projectionMatrix.copy(M.projectionMatrix),qe(j,z,Ne)};function qe(j,ee,be){be===null?j.matrix.copy(ee.matrixWorld):(j.matrix.copy(be.matrixWorld),j.matrix.invert(),j.matrix.multiply(ee.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(ee.projectionMatrix),j.projectionMatrixInverse.copy(ee.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=rs*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(d===null&&p===null))return c},this.setFoveation=function(j){c=j,d!==null&&(d.fixedFoveation=j),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=j)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(z)},this.getCameraTexture=function(j){return l[j]};let Re=null;function Q(j,ee){if(u=ee.getViewerPose(h||a),m=ee,u!==null){let be=u.views;p!==null&&(e.setRenderTargetFramebuffer(y,p.framebuffer),e.setRenderTarget(y));let Ne=!1;be.length!==z.cameras.length&&(z.cameras.length=0,Ne=!0);for(let Mt=0;Mt<be.length;Mt++){let Et=be[Mt],st=null;if(p!==null)st=p.getViewport(Et);else{let Bt=f.getViewSubImage(d,Et);st=Bt.viewport,Mt===0&&(e.setRenderTargetTextures(y,Bt.colorTexture,Bt.depthStencilTexture),e.setRenderTarget(y))}let ht=F[Mt];ht===void 0&&(ht=new An,ht.layers.enable(Mt),ht.viewport=new Qt,F[Mt]=ht),ht.matrix.fromArray(Et.transform.matrix),ht.matrix.decompose(ht.position,ht.quaternion,ht.scale),ht.projectionMatrix.fromArray(Et.projectionMatrix),ht.projectionMatrixInverse.copy(ht.projectionMatrix).invert(),ht.viewport.set(st.x,st.y,st.width,st.height),Mt===0&&(z.matrix.copy(ht.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),Ne===!0&&z.cameras.push(ht)}let Ee=r.enabledFeatures;if(Ee&&Ee.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&x){f=n.getBinding();let Mt=f.getDepthInformation(be[0]);Mt&&Mt.isValid&&Mt.texture&&g.init(Mt,r.renderState)}if(Ee&&Ee.includes("camera-access")&&x){e.state.unbindTexture(),f=n.getBinding();for(let Mt=0;Mt<be.length;Mt++){let Et=be[Mt].camera;if(Et){let st=l[Et];st||(st=new Ja,l[Et]=st);let ht=f.getCameraImage(Et);st.sourceTexture=ht}}}}for(let be=0;be<E.length;be++){let Ne=R[be],Ee=E[be];Ne!==null&&Ee!==void 0&&Ee.update(Ne,ee,h||a)}Re&&Re(j,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),m=null}let we=new jm;we.setAnimationLoop(Q),this.setAnimationLoop=function(j){Re=j},this.dispose=function(){}}},ps=new Ti,o1=new It;function l1(i,e){function t(g,l){g.matrixAutoUpdate===!0&&g.updateMatrix(),l.value.copy(g.matrix)}function n(g,l){l.color.getRGB(g.fogColor.value,ju(i)),l.isFog?(g.fogNear.value=l.near,g.fogFar.value=l.far):l.isFogExp2&&(g.fogDensity.value=l.density)}function r(g,l,w,T,y){l.isMeshBasicMaterial||l.isMeshLambertMaterial?s(g,l):l.isMeshToonMaterial?(s(g,l),f(g,l)):l.isMeshPhongMaterial?(s(g,l),u(g,l)):l.isMeshStandardMaterial?(s(g,l),d(g,l),l.isMeshPhysicalMaterial&&p(g,l,y)):l.isMeshMatcapMaterial?(s(g,l),m(g,l)):l.isMeshDepthMaterial?s(g,l):l.isMeshDistanceMaterial?(s(g,l),x(g,l)):l.isMeshNormalMaterial?s(g,l):l.isLineBasicMaterial?(a(g,l),l.isLineDashedMaterial&&o(g,l)):l.isPointsMaterial?c(g,l,w,T):l.isSpriteMaterial?h(g,l):l.isShadowMaterial?(g.color.value.copy(l.color),g.opacity.value=l.opacity):l.isShaderMaterial&&(l.uniformsNeedUpdate=!1)}function s(g,l){g.opacity.value=l.opacity,l.color&&g.diffuse.value.copy(l.color),l.emissive&&g.emissive.value.copy(l.emissive).multiplyScalar(l.emissiveIntensity),l.map&&(g.map.value=l.map,t(l.map,g.mapTransform)),l.alphaMap&&(g.alphaMap.value=l.alphaMap,t(l.alphaMap,g.alphaMapTransform)),l.bumpMap&&(g.bumpMap.value=l.bumpMap,t(l.bumpMap,g.bumpMapTransform),g.bumpScale.value=l.bumpScale,l.side===Xn&&(g.bumpScale.value*=-1)),l.normalMap&&(g.normalMap.value=l.normalMap,t(l.normalMap,g.normalMapTransform),g.normalScale.value.copy(l.normalScale),l.side===Xn&&g.normalScale.value.negate()),l.displacementMap&&(g.displacementMap.value=l.displacementMap,t(l.displacementMap,g.displacementMapTransform),g.displacementScale.value=l.displacementScale,g.displacementBias.value=l.displacementBias),l.emissiveMap&&(g.emissiveMap.value=l.emissiveMap,t(l.emissiveMap,g.emissiveMapTransform)),l.specularMap&&(g.specularMap.value=l.specularMap,t(l.specularMap,g.specularMapTransform)),l.alphaTest>0&&(g.alphaTest.value=l.alphaTest);let w=e.get(l),T=w.envMap,y=w.envMapRotation;T&&(g.envMap.value=T,ps.copy(y),ps.x*=-1,ps.y*=-1,ps.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(ps.y*=-1,ps.z*=-1),g.envMapRotation.value.setFromMatrix4(o1.makeRotationFromEuler(ps)),g.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=l.reflectivity,g.ior.value=l.ior,g.refractionRatio.value=l.refractionRatio),l.lightMap&&(g.lightMap.value=l.lightMap,g.lightMapIntensity.value=l.lightMapIntensity,t(l.lightMap,g.lightMapTransform)),l.aoMap&&(g.aoMap.value=l.aoMap,g.aoMapIntensity.value=l.aoMapIntensity,t(l.aoMap,g.aoMapTransform))}function a(g,l){g.diffuse.value.copy(l.color),g.opacity.value=l.opacity,l.map&&(g.map.value=l.map,t(l.map,g.mapTransform))}function o(g,l){g.dashSize.value=l.dashSize,g.totalSize.value=l.dashSize+l.gapSize,g.scale.value=l.scale}function c(g,l,w,T){g.diffuse.value.copy(l.color),g.opacity.value=l.opacity,g.size.value=l.size*w,g.scale.value=T*.5,l.map&&(g.map.value=l.map,t(l.map,g.uvTransform)),l.alphaMap&&(g.alphaMap.value=l.alphaMap,t(l.alphaMap,g.alphaMapTransform)),l.alphaTest>0&&(g.alphaTest.value=l.alphaTest)}function h(g,l){g.diffuse.value.copy(l.color),g.opacity.value=l.opacity,g.rotation.value=l.rotation,l.map&&(g.map.value=l.map,t(l.map,g.mapTransform)),l.alphaMap&&(g.alphaMap.value=l.alphaMap,t(l.alphaMap,g.alphaMapTransform)),l.alphaTest>0&&(g.alphaTest.value=l.alphaTest)}function u(g,l){g.specular.value.copy(l.specular),g.shininess.value=Math.max(l.shininess,1e-4)}function f(g,l){l.gradientMap&&(g.gradientMap.value=l.gradientMap)}function d(g,l){g.metalness.value=l.metalness,l.metalnessMap&&(g.metalnessMap.value=l.metalnessMap,t(l.metalnessMap,g.metalnessMapTransform)),g.roughness.value=l.roughness,l.roughnessMap&&(g.roughnessMap.value=l.roughnessMap,t(l.roughnessMap,g.roughnessMapTransform)),l.envMap&&(g.envMapIntensity.value=l.envMapIntensity)}function p(g,l,w){g.ior.value=l.ior,l.sheen>0&&(g.sheenColor.value.copy(l.sheenColor).multiplyScalar(l.sheen),g.sheenRoughness.value=l.sheenRoughness,l.sheenColorMap&&(g.sheenColorMap.value=l.sheenColorMap,t(l.sheenColorMap,g.sheenColorMapTransform)),l.sheenRoughnessMap&&(g.sheenRoughnessMap.value=l.sheenRoughnessMap,t(l.sheenRoughnessMap,g.sheenRoughnessMapTransform))),l.clearcoat>0&&(g.clearcoat.value=l.clearcoat,g.clearcoatRoughness.value=l.clearcoatRoughness,l.clearcoatMap&&(g.clearcoatMap.value=l.clearcoatMap,t(l.clearcoatMap,g.clearcoatMapTransform)),l.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=l.clearcoatRoughnessMap,t(l.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),l.clearcoatNormalMap&&(g.clearcoatNormalMap.value=l.clearcoatNormalMap,t(l.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(l.clearcoatNormalScale),l.side===Xn&&g.clearcoatNormalScale.value.negate())),l.dispersion>0&&(g.dispersion.value=l.dispersion),l.iridescence>0&&(g.iridescence.value=l.iridescence,g.iridescenceIOR.value=l.iridescenceIOR,g.iridescenceThicknessMinimum.value=l.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=l.iridescenceThicknessRange[1],l.iridescenceMap&&(g.iridescenceMap.value=l.iridescenceMap,t(l.iridescenceMap,g.iridescenceMapTransform)),l.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=l.iridescenceThicknessMap,t(l.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),l.transmission>0&&(g.transmission.value=l.transmission,g.transmissionSamplerMap.value=w.texture,g.transmissionSamplerSize.value.set(w.width,w.height),l.transmissionMap&&(g.transmissionMap.value=l.transmissionMap,t(l.transmissionMap,g.transmissionMapTransform)),g.thickness.value=l.thickness,l.thicknessMap&&(g.thicknessMap.value=l.thicknessMap,t(l.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=l.attenuationDistance,g.attenuationColor.value.copy(l.attenuationColor)),l.anisotropy>0&&(g.anisotropyVector.value.set(l.anisotropy*Math.cos(l.anisotropyRotation),l.anisotropy*Math.sin(l.anisotropyRotation)),l.anisotropyMap&&(g.anisotropyMap.value=l.anisotropyMap,t(l.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=l.specularIntensity,g.specularColor.value.copy(l.specularColor),l.specularColorMap&&(g.specularColorMap.value=l.specularColorMap,t(l.specularColorMap,g.specularColorMapTransform)),l.specularIntensityMap&&(g.specularIntensityMap.value=l.specularIntensityMap,t(l.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,l){l.matcap&&(g.matcap.value=l.matcap)}function x(g,l){let w=e.get(l).light;g.referencePosition.value.setFromMatrixPosition(w.matrixWorld),g.nearDistance.value=w.shadow.camera.near,g.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function c1(i,e,t,n){let r={},s={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(w,T){let y=T.program;n.uniformBlockBinding(w,y)}function h(w,T){let y=r[w.id];y===void 0&&(m(w),y=u(w),r[w.id]=y,w.addEventListener("dispose",g));let E=T.program;n.updateUBOMapping(w,E);let R=e.render.frame;s[w.id]!==R&&(d(w),s[w.id]=R)}function u(w){let T=f();w.__bindingPointIndex=T;let y=i.createBuffer(),E=w.__size,R=w.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,E,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,y),y}function f(){for(let w=0;w<o;w++)if(a.indexOf(w)===-1)return a.push(w),w;return bt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(w){let T=r[w.id],y=w.uniforms,E=w.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let R=0,P=y.length;R<P;R++){let B=Array.isArray(y[R])?y[R]:[y[R]];for(let M=0,_=B.length;M<_;M++){let F=B[M];if(p(F,R,M,E)===!0){let z=F.__offset,L=Array.isArray(F.value)?F.value:[F.value],D=0;for(let H=0;H<L.length;H++){let Y=L[H],G=x(Y);typeof Y=="number"||typeof Y=="boolean"?(F.__data[0]=Y,i.bufferSubData(i.UNIFORM_BUFFER,z+D,F.__data)):Y.isMatrix3?(F.__data[0]=Y.elements[0],F.__data[1]=Y.elements[1],F.__data[2]=Y.elements[2],F.__data[3]=0,F.__data[4]=Y.elements[3],F.__data[5]=Y.elements[4],F.__data[6]=Y.elements[5],F.__data[7]=0,F.__data[8]=Y.elements[6],F.__data[9]=Y.elements[7],F.__data[10]=Y.elements[8],F.__data[11]=0):(Y.toArray(F.__data,D),D+=G.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,z,F.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(w,T,y,E){let R=w.value,P=T+"_"+y;if(E[P]===void 0)return typeof R=="number"||typeof R=="boolean"?E[P]=R:E[P]=R.clone(),!0;{let B=E[P];if(typeof R=="number"||typeof R=="boolean"){if(B!==R)return E[P]=R,!0}else if(B.equals(R)===!1)return B.copy(R),!0}return!1}function m(w){let T=w.uniforms,y=0,E=16;for(let P=0,B=T.length;P<B;P++){let M=Array.isArray(T[P])?T[P]:[T[P]];for(let _=0,F=M.length;_<F;_++){let z=M[_],L=Array.isArray(z.value)?z.value:[z.value];for(let D=0,H=L.length;D<H;D++){let Y=L[D],G=x(Y),re=y%E,fe=re%G.boundary,ge=re+fe;y+=fe,ge!==0&&E-ge<G.storage&&(y+=E-ge),z.__data=new Float32Array(G.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=y,y+=G.storage}}}let R=y%E;return R>0&&(y+=E-R),w.__size=y,w.__cache={},this}function x(w){let T={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(T.boundary=4,T.storage=4):w.isVector2?(T.boundary=8,T.storage=8):w.isVector3||w.isColor?(T.boundary=16,T.storage=12):w.isVector4?(T.boundary=16,T.storage=16):w.isMatrix3?(T.boundary=48,T.storage=48):w.isMatrix4?(T.boundary=64,T.storage=64):w.isTexture?ct("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ct("WebGLRenderer: Unsupported uniform value type.",w),T}function g(w){let T=w.target;T.removeEventListener("dispose",g);let y=a.indexOf(T.__bindingPointIndex);a.splice(y,1),i.deleteBuffer(r[T.id]),delete r[T.id],delete s[T.id]}function l(){for(let w in r)i.deleteBuffer(r[w]);a=[],r={},s={}}return{bind:c,update:h,dispose:l}}var h1=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),qi=null;function u1(){return qi===null&&(qi=new Ks(h1,16,16,us,Xi),qi.name="DFG_LUT",qi.minFilter=dn,qi.magFilter=dn,qi.wrapS=di,qi.wrapT=di,qi.generateMipmaps=!1,qi.needsUpdate=!0),qi}var Uc=class{constructor(e={}){let{canvas:t=bm(),context:n=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:h=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:d=!1,outputBufferType:p=Zn}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=a;let x=p,g=new Set([Zl,Jl,$l]),l=new Set([Zn,Ci,na,ia,jl,Yl]),w=new Uint32Array(4),T=new Int32Array(4),y=null,E=null,R=[],P=[],B=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ai,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,_=!1;this._outputColorSpace=un;let F=0,z=0,L=null,D=-1,H=null,Y=new Qt,G=new Qt,re=null,fe=new _t(0),ge=0,Te=t.width,qe=t.height,Re=1,Q=null,we=null,j=new Qt(0,0,Te,qe),ee=new Qt(0,0,Te,qe),be=!1,Ne=new $s,Ee=!1,rt=!1,Pe=new It,Mt=new W,Et=new Qt,st={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ht=!1;function Bt(){return L===null?Re:1}let I=n;function Ft(S,O){return t.getContext(S,O)}try{let S={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:h,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"182"}`),t.addEventListener("webglcontextlost",De,!1),t.addEventListener("webglcontextrestored",ve,!1),t.addEventListener("webglcontextcreationerror",me,!1),I===null){let O="webgl2";if(I=Ft(O,S),I===null)throw Ft(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw bt("WebGLRenderer: "+S.message),S}let wt,vt,Oe,C,b,U,le,ue,se,je,ye,Le,at,ce,Se,Ae,Xe,_e,mt,v,q,k,oe,ie;function J(){wt=new vy(I),wt.init(),k=new r1(I,wt),vt=new cy(I,wt,e,k),Oe=new n1(I,wt),vt.reversedDepthBuffer&&d&&Oe.buffers.depth.setReversed(!0),C=new _y(I),b=new G_,U=new i1(I,wt,Oe,b,vt,k,C),le=new uy(M),ue=new xy(M),se=new Tx(I),oe=new oy(I,se),je=new by(I,se,C,oe),ye=new wy(I,je,se,C),mt=new My(I,vt,U),Ae=new hy(b),Le=new z_(M,le,ue,wt,vt,oe,Ae),at=new l1(M,b),ce=new V_,Se=new K_(wt),_e=new ay(M,le,ue,Oe,ye,m,c),Xe=new e1(M,ye,vt),ie=new c1(I,C,vt,Oe),v=new ly(I,wt,C),q=new yy(I,wt,C),C.programs=Le.programs,M.capabilities=vt,M.extensions=wt,M.properties=b,M.renderLists=ce,M.shadowMap=Xe,M.state=Oe,M.info=C}J(),x!==Zn&&(B=new Ty(x,t.width,t.height,r,s));let de=new ff(M,I);this.xr=de,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let S=wt.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=wt.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return Re},this.setPixelRatio=function(S){S!==void 0&&(Re=S,this.setSize(Te,qe,!1))},this.getSize=function(S){return S.set(Te,qe)},this.setSize=function(S,O,Z=!0){if(de.isPresenting){ct("WebGLRenderer: Can't change size while VR device is presenting.");return}Te=S,qe=O,t.width=Math.floor(S*Re),t.height=Math.floor(O*Re),Z===!0&&(t.style.width=S+"px",t.style.height=O+"px"),B!==null&&B.setSize(t.width,t.height),this.setViewport(0,0,S,O)},this.getDrawingBufferSize=function(S){return S.set(Te*Re,qe*Re).floor()},this.setDrawingBufferSize=function(S,O,Z){Te=S,qe=O,Re=Z,t.width=Math.floor(S*Z),t.height=Math.floor(O*Z),this.setViewport(0,0,S,O)},this.setEffects=function(S){if(x===Zn){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let O=0;O<S.length;O++)if(S[O].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}B.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(Y)},this.getViewport=function(S){return S.copy(j)},this.setViewport=function(S,O,Z,$){S.isVector4?j.set(S.x,S.y,S.z,S.w):j.set(S,O,Z,$),Oe.viewport(Y.copy(j).multiplyScalar(Re).round())},this.getScissor=function(S){return S.copy(ee)},this.setScissor=function(S,O,Z,$){S.isVector4?ee.set(S.x,S.y,S.z,S.w):ee.set(S,O,Z,$),Oe.scissor(G.copy(ee).multiplyScalar(Re).round())},this.getScissorTest=function(){return be},this.setScissorTest=function(S){Oe.setScissorTest(be=S)},this.setOpaqueSort=function(S){Q=S},this.setTransparentSort=function(S){we=S},this.getClearColor=function(S){return S.copy(_e.getClearColor())},this.setClearColor=function(){_e.setClearColor(...arguments)},this.getClearAlpha=function(){return _e.getClearAlpha()},this.setClearAlpha=function(){_e.setClearAlpha(...arguments)},this.clear=function(S=!0,O=!0,Z=!0){let $=0;if(S){let X=!1;if(L!==null){let Ce=L.texture.format;X=g.has(Ce)}if(X){let Ce=L.texture.type,Be=l.has(Ce),Ie=_e.getClearColor(),Ve=_e.getClearAlpha(),Ze=Ie.r,ft=Ie.g,ot=Ie.b;Be?(w[0]=Ze,w[1]=ft,w[2]=ot,w[3]=Ve,I.clearBufferuiv(I.COLOR,0,w)):(T[0]=Ze,T[1]=ft,T[2]=ot,T[3]=Ve,I.clearBufferiv(I.COLOR,0,T))}else $|=I.COLOR_BUFFER_BIT}O&&($|=I.DEPTH_BUFFER_BIT),Z&&($|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear($)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",De,!1),t.removeEventListener("webglcontextrestored",ve,!1),t.removeEventListener("webglcontextcreationerror",me,!1),_e.dispose(),ce.dispose(),Se.dispose(),b.dispose(),le.dispose(),ue.dispose(),ye.dispose(),oe.dispose(),ie.dispose(),Le.dispose(),de.dispose(),de.removeEventListener("sessionstart",nn),de.removeEventListener("sessionend",zn),cn.stop()};function De(S){S.preventDefault(),Ua("WebGLRenderer: Context Lost."),_=!0}function ve(){Ua("WebGLRenderer: Context Restored."),_=!1;let S=C.autoReset,O=Xe.enabled,Z=Xe.autoUpdate,$=Xe.needsUpdate,X=Xe.type;J(),C.autoReset=S,Xe.enabled=O,Xe.autoUpdate=Z,Xe.needsUpdate=$,Xe.type=X}function me(S){bt("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Ye(S){let O=S.target;O.removeEventListener("dispose",Ye),gt(O)}function gt(S){Tt(S),b.remove(S)}function Tt(S){let O=b.get(S).programs;O!==void 0&&(O.forEach(function(Z){Le.releaseProgram(Z)}),S.isShaderMaterial&&Le.releaseShaderCache(S))}this.renderBufferDirect=function(S,O,Z,$,X,Ce){O===null&&(O=st);let Be=X.isMesh&&X.matrixWorld.determinant()<0,Ie=mn(S,O,Z,$,X);Oe.setMaterial($,Be);let Ve=Z.index,Ze=1;if($.wireframe===!0){if(Ve=je.getWireframeAttribute(Z),Ve===void 0)return;Ze=2}let ft=Z.drawRange,ot=Z.attributes.position,At=ft.start*Ze,Lt=(ft.start+ft.count)*Ze;Ce!==null&&(At=Math.max(At,Ce.start*Ze),Lt=Math.min(Lt,(Ce.start+Ce.count)*Ze)),Ve!==null?(At=Math.max(At,0),Lt=Math.min(Lt,Ve.count)):ot!=null&&(At=Math.max(At,0),Lt=Math.min(Lt,ot.count));let Xt=Lt-At;if(Xt<0||Xt===1/0)return;oe.setup(X,$,Ie,Z,Ve);let rn,Gt=v;if(Ve!==null&&(rn=se.get(Ve),Gt=q,Gt.setIndex(rn)),X.isMesh)$.wireframe===!0?(Oe.setLineWidth($.wireframeLinewidth*Bt()),Gt.setMode(I.LINES)):Gt.setMode(I.TRIANGLES);else if(X.isLine){let nt=$.linewidth;nt===void 0&&(nt=1),Oe.setLineWidth(nt*Bt()),X.isLineSegments?Gt.setMode(I.LINES):X.isLineLoop?Gt.setMode(I.LINE_LOOP):Gt.setMode(I.LINE_STRIP)}else X.isPoints?Gt.setMode(I.POINTS):X.isSprite&&Gt.setMode(I.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)Hs("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Gt.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(wt.get("WEBGL_multi_draw"))Gt.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let nt=X._multiDrawStarts,Vt=X._multiDrawCounts,kt=X._multiDrawCount,Mn=Ve?se.get(Ve).bytesPerElement:1,Li=b.get($).currentProgram.getUniforms();for(let sn=0;sn<kt;sn++)Li.setValue(I,"_gl_DrawID",sn),Gt.render(nt[sn]/Mn,Vt[sn])}else if(X.isInstancedMesh)Gt.renderInstances(At,Xt,X.count);else if(Z.isInstancedBufferGeometry){let nt=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,Vt=Math.min(Z.instanceCount,nt);Gt.renderInstances(At,Xt,Vt)}else Gt.render(At,Xt)};function Zt(S,O,Z){S.transparent===!0&&S.side===mi&&S.forceSinglePass===!1?(S.side=Xn,S.needsUpdate=!0,Ii(S,O,Z),S.side=Si,S.needsUpdate=!0,Ii(S,O,Z),S.side=mi):Ii(S,O,Z)}this.compile=function(S,O,Z=null){Z===null&&(Z=S),E=Se.get(Z),E.init(O),P.push(E),Z.traverseVisible(function(X){X.isLight&&X.layers.test(O.layers)&&(E.pushLight(X),X.castShadow&&E.pushShadow(X))}),S!==Z&&S.traverseVisible(function(X){X.isLight&&X.layers.test(O.layers)&&(E.pushLight(X),X.castShadow&&E.pushShadow(X))}),E.setupLights();let $=new Set;return S.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let Ce=X.material;if(Ce)if(Array.isArray(Ce))for(let Be=0;Be<Ce.length;Be++){let Ie=Ce[Be];Zt(Ie,Z,X),$.add(Ie)}else Zt(Ce,Z,X),$.add(Ce)}),E=P.pop(),$},this.compileAsync=function(S,O,Z=null){let $=this.compile(S,O,Z);return new Promise(X=>{function Ce(){if($.forEach(function(Be){b.get(Be).currentProgram.isReady()&&$.delete(Be)}),$.size===0){X(S);return}setTimeout(Ce,10)}wt.get("KHR_parallel_shader_compile")!==null?Ce():setTimeout(Ce,10)})};let tn=null;function ln(S){tn&&tn(S)}function nn(){cn.stop()}function zn(){cn.start()}let cn=new jm;cn.setAnimationLoop(ln),typeof self<"u"&&cn.setContext(self),this.setAnimationLoop=function(S){tn=S,de.setAnimationLoop(S),S===null?cn.stop():cn.start()},de.addEventListener("sessionstart",nn),de.addEventListener("sessionend",zn),this.render=function(S,O){if(O!==void 0&&O.isCamera!==!0){bt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(_===!0)return;let Z=de.enabled===!0&&de.isPresenting===!0,$=B!==null&&(L===null||Z)&&B.begin(M,L);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),de.enabled===!0&&de.isPresenting===!0&&(B===null||B.isCompositing()===!1)&&(de.cameraAutoUpdate===!0&&de.updateCamera(O),O=de.getCamera()),S.isScene===!0&&S.onBeforeRender(M,S,O,L),E=Se.get(S,P.length),E.init(O),P.push(E),Pe.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),Ne.setFromProjectionMatrix(Pe,Mi,O.reversedDepth),rt=this.localClippingEnabled,Ee=Ae.init(this.clippingPlanes,rt),y=ce.get(S,R.length),y.init(),R.push(y),de.enabled===!0&&de.isPresenting===!0){let Be=M.xr.getDepthSensingMesh();Be!==null&&vn(Be,O,-1/0,M.sortObjects)}vn(S,O,0,M.sortObjects),y.finish(),M.sortObjects===!0&&y.sort(Q,we),ht=de.enabled===!1||de.isPresenting===!1||de.hasDepthSensing()===!1,ht&&_e.addToRenderList(y,S),this.info.render.frame++,Ee===!0&&Ae.beginShadows();let X=E.state.shadowsArray;if(Xe.render(X,S,O),Ee===!0&&Ae.endShadows(),this.info.autoReset===!0&&this.info.reset(),($&&B.hasRenderPass())===!1){let Be=y.opaque,Ie=y.transmissive;if(E.setupLights(),O.isArrayCamera){let Ve=O.cameras;if(Ie.length>0)for(let Ze=0,ft=Ve.length;Ze<ft;Ze++){let ot=Ve[Ze];Vr(Be,Ie,S,ot)}ht&&_e.render(S);for(let Ze=0,ft=Ve.length;Ze<ft;Ze++){let ot=Ve[Ze];Qn(y,S,ot,ot.viewport)}}else Ie.length>0&&Vr(Be,Ie,S,O),ht&&_e.render(S),Qn(y,S,O)}L!==null&&z===0&&(U.updateMultisampleRenderTarget(L),U.updateRenderTargetMipmap(L)),$&&B.end(M),S.isScene===!0&&S.onAfterRender(M,S,O),oe.resetDefaultState(),D=-1,H=null,P.pop(),P.length>0?(E=P[P.length-1],Ee===!0&&Ae.setGlobalState(M.clippingPlanes,E.state.camera)):E=null,R.pop(),R.length>0?y=R[R.length-1]:y=null};function vn(S,O,Z,$){if(S.visible===!1)return;if(S.layers.test(O.layers)){if(S.isGroup)Z=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(O);else if(S.isLight)E.pushLight(S),S.castShadow&&E.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||Ne.intersectsSprite(S)){$&&Et.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Pe);let Be=ye.update(S),Ie=S.material;Ie.visible&&y.push(S,Be,Ie,Z,Et.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||Ne.intersectsObject(S))){let Be=ye.update(S),Ie=S.material;if($&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Et.copy(S.boundingSphere.center)):(Be.boundingSphere===null&&Be.computeBoundingSphere(),Et.copy(Be.boundingSphere.center)),Et.applyMatrix4(S.matrixWorld).applyMatrix4(Pe)),Array.isArray(Ie)){let Ve=Be.groups;for(let Ze=0,ft=Ve.length;Ze<ft;Ze++){let ot=Ve[Ze],At=Ie[ot.materialIndex];At&&At.visible&&y.push(S,Be,At,Z,Et.z,ot)}}else Ie.visible&&y.push(S,Be,Ie,Z,Et.z,null)}}let Ce=S.children;for(let Be=0,Ie=Ce.length;Be<Ie;Be++)vn(Ce[Be],O,Z,$)}function Qn(S,O,Z,$){let{opaque:X,transmissive:Ce,transparent:Be}=S;E.setupLightsView(Z),Ee===!0&&Ae.setGlobalState(M.clippingPlanes,Z),$&&Oe.viewport(Y.copy($)),X.length>0&&Ki(X,O,Z),Ce.length>0&&Ki(Ce,O,Z),Be.length>0&&Ki(Be,O,Z),Oe.buffers.depth.setTest(!0),Oe.buffers.depth.setMask(!0),Oe.buffers.color.setMask(!0),Oe.setPolygonOffset(!1)}function Vr(S,O,Z,$){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[$.id]===void 0){let At=wt.has("EXT_color_buffer_half_float")||wt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[$.id]=new si(1,1,{generateMipmaps:!0,type:At?Xi:Zn,minFilter:Ri,samples:vt.samples,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ut.workingColorSpace})}let Ce=E.state.transmissionRenderTarget[$.id],Be=$.viewport||Y;Ce.setSize(Be.z*M.transmissionResolutionScale,Be.w*M.transmissionResolutionScale);let Ie=M.getRenderTarget(),Ve=M.getActiveCubeFace(),Ze=M.getActiveMipmapLevel();M.setRenderTarget(Ce),M.getClearColor(fe),ge=M.getClearAlpha(),ge<1&&M.setClearColor(16777215,.5),M.clear(),ht&&_e.render(Z);let ft=M.toneMapping;M.toneMapping=Ai;let ot=$.viewport;if($.viewport!==void 0&&($.viewport=void 0),E.setupLightsView($),Ee===!0&&Ae.setGlobalState(M.clippingPlanes,$),Ki(S,Z,$),U.updateMultisampleRenderTarget(Ce),U.updateRenderTargetMipmap(Ce),wt.has("WEBGL_multisampled_render_to_texture")===!1){let At=!1;for(let Lt=0,Xt=O.length;Lt<Xt;Lt++){let rn=O[Lt],{object:Gt,geometry:nt,material:Vt,group:kt}=rn;if(Vt.side===mi&&Gt.layers.test($.layers)){let Mn=Vt.side;Vt.side=Xn,Vt.needsUpdate=!0,vr(Gt,Z,$,nt,Vt,kt),Vt.side=Mn,Vt.needsUpdate=!0,At=!0}}At===!0&&(U.updateMultisampleRenderTarget(Ce),U.updateRenderTargetMipmap(Ce))}M.setRenderTarget(Ie,Ve,Ze),M.setClearColor(fe,ge),ot!==void 0&&($.viewport=ot),M.toneMapping=ft}function Ki(S,O,Z){let $=O.isScene===!0?O.overrideMaterial:null;for(let X=0,Ce=S.length;X<Ce;X++){let Be=S[X],{object:Ie,geometry:Ve,group:Ze}=Be,ft=Be.material;ft.allowOverride===!0&&$!==null&&(ft=$),Ie.layers.test(Z.layers)&&vr(Ie,O,Z,Ve,ft,Ze)}}function vr(S,O,Z,$,X,Ce){S.onBeforeRender(M,O,Z,$,X,Ce),S.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),X.onBeforeRender(M,O,Z,$,S,Ce),X.transparent===!0&&X.side===mi&&X.forceSinglePass===!1?(X.side=Xn,X.needsUpdate=!0,M.renderBufferDirect(Z,O,$,X,S,Ce),X.side=Si,X.needsUpdate=!0,M.renderBufferDirect(Z,O,$,X,S,Ce),X.side=mi):M.renderBufferDirect(Z,O,$,X,S,Ce),S.onAfterRender(M,O,Z,$,X,Ce)}function Ii(S,O,Z){O.isScene!==!0&&(O=st);let $=b.get(S),X=E.state.lights,Ce=E.state.shadowsArray,Be=X.state.version,Ie=Le.getParameters(S,X.state,Ce,O,Z),Ve=Le.getProgramCacheKey(Ie),Ze=$.programs;$.environment=S.isMeshStandardMaterial?O.environment:null,$.fog=O.fog,$.envMap=(S.isMeshStandardMaterial?ue:le).get(S.envMap||$.environment),$.envMapRotation=$.environment!==null&&S.envMap===null?O.environmentRotation:S.envMapRotation,Ze===void 0&&(S.addEventListener("dispose",Ye),Ze=new Map,$.programs=Ze);let ft=Ze.get(Ve);if(ft!==void 0){if($.currentProgram===ft&&$.lightsStateVersion===Be)return ei(S,Ie),ft}else Ie.uniforms=Le.getUniforms(S),S.onBeforeCompile(Ie,M),ft=Le.acquireProgram(Ie,Ve),Ze.set(Ve,ft),$.uniforms=Ie.uniforms;let ot=$.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(ot.clippingPlanes=Ae.uniform),ei(S,Ie),$.needsLights=Fi(S),$.lightsStateVersion=Be,$.needsLights&&(ot.ambientLightColor.value=X.state.ambient,ot.lightProbe.value=X.state.probe,ot.directionalLights.value=X.state.directional,ot.directionalLightShadows.value=X.state.directionalShadow,ot.spotLights.value=X.state.spot,ot.spotLightShadows.value=X.state.spotShadow,ot.rectAreaLights.value=X.state.rectArea,ot.ltc_1.value=X.state.rectAreaLTC1,ot.ltc_2.value=X.state.rectAreaLTC2,ot.pointLights.value=X.state.point,ot.pointLightShadows.value=X.state.pointShadow,ot.hemisphereLights.value=X.state.hemi,ot.directionalShadowMap.value=X.state.directionalShadowMap,ot.directionalShadowMatrix.value=X.state.directionalShadowMatrix,ot.spotShadowMap.value=X.state.spotShadowMap,ot.spotLightMatrix.value=X.state.spotLightMatrix,ot.spotLightMap.value=X.state.spotLightMap,ot.pointShadowMap.value=X.state.pointShadowMap,ot.pointShadowMatrix.value=X.state.pointShadowMatrix),$.currentProgram=ft,$.uniformsList=null,ft}function en(S){if(S.uniformsList===null){let O=S.currentProgram.getUniforms();S.uniformsList=oa.seqWithValue(O.seq,S.uniforms)}return S.uniformsList}function ei(S,O){let Z=b.get(S);Z.outputColorSpace=O.outputColorSpace,Z.batching=O.batching,Z.batchingColor=O.batchingColor,Z.instancing=O.instancing,Z.instancingColor=O.instancingColor,Z.instancingMorph=O.instancingMorph,Z.skinning=O.skinning,Z.morphTargets=O.morphTargets,Z.morphNormals=O.morphNormals,Z.morphColors=O.morphColors,Z.morphTargetsCount=O.morphTargetsCount,Z.numClippingPlanes=O.numClippingPlanes,Z.numIntersection=O.numClipIntersection,Z.vertexAlphas=O.vertexAlphas,Z.vertexTangents=O.vertexTangents,Z.toneMapping=O.toneMapping}function mn(S,O,Z,$,X){O.isScene!==!0&&(O=st),U.resetTextureUnits();let Ce=O.fog,Be=$.isMeshStandardMaterial?O.environment:null,Ie=L===null?M.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:Pn,Ve=($.isMeshStandardMaterial?ue:le).get($.envMap||Be),Ze=$.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,ft=!!Z.attributes.tangent&&(!!$.normalMap||$.anisotropy>0),ot=!!Z.morphAttributes.position,At=!!Z.morphAttributes.normal,Lt=!!Z.morphAttributes.color,Xt=Ai;$.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(Xt=M.toneMapping);let rn=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Gt=rn!==void 0?rn.length:0,nt=b.get($),Vt=E.state.lights;if(Ee===!0&&(rt===!0||S!==H)){let Sn=S===H&&$.id===D;Ae.setState($,S,Sn)}let kt=!1;$.version===nt.__version?(nt.needsLights&&nt.lightsStateVersion!==Vt.state.version||nt.outputColorSpace!==Ie||X.isBatchedMesh&&nt.batching===!1||!X.isBatchedMesh&&nt.batching===!0||X.isBatchedMesh&&nt.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&nt.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&nt.instancing===!1||!X.isInstancedMesh&&nt.instancing===!0||X.isSkinnedMesh&&nt.skinning===!1||!X.isSkinnedMesh&&nt.skinning===!0||X.isInstancedMesh&&nt.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&nt.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&nt.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&nt.instancingMorph===!1&&X.morphTexture!==null||nt.envMap!==Ve||$.fog===!0&&nt.fog!==Ce||nt.numClippingPlanes!==void 0&&(nt.numClippingPlanes!==Ae.numPlanes||nt.numIntersection!==Ae.numIntersection)||nt.vertexAlphas!==Ze||nt.vertexTangents!==ft||nt.morphTargets!==ot||nt.morphNormals!==At||nt.morphColors!==Lt||nt.toneMapping!==Xt||nt.morphTargetsCount!==Gt)&&(kt=!0):(kt=!0,nt.__version=$.version);let Mn=nt.currentProgram;kt===!0&&(Mn=Ii($,O,X));let Li=!1,sn=!1,$i=!1,Yt=Mn.getUniforms(),wn=nt.uniforms;if(Oe.useProgram(Mn.program)&&(Li=!0,sn=!0,$i=!0),$.id!==D&&(D=$.id,sn=!0),Li||H!==S){Oe.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),Yt.setValue(I,"projectionMatrix",S.projectionMatrix),Yt.setValue(I,"viewMatrix",S.matrixWorldInverse);let Cn=Yt.map.cameraPosition;Cn!==void 0&&Cn.setValue(I,Mt.setFromMatrixPosition(S.matrixWorld)),vt.logarithmicDepthBuffer&&Yt.setValue(I,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),($.isMeshPhongMaterial||$.isMeshToonMaterial||$.isMeshLambertMaterial||$.isMeshBasicMaterial||$.isMeshStandardMaterial||$.isShaderMaterial)&&Yt.setValue(I,"isOrthographic",S.isOrthographicCamera===!0),H!==S&&(H=S,sn=!0,$i=!0)}if(nt.needsLights&&(Vt.state.directionalShadowMap.length>0&&Yt.setValue(I,"directionalShadowMap",Vt.state.directionalShadowMap,U),Vt.state.spotShadowMap.length>0&&Yt.setValue(I,"spotShadowMap",Vt.state.spotShadowMap,U),Vt.state.pointShadowMap.length>0&&Yt.setValue(I,"pointShadowMap",Vt.state.pointShadowMap,U)),X.isSkinnedMesh){Yt.setOptional(I,X,"bindMatrix"),Yt.setOptional(I,X,"bindMatrixInverse");let Sn=X.skeleton;Sn&&(Sn.boneTexture===null&&Sn.computeBoneTexture(),Yt.setValue(I,"boneTexture",Sn.boneTexture,U))}X.isBatchedMesh&&(Yt.setOptional(I,X,"batchingTexture"),Yt.setValue(I,"batchingTexture",X._matricesTexture,U),Yt.setOptional(I,X,"batchingIdTexture"),Yt.setValue(I,"batchingIdTexture",X._indirectTexture,U),Yt.setOptional(I,X,"batchingColorTexture"),X._colorsTexture!==null&&Yt.setValue(I,"batchingColorTexture",X._colorsTexture,U));let kn=Z.morphAttributes;if((kn.position!==void 0||kn.normal!==void 0||kn.color!==void 0)&&mt.update(X,Z,Mn),(sn||nt.receiveShadow!==X.receiveShadow)&&(nt.receiveShadow=X.receiveShadow,Yt.setValue(I,"receiveShadow",X.receiveShadow)),$.isMeshGouraudMaterial&&$.envMap!==null&&(wn.envMap.value=Ve,wn.flipEnvMap.value=Ve.isCubeTexture&&Ve.isRenderTargetTexture===!1?-1:1),$.isMeshStandardMaterial&&$.envMap===null&&O.environment!==null&&(wn.envMapIntensity.value=O.environmentIntensity),wn.dfgLUT!==void 0&&(wn.dfgLUT.value=u1()),sn&&(Yt.setValue(I,"toneMappingExposure",M.toneMappingExposure),nt.needsLights&&Gn(wn,$i),Ce&&$.fog===!0&&at.refreshFogUniforms(wn,Ce),at.refreshMaterialUniforms(wn,$,Re,qe,E.state.transmissionRenderTarget[S.id]),oa.upload(I,en(nt),wn,U)),$.isShaderMaterial&&$.uniformsNeedUpdate===!0&&(oa.upload(I,en(nt),wn,U),$.uniformsNeedUpdate=!1),$.isSpriteMaterial&&Yt.setValue(I,"center",X.center),Yt.setValue(I,"modelViewMatrix",X.modelViewMatrix),Yt.setValue(I,"normalMatrix",X.normalMatrix),Yt.setValue(I,"modelMatrix",X.matrixWorld),$.isShaderMaterial||$.isRawShaderMaterial){let Sn=$.uniformsGroups;for(let Cn=0,br=Sn.length;Cn<br;Cn++){let ti=Sn[Cn];ie.update(ti,Mn),ie.bind(ti,Mn)}}return Mn}function Gn(S,O){S.ambientLightColor.needsUpdate=O,S.lightProbe.needsUpdate=O,S.directionalLights.needsUpdate=O,S.directionalLightShadows.needsUpdate=O,S.pointLights.needsUpdate=O,S.pointLightShadows.needsUpdate=O,S.spotLights.needsUpdate=O,S.spotLightShadows.needsUpdate=O,S.rectAreaLights.needsUpdate=O,S.hemisphereLights.needsUpdate=O}function Fi(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return F},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(S,O,Z){let $=b.get(S);$.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,$.__autoAllocateDepthBuffer===!1&&($.__useRenderToTexture=!1),b.get(S.texture).__webglTexture=O,b.get(S.depthTexture).__webglTexture=$.__autoAllocateDepthBuffer?void 0:Z,$.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,O){let Z=b.get(S);Z.__webglFramebuffer=O,Z.__useDefaultFramebuffer=O===void 0};let et=I.createFramebuffer();this.setRenderTarget=function(S,O=0,Z=0){L=S,F=O,z=Z;let $=null,X=!1,Ce=!1;if(S){let Ie=b.get(S);if(Ie.__useDefaultFramebuffer!==void 0){Oe.bindFramebuffer(I.FRAMEBUFFER,Ie.__webglFramebuffer),Y.copy(S.viewport),G.copy(S.scissor),re=S.scissorTest,Oe.viewport(Y),Oe.scissor(G),Oe.setScissorTest(re),D=-1;return}else if(Ie.__webglFramebuffer===void 0)U.setupRenderTarget(S);else if(Ie.__hasExternalTextures)U.rebindTextures(S,b.get(S.texture).__webglTexture,b.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){let ft=S.depthTexture;if(Ie.__boundDepthTexture!==ft){if(ft!==null&&b.has(ft)&&(S.width!==ft.image.width||S.height!==ft.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");U.setupDepthRenderbuffer(S)}}let Ve=S.texture;(Ve.isData3DTexture||Ve.isDataArrayTexture||Ve.isCompressedArrayTexture)&&(Ce=!0);let Ze=b.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ze[O])?$=Ze[O][Z]:$=Ze[O],X=!0):S.samples>0&&U.useMultisampledRTT(S)===!1?$=b.get(S).__webglMultisampledFramebuffer:Array.isArray(Ze)?$=Ze[Z]:$=Ze,Y.copy(S.viewport),G.copy(S.scissor),re=S.scissorTest}else Y.copy(j).multiplyScalar(Re).floor(),G.copy(ee).multiplyScalar(Re).floor(),re=be;if(Z!==0&&($=et),Oe.bindFramebuffer(I.FRAMEBUFFER,$)&&Oe.drawBuffers(S,$),Oe.viewport(Y),Oe.scissor(G),Oe.setScissorTest(re),X){let Ie=b.get(S.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+O,Ie.__webglTexture,Z)}else if(Ce){let Ie=O;for(let Ve=0;Ve<S.textures.length;Ve++){let Ze=b.get(S.textures[Ve]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+Ve,Ze.__webglTexture,Z,Ie)}}else if(S!==null&&Z!==0){let Ie=b.get(S.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Ie.__webglTexture,Z)}D=-1},this.readRenderTargetPixels=function(S,O,Z,$,X,Ce,Be,Ie=0){if(!(S&&S.isWebGLRenderTarget)){bt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ve=b.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Be!==void 0&&(Ve=Ve[Be]),Ve){Oe.bindFramebuffer(I.FRAMEBUFFER,Ve);try{let Ze=S.textures[Ie],ft=Ze.format,ot=Ze.type;if(!vt.textureFormatReadable(ft)){bt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!vt.textureTypeReadable(ot)){bt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=S.width-$&&Z>=0&&Z<=S.height-X&&(S.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+Ie),I.readPixels(O,Z,$,X,k.convert(ft),k.convert(ot),Ce))}finally{let Ze=L!==null?b.get(L).__webglFramebuffer:null;Oe.bindFramebuffer(I.FRAMEBUFFER,Ze)}}},this.readRenderTargetPixelsAsync=async function(S,O,Z,$,X,Ce,Be,Ie=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ve=b.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Be!==void 0&&(Ve=Ve[Be]),Ve)if(O>=0&&O<=S.width-$&&Z>=0&&Z<=S.height-X){Oe.bindFramebuffer(I.FRAMEBUFFER,Ve);let Ze=S.textures[Ie],ft=Ze.format,ot=Ze.type;if(!vt.textureFormatReadable(ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!vt.textureTypeReadable(ot))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let At=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,At),I.bufferData(I.PIXEL_PACK_BUFFER,Ce.byteLength,I.STREAM_READ),S.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+Ie),I.readPixels(O,Z,$,X,k.convert(ft),k.convert(ot),0);let Lt=L!==null?b.get(L).__webglFramebuffer:null;Oe.bindFramebuffer(I.FRAMEBUFFER,Lt);let Xt=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await ym(I,Xt,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,At),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,Ce),I.deleteBuffer(At),I.deleteSync(Xt),Ce}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,O=null,Z=0){let $=Math.pow(2,-Z),X=Math.floor(S.image.width*$),Ce=Math.floor(S.image.height*$),Be=O!==null?O.x:0,Ie=O!==null?O.y:0;U.setTexture2D(S,0),I.copyTexSubImage2D(I.TEXTURE_2D,Z,0,0,Be,Ie,X,Ce),Oe.unbindTexture()};let Ht=I.createFramebuffer(),Dn=I.createFramebuffer();this.copyTextureToTexture=function(S,O,Z=null,$=null,X=0,Ce=null){Ce===null&&(X!==0?(Hs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Ce=X,X=0):Ce=0);let Be,Ie,Ve,Ze,ft,ot,At,Lt,Xt,rn=S.isCompressedTexture?S.mipmaps[Ce]:S.image;if(Z!==null)Be=Z.max.x-Z.min.x,Ie=Z.max.y-Z.min.y,Ve=Z.isBox3?Z.max.z-Z.min.z:1,Ze=Z.min.x,ft=Z.min.y,ot=Z.isBox3?Z.min.z:0;else{let kn=Math.pow(2,-X);Be=Math.floor(rn.width*kn),Ie=Math.floor(rn.height*kn),S.isDataArrayTexture?Ve=rn.depth:S.isData3DTexture?Ve=Math.floor(rn.depth*kn):Ve=1,Ze=0,ft=0,ot=0}$!==null?(At=$.x,Lt=$.y,Xt=$.z):(At=0,Lt=0,Xt=0);let Gt=k.convert(O.format),nt=k.convert(O.type),Vt;O.isData3DTexture?(U.setTexture3D(O,0),Vt=I.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(U.setTexture2DArray(O,0),Vt=I.TEXTURE_2D_ARRAY):(U.setTexture2D(O,0),Vt=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,O.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,O.unpackAlignment);let kt=I.getParameter(I.UNPACK_ROW_LENGTH),Mn=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Li=I.getParameter(I.UNPACK_SKIP_PIXELS),sn=I.getParameter(I.UNPACK_SKIP_ROWS),$i=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,rn.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,rn.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Ze),I.pixelStorei(I.UNPACK_SKIP_ROWS,ft),I.pixelStorei(I.UNPACK_SKIP_IMAGES,ot);let Yt=S.isDataArrayTexture||S.isData3DTexture,wn=O.isDataArrayTexture||O.isData3DTexture;if(S.isDepthTexture){let kn=b.get(S),Sn=b.get(O),Cn=b.get(kn.__renderTarget),br=b.get(Sn.__renderTarget);Oe.bindFramebuffer(I.READ_FRAMEBUFFER,Cn.__webglFramebuffer),Oe.bindFramebuffer(I.DRAW_FRAMEBUFFER,br.__webglFramebuffer);for(let ti=0;ti<Ve;ti++)Yt&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,b.get(S).__webglTexture,X,ot+ti),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,b.get(O).__webglTexture,Ce,Xt+ti)),I.blitFramebuffer(Ze,ft,Be,Ie,At,Lt,Be,Ie,I.DEPTH_BUFFER_BIT,I.NEAREST);Oe.bindFramebuffer(I.READ_FRAMEBUFFER,null),Oe.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(X!==0||S.isRenderTargetTexture||b.has(S)){let kn=b.get(S),Sn=b.get(O);Oe.bindFramebuffer(I.READ_FRAMEBUFFER,Ht),Oe.bindFramebuffer(I.DRAW_FRAMEBUFFER,Dn);for(let Cn=0;Cn<Ve;Cn++)Yt?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,kn.__webglTexture,X,ot+Cn):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,kn.__webglTexture,X),wn?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Sn.__webglTexture,Ce,Xt+Cn):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Sn.__webglTexture,Ce),X!==0?I.blitFramebuffer(Ze,ft,Be,Ie,At,Lt,Be,Ie,I.COLOR_BUFFER_BIT,I.NEAREST):wn?I.copyTexSubImage3D(Vt,Ce,At,Lt,Xt+Cn,Ze,ft,Be,Ie):I.copyTexSubImage2D(Vt,Ce,At,Lt,Ze,ft,Be,Ie);Oe.bindFramebuffer(I.READ_FRAMEBUFFER,null),Oe.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else wn?S.isDataTexture||S.isData3DTexture?I.texSubImage3D(Vt,Ce,At,Lt,Xt,Be,Ie,Ve,Gt,nt,rn.data):O.isCompressedArrayTexture?I.compressedTexSubImage3D(Vt,Ce,At,Lt,Xt,Be,Ie,Ve,Gt,rn.data):I.texSubImage3D(Vt,Ce,At,Lt,Xt,Be,Ie,Ve,Gt,nt,rn):S.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,Ce,At,Lt,Be,Ie,Gt,nt,rn.data):S.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,Ce,At,Lt,rn.width,rn.height,Gt,rn.data):I.texSubImage2D(I.TEXTURE_2D,Ce,At,Lt,Be,Ie,Gt,nt,rn);I.pixelStorei(I.UNPACK_ROW_LENGTH,kt),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Mn),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Li),I.pixelStorei(I.UNPACK_SKIP_ROWS,sn),I.pixelStorei(I.UNPACK_SKIP_IMAGES,$i),Ce===0&&O.generateMipmaps&&I.generateMipmap(Vt),Oe.unbindTexture()},this.initRenderTarget=function(S){b.get(S).__webglFramebuffer===void 0&&U.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?U.setTextureCube(S,0):S.isData3DTexture?U.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?U.setTexture2DArray(S,0):U.setTexture2D(S,0),Oe.unbindTexture()},this.resetState=function(){F=0,z=0,L=null,Oe.reset(),oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Mi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ut._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ut._getUnpackColorSpace()}};function df(i,e){if(e===Hu)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===ra||e===mo){let t=i.getIndex();if(t===null){let a=[],o=i.getAttribute("position");if(o!==void 0){for(let c=0;c<o.count;c++)a.push(c);i.setIndex(a),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,r=[];if(e===ra)for(let a=1;a<=n;a++)r.push(t.getX(0)),r.push(t.getX(a)),r.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(r.push(t.getX(a)),r.push(t.getX(a+1)),r.push(t.getX(a+2))):(r.push(t.getX(a+2)),r.push(t.getX(a+1)),r.push(t.getX(a)));r.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let s=i.clone();return s.setIndex(r),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}var Bc=class extends Hi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new yf(t)}),this.register(function(t){return new _f(t)}),this.register(function(t){return new Pf(t)}),this.register(function(t){return new If(t)}),this.register(function(t){return new Ff(t)}),this.register(function(t){return new wf(t)}),this.register(function(t){return new Sf(t)}),this.register(function(t){return new Tf(t)}),this.register(function(t){return new Ef(t)}),this.register(function(t){return new bf(t)}),this.register(function(t){return new Af(t)}),this.register(function(t){return new Mf(t)}),this.register(function(t){return new Cf(t)}),this.register(function(t){return new Rf(t)}),this.register(function(t){return new xf(t)}),this.register(function(t){return new Lf(t)}),this.register(function(t){return new Df(t)})}load(e,t,n,r){let s=this,a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){let h=fr.extractUrlBase(e);a=fr.resolveURL(h,this.path)}else a=fr.extractUrlBase(e);this.manager.itemStart(e);let o=function(h){r?r(h):console.error(h),s.manager.itemError(e),s.manager.itemEnd(e)},c=new Qs(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(h){try{s.parse(h,a,function(u){t(u),s.manager.itemEnd(e)},o)}catch(u){o(u)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let s,a={},o={},c=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===ng){try{a[Ot.KHR_BINARY_GLTF]=new kf(e)}catch(f){r&&r(f);return}s=JSON.parse(a[Ot.KHR_BINARY_GLTF].content)}else s=JSON.parse(c.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){r&&r(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let h=new Hf(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});h.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let f=this.pluginCallbacks[u](h);f.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[f.name]=f,a[f.name]=!0}if(s.extensionsUsed)for(let u=0;u<s.extensionsUsed.length;++u){let f=s.extensionsUsed[u],d=s.extensionsRequired||[];switch(f){case Ot.KHR_MATERIALS_UNLIT:a[f]=new vf;break;case Ot.KHR_DRACO_MESH_COMPRESSION:a[f]=new Uf(s,this.dracoLoader);break;case Ot.KHR_TEXTURE_TRANSFORM:a[f]=new Nf;break;case Ot.KHR_MESH_QUANTIZATION:a[f]=new Of;break;default:d.indexOf(f)>=0&&o[f]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+f+'".')}}h.setExtensions(a),h.setPlugins(o),h.parse(n,r)}parseAsync(e,t){let n=this;return new Promise(function(r,s){n.parse(e,t,r,s)})}};function d1(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}var Ot={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},xf=class{constructor(e){this.parser=e,this.name=Ot.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){let s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,r=t.cache.get(n);if(r)return r;let s=t.json,c=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e],h,u=new _t(16777215);c.color!==void 0&&u.setRGB(c.color[0],c.color[1],c.color[2],Pn);let f=c.range!==void 0?c.range:0;switch(c.type){case"directional":h=new ur(u),h.target.position.set(0,0,-1),h.add(h.target);break;case"point":h=new ro(u),h.distance=f;break;case"spot":h=new io(u),h.distance=f,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,h.angle=c.spot.outerConeAngle,h.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,h.target.position.set(0,0,-1),h.add(h.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return h.position.set(0,0,0),Yi(h,c),c.intensity!==void 0&&(h.intensity=c.intensity),h.name=t.createUniqueName(c.name||"light_"+e),r=Promise.resolve(h),t.cache.add(n,r),r}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,s=n.json.nodes[e],o=(s.extensions&&s.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(c){return n._getNodeRef(t.cache,o,c)})}},vf=class{constructor(){this.name=Ot.KHR_MATERIALS_UNLIT}getMaterialType(){return Ei}extendParams(e,t,n){let r=[];e.color=new _t(1,1,1),e.opacity=1;let s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){let a=s.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Pn),e.opacity=a[3]}s.baseColorTexture!==void 0&&r.push(n.assignTexture(e,"map",s.baseColorTexture,un))}return Promise.all(r)}},bf=class{constructor(e){this.parser=e,this.name=Ot.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=r.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}},yf=class{constructor(e){this.parser=e,this.name=Ot.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:$n}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],a=r.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(s.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){let o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new zt(o,o)}return Promise.all(s)}},_f=class{constructor(e){this.parser=e,this.name=Ot.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:$n}extendMaterialParams(e,t){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=r.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}},Mf=class{constructor(e){this.parser=e,this.name=Ot.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:$n}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],a=r.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(s)}},wf=class{constructor(e){this.parser=e,this.name=Ot.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:$n}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[];t.sheenColor=new _t(0,0,0),t.sheenRoughness=0,t.sheen=1;let a=r.extensions[this.name];if(a.sheenColorFactor!==void 0){let o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],Pn)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&s.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,un)),a.sheenRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(s)}},Sf=class{constructor(e){this.parser=e,this.name=Ot.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:$n}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],a=r.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&s.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(s)}},Tf=class{constructor(e){this.parser=e,this.name=Ot.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:$n}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],a=r.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&s.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;let o=a.attenuationColor||[1,1,1];return t.attenuationColor=new _t().setRGB(o[0],o[1],o[2],Pn),Promise.all(s)}},Ef=class{constructor(e){this.parser=e,this.name=Ot.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:$n}extendMaterialParams(e,t){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=r.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}},Af=class{constructor(e){this.parser=e,this.name=Ot.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:$n}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],a=r.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&s.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));let o=a.specularColorFactor||[1,1,1];return t.specularColor=new _t().setRGB(o[0],o[1],o[2],Pn),a.specularColorTexture!==void 0&&s.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,un)),Promise.all(s)}},Rf=class{constructor(e){this.parser=e,this.name=Ot.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:$n}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],a=r.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&s.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(s)}},Cf=class{constructor(e){this.parser=e,this.name=Ot.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:$n}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],a=r.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&s.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(s)}},Pf=class{constructor(e){this.parser=e,this.name=Ot.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let s=r.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,a)}},If=class{constructor(e){this.parser=e,this.name=Ot.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,r=n.json,s=r.textures[e];if(!s.extensions||!s.extensions[t])return null;let a=s.extensions[t],o=r.images[a.source],c=n.textureLoader;if(o.uri){let h=n.options.manager.getHandler(o.uri);h!==null&&(c=h)}return n.loadTextureImage(e,a.source,c)}},Ff=class{constructor(e){this.parser=e,this.name=Ot.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,r=n.json,s=r.textures[e];if(!s.extensions||!s.extensions[t])return null;let a=s.extensions[t],o=r.images[a.source],c=n.textureLoader;if(o.uri){let h=n.options.manager.getHandler(o.uri);h!==null&&(c=h)}return n.loadTextureImage(e,a.source,c)}},Lf=class{constructor(e){this.name=Ot.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let r=n.extensions[this.name],s=this.parser.getDependency("buffer",r.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(o){let c=r.byteOffset||0,h=r.byteLength||0,u=r.count,f=r.byteStride,d=new Uint8Array(o,c,h);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(u,f,d,r.mode,r.filter).then(function(p){return p.buffer}):a.ready.then(function(){let p=new ArrayBuffer(u*f);return a.decodeGltfBuffer(new Uint8Array(p),u,f,d,r.mode,r.filter),p})})}else return null}},Df=class{constructor(e){this.name=Ot.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let r=t.meshes[n.mesh];for(let h of r.primitives)if(h.mode!==gi.TRIANGLES&&h.mode!==gi.TRIANGLE_STRIP&&h.mode!==gi.TRIANGLE_FAN&&h.mode!==void 0)return null;let a=n.extensions[this.name].attributes,o=[],c={};for(let h in a)o.push(this.parser.getDependency("accessor",a[h]).then(u=>(c[h]=u,c[h])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(h=>{let u=h.pop(),f=u.isGroup?u.children:[u],d=h[0].count,p=[];for(let m of f){let x=new It,g=new W,l=new pi,w=new W(1,1,1),T=new ja(m.geometry,m.material,d);for(let y=0;y<d;y++)c.TRANSLATION&&g.fromBufferAttribute(c.TRANSLATION,y),c.ROTATION&&l.fromBufferAttribute(c.ROTATION,y),c.SCALE&&w.fromBufferAttribute(c.SCALE,y),T.setMatrixAt(y,x.compose(g,l,w));for(let y in c)if(y==="_COLOR_0"){let E=c[y];T.instanceColor=new Fr(E.array,E.itemSize,E.normalized)}else y!=="TRANSLATION"&&y!=="ROTATION"&&y!=="SCALE"&&m.geometry.setAttribute(y,c[y]);on.prototype.copy.call(T,m),this.parser.assignFinalMaterial(T),p.push(T)}return u.isGroup?(u.clear(),u.add(...p),u):p[0]}))}},ng="glTF",bo=12,Zm={JSON:1313821514,BIN:5130562},kf=class{constructor(e){this.name=Ot.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,bo),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==ng)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let r=this.header.length-bo,s=new DataView(e,bo),a=0;for(;a<r;){let o=s.getUint32(a,!0);a+=4;let c=s.getUint32(a,!0);if(a+=4,c===Zm.JSON){let h=new Uint8Array(e,bo+a,o);this.content=n.decode(h)}else if(c===Zm.BIN){let h=bo+a;this.body=e.slice(h,h+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Uf=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Ot.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,r=this.dracoLoader,s=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},c={},h={};for(let u in a){let f=zf[u]||u.toLowerCase();o[f]=a[u]}for(let u in e.attributes){let f=zf[u]||u.toLowerCase();if(a[u]!==void 0){let d=n.accessors[e.attributes[u]],p=ca[d.componentType];h[f]=p.name,c[f]=d.normalized===!0}}return t.getDependency("bufferView",s).then(function(u){return new Promise(function(f,d){r.decodeDracoFile(u,function(p){for(let m in p.attributes){let x=p.attributes[m],g=c[m];g!==void 0&&(x.normalized=g)}f(p)},o,h,Pn,d)})})}},Nf=class{constructor(){this.name=Ot.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},Of=class{constructor(){this.name=Ot.KHR_MESH_QUANTIZATION}},zc=class extends lr{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r*3+r;for(let a=0;a!==r;a++)t[a]=n[s+a];return t}interpolate_(e,t,n,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=o*2,h=o*3,u=r-t,f=(n-t)/u,d=f*f,p=d*f,m=e*h,x=m-h,g=-2*p+3*d,l=p-d,w=1-g,T=l-d+f;for(let y=0;y!==o;y++){let E=a[x+y+o],R=a[x+y+c]*u,P=a[m+y+o],B=a[m+y]*u;s[y]=w*E+T*R+g*P+l*B}return s}},p1=new pi,Bf=class extends zc{interpolate_(e,t,n,r){let s=super.interpolate_(e,t,n,r);return p1.fromArray(s).normalize().toArray(s),s}},gi={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},ca={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Qm={9728:fn,9729:dn,9984:Xl,9985:ta,9986:hs,9987:Ri},eg={33071:di,33648:Bs,10497:Ir},pf={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},zf={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Nr={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},m1={CUBICSPLINE:void 0,LINEAR:is,STEP:ns},mf={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function g1(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new os({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Si})),i.DefaultMaterial}function gs(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Yi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function x1(i,e,t){let n=!1,r=!1,s=!1;for(let h=0,u=e.length;h<u;h++){let f=e[h];if(f.POSITION!==void 0&&(n=!0),f.NORMAL!==void 0&&(r=!0),f.COLOR_0!==void 0&&(s=!0),n&&r&&s)break}if(!n&&!r&&!s)return Promise.resolve(i);let a=[],o=[],c=[];for(let h=0,u=e.length;h<u;h++){let f=e[h];if(n){let d=f.POSITION!==void 0?t.getDependency("accessor",f.POSITION):i.attributes.position;a.push(d)}if(r){let d=f.NORMAL!==void 0?t.getDependency("accessor",f.NORMAL):i.attributes.normal;o.push(d)}if(s){let d=f.COLOR_0!==void 0?t.getDependency("accessor",f.COLOR_0):i.attributes.color;c.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c)]).then(function(h){let u=h[0],f=h[1],d=h[2];return n&&(i.morphAttributes.position=u),r&&(i.morphAttributes.normal=f),s&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function v1(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,r=t.length;n<r;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function b1(i){let e,t=i.extensions&&i.extensions[Ot.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+gf(t.attributes):e=i.indices+":"+gf(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,r=i.targets.length;n<r;n++)e+=":"+gf(i.targets[n]);return e}function gf(i){let e="",t=Object.keys(i).sort();for(let n=0,r=t.length;n<r;n++)e+=t[n]+":"+i[t[n]]+";";return e}function Gf(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function y1(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var _1=new It,Hf=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new d1,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,r=-1,s=!1,a=-1;if(typeof navigator<"u"){let o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;let c=o.match(/Version\/(\d+)/);r=n&&c?parseInt(c[1],10):-1,s=o.indexOf("Firefox")>-1,a=s?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&r<17||s&&a<98?this.textureLoader=new to(this.options.manager):this.textureLoader=new ao(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Qs(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,r=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){let o={scene:a[0][r.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:r.asset,parser:n,userData:{}};return gs(s,o,r),Yi(o,r),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(o)})).then(function(){for(let c of o.scenes)c.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let r=0,s=t.length;r<s;r++){let a=t[r].joints;for(let o=0,c=a.length;o<c;o++)e[a[o]].isBone=!0}for(let r=0,s=e.length;r<s;r++){let a=e[r];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let r=n.clone(),s=(a,o)=>{let c=this.associations.get(a);c!=null&&this.associations.set(o,c);for(let[h,u]of a.children.entries())s(u,o.children[h])};return s(n,r),r.name+="_instance_"+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let r=e(t[n]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let r=0;r<t.length;r++){let s=e(t[r]);s&&n.push(s)}return n}getDependency(e,t){let n=e+":"+t,r=this.cache.get(n);if(!r){switch(e){case"scene":r=this.loadScene(t);break;case"node":r=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":r=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":r=this.loadAccessor(t);break;case"bufferView":r=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":r=this.loadBuffer(t);break;case"material":r=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":r=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":r=this.loadSkin(t);break;case"animation":r=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!r)throw new Error("Unknown type: "+e);break}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,r=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(r.map(function(s,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Ot.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(s,a){n.load(fr.resolveURL(t.uri,r.path),s,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let r=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+r)})}loadAccessor(e){let t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let a=pf[r.type],o=ca[r.componentType],c=r.normalized===!0,h=new o(r.count*a);return Promise.resolve(new xn(h,a,c))}let s=[];return r.bufferView!==void 0?s.push(this.getDependency("bufferView",r.bufferView)):s.push(null),r.sparse!==void 0&&(s.push(this.getDependency("bufferView",r.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",r.sparse.values.bufferView))),Promise.all(s).then(function(a){let o=a[0],c=pf[r.type],h=ca[r.componentType],u=h.BYTES_PER_ELEMENT,f=u*c,d=r.byteOffset||0,p=r.bufferView!==void 0?n.bufferViews[r.bufferView].byteStride:void 0,m=r.normalized===!0,x,g;if(p&&p!==f){let l=Math.floor(d/p),w="InterleavedBuffer:"+r.bufferView+":"+r.componentType+":"+l+":"+r.count,T=t.cache.get(w);T||(x=new h(o,l*p,r.count*p/u),T=new qs(x,p/u),t.cache.add(w,T)),g=new js(T,c,d%p/u,m)}else o===null?x=new h(r.count*c):x=new h(o,d,r.count*c),g=new xn(x,c,m);if(r.sparse!==void 0){let l=pf.SCALAR,w=ca[r.sparse.indices.componentType],T=r.sparse.indices.byteOffset||0,y=r.sparse.values.byteOffset||0,E=new w(a[1],T,r.sparse.count*l),R=new h(a[2],y,r.sparse.count*c);o!==null&&(g=new xn(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let P=0,B=E.length;P<B;P++){let M=E[P];if(g.setX(M,R[P*c]),c>=2&&g.setY(M,R[P*c+1]),c>=3&&g.setZ(M,R[P*c+2]),c>=4&&g.setW(M,R[P*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=m}return g})}loadTexture(e){let t=this.json,n=this.options,s=t.textures[e].source,a=t.images[s],o=this.textureLoader;if(a.uri){let c=n.manager.getHandler(a.uri);c!==null&&(o=c)}return this.loadTextureImage(e,s,o)}loadTextureImage(e,t,n){let r=this,s=this.json,a=s.textures[e],o=s.images[t],c=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[c])return this.textureCache[c];let h=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=a.name||o.name||"",u.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(u.name=o.uri);let d=(s.samplers||{})[a.sampler]||{};return u.magFilter=Qm[d.magFilter]||dn,u.minFilter=Qm[d.minFilter]||Ri,u.wrapS=eg[d.wrapS]||Ir,u.wrapT=eg[d.wrapT]||Ir,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==fn&&u.minFilter!==dn,r.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[c]=h,h}loadImageSource(e,t){let n=this,r=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(f=>f.clone());let a=r.images[e],o=self.URL||self.webkitURL,c=a.uri||"",h=!1;if(a.bufferView!==void 0)c=n.getDependency("bufferView",a.bufferView).then(function(f){h=!0;let d=new Blob([f],{type:a.mimeType});return c=o.createObjectURL(d),c});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(c).then(function(f){return new Promise(function(d,p){let m=d;t.isImageBitmapLoader===!0&&(m=function(x){let g=new Rn(x);g.needsUpdate=!0,d(g)}),t.load(fr.resolveURL(f,s.path),m,void 0,p)})}).then(function(f){return h===!0&&o.revokeObjectURL(c),Yi(f,a),f.userData.mimeType=a.mimeType||y1(a.uri),f}).catch(function(f){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),f});return this.sourceCache[e]=u,u}assignTexture(e,t,n,r){let s=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),s.extensions[Ot.KHR_TEXTURE_TRANSFORM]){let o=n.extensions!==void 0?n.extensions[Ot.KHR_TEXTURE_TRANSFORM]:void 0;if(o){let c=s.associations.get(a);a=s.extensions[Ot.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),s.associations.set(a,c)}}return r!==void 0&&(a.colorSpace=r),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,r=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let o="PointsMaterial:"+n.uuid,c=this.cache.get(o);c||(c=new Zs,Kn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(o,c)),n=c}else if(e.isLine){let o="LineBasicMaterial:"+n.uuid,c=this.cache.get(o);c||(c=new Js,Kn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(o,c)),n=c}if(r||s||a){let o="ClonedMaterial:"+n.uuid+":";r&&(o+="derivative-tangents:"),s&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let c=this.cache.get(o);c||(c=n.clone(),s&&(c.vertexColors=!0),a&&(c.flatShading=!0),r&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(o,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return os}loadMaterial(e){let t=this,n=this.json,r=this.extensions,s=n.materials[e],a,o={},c=s.extensions||{},h=[];if(c[Ot.KHR_MATERIALS_UNLIT]){let f=r[Ot.KHR_MATERIALS_UNLIT];a=f.getMaterialType(),h.push(f.extendParams(o,s,t))}else{let f=s.pbrMetallicRoughness||{};if(o.color=new _t(1,1,1),o.opacity=1,Array.isArray(f.baseColorFactor)){let d=f.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],Pn),o.opacity=d[3]}f.baseColorTexture!==void 0&&h.push(t.assignTexture(o,"map",f.baseColorTexture,un)),o.metalness=f.metallicFactor!==void 0?f.metallicFactor:1,o.roughness=f.roughnessFactor!==void 0?f.roughnessFactor:1,f.metallicRoughnessTexture!==void 0&&(h.push(t.assignTexture(o,"metalnessMap",f.metallicRoughnessTexture)),h.push(t.assignTexture(o,"roughnessMap",f.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),h.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}s.doubleSided===!0&&(o.side=mi);let u=s.alphaMode||mf.OPAQUE;if(u===mf.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,u===mf.MASK&&(o.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&a!==Ei&&(h.push(t.assignTexture(o,"normalMap",s.normalTexture)),o.normalScale=new zt(1,1),s.normalTexture.scale!==void 0)){let f=s.normalTexture.scale;o.normalScale.set(f,f)}if(s.occlusionTexture!==void 0&&a!==Ei&&(h.push(t.assignTexture(o,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&a!==Ei){let f=s.emissiveFactor;o.emissive=new _t().setRGB(f[0],f[1],f[2],Pn)}return s.emissiveTexture!==void 0&&a!==Ei&&h.push(t.assignTexture(o,"emissiveMap",s.emissiveTexture,un)),Promise.all(h).then(function(){let f=new a(o);return s.name&&(f.name=s.name),Yi(f,s),t.associations.set(f,{materials:e}),s.extensions&&gs(r,f,s),f})}createUniqueName(e){let t=Jt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,r=this.primitiveCache;function s(o){return n[Ot.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(c){return tg(c,o,t)})}let a=[];for(let o=0,c=e.length;o<c;o++){let h=e[o],u=b1(h),f=r[u];if(f)a.push(f.promise);else{let d;h.extensions&&h.extensions[Ot.KHR_DRACO_MESH_COMPRESSION]?d=s(h):d=tg(new Wn,h,t),r[u]={primitive:h,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,r=this.extensions,s=n.meshes[e],a=s.primitives,o=[];for(let c=0,h=a.length;c<h;c++){let u=a[c].material===void 0?g1(this.cache):this.getDependency("material",a[c].material);o.push(u)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(c){let h=c.slice(0,c.length-1),u=c[c.length-1],f=[];for(let p=0,m=u.length;p<m;p++){let x=u[p],g=a[p],l,w=h[p];if(g.mode===gi.TRIANGLES||g.mode===gi.TRIANGLE_STRIP||g.mode===gi.TRIANGLE_FAN||g.mode===void 0)l=s.isSkinnedMesh===!0?new Xa(x,w):new Fn(x,w),l.isSkinnedMesh===!0&&l.normalizeSkinWeights(),g.mode===gi.TRIANGLE_STRIP?l.geometry=df(l.geometry,mo):g.mode===gi.TRIANGLE_FAN&&(l.geometry=df(l.geometry,ra));else if(g.mode===gi.LINES)l=new Ya(x,w);else if(g.mode===gi.LINE_STRIP)l=new as(x,w);else if(g.mode===gi.LINE_LOOP)l=new Ka(x,w);else if(g.mode===gi.POINTS)l=new $a(x,w);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(l.geometry.morphAttributes).length>0&&v1(l,s),l.name=t.createUniqueName(s.name||"mesh_"+e),Yi(l,s),g.extensions&&gs(r,l,g),t.assignFinalMaterial(l),f.push(l)}for(let p=0,m=f.length;p<m;p++)t.associations.set(f[p],{meshes:e,primitives:p});if(f.length===1)return s.extensions&&gs(r,f[0],s),f[0];let d=new jn;s.extensions&&gs(r,d,s),t.associations.set(d,{meshes:e});for(let p=0,m=f.length;p<m;p++)d.add(f[p]);return d})}loadCamera(e){let t,n=this.json.cameras[e],r=n[n.type];if(!r){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new An(sa.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):n.type==="orthographic"&&(t=new Vi(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Yi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let r=0,s=t.joints.length;r<s;r++)n.push(this._loadNodeShallow(t.joints[r]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(r){let s=r.pop(),a=r,o=[],c=[];for(let h=0,u=a.length;h<u;h++){let f=a[h];if(f){o.push(f);let d=new It;s!==null&&d.fromArray(s.array,h*16),c.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[h])}return new qa(o,c)})}loadAnimation(e){let t=this.json,n=this,r=t.animations[e],s=r.name?r.name:"animation_"+e,a=[],o=[],c=[],h=[],u=[];for(let f=0,d=r.channels.length;f<d;f++){let p=r.channels[f],m=r.samplers[p.sampler],x=p.target,g=x.node,l=r.parameters!==void 0?r.parameters[m.input]:m.input,w=r.parameters!==void 0?r.parameters[m.output]:m.output;x.node!==void 0&&(a.push(this.getDependency("node",g)),o.push(this.getDependency("accessor",l)),c.push(this.getDependency("accessor",w)),h.push(m),u.push(x))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c),Promise.all(h),Promise.all(u)]).then(function(f){let d=f[0],p=f[1],m=f[2],x=f[3],g=f[4],l=[];for(let T=0,y=d.length;T<y;T++){let E=d[T],R=p[T],P=m[T],B=x[T],M=g[T];if(E===void 0)continue;E.updateMatrix&&E.updateMatrix();let _=n._createAnimationTracks(E,R,P,B,M);if(_)for(let F=0;F<_.length;F++)l.push(_[F])}let w=new eo(s,void 0,l);return Yi(w,r),w})}createNodeMesh(e){let t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency("mesh",r.mesh).then(function(s){let a=n._getNodeRef(n.meshCache,r.mesh,s);return r.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let c=0,h=r.weights.length;c<h;c++)o.morphTargetInfluences[c]=r.weights[c]}),a})}loadNode(e){let t=this.json,n=this,r=t.nodes[e],s=n._loadNodeShallow(e),a=[],o=r.children||[];for(let h=0,u=o.length;h<u;h++)a.push(n.getDependency("node",o[h]));let c=r.skin===void 0?Promise.resolve(null):n.getDependency("skin",r.skin);return Promise.all([s,Promise.all(a),c]).then(function(h){let u=h[0],f=h[1],d=h[2];d!==null&&u.traverse(function(p){p.isSkinnedMesh&&p.bind(d,_1)});for(let p=0,m=f.length;p<m;p++)u.add(f[p]);return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let s=t.nodes[e],a=s.name?r.createUniqueName(s.name):"",o=[],c=r._invokeOne(function(h){return h.createNodeMesh&&h.createNodeMesh(e)});return c&&o.push(c),s.camera!==void 0&&o.push(r.getDependency("camera",s.camera).then(function(h){return r._getNodeRef(r.cameraCache,s.camera,h)})),r._invokeAll(function(h){return h.createNodeAttachment&&h.createNodeAttachment(e)}).forEach(function(h){o.push(h)}),this.nodeCache[e]=Promise.all(o).then(function(h){let u;if(s.isBone===!0?u=new Ys:h.length>1?u=new jn:h.length===1?u=h[0]:u=new on,u!==h[0])for(let f=0,d=h.length;f<d;f++)u.add(h[f]);if(s.name&&(u.userData.name=s.name,u.name=a),Yi(u,s),s.extensions&&gs(n,u,s),s.matrix!==void 0){let f=new It;f.fromArray(s.matrix),u.applyMatrix4(f)}else s.translation!==void 0&&u.position.fromArray(s.translation),s.rotation!==void 0&&u.quaternion.fromArray(s.rotation),s.scale!==void 0&&u.scale.fromArray(s.scale);if(!r.associations.has(u))r.associations.set(u,{});else if(s.mesh!==void 0&&r.meshCache.refs[s.mesh]>1){let f=r.associations.get(u);r.associations.set(u,{...f})}return r.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],r=this,s=new jn;n.name&&(s.name=r.createUniqueName(n.name)),Yi(s,n),n.extensions&&gs(t,s,n);let a=n.nodes||[],o=[];for(let c=0,h=a.length;c<h;c++)o.push(r.getDependency("node",a[c]));return Promise.all(o).then(function(c){for(let u=0,f=c.length;u<f;u++)s.add(c[u]);let h=u=>{let f=new Map;for(let[d,p]of r.associations)(d instanceof Kn||d instanceof Rn)&&f.set(d,p);return u.traverse(d=>{let p=r.associations.get(d);p!=null&&f.set(d,p)}),f};return r.associations=h(s),s})}_createAnimationTracks(e,t,n,r,s){let a=[],o=e.name?e.name:e.uuid,c=[];Nr[s.path]===Nr.weights?e.traverse(function(d){d.morphTargetInfluences&&c.push(d.name?d.name:d.uuid)}):c.push(o);let h;switch(Nr[s.path]){case Nr.weights:h=Bi;break;case Nr.rotation:h=zi;break;case Nr.translation:case Nr.scale:h=Gi;break;default:switch(n.itemSize){case 1:h=Bi;break;case 2:case 3:default:h=Gi;break}break}let u=r.interpolation!==void 0?m1[r.interpolation]:is,f=this._getArrayFromAccessor(n);for(let d=0,p=c.length;d<p;d++){let m=new h(c[d]+"."+Nr[s.path],t.array,f,u);r.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(m),a.push(m)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=Gf(t.constructor),r=new Float32Array(t.length);for(let s=0,a=t.length;s<a;s++)r[s]=t[s]*n;t=r}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let r=this instanceof zi?Bf:zc;return new r(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function M1(i,e,t){let n=e.attributes,r=new In;if(n.POSITION!==void 0){let o=t.json.accessors[n.POSITION],c=o.min,h=o.max;if(c!==void 0&&h!==void 0){if(r.set(new W(c[0],c[1],c[2]),new W(h[0],h[1],h[2])),o.normalized){let u=Gf(ca[o.componentType]);r.min.multiplyScalar(u),r.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let s=e.targets;if(s!==void 0){let o=new W,c=new W;for(let h=0,u=s.length;h<u;h++){let f=s[h];if(f.POSITION!==void 0){let d=t.json.accessors[f.POSITION],p=d.min,m=d.max;if(p!==void 0&&m!==void 0){if(c.setX(Math.max(Math.abs(p[0]),Math.abs(m[0]))),c.setY(Math.max(Math.abs(p[1]),Math.abs(m[1]))),c.setZ(Math.max(Math.abs(p[2]),Math.abs(m[2]))),d.normalized){let x=Gf(ca[d.componentType]);c.multiplyScalar(x)}o.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}r.expandByVector(o)}i.boundingBox=r;let a=new Yn;r.getCenter(a.center),a.radius=r.min.distanceTo(r.max)/2,i.boundingSphere=a}function tg(i,e,t){let n=e.attributes,r=[];function s(a,o){return t.getDependency("accessor",a).then(function(c){i.setAttribute(o,c)})}for(let a in n){let o=zf[a]||a.toLowerCase();o in i.attributes||r.push(s(n[a],o))}if(e.indices!==void 0&&!i.index){let a=t.getDependency("accessor",e.indices).then(function(o){i.setIndex(o)});r.push(a)}return Ut.workingColorSpace!==Pn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Ut.workingColorSpace}" not supported.`),Yi(i,e),M1(i,e,t),Promise.all(r).then(function(){return e.targets!==void 0?x1(i,e.targets,t):i})}var ig=(function(){var i="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuikqbeeedddillviebeoweuec:q:Odkr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbol79IV9Rbrq;w8Wqdbk;esezu8Jjjjjbcj;eb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Radz1jjjbhwcj;abad9Uc;WFbGgocjdaocjd6EhDaicefhocbhqdnindndndnaeaq9nmbaDaeaq9RaqaDfae6Egkcsfglcl4cifcd4hxalc9WGgmTmecbhPawcjdfhsaohzinaraz9Rax6mvarazaxfgo9RcK6mvczhlcbhHinalgic9WfgOawcj;cbffhldndndndndnazaOco4fRbbaHcoG4ciGPlbedibkal9cb83ibalcwf9cb83ibxikalaoRblaoRbbgOco4gAaAciSgAE86bbawcj;cbfaifglcGfaoclfaAfgARbbaOcl4ciGgCaCciSgCE86bbalcVfaAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc7faAaCfgARbbaOciGgOaOciSgOE86bbalctfaAaOfgARbbaoRbegOco4gCaCciSgCE86bbalc91faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc4faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc93faAaCfgARbbaOciGgOaOciSgOE86bbalc94faAaOfgARbbaoRbdgOco4gCaCciSgCE86bbalc95faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc96faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc97faAaCfgARbbaOciGgOaOciSgOE86bbalc98faAaOfgORbbaoRbigoco4gAaAciSgAE86bbalc99faOaAfgORbbaocl4ciGgAaAciSgAE86bbalc9:faOaAfgORbbaocd4ciGgAaAciSgAE86bbalcufaOaAfglRbbaociGgoaociSgoE86bbalaofhoxdkalaoRbwaoRbbgOcl4gAaAcsSgAE86bbawcj;cbfaifglcGfaocwfaAfgARbbaOcsGgOaOcsSgOE86bbalcVfaAaOfgORbbaoRbegAcl4gCaCcsSgCE86bbalc7faOaCfgORbbaAcsGgAaAcsSgAE86bbalctfaOaAfgORbbaoRbdgAcl4gCaCcsSgCE86bbalc91faOaCfgORbbaAcsGgAaAcsSgAE86bbalc4faOaAfgORbbaoRbigAcl4gCaCcsSgCE86bbalc93faOaCfgORbbaAcsGgAaAcsSgAE86bbalc94faOaAfgORbbaoRblgAcl4gCaCcsSgCE86bbalc95faOaCfgORbbaAcsGgAaAcsSgAE86bbalc96faOaAfgORbbaoRbvgAcl4gCaCcsSgCE86bbalc97faOaCfgORbbaAcsGgAaAcsSgAE86bbalc98faOaAfgORbbaoRbogAcl4gCaCcsSgCE86bbalc99faOaCfgORbbaAcsGgAaAcsSgAE86bbalc9:faOaAfgORbbaoRbrgocl4gAaAcsSgAE86bbalcufaOaAfglRbbaocsGgoaocsSgoE86bbalaofhoxekalao8Pbb83bbalcwfaocwf8Pbb83bbaoczfhokdnaiam9pmbaHcdfhHaiczfhlarao9RcL0mekkaiam6mvaoTmvdnakTmbawaPfRbbhHawcj;cbfhlashiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkkascefhsaohzaPcefgPad9hmbxikkcbc99arao9Radcaadca0ESEhoxlkaoaxad2fhCdnakmbadhlinaoTmlarao9Rax6mlaoaxfhoalcufglmbkaChoxekcbhmawcjdfhAinarao9Rax6miawamfRbbhHawcj;cbfhlaAhiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkaAcefhAaoaxfhoamcefgmad9hmbkaChokabaqad2fawcjdfakad2z1jjjb8Aawawcjdfakcufad2fadz1jjjb8Aakaqfhqaombkc9:hoxekc9:hokavcj;ebf8Kjjjjbaok;cseHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecjez:jjjjb8AavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk;oiliui99iue99dnaeTmbcbhiabhlindndnJ;Zl81Zalcof8UebgvciV:Y:vgoal8Ueb:YNgrJb;:FSNJbbbZJbbb:;arJbbbb9GEMgw:lJbbb9p9DTmbaw:OhDxekcjjjj94hDkalclf8Uebhqalcdf8UebhkabaiavcefciGfcetfaD87ebdndnaoak:YNgwJb;:FSNJbbbZJbbb:;awJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavciGfgkcd7cetfaD87ebdndnaoaq:YNgoJb;:FSNJbbbZJbbb:;aoJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavcufciGfcetfaD87ebdndnJbbjZararN:tawawN:taoaoN:tgrJbbbbarJbbbb9GE:rJb;:FSNJbbbZMgr:lJbbb9p9DTmbar:Ohvxekcjjjj94hvkabakcetfav87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkkkebcjwklzNbb",e="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuikqbbebeedddilve9Weeeviebeoweuec:q:6dkr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbwl79IV9RbDq:p9sqlbzik9:evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaec:q:yjjbfai86bbaecitc:q1jjbfab8Piw83ibaecefgecjd9hmbkk:N8JlHud97euo978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Rad;8qbbcj;abad9UhlaicefhodnaeTmbadTmbalc;WFbGglcjdalcjd6EhwcbhDinawaeaD9RaDawfae6Egqcsfglc9WGgkci2hxakcethmalcl4cifcd4hPabaDad2fhsakc;ab6hzcbhHincbhOaohAdndninaraA9RaP6meavcj;cbfaOak2fhCaAaPfhocbhidnazmbarao9Rc;Gb6mbcbhlinaCalfhidndndndndnaAalco4fRbbgXciGPlbedibkaipxbbbbbbbbbbbbbbbbpklbxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklbaoczfhokdndndndndnaXcd4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklzxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklzaoczfhokdndndndndnaXcl4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklaxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklaaoczfhokdndndndndnaXco4Plbedibkaipxbbbbbbbbbbbbbbbbpkl8WxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaoclfaYpQbfaXc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaocwfaYpQbfaXc:q:yjjbfRbbfhoxekaiaopbbbpkl8Waoczfhokalc;abfhialcjefak0meaihlarao9Rc;Fb0mbkkdnaiak9pmbaici4hlinarao9RcK6miaCaifhXdndndndndnaAaico4fRbbalcoG4ciGPlbedibkaXpxbbbbbbbbbbbbbbbbpkbbxikaXaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaXaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaXaopbbbpkbbaoczfhokalcdfhlaiczfgiak6mbkkaoTmeaohAaOcefgOclSmdxbkkc9:hoxlkdnakTmbavcjdfaHfhiavaHfpbdbhYcbhXinaiavcj;cbfaXfglpblbgLcep9TaLpxeeeeeeeeeeeeeeeegQp9op9Hp9rgLalakfpblbg8Acep9Ta8AaQp9op9Hp9rg8ApmbzeHdOiAlCvXoQrLgEalamfpblbg3cep9Ta3aQp9op9Hp9rg3alaxfpblbg5cep9Ta5aQp9op9Hp9rg5pmbzeHdOiAlCvXoQrLg8EpmbezHdiOAlvCXorQLgQaQpmbedibedibedibediaYp9UgYp9AdbbaiadfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaEa8EpmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwKDYq8AkEx3m5P8Es8FgLa3a5pmwKDYq8AkEx3m5P8Es8Fg8ApmbezHdiOAlvCXorQLgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfhiaXczfgXak6mbkkaHclfgHad6mbkasavcjdfaqad2;8qbbavavcjdfaqcufad2fad;8qbbaqaDfgDae6mbkkcbc99arao9Radcaadca0ESEhokavcj;kbf8Kjjjjbaokwbz:bjjjbk::seHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecje;8kbavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:wPliuo97eue978Jjjjjbca9Rhiaec98Ghldndnadcl9hmbdnalTmbcbhvabhdinadadpbbbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbadczfhdavclfgval6mbkkalaeSmeaipxbbbbbbbbbbbbbbbbgqpklbaiabalcdtfgdaeciGglcdtgv;8qbbdnalTmbaiaipblbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDaqp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpklbkadaiav;8qbbskdnalTmbcbhvabhdinadczfgxaxpbbbgopxbbbbbbFFbbbbbbFFgkp9oadpbbbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpkbbadaDakp9oaoarpmbezHdiOAlvCXorQLp9qpkbbadcafhdavclfgval6mbkkalaeSmbaiaeciGgvcitgdfcbcaad9R;8kbaiabalcitfglad;8qbbdnavTmbaiaipblzgopxbbbbbbFFbbbbbbFFgkp9oaipblbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpklzaiaDakp9oaoarpmbezHdiOAlvCXorQLp9qpklbkalaiad;8qbbkk;4wllue97euv978Jjjjjbc8W9Rhidnaec98GglTmbcbhvabhoinaiaopbbbgraoczfgwpbbbgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklbaopxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblbpEb:T:j83ibaocwfarp5eaipblbpEe:T:j83ibawaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblbpEd:T:j83ibaocKfakp5eaipblbpEi:T:j83ibaocafhoavclfgval6mbkkdnalaeSmbaiaeciGgvcitgofcbcaao9R;8kbaiabalcitfgwao;8qbbdnavTmbaiaipblbgraipblzgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklaaipxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblapEb:T:j83ibaiarp5eaipblapEe:T:j83iwaiaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblapEd:T:j83izaiakp5eaipblapEi:T:j83iKkawaiao;8qbbkk:Pddiue978Jjjjjbc;ab9Rhidnadcd4ae2glc98GgvTmbcbheabhdinadadpbbbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbadczfhdaeclfgeav6mbkkdnavalSmbaialciGgecdtgdVcbc;abad9R;8kbaiabavcdtfgvad;8qbbdnaeTmbaiaipblbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepklbkavaiad;8qbbkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkkebcjwklz:Dbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),n=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var r=WebAssembly.validate(t)?o(e):o(i),s,a=WebAssembly.instantiate(r,{}).then(function(l){s=l.instance,s.exports.__wasm_call_ctors()});function o(l){for(var w=new Uint8Array(l.length),T=0;T<l.length;++T){var y=l.charCodeAt(T);w[T]=y>96?y-97:y>64?y-39:y+4}for(var E=0,T=0;T<l.length;++T)w[E++]=w[T]<60?n[w[T]]:(w[T]-60)*64+w[++T];return w.buffer.slice(0,E)}function c(l,w,T,y,E,R,P){var B=l.exports.sbrk,M=y+3&-4,_=B(M*E),F=B(R.length),z=new Uint8Array(l.exports.memory.buffer);z.set(R,F);var L=w(_,y,E,F,R.length);if(L==0&&P&&P(_,M,E),T.set(z.subarray(_,_+y*E)),B(_-B(0)),L!=0)throw new Error("Malformed buffer data: "+L)}var h={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},u={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},f=[],d=0;function p(l){var w={object:new Worker(l),pending:0,requests:{}};return w.object.onmessage=function(T){var y=T.data;w.pending-=y.count,w.requests[y.id][y.action](y.value),delete w.requests[y.id]},w}function m(l){for(var w="self.ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(r)+"]), {}).then(function(result) { result.instance.exports.__wasm_call_ctors(); return result.instance; });self.onmessage = "+g.name+";"+c.toString()+g.toString(),T=new Blob([w],{type:"text/javascript"}),y=URL.createObjectURL(T),E=f.length;E<l;++E)f[E]=p(y);for(var E=l;E<f.length;++E)f[E].object.postMessage({});f.length=l,URL.revokeObjectURL(y)}function x(l,w,T,y,E){for(var R=f[0],P=1;P<f.length;++P)f[P].pending<R.pending&&(R=f[P]);return new Promise(function(B,M){var _=new Uint8Array(T),F=++d;R.pending+=l,R.requests[F]={resolve:B,reject:M},R.object.postMessage({id:F,count:l,size:w,source:_,mode:y,filter:E},[_.buffer])})}function g(l){var w=l.data;if(!w.id)return self.close();self.ready.then(function(T){try{var y=new Uint8Array(w.count*w.size);c(T,T.exports[w.mode],y,w.count,w.size,w.source,T.exports[w.filter]),self.postMessage({id:w.id,count:w.count,action:"resolve",value:y},[y.buffer])}catch(E){self.postMessage({id:w.id,count:w.count,action:"reject",value:E})}})}return{ready:a,supported:!0,useWorkers:function(l){m(l)},decodeVertexBuffer:function(l,w,T,y,E){c(s,s.exports.meshopt_decodeVertexBuffer,l,w,T,y,s.exports[h[E]])},decodeIndexBuffer:function(l,w,T,y){c(s,s.exports.meshopt_decodeIndexBuffer,l,w,T,y)},decodeIndexSequence:function(l,w,T,y){c(s,s.exports.meshopt_decodeIndexSequence,l,w,T,y)},decodeGltfBuffer:function(l,w,T,y,E,R){c(s,s.exports[u[E]],l,w,T,y,s.exports[h[R]])},decodeGltfBufferAsync:function(l,w,T,y,E){return f.length>0?x(l,w,T,u[y],h[E]):a.then(function(){var R=new Uint8Array(l*w);return c(s,s.exports[u[y]],R,l,w,T,s.exports[h[E]]),R})}}})();var Zf=i=>Object.keys(i.params);function S1(i){if(!i.length)return null;let e=i.map((r,s)=>{let a=Zf(r);return`struct Fx${s}Params{${a.length?a.map(o=>`float ${o};`).join(""):"float unused;"}};`}).join(`
`),t={displace:["vec2 at=sampleAt;","sampleAt=at;"],shade:["vec3 color=rgb;vec3 ink=fxInk;float inkAmount=fxInkAmount;float glyph=fxGlyph;","fxInk=ink;fxInkAmount=inkAmount;fxGlyph=glyph;"]},n=r=>i.map((s,a)=>s[r]?`{// effect "${s.name}"
${((o,c)=>{let h=Zf(o),u=h.length?h.map((f,d)=>`uFx[${2*c+(d>>2)}].${"xyzw"[3&d]}`).join(","):"0.";return`Fx${c}Params params=Fx${c}Params(${u});`})(s,a)}${t[r][0]}
${s[r]}
${t[r][1]}}`:"").filter(Boolean).join(`
`);return{declarations:`uniform vec4 uFx[8];
uniform vec4 uFxPointer;
uniform float uFxTime;
${e}`,displace:n("displace"),shade:n("shade")}}var T1={none:3,flow:1,orb:2,drift:4,swell:5,caustics:6,contour:7,aurora:8,ripple:9,halo:10,interference:11,mesh:12,cascade:13,constellation:14},Ag=i=>i?`
const float VSCALE=6.;
vec4 decodeFluid(vec4 t){return vec4((t.xy*2.-1.)*VSCALE,t.z,t.w);}
vec4 encodeFluid(vec4 v){return vec4(clamp(v.xy/VSCALE*.5+.5,0.,1.),clamp(v.z,0.,1.),1.);}`:`
vec4 decodeFluid(vec4 t){return t;}
vec4 encodeFluid(vec4 v){return vec4(v.xyz,1.);}`,Rg=(i,e=[])=>{let t=(a=>`#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uSource, uFluid;
uniform vec2 uResolution, uCell;
uniform float uCount, uBlend;
const float BAYER[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
uniform vec3 uRamp[6];
uniform float uRampCount;
// The gradient map: the tone run through the ramp's stops, evenly spaced, faintest first.
vec3 rampAt(float t){
  float x=clamp(t,0.,1.)*(uRampCount-1.);
  int i=int(min(floor(x),uRampCount-2.));
  vec3 a=uRamp[0],b=uRamp[1];
  for(int k=1;k<5;k++)if(k==i){a=uRamp[k];b=uRamp[k+1];}
  return mix(a,b,clamp(x-float(i),0.,1.));
}
uniform vec4 uSourceMap;
uniform int uScene;
uniform vec3 uInk, uHighlight;
uniform vec4 uBackground;
uniform float uBrightness, uContrast, uGamma, uInvert, uVignette, uSourceColor;
uniform float uRefraction, uGlow, uTime, uDrift, uFluidOn, uLod, uSaturation, uBackdrop, uShade, uHighlightAuto, uFluidMode;
uniform vec2 uFluidTexel;
uniform int uHoverMode;
uniform vec3 uLight;
uniform vec3 uTrail[12];
uniform float uLightRadius, uLightGain, uClock, uFlicker, uTrailAmount;
uniform sampler2D uTrailMap, uScope;
uniform float uScopeMode;
uniform vec2 uLevels;
// A moving source's levels, measured on the GPU (field-measure.ts), when uLevelsFromMap is set.
uniform sampler2D uLevelMap;
uniform float uLevelsFromMap;
// Shape sampling: each cell read in 3 by 5 parts and matched to the glyphs' own ink in those parts (see GlyphFieldOptions.sample).
uniform float uShapeOn, uShapeLod, uShapeTone, uShapeWindow, uShapeGate;
uniform sampler2D uShapes;
uniform int uMark;
uniform float uScale, uClearFeather, uClearShape, uOrder, uClearPointer;
// Text order by rows: each word's first glyph index and length, and how many words there are (0 reads the charset as one stream).
uniform vec2 uWords[8];
uniform float uWordCount;
uniform vec4 uClear;
uniform vec4 uPulse[4];
uniform sampler2D uTapMap;
uniform float uTapOn;
uniform sampler2D uClearMap;
uniform float uClearMapOn, uClearBend;
uniform vec2 uClearTexel;
layout(location=0) out vec4 outInk;
layout(location=1) out vec4 outUnder;
// The cell's light for bloom: its ink weighted by its tone, empty where the cell is blank. Only kept when bloom is on.
layout(location=2) out vec4 outGlow;
${Ag(a)}
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
vec3 generated(vec2 uv,float aspect){
  vec2 p=(uv-.5)*vec2(aspect,1.)*uScale;
  if(uScene==1){
    float t=uTime*.08;
    vec2 q=vec2(fbm(p*1.6+t),fbm(p*1.6-t+3.1));
    return vec3(smoothstep(.28,.86,fbm(p*1.8+q*1.6+vec2(t*.6,-t*.4))));
  }
  if(uScene==2){
    float r=.36,d=length(p),a=uTime*.25;
    vec3 l=normalize(vec3(cos(a)*.8,.55,sin(a)*.6+.6));
    if(d<r){
      vec3 n=normalize(vec3(p.x,-p.y,sqrt(r*r-d*d)));
      float diffuse=max(dot(n,l),0.),rim=pow(1.-n.z,2.5);
      float lon=atan(n.x,n.z)+uTime*.35,lat=asin(clamp(n.y,-1.,1.));
      float bands=.5+.25*sin(lat*14.)+.25*sin(lon*6.);
      return vec3(clamp(diffuse*.85+rim*.5+bands*.12,0.,1.));
    }
    return vec3(exp(-pow((d-r)*9.,2.))*.35);
  }
  if(uScene==4){
    // Drift: a few broad lobes that wander slowly. Built for halftone, where large soft shapes read best.
    float t=uTime*.045;
    vec2 q=p*1.15;
    vec2 w=vec2(fbm(q*.7+vec2(t,-t*.7)),fbm(q*.7+vec2(4.3-t*.8,t+1.7)));
    float n=fbm(q+w*1.3+vec2(t*.4,t*.25));
    return vec3(smoothstep(.36,.74,n));
  }
  if(uScene==5){
    // Swell: three crossing swells, the second bent by the first, so crests roll diagonally instead of pooling.
    float t=uTime;
    float s=sin((dot(p,vec2(.94,.33))/.95-t/9.)*6.2831853);
    float c=sin((dot(p,vec2(.6,-.8))/.58-t/13.)*6.2831853+s*.9);
    float k=sin((dot(p,vec2(-.29,.96))/.36+t/17.)*6.2831853);
    return vec3(smoothstep(.3,.9,.5+.5*(s*.5+c*.35+k*.15)));
  }
  // The kit's background scenes. Each starts a little way in, so a reduced-motion still is already composed.
  float t=uTime+40.,px=uCell.y/uResolution.y*uScale;
  if(uScene==6){
    // Caustics: light focused by a moving water surface. Two layers of warped sine waves drift against each other; each draws
    // smooth filaments along its zero line, about a character wide. Where they cross the light lifts a little, never to a blot.
    float tt=t*.12,a=0.,b=0.;
    for(int l=0;l<2;l++){
      float f=float(l),sc=5.4+f*2.4;
      vec2 q=(l==0?p:mat2(.8,-.6,.6,.8)*p)*sc;
      q+=vec2(sin(q.y*.45+tt*(1.+f*.3)),cos(q.x*.4-tt*(.8+f*.4)))*1.3;
      float v=sin(q.x+1.4*sin(q.y*.7+tt))+sin(q.y*1.1+1.2*sin(q.x*.8-tt*1.3))*.9;
      float wv=max(fwidth(v),1e-4);
      float line=(1.-smoothstep(.2,1.5,abs(v)/wv))*(l==0?.78:.62)+exp(-abs(v)/(wv*5.))*.16;
      if(l==0)a=line;else b=line;
    }
    float pulse=.85+.15*sin(tt*3.+p.x*1.7-p.y*1.1);
    float light=max(a,b)+.3*min(a,b);
    return vec3(clamp(light*light*pulse,0.,.78));
  }
  if(uScene==7){
    // Contour: a slow terrain read as survey lines about a character wide at any size; every fifth is an index line.
    float tt=t*.02;
    vec2 q=p*1.15+vec2(tt,-tt*.6);
    float h=noise(q)*.62+noise(q*2.07+3.1)*.27+noise(q*4.3-tt+7.)*.11;
    h+=.08*sin(tt*2.+p.x*.8);
    float k=h*13.,w=max(fwidth(k),1e-4),d=abs(fract(k+.5)-.5)/w;
    float major=mod(floor(k+.5),5.)<.5?1.:0.;
    return vec3((1.-smoothstep(.35,1.25-major*.25,d))*mix(.55,1.,major));
  }
  if(uScene==8){
    // Aurora: three curtains at different distances hang from the top. Far ones sit higher and dimmer; the nearest is tallest
    // and brightest. Each folds slowly and is brightest along its lower hem, fading upward. The rays are set per character
    // column, so the curtains read as vertical strokes at any stage size, from a small card to a phone.
    float tt=t*.05,a=0.,cw=uCell.x/uResolution.x;
    float col=floor(uv.x/cw+.5);
    for(int n=0;n<3;n++){
      float f=float(n),near=f/2.;
      float x=p.x*(1.3-near*.4)+f*3.7;
      float hem=-.28+near*.3+.16*sin(x*1.3+tt*(.9+f*.25)+f*2.)+.045*sin(x*3.4-tt*1.5+f);
      float d=hem-p.y;
      float body=d>0.?exp(-d/(.14+near*.26))*(.45+.55*exp(-d/.03)):exp(-d*d/.0002);
      float fold=.5+.5*sin(x*2.1+tt*.9+f*1.7+.7*sin(x*.8-tt*.6));
      float ray=mix(hash(vec2(col,f*7.1)),noise(vec2(col*.18+f*9.,tt*.7+f)),.55);
      float layer=clamp(body*(.1+.9*fold*fold)*(.2+.8*ray)*(.4+near*.6)*4.2,0.,1.);
      a=1.-(1.-a)*(1.-layer);
    }
    return vec3(smoothstep(.12,.9,a));
  }
  if(uScene==9){
    // Ripple: still water. Drops land here and there, each a few rings that widen and fade; the pointer drops its own.
    float tone=0.,g=.72;
    vec2 q=p/g,id=floor(q);
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
      vec2 c=id+vec2(i,j),h=vec2(hash(c),hash(c+7.3));
      float period=5.+h.x*5.,age=fract(t*.3/period*4.+h.y);
      vec2 at=(c+.2+.6*h)*g;
      float d=length(p-at),r=age*.62;
      float rings=max(0.,cos((d-r)*34.))*exp(-pow((d-r)/.11,2.));
      tone+=rings*pow(1.-age,1.8)*smoothstep(0.,.06,age)*(.7+.3*h.x);
    }
    return vec3(clamp(tone*1.25,0.,1.));
  }
  if(uScene==10){
    // Halo: a slow breathing corona that frames the content, its rays turning. The ring fits the stage: wide on a desktop
    // hero, tall on a phone, so the whole halo stays on screen; the middle stays empty for a headline.
    vec2 r=vec2(min(.46,aspect*.4),min(.34,.36/max(aspect,.01)*.5+.2));
    vec2 e=p/r;
    float d=length(e),a=atan(e.y,e.x),tt=t*.07,k=min(r.x,r.y);
    float breathe=1.+.04*sin(tt*3.1);
    float rays=.5+.5*noise(vec2(a*3.2+tt,tt*.5))*(.6+.4*noise(vec2(a*7.-tt*1.2,3.+tt*.4)));
    float s=(d-breathe)*k;
    float rim=exp(-pow(s/.03,2.));
    float corona=exp(-max(0.,s)/(.1+.08*rays))*smoothstep(-.04,.015,s)*rays*smoothstep(.36,.12,s);
    return vec3(clamp(rim*(.55+.45*rays)+corona*.85,0.,1.));
  }
  if(uScene==11){
    // Interference: two ring grids from slowly orbiting centres. Where they cross, broad moire bands open and close.
    float tt=t*.05;
    vec2 a=vec2(-.3+.12*sin(tt),.07*cos(tt*1.3)),b=vec2(.3+.1*cos(tt*.8),-.06*sin(tt*1.1));
    float f=6.2831853/max(px*4.6,.004);
    float m=cos(length(p-a)*f)+cos(length(p-b)*f);
    return vec3(smoothstep(.7,2.,m));
  }
  if(uScene==12){
    // Mesh: four soft lights on slow Lissajous paths, a gradient mesh written in characters.
    float tt=t*.07,m=0.;
    for(int n=0;n<4;n++){
      float f=float(n)*1.7;
      vec2 c=vec2(.66*sin(tt*(.7+f*.13)+f),.34*cos(tt*(.9-f*.07)+f*1.3));
      float s=.3+.07*sin(tt+f);
      m+=exp(-dot(p-c,p-c)/(s*s))*(.8-float(n)*.1);
    }
    return vec3(smoothstep(.06,1.1,m));
  }
  if(uScene==13){
    // Cascade: streaks fall in three depths. Far ones are frequent, faint, short and slow; near ones rare, long, bright and
    // quick. Each has a bright head and a tail that fades behind it, and a column can carry two streaks at once.
    float tone=0.,cw=uCell.x/uResolution.x,ch=uCell.y/uResolution.y;
    float col=floor(uv.x/cw+.5);
    for(int n=0;n<3;n++){
      float f=float(n);
      for(int k=0;k<2;k++){
        float seed=f*13.1+float(k)*41.7,h=hash(vec2(col,seed));
        if(h<1.-(.5-f*.15))continue;
        float speed=(.045+f*.07)*(.75+.5*hash(vec2(col,seed+2.)));
        float tail=.12+f*.16,y=fract(t*speed+hash(vec2(col,seed+5.)))*(1.+tail*2.)-tail;
        float d=y-uv.y;
        if(d<0.||d>tail)continue;
        float head=d<ch*1.2?1.:0.;
        tone=max(tone,max(head*(.55+f*.22),pow(1.-d/tail,1.7)*(.28+f*.3)));
      }
    }
    return vec3(clamp(tone,0.,1.));
  }
  if(uScene==14){
    // Constellation: points wander in their own cells; neighbours close enough are linked by fine lines. Each point is a
    // bright core in a soft halo, so it reads at card size as well as full width.
    float g=.23,tt=t*.18;
    vec2 q=p/g,id=floor(q);
    vec2 pts[9];
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
      vec2 c=id+vec2(i,j);
      float h=hash(c),k=hash(c+3.7);
      pts[(j+1)*3+i+1]=c+.5+.36*vec2(sin(tt*(.6+h)+h*6.28),cos(tt*(.5+k)+k*6.28));
    }
    float line=0.,star=0.,lw=max(px/g,.02);
    for(int n=0;n<9;n++){
      vec2 e=q-pts[n];
      float d2=dot(e,e),tw=.8+.2*sin(tt*3.+float(n)*1.7);
      star=max(star,max(exp(-d2/(lw*lw*1.6)),.38*exp(-d2/(lw*lw*7.)))*tw);
      for(int m=n+1;m<9;m++){
        vec2 a=pts[n],ba=pts[m]-a;
        float len=length(ba);
        if(len>1.35)continue;
        float hh=clamp(dot(q-a,ba)/dot(ba,ba),0.,1.);
        float d=length(q-a-ba*hh);
        line=max(line,(1.-smoothstep(lw*.3,lw*.75,d))*smoothstep(1.35,.6,len)*.72);
      }
    }
    return vec3(clamp(max(line,star),0.,1.));
  }
  return vec3(0.);
}
// The source's brightness to the field's tone: levels, contrast and brightness, gamma, invert.
float transfer(float tone){
  vec2 levels=uLevelsFromMap>.5?texelFetch(uLevelMap,ivec2(0),0).rg:uLevels;
  tone=clamp((tone-levels.x)/max(levels.y-levels.x,.01),0.,1.);
  tone=clamp((tone-.5)*uContrast+.5+uBrightness,0.,1.);
  tone=pow(tone,1./uGamma);
  return uInvert>.5?1.-tone:tone;
}
// Hover scope: 1 where the pointer response may act. The map holds the source's soft subject coverage in alpha.
float hoverScope(vec2 uv){
  if(uScopeMode<.5||uScene!=0)return 1.;
  vec2 s=uv*uSourceMap.xy+uSourceMap.zw;
  vec4 scope=texture(uScope,clamp(s,0.,1.));
  // Red set: a source with no subject to key (measured on the GPU), where every scope acts everywhere.
  if(scope.r>.5)return 1.;
  float c=(s.x<0.||s.y<0.||s.x>1.||s.y>1.)?0.:scope.a;
  return uScopeMode<1.5?c:1.-c;
}
void main(){
  vec2 cell=floor(gl_FragCoord.xy);
  vec2 uv=(cell+.5)*uCell/uResolution;
  float aspect=uResolution.x/uResolution.y;
  float hs=hoverScope(uv);
  vec4 fluid=vec4(0.);
  // lift: signed tone change. The solver's flow brightens one side of each eddy and opens the other into gaps.
  float lift=0.,wake=0.,bend=1.,swirl=0.,speed=0.;
  if(uFluidOn>.5){
    vec4 raw=texture(uFluid,vec2(uv.x,1.-uv.y));
    if(uFluidMode>.5){
      vec2 v=raw.xy*uFluidTexel*vec2(aspect,1.)*hs;
      fluid=vec4(v,0.,1.);
      swirl=clamp(dot(v,vec2(.4,.65))*uGlow*.32,-.65,.65);
      speed=clamp(length(v)*uGlow*.055,0.,.38);
      bend=.4;
    } else {
      fluid=decodeFluid(raw);
      fluid.xyz*=hs;
      wake=clamp(fluid.z*uGlow,0.,1.);
      lift=wake*.55;
    }
  }
  vec2 drift=uDrift*.006*vec2(sin(uv.y*5.3+uTime*.6),cos(uv.x*4.1-uTime*.5));
  vec2 sampleAt=uv-vec2(fluid.x/aspect,-fluid.y)*uRefraction*bend+drift;
  float keep=0.;
  if(uClearMapOn>0.){
    // Text-shaped clear map: quiet right behind the content, and the field leans away from its edges so it flows round them.
    keep=texture(uClearMap,uv).r;
    vec2 t=uClearTexel*1.5;
    vec2 g=vec2(texture(uClearMap,uv+vec2(t.x,0.)).r-texture(uClearMap,uv-vec2(t.x,0.)).r,texture(uClearMap,uv+vec2(0.,t.y)).r-texture(uClearMap,uv-vec2(0.,t.y)).r);
    sampleAt+=g*vec2(1./aspect,1.)*uClearBend;
  }
  float spot=0.;
  if(uHoverMode==4||uHoverMode==5){
    vec2 d=(uv-uLight.xy)*vec2(aspect,1.);
    float q2=dot(d,d)/(uLightRadius*uLightRadius*2.2);
    // Loupe: flat-topped zoom with a soft rim. Reveal: a soft spot in the source's colours.
    if(uHoverMode==4) sampleAt-=(uv-uLight.xy)*exp(-q2*q2)*.45*uLight.z*min(1.,uLightGain*1.6)*hs;
    else spot=exp(-q2*1.6)*uLight.z*min(1.,uLightGain*1.6)*hs;
  }
  vec3 rgb,glow=vec3(0.);
  float sub[15];float subMean=-1.,subLo=0.,subHi=0.;
  if(uScene==0){
    vec2 s=sampleAt*uSourceMap.xy+uSourceMap.zw;
    bool inside=!(s.x<0.||s.y<0.||s.x>1.||s.y>1.);
    rgb=inside?textureLod(uSource,s,uLod).rgb:vec3(0.);
    if(uShapeOn>.5){
      vec2 cu=uCell/uResolution;
      subMean=0.;subLo=1.;subHi=0.;
      for(int j=0;j<5;j++)for(int i=0;i<3;i++){
        vec2 o=(vec2((float(i)+.5)/3.,(float(j)+.5)/5.)-.5)*cu,ss=(sampleAt+o)*uSourceMap.xy+uSourceMap.zw;
        float v=(ss.x<0.||ss.y<0.||ss.x>1.||ss.y>1.)?transfer(0.):transfer(dot(textureLod(uSource,ss,uShapeLod).rgb,vec3(.2126,.7152,.0722)));
        sub[j*3+i]=v;subMean+=v;subLo=min(subLo,v);subHi=max(subHi,v);
      }
      subMean/=15.;
    }
    if(uBackdrop>0.){
      vec2 b=(uv-vec2(fluid.x/aspect,-fluid.y)*uRefraction*bend*.5)*uSourceMap.xy+uSourceMap.zw;
      glow=(b.x<0.||b.y<0.||b.x>1.||b.y>1.)?vec3(0.):textureLod(uSource,b,uLod+3.).rgb*uBackdrop;
    }
  } else rgb=generated(sampleAt,aspect);
  float tone=transfer(dot(rgb,vec3(.2126,.7152,.0722)));
  // Shape sampling takes its tone from its parts, so the character's ink matches the cell's.
  if(subMean>=0.)tone=subMean;
  float flick=0.,trailFold=0.;
  // Reveal: under the spot the characters take the source's own colour and a little more ink.
  if(spot>0.)lift=spot*.22;
  if(uHoverMode==2){
    // Lantern: a soft light and its fading tail lift the characters they pass. Nothing moves the image.
    vec2 ap=vec2(aspect,1.),d=(uv-uLight.xy)*ap;
    float r2=uLightRadius*uLightRadius,glowL=uLight.z*exp(-dot(d,d)/r2);
    for(int i=0;i<12;i++){vec2 e=(uv-uTrail[i].xy)*ap;glowL+=uTrail[i].z*exp(-dot(e,e)/(r2*.55));}
    glowL=min(glowL,1.)*hs;
    float grain=fract(sin(dot(cell,vec2(12.9898,78.233)))*43758.5453);
    lift=glowL*uLightGain*(.7+.6*grain);
    wake=glowL*.4;
    // A few letters at the light's rim step up the ramp and back, as if being retyped.
    flick=uFlicker*step(.9,fract(grain*13.7+floor(uClock*7.+grain*5.)*.37))*glowL*(1.-glowL)*4.;
  }
  if(uHoverMode==3){
    // Trail: the studio's ink field, as a 16-bit density. Sparse marks fill in, dense marks open up.
    vec4 ink=texture(uTrailMap,uv);
    float density=(ink.r*65280.+ink.g*255.)/65535.*uTrailAmount;
    float t=clamp(density/.38,0.,1.);
    trailFold=t*t*(3.-2.*t)*hs;
  }
  if(uFluidMode>.5&&uHoverMode==1){
    // Dark ground: any motion lights the characters. Lit ground: the flow lights one side of each eddy and opens the other.
    // A little cell-to-cell grain keeps the lit area a shimmer of letters rather than a solid block.
    float grain=fract(sin(dot(cell,vec2(12.9898,78.233)))*43758.5453);
    lift=mix(abs(swirl)*.5+speed,swirl+speed*.35,smoothstep(.12,.55,tone))*(.65+.7*grain);
    wake=clamp(lift*1.6,0.,1.);
  }
  // The resting tone, before the pointer's response: a clear zone may quiet the one and keep part of the other.
  float calm=tone;
  tone=clamp(tone+lift,0.,1.);
  tone+=(1.-2.*tone)*trailFold;
  // Pulses: rings sent by the interface (field.pulse()), e.g. on a save or a notification.
  for(int i=0;i<4;i++){
    if(uPulse[i].w<=0.)continue;
    float dist=length((uv-uPulse[i].xy)*vec2(aspect,1.)),front=uPulse[i].z*.95;
    float ring=exp(-pow((dist-front)/.1,2.))*uPulse[i].w*exp(-uPulse[i].z*.85);
    tone=clamp(tone+ring*.85,0.,1.);
  }
  if(uTapOn>0.){
    // A surface tap: a signed lift (16 bits) and a glint, worked out on the CPU over the photo's own medium.
    vec4 tap=texture(uTapMap,uv);
    float lift=(tap.r*65280.+tap.g*255.)/65535.*2.-1.;
    tone=clamp(tone+(lift*1.25+tap.b)*uTapOn,0.,1.);
  }
  tone*=1.-uVignette*smoothstep(.35,1.05,length((uv-.5)*vec2(min(aspect,1.8),1.)*2.));
  if(uClearMapOn>0.)tone*=1.-uClearMapOn*smoothstep(0.,1.,keep);
  if(uClear.z>0.){
    // Clear zone: the field fades out around content so text above it stays readable.
    vec2 half_=uClear.zw*.5*vec2(aspect,1.),q=(uv-uClear.xy-uClear.zw*.5)*vec2(aspect,1.);
    float dz;
    if(uClearShape>.5){vec2 e=abs(q)-half_;dz=length(max(e,0.))+min(max(e.x,e.y),0.);}
    else dz=(length(q/max(half_,vec2(1e-4)))-1.)*min(half_.x,half_.y);
    float keepZone=smoothstep(0.,uClearFeather,dz);
    tone=calm*keepZone+(tone-calm)*mix(keepZone,1.,uClearPointer);
  }
  // Blend: a shade between two characters takes the upper one in the share of cells a 4x4 Bayer pattern gives it.
  float level=tone*(uCount-1.),upper=fract(level)>=.5?1.:0.;
  if(uBlend>.5&&tone>.02&&tone<.98){
    ivec2 q=ivec2(mod(gl_FragCoord.xy,4.));
    upper=fract(level)>(BAYER[q.y*4+q.x]+.5)/16.?1.:0.;
  }
  if(subMean>=0.&&uOrder<.5&&tone>.008){
    // Shape: among the characters near the cell's tone, the one whose ink in each part best matches the cell's parts after the
    // hovers' lift. Each glyph's ink is scaled to its place on the ramp, so shape decides among glyphs and the ramp keeps the tone.
    float n=uCount-1.,d=tone-subMean,best=1e9,c0=floor(tone*n+.5);
    upper=0.;
    level=c0;
    // A cell without an edge in it keeps the character its tone gives: shape only decides where there is shape to follow.
    if(subHi-subLo>=uShapeGate)for(int k=-6;k<=6;k++){
      float g=c0+float(k);
      if(abs(float(k))>uShapeWindow||g<1.||g>n)continue;
      float r=g/n,scale=r/max(texelFetch(uShapes,ivec2(15,int(g)),0).r,.004),e=0.;
      for(int i=0;i<15;i++){float q=clamp(sub[i]+d,0.,1.)-texelFetch(uShapes,ivec2(i,int(g)),0).r*scale;e+=q*q;}
      e=e/15.+uShapeTone*(tone-r)*(tone-r);
      if(e<best){best=e;level=g;}
    }
  }
  float index=min(uCount-1.,floor(level)+upper+(flick>.5&&tone>.02?1.:0.));
  if(uOrder>1.5){
    // Scatter order: each cell keeps one character picked from the charset by a hash of its place, and the tone sets how
    // strongly it shows rather than which character it is, so a field of letters brightens and fades like a lit screen.
    index=tone>.008?1.+min(uCount-2.,floor(hash(cell*.731+vec2(19.17,3.71))*(uCount-1.))):0.;
  } else if(uOrder>.5){
    // Text order: the charset after its blank is read in sequence along each row, each row a few letters on, so words stay
    // legible. Every letter is there; the tone sets how strongly it shows, so the words fade out toward the field's quiet edges.
    float n=max(1.,uCount-1.);
    index=tone>.015?1.+mod(cell.x+cell.y*(floor(n*.38)+1.),n):0.;
    if(uWordCount>.5&&tone>.015){
      // One word a row, repeated with a space between, rows taking the words in turn and each a few letters along.
      int k=int(mod(cell.y,uWordCount));
      vec2 word=uWords[0];
      for(int i=1;i<8;i++)if(i==k)word=uWords[i];
      float at=mod(cell.x+cell.y*3.,word.y+1.);
      index=at<word.y?word.x+at:0.;
    }
  }
  vec3 hue=rgb/max(max(rgb.r,rgb.g),max(rgb.b,.03));
  hue=mix(vec3(dot(hue,vec3(.2126,.7152,.0722))),hue,uSaturation);
  vec3 base=uRampCount>1.5?rampAt(tone):uInk;
  vec3 ink=mix(base*mix(1.,.3+.7*tone,uRampCount>1.5?0.:uShade),clamp(hue*(.38+.62*tone),0.,1.),uSourceColor);
  // Scatter, text and inlay carry the tone in the ink's strength, which the pixel pass reads back as opacity or tile shade.
  if(uOrder>1.5||(uOrder>.5&&uMark==0)||uMark==17)ink=mix(uInk,hue,uSourceColor)*tone;
  vec3 lifted=uHighlightAuto>.5?ink/max(max(ink.r,ink.g),max(ink.b,.06)):uHighlight;
  ink=mix(ink,lifted,wake*.7);
  if(spot>0.)ink=mix(ink,clamp(rgb/max(max(rgb.r,rgb.g),max(rgb.b,.08))*(.45+.55*tone),0.,1.),spot);
  float underAlpha=max(uBackground.a,min(1.,max(glow.r,max(glow.g,glow.b))));
  vec3 under=min(uBackground.rgb*uBackground.a+glow,vec3(underAlpha));
  // Glyphs keep their atlas index, exact in 8 bits; the other marks keep the tone, and empty where the charset is blank.
  outInk=vec4(ink,uMark==0||uMark==17?index/255.:uMark==1?(tone>.003?tone:0.):index>0.?max(tone,1./255.):0.);
  outUnder=vec4(under,underAlpha);
  // Highlights carry most of the light, as a lens blooms: the tone squared, so mid tones glow a little and shadows not at all.
  float lit=outInk.a>0.?tone*tone:0.;
  outGlow=vec4(ink*lit,lit);
}`)(i),n=S1(e);if(!n)return t;let r=(a,o,c,h=!1)=>{let u=a.indexOf(o);if(u<0||a.indexOf(o,u+1)>=0)throw new Error(`The cell pass lost its effect anchor: ${o}`);return h?a.slice(0,u)+c+a.slice(u):a.slice(0,u+o.length)+c+a.slice(u+o.length)},s=r(t,"void main(){",`${n.declarations}
`,!0);return s=r(s,"float aspect=uResolution.x/uResolution.y;",`
  vec2 pointer=uFxPointer.xy;float pointerOn=uFxPointer.z,motion=uFxPointer.w,time=uFxTime;
  vec3 fxInk=vec3(0.);float fxInkAmount=0.,fxGlyph=0.;`),s=r(s,`+drift;
`,`${n.displace}
`),s=r(s,"  tone*=1.-uVignette*",`${n.shade}
  tone=clamp(tone,0.,1.);
`,!0),s=r(s,"+(flick>.5&&tone>.02?1.:0.));",`
  if(tone>.008)index=clamp(index+floor(fxGlyph+.5),tone>.008?1.:0.,uCount-1.);`),s=r(s,"ink=mix(ink,lifted,wake*.7);",`
  ink=mix(ink,clamp(fxInk,0.,1.),clamp(fxInkAmount,0.,1.));`),s},E1=`#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uAtlas, uCells, uUnder;
uniform vec2 uResolution, uCell, uPitch;
uniform float uColumns, uDotScale, uSourceColor;
uniform vec2 uDir;
uniform int uMark;
// Inlay accents: share of tiles, letter shuffle span, a seed that steps a few times a second, charset length.
uniform vec4 uInlay;
// Line marks: pitch in cell heights, weight, the share of cells that sparkle.
uniform vec4 uLine;
uniform vec4 uFade;
// Finishing passes: bloom amount and radius in cells, scanlines, grain; chromatic split, curvature, time, rows per scanline pair.
uniform vec4 uPost, uPost2;
uniform sampler2D uGlow;
out vec4 outColor;
const float BAYER[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
uniform vec3 uRamp[6];
uniform float uRampCount;
// The gradient map: the tone run through the ramp's stops, evenly spaced, faintest first.
vec3 rampAt(float t){
  float x=clamp(t,0.,1.)*(uRampCount-1.);
  int i=int(min(floor(x),uRampCount-2.));
  vec3 a=uRamp[0],b=uRamp[1];
  for(int k=1;k<5;k++)if(k==i){a=uRamp[k];b=uRamp[k+1];}
  return mix(a,b,clamp(x-float(i),0.,1.));
}
// The Studio's print defaults: roughness .35, seed 7, registration .2 and its coral second ink. The screen angle is uDir (-35deg).
const float ROUGH=.35,SEED=7.;
const vec3 SECOND=vec3(.925,.404,.322);
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
// Coverage of a signed distance given in device pixels.
float cover(float d){return clamp(.5-d,0.,1.);}
float box(vec2 p,vec2 lo,vec2 hi){vec2 a=clamp(p-lo,0.,1.)*clamp(hi-p,0.,1.);return a.x*a.y;}
float disc(vec2 p,vec2 c,float r){return r>.05?cover(length(p-c)-r):0.;}
float ellipse(vec2 p,vec2 c,vec2 r,float a){vec2 d=p-c;d=vec2(cos(a)*d.x+sin(a)*d.y,-sin(a)*d.x+cos(a)*d.y);float k=length(d/r);return cover((k-1.)*min(r.x,r.y));}
// World-anchored parallel cuts across direction d: period and width in cell heights, so lines run on from cell to cell.
float cuts(vec2 w,vec2 d,float period,float width,float px){
  if(width<=0.)return 0.;
  float proj=dot(vec2(-d.y,d.x),w);
  return cover((abs(fract(proj/period+.5)-.5)*period-width*.5)*px);
}
// Lays an ink over what is already down, multiplying where they overlap, as transparent inks do on paper.
void lay(inout vec3 rgb,inout float a,vec3 c,float k){
  float next=a+k*(1.-a);
  rgb=next>0.?(rgb*a*(1.-k)+mix(c,rgb*c,a)*k)/next:c;
  a=next;
}
vec4 drawAt(vec2 frag){
  vec2 DIR=uDir;
  // The pitch is the atlas cell, or a fractional one under cellFit 'fill', where each glyph sits centred in its stretched cell.
  vec2 cell=floor(frag/uPitch);
  vec4 ink=texelFetch(uCells,ivec2(cell),0),under=texelFetch(uUnder,ivec2(cell),0);
  vec2 local=frag-cell*uPitch;
  float coverage;
  vec3 rgb=ink.rgb;
  // Scatter and inlay: the cell's strength, read back from its ink, and the ink itself at full strength.
  float strength=1.;
  if(uFade.w>.5){
    float top=max(rgb.r,max(rgb.g,rgb.b));
    strength=uSourceColor>.5?top:clamp(top/max(max(uFade.r,max(uFade.g,uFade.b)),.004),0.,1.);
    rgb=uSourceColor>.5?rgb/max(top,.004):uFade.rgb;
  }
  if(uMark==0||uMark==17){
    float index=floor(ink.a*255.+.5);
    // Inlay shuffle: every tiled cell takes a letter from the upper charset, traded for a neighbour a few times a second, so a
    // tiled body flickers through its letters rather than banding by tone; the tile's shade still carries the tone.
    float hs=hash(cell*.917+uInlay.z*1.37);
    if(uMark==17&&uInlay.y>0.&&index>0.&&(index>=uInlay.w*.62||strength>=.2))index=clamp(max(index,ceil(uInlay.w*.62)+1.)+floor((hs-.5)*(2.*uInlay.y+1.)),ceil(uInlay.w*.62),uInlay.w-1.);
    ivec2 tile=ivec2(int(mod(index,uColumns)),int(floor(index/uColumns)));
    vec2 texel=floor(local-floor((uPitch-uCell)*.5));
    coverage=all(greaterThanEqual(texel,vec2(0.)))&&all(lessThan(texel,uCell))?texelFetch(uAtlas,tile*ivec2(uCell)+ivec2(texel),0).a:0.;
    if(uMark==17){
      // Inlay: a gapped tile in the ink, lighter the denser the cell, with its character set into it in a darker shade. Faint
      // cells keep only the character, so a shape's edge frays into specks; empty cells show a hairline grid.
      vec2 p=local+.5;
      float gap=max(1.,floor(min(uPitch.x,uPitch.y)*.08+.5));
      float plate=index>0.?smoothstep(.2,.32,strength)*box(p,vec2(0.),uPitch-gap):0.;
      // Tile and letter are the ink at two strengths over whatever ground lies below, so the inlay reads on light and dark pages:
      // the tile strengthens with the tone and the letter is cut back toward the ground.
      float face=(.18+.8*smoothstep(.05,.8,strength))*plate;
      // With shuffle on, tiles also vary a little in shade, as worn inlay does.
      if(uInlay.y>0.)face*=.8+.34*hs;
      float speck=coverage*min(1.,strength*6.)*(1.-plate);
      float grid=index>0.?0.:(1.-box(p,vec2(0.),uPitch-1.))*.035;
      float a=mix(face,face*.22,coverage*plate)+speck;
      // Accents: a few lit tiles carry a coloured letter, a tinted tile or a white glint, picked afresh with the seed.
      float ha=hash(cell*1.31+uInlay.z*.71+vec2(7.3,1.9));
      if(plate>0.&&ha<uInlay.x){
        float pick=hash(cell+uInlay.z*2.11+vec2(3.1,8.7));
        vec3 hue=pick<.16?vec3(.86,.27,.27):pick<.3?vec3(.92,.55,.2):pick<.42?vec3(.9,.78,.25):pick<.58?vec3(.35,.72,.38):pick<.72?vec3(.3,.72,.8):pick<.84?vec3(.32,.42,.92):vec3(.66,.42,.86);
        float kind=ha/uInlay.x;
        if(kind<.55){float k=coverage*plate;rgb=mix(rgb,hue,k);a=mix(a,1.,k);}
        else if(kind<.88){rgb=mix(rgb,hue,.55);}
        else{float k=coverage*plate;rgb=mix(rgb,vec3(1.),1.-k);a=mix(max(a,.96),face*.3,k);}
      }
      coverage=a>0.?a:grid;
    } else coverage*=strength;
  } else if(uMark==1){
    // Halftone: dot area follows tone, so midtones read true; edges are antialiased to one device pixel.
    float r=sqrt(ink.a)*min(uPitch.x,uPitch.y)*.5*uDotScale;
    coverage=ink.a>.003?clamp(r-length(local-uPitch*.5)+.5,0.,1.):0.;
  } else if(ink.a<=0.){
    coverage=0.;
  } else {
    float tone=ink.a,side=min(uPitch.x,uPitch.y);
    vec2 q=local/uPitch,c=uPitch*.5,p=local+.5;
    // Tiles fade with the tone in one ink, as the Studio's do; in source colour the colour already carries it.
    float fade=uSourceColor>.5?1.:tone,gap=max(.5,uPitch.x*.06),grain=hash(cell+SEED);
    vec2 w=(cell+q)*uPitch/uPitch.y;
    if(uMark==2)coverage=fade;
    else if(uMark==3)coverage=box(p,vec2(0.),uPitch-gap)*fade;
    else if(uMark==4){
      // Lego: a gapped brick, lit from above, with a raised stud ringed by its shadow.
      coverage=box(p,vec2(0.),uPitch-gap)*fade;
      rgb*=1.06-.14*q.y;
      float r=side*.28,d=length(local-c)-r,lit=clamp(dot(c-local,vec2(.6,.8))/r,-1.,1.);
      rgb=mix(rgb,mix(rgb,vec3(1.),.2+.12*lit),cover(d));
      rgb=mix(rgb,rgb*.72,cover(abs(d)-max(.5,side*.04)));
    } else if(uMark==5){
      // Voxel: an isometric cube; top, left and right faces at full, .72 and .42 strength.
      float h=.5*abs(q.x-.5);
      coverage=cover(-min(q.y-h,1.-h-q.y)*uPitch.y)*cover(-min(q.x,1.-q.x)*uPitch.x);
      coverage*=mix(q.x<.5?.72:.42,1.,cover((q.y-(.5-h))*uPitch.y))*fade;
    } else if(uMark==6){
      // Disco: a gapped mirror tile, its upper facet catching light and its lower in shade.
      coverage=box(p,vec2(0.),uPitch-gap)*fade;
      rgb=q.y<.35?mix(rgb,vec3(1.),.1+grain*.25):q.y>.65?rgb*.75:rgb;
    } else if(uMark==18){
      // Tick: a printed glow. A smooth wash carries the light; over it every cell holds one short upright tick whose strength
      // steps through four levels by a 4x4 ordered threshold, so the mid tones read as a crisp dither of ticks that brightens
      // toward the light and melts into the wash at its core. With a ramp the wash runs through it and the ticks sit a step up.
      ivec2 b=ivec2(mod(cell,4.));
      float th=(BAYER[b.y*4+b.x]+.5)/16.;
      float tw=max(1.,floor(uPitch.x*.28+.5)),tl=max(2.,floor(uPitch.y*.46+.5));
      vec2 lo=floor(c-vec2(tw,tl)*.5);
      float bar=box(p,lo,lo+vec2(tw,tl));
      float lvl=clamp(floor(tone*4.+th)/4.,0.,1.);
      float melt=1.-smoothstep(.7,.96,tone);
      float at=bar*melt*(.42+.58*lvl);
      bool ramped=uRampCount>1.5&&uSourceColor<.5;
      float aw=ramped?pow(smoothstep(.08,.88,tone),1.4):tone*tone*.92;
      vec3 W=ramped?rampAt(tone):rgb,T=ramped?rampAt(min(1.,lvl+.38)):rgb;
      float a=at+aw*(1.-at);
      rgb=a>0.?(T*at+W*aw*(1.-at))/a:W;
      coverage=a;
    } else if(uMark==19){
      // Bayer: one gapped square a cell, on or off by a 4x4 ordered threshold at two strengths, so a picture steps through
      // empty, half and full squares in the brand's tones, as pixel-dithered art does.
      ivec2 b=ivec2(mod(cell,4.));
      float th=(BAYER[b.y*4+b.x]+.5)/16.,g=max(1.,floor(min(uPitch.x,uPitch.y)*(1.-uDotScale)+.5));
      float lvl=tone>.5+th*.5?1.:tone>th*.5?.5:0.;
      // An empty cell keeps a small faint square, so the ground reads as a dot grid that the picture fills.
      vec2 d=floor(c-max(1.,floor(min(uPitch.x,uPitch.y)*.3))*.5);
      coverage=lvl>0.?box(p,vec2(0.),uPitch-g)*lvl:box(p,d,d+max(1.,floor(min(uPitch.x,uPitch.y)*.3)))*.35;
    } else if(uMark==7){
      // Dither: an ordered 4x4 Bayer screen at about five dots a cell, lit where the cell's tone passes the threshold.
      ivec2 b=ivec2(mod(floor(frag/max(1.,floor(side/5.))),4.));
      coverage=tone>(BAYER[b.y*4+b.x]+.5)/16.?1.:0.;
    } else if(uMark==8){
      // Hex: a flat-topped hexagon filling the cell.
      vec2 h=abs((local-c)/(uPitch*.49));
      coverage=cover(max(h.y-.866,h.x*.866+h.y*.5-.866)*side*.49)*fade;
    } else if(uMark==9){
      // LED: a round lamp with a soft halo and a specular glint, separated by an unlit matrix.
      float r=side*.39,d=length(local-c);
      coverage=max(cover(d-r),.3*exp(-pow(max(0.,d-r)/(side*.12),2.)))*fade;
      rgb=mix(rgb,vec3(1.),.35*disc(local,uPitch*vec2(.43,.4),side*.11));
    } else if(uMark==10){
      // CMYK: the cell's hue separated into offset cyan, magenta and yellow dots, each sized by its share of the tone. The
      // key screen carries the neutral share in the ink's own lightness, since a light ink on a dark page has no black.
      float top=max(rgb.r,max(rgb.g,rgb.b)),low=min(rgb.r,min(rgb.g,rgb.b));
      vec3 cmy=(top-rgb)/max(top,.001);
      float a=0.;vec3 col=vec3(1.);
      lay(col,a,vec3(top),disc(local,c,side*.48*sqrt(tone*low/max(top,.001))));
      lay(col,a,vec3(0.,1.,1.),disc(local,uPitch*vec2(.36,.36),side*.48*sqrt(tone*cmy.x)));
      lay(col,a,vec3(1.,0.,1.),disc(local,uPitch*vec2(.64,.36),side*.48*sqrt(tone*cmy.y)));
      lay(col,a,vec3(1.,1.,0.),disc(local,uPitch*vec2(.5,.66),side*.48*sqrt(tone*cmy.z)));
      rgb=col;coverage=a;
    } else if(uMark==11||uMark==16){
      // Stipple and pointillism: four jittered marks a cell, their size following the tone.
      coverage=0.;vec3 col=rgb;
      for(int m=0;m<4;m++){
        vec2 o=vec2(float(m%2),float(m/2));
        float j=hash(cell*2.+o+SEED),jy=hash(cell+o*11.+SEED+1.);
        vec2 at=((o+.5)/2.+(vec2(j,jy)-.5)*ROUGH*.28)*uPitch;
        float r=min(min(min(at.x,uPitch.x-at.x),min(at.y,uPitch.y-at.y)),side*min(.245,.21*sqrt(tone)*(1.-ROUGH*j*.35)));
        float k=uMark==11?disc(local,at,r):ellipse(local,at,vec2(r,r*.64),j*3.14159);
        if(uMark==16&&k>coverage)col=uSourceColor>.5?clamp(rgb+(j-.5)*ROUGH*.25*vec3(1.,-.4,-1.),0.,1.):rgb*(1.+(j-.5)*ROUGH*.5);
        coverage=max(coverage,k);
      }
      rgb=col;
    } else if(uMark==12||uMark==13){
      // Engraving and crosshatch: parallel cuts whose weight follows the tone; crossings join only in the darker tones.
      float cv=tone*(1.-ROUGH*grain*.3),px=uPitch.y,P=uLine.x,W=uLine.y*.72*P;
      coverage=cuts(w,DIR,P,min(.94*P,W*cv),px);
      if(uMark==13){
        coverage=max(coverage,cuts(w,vec2(-DIR.y,DIR.x),P,min(.94*P,W*max(0.,cv*1.5-.3)),px)*step(.2,cv));
        coverage=max(coverage,cuts(w,normalize(DIR+vec2(-DIR.y,DIR.x)),P,min(.94*P,W*max(0.,cv*2.-1.2)),px)*step(.6,cv));
      }
      // Sparkle: now and then a lit cell catches a small bright square, picked afresh a few times a second.
      if(uLine.z>0.&&tone>.2&&hash(cell*1.7+uInlay.z*.53)<uLine.z){float sq=max(1.,floor(side*.3+.5));vec2 lo=floor(c-sq*.5);float k=box(p,lo,lo+sq);coverage=max(coverage,k);rgb=mix(rgb,vec3(1.),k*.6);}
    } else if(uMark==14){
      // Woodblock: broad carved bands in five stepped weights, their edges wavering along the grain.
      float cv=ceil(tone*(1.-ROUGH*grain*.3)*5.)/5.,width=min(.94,.72*cv);
      float proj=dot(vec2(-DIR.y,DIR.x),w),line=floor(proj+.5),along=dot(DIR,w);
      float cut=sin(along*5.3+line*1.9+SEED)*.5+sin(along*13.1+line)*.25;
      coverage=cover((abs(proj-line)-width*.5*(1.+ROUGH*cut*.5))*uPitch.y);
    } else if(uMark==15){
      // Risograph: two offset screens, the main ink and the coral second ink, misregistered along the screen angle.
      float split=uSourceColor>.5?clamp(.5+(rgb.r-rgb.b)*.5,0.,1.):.5,r=side*min(.48,.44*sqrt(tone));
      float a=0.;vec3 col=rgb;
      lay(col,a,rgb,disc(local,c,r*sqrt(.35+(1.-split)*.65)));
      lay(col,a,SECOND,disc(local,c+DIR*.2*.38*side,r*sqrt(.3+split*.7)*(1.-ROUGH*hash(cell+SEED+13.)*.3)));
      rgb=col;coverage=a;
    } else coverage=0.;
  }
  return vec4(rgb*coverage+under.rgb*(1.-coverage),coverage+under.a*(1.-coverage));
}
void main(){
  vec2 frag=vec2(gl_FragCoord.x,uResolution.y-gl_FragCoord.y);
  if(uPost2.y>0.){
    // Curvature: the picture bows outward as on a tube, normalised so its corners stay near the frame; outside it is empty.
    vec2 q=frag/uResolution-.5;
    float k=uPost2.y*.5;
    q=q*(1.+k*dot(q,q)*vec2(1.,1.))/(1.+k*.5);
    frag=(q+.5)*uResolution;
    if(frag.x<0.||frag.y<0.||frag.x>=uResolution.x||frag.y>=uResolution.y){outColor=vec4(0.);return;}
  }
  vec4 c=drawAt(frag);
  if(uPost2.x>0.){
    // Chromatic split: red and blue drawn a little apart, more toward the edges.
    vec2 q=frag/uResolution-.5,d=q*dot(q,q)*uPost2.x*uResolution.y*.08+normalize(q+1e-5)*uPost2.x*1.5;
    vec4 r=drawAt(clamp(frag+d,vec2(0.),uResolution-1.)),b=drawAt(clamp(frag-d,vec2(0.),uResolution-1.));
    c=vec4(r.r,c.g,b.b,max(c.a,max(r.a,b.a)));
  }
  if(uPost.x>0.){
    // Bloom: the cells' light, blurred through its mip chain at two radii, laid over in screen-like fashion.
    vec2 uv=frag/uPitch/vec2(textureSize(uGlow,0));
    float l=log2(max(uPost.y,.5));
    vec3 g=textureLod(uGlow,uv,l).rgb*.55+textureLod(uGlow,uv,l+1.5).rgb*.45;
    vec3 add=g*uPost.x;
    c.rgb=c.rgb+add*(1.-c.rgb*.5);
    c.a=max(c.a,min(1.,max(add.r,max(add.g,add.b))));
  }
  if(uPost.z>0.){
    // Scanlines: two thin dark bands a text row, as on a tube.
    float s=.5-.5*cos(frag.y*6.2831853*uPost2.w/uPitch.y);
    c.rgb*=1.-uPost.z*.45*s;
  }
  if(uPost.w>0.){
    // Film grain, new each frame, in the drawn light only so a transparent ground stays clear.
    float n=hash(floor(frag)+fract(uPost2.z*7.13)*vec2(91.7,37.3))-.5;
    c.rgb=clamp(c.rgb+n*uPost.w*.22*c.a,0.,1.);
  }
  outColor=c;
}`,ag=new Map;function Qf(i,e=!1){let t=`${i}${e?"p":""}`,n=ag.get(t);return n||(n=E1.replace("uniform int uMark;",`const int uMark=${i};`),e||(n=n.replace("uniform vec4 uPost, uPost2;","const vec4 uPost=vec4(0.), uPost2=vec4(0.,0.,0.,2.);")),ag.set(t,n)),n}var Hr=`#version 300 es
precision highp float;
precision highp sampler2D;
uniform vec2 uTexel;
out vec4 outColor;
vec2 here(){return gl_FragCoord.xy*uTexel;}
`,A1=Hr+`
uniform sampler2D uVelocity;
uniform vec2 uFrom, uTo, uForce;
uniform float uAspect, uRadius;
float segment(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.,1.);return length(pa-ba*h);}
void main(){
  vec2 uv=here(),scale=vec2(uAspect,1.);
  float d=segment(uv*scale,uFrom*scale,uTo*scale);
  outColor=vec4(texture(uVelocity,uv).xy+uForce*exp(-d*d/(uRadius*uRadius)),0.,1.);
}`,R1=Hr+`
uniform sampler2D uVelocity;
void main(){
  vec2 uv=here();
  float l=texture(uVelocity,uv-vec2(uTexel.x,0.)).y,r=texture(uVelocity,uv+vec2(uTexel.x,0.)).y;
  float t=texture(uVelocity,uv+vec2(0.,uTexel.y)).x,b=texture(uVelocity,uv-vec2(0.,uTexel.y)).x;
  outColor=vec4(.5*(r-l-t+b),0.,0.,1.);
}`,C1=Hr+`
uniform sampler2D uVelocity, uCurl;
uniform float uStrength, uDt;
void main(){
  vec2 uv=here();
  float l=texture(uCurl,uv-vec2(uTexel.x,0.)).x,r=texture(uCurl,uv+vec2(uTexel.x,0.)).x;
  float t=texture(uCurl,uv+vec2(0.,uTexel.y)).x,b=texture(uCurl,uv-vec2(0.,uTexel.y)).x,c=texture(uCurl,uv).x;
  vec2 force=.5*vec2(abs(t)-abs(b),abs(r)-abs(l));
  force=force/(length(force)+1e-4)*uStrength*c;
  force.y=-force.y;
  outColor=vec4(clamp(texture(uVelocity,uv).xy+force*uDt,-1000.,1000.),0.,1.);
}`,P1=Hr+`
uniform sampler2D uVelocity;
void main(){
  vec2 uv=here(),c=texture(uVelocity,uv).xy;
  float l=texture(uVelocity,uv-vec2(uTexel.x,0.)).x,r=texture(uVelocity,uv+vec2(uTexel.x,0.)).x;
  float t=texture(uVelocity,uv+vec2(0.,uTexel.y)).y,b=texture(uVelocity,uv-vec2(0.,uTexel.y)).y;
  if(uv.x-uTexel.x<0.)l=-c.x;
  if(uv.x+uTexel.x>1.)r=-c.x;
  if(uv.y+uTexel.y>1.)t=-c.y;
  if(uv.y-uTexel.y<0.)b=-c.y;
  outColor=vec4(.5*(r-l+t-b),0.,0.,1.);
}`,I1=Hr+`
uniform sampler2D uSource;
uniform float uAmount;
void main(){outColor=vec4(texture(uSource,here()).x*uAmount,0.,0.,1.);}`,F1=Hr+`
uniform sampler2D uPressure, uDivergence;
void main(){
  vec2 uv=here();
  float l=texture(uPressure,uv-vec2(uTexel.x,0.)).x,r=texture(uPressure,uv+vec2(uTexel.x,0.)).x;
  float t=texture(uPressure,uv+vec2(0.,uTexel.y)).x,b=texture(uPressure,uv-vec2(0.,uTexel.y)).x;
  outColor=vec4((l+r+b+t-texture(uDivergence,uv).x)*.25,0.,0.,1.);
}`,L1=Hr+`
uniform sampler2D uPressure, uVelocity;
void main(){
  vec2 uv=here();
  float l=texture(uPressure,uv-vec2(uTexel.x,0.)).x,r=texture(uPressure,uv+vec2(uTexel.x,0.)).x;
  float t=texture(uPressure,uv+vec2(0.,uTexel.y)).x,b=texture(uPressure,uv-vec2(0.,uTexel.y)).x;
  outColor=vec4(texture(uVelocity,uv).xy-vec2(r-l,t-b),0.,1.);
}`,D1=Hr+`
uniform sampler2D uVelocity;
uniform float uDt, uDissipation;
void main(){
  vec2 uv=here();
  vec2 back=uv-uDt*texture(uVelocity,uv).xy*uTexel;
  outColor=vec4(texture(uVelocity,back).xy/(1.+uDissipation*uDt),0.,1.);
}`;function Vf(i,e,t){let n=0;for(;Math.max(i>>n,e>>n)>t&&i>>n+1>=1&&e>>n+1>=1;)n++;return{level:n,width:Math.max(1,i>>n),height:Math.max(1,e>>n)}}var Cg=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uSource;
uniform int uLevel;
float lum(vec3 c){ return dot(c,vec3(.2126,.7152,.0722)); }
`,k1=`${Cg}
uniform ivec2 uSize;
out vec4 o;
void main(){
  int ring=max(1,int(floor(float(min(uSize.x,uSize.y))*.03+.5)));
  float clear=0.,sum=0.,square=0.,count=0.;
  for(int y=0;y<128;y++){
    if(y>=uSize.y)break;
    for(int x=0;x<128;x++){
      if(x>=uSize.x)break;
      vec4 c=texelFetch(uSource,ivec2(x,y),uLevel);
      if(c.a*255.<249.5)clear+=1.;
      if(x>=ring&&y>=ring&&x<uSize.x-ring&&y<uSize.y-ring)continue;
      float l=lum(c.rgb);sum+=l;square+=l*l;count+=1.;
    }
  }
  float ground=sum/max(1.,count);
  o=vec4(clear/float(uSize.x*uSize.y),ground,sqrt(max(0.,square/max(1.,count)-ground*ground)),1.);
}`,U1=`${Cg}
uniform sampler2D uStats;
out vec4 o;
void main(){
  vec4 stats=texelFetch(uStats,ivec2(0),0);
  vec4 c=texelFetch(uSource,ivec2(gl_FragCoord.xy),uLevel);
  if(stats.x>.01){o=vec4(0.,0.,0.,c.a);return;}
  if(stats.z>=.07){o=vec4(1.,0.,0.,1.);return;}
  float t=clamp((abs(lum(c.rgb)-stats.y)-.035)/.12,0.,1.);
  o=vec4(0.,0.,0.,t*t*(3.-2.*t));
}`,Wf=new WeakMap,pa=new Set,og=new Set,Br=0,ed=0,lg=null,eh=120,Pg=new Float64Array(eh),ma=0,Ig=(i=ma)=>{let e=Math.min(i,ma),t=new Array(e);for(let n=0;n<e;n++)t[n]=Pg[(Ro-e+n)%eh];return t},fa=0,Ro=0,Ao=1,Gc=0,cg=0;function N1(i){Br=0,fa&&i>fa&&(Pg[Ro%eh]=i-fa,Ro++,ma<eh&&ma++),fa=i,ed=performance.now();let e=pa;pa=og,og=e;for(let n of e)try{n(i)}catch(r){typeof console<"u"&&console.error(r)}e.clear(),mr?.endFrame(i);let t=performance.now()-ed;if(Gc=.9*Gc+.1*t,i-cg>500){cg=i;let n=Fg(),r=!!mr?.overloaded;(Gc>.5*n||r)&&Ao<3?Ao++:Gc<.2*n&&!r&&Ao>1&&Ao--}pa.size||(fa=0)}var O1=()=>Ao;function th(i){pa.add(i),Br&&lg!==requestAnimationFrame&&(Br=0),Br||(lg=requestAnimationFrame,Br=requestAnimationFrame(N1))}function nh(i){pa.delete(i),!pa.size&&Br&&(cancelAnimationFrame(Br),Br=0,fa=0)}var hg=1e3/60,ug=-1/0;function Fg(){if(ma<20)return 1e3/60;if(Ro-ug<15)return hg;ug=Ro;let i=Ig().sort((e,t)=>e-t);return hg=Math.min(1e3/60,Math.max(1e3/360,i[Math.floor(.2*i.length)]))}var Co=new Set,td=new Set,nd=new Set,id=new Set,rd=new Set,Xf=!1,fg=null,Hc=null,Vc=null,yo=null,dg=i=>{let e=null;for(let t of Co){if(t.target===window){(!t.near||t.near()||t.inside)&&t.move(i);continue}e??(e=i.composedPath()),e.includes(t.target)?(t.inside=!0,t.move(i)):t.inside&&(t.inside=!1,t.leave())}},B1=()=>{for(let i of Co)i.inside=!1,i.leave()},z1=()=>{for(let i of[...td])i()},G1=()=>{for(let i of[...nd])i()},pg=()=>{for(let i of[...id])i()},H1=i=>{for(let e of[...rd])e(i)};function mg(){let i=Co.size+td.size+nd.size+id.size+rd.size>0;if(typeof document>"u"||(fg!==document&&(Xf=!1,fg=document,Hc=Vc=null,yo=null),i===Xf))return;Xf=i;let e=i?"addEventListener":"removeEventListener";if(typeof window<"u"&&(window[e]?.("pointermove",dg,{capture:!0,passive:!0}),window[e]?.("pointerdown",dg,{capture:!0,passive:!0})),document[e]?.("pointerleave",B1),document[e]?.("visibilitychange",z1),(typeof document>"u"?void 0:document.fonts)?.[e]?.("loadingdone",H1),Hc??(Hc=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null),Vc??(Vc=typeof matchMedia=="function"?matchMedia("(prefers-color-scheme: dark)"):null),Hc?.[e]?.("change",G1),Vc?.[e]?.("change",pg),i){yo??(yo=typeof MutationObserver=="function"?new MutationObserver(pg):null);for(let t of[document.documentElement,document.body])t&&yo?.observe(t,{attributes:!0,attributeFilter:["class","data-theme","data-mode","style"]})}else yo?.disconnect()}var ga=(i,e)=>(i.add(e),mg(),()=>{i.delete(e)&&mg()});function V1(i){let e=i.target;if(typeof window>"u"||e===window||typeof document>"u")return ga(Co,i);let t=e,n=t.getRootNode?.();if(t.ownerDocument===document&&(!n||n===document))return ga(Co,i);let r=i.move,s=()=>i.leave();return t.addEventListener("pointermove",r,{passive:!0}),t.addEventListener("pointerdown",r,{passive:!0}),t.addEventListener("pointerleave",s),()=>{t.removeEventListener("pointermove",r),t.removeEventListener("pointerdown",r),t.removeEventListener("pointerleave",s)}}var Lg=i=>ga(td,i),Dg=i=>ga(nd,i),sd=i=>ga(id,i),_o=new Map,ha=null,qf=new Map,kg=i=>e=>{for(let t of e)for(let n of[...i.get(t.target)??[]])n(t)},Ug=(i,e,t)=>{let n=i.get(e);return n?(n.add(t),!1):(i.set(e,new Set([t])),!0)},Ng=(i,e,t)=>{let n=i.get(e);return!(!n?.delete(t)||n.size)&&(i.delete(e),!0)};function Zc(i,e){return typeof ResizeObserver!="function"?()=>{}:(ha??(ha=new ResizeObserver(kg(_o))),Ug(_o,i,e)?ha.observe(i):queueMicrotask(()=>{_o.get(i)?.has(e)&&e({target:i})}),()=>{Ng(_o,i,e)&&ha?.unobserve(i),_o.size||(ha?.disconnect(),ha=null)})}function Og(i,e,t){if(typeof IntersectionObserver!="function")return()=>{};let n=qf.get(e);if(!n){let a=new Map;n={observer:new IntersectionObserver(kg(a),{rootMargin:e}),watch:a},qf.set(e,n)}let{observer:r,watch:s}=n;return Ug(s,i,t)||r.unobserve(i),r.observe(i),()=>{Ng(s,i,t)&&r.unobserve(i),s.size||(r.disconnect(),qf.delete(e))}}var gg=new WeakMap;function Bg(i){let e=gg.get(i);if(e)return e;let t={activeTexture:i.activeTexture.bind(i),bindTexture:i.bindTexture.bind(i),deleteTexture:i.deleteTexture.bind(i),useProgram:i.useProgram.bind(i),deleteProgram:i.deleteProgram.bind(i),bindFramebuffer:i.bindFramebuffer.bind(i),deleteFramebuffer:i.deleteFramebuffer.bind(i),viewport:i.viewport.bind(i),pixelStorei:i.pixelStorei.bind(i)},n=i.TEXTURE0,r=i.TEXTURE_2D,s=i.FRAMEBUFFER,a=[],o,c,h=-1,u="",f=new Map,d=()=>{a.length=0,h=-1,o=void 0,c=void 0,u="",f.clear()},p=i;return p.activeTexture=m=>{let x=m-n;x!==h&&(h=x,t.activeTexture(m))},p.bindTexture=(m,x)=>{if(m===r&&h>=0){if(a[h]===x)return;a[h]=x}else m===r&&(a.length=0);t.bindTexture(m,x)},p.deleteTexture=m=>{for(let x=0;x<a.length;x++)a[x]===m&&(a[x]=void 0);t.deleteTexture(m)},p.useProgram=m=>{m!==o&&(o=m,t.useProgram(m))},p.deleteProgram=m=>{m===o&&(o=void 0),t.deleteProgram(m)},p.bindFramebuffer=(m,x)=>{if(m===s){if(x===c)return;c=x}else c=void 0;t.bindFramebuffer(m,x)},p.deleteFramebuffer=m=>{m===c&&(c=void 0),t.deleteFramebuffer(m)},p.pixelStorei=(m,x)=>{f.get(m)!==x&&(f.set(m,x),t.pixelStorei(m,x))},p.viewport=(m,x,g,l)=>{let w=`${m},${x},${g},${l}`;w!==u&&(u=w,t.viewport(m,x,g,l))},gg.set(i,d),d}var W1=268435456,Wc=[1,.85,.7,.58,.5],zg=class{constructor(i,e){this.gl=i,this.onChange=e,this.level=0,this.overloaded=!1,this.queries=[],this.open=null,this.drew=!1,this.gpuMs=[],this.cpuMs=[],this.changedAt=0,this.checkedAt=-1/0,this.frameNo=0,this.timer=i.getExtension("EXT_disjoint_timer_query_webgl2")}begin(){if(!this.drew&&(this.drew=!0,this.timer&&!this.open&&this.queries.length<4&&!(7&this.frameNo++))){let i=this.gl.createQuery();i&&(this.gl.beginQuery(this.timer.TIME_ELAPSED_EXT,i),this.open=i)}}end(i,e){let t=this.gl,n=this.timer;if(this.drew&&(this.cpuMs.push(e),this.cpuMs.length>60&&this.cpuMs.shift(),n&&this.open&&(t.endQuery(n.TIME_ELAPSED_EXT),this.queries.push({query:this.open,frame:i}),this.open=null)),this.drew=!1,n&&this.queries.length&&t.getQueryParameter(this.queries[0].query,t.QUERY_RESULT_AVAILABLE)){let r=t.getParameter(n.GPU_DISJOINT_EXT);for(;this.queries.length&&t.getQueryParameter(this.queries[0].query,t.QUERY_RESULT_AVAILABLE);){let{query:s}=this.queries.shift();r||(this.gpuMs.push(t.getQueryParameter(s,t.QUERY_RESULT)/1e6),this.gpuMs.length>60&&this.gpuMs.shift()),t.deleteQuery(s)}}this.adapt(i)}skip(){this.drew=!1}reset(){this.queries=[],this.open=null,this.gpuMs=[],this.cpuMs=[]}adapt(i){if(i-this.checkedAt<250)return;this.checkedAt=i;let e=Fg(),t=this.gpuMs.length>=5&&Math.min(...this.gpuMs.slice(-5))>1.5*e,n=this.gpuMs.length>=10||t?this.gpuMs:null,r;if(n)r=n.slice().sort((a,o)=>a-o)[Math.floor(.75*n.length)]/e;else{if(ma<30||this.cpuMs.length<10)return;let a=Ig(30).sort((c,h)=>c-h),o=this.cpuMs.slice().sort((c,h)=>c-h)[this.cpuMs.length>>1];r=a[Math.floor(.75*a.length)]/e>1.6&&o<.5*e?1:.5}if(this.overloaded=r>.8&&this.atMinimum,i-this.changedAt<(r>.8?800:4e3))return;let s=this.level;r>2?s=Wc.length-1:r>.8&&s<Wc.length-1?s++:r<.3&&s>0&&s--,s!==this.level&&(this.level=s,this.changedAt=i,this.gpuMs=[],this.cpuMs=[],this.onChange())}get scale(){return Wc[this.level]}get atMinimum(){return this.level===Wc.length-1}},X1=class{constructor(){this.lost=!1,this.programs=new Map,this.atlases=new Map,this.vertex=null,this.vao=null,this.clients=new Set,this.parallel=null,this.lostTimer=0,this.renderer="",this.forgetState=()=>{},this.onLost=i=>{i.preventDefault(),this.lost=!0,this.forgetState(),this.reset();for(let e of[...this.clients])e.lost();clearTimeout(this.lostTimer),this.lostTimer=setTimeout(()=>{if(this.lost){this.canvas.removeEventListener?.("webglcontextlost",this.onLost),this.canvas.removeEventListener?.("webglcontextrestored",this.onRestored);try{this.create()}catch{return}this.restored()}},1e3)},this.onRestored=()=>{clearTimeout(this.lostTimer),this.lost=!1,this.forgetState(),this.restored()},this.idleTimer=0,this.create()}create(){let i=null,e=null,t={alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!0,powerPreference:"high-performance"};if(typeof document<"u"&&(i=document.createElement("canvas"),e=i.getContext("webgl2",t)),!e&&typeof OffscreenCanvas=="function")try{i=new OffscreenCanvas(1,1),e=i.getContext("webgl2",t)}catch{e=null}if(!e||!i)throw new Error("WebGL2 is not available for the glyph field.");this.canvas=i,this.gl=e,this.forgetState=Bg(e),this.lost=!1,i.width=i.height=1,this.parallel=e.getExtension("KHR_parallel_shader_compile");let n=this.frames?.level??0;this.frames=new zg(e,()=>{for(let a of[...this.clients])a.rescale()}),this.frames.level=n;let r=e.getExtension("WEBGL_debug_renderer_info");this.renderer=String(e.getParameter(r?r.UNMASKED_RENDERER_WEBGL:e.RENDERER)??""),i.addEventListener?.("webglcontextlost",this.onLost),i.addEventListener?.("webglcontextrestored",this.onRestored);let s=!e.getExtension("EXT_color_buffer_float")&&!e.getExtension("EXT_color_buffer_half_float");this.program(Rg(s)),this.program(Qf(0))}restored(){for(let i of[...this.clients])i.restored()}reset(){this.programs.clear(),this.atlases.clear(),this.vertex=null,this.vao=null,this.frames.reset()}join(i){this.clients.add(i),clearTimeout(this.idleTimer)}leave(i){this.clients.delete(i),this.clients.size?this.fit():(this.lost||(this.canvas.width=this.canvas.height=1,this.frames.level=0),clearTimeout(this.idleTimer),this.idleTimer=setTimeout(()=>{this.clients.size||this.dispose()},3e3))}dispose(){if(clearTimeout(this.lostTimer),this.canvas.removeEventListener?.("webglcontextlost",this.onLost),this.canvas.removeEventListener?.("webglcontextrestored",this.onRestored),!this.lost)try{this.gl.getExtension("WEBGL_lose_context")?.loseContext()}catch{}this.reset(),mr===this&&(mr=null)}program(i){let e=this.programs.get(i);if(e)return e;let t=this.gl,n=(o,c)=>{let h=t.createShader(o);return t.shaderSource(h,c),t.compileShader(h),h};this.vertex??(this.vertex=n(t.VERTEX_SHADER,`#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}`));let r=t.createProgram(),s=n(t.FRAGMENT_SHADER,i);t.attachShader(r,this.vertex),t.attachShader(r,s),t.linkProgram(r);let a={program:r,locations:null,fragment:s};return this.programs.set(i,a),a}linked(i,e=!1){if(i.locations)return!0;let t=this.gl;if(!e&&this.parallel&&!t.getProgramParameter(i.program,this.parallel.COMPLETION_STATUS_KHR))return!1;if(!t.getProgramParameter(i.program,t.LINK_STATUS)){if(t.isContextLost())return!1;throw new Error(i.fragment&&t.getShaderInfoLog(i.fragment)||t.getProgramInfoLog(i.program)||"Glyph field program failed to link.")}let n={};for(let r=t.getProgramParameter(i.program,t.ACTIVE_UNIFORMS)-1;r>=0;r--){let s=t.getActiveUniform(i.program,r).name.replace(/\[0\]$/,"");n[s]=t.getUniformLocation(i.program,s)}return i.locations=n,!0}get canCompileInParallel(){return!!this.parallel}vertexArray(){return this.vao??(this.vao=this.gl.createVertexArray())}atlas(i,e,t){let n=this.atlases.get(i);if(n)n.refs||(this.atlases.delete(i),this.atlases.set(i,n));else{let r=this.gl,s=r.createTexture();r.bindTexture(r.TEXTURE_2D,s);for(let[a,o]of[[r.TEXTURE_MIN_FILTER,r.NEAREST],[r.TEXTURE_MAG_FILTER,r.NEAREST],[r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE],[r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE]])r.texParameteri(r.TEXTURE_2D,a,o);n={key:i,texture:s,refs:0,final:!1,users:new Set,bytes:0},this.atlases.set(i,n),this.paintAtlas(n,e)}return n.refs++,n.users.add(t),n}hasAtlas(i){return this.atlases.has(i)}paintAtlas(i,e){let t=this.gl,{image:n,final:r}=e();t.bindTexture(t.TEXTURE_2D,i.texture),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!1),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,t.RGBA,t.UNSIGNED_BYTE,n),i.bytes=n.width*n.height*4,i.final=r;for(let s of[...i.users])s()}releaseAtlas(i,e){i&&i.users.delete(e)&&(--i.refs>0||this.evictAtlases())}evictAtlases(){let i=[...this.atlases.values()].filter(t=>!t.refs),e=i.length-32;for(let t of i){if(e<=0&&!this.overBudget)break;e--,this.atlases.delete(t.key),this.lost||this.gl.deleteTexture(t.texture)}}fit(){if(this.lost)return;let i=1,e=1;for(let r of this.clients){let[s,a]=r.size();i=Math.max(i,s),e=Math.max(e,a)}let t=this.canvas,n=r=>256*Math.ceil(r/256);t.width*t.height>n(i)*n(e)*2&&(t.width=n(i),t.height=n(e))}get bytes(){let i=this.canvas.width*this.canvas.height*4*2;for(let e of this.clients)i+=e.bytes();for(let e of this.atlases.values())i+=e.bytes;return i}get overBudget(){return this.bytes>W1}get roomy(){return this.bytes<2281701376e-1}begin(i,e){let t=this.canvas;if(t.width<i||t.height<e){let n=r=>256*Math.ceil(r/256);t.width=Math.max(t.width,n(i)),t.height=Math.max(t.height,n(e))}this.frames.begin()}present(i,e,t){i.globalCompositeOperation="copy",i.imageSmoothingEnabled=!1,i.drawImage(this.canvas,0,this.canvas.height-t,e,t,0,0,e,t)}endFrame(i){this.lost?this.frames.skip():this.frames.end(i,performance.now()-ed)}get level(){return this.frames.level}get overloaded(){return this.frames.overloaded}get scale(){return this.frames.scale}get atMinimum(){return this.frames.atMinimum}},mr=null,xg=!1;function ad(){if(mr||xg)return mr;try{mr=new X1}catch{xg=!0}return mr}var Gg=()=>mr,Hg=new WeakSet,Vg=i=>Hg.has(i),q1=/^[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]|^[\u{20000}-\u{3fffd}]/u,Wg=i=>q1.test(i),j1=class{constructor(i,e,t){this.previous=null,this.peak=0,this.width=i,this.height=e,this.span=t??Math.min(i,e);let n=i*e;this.pixels=new Uint8Array(4*n),this.signal=new Float32Array(n),this.offsetX=new Float32Array(n),this.offsetY=new Float32Array(n),this.driftX=new Float32Array(n),this.driftY=new Float32Array(n),this.u=new Float32Array(n),this.v=new Float32Array(n),this.ink=new Float32Array(n),this.a=new Float32Array(n),this.b=new Float32Array(n),this.c=new Float32Array(n),this.pressure=new Float32Array(n),this.pressureNext=new Float32Array(n),this.divergence=new Float32Array(n),this.curl=new Float32Array(n)}get active(){return this.peak>2e-4}clear(){for(let i of[this.u,this.v,this.ink,this.a,this.b,this.c,this.pressure,this.pressureNext,this.divergence,this.curl,this.signal,this.pixels,this.offsetX,this.offsetY,this.driftX,this.driftY])i.fill(0);this.previous=null,this.peak=0}leave(){this.previous=null}move(i,e,t,n=performance.now()){if(!Number.isFinite(i+e+t+n))return;i=Math.max(0,Math.min(1,i)),e=Math.max(0,Math.min(1,e)),t=Math.max(.1,Math.min(1,t));let r=this.previous;if(this.previous={x:i,y:e,time:n},!r)return;let s=(i-r.x)*(this.width-1),a=(e-r.y)*(this.height-1),o=Math.hypot(s,a);if(o<.001)return;let c=this.span,h=n>r.time?Math.max(1/240,(n-r.time)/1e3):1/60,u=Math.min(12,o/c/h),f=1-Math.exp(-u/2.2),d=c*(.022+.075*t)*(.65+.95*f),p=Math.min(128,Math.max(1,Math.ceil(o/(.4*d)))),m=o/d*(.32+.22*f)/p,x=s/o,g=a/o,l=-g,w=x,T=o*(2+18*f)/p;for(let y=0;y<p;y++){let E=(y+.5)/p,R=(r.x+(i-r.x)*E)*(this.width-1),P=(r.y+(e-r.y)*E)*(this.height-1),B=Math.max(1,Math.floor(R-3*d)),M=Math.min(this.width-2,Math.ceil(R+3*d)),_=Math.max(1,Math.floor(P-3*d)),F=Math.min(this.height-2,Math.ceil(P+3*d));for(let z=_;z<=F;z++)for(let L=B;L<=M;L++){let D=((L-R)*x+(z-P)*g)/d,H=((L-R)*l+(z-P)*w)/d,Y=Math.exp(-D*D*.65-H*H*1.7),G=z*this.width+L;this.ink[G]=1-(1-this.ink[G])*Math.exp(-Y*m);let re=1-H*H*.55,fe=D*H*.7;this.u[G]=Math.max(-80,Math.min(80,this.u[G]+(x*re+l*fe)*Y*T)),this.v[G]=Math.max(-80,Math.min(80,this.v[G]+(g*re+w*fe)*Y*T))}}this.peak=1}read(i,e,t){let n=0|(e=Math.max(.5,Math.min(this.width-1.5,e))),r=0|(t=Math.max(.5,Math.min(this.height-1.5,t))),s=e-n,a=t-r,o=r*this.width+n;return(i[o]*(1-s)+i[o+1]*s)*(1-a)+(i[o+this.width]*(1-s)+i[o+this.width+1]*s)*a}sample(i,e){return this.read(this.signal,i*(this.width-1),e*(this.height-1))}displacement(i,e,t){t[0]=this.read(this.offsetX,i*(this.width-1),e*(this.height-1)),t[1]=this.read(this.offsetY,i*(this.width-1),e*(this.height-1))}step(i){if(!this.active||!Number.isFinite(i))return;let e=Math.max(0,Math.min(.05,i)),t=this.width,n=this.height;for(;e>1e-7;){let r=Math.min(.016666666666666666,e);e-=r;let s=Math.exp(-1.9*r),a=Math.exp(-3.2*r);for(let c=1;c<n-1;c++)for(let h=1;h<t-1;h++){let u=c*t+h,f=Math.max(.5,Math.min(t-1.5,h-this.u[u]*r)),d=Math.max(.5,Math.min(n-1.5,c-this.v[u]*r)),p=0|f,m=0|d,x=f-p,g=d-m,l=m*t+p,w=(1-x)*(1-g),T=x*(1-g),y=(1-x)*g,E=x*g;this.a[u]=(this.u[l]*w+this.u[l+1]*T+this.u[l+t]*y+this.u[l+t+1]*E)*s,this.b[u]=(this.v[l]*w+this.v[l+1]*T+this.v[l+t]*y+this.v[l+t+1]*E)*s,this.c[u]=(this.ink[l]*w+this.ink[l+1]*T+this.ink[l+t]*y+this.ink[l+t+1]*E)*a}[this.u,this.a]=[this.a,this.u],[this.v,this.b]=[this.b,this.v],[this.ink,this.c]=[this.c,this.ink];for(let c=1;c<n-1;c++)for(let h=1;h<t-1;h++){let u=c*t+h;this.curl[u]=.5*(this.v[u+1]-this.v[u-1]-this.u[u+t]+this.u[u-t])}for(let c=1;c<n-1;c++)for(let h=1;h<t-1;h++){let u=c*t+h,f=Math.abs(this.curl[u+1])-Math.abs(this.curl[u-1]),d=Math.abs(this.curl[u+t])-Math.abs(this.curl[u-t]),p=Math.hypot(f,d)+1e-4,m=this.curl[u]*r*10,x=Math.hypot(this.u[u],this.v[u]);this.u[u]+=d/p*m,this.v[u]-=f/p*m;let g=Math.min(1,x/(Math.hypot(this.u[u],this.v[u])+1e-6));this.u[u]*=g,this.v[u]*=g,this.divergence[u]=-.5*(this.u[u+1]-this.u[u-1]+this.v[u+t]-this.v[u-t])}this.pressure.fill(0);for(let c=0;c<4;c++){for(let h=1;h<n-1;h++)for(let u=1;u<t-1;u++){let f=h*t+u;this.pressureNext[f]=.25*(this.divergence[f]+this.pressure[f-1]+this.pressure[f+1]+this.pressure[f-t]+this.pressure[f+t])}[this.pressure,this.pressureNext]=[this.pressureNext,this.pressure]}let o=0;for(let c=1;c<n-1;c++)for(let h=1;h<t-1;h++){let u=c*t+h;this.u[u]=Math.max(-80,Math.min(80,this.u[u]-.5*(this.pressure[u+1]-this.pressure[u-1]))),this.v[u]=Math.max(-80,Math.min(80,this.v[u]-.5*(this.pressure[u+t]-this.pressure[u-t]))),this.driftX[u]+=(3.6*this.u[u]-58*this.offsetX[u]-12*this.driftX[u])*r,this.driftY[u]+=(3.6*this.v[u]-58*this.offsetY[u]-12*this.driftY[u])*r,this.offsetX[u]=Math.max(-2,Math.min(2,this.offsetX[u]+this.driftX[u]*r)),this.offsetY[u]=Math.max(-2,Math.min(2,this.offsetY[u]+this.driftY[u]*r)),this.signal[u]=1-Math.exp(.06*-Math.hypot(this.u[u],this.v[u])-.16*this.ink[u]),o=Math.max(o,this.signal[u])}this.peak=o}if(this.active)for(let r=0;r<this.ink.length;r++){let s=Math.round(65535*Math.min(1,this.signal[r]));this.pixels[4*r]=s>>>8,this.pixels[4*r+1]=255&s,this.pixels[4*r+2]=Math.round(128+63.5*this.offsetX[r]),this.pixels[4*r+3]=Math.round(128+63.5*this.offsetY[r])}else this.clear()}};function pn(i,e,t,n,r){if(!(r<1))for(let s=0;s<2;s++){for(let a=0;a<n;a++){let o=0,c=a*t;for(let h=-r;h<=r;h++)o+=i[c+Math.max(0,Math.min(t-1,h))];for(let h=0;h<t;h++)e[c+h]=o/(2*r+1),o+=i[c+Math.min(t-1,h+r+1)]-i[c+Math.max(0,h-r)]}for(let a=0;a<t;a++){let o=0;for(let c=-r;c<=r;c++)o+=e[Math.max(0,Math.min(n-1,c))*t+a];for(let c=0;c<n;c++)i[c*t+a]=o/(2*r+1),o+=e[Math.min(n-1,c+r+1)*t+a]-e[Math.max(0,c-r)*t+a]}}}var jf=new Float32Array(0);function Xg(i,e,t,n,r){let s=e*t,a=r&&r.width===e&&r.height===t?r:{width:e,height:t,subject:new Float32Array(s),depth:new Float32Array(s),key:"none"},{subject:o,depth:c}=a,h=0;for(let m=0;m<s;m++)i[4*m+3]<250&&h++;let u=m=>(.2126*i[4*m]+.7152*i[4*m+1]+.0722*i[4*m+2])/255,f="none",d=0;if(h>.01*s)f="alpha";else if(n)f="mask";else{let m=0,x=0,g=0,l=Math.max(1,Math.round(.03*Math.min(e,t)));for(let w=0;w<t;w++)for(let T=0;T<e;T++){if(T>=l&&w>=l&&T<e-l&&w<t-l)continue;let y=u(w*e+T);m+=y,x+=y*y,g++}d=m/Math.max(1,g),Math.sqrt(Math.max(0,x/Math.max(1,g)-d*d))<.07&&(f="ground")}for(let m=0;m<s;m++){let x=i[4*m+3]/255,g=u(m),l=1;if(f==="alpha")l=x;else if(f==="ground"){let w=Math.max(0,Math.min(1,(Math.abs(g-d)-.035)/.12));l=w*w*(3-2*w)}o[m]=l*(n?Math.max(0,Math.min(1,n[m])):1),c[m]=g*x}a.key=f,jf.length<s&&(jf=new Float32Array(s));let p=jf;return pn(o,p,e,t,Math.max(1,Math.round(.02*Math.min(e,t)))),pn(c,p,e,t,Math.max(1,Math.round(.035*Math.min(e,t)))),a}var Mo=11,hi=i=>Math.max(0,Math.min(1,i)),it=(i,e,t)=>{let n=hi((t-i)/(e-i));return n*n*(3-2*n)};function Pi(i,e,t=256){let n=0;for(let o=0;o<i.length;o++)i[o]>n&&(n=i[o]);if(n<=0)return 0;let r=new Uint32Array(t);for(let o=0;o<i.length;o++)r[Math.min(t-1,Math.floor(Math.max(0,i[o])/n*t))]++;let s=0,a=i.length*e;for(let o=0;o<t;o++)if(s+=r[o],s>=a)return(o+1)/t*n;return n}var Y1=class{constructor(i){this.n=i,this.arrays=[],this.next=0}take(i){this.next===this.arrays.length&&this.arrays.push(new Float32Array(this.n));let e=this.arrays[this.next++];return i?e.set(i):e.fill(0),e}reset(){this.next=0}},Xc=null;function vs(i,e,t,n,r){let s=2*r+1;for(let a=0;a<n;a++){let o=a*t,c=0;for(let h=-r;h<=r;h++)c+=i[o+Math.max(0,Math.min(t-1,h))];for(let h=0;h<t;h++)e[o+h]=c/s,c+=i[o+Math.min(t-1,h+r+1)]-i[o+Math.max(0,h-r)]}for(let a=0;a<t;a++){let o=0;for(let c=-r;c<=r;c++)o+=e[Math.max(0,Math.min(n-1,c))*t+a];for(let c=0;c<n;c++)i[c*t+a]=o/s,o+=e[Math.min(n-1,c+r+1)*t+a]-e[Math.max(0,c-r)*t+a]}}function Yf(i,e,t,n,r,s,a){let o=t*n,c=a.take(),h=a.take(e),u=a.take(i),f=a.take(),d=a.take();for(let p=0;p<o;p++)f[p]=e[p]*e[p],d[p]=e[p]*i[p];vs(h,c,t,n,r),vs(u,c,t,n,r),vs(f,c,t,n,r),vs(d,c,t,n,r);for(let p=0;p<o;p++){let m=(d[p]-h[p]*u[p])/(f[p]-h[p]*h[p]+s);f[p]=m,d[p]=u[p]-m*h[p]}vs(f,c,t,n,r),vs(d,c,t,n,r);for(let p=0;p<o;p++)i[p]=f[p]*e[p]+d[p]}function Kf(i,e,t,n,r,s=2){for(let a=0;a<s;a++){for(let o=0;o<n;o++)for(let c=0;c<t;c++){let h=o*t+c,u=i[h];c>0&&(u=Math.max(u,Math.min(e[h],i[h-1]*r))),o>0&&(u=Math.max(u,Math.min(e[h],i[h-t]*r),c>0?Math.min(e[h],i[h-t-1]*r):0,c<t-1?Math.min(e[h],i[h-t+1]*r):0)),i[h]=u}for(let o=n-1;o>=0;o--)for(let c=t-1;c>=0;c--){let h=o*t+c,u=i[h];c<t-1&&(u=Math.max(u,Math.min(e[h],i[h+1]*r))),o<n-1&&(u=Math.max(u,Math.min(e[h],i[h+t]*r),c>0?Math.min(e[h],i[h+t-1]*r):0,c<t-1?Math.min(e[h],i[h+t+1]*r):0)),i[h]=u}}}function qc(i,e,t,n,r){for(let s=0;s<n;s++)for(let a=0;a<t;a++){let o=1;for(let c=Math.max(0,a-r);c<=Math.min(t-1,a+r);c++)o=Math.min(o,i[s*t+c]);e[s*t+a]=o}for(let s=0;s<n;s++)for(let a=0;a<t;a++){let o=1;for(let c=Math.max(0,s-r);c<=Math.min(n-1,s+r);c++)o=Math.min(o,e[c*t+a]);i[s*t+a]=o}}function K1(i,e,t,n,r){let s=t*n,a=Math.min(t,n),o=r.take(),c=r.take(),h=r.take(),u=r.take(),f=r.take();for(let v=0;v<s;v++){let q=i[4*v+3]/255;f[v]=q,o[v]=e[4*v]/255*q,c[v]=e[4*v+1]/255*q,h[v]=e[4*v+2]/255*q,u[v]=(.299*i[4*v]+.587*i[4*v+1]+.114*i[4*v+2])/255*q}let d=r.take(),p=(v,q)=>{let k=r.take(v);return pn(k,d,t,n,q),k},m=Math.max(2,Math.round(.04*a)),x=Math.max(m+2,Math.round(.12*a)),g=Math.max(2,Math.round(.05*a)),l=p(u,1),w=p(u,m),T=p(u,x),y=r.take(),E=r.take(),R=r.take(),P=r.take(),B=r.take();for(let v=0;v<n;v++)for(let q=0;q<t;q++){let k=v*t+q;y[k]=Math.abs(u[k]-l[k]),E[k]=Math.abs(l[k]-w[k]),R[k]=Math.abs(w[k]-T[k]),P[k]=Math.abs(u[v*t+Math.min(t-1,q+1)]-u[v*t+Math.max(0,q-1)]),B[k]=Math.abs(u[Math.min(n-1,v+1)*t+q]-u[Math.max(0,v-1)*t+q])}pn(y,d,t,n,g),pn(E,d,t,n,g),pn(R,d,t,n,g),pn(P,d,t,n,2),pn(B,d,t,n,2);let M=Math.max(.01,Pi(y,.9)+Pi(E,.9)),_=p(o,1),F=p(c,1),z=p(h,1),L=r.take(),D=r.take(),H=r.take(),Y=0;for(let v=0;v<s;v++){let q=_[v],k=F[v],oe=z[v],ie=Math.max(q,k,oe),J=ie-Math.min(q,k,oe);H[v]=ie,D[v]=ie>.001?J/ie:0,Y+=J;let de=0;J>1e-4&&(de=ie===q?((k-oe)/J+6)%6:ie===k?(oe-q)/J+2:(q-k)/J+4),L[v]=60*de}let G=it(.02,.07,Y/s),re=Math.max(2,Math.round(.06*n)),fe=new Float32Array(n);for(let v=0;v<n;v++){let q=0;for(let k=0;k<t;k++)q+=y[v*t+k]+E[v*t+k];fe[v]=q/t}let ge=.5,Te=0;for(let v=Math.max(re,Math.round(.12*n));v<=Math.min(n-re,Math.round(.88*n));v++){let q=0,k=0,oe=0,ie=0;for(let Ye=0;Ye<t;Ye++){let gt=0,Tt=0,Zt=0,tn=0,ln=0,nn=0;for(let cn=1;cn<=re;cn++){let vn=(v-cn)*t+Ye,Qn=(v+cn-1)*t+Ye;gt+=_[vn],Tt+=F[vn],Zt+=z[vn],tn+=_[Qn],ln+=F[Qn],nn+=z[Qn]}let zn=(Math.abs(gt-tn)+Math.abs(Tt-ln)+Math.abs(Zt-nn))/re;q+=zn,k+=zn>.12?1:0}let J=Math.max(2,Math.round(.15*n)),de=Math.max(0,v-J),De=Math.min(n,v+J);for(let Ye=de;Ye<v;Ye++)oe+=fe[Ye];for(let Ye=v;Ye<De;Ye++)ie+=fe[Ye];oe/=v-de,ie/=De-v;let ve=it(-.05,.3,(ie-oe)/(ie+oe+1e-4)),me=it(.08,.35,q/t)*(k/t)*ve;me>Te&&(Te=me,ge=v/n)}let qe=it(.15,.45,Te),Re=r.take(),Q=r.take(),we=r.take();for(let v=0;v<s;v++)Re[v]=Math.min(o[v],c[v],h[v]);qc(Re,d,t,n,1),pn(Re,d,t,n,m);for(let v=0;v<s;v++)Q[v]=E[v]+R[v];let j=0,ee=0,be=0;for(let v=0;v<s;v++)j+=_[v],ee+=F[v],be+=z[v];j/=s,ee/=s,be/=s;let Ne=p(_,m),Ee=p(F,m),rt=p(z,m),Pe=p(_,x),Mt=p(F,x),Et=p(z,x);for(let v=0;v<s;v++){let q=Math.hypot(Ne[v]-j,Ee[v]-ee,rt[v]-be),k=Math.hypot(Ne[v]-Pe[v],Ee[v]-Mt[v],rt[v]-Et[v]);we[v]=(q+1.5*k)*(.4+.6*D[v]*G+.4*(1-G))}let st=r.take(),ht=r.take(),Bt=r.take(),I=r.take(),Ft=r.take(),wt=r.take(),vt=r.take(),Oe=r.take(),C=r.take(),b=r.take();for(let v=0;v<n;v++)for(let q=0;q<t;q++)b[v*t+q]=Math.abs(u[Math.min(n-1,v+1)*t+q]-u[Math.max(0,v-1)*t+q]);pn(b,d,t,n,1);for(let v=0;v<n;v++)for(let q=0;q<t;q++){let k=v*t+q,oe=(v+.5)/n,ie=L[k],J=D[k]*G,de=H[k],De=y[k]+E[k],ve=it(175,200,ie)*(1-it(250,275,ie))*it(.08,.25,J),me=(1-it(45,65,ie)+it(290,330,ie))*it(.2,.45,J)*it(.3,.55,de),Ye=(1-it(.15,.35,J))*it(.45,.7,de)*qe,gt=(1-it(.08,.2,de))*qe,Tt=qe>.3?1-it(ge,ge+.1,oe):1-it(.4,.8,oe),Zt=1-it(.02,.06,De),tn=1-it(.03,.09,De);ht[k]=Math.max(ve*Zt,.7*gt*(1-it(.008,.025,De)),me*tn*.9)*Tt,Bt[k]=Math.max(ht[k],Ye*Zt*Tt),st[k]=v===0?ht[k]:0,I[k]=it(150,172,ie)*(1-it(232,250,ie))*it(.25,.45,J),vt[k]=it(1.3,2.2,(P[k]+.004)/(B[k]+.004))*it(.35,.55,l[k])*(1-it(.1,.18,D[k]*G))*it(.025,.07,De)*it(.025,.045,b[k]);let ln=1-it(.18,.4,J),nn=it(.55,.8,de)*it(.05,.12,De);Ft[k]=Math.max(I[k],.85*ln,.8*nn)}Kf(st,ht,t,n,.995,1),Kf(st,Bt,t,n,.8,1);let U=0;for(let v=0;v<s;v++)U+=st[v];let le=U>.04*s&&qe>.3;if(le)for(let v=0;v<n;v++)for(let q=0;q<t;q++)I[v*t+q]*=it(ge,ge+.05,(v+.5)/n);if(le){let v=r.take(),q=r.take(),k=r.take();for(let ve=0;ve<s;ve++)v[ve]=.299*Ne[ve]+.587*Ee[ve]+.114*rt[ve];for(let ve=0;ve<n;ve++)for(let me=0;me<t;me++)q[ve*t+me]=l[Math.min(n-1,ve+1)*t+me]-l[Math.max(0,ve-1)*t+me];let oe=new Uint8Array(s);for(let ve=1;ve<n-1;ve++)for(let me=0;me<t;me++){let Ye=Math.abs(q[ve*t+me]),gt=Ye>.03;for(let Tt=-3;Tt<=3&&gt;Tt++)Tt&&ve+Tt>=0&&ve+Tt<n&&Math.abs(q[(ve+Tt)*t+me])>Ye&&(gt=!1);oe[ve*t+me]=gt?1:0}let ie=(ve,me,Ye,gt=!0)=>{let Tt=Ne[me]+Ee[me]+rt[me]+.05,Zt=Ne[Ye]+Ee[Ye]+rt[Ye]+.05,tn=Math.abs(Ne[me]/Tt-Ne[Ye]/Zt)+Math.abs(Ee[me]/Tt-Ee[Ye]/Zt)+Math.abs(rt[me]/Tt-rt[Ye]/Zt),ln=Math.min(Math.abs(L[me]-L[Ye]),360-Math.abs(L[me]-L[Ye])),nn=Math.max(1-it(.1,.25,tn),(1-it(15,35,ln))*it(.15,.3,Math.min(D[me],D[Ye]))),zn=Math.max(it(2,3,(B[me]+.004)/(P[me]+.004))*it(.015,.04,y[me]+E[me])*it(.4,.55,y[me]/(y[me]+E[me]+1e-4)),1-it(.12,.25,v[me]));return nn*(gt?zn:1)*(1-it(.82*v[Ye]+.02,1.02*v[Ye]+.05,v[me]))},J=0,de=0;for(let ve=Math.max(3,Math.round(n*Math.max(.25,ge)));ve<Math.round(.88*n);ve++){let me=0;for(let gt=0;gt<t;gt++)(oe[(ve-1)*t+gt]||oe[ve*t+gt]||oe[(ve+1)*t+gt])&&me++;if(me<.5*t)continue;let Ye=0;for(let gt=ve+1;gt<Math.min(n,2*ve);gt++)for(let Tt=0;Tt<t;Tt++)Ye+=ie(ve,gt*t+Tt,(2*ve-gt)*t+Tt);Ye>de&&(de=Ye,J=ve)}let De=it(.05,.1,de/s);if(De>0)for(let ve=J+1;ve<Math.min(n,2*J);ve++)for(let me=0;me<t;me++){let Ye=ve*t+me;Oe[Ye]=ie(J,Ye,(2*J-ve)*t+me)*De,C[Ye]=ie(J,Ye,(2*J-ve)*t+me,!1)*De,k[Ye]=Oe[Ye]}pn(k,d,t,n,1);for(let ve=0;ve<s;ve++)Oe[ve]=Math.max(Oe[ve],k[ve]),I[ve]=Math.max(I[ve],Oe[ve])}let ue=p(I,x);for(let v=0;v<s;v++)I[v]*=it(.15,.35,ue[v]);let se=p(I,m);for(let v=0;v<s;v++){I[v]*=1-.8*ht[v];let q=Math.min(Math.abs(L[v]-200),360-Math.abs(L[v]-200));wt[v]=it(.28,.45,D[v]*G)*it(55,80,q)*(1-it(.3,.6,C[v]))}let je=p(wt,m);for(let v=0;v<s;v++)wt[v]=Math.max(wt[v]*(1-(1-it(.15,.3,je[v]))*it(.55,.7,H[v])*it(.5,.65,D[v])),1-f[v]),Ft[v]=Math.min(Math.max(Ft[v],.9*C[v]),Math.max(I[v],it(.25,.6,se[v])))*(1-st[v])*(1-wt[v]);Kf(I,Ft,t,n,.97);let ye=r.take(vt),Le=Math.max(2,Math.round(.12*n));for(let v=0;v<t;v++){let q=0;for(let k=-Le;k<=Le;k++)q+=vt[Math.max(0,Math.min(n-1,k))*t+v];for(let k=0;k<n;k++)ye[k*t+v]=q/(2*Le+1),q+=vt[Math.min(n-1,k+Le+1)*t+v]-vt[Math.max(0,k-Le)*t+v]}pn(ye,d,t,n,1);for(let v=0;v<s;v++)vt[v]=it(.2,.45,ye[v])*it(.2,.5,vt[v]+.5*ye[v])*(1-st[v]);Yf(st,u,t,n,Math.max(2,Math.round(.04*a)),.002,r),Yf(I,u,t,n,Math.max(2,Math.round(.04*a)),.002,r),Yf(vt,u,t,n,Math.max(2,Math.round(.03*a)),.002,r),pn(wt,d,t,n,1);for(let v=0;v<s;v++)st[v]=it(.3,.7,st[v])*f[v],vt[v]=it(.3,.7,vt[v])*f[v]*(1-st[v]),I[v]=it(.3,.7,I[v])*(1-st[v])*(1-vt[v])*(1-it(.15,.4,wt[v]));qc(st,d,t,n,2),qc(I,d,t,n,2),qc(vt,d,t,n,1),pn(st,d,t,n,1),pn(I,d,t,n,1),pn(vt,d,t,n,1);let at=1/Math.max(.02,Pi(we,.97)),ce=1/Math.max(.01,Pi(Q,.9)),Se=Pi(Re,.97),Ae=Pi(Re,.1),Xe=it(.06,.25,Se-Ae),_e=r.take();for(let v=0;v<n;v++)for(let q=0;q<t;q++){let k=v*t+q,oe=(q+.5)/t,ie=(v+.5)/n,J=Math.max(st[k],I[k]),de=y[k]+E[k]+R[k],De=.6*hi(((y[k]+.6*E[k])/(de+.004)-.25)/.55)+.4*hi((y[k]+E[k])/M),ve=it(.04,.35,de/M)*(1-J),me=.55*hi((Re[k]-Ae)/Math.max(.05,Se-Ae))+.25*(1-hi(Q[k]*ce))+.2*hi(2*(z[k]-_[k])+.3)*G,Ye=Xe*it(.12,.35,w[k])*(.4+.6*qe),gt=qe*(ie<ge?.45:.45+.55*it(0,1,(ie-ge)/Math.max(.15,1-ge)))+(1-qe)*(.5+.4*(ie-.5)),Tt=y[k]/(y[k]+E[k]+1e-4),Zt=it(.2,.7,(y[k]+E[k])/M)*(.35+.65*qe)*(1-J),tn=1-hi(1.5*Math.hypot(1.2*(oe-.5),ie-.52)),ln=hi(we[k]*at)*(.55+.45*tn),nn=.3*ve,zn=.25*Ye,cn=.12+.45*qe,vn=.12*Zt,Qn=.35*(1-.4*qe)*(1-J);_e[k]=(nn*De+zn*(1-me)+cn*gt+vn*hi(1.6-1.6*Tt)+Qn*ln+.04)/(nn+zn+cn+vn+Qn+.08)*(1-.85*st[k])*(1-.45*I[k]*(1-qe))}let mt=Xg(i,t,n);if(mt.key!=="none")for(let v=0;v<s;v++)_e[v]=.7*mt.subject[v]+.3*_e[v];return pn(_e,d,t,n,Math.max(1,Math.round(.03*a))),(function(v,q,k,oe,ie,J,de,De,ve){let me=ie*J,Ye=ve.take(),gt=et=>(vs(et,Ye,ie,J,de),et),Tt=(et,Ht)=>{let Dn=ve.take();for(let S=0;S<me;S++)Dn[S]=et[S]*Ht[S];return gt(Dn)},Zt=gt(ve.take(q)),tn=gt(ve.take(k)),ln=gt(ve.take(oe)),nn=gt(ve.take(v)),zn=Tt(q,q),cn=Tt(q,k),vn=Tt(q,oe),Qn=Tt(k,k),Vr=Tt(k,oe),Ki=Tt(oe,oe),vr=Tt(q,v),Ii=Tt(k,v),en=Tt(oe,v),ei=ve.take(),mn=ve.take(),Gn=ve.take(),Fi=ve.take();for(let et=0;et<me;et++){let Ht=vr[et]-Zt[et]*nn[et],Dn=Ii[et]-tn[et]*nn[et],S=en[et]-ln[et]*nn[et],O=zn[et]-Zt[et]*Zt[et]+De,Z=cn[et]-Zt[et]*tn[et],$=vn[et]-Zt[et]*ln[et],X=Qn[et]-tn[et]*tn[et]+De,Ce=Vr[et]-tn[et]*ln[et],Be=Ki[et]-ln[et]*ln[et]+De,Ie=X*Be-Ce*Ce,Ve=$*Ce-Z*Be,Ze=Z*Ce-$*X,ft=O*Be-$*$,ot=Z*$-O*Ce,At=O*X-Z*Z,Lt=O*Ie+Z*Ve+$*Ze,Xt=Math.abs(Lt)>1e-12?1/Lt:0;ei[et]=(Ie*Ht+Ve*Dn+Ze*S)*Xt,mn[et]=(Ve*Ht+ft*Dn+ot*S)*Xt,Gn[et]=(Ze*Ht+ot*Dn+At*S)*Xt,Fi[et]=nn[et]-ei[et]*Zt[et]-mn[et]*tn[et]-Gn[et]*ln[et]}gt(ei),gt(mn),gt(Gn),gt(Fi);for(let et=0;et<me;et++)v[et]=ei[et]*q[et]+mn[et]*k[et]+Gn[et]*oe[et]+Fi[et]})(_e,_,F,z,t,n,Math.max(2,Math.round(.07*a)),.004,r),{depth:_e,water:I,sky:st,falls:vt}}function jc(i,e,t,n,r,s,a){if(e===s&&t===a)return i[r*s+n];let o=Math.max(0,Math.min(e-1,(n+.5)*e/s-.5)),c=Math.max(0,Math.min(t-1,(r+.5)*t/a-.5)),h=Math.min(e-2,Math.floor(o)),u=Math.min(t-2,Math.floor(c)),f=o-h,d=c-u;if(h<0||u<0)return i[Math.round(c)*e+Math.round(o)];let p=u*e+h,m=p+e;return(i[p]*(1-f)+i[p+1]*f)*(1-d)+(i[m]*(1-f)+i[m+1]*f)*d}var ua=(i,e,t)=>{let n=Math.max(0,Math.min(1,(t-i)/(e-i)));return n*n*(3-2*n)},$1=class{constructor(i,e){this.base=40,this.mass=0,this.calm=0,this.drift=[0,0],this.fade=3,this.age=0,this.peak=0,this.front=0,this.live=!1,this.bins=new Uint32Array(64),this.spare=new Float32Array(0),this.cols=Math.max(3,0|i),this.rows=Math.max(3,0|e);let t=this.cols*this.rows;this.h=new Float32Array(t),this.p=new Float32Array(t),this.speed=new Float32Array(t).fill(1),this.damp=new Float32Array(t).fill(1),this.wall=new Float32Array(t),this.trace=new Float32Array(t)}clear(){this.h.fill(0),this.p.fill(0),this.trace.fill(0),this.live=!1,this.peak=0}drop(i,e,t=1,n=3){let{cols:r,rows:s,h:a,p:o}=this,c=Math.max(1,n),h=Math.ceil(3*c);for(let u=Math.max(1,Math.floor(e-h));u<Math.min(s-1,Math.ceil(e+h));u++)for(let f=Math.max(1,Math.floor(i-h));f<Math.min(r-1,Math.ceil(i+h));f++){let d=f-i,p=u-e,m=(d*d+p*p)/(c*c),x=t*(1-m)*Math.exp(-m),g=u*r+f;a[g]+=x,o[g]+=x}this.age=0,this.live=!0,this.peak=Math.max(this.peak,t),this.front=Math.max(this.front,t)}step(i,e=1){if(!(this.live&&i>0))return this.live;i=Math.min(.05,i),this.age+=i;let{cols:t,rows:n,speed:r,damp:s,wall:a,trace:o}=this,c=Math.max(0,this.base*e),h=0;for(let _=0;_<r.length;_++)r[_]>h&&(h=r[_]);let u=Math.max(1,Math.min(8,Math.ceil(c*i*Math.sqrt(h)/.6))),f=this.calm,d=i/u,p=c*d*(c*d),m=this.mass*d*d,x=this.h,g=this.p;for(let _=0;_<u;_++){for(let z=1;z<n-1;z++)for(let L=1,D=z*t+1;L<t-1;L++,D++){let H=x[D],Y=x[D-1]+x[D+1]+x[D-t]+x[D+t]-4*H,G=o[D],re=G>.02?Math.max(0,1-Math.abs(H)/G):0,fe=f*re*re*d,ge=1-Math.min(.5,s[D]*d+fe);g[D]=(H+(H-g[D])*ge+p*r[D]*Y-m*H)*(1-a[D])*(1-Math.min(.5,.5*fe))}let F=x;x=g,g=F}this.h=x,this.p=g;let l=this.drift[0]*i,w=this.drift[1]*i;(l||w)&&(this.carry(x,l,w),this.carry(g,l,w));for(let _=0;_<t;_++)x[_]=.5*x[t+_],x[(n-1)*t+_]=.5*x[(n-2)*t+_];for(let _=0;_<n;_++)x[_*t]=.5*x[_*t+1],x[_*t+t-1]=.5*x[_*t+t-2];let T=Math.exp(-i*this.fade),y=0;for(let _=0;_<x.length;_++){let F=Math.abs(x[_]);F>y&&(y=F);let z=o[_]*T;o[_]=F>=z?F:z<1e-4?0:z}this.peak=y;let E=this.bins.fill(0),R=.05*y,P=0;for(let _=0;_<x.length;_++)x[_]>R&&(E[Math.min(63,x[_]/y*64|0)]++,P++);let B=0,M=63;for(;M>0&&(B+=E[M],!(B>=.08*P));M--);return this.front=Math.max(.15*y,(M+1)/64*y),!(y<.004)||(this.clear(),!1)}carry(i,e,t){let{cols:n,rows:r}=this;this.spare.length!==i.length&&(this.spare=new Float32Array(i.length));let s=this.spare;for(let a=0,o=0;a<r;a++){let c=Math.min(r-1.001,Math.max(0,a-t)),h=0|c,u=c-h;for(let f=0;f<n;f++,o++){let d=Math.min(n-1.001,Math.max(0,f-e)),p=0|d,m=d-p,x=h*n+p;s[o]=(i[x]*(1-m)+i[x+1]*m)*(1-u)+(i[x+n]*(1-m)+i[x+n+1]*m)*u}}i.set(s)}slope(i,e){let{h:t,cols:n}=this,r=t.length;return e[0]=.5*(t[Math.min(r-1,i+1)]-t[Math.max(0,i-1)]),e[1]=.5*(t[Math.min(r-1,i+n)]-t[Math.max(0,i-n)]),e}};function vg(i,e,t,n){let r=new Float32Array(i.length);for(let s=0;s<2;s++){let a=s?r:i,o=s?i:r;for(let c=0;c<t;c++)for(let h=0;h<e;h++){let u=0,f=0;for(let d=-n;d<=n;d++){let p=s?h:h+d,m=s?c+d:c;p<0||m<0||p>=e||m>=t||(u+=a[m*e+p],f++)}o[c*e+h]=u/f}}}var Yc,J1=["none","flow","orb","drift","swell","caustics","contour","aurora","ripple","halo","interference","mesh","cascade","constellation"],da=["glyph","dot","pixel","mosaic","lego","voxel","disco","dither","hex","led","cmyk","stipple","engraving","crosshatch","woodblock","risograph","pointillism","inlay","tick","bayer"],Z1=[{value:"fluid",label:"Fluid",description:"An ink-in-water wake that bends the image and swirls the characters."},{value:"lantern",label:"Lantern",description:"A soft light follows the pointer and lifts the characters it passes, without distortion."},{value:"trail",label:"Trail",description:"The Asciify Trail: in the wake, sparse characters fill in and dense ones open up, then settle. No distortion."},{value:"loupe",label:"Loupe",description:"A glass loupe glides after the pointer and magnifies the characters it covers."},{value:"reveal",label:"Reveal",description:"Under a soft spotlight the characters take the source image's own colours. Best over a photo or video in one ink."},{value:"none",label:"Off",description:"The field stays still under the pointer."}],Q1={radius:.13,strength:.5,trail:.45,follow:12},eM={bloom:0,bloomRadius:2,scanlines:0,grain:0,chroma:0,curvature:0},tM={strength:.55,radius:.45},pr={radius:.075,force:1,dissipation:1.6,refraction:.03,glow:.55,resolution:128,curl:24},nM={charset:" .,:-=+*#%@",cellSize:12,cellAspect:1,cellFit:"pixel",font:'ui-monospace, "SF Mono", Menlo, Consolas, monospace',fontWeight:500,glyphScale:.8,mark:"glyph",dotScale:.9,markAngle:-35,accents:0,shuffle:0,sample:"area",linePitch:.5,lineWeight:1,sparkle:0,textRepeat:"flow",glyphOrder:"tone",color:"ink",ink:"#f3ba32",highlight:"auto",background:"transparent",brightness:0,contrast:1,gamma:1,invert:!1,levels:"auto",blend:"auto",saturation:1.1,ramp:[],shade:.5,backdrop:0,fit:"cover",focus:{x:.5,y:.5},vignette:0,drift:0,scene:"flow",scale:1,clear:!1,speed:1,hover:"fluid",fluid:pr,lantern:Q1,trail:tM,post:eM,scope:"all",tap:"surface",maxPixelRatio:2,respectReducedMotion:!0},xt=(i,e,t,n)=>typeof i=="number"&&Number.isFinite(i)?Math.min(t,Math.max(e,i)):n,Qc=(i,e)=>typeof i=="string"&&/^#([\da-f]{3}|[\da-f]{6})$/i.test(i.trim())?i.trim().toLowerCase():e,bg=/^[\u0020-\u007e\u00a0-\u02ff\u0370-\u0482\u048a-\u052f\u2010-\u20cf\u2100-\u2bff]*$/,qg=" _.,:;*!/<[j7Jy23A#0DRNB";function zr(i){return od(i).slice()}var wo=new Map;function od(i){let e=wo.get(i);if(e)return e;let t=(function(n){if(!bg.test(n)&&Yc===void 0){let s=Intl.Segmenter;Yc=s?new s(void 0,{granularity:"grapheme"}):null}return(Yc&&!bg.test(n)?Array.from(Yc.segment(n),s=>s.segment):Array.from(n)).filter(s=>s!==`
`&&s!=="\r"&&s!=="	").slice(0,256)})(i);return wo.size>=32&&wo.delete(wo.keys().next().value),wo.set(i,t),t}function iM(i){let e=zr(i).filter(t=>t.trim());return e.length>0&&2*e.filter(Wg).length>e.length}var rM=(i,e,t)=>{let n=da.includes(i)?i:e;return(n==="glyph"||n==="inlay")&&iM(t)},sM=(i,e)=>{if(!Array.isArray(i))return e;let t=i.map(n=>Qc(n,"")).filter(Boolean).slice(0,6);return t.length>=2?t:[]};function Po(i={},e=nM){let t=typeof i.charset=="string"&&zr(i.charset).length>=2?i.charset:e.charset,n=e.fluid||pr,r=i.fluid===void 0?e.fluid:i.fluid,s=r!==!1&&(()=>{let f=r!==!0&&r?{...n,...r}:n;return{radius:xt(f.radius,.005,.5,pr.radius),force:xt(f.force,0,8,pr.force),dissipation:xt(f.dissipation,.05,20,pr.dissipation),refraction:xt(f.refraction,0,.5,pr.refraction),glow:xt(f.glow,0,2,pr.glow),resolution:Math.round(xt(f.resolution,16,512,pr.resolution)),curl:xt(f.curl,0,80,pr.curl)}})(),a=J1.includes(i.scene)?i.scene:e.scene,o=!!i.clear&&typeof i.clear=="object"&&("element"in i.clear||"nodeType"in i.clear||"rects"in i.clear),c=i.clear===void 0||o?e.clear:i.clear,h=!!c&&{x:xt(c.x,-.5,1.5,.25),y:xt(c.y,-.5,1.5,.3),width:xt(c.width,0,2,.5),height:xt(c.height,0,2,.4),feather:xt(c.feather,.005,1,.12),shape:c.shape==="rect"?"rect":"ellipse",pointer:xt(c.pointer,0,1,0)};return{charset:t,cellSize:xt(i.cellSize,1,96,e.cellSize),cellAspect:rM(i.mark,e.mark,t)?Math.max(1,xt(i.cellAspect,.3,2,e.cellAspect)):xt(i.cellAspect,.3,2,e.cellAspect),cellFit:i.cellFit==="fill"||i.cellFit==="pixel"?i.cellFit:e.cellFit,font:typeof i.font=="string"&&i.font.trim()?i.font:e.font,fontWeight:Math.round(xt(i.fontWeight,100,900,e.fontWeight)),glyphScale:xt(i.glyphScale,.3,1.6,e.glyphScale),mark:da.includes(i.mark)?i.mark:e.mark,dotScale:xt(i.dotScale,.1,1.4,e.dotScale),markAngle:xt(i.markAngle,-360,360,e.markAngle),accents:xt(i.accents,0,.3,e.accents),shuffle:xt(i.shuffle,0,4,e.shuffle),sample:i.sample==="point"||i.sample==="area"||i.sample==="shape"?i.sample:e.sample,linePitch:xt(i.linePitch,.2,4,e.linePitch),lineWeight:xt(i.lineWeight,.2,3,e.lineWeight),sparkle:xt(i.sparkle,0,.05,e.sparkle),textRepeat:i.textRepeat==="row"||i.textRepeat==="flow"?i.textRepeat:e.textRepeat,glyphOrder:i.glyphOrder==="text"||i.glyphOrder==="tone"||i.glyphOrder==="scatter"?i.glyphOrder:e.glyphOrder,color:i.color==="source"||i.color==="ink"?i.color:e.color,ink:Qc(i.ink,e.ink),highlight:i.highlight==="auto"?"auto":Qc(i.highlight,e.highlight),ramp:sM(i.ramp,e.ramp),background:i.background==="transparent"?"transparent":Qc(i.background,e.background),brightness:xt(i.brightness,-1,1,e.brightness),contrast:xt(i.contrast,0,4,e.contrast),gamma:xt(i.gamma,.2,5,e.gamma),invert:typeof i.invert=="boolean"?i.invert:e.invert,levels:i.levels==="none"||i.levels==="auto"?i.levels:e.levels,blend:i.blend==="auto"||i.blend==="coarse"||i.blend==="on"||i.blend==="off"?i.blend:e.blend,saturation:xt(i.saturation,0,3,e.saturation),shade:xt(i.shade,0,1,e.shade),backdrop:xt(i.backdrop,0,1,e.backdrop),fit:i.fit==="contain"||i.fit==="cover"?i.fit:e.fit,focus:{x:xt(i.focus?.x,0,1,e.focus.x),y:xt(i.focus?.y,0,1,e.focus.y)},vignette:xt(i.vignette,0,1,e.vignette),drift:xt(i.drift,0,2,e.drift),scene:a,scale:xt(i.scale,.2,6,e.scale),clear:h,speed:xt(i.speed,0,5,e.speed),hover:Z1.some(f=>f.value===i.hover)?i.hover:e.hover,fluid:s,lantern:{radius:xt(i.lantern?.radius,.02,.6,e.lantern.radius),strength:xt(i.lantern?.strength,0,1.5,e.lantern.strength),trail:xt(i.lantern?.trail,0,3,e.lantern.trail),follow:xt(i.lantern?.follow,1,60,e.lantern.follow)},trail:{strength:xt(i.trail?.strength,0,1,e.trail.strength),radius:xt(i.trail?.radius,.1,1,e.trail.radius)},post:{bloom:xt(i.post?.bloom,0,2,e.post.bloom),bloomRadius:xt(i.post?.bloomRadius,.5,8,e.post.bloomRadius),scanlines:xt(i.post?.scanlines,0,1,e.post.scanlines),grain:xt(i.post?.grain,0,1,e.post.grain),chroma:xt(i.post?.chroma,0,1,e.post.chroma),curvature:xt(i.post?.curvature,0,1,e.post.curvature)},scope:i.scope===void 0?e.scope:(u=i.scope,u==="subject"||u==="outside"?u:"all"),tap:i.tap==="ring"||i.tap==="none"||i.tap==="surface"?i.tap:e.tap,maxPixelRatio:xt(i.maxPixelRatio,.5,4,e.maxPixelRatio),respectReducedMotion:typeof i.respectReducedMotion=="boolean"?i.respectReducedMotion:e.respectReducedMotion};var u}function yg(i,e,t,n,r,s={x:.5,y:.5}){if(!(i>0&&e>0&&t>0&&n>0))return{scale:[1,1],offset:[0,0]};let a=i/e,o=t/n,c=o>a,h=r==="cover"?c?[a/o,1]:[1,o/a]:c?[1,o/a]:[a/o,1];return{scale:h,offset:r==="cover"?[(1-h[0])*s.x,(1-h[1])*s.y]:[.5*(1-h[0]),.5*(1-h[1])]}}function ih(i,e,t,n){let r=Math.max(2,Math.round(i*t)),s=Math.max(2,Math.round(r*e)),a=Math.min(16,Math.max(1,n)),o=Math.ceil(n/a);return{width:s,height:r,columns:a,rows:o,atlasWidth:a*s,atlasHeight:o*r}}function Kc(i){let e=i.replace("#",""),t=e.length===3?e.split("").map(r=>r+r).join(""):e,n=Number.parseInt(t,16);return Number.isFinite(n)&&t.length===6?[(n>>16&255)/255,(n>>8&255)/255,(255&n)/255]:[0,0,0]}function _g(i){let e=new Uint32Array(256),t=0;for(let a=0;a+3<i.length;a+=4)i[a+3]<8||(e[Math.round(.2126*i[a]+.7152*i[a+1]+.0722*i[a+2])]++,t++);if(!t)return[0,1];let n=a=>{let o=0;for(let c=0;c<256;c++)if(o+=e[c],o>=t*a)return c/255;return 1},r=n(.02),s=n(.98);return s-r<.08?[0,1]:[r,s]}var So=i=>i.hover!=="fluid"||i.fluid?i.hover:"none";function aM(i,e,t=24,n=.12,r="ellipse"){return i.width>0&&i.height>0&&{x:(e.left-t-i.left)/i.width,y:(e.top-t-i.top)/i.height,width:(e.width+2*t)/i.width,height:(e.height+2*t)/i.height,feather:n,shape:r}}var xs,oM=/\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i,Mg=/swiftshader|llvmpipe|softpipe|software|basic render/i;function ld(){if(xs)return xs;if(typeof document>"u"||globalThis.WebGL2RenderingContext===void 0)return xs="none";try{let i=ad();if(i)return xs=Mg.test(i.renderer)?"software":"gpu";let e=document.createElement("canvas").getContext("webgl2");if(!e)return xs="none";let t=e.getExtension("WEBGL_debug_renderer_info"),n=String(e.getParameter(t?t.UNMASKED_RENDERER_WEBGL:e.RENDERER)??"");return e.getExtension("WEBGL_lose_context")?.loseContext(),xs=Mg.test(n)?"software":"gpu"}catch{return xs="none"}}var wg=new WeakMap;function Gr(i,e){let t=wg.get(i);t&&t.length===e.length||wg.set(i,t=new Float64Array(e.length).fill(NaN));let n=!1;for(let r=0;r<e.length;r++)t[r]!==e[r]&&(n=!0,t[r]=e[r]);return n}var lM=[new Float64Array(1),new Float64Array(2),new Float64Array(3),new Float64Array(4)],Io=(i,e,t,n)=>{let r=n!==void 0?4:t!==void 0?3:e!==void 0?2:1,s=lM[r-1];return s[0]=i,r>1&&(s[1]=e),r>2&&(s[2]=t),r>3&&(s[3]=n),s},pt=(i,e,t)=>{e&&Gr(e,Io(t))&&i.uniform1f(e,t)},Ln=(i,e,t)=>{e&&Gr(e,Io(t))&&i.uniform1i(e,t)},ci=(i,e,t,n)=>{e&&Gr(e,Io(t,n))&&i.uniform2f(e,t,n)},Or=(i,e,t,n,r,s)=>{e&&Gr(e,Io(t,n,r,s))&&i.uniform4f(e,t,n,r,s)},To=(i,e,t)=>{e&&Gr(e,t)&&i.uniform3fv(e,t)},$f=(i,e,t)=>{e&&Gr(e,t)&&i.uniform4fv(e,t)},Jf=0,$c={alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"high-performance"},cd=(i,e)=>`${i.fontWeight} ${Math.max(1,e.height*i.glyphScale)}px ${i.font}`,jg=(i,e)=>`${od(i.charset).join("")}\0${cd(i,e)}\0${e.width}x${e.height}x${e.columns}`;function Yg(i,e,t,n){let r=Math.min(globalThis.devicePixelRatio||1,i.maxPixelRatio,Math.sqrt(8294400/Math.max(1,e*t)));return n<1&&r>1?Math.max(1,r*n):r}var cM=(i,e,t)=>rh(i,e,t),hM=i=>Kg(i);function rh(i,e,t){let n=zr(i.charset),r=document.createElement("canvas");r.width=e.atlasWidth,r.height=e.atlasHeight;let s=r.getContext("2d");s.fillStyle="#fff",s.textAlign="center",s.textBaseline="alphabetic";let a=cd(i,e),o=Math.max(1,e.height*i.glyphScale),c=`${i.fontWeight} ${o}px "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", YuGothic, "Noto Sans JP", "Noto Sans CJK JP", Meiryo, sans-serif, ${i.font}`;s.font=a;let h=s.measureText("M"),u=h.actualBoundingBoxAscent||e.height*i.glyphScale*.7,f=h.actualBoundingBoxDescent||0,d=(e.height+u-f)/2;n.forEach((x,g)=>{let l=g%e.columns*e.width+e.width/2,w=Math.floor(g/e.columns)*e.height+d,T=Wg(x);if(s.save(),s.beginPath(),s.rect(l-e.width/2,w-d,e.width,e.height),s.clip(),T){s.font=c;let y=s.measureText(x),E=Math.max(y.width,(y.actualBoundingBoxLeft||0)+(y.actualBoundingBoxRight||0)),R=(y.actualBoundingBoxAscent||.88*o)+(y.actualBoundingBoxDescent||.12*o),P=Math.min(1,.94*e.width/Math.max(1,E),.94*e.height/Math.max(1,R));s.translate(l,Math.floor(g/e.columns)*e.height+e.height/2),s.scale(P,P),s.translate(((y.actualBoundingBoxLeft||0)-(y.actualBoundingBoxRight||0))/2,((y.actualBoundingBoxAscent||.88*o)-(y.actualBoundingBoxDescent||.12*o))/2),s.fillText(x,0,0),s.font=a}else{let y=s.measureText(x).width;s.translate(l,w),y>.96*e.width&&s.scale(.96*e.width/y,1),s.fillText(x,0,0)}s.restore()});let p=!0,m=document.fonts;try{p=!m?.check||m.check(a,n.join(""))}catch{}return t&&queueMicrotask(()=>{r.width=r.height=1}),{image:r,final:p}}function Kg(i){let e=zr(i.charset),t=new Uint8Array(16*e.length),n=ih(60,i.cellAspect,1,e.length);try{let{image:r}=rh(i,n,!1),s=r,a=s.width,o=s.getContext("2d",{willReadFrequently:!0}).getImageData(0,0,s.width,s.height).data;s.width=s.height=1,e.forEach((c,h)=>{let u=h%n.columns*n.width,f=Math.floor(h/n.columns)*n.height,d=new Float64Array(15),p=new Float64Array(15),m=0;for(let x=0;x<n.height;x++)for(let g=0;g<n.width;g++){let l=o[4*((f+x)*a+u+g)+3]/255,w=3*Math.min(4,Math.floor(5*x/n.height))+Math.min(2,Math.floor(3*g/n.width));d[w]+=l,p[w]++,m+=l}for(let x=0;x<15;x++)t[16*h+x]=Math.round(255*d[x]/Math.max(1,p[x]));t[16*h+15]=Math.round(255*m/(n.width*n.height))})}catch{}return t}var Sg=()=>{};function $g(i,e={}){if(typeof document>"u"||i.ownerDocument!==document)return!1;let t=i.clientWidth,n=i.clientHeight;if(!t||!n)return!1;let r=ad();if(!r||r.lost)return!1;let{clear:s,source:a,interactionTarget:o,onError:c,label:h,...u}=e,f=Po(u),d=ih(f.cellSize,f.cellAspect,Yg(f,t,n,r.scale),zr(f.charset).length),p=jg(f,d);if(r.hasAtlas(p))return!1;try{r.releaseAtlas(r.atlas(p,()=>rh(f,d,!0),Sg),Sg)}catch{return!1}return!0}function sh(i={}){let e=ld();return e==="gpu"||e==="software"&&!!i.allowSoftware}function Jg(i,e={}){let t=A=>typeof HTMLElement<"u"&&A instanceof HTMLElement,n=A=>{let V=A.clear;return r(V)?{element:null,rest:{...A,clear:!1}}:t(V)?{element:{element:V},rest:{...A,clear:void 0}}:V&&typeof V=="object"&&t(V.element)?{element:V,rest:{...A,clear:void 0}}:{element:null,rest:A}},r=A=>!!A&&typeof A=="object"&&"rects"in A,s=n(e).element,a=r(e.clear)?e.clear:null,o=Po(n(e).rest),c=e.onError,h=i.ownerDocument,u=!h||typeof document>"u"||h===document,f=e.context??"auto",d=!u||f==="own"||f==="auto"&&Jf<2&&(()=>{let A=i.clientWidth||0,V=i.clientHeight||0,K=Math.min(globalThis.devicePixelRatio||1,o.maxPixelRatio);return A*V*K*K})()>=921600?i.getContext("webgl2",$c):null,p=!d&&u?ad():null,m=p?i.getContext("2d",{alpha:!0}):null,x=!(!p||!m),g=x?p.gl:d??i.getContext("webgl2",$c);if(!g)throw new Error("WebGL2 is not available for the glyph field.");let l=g;x||Jf++;let w=Bg(l),T=x?null:l.getContextAttributes(),y=!!T&&Object.keys($c).every(A=>T[A]===$c[A]),E=x?null:new zg(l,()=>{jr()&&$t()}),R=()=>x?p.frames:E;x&&(A=>{Hg.add(A)})(i),i.setAttribute("role","img"),i.setAttribute("aria-label",e.label??"ASCII artwork"),i.dataset.renderer="glyph-field";let P=!1,B=x?null:l.getExtension("KHR_parallel_shader_compile"),M,_,F=null,z=null,L=null,D=null,H=null,Y=[],G=[],re=null,fe=!1,ge=null,Te=null,qe=[],Re=0,Q=0,we=1,j=0,ee=ih(o.cellSize,o.cellAspect,1,2),be=2,Ne=0,Ee=0,rt=0,Pe=null,Mt=!1,Et=null,st=0,ht=0,Bt=0,I=null,Ft=0,wt=0,vt=0,Oe=!0,C=0,b=[0,1],U=-1/0,le=-1/0,ue=!1,se=(()=>{let A=typeof navigator>"u"?void 0:navigator;return 1e3/(A&&(A.hardwareConcurrency>0&&A.hardwareConcurrency<=2||A.deviceMemory&&A.deviceMemory<=2||A.connection?.saveData)?30:60)-2})(),je=new Float32Array(16),ye=!1,Le=0,at=0,ce=!0,Se=!1,Ae=!1,Xe=!1,_e=!1,mt=!0,v=(e.effects??[]).slice(0,4),q=!!e.live,k=[],oe={target:null,at:[-1,-1],presence:0,data:new Float32Array(32)},ie=null,J=null,de=1/60,De=0,ve=0,me=[],Ye=new Float32Array(16),gt=()=>{if(!s)return;let{element:A,padding:V=32,feather:K=.16,shape:te="rect",pointer:ne=0}=s,pe=aM(i.getBoundingClientRect(),A.getBoundingClientRect(),V,K,te),N=pe&&ne>0?{...pe,pointer:Math.min(1,Math.max(0,ne))}:pe,ae=o.clear;JSON.stringify(ae)!==JSON.stringify(N)&&(o={...o,clear:N},ce=!0)},Tt=null,Zt=new Uint8Array(0),tn=0,ln=0,nn=!1,zn=null,cn=new Float64Array(0),vn=!0,Qn=()=>{if(!a)return void(nn&&(nn=!1,ce=!0));let A=a.rects,V=typeof A=="function"?A():A;if(V===zn&&!vn)return;zn=V;let K=i.getBoundingClientRect(),[te,ne]=(function(ae,Me,Ke=256){let Fe=Math.min(.16666666666666666,Ke/Math.max(1,ae,Me));return[Math.max(2,Math.round(ae*Fe)),Math.max(2,Math.round(Me*Fe))]})(K.width,K.height),pe=new Float64Array(4*V.length+6);pe[0]=K.left,pe[1]=K.top,pe[2]=K.width,pe[3]=K.height,pe[4]=a.padding??8,pe[5]=a.softness??28,V.forEach((ae,Me)=>{pe[6+4*Me]=ae.left,pe[7+4*Me]=ae.top,pe[8+4*Me]=ae.width,pe[9+4*Me]=ae.height});let N=!vn&&pe.length===cn.length&&pe.every((ae,Me)=>ae===cn[Me]);vn=!1,N&&nn||(cn=pe,Zt=(function(ae,Me,Ke,Fe,he=8,ke=28,We=new Uint8Array(Ke*Fe)){let He=Ke*Fe;if(We.length!==He&&(We=new Uint8Array(He)),We.fill(0),!(Me.width>0&&Me.height>0&&ae.length))return We;let dt=Ke/Me.width,lt=Fe/Me.height,Pt=Math.max(0,Math.round(ke/2.56*dt)),Ue=he+.5*ke;for(let Ge of ae){if(!(Ge.width>0&&Ge.height>0))continue;let $e=Math.max(0,Math.round((Ge.left-Ue-Me.left)*dt)),yt=Math.min(Ke,Math.round((Ge.left+Ge.width+Ue-Me.left)*dt)),ut=Math.max(0,Math.round((Ge.top-Ue-Me.top)*lt)),tt=Math.min(Fe,Math.round((Ge.top+Ge.height+Ue-Me.top)*lt));for(let Rt=ut;Rt<tt;Rt++)We.fill(255,(Fe-1-Rt)*Ke+$e,(Fe-1-Rt)*Ke+Math.max($e,yt))}if(!Pt)return We;let Je=new Float32Array(Math.max(Ke,Fe)),xe=new Float32Array(Math.max(Ke,Fe)+1),Qe=(Ge,$e,yt)=>{for(let ut=0;ut<3;ut++){for(let tt=0;tt<Ge;tt++)Je[tt]=We[yt+tt*$e];xe[0]=0;for(let tt=0;tt<Ge;tt++)xe[tt+1]=xe[tt]+Je[tt];for(let tt=0;tt<Ge;tt++){let Rt=Math.max(0,tt-Pt),qt=Math.min(Ge,tt+Pt+1);We[yt+tt*$e]=Math.round((xe[qt]-xe[Rt])/(qt-Rt))}}};for(let Ge=0;Ge<Fe;Ge++)Qe(Ke,1,Ge*Ke);for(let Ge=0;Ge<Ke;Ge++)Qe(Fe,Ke,Ge);return We})(V,K,te,ne,pe[4],pe[5],Zt),Ae||(Tt??(Tt=sn(l.LINEAR)),l.bindTexture(l.TEXTURE_2D,Tt),l.pixelStorei(l.UNPACK_ALIGNMENT,1),l.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,!1),l.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),te!==tn||ne!==ln?l.texImage2D(l.TEXTURE_2D,0,l.R8,te,ne,0,l.RED,l.UNSIGNED_BYTE,Zt):l.texSubImage2D(l.TEXTURE_2D,0,0,0,te,ne,l.RED,l.UNSIGNED_BYTE,Zt),l.pixelStorei(l.UNPACK_ALIGNMENT,4),tn=te,ln=ne,nn=!0,ce=!0))},Vr=()=>{ce=!0,$t()},Ki=!1,vr=()=>{let A=!!a&&typeof a.rects=="function"&&typeof window<"u"&&typeof window.addEventListener=="function";A!==Ki&&(Ki=A,A?window.addEventListener("scroll",Vr,{passive:!0,capture:!0}):window.removeEventListener("scroll",Vr,{capture:!0}))},Ii=A=>A==="lantern"||A==="loupe"||A==="reveal",en={target:null,at:null,strength:0,trail:[]},ei=new Float32Array(36),mn=null,Gn=null,Fi=!1,et=()=>{if(!Re||!Q)return null;let A=Re/Q,V=Math.round(A>=1?128:128*A),K=Math.round(A>=1?128/A:128);return mn&&mn.width===V&&mn.height===K||(mn=new j1(V,K),Gn||(Gn=sn(l.LINEAR)),l.bindTexture(l.TEXTURE_2D,Gn),l.texImage2D(l.TEXTURE_2D,0,l.RGBA8,V,K,0,l.RGBA,l.UNSIGNED_BYTE,mn.pixels),Fi=!0),mn},Ht=null,Dn=null,S=new Uint8Array(0),O=!1,Z=null,$=null,X=-1,Ce=[-.5,-.8],Be=[0,0],Ie=()=>{if(Ht&&Pe)try{if($??($=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})),!$)return;let A=Pe instanceof HTMLVideoElement,V=A?Ht.cols>>1:Ht.cols,K=A?Ht.rows>>1:Ht.rows,te=$.canvas;te.width!==V||te.height!==K?(te.width=V,te.height=K):$.clearRect(0,0,V,K);let ne=st||1,pe=ht||1;$.drawImage(Pe,Di.offset[0]*ne,Di.offset[1]*pe,Di.scale[0]*ne,Di.scale[1]*pe,0,0,V,K),Z=(function(N,ae,Me,Ke,Fe=N){let he=ae*Me,ke=Ke?.length===he*Mo?Ke:new Float32Array(he*Mo);if(!he)return ke;let We=Math.min(ae,Me),He=new Float32Array(he),dt=new Float32Array(he),lt=new Float32Array(he),Pt=new Float32Array(he),Ue=new Float32Array(he),Je=new Float32Array(he);for(let St=0;St<he;St++){let Wt=N[4*St+3]/255;He[St]=(.299*N[4*St]+.587*N[4*St+1]+.114*N[4*St+2])/255*Wt}dt.set(He),pn(dt,Je,ae,Me,Math.max(1,Math.round(.012*We))),lt.set(He),pn(lt,Je,ae,Me,Math.max(1,Math.round(.03*We)));for(let St=0;St<he;St++){Pt[St]=Math.abs(He[St]-dt[St]);let Wt=Math.max(0,He[St]-.55)/.45;Ue[St]=Wt*Wt}pn(Pt,Je,ae,Me,Math.max(1,Math.round(.02*We)));let xe=1/Math.max(.02,Pi(Pt,.95));pn(Ue,Je,ae,Me,Math.max(1,Math.round(.05*We)));let Qe=1/Math.max(.03,Pi(Ue,.98)),Ge=Math.max(1,Math.ceil(Math.sqrt(he/12e3))),$e=Math.max(1,Math.floor(ae/Ge)),yt=Math.max(1,Math.floor(Me/Ge)),ut=$e*yt,tt=N,Rt=Fe;if(Ge>1){let St=new Uint8ClampedArray(4*ut),Wt=Fe===N?St:new Uint8ClampedArray(4*ut);for(let qn=0;qn<yt;qn++)for(let Tn=0;Tn<$e;Tn++){let xi=[0,0,0,0,0,0,0];for(let ni=qn*Ge;ni<(qn+1)*Ge;ni++)for(let zh=Tn*Ge;zh<(Tn+1)*Ge;zh++){let rp=4*(ni*ae+zh);for(let Qi=0;Qi<4;Qi++)xi[Qi]+=N[rp+Qi];if(Wt!==St)for(let Qi=0;Qi<3;Qi++)xi[4+Qi]+=Fe[rp+Qi]}let ki=4*(qn*$e+Tn),ip=Ge*Ge;for(let ni=0;ni<4;ni++)St[ki+ni]=xi[ni]/ip;if(Wt!==St){for(let ni=0;ni<3;ni++)Wt[ki+ni]=xi[4+ni]/ip;Wt[ki+3]=St[ki+3]}}tt=St,Rt=Wt}Xc?.n!==ut&&(Xc=new Y1(ut)),Xc.reset();let{depth:qt,water:an,sky:hn,falls:bn}=K1(tt,Rt,$e,yt,Xc),ui=Pi(qt,.03),_s=Pi(qt,.97),Bh=Math.max(.05,_s-ui),Ms=0,ws=0,Zi=0,Wo=new Float32Array(he);for(let St=0;St<Me;St++)for(let Wt=0;Wt<ae;Wt++){let qn=St*ae+Wt,Tn=qn*Mo,xi=hi((jc(qt,$e,yt,Wt,St,ae,Me)-ui)/Bh);ke[Tn+1]=xi,ke[Tn+8]=hi(jc(an,$e,yt,Wt,St,ae,Me)),ke[Tn+9]=hi(jc(hn,$e,yt,Wt,St,ae,Me)),ke[Tn+10]=hi(jc(bn,$e,yt,Wt,St,ae,Me));let ki=xi*xi*xi*(.25+He[qn]);Ms+=(Wt+.5)/ae*ki,ws+=(St+.5)/Me*ki,Zi+=ki,Wo[qn]=Math.hypot(lt[St*ae+Math.min(ae-1,Wt+1)]-lt[St*ae+Math.max(0,Wt-1)],lt[Math.min(Me-1,St+1)*ae+Wt]-lt[Math.max(0,St-1)*ae+Wt])}Ms=Zi>0?Math.max(.3,Math.min(.7,Ms/Zi)):.5,ws=Zi>0?Math.max(.3,Math.min(.7,ws/Zi)):.5;let Sa=1/Math.max(.004,Pi(Wo,.97));for(let St=0;St<Me;St++)for(let Wt=0;Wt<ae;Wt++){let qn=St*ae+Wt,Tn=qn*Mo,xi=(lt[St*ae+Math.min(ae-1,Wt+1)]-lt[St*ae+Math.max(0,Wt-1)])*Sa,ki=(lt[Math.min(Me-1,St+1)*ae+Wt]-lt[Math.max(0,St-1)*ae+Wt])*Sa;ke[Tn]=lt[qn],ke[Tn+2]=Math.min(1,Ue[qn]*Qe),ke[Tn+3]=Math.min(1,Pt[qn]*xe),ke[Tn+4]=Math.max(-1,Math.min(1,-xi)),ke[Tn+5]=Math.max(-1,Math.min(1,-ki)),ke[Tn+6]=Ms,ke[Tn+7]=ws}return ke})($.getImageData(0,0,V,K).data,V,K,Z),Be[0]=V,Be[1]=K,(function(N,ae,Me=[-.5,-.8],Ke=N.cols,Fe=N.rows){let{cols:he,rows:ke,speed:We,damp:He,wall:dt}=N,lt=Mo;if(ae.length!==Ke*Fe*lt)return Me;let Pt=0,Ue=0,Je=0;for(let xe=0,Qe=0;xe<ke;xe++){let Ge=Math.min(Fe-1,xe*Fe/ke|0);for(let $e=0;$e<he;$e++,Qe++){let yt=Math.min(Ke-1,$e*Ke/he|0),ut=(Ge*Ke+yt)*lt,tt=ae[ut+3],Rt=ae[ut+8],qt=ae[ut+9],an=ae[ut+2],hn=ae[ut+1],bn=yt<Ke-1?lt:0,ui=yt>0?-lt:0,_s=Ge<Fe-1?Ke*lt:0,Bh=Ge>0?-Ke*lt:0,Ms=Math.hypot(ae[ut+1+bn]-ae[ut+1+ui],ae[ut+1+_s]-ae[ut+1+Bh]),ws=Math.hypot(ae[ut+4],ae[ut+5]),Zi=Math.max(Rt,.9*qt),Wo=1-ua(.2,.8,tt),Sa=Math.max(.12,Math.max(Zi,.2+.65*Wo)*(1-.45*ua(.55,.95,hn)*(1-Rt)));We[Qe]=Sa*Sa;let St=Math.max(0,1-Zi);He[Qe]=.9*Rt+1.6*qt*(1-Rt)+St*(1.4+6.5*ua(.25,.9,tt)),dt[Qe]=Math.min(.4,.35*ua(.12,.35,Ms)*(1-.6*Rt)+.1*ua(.6,1,ws)*(1-Zi)),Pt+=($e/(he-1)-.5)*an,Ue+=(xe/(ke-1)-.5)*an,Je+=an}}if(vg(We,he,ke,2),vg(He,he,ke,1),Je>.5){let xe=Math.hypot(Pt,Ue);xe/Je>.02&&(Me[0]=Pt/xe,Me[1]=Ue/xe)}})(Ht,Z,Ce,V,K)}catch{}},Ve=(A,V,K)=>{if(!Re||!Q)return;let te=Re/Q,ne=Math.round(te>=1?128:128*te),pe=Math.round(te>=1?128/te:128);Ht&&Ht.cols===ne&&Ht.rows===pe||(Ht=new $1(ne,pe),Z=null,S=new Uint8Array(ne*pe*4),Dn??(Dn=sn(l.LINEAR)),l.bindTexture(l.TEXTURE_2D,Dn),l.texImage2D(l.TEXTURE_2D,0,l.RGBA8,ne,pe,0,l.RGBA,l.UNSIGNED_BYTE,null)),Ht.base=1.1*Math.min(ne,pe),Ht.mass=0,Ht.calm=7,Ht.fade=1.6,Ie(),X=vt,Ht.drop(A*(ne-1),V*(pe-1),K,2.2),$t()},Ze=A=>{if(!Ht?.live||!Dn)return!!O&&(O=!1,!0);Pe instanceof HTMLVideoElement&&X!==vt&&(Ie(),X=vt),Ht.step(A,.45+.55*Math.exp(-Ht.age/.7));let V=Math.min(1,Math.exp(-(Ht.age-.9)/.5));return V<.02?(Ht.clear(),O=!1,!0):((function(K,te,ne,pe,N=1,ae=K.cols,Me=K.rows){let{cols:Ke,rows:Fe,h:he,trace:ke}=K,We=N/Math.max(.01,K.front),He=ne[0],dt=ne[1],lt=te.length===ae*Me*11;for(let Pt=0,Ue=0;Pt<Fe;Pt++){let Je=Math.min(Me-1,Pt*Me/Fe|0);for(let xe=0;xe<Ke;xe++,Ue++){let Qe=he[Ue]*We,Ge=11*(Je*ae+Math.min(ae-1,xe*ae/Ke|0)),$e=lt?te[Ge+9]:0,yt=lt?Math.max(te[Ge+8],.75*(1-ua(.1,.45,te[Ge+3]))*(1-$e)):0,ut=Math.max(0,1-Math.max(yt,$e)),tt=.5*(he[xe<Ke-1?Ue+1:Ue]-he[xe>0?Ue-1:Ue])*We,Rt=.5*(he[Pt<Fe-1?Ue+Ke:Ue]-he[Pt>0?Ue-Ke:Ue])*We,qt=(6*-tt+(lt?.35*te[Ge+4]:0))*He+(6*-Rt+(lt?.35*te[Ge+5]:0))*dt,an=Math.max(-1,Math.min(1,qt)),hn=Qe>0?Qe:.45*Qe,bn=yt*(.8*hn+.4*an*Math.min(1,4*Math.abs(Qe)))+$e*(.3*Math.min(1,ke[Ue]*We)+.15*hn)+ut*(.55*hn+.25*an*Math.min(1,4*Math.abs(Qe))),ui=yt*Math.max(0,an)**3*Math.min(1,3*Math.max(0,Qe))*.9+ut*Math.max(0,an)**4*Math.min(1,3*Math.max(0,Qe))*.25;bn=Math.max(-1,Math.min(1,bn));let _s=Math.round(32767*bn+32768);pe[4*Ue]=_s>>>8,pe[4*Ue+1]=255&_s,pe[4*Ue+2]=Math.round(255*Math.min(1,ui)),pe[4*Ue+3]=255}}})(Ht,Z??new Float32Array(0),Ce,S,V,Be[0],Be[1]),l.bindTexture(l.TEXTURE_2D,Dn),l.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,!1),l.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),l.texSubImage2D(l.TEXTURE_2D,0,0,0,Ht.cols,Ht.rows,l.RGBA,l.UNSIGNED_BYTE,S),O=!0,!0)},ft=0,ot=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,At=!!ot?.matches,Lt=()=>o.respectReducedMotion&&At,Xt,rn=new Promise(A=>{Xt=A}),Gt=!0,nt=A=>c?.(A instanceof Error?A:new Error(String(A))),Vt=(A,V)=>{let K=l.createShader(A);return qe.push(K),l.shaderSource(K,V),l.compileShader(K),K},kt=A=>{if(x)return p.program(A);Te??(Te=Vt(l.VERTEX_SHADER,`#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}`));let V=l.createProgram(),K=Vt(l.FRAGMENT_SHADER,A);return l.attachShader(V,Te),l.attachShader(V,K),l.linkProgram(V),{program:V,locations:null,fragment:K}},Mn=(A,V=!1)=>{if(A.locations)return!0;if(x)return p.linked(A,V);let{program:K,fragment:te}=A;if(!V&&B&&!l.getProgramParameter(K,B.COMPLETION_STATUS_KHR))return!1;if(!l.getProgramParameter(K,l.LINK_STATUS)){if(l.isContextLost())return!1;throw new Error(l.getShaderInfoLog(te)||l.getProgramInfoLog(K)||"Glyph field program failed to link.")}let ne={};for(let pe=l.getProgramParameter(K,l.ACTIVE_UNIFORMS)-1;pe>=0;pe--){let N=l.getActiveUniform(K,pe).name.replace(/\[0\]$/,"");ne[N]=l.getUniformLocation(K,N)}return A.locations=ne,!0},Li=(A=!1)=>{if(!F||!z)return!1;try{if(!Mn(F,A))return!1}catch(V){if(!v.length)throw V;let K=v.map(te=>te.name).join(", ");return Rh([]),Uo(),nt(new Error(`Field effects (${K}) did not compile, so the field draws without them. ${V instanceof Error?V.message:String(V)}`)),!1}return Mn(z,A)},sn=A=>{let V=l.createTexture();return l.bindTexture(l.TEXTURE_2D,V),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MIN_FILTER,A),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MAG_FILTER,A===l.LINEAR_MIPMAP_LINEAR?l.LINEAR:A),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_S,l.CLAMP_TO_EDGE),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_T,l.CLAMP_TO_EDGE),V},$i=()=>{H&&(l.deleteTexture(H.ink),l.deleteTexture(H.under),l.deleteFramebuffer(H.buffer),H.glow&&l.deleteTexture(H.glow),H=null)},Yt=()=>(function(A,V,K,te,ne,pe,N){if(A!=="fill"||!(ne>0&&pe>0))return[N.width,N.height];let ae=V*te,Me=ae*K;return[ne/Math.max(1,Math.floor(ne/Me+1e-6)),pe/Math.max(1,Math.floor(pe/ae+1e-6))]})(o.cellFit,o.cellSize,o.cellAspect,we,Re,Q,ee),wn=()=>!!o.fluid&&So(o)==="fluid",kn=()=>{re?.release(),fe=!1,Y.forEach(A=>l.deleteTexture(A)),G.forEach(A=>l.deleteFramebuffer(A)),Y=[],G=[]};function Sn(){L&&!x&&l.deleteProgram(L.program),L=kt((A=>`#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uPrevious;
uniform vec2 uSize;
uniform float uAspect, uDt, uDecay, uEnergyDecay, uRadius, uSplat;
uniform vec2 uFrom, uTo, uForce;
out vec4 outColor;
${Ag(A)}
float segment(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.,1.);return length(pa-ba*h);}
void main(){
  vec2 uv=gl_FragCoord.xy/uSize;
  vec4 here=decodeFluid(texture(uPrevious,uv));
  vec4 state=decodeFluid(texture(uPrevious,uv-uDt*here.xy*vec2(1./uAspect,1.)));
  state.xy*=exp(-uDt*uDecay);
  state.z*=exp(-uDt*uEnergyDecay);
  if(uSplat>.5){
    vec2 scale=vec2(uAspect,1.);
    float d=segment(uv*scale,uFrom*scale,uTo*scale);
    float g=exp(-d*d/(uRadius*uRadius));
    state.xy+=uForce*g;
    state.z=min(1.,state.z+g*min(1.,length(uForce)*.5+.08));
  }
  float speed=length(state.xy);
  if(speed>5.)state.xy*=5./speed;
  outColor=encodeFluid(state);
}`)(P)),x?re?.release():re?.dispose(),re=P?null:(function(A,V,K){let te={splat:V(A1),curl:V(R1),vorticity:V(C1),divergence:V(P1),fade:V(I1),pressure:V(F1),gradient:V(L1),advect:V(D1)},ne=Object.values(te),pe=0,N=0,ae=[],Me=[],Ke=null,Fe=null,he=Ue=>{let Je=A.createTexture();A.bindTexture(A.TEXTURE_2D,Je),A.texParameteri(A.TEXTURE_2D,A.TEXTURE_MIN_FILTER,Ue),A.texParameteri(A.TEXTURE_2D,A.TEXTURE_MAG_FILTER,Ue),A.texParameteri(A.TEXTURE_2D,A.TEXTURE_WRAP_S,A.CLAMP_TO_EDGE),A.texParameteri(A.TEXTURE_2D,A.TEXTURE_WRAP_T,A.CLAMP_TO_EDGE),A.texImage2D(A.TEXTURE_2D,0,A.RGBA16F,pe,N,0,A.RGBA,A.HALF_FLOAT,null);let xe=A.createFramebuffer();return A.bindFramebuffer(A.FRAMEBUFFER,xe),A.framebufferTexture2D(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,Je,0),A.checkFramebufferStatus(A.FRAMEBUFFER)!==A.FRAMEBUFFER_COMPLETE?(A.deleteFramebuffer(xe),A.deleteTexture(Je),null):(A.viewport(0,0,pe,N),A.clearColor(0,0,0,1),A.clear(A.COLOR_BUFFER_BIT),{texture:Je,buffer:xe})},ke=Ue=>{Ue&&(A.deleteTexture(Ue.texture),A.deleteFramebuffer(Ue.buffer))},We=()=>{[...ae,...Me,Ke,Fe].forEach(ke),ae=[],Me=[],Ke=Fe=null},He=(Ue,Je)=>{let xe=Ue.locations;return A.useProgram(Ue.program),A.bindFramebuffer(A.FRAMEBUFFER,Je.buffer),A.uniform2f(xe.uTexel,1/pe,1/N),xe},dt=(Ue,Je,xe,Qe)=>{A.activeTexture(A.TEXTURE0+xe),A.bindTexture(A.TEXTURE_2D,Qe),A.uniform1i(Ue[Je],xe)},lt=()=>A.drawArrays(A.TRIANGLES,0,3),Pt=Ue=>{let Je=Ue[0];Ue[0]=Ue[1],Ue[1]=Je};return{resize(Ue,Je){We(),pe=Ue,N=Je;let xe=[he(A.LINEAR),he(A.LINEAR),he(A.NEAREST),he(A.NEAREST),he(A.NEAREST),he(A.NEAREST)];return A.bindFramebuffer(A.FRAMEBUFFER,null),xe.some(Qe=>!Qe)?(xe.forEach(ke),!1):(ae=[xe[0],xe[1]],Me=[xe[2],xe[3]],Ke=xe[4],Fe=xe[5],!0)},ready:()=>ne.every(K),step(Ue,Je){if(!ae.length||!Ke||!Fe)return;let xe;A.viewport(0,0,pe,N),Ue&&(xe=He(te.splat,ae[1]),dt(xe,"uVelocity",0,ae[0].texture),A.uniform2f(xe.uFrom,Ue.from[0],Ue.from[1]),A.uniform2f(xe.uTo,Ue.to[0],Ue.to[1]),A.uniform2f(xe.uForce,Ue.force[0],Ue.force[1]),A.uniform1f(xe.uAspect,Je.aspect),A.uniform1f(xe.uRadius,Je.radius),lt(),Pt(ae)),Je.curl>0&&(xe=He(te.curl,Fe),dt(xe,"uVelocity",0,ae[0].texture),lt(),xe=He(te.vorticity,ae[1]),dt(xe,"uVelocity",0,ae[0].texture),dt(xe,"uCurl",1,Fe.texture),A.uniform1f(xe.uStrength,Je.curl),A.uniform1f(xe.uDt,Je.dt),lt(),Pt(ae)),xe=He(te.divergence,Ke),dt(xe,"uVelocity",0,ae[0].texture),lt(),xe=He(te.fade,Me[1]),dt(xe,"uSource",0,Me[0].texture),A.uniform1f(xe.uAmount,.8),lt(),Pt(Me);for(let Qe=0;Qe<20;Qe++)xe=He(te.pressure,Me[1]),dt(xe,"uPressure",0,Me[0].texture),dt(xe,"uDivergence",1,Ke.texture),lt(),Pt(Me);xe=He(te.gradient,ae[1]),dt(xe,"uPressure",0,Me[0].texture),dt(xe,"uVelocity",1,ae[0].texture),lt(),Pt(ae),xe=He(te.advect,ae[1]),dt(xe,"uVelocity",0,ae[0].texture),A.uniform1f(xe.uDt,Je.dt),A.uniform1f(xe.uDissipation,Je.dissipation),lt(),Pt(ae),A.bindFramebuffer(A.FRAMEBUFFER,null)},get velocity(){return ae[0]?.texture??null},get size(){return[pe,N]},release:We,dispose(){We(),ne.forEach(({program:Ue})=>A.deleteProgram(Ue))}}})(l,kt,A=>Mn(A))}let Cn=()=>{kn();let A=o.fluid;if(!(A&&wn()&&Re&&Q))return;L||Sn();let V=A.resolution,K=Re/Q;if(Ne=K>=1?V:Math.max(8,Math.round(V*K)),Ee=K>=1?Math.max(8,Math.round(V/K)):V,fe=!!re&&re.resize(Ne,Ee),fe)return void(rt=0);let te=()=>{kn();for(let ne=0;ne<2;ne++){let pe=sn(l.LINEAR);l.texImage2D(l.TEXTURE_2D,0,P?l.RGBA8:l.RGBA16F,Ne,Ee,0,l.RGBA,P?l.UNSIGNED_BYTE:l.HALF_FLOAT,null);let N=l.createFramebuffer();l.bindFramebuffer(l.FRAMEBUFFER,N),l.framebufferTexture2D(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,pe,0),Y.push(pe),G.push(N)}return l.checkFramebufferStatus(l.FRAMEBUFFER)===l.FRAMEBUFFER_COMPLETE};if(!te()){if(P)throw new Error("The glyph field could not allocate its fluid buffers.");P=!0,Uo(),Sn(),te()}for(let ne of G)l.bindFramebuffer(l.FRAMEBUFFER,ne),l.viewport(0,0,Ne,Ee),l.clearColor(P?.5:0,P?.5:0,0,1),l.clear(l.COLOR_BUFFER_BIT);l.bindFramebuffer(l.FRAMEBUFFER,null),rt=0},br=-1,ti=!1,gh=A=>A.post.bloom>0||A.post.scanlines>0||A.post.grain>0||A.post.chroma>0||A.post.curvature>0;function Uo(){F&&!x&&l.deleteProgram(F.program),z&&!x&&l.deleteProgram(z.program),$i(),F=kt(Rg(P,v)),br=da.indexOf(o.mark),ti=gh(o),z=kt(Qf(br,ti)),(x?p.canCompileInParallel:B)||Li(!0)}let Pd=()=>cd(o,ee),xh=()=>{ce=!0,$t()},vh=()=>jg(o,ee),bh=()=>{if(be=zr(o.charset).length,ee=ih(o.cellSize,o.cellAspect,we,be),j=we,x){let K=vh();if(D?.key!==K){let te=D;D=p.atlas(K,yh,xh),p.releaseAtlas(te,xh),M=D.texture}return void(ce=!0)}let{image:V}=yh();l.bindTexture(l.TEXTURE_2D,M),l.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),l.texImage2D(l.TEXTURE_2D,0,l.RGBA8,l.RGBA,l.UNSIGNED_BYTE,V),typeof V.getContext=="function"&&(V.width=V.height=1),ce=!0};function yh(){return cM(o,ee,x)}let Id=typeof document>"u"?void 0:document.fonts,_h=()=>{if(!Id?.load)return;let A=Pd();Id.load(A,zr(o.charset).join("")).then(()=>{if(!Se&&!Ae&&Pd()===A){if(Bo++,!x)return bh(),void $t();D&&!D.final&&D.key===vh()&&p.paintAtlas(D,yh)}},()=>{})},Fd=A=>A.trim().replace(/^["']|["']$/g,"").toLowerCase(),Mh=()=>{if(b=[0,1],Go=!1,Pe&&o.levels!=="none")try{let A=document.createElement("canvas");A.width=A.height=64;let V=A.getContext("2d",{willReadFrequently:!0});Pe===I&&(V.imageSmoothingQuality="medium"),V.drawImage(Pe,0,0,64,64),b=_g(V.getImageData(0,0,64,64).data)}catch{b=[0,1]}},Wr=null,No=null,ys=!1,yr=-1/0,Oo=new Uint8Array(0),Xr=null,wh=()=>{if(ys=!1,_a=!1,!Pe||o.scope==="all")return;let A=st||1,V=ht||1,K=Math.max(8,Math.round(A>=V?96:96*A/V)),te=Math.max(8,Math.round(V>=A?96:96*V/A));try{if(Xr??(Xr=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})),!Xr)return;let ne=Xr.canvas;ne.width!==K||ne.height!==te?(ne.width=K,ne.height=te):Xr.clearRect(0,0,K,te),Xr.drawImage(Pe,0,0,K,te),Ld(Xr.getImageData(0,0,K,te).data,K,te)}catch{return}},Ld=(A,V,K)=>{if(ys=!1,_a=!1,Pe&&o.scope!=="all"&&(No=Xg(A,V,K,null,No),No.key!=="none")){Oo.length!==V*K*4&&(Oo=new Uint8Array(V*K*4));for(let te=0;te<V*K;te++)Oo[4*te+3]=Math.round(255*No.subject[te]);Wr??(Wr=sn(l.LINEAR)),l.bindTexture(l.TEXTURE_2D,Wr),l.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,!1),l.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),l.texImage2D(l.TEXTURE_2D,0,l.RGBA8,V,K,0,l.RGBA,l.UNSIGNED_BYTE,Oo),ys=!0}},Ji,_r=null,Sh="",Bo=0,Th="",Dd=null,kd=null,Ud=-1,Mr=!1,qr=null,ya={levels:!1,scope:!1},zo=0,Eh=-1/0,Go=!1,_a=!1,Nd=null,Od=0,Bd=0,Ma=()=>{if(!Pe)return;let A=performance.now(),V=Pe instanceof HTMLVideoElement||q;V&&Ji===void 0&&(Ji=(function(N){if(!N.getExtension("EXT_color_buffer_float")||!N.getExtension("EXT_float_blend"))return null;let ae=($e,yt=`#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}`)=>{let ut=(hn,bn)=>{let ui=N.createShader(hn);return N.shaderSource(ui,bn),N.compileShader(ui),ui},tt=N.createProgram(),Rt=ut(N.VERTEX_SHADER,yt),qt=ut(N.FRAGMENT_SHADER,$e);if(N.attachShader(tt,Rt),N.attachShader(tt,qt),N.linkProgram(tt),N.deleteShader(Rt),N.deleteShader(qt),!N.getProgramParameter(tt,N.LINK_STATUS))return N.deleteProgram(tt),null;let an=new Map;return{program:tt,at:hn=>(an.has(hn)||an.set(hn,N.getUniformLocation(tt,hn)),an.get(hn))}},Me=Wf.get(N);Me||Wf.set(N,Me=new Map);let Ke=Me,Fe=($e,yt)=>{let ut=Ke.get($e);if(ut)return ut;let tt=yt();if(!tt)throw new Error("The glyph field could not build its GPU measure.");return Ke.set($e,tt),tt},he=[],ke=($e,yt,ut,tt)=>{let Rt=N.createTexture(),qt=N.createFramebuffer();N.bindTexture(N.TEXTURE_2D,Rt);for(let[hn,bn]of[[N.TEXTURE_MIN_FILTER,tt],[N.TEXTURE_MAG_FILTER,tt],[N.TEXTURE_WRAP_S,N.CLAMP_TO_EDGE],[N.TEXTURE_WRAP_T,N.CLAMP_TO_EDGE]])N.texParameteri(N.TEXTURE_2D,hn,bn);let an={texture:Rt,buffer:qt,width:0,height:0,format:$e,type:yt,base:ut};return he.push(an),an},We=($e,yt,ut)=>{let tt=$e;$e.width===yt&&$e.height===ut||($e.width=yt,$e.height=ut,N.bindTexture(N.TEXTURE_2D,$e.texture),N.texImage2D(N.TEXTURE_2D,0,tt.format,yt,ut,0,tt.base,tt.type,null),N.bindFramebuffer(N.FRAMEBUFFER,$e.buffer),N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,$e.texture,0))},He=null,dt=null,lt=null,Pt=null,Ue=null,Je=null,xe=N.createVertexArray(),Qe=($e,yt)=>{N.bindFramebuffer(N.FRAMEBUFFER,yt.buffer),N.viewport(0,0,yt.width,yt.height),N.useProgram($e.program)},Ge=($e,yt,ut)=>{N.activeTexture(N.TEXTURE11),N.bindTexture(N.TEXTURE_2D,$e),N.uniform1i(yt.at(ut),11)};return{get levels(){return dt?.texture??null},get scope(){return Je?.texture??null},measureLevels($e,yt,ut){let tt=Vf(yt,ut,128),Rt=Fe("histogram",()=>ae(`#version 300 es
precision highp float;
out vec4 o;
void main(){ o=vec4(1.); }`,`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uSource;
uniform int uLevel, uWidth;
void main(){
  vec4 c=texelFetch(uSource,ivec2(gl_VertexID%uWidth,gl_VertexID/uWidth),uLevel);
  float bin=floor(dot(c.rgb,vec3(.2126,.7152,.0722))*255.+.5);
  gl_Position=c.a*255.<8.?vec4(2.,2.,0.,1.):vec4((bin+.5)/128.-1.,0.,0.,1.);
  gl_PointSize=1.;
}`)),qt=Fe("levels",()=>ae(`#version 300 es
precision highp float;
uniform sampler2D uHistogram;
out vec4 o;
void main(){
  float count=0.;
  for(int v=0;v<256;v++)count+=texelFetch(uHistogram,ivec2(v,0),0).r;
  if(count<.5){o=vec4(0.,1.,0.,1.);return;}
  float low=1.,high=1.,seen=0.;bool lowFound=false;
  for(int v=0;v<256;v++){
    seen+=texelFetch(uHistogram,ivec2(v,0),0).r;
    if(!lowFound&&seen>=count*.02){low=float(v)/255.;lowFound=true;}
    if(seen>=count*.98){high=float(v)/255.;break;}
  }
  o=high-low<.08?vec4(0.,1.,0.,1.):vec4(low,high,0.,1.);
}`));He??(He=ke(N.R32F,N.FLOAT,N.RED,N.NEAREST)),dt??(dt=ke(N.RGBA32F,N.FLOAT,N.RGBA,N.NEAREST)),We(He,256,1),We(dt,1,1),Qe(Rt,He),N.clearColor(0,0,0,0),N.clear(N.COLOR_BUFFER_BIT),Ge($e,Rt,"uSource"),N.uniform1i(Rt.at("uLevel"),tt.level),N.uniform1i(Rt.at("uWidth"),tt.width),N.enable(N.BLEND),N.blendFunc(N.ONE,N.ONE),N.bindVertexArray(xe),N.drawArrays(N.POINTS,0,tt.width*tt.height),N.disable(N.BLEND),Qe(qt,dt),Ge(He.texture,qt,"uHistogram"),N.drawArrays(N.TRIANGLES,0,3)},measureScope($e,yt,ut){let tt=Vf(yt,ut,128),Rt=Math.min(128,tt.width),qt=Math.min(128,tt.height),an=Fe("stats",()=>ae(k1)),hn=Fe("subject",()=>ae(U1)),bn=Fe("blur",()=>ae(`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uImage;
uniform ivec2 uStep;
uniform int uRadius;
out vec4 o;
void main(){
  ivec2 at=ivec2(gl_FragCoord.xy),last=textureSize(uImage,0)-1;
  float sum=0.,total=0.;
  for(int k=-16;k<=16;k++){
    if(k<-2*uRadius||k>2*uRadius)continue;
    float w=float(2*uRadius+1-abs(k));
    sum+=texelFetch(uImage,clamp(at+uStep*k,ivec2(0),last),0).a*w;total+=w;
  }
  o=vec4(texelFetch(uImage,at,0).r,0.,0.,sum/total);
}`));lt??(lt=ke(N.RGBA32F,N.FLOAT,N.RGBA,N.NEAREST)),Pt??(Pt=ke(N.RGBA8,N.UNSIGNED_BYTE,N.RGBA,N.NEAREST)),Ue??(Ue=ke(N.RGBA8,N.UNSIGNED_BYTE,N.RGBA,N.NEAREST)),Je??(Je=ke(N.RGBA8,N.UNSIGNED_BYTE,N.RGBA,N.LINEAR)),We(lt,1,1),We(Pt,Rt,qt),We(Ue,Rt,qt),We(Je,Rt,qt),N.bindVertexArray(xe),Qe(an,lt),Ge($e,an,"uSource"),N.uniform1i(an.at("uLevel"),tt.level),N.uniform2i(an.at("uSize"),Rt,qt),N.drawArrays(N.TRIANGLES,0,3),Qe(hn,Pt),Ge($e,hn,"uSource"),N.uniform1i(hn.at("uLevel"),tt.level),N.activeTexture(N.TEXTURE12),N.bindTexture(N.TEXTURE_2D,lt.texture),N.uniform1i(hn.at("uStats"),12),N.drawArrays(N.TRIANGLES,0,3);let ui=Math.min(8,Math.max(1,Math.round(.02*Math.min(Rt,qt))));Qe(bn,Ue),Ge(Pt.texture,bn,"uImage"),N.uniform2i(bn.at("uStep"),1,0),N.uniform1i(bn.at("uRadius"),ui),N.drawArrays(N.TRIANGLES,0,3),Qe(bn,Je),Ge(Ue.texture,bn,"uImage"),N.uniform2i(bn.at("uStep"),0,1),N.drawArrays(N.TRIANGLES,0,3)},dispose(){for(let $e of he)N.deleteTexture($e.texture),N.deleteFramebuffer($e.buffer);xe&&N.deleteVertexArray(xe),he.length=0,He=dt=lt=Pt=Ue=Je=null}}})(l));let K=V&&!!Ji;V&&!K&&(()=>{let N=qr?.poll();N&&(ya.levels&&o.levels!=="none"&&(b=_g(N.data)),ya.scope&&Ld(N.data,N.width,N.height),(ya.levels||ya.scope)&&(ce=!0))})(),zo++;let te=zo-Eh>=8,ne=V&&U!==-1/0?A-U>1500&&te&&o.levels!=="none"?"later":null:"now",pe=V&&yr!==-1/0?A-yr>160&&te&&o.scope!=="all"&&o.hover!=="none"?"later":null:"now";K||ne!=="now"||(Mh(),U=A),K||pe!=="now"||(wh(),yr=A),l.bindTexture(l.TEXTURE_2D,_),l.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,!1),l.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1);try{let N=Pe,ae=N.videoWidth||N.naturalWidth||N.width,Me=N.videoHeight||N.naturalHeight||N.height;if(Nd===_&&Od===ae&&Bd===Me&&ae&&Me?l.texSubImage2D(l.TEXTURE_2D,0,0,0,l.RGBA,l.UNSIGNED_BYTE,Pe):(l.texImage2D(l.TEXTURE_2D,0,l.RGBA8,l.RGBA,l.UNSIGNED_BYTE,Pe),Nd=_,Od=ae,Bd=Me),V?Mr=!0:(l.generateMipmap(l.TEXTURE_2D),Mr=!1),wt=ae*Me*4*4/3,K){let he=!!ne&&o.levels!=="none",ke=!!pe&&o.scope!=="all"&&o.hover!=="none";return(he||ke)&&(Mr&&(l.generateMipmap(l.TEXTURE_2D),Mr=!1),he&&(Ji.measureLevels(_,ae,Me),Go=!0),ke&&(Ji.measureScope(_,ae,Me),_a=!0,ys=!0),Eh=zo,ce=!0),ne&&(U=A),void(pe&&(yr=A))}let Ke=ne==="later",Fe=pe==="later";!Ke&&!Fe||qr?.pending||(qr??(qr=(function(he){let ke=null,We=null,He=null,dt=0,lt=0,Pt=0,Ue=!1,Je=null,xe=-1;return{get pending(){return!!He},request(Qe,Ge,$e,yt){if(He||Ue||!Ge||!$e)return!1;let ut=Vf(Ge,$e,yt);try{ke??(ke=he.createFramebuffer()),We??(We=he.createBuffer());let tt=he.getParameter(he.FRAMEBUFFER_BINDING);if(he.bindFramebuffer(he.FRAMEBUFFER,ke),he.framebufferTexture2D(he.FRAMEBUFFER,he.COLOR_ATTACHMENT0,he.TEXTURE_2D,Qe,ut.level),Je!==Qe||xe!==ut.level){if(he.checkFramebufferStatus(he.FRAMEBUFFER)!==he.FRAMEBUFFER_COMPLETE)return he.bindFramebuffer(he.FRAMEBUFFER,tt),Ue=!0,!1;Je=Qe,xe=ut.level}let Rt=ut.width*ut.height*4;return he.bindBuffer(he.PIXEL_PACK_BUFFER,We),Rt!==dt&&(he.bufferData(he.PIXEL_PACK_BUFFER,Rt,he.STREAM_READ),dt=Rt),he.pixelStorei(he.PACK_ALIGNMENT,4),he.readPixels(0,0,ut.width,ut.height,he.RGBA,he.UNSIGNED_BYTE,0),he.bindBuffer(he.PIXEL_PACK_BUFFER,null),he.framebufferTexture2D(he.FRAMEBUFFER,he.COLOR_ATTACHMENT0,he.TEXTURE_2D,null,0),he.bindFramebuffer(he.FRAMEBUFFER,tt),He=he.fenceSync(he.SYNC_GPU_COMMANDS_COMPLETE,0),he.flush(),lt=ut.width,Pt=ut.height,!!He}catch{return Ue=!0,!1}},poll(){if(!He)return null;let Qe=he.clientWaitSync(He,0,0);if(Qe!==he.ALREADY_SIGNALED&&Qe!==he.CONDITION_SATISFIED)return Qe===he.WAIT_FAILED&&(he.deleteSync(He),He=null,Ue=!0),null;he.deleteSync(He),He=null;let Ge=new Uint8Array(lt*Pt*4);return he.bindBuffer(he.PIXEL_PACK_BUFFER,We),he.getBufferSubData(he.PIXEL_PACK_BUFFER,0,Ge),he.bindBuffer(he.PIXEL_PACK_BUFFER,null),{data:Ge,width:lt,height:Pt}},dispose(){He&&he.deleteSync(He),ke&&he.deleteFramebuffer(ke),We&&he.deleteBuffer(We),He=ke=We=null}}})(l)),Mr&&(l.generateMipmap(l.TEXTURE_2D),Mr=!1),qr.request(_,ae,Me,128)?(ya={levels:Ke,scope:Fe},Eh=zo,Ke&&(U=A),Fe&&(yr=A)):(Ke&&(Mh(),U=A),Fe&&(wh(),yr=A)))}catch(N){nt(N)}},zd=()=>{qr=null,_r=null,Sh="",P=!l.getExtension("EXT_color_buffer_float")&&!l.getExtension("EXT_color_buffer_half_float"),Uo(),ge=x?p.vertexArray():l.createVertexArray(),x||(M=sn(l.NEAREST)),_=sn(l.LINEAR_MIPMAP_LINEAR),l.bindTexture(l.TEXTURE_2D,_),l.texImage2D(l.TEXTURE_2D,0,l.RGBA8,1,1,0,l.RGBA,l.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),l.generateMipmap(l.TEXTURE_2D),Re=Q=0,j=0,jr(),_h(),Pe&&Ma()};function jr(){let A=i.clientWidth||i.clientHeight?{width:i.clientWidth,height:i.clientHeight}:i.getBoundingClientRect();ue=!A.width||!A.height;let V=Yg(o,A.width,A.height,R().scale),K=Math.max(1,Math.round(A.width*V)),te=Math.max(1,Math.round(A.height*V));if(K===Re&&te===Q&&V===we)return!1;let ne=!Re||Math.abs(K/te-Re/Q)>.01;return we=V,Re=K,Q=te,i.width=Re,i.height=Q,j!==we&&bh(),(ne||wn()&&!Y.length&&!fe)&&Cn(),ce=!0,!0}let Gd=null,Ho=new Float32Array(18),wa=[0,0,0],Hd=[1,1,1],Vd=[0,0,0,0],Di=yg(1,1,1,1,"cover"),Wd=null,Xd=0,qd=0,jd=0,Yd=0,Kd=()=>{Gd!==o&&(Gd=o,wa=Kc(o.ink),Hd=Kc(o.highlight==="auto"?"#ffffff":o.highlight),Vd=o.background==="transparent"?[0,0,0,0]:[...Kc(o.background),1],Ho.fill(0),o.ramp.forEach((Je,xe)=>Ho.set(Kc(Je),3*xe))),Wd===o&&Xd===Re&&qd===Q&&jd===st&&Yd===ht||(Wd=o,Xd=Re,qd=Q,jd=st,Yd=ht,Di=yg(Re,Q,st||1,ht||1,o.fit,o.focus)),x?p.begin(Re,Q):E.begin();let A=o.fluid,V=Pe&&Ft?ee.height/Q*Ft*Di.scale[1]:1,K=o.sample==="point"?0:Math.max(0,Math.log2(Math.max(1,V))-.5);Mr&&Pe&&(K>0||o.backdrop>0)&&(l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,_),l.generateMipmap(l.TEXTURE_2D),Mr=!1);let te=(()=>{let[Je,xe]=Yt(),Qe=Math.ceil(Re/Je-1e-4),Ge=Math.ceil(Q/xe-1e-4),$e=o.post.bloom>0;if(H&&H.columns===Qe&&H.rows===Ge&&!!H.glow===$e)return H;$i();let yt=()=>{let an=sn(l.NEAREST);return l.texStorage2D(l.TEXTURE_2D,1,P?l.RGBA8:l.RGBA16F,Qe,Ge),an},ut=yt(),tt=yt(),Rt=l.createFramebuffer();l.bindFramebuffer(l.FRAMEBUFFER,Rt),l.framebufferTexture2D(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,ut,0),l.framebufferTexture2D(l.FRAMEBUFFER,l.COLOR_ATTACHMENT1,l.TEXTURE_2D,tt,0);let qt=null;return $e&&(qt=sn(l.LINEAR_MIPMAP_LINEAR),l.texStorage2D(l.TEXTURE_2D,Math.floor(Math.log2(Math.max(Qe,Ge)))+1,l.RGBA8,Qe,Ge),l.bindFramebuffer(l.FRAMEBUFFER,Rt),l.framebufferTexture2D(l.FRAMEBUFFER,l.COLOR_ATTACHMENT2,l.TEXTURE_2D,qt,0)),l.drawBuffers(qt?[l.COLOR_ATTACHMENT0,l.COLOR_ATTACHMENT1,l.COLOR_ATTACHMENT2]:[l.COLOR_ATTACHMENT0,l.COLOR_ATTACHMENT1]),H={ink:ut,under:tt,glow:qt,buffer:Rt,columns:Qe,rows:Ge}})(),ne=F.locations,pe=z.locations,N=So(o),ae=!Lt();l.bindFramebuffer(l.FRAMEBUFFER,te.buffer),l.viewport(0,0,te.columns,te.rows),l.useProgram(F.program),l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,_),Ln(l,ne.uSource,0),l.activeTexture(l.TEXTURE2),l.bindTexture(l.TEXTURE_2D,(fe?re?.velocity:Y[rt])??_),Ln(l,ne.uFluid,2),l.activeTexture(l.TEXTURE3),l.bindTexture(l.TEXTURE_2D,Gn??_),Ln(l,ne.uTrailMap,3),l.activeTexture(l.TEXTURE6),l.bindTexture(l.TEXTURE_2D,(_a?Ji?.scope:Wr)??_),Ln(l,ne.uScope,6);let Me=Go&&Pe&&o.levels==="auto"?Ji?.levels??null:null;l.activeTexture(l.TEXTURE11),l.bindTexture(l.TEXTURE_2D,Me??_),Ln(l,ne.uLevelMap,11),pt(l,ne.uLevelsFromMap,Me?1:0),l.activeTexture(l.TEXTURE7),l.bindTexture(l.TEXTURE_2D,Dn??_),Ln(l,ne.uTapMap,7),pt(l,ne.uTapOn,O&&Pe&&Mt?1:0),pt(l,ne.uScopeMode,ys&&o.scope!=="all"?o.scope==="subject"?1:2:0),pt(l,ne.uFluidMode,fe?1:0),Ln(l,ne.uHoverMode,N==="fluid"?1:N==="lantern"?2:N==="trail"&&Fi?3:N==="loupe"?4:N==="reveal"?5:0),pt(l,ne.uTrailAmount,o.trail.strength),((Je,xe,Qe,Ge,$e)=>{xe&&Gr(xe,Io(Qe,Ge,$e))&&Je.uniform3f(xe,Qe,Ge,$e)})(l,ne.uLight,en.at?.[0]??-1,en.at?.[1]??-1,Ii(N)?en.strength:0),To(l,ne.uTrail,ei),pt(l,ne.uLightRadius,o.lantern.radius),pt(l,ne.uLightGain,o.lantern.strength),pt(l,ne.uClock,performance.now()/1e3),pt(l,ne.uFlicker,ae?1:0),ci(l,ne.uFluidTexel,1/Math.max(1,Ne),1/Math.max(1,Ee)),ci(l,ne.uResolution,Re,Q);let[Ke,Fe]=Yt();var he;ci(l,ne.uCell,Ke,Fe),pt(l,ne.uCount,be),pt(l,ne.uBlend,o.blend==="on"||be<=9&&(o.blend==="coarse"||o.blend==="auto"&&Mt)?1:0),Or(l,ne.uSourceMap,Di.scale[0],Di.scale[1],Di.offset[0],Di.offset[1]),Ln(l,ne.uScene,Pe?0:(he=o.scene,T1[he]??3)),Ln(l,ne.uMark,da.indexOf(o.mark)),pt(l,ne.uOrder,o.glyphOrder==="text"?1:o.glyphOrder==="scatter"&&o.mark==="glyph"?2:0);let ke=o.sample==="shape"&&!!Pe&&o.mark==="glyph"&&o.glyphOrder!=="text"&&o.glyphOrder!=="scatter"&&ee.height>=8;if(ke&&(Dd===o&&kd===ee&&Ud===Bo||(Dd=o,kd=ee,Ud=Bo,Th=`${vh()}|${Bo}`),Sh!==Th||!_r)){Sh=Th;let Je=hM(o);l.activeTexture(l.TEXTURE9),_r??(_r=sn(l.NEAREST)),l.bindTexture(l.TEXTURE_2D,_r),l.pixelStorei(l.UNPACK_ALIGNMENT,1),l.texImage2D(l.TEXTURE_2D,0,l.R8,16,Math.max(1,Je.length/16),0,l.RED,l.UNSIGNED_BYTE,Je),l.pixelStorei(l.UNPACK_ALIGNMENT,4)}l.activeTexture(l.TEXTURE9),l.bindTexture(l.TEXTURE_2D,ke&&_r||_),Ln(l,ne.uShapes,9),pt(l,ne.uShapeOn,ke?1:0),pt(l,ne.uShapeLod,Math.max(0,Math.log2(Math.max(1,V/5))-.5)),pt(l,ne.uShapeTone,20),pt(l,ne.uShapeWindow,3),pt(l,ne.uShapeGate,.15);let We=o.glyphOrder==="text"&&o.textRepeat==="row"?(function(Je){let xe=zr(Je),Qe=[];for(let Ge=0;Ge<xe.length&&Qe.length<16;){if(!xe[Ge].trim()){Ge++;continue}let $e=Ge;for(;Ge<xe.length&&xe[Ge].trim();)Ge++;Qe.push($e,Ge-$e)}return Qe})(o.charset):[];je.fill(0),je.set(We),((Je,xe,Qe)=>{xe&&Gr(xe,Qe)&&Je.uniform2fv(xe,Qe)})(l,ne.uWords,je),pt(l,ne.uWordCount,We.length/2),pt(l,ne.uScale,o.scale);let He=o.clear;Or(l,ne.uClear,He?He.x:0,He?He.y:0,He?He.width:0,He?He.height:0),pt(l,ne.uClearFeather,He?He.feather:.1),pt(l,ne.uClearShape,He&&He.shape==="rect"?1:0),pt(l,ne.uClearPointer,He?He.pointer??0:0),l.activeTexture(l.TEXTURE8),l.bindTexture(l.TEXTURE_2D,Tt??_),Ln(l,ne.uClearMap,8);let dt=nn&&!!a&&!!Tt;pt(l,ne.uClearMapOn,dt?Math.min(1,Math.max(0,a.strength??.85)):0),pt(l,ne.uClearBend,dt?.035*Math.min(1,Math.max(0,a.bend??.5)):0),ci(l,ne.uClearTexel,1/Math.max(1,tn),1/Math.max(1,ln));let lt=performance.now();Ye.fill(0);for(let Je=0;Je<me.length;Je++){let xe=me[Je],Qe=4*Je;Ye[Qe]=xe.x,Ye[Qe+1]=xe.y,Ye[Qe+2]=(lt-xe.born)/1e3,Ye[Qe+3]=xe.strength}var Pt;$f(l,ne.uPulse,Ye),To(l,ne.uInk,wa),To(l,ne.uRamp,Ho),pt(l,ne.uRampCount,o.color==="source"?0:o.ramp.length),To(l,ne.uHighlight,Hd),pt(l,ne.uHighlightAuto,o.highlight==="auto"?1:0),$f(l,ne.uBackground,Vd),pt(l,ne.uBrightness,o.brightness),pt(l,ne.uContrast,o.contrast),pt(l,ne.uGamma,o.gamma),pt(l,ne.uInvert,o.invert?1:0),pt(l,ne.uVignette,o.vignette),pt(l,ne.uSourceColor,o.color==="source"?1:0),pt(l,ne.uRefraction,A?A.refraction*(ae?1:.25):0),pt(l,ne.uGlow,A?A.glow:0),pt(l,ne.uTime,at),pt(l,ne.uDrift,ae?o.drift:0),pt(l,ne.uFluidOn,A&&N==="fluid"&&(Y.length||fe)?1:0),pt(l,ne.uLod,K),pt(l,ne.uSaturation,o.saturation),pt(l,ne.uShade,o.shade),pt(l,ne.uBackdrop,Pe?o.backdrop:0),ci(l,ne.uLevels,Pe&&o.levels==="auto"?b[0]:0,Pe&&o.levels==="auto"?b[1]:1),v.length&&(Pt=F.locations,$f(l,Pt.uFx,(function(Je,xe=new Float32Array(32)){return xe.fill(0),Je.slice(0,4).forEach((Qe,Ge)=>{Zf(Qe).forEach(($e,yt)=>{xe[8*Ge+yt]=Qe.params[$e]})}),xe})(v,oe.data)),Or(l,Pt.uFxPointer,oe.at[0],oe.at[1],oe.presence,Lt()?0:1),pt(l,Pt.uFxTime,at)),l.bindVertexArray(ge),l.drawArrays(l.TRIANGLES,0,3),te.glow&&(l.activeTexture(l.TEXTURE10),l.bindTexture(l.TEXTURE_2D,te.glow),l.generateMipmap(l.TEXTURE_2D)),l.bindFramebuffer(l.FRAMEBUFFER,null),l.viewport(0,0,Re,Q),l.useProgram(z.program),l.activeTexture(l.TEXTURE1),l.bindTexture(l.TEXTURE_2D,M),Ln(l,pe.uAtlas,1),l.activeTexture(l.TEXTURE4),l.bindTexture(l.TEXTURE_2D,te.ink),Ln(l,pe.uCells,4),l.activeTexture(l.TEXTURE5),l.bindTexture(l.TEXTURE_2D,te.under),Ln(l,pe.uUnder,5),ci(l,pe.uResolution,Re,Q),ci(l,pe.uCell,ee.width,ee.height),ci(l,pe.uPitch,Ke,Fe),pt(l,pe.uColumns,ee.columns),pt(l,pe.uDotScale,o.dotScale),ci(l,pe.uDir,Math.cos(o.markAngle*Math.PI/180),Math.sin(o.markAngle*Math.PI/180)),Ln(l,pe.uMark,da.indexOf(o.mark)),Or(l,pe.uLine,o.linePitch,o.lineWeight,o.sparkle,0),Or(l,pe.uInlay,o.accents,o.shuffle,Math.floor(7*at),od(o.charset).length),pt(l,pe.uSourceColor,o.color==="source"?1:0),To(l,pe.uRamp,Ho),pt(l,pe.uRampCount,o.color==="source"?0:o.ramp.length),Or(l,pe.uFade,wa[0],wa[1],wa[2],o.mark==="inlay"||o.glyphOrder!=="tone"&&o.mark==="glyph"?1:0);let Ue=o.post;l.activeTexture(l.TEXTURE10),l.bindTexture(l.TEXTURE_2D,te.glow??_),Ln(l,pe.uGlow,10),Or(l,pe.uPost,te.glow?Ue.bloom:0,Ue.bloomRadius,Ue.scanlines,Ue.grain),Or(l,pe.uPost2,Ue.chroma,Ue.curvature,at,2),l.drawArrays(l.TRIANGLES,0,3),x&&p.present(m,Re,Q)},Ah=typeof document<"u"&&document.hidden,$d=()=>!Se&&!Ae&&!Xe&&!ue&&(mt||Gt)&&!Ah;function Rh(A){k.forEach(K=>K()),v=A.slice(0,4);let V=()=>{ce=!0,$t()};k=v.map(K=>K.subscribe(V)),v.length||(oe.target=null,oe.presence=0)}Rh(v);let Vo=A=>{if(ye=!1,!$d())return;let V=performance.now(),K=(A-Le)/1e3,te=Math.min(1/30,Math.max(1/480,K));Le=A,de=.9*de+.1*Math.min(K,.25),De=de>1/24?De+1:0;try{R().overloaded&&ve<2&&De>10&&(ve=2),De>45&&ve<2&&R().atMinimum&&(De=0,ve++,ve===1&&we>1?(o={...o,maxPixelRatio:1},jr()):ve=2);let ne=Li(),pe=!_e&&(!(ve>=2)||Pe instanceof HTMLVideoElement)&&(!(!(Pe instanceof HTMLVideoElement)||Pe.paused||Pe.ended)||!Lt()&&(!Pe&&o.scene!=="none"||o.drift>0||o.post.grain>0||v.some(Me=>Me.animate)));pe&&(at+=te*o.speed),!q||!Pe||Pe instanceof HTMLVideoElement||_e||(Ma(),ce=!0),Pe instanceof HTMLVideoElement&&Pe.readyState>=2&&Oe&&(Oe=!("requestVideoFrameCallback"in Pe),Ma(),vt++,ce=!0);let N=So(o),ae=N==="fluid"&&(J!==null||A<ft);if(ae?((Me,Ke)=>{let Fe=o.fluid;if(!Fe||!G.length&&!fe||(fe?!re?.ready():!L||!Mn(L)))return;let he=Re/Q,ke=J;if(J=null,fe&&re){let lt=5200*Fe.force*(Lt()?.35:1);return ke&&(ft=Ke+1e3*Math.min(9,6/Math.max(.3,Fe.dissipation))),void re.step(ke?{from:ke.from,to:ke.to,force:[(ke.to[0]-ke.from[0])*lt,(ke.to[1]-ke.from[1])*lt]}:null,{dt:Math.min(Me,1/60),radius:1.1*Fe.radius,curl:Fe.curl,dissipation:Fe.dissipation,aspect:he})}let We=0,He=0;if(ke){let lt=(Lt()?1:3)*Fe.force;We=(ke.to[0]-ke.from[0])*he*lt*4,He=(ke.to[1]-ke.from[1])*lt*4,ft=Ke+7/Math.min(Fe.dissipation,1.1*Fe.dissipation)*1e3}let dt=L.locations;l.bindFramebuffer(l.FRAMEBUFFER,G[1-rt]),l.viewport(0,0,Ne,Ee),l.useProgram(L.program),l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,Y[rt]),Ln(l,dt.uPrevious,0),ci(l,dt.uSize,Ne,Ee),pt(l,dt.uAspect,he),pt(l,dt.uDt,Me),pt(l,dt.uDecay,Fe.dissipation),pt(l,dt.uEnergyDecay,1.1*Fe.dissipation),pt(l,dt.uRadius,Fe.radius),pt(l,dt.uSplat,ke?1:0),ci(l,dt.uFrom,ke?.from[0]??0,ke?.from[1]??0),ci(l,dt.uTo,ke?.to[0]??0,ke?.to[1]??0),ci(l,dt.uForce,We,He),l.drawArrays(l.TRIANGLES,0,3),rt=1-rt})(te,A):J=null,Ii(N)&&(ae=((Me,Ke)=>{let Fe=o.lantern,he=en.target;if(he){let We=en.at;if(We)if(Lt())We[0]=he[0],We[1]=he[1];else{let lt=1-Math.exp(-Fe.follow*Me);We[0]+=(he[0]-We[0])*lt,We[1]+=(he[1]-We[1])*lt}else en.at=[he[0],he[1]];let He=en.at,dt=en.trail[en.trail.length-1];Fe.trail>0&&(!dt||Ke-dt.born>28&&Math.hypot(He[0]-dt.x,He[1]-dt.y)>.004)&&(en.trail.push({x:He[0],y:He[1],born:Ke}),en.trail.length>12&&en.trail.shift())}en.strength+=((he?1:0)-en.strength)*(1-Math.exp(-Me*(he?9:5)));let ke=en.trail;for(let We=ke.length-1;We>=0;We--)Fe.trail>0&&Ke-ke[We].born<4e3*Fe.trail||ke.splice(We,1);ei.fill(0);for(let We=0;We<ke.length;We++){let He=ke[We];ei[3*We]=He.x,ei[3*We+1]=He.y,ei[3*We+2]=.55*Math.exp(-(Ke-He.born)/1e3/Math.max(.01,Fe.trail))}return en.strength>.003||ke.length>0})(te,A)||ae),N==="trail"){let Me=!!mn?.active;ae=(Ke=>{let Fe=et();return!(!Fe||!Fe.active||(Fe.step(Ke),l.bindTexture(l.TEXTURE_2D,Gn),l.texSubImage2D(l.TEXTURE_2D,0,0,0,Fe.width,Fe.height,l.RGBA,l.UNSIGNED_BYTE,Fe.pixels),Fi=!0,0))})(te)||ae,Me&&!mn?.active&&(ce=!0)}if((Ht?.live||O)&&(ae=Ze(te)||ae,O||(ce=!0)),v.length&&(function(Me){let Ke=oe.target&&!_e?1:0,Fe=!1;if(oe.target){oe.presence===0&&(oe.at=[...oe.target]);let he=1-Math.exp(-Me/.035),ke=oe.target[0]-oe.at[0],We=oe.target[1]-oe.at[1];Math.abs(ke)+Math.abs(We)>1e-4&&(oe.at=[oe.at[0]+ke*he,oe.at[1]+We*he],Fe=!0)}if(oe.presence!==Ke){let he=Me/.15;oe.presence=Ke>oe.presence?Math.min(Ke,oe.presence+he):Math.max(Ke,oe.presence-he),Fe=!0}return Fe})(te)&&(ae=!0),me.length){for(let Me=me.length-1;Me>=0;Me--)A-me[Me].born>=2400&&me.splice(Me,1);ae=!0,me.length||(ce=!0)}a&&Qn(),ne&&(ae||ce||pe&&A-le>=se*O1())&&(Kd(),le=A,ce=!1,!Gt||Bt&&!Pe||(Gt=!1,Xt())),(pe||ae||J||!ne||q&&Pe&&!_e)&&(ye=!0,th(Vo)),E&&!Ae&&E.end(A,performance.now()-V)}catch(ne){Xe=!0,nt(ne)}};function $t(){!ye&&$d()&&(Le=performance.now(),ye=!0,th(Vo))}let Ch=(A,V)=>{let K=i.getBoundingClientRect();if(!K.width||!K.height)return null;let te=(A-K.left)/K.width,ne=(V-K.top)/K.height;return te<-.05||te>1.05||ne<-.05||ne>1.05?null:[te,1-ne]},Ph=A=>{v.length&&!_e&&(oe.target=A?[A[0],1-A[1]]:null,$t());let V=So(o);if(V==="none"||_e)return ie=null,void(en.target=null);if(Ii(V))return en.target=A?[A[0],1-A[1]]:null,ie=null,void $t();if(V==="trail"){let K=et();return K?(A?K.move(A[0],1-A[1],o.trail.radius,performance.now()):K.leave(),ie=null,void $t()):void 0}A?(ie&&(J=J?{from:J.from,to:A}:{from:ie,to:A}),ie=A,$t()):ie=null},Jd=e.interactionTarget??window,Zd={target:Jd,move:A=>{A.type==="pointerdown"&&(function(K){if(o.tap==="none"||!Pe||!Mt||_e||Se||Lt()||K.button!==0||typeof Element<"u"&&K.target instanceof Element&&K.target.closest("button, a, input, select, summary, textarea, label"))return;let te=Ch(K.clientX,K.clientY);!te||te[0]<0||te[0]>1||te[1]<0||te[1]>1||(o.tap==="surface"?Ve(te[0],1-te[1],1):(me=[...me,{x:te[0],y:1-te[1],born:performance.now(),strength:1}].slice(-4),$t()))})(A);let V=Ch(A.clientX,A.clientY);Jd===window&&(Zd.inside=!!V),Ph(V)},leave:()=>{ie=null,mn?.leave(),oe.target&&(oe.target=null,$t()),en.target&&(en.target=null,$t())},near:()=>mt},Yr=[V1(Zd)],Ih=()=>{let A=jr();gt(),a&&(vn=!0,ce=!0),(A||ce)&&$t()},Fh=s?Zc(s.element,Ih):()=>{};Yr.push(Zc(i,Ih),()=>Fh()),Yr.push(Og(i,"25% 0px",A=>{mt=A.isIntersecting,mt&&(ce=!0,$t())})),Yr.push(Lg(()=>{Ah=document.hidden,Ah||(ce=!0,$t())})),Yr.push(Dg(()=>{At=!!ot?.matches,ce=!0,$t()})),Yr.push(ga(rd,A=>{let V=A.fontfaces??[],K=o.font.split(",").map(Fd);V.some(te=>K.includes(Fd(te.family)))&&_h()})),vr(),Yr.push(()=>{a=null,vr()});let Lh=A=>{A?.preventDefault(),Ae=!0,x||w(),ye&&nh(Vo),ye=!1},Dh=()=>{Ae=!1,x?l=p.gl:w(),E?.reset(),qe.length=0,Te=null,D=null,F=z=L=null,H=null,Y=[],G=[],re=null,fe=!1,Gn=null,mn=null,Fi=!1,Wr=null,ys=!1,Dn=null,Ht=null,O=!1,(A=>{Wf.delete(A)})(l),Ji=void 0,Go=_a=!1,Tt=null,nn=!1,tn=ln=0,vn=!0;try{zd(),ce=!0,$t()}catch(A){nt(A)}},Qd={lost:()=>Lh(),restored:Dh,rescale:()=>{jr()&&$t()},size:()=>[Re,Q],bytes:()=>{let A=P?4:8;return Re*Q*4+wt+(H?H.columns*H.rows*(2*A+(H.glow?16/3:0)):0)+Ne*Ee*A*(fe?6:Y.length)+(mn?mn.width*mn.height*4:0)}};x?p.join(Qd):(i.addEventListener("webglcontextlost",Lh),i.addEventListener("webglcontextrestored",Dh));let kh=()=>{Et&&(Et.pause(),Et.removeAttribute("src"),Et.load(),Et=null),C&&Pe instanceof HTMLVideoElement&&"cancelVideoFrameCallback"in Pe&&Pe.cancelVideoFrameCallback(C),C=0},Uh=()=>{I?.close(),I=null},_0=async A=>{let V=await createImageBitmap(A,{premultiplyAlpha:"none"}),K=[V.width,V.height],te=(function(ne,pe,N,ae,Me,Ke,Fe=8){if(!(N>=16&&ae>=16&&ne>0&&pe>0&&Me>0))return 1;let he=Fe/Me/(Ke==="cover"?Math.min(ne/N,pe/ae):Math.max(ne/N,pe/ae));return he>.5?1:2**-Math.floor(Math.log2(1/he))})(V.width,V.height,Re,Q,ee.height,o.fit);if(te===1)return{element:V,owned:!0,natural:K};try{return{element:await createImageBitmap(V,{resizeWidth:Math.max(1,Math.round(V.width*te)),resizeHeight:Math.max(1,Math.round(V.height*te)),resizeQuality:"medium",premultiplyAlpha:"none"}),owned:!0,natural:K}}finally{V.close()}},Nh=A=>new Promise((V,K)=>{let te=new Image;te.crossOrigin="anonymous",te.decoding="async",te.onload=()=>V({element:te,owned:!1}),te.onerror=()=>K(new Error("The glyph field could not load this image.")),te.src=A}),ep=(A,V,K)=>{let{element:te,owned:ne}=A;if(Se||K!==Bt)return void(ne&&te instanceof HTMLVideoElement?(te.pause(),te.removeAttribute("src"),te.load()):ne&&te.close());te!==Pe&&(kh(),Uh()),Et=ne&&te instanceof HTMLVideoElement?te:null,!ne||te instanceof HTMLVideoElement||(I=te);let pe=te!==Pe;Pe=te,Mt=typeof V=="string"||V instanceof HTMLImageElement||V instanceof HTMLVideoElement,Ft=te instanceof HTMLVideoElement?te.videoHeight:te instanceof HTMLImageElement?te.naturalHeight:te.height,st=A.natural?.[0]??(te instanceof HTMLVideoElement?te.videoWidth:te instanceof HTMLImageElement?te.naturalWidth:te.width),ht=A.natural?.[1]??Ft,Oe=!0,pe&&(U=yr=-1/0),te instanceof HTMLVideoElement&&pe&&(N=>{let ae=N;if(!ae.requestVideoFrameCallback)return;let Me=()=>{Se||Pe!==N||(Oe=!0,$t(),C=ae.requestVideoFrameCallback(Me))};C=ae.requestVideoFrameCallback(Me)})(te),Ae||Ma(),ce=!0,$t()},tp=(A,V)=>{Gt&&A===Bt&&(Gt=!1,Xt()),nt(V)},Oh=A=>{let V=++Bt;if(!A)return kh(),Uh(),Pe=null,st=ht=Ft=wt=0,Mt=!1,ce=!0,$t(),Promise.resolve();if((K=>!(typeof K=="string"||K instanceof HTMLImageElement&&!K.complete||K instanceof HTMLVideoElement&&K.readyState<2))(A)){try{ep({element:A,owned:!1},A,V)}catch(K){tp(V,K)}return Promise.resolve()}return(async K=>{if(typeof K!="string")return K instanceof HTMLImageElement&&!K.complete?K.decode().then(()=>({element:K,owned:!1})):K instanceof HTMLVideoElement&&K.readyState<2?new Promise((pe,N)=>{K.addEventListener("loadeddata",()=>pe({element:K,owned:!1}),{once:!0}),K.addEventListener("error",()=>N(new Error("The glyph field could not load this video.")),{once:!0})}):{element:K,owned:!1};if(oM.test(K))return new Promise((pe,N)=>{let ae=document.createElement("video");ae.crossOrigin="anonymous",ae.muted=!0,ae.loop=!0,ae.playsInline=!0,ae.preload="auto",ae.addEventListener("loadeddata",()=>{ae.play().catch(()=>{}),pe({element:ae,owned:!0})},{once:!0}),ae.addEventListener("error",()=>N(new Error("The glyph field could not load this video.")),{once:!0}),ae.src=K});if(typeof createImageBitmap!="function"||typeof fetch!="function")return Nh(K);let te;try{te=await(await fetch(K).then(pe=>{if(!pe.ok)throw new Error("The glyph field could not load this image.");return pe})).blob()}catch(pe){if(pe instanceof Error&&pe.message.startsWith("The glyph field"))throw pe;return Nh(K)}if(!/svg/i.test(te.type))try{return await _0(te)}catch{}let ne=URL.createObjectURL(te);try{return await Nh(ne)}finally{URL.revokeObjectURL(ne)}})(A).then(K=>ep(K,A,V),K=>tp(V,K))};zd(),gt();let np=e.source??null;return np?(Bt=1,Oh(np)):$t(),{canvas:i,ready:rn,get settings(){return o},update(A){let V=o,{element:K,rest:te}=n(A);if("clear"in A&&s?.element!==K?.element?(Fh(),s=K,Fh=K?Zc(K.element,Ih):()=>{}):"clear"in A&&(s=K),"clear"in A){let N=r(A.clear)?A.clear:null;N!==a&&(a=N,vn=!0,ce=!0,vr(),$t())}o=Po(K?{...te,clear:o.clear}:te,o),gt(),A.label&&i.setAttribute("aria-label",A.label),o.maxPixelRatio!==V.maxPixelRatio&&jr(),o.charset===V.charset&&o.cellSize===V.cellSize&&o.cellAspect===V.cellAspect&&o.font===V.font&&o.fontWeight===V.fontWeight&&o.glyphScale===V.glyphScale||(bh(),_h()),o.levels!==V.levels&&Mh(),o.scope===V.scope||Ae||(wh(),yr=performance.now());var ne,pe;((!!V.fluid&&So(V)==="fluid")!==wn()||o.fluid&&V.fluid&&o.fluid.resolution!==V.fluid.resolution)&&Cn(),"source"in A&&Oh(A.source??null),"live"in A&&(q=!!A.live),"effects"in A&&(ne=A.effects??[],pe=v,ne.length!==pe.length||!ne.every((N,ae)=>N===pe[ae]))?(Rh(A.effects??[]),Ae||Uo()):o.mark===V.mark&&gh(o)===ti||Ae||(z&&!x&&l.deleteProgram(z.program),br=da.indexOf(o.mark),ti=gh(o),z=kt(Qf(br,ti))),ce=!0,$t()},setSource:Oh,pointer(A,V=0){if(A===null)return void Ph(null);let K=i.getBoundingClientRect();Ph(Ch(K.left+A,K.top+V))},redraw(){if(!(Se||Ae||Xe)&&Re)try{Li(!(Gt&&(x?p.canCompileInParallel:B)))&&(!q||!Pe||Pe instanceof HTMLVideoElement||Ma(),Kd(),Gt||(ce=!1))}catch(A){Xe=!0,nt(A)}},pulse(A={}){if(Se||Lt())return;let V=i.getBoundingClientRect();if(!V.width||!V.height)return;let K=A.x??V.width/2,te=A.y??V.height/2;if(A.element){let pe=A.element.getBoundingClientRect();K=pe.left+pe.width/2-V.left,te=pe.top+pe.height/2-V.top}let ne=Math.max(0,Math.min(2,A.strength??1));o.tap==="surface"&&Pe&&Mt?Ve(K/V.width,te/V.height,ne):(me=[...me,{x:K/V.width,y:te/V.height,born:performance.now(),strength:ne}].slice(-4),$t())},play(){_e=!1,Pe instanceof HTMLVideoElement&&Pe.play().catch(()=>{}),ce=!0,$t()},pause(){_e=!0,Pe instanceof HTMLVideoElement&&Pe.pause()},resize(){jr()&&$t()},destroy(){if(!Se){if(Se=!0,x||Jf--,ye&&nh(Vo),ye=!1,Yr.forEach(A=>A()),k.forEach(A=>A()),x?p.leave(Qd):(i.removeEventListener("webglcontextlost",Lh),i.removeEventListener("webglcontextrestored",Dh)),kh(),Uh(),Pe=null,!Ae)if(kn(),$i(),l.deleteTexture(_),Gn&&l.deleteTexture(Gn),Wr&&l.deleteTexture(Wr),qr?.dispose(),Ji?.dispose(),_r&&l.deleteTexture(_r),Tt&&l.deleteTexture(Tt),x)p.releaseAtlas(D,xh),re?.release();else{l.deleteTexture(M);for(let A of[F,z,L])A&&l.deleteProgram(A.program);re?.dispose(),qe.forEach(A=>l.deleteShader(A)),ge&&l.deleteVertexArray(ge),y&&l.getExtension("WEBGL_lose_context")?.loseContext()}D=null}}}}var Eo,uM=/\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i,Tg=null;function fM(){if(Eo!==void 0)return Eo;try{let i=typeof OffscreenCanvas=="function"?new OffscreenCanvas(1,1).getContext("webgl2"):null;Eo=typeof Worker=="function"&&typeof HTMLCanvasElement=="function"&&"transferControlToOffscreen"in HTMLCanvasElement.prototype&&typeof createImageBitmap=="function"&&typeof URL.createObjectURL=="function"&&!!i,i?.getExtension("WEBGL_lose_context")?.loseContext()}catch{Eo=!1}return Eo}function Eg(i){let e=i.clear,t=typeof HTMLElement=="function"&&(e instanceof HTMLElement||!!e&&typeof e=="object"&&e.element instanceof HTMLElement),n=!!e&&typeof e=="object"&&typeof e.rects=="function",r=i.interactionTarget;return!(i.effects?.length||t||n||r!=null&&r!==window)}var Jc=i=>{let{source:e,onError:t,effects:n,interactionTarget:r,worker:s,label:a,...o}=i;return o};function dM(i,e){if(!fM()||!Eg(e))return null;let t={...e},n=Po(Jc(t)),r=null,s="",a=!1,o=!1,c=null,h=[],u=(Q,we=[])=>{if(c||a)for(let j of we)j.close?.();else r&&o?r.postMessage(Q,we):h.push({message:Q,transfer:we})},f,d,p=new Promise((Q,we)=>{f=Q,d=we});p.catch(()=>{});let m=Q=>{t.onError?t.onError(Q):typeof console<"u"&&console.error(Q)};i.setAttribute("role","img"),i.setAttribute("aria-label",t.label??"ASCII artwork"),i.dataset.renderer="glyph-field";let x=()=>{let Q=i.getBoundingClientRect();return[i.clientWidth||Q.width,i.clientHeight||Q.height,Q.left,Q.top]},g=!0,l=()=>({reducedMotion:typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches,darkScheme:typeof matchMedia=="function"&&matchMedia("(prefers-color-scheme: dark)").matches}),w=!1,T=()=>{w||(w=!0,requestAnimationFrame(()=>{w=!1,u({type:"box",box:x()})}))},y=[Zc(i,T),Og(i,"25% 0px",Q=>{g=Q.isIntersecting,u({type:"visible",value:g})}),Lg(()=>u({type:"hidden",value:document.hidden})),Dg(()=>u({type:"media",...l()})),sd(()=>u({type:"media",...l()}))],E=()=>T(),R=Q=>u({type:"pointer",event:Q.type,clientX:Q.clientX,clientY:Q.clientY,pointerType:Q.pointerType,buttons:Q.buttons}),P=()=>u({type:"pointer",event:"pointerleave",clientX:0,clientY:0});addEventListener("scroll",E,{passive:!0,capture:!0}),addEventListener("resize",E,{passive:!0}),addEventListener("pointermove",R,{passive:!0,capture:!0}),addEventListener("pointerdown",R,{passive:!0,capture:!0}),document.addEventListener("pointerleave",P),y.push(()=>{removeEventListener("scroll",E,{capture:!0}),removeEventListener("resize",E),removeEventListener("pointermove",R,{capture:!0}),removeEventListener("pointerdown",R,{capture:!0}),document.removeEventListener("pointerleave",P)});let B,M=null,_=0,F=!1,z=!1,L=0,D=async(Q,we,j)=>{let ee=await Q;j!==_||a?ee.close():(we&&o&&!c&&(z=!0,L=performance.now()),u({type:"frame",frame:ee,streaming:we},[ee]))},H=(Q,we)=>{if(F||we!==_||z&&performance.now()-L<500||Q instanceof HTMLVideoElement&&Q.readyState<2)return;let j;F=!0;try{j=Q instanceof HTMLVideoElement&&typeof VideoFrame=="function"?new VideoFrame(Q):createImageBitmap(Q)}catch{return void(F=!1)}D(j,!0,we).finally(()=>{F=!1})},Y=()=>{M?.(),M=null},G=(Q,we)=>{let j=0,ee=!1,be=()=>{ee||(H(Q,we),Ne())},Ne=()=>{j="requestVideoFrameCallback"in Q?Q.requestVideoFrameCallback(be):requestAnimationFrame(be)};Ne(),M=()=>{ee=!0,"cancelVideoFrameCallback"in Q?Q.cancelVideoFrameCallback(j):cancelAnimationFrame(j)}},re=null,fe=()=>{re&&(re.pause(),re.removeAttribute("src"),re.load(),re=null)},ge=null,Te=async Q=>{if(c)return c.setSource(Q);let we=++_;if(Y(),fe(),ge=null,!Q)return B=void 0,void u({type:"url",url:null});if(typeof Q=="string"&&!uM.test(Q))return B=new URL(Q,document.baseURI).href,void u({type:"url",url:B});if(B=void 0,typeof Q=="string"){let j=document.createElement("video");return Object.assign(j,{crossOrigin:"anonymous",muted:!0,loop:!0,playsInline:!0,preload:"auto"}),await new Promise((ee,be)=>{j.addEventListener("loadeddata",()=>ee(),{once:!0}),j.addEventListener("error",()=>be(new Error("The glyph field could not load this video.")),{once:!0}),j.src=Q}).catch(ee=>{m(ee)}),we!==_?(j.removeAttribute("src"),void j.load()):(re=j,j.play().catch(()=>{}),void G(j,we))}if(Q instanceof HTMLVideoElement)G(Q,we);else if(Q instanceof HTMLCanvasElement)t.live?(ge=Q,((j,ee)=>{let be=0,Ne=()=>{be=requestAnimationFrame(Ne),g&&!document.hidden&&H(j,ee)};be=requestAnimationFrame(Ne),M=()=>cancelAnimationFrame(be)})(Q,we)):await D(createImageBitmap(Q),!1,we);else if(Q instanceof HTMLImageElement){try{await Q.decode()}catch{}await D(createImageBitmap(Q),!1,we)}else await D(createImageBitmap(Q),!1,we)},qe=()=>{if(!a&&!c){for(let{transfer:Q}of h)for(let we of Q)we.close?.();h.length=0;try{c=Jg(i,{...t,worker:!1}),c.ready.then(f,d)}catch(Q){d(Q),m(Q)}}};(Tg??(Tg=Promise.resolve().then(()=>(sg(),rg)).then(({default:Q})=>Q||null,()=>null))).then(Q=>{if(a)return;if(!Q)return void qe();try{s=URL.createObjectURL(new Blob([Q],{type:"text/javascript"})),r=new Worker(s)}catch{return void qe()}let we=r,j=setTimeout(()=>{o||(we.terminate(),r=null,qe())},1e4);we.onerror=ee=>{ee.preventDefault(),o?m(new Error("The glyph field worker stopped.")):(clearTimeout(j),we.terminate(),r=null,qe())},we.onmessage=({data:ee})=>{if(ee.type==="loaded"){if(clearTimeout(j),a)return;let be;try{be=i.transferControlToOffscreen()}catch{return we.terminate(),r=null,void qe()}o=!0,we.postMessage({type:"init",canvas:be,options:Jc(t),ratio:globalThis.devicePixelRatio||1,box:x(),hidden:document.hidden,visible:g,...l(),streaming:!!ge||!!M,url:B},[be]);for(let{message:Ne,transfer:Ee}of h.splice(0))we.postMessage(Ne,Ee)}else ee.type==="took"?z=!1:ee.type==="ready"?f():ee.type==="error"?m(new Error(String(ee.message))):ee.type!=="atlas"&&ee.type!=="shapes"||(async be=>{let Ne=document.fonts,Ee=be.settings;try{await Ne?.load(`${Ee.fontWeight} 16px ${Ee.font}`,Ee.charset)}catch{}if(!a&&!c)if(be.type==="atlas"&&be.layout){let{image:rt}=rh(Ee,be.layout,!1),Pe=await createImageBitmap(rt);rt.width=rt.height=1,u({type:"atlas",key:be.key,image:Pe},[Pe])}else{let rt=Kg(Ee);u({type:"shapes",key:be.key,data:rt},[rt.buffer])}})(ee)}}),t.source!=null&&Te(t.source);let Re=(Q,...we)=>{c?c[Q](...we):u({type:"call",method:Q,args:we})};return{canvas:i,ready:p,get settings(){return c?c.settings:n},update(Q){if(c)return void c.update(Q);Eg({...t,...Q})||m(new Error("This change needs the page (effects, an element clear zone or another interaction target); the field in a worker leaves it out.")),t={...t,...Q},n=Po(Jc(t));let we=Jc(Q);u({type:"update",options:we}),"source"in Q?Te(Q.source??null):"live"in Q&&ge===null&&t.live&&Te(t.source??null)},setSource:Q=>(t={...t,source:Q},Te(Q)),pointer(Q,we){Re("pointer",Q,we)},redraw(){ge&&(F=!1,z=!1,H(ge,_)),Re("redraw")},pulse(Q={}){let{element:we,...j}=Q;if(we){let ee=we.getBoundingClientRect(),be=i.getBoundingClientRect();Re("pulse",{...j,x:ee.left+ee.width/2-be.left,y:ee.top+ee.height/2-be.top})}else Re("pulse",j)},play(){Re("play")},pause(){Re("pause")},resize(){c?c.resize():u({type:"box",box:x()})},destroy(){if(a)return;c&&c.destroy(),u({type:"destroy"}),a=!0,_++,Y(),fe(),y.forEach(we=>we());let Q=r;Q&&setTimeout(()=>Q.terminate(),1e3),s&&URL.revokeObjectURL(s)}}}function ah(i,e={}){if(e.worker){let t=dM(i,e);if(t)return t}return Jg(i,e)}var dd={standard:{label:"Classic ASCII",chars:" .:-=+*#%@"},asciify:{label:"Asciify",chars:" .:-=+YCIFSA#@"},minimal:{label:"Minimal",chars:" .:+"},detailed:{label:"Detailed",chars:" .,:;-~=+*xX#%@"},letters:{label:"Letters",chars:" .liLTYCFSAWM"},technical:{label:"Technical",chars:" ._:;+/>=][{}*$#@"},blocks:{label:"Tonal blocks",chars:" \u2591\u2592\u2593\u2588"},braille:{label:"Braille",chars:" \u2801\u2803\u2807\u2847\u28C7\u28E7\u28F7\u28FF"},fish:{label:"Fish",chars:" .'-,:;txoSX%#8@"},kanji:{label:"Kanji (Japanese)",chars:" \u4E00\u4E8C\u4EBA\u5C0F\u5927\u4E2D\u65E5\u672C\u76EE\u7530\u9577\u9593\u8A9E\u66F8\u66DC\u9A5A\u9727"}};function gd(i){if(i)return Object.prototype.hasOwnProperty.call(dd,i)?dd[i].chars:i.startsWith(" ")?i:" "+i}var pM={ascii:{mark:"glyph",charset:" .:-=+*#%@"},blocks:{mark:"glyph",charset:" \u2591\u2592\u2593\u2588"},braille:{mark:"glyph",charset:" \u2801\u2803\u2807\u2847\u28C7\u28E7\u28F7\u28FF"},dots:{mark:"dot"},lines:{mark:"glyph",charset:" -\u2550\u256A\u256C"},cross:{mark:"glyph",charset:" \xB7+xX#"},diagonal:{mark:"glyph",charset:" /\u2571\u2573"},diamond:{mark:"glyph",charset:" \xB7\u25C7\u25C8\u25C6"},mixed:{mark:"glyph",charset:" .:+/\u25C7#@"},pixel:{mark:"pixel"},mosaic:{mark:"mosaic"},lego:{mark:"lego"},voxel:{mark:"voxel"},disco:{mark:"disco"},dither:{mark:"dither"},hex:{mark:"hex"},led:{mark:"led"},cmyk:{mark:"cmyk"},stipple:{mark:"stipple"},engraving:{mark:"engraving"},crosshatch:{mark:"crosshatch"},woodblock:{mark:"woodblock"},risograph:{mark:"risograph"},pointillism:{mark:"pointillism"}};var mM=new RegExp("\\p{L}","u"),gM=new Set(Object.values(dd).map(i=>i.chars));var xM=new Set(["glyph","inlay"]),Fo=i=>xM.has(i??"glyph"),vM=i=>({cellSize:Math.max(7,i.cellSize??8),cellAspect:.62,glyphScale:.9}),r0=new WeakSet,s0=i=>{r0.add(i)},xd=i=>i&&!r0.has(i)?i.current.charset:void 0;function vd(i,e){let t=gd(e);if(!t)return i;if(Fo(i.mark))return{...i,charset:t,...md(t,i)};let n={...i,...vM(i)};return{...n,mark:"glyph",charset:t,...md(t,n)}}var oh=null;var Zg=new Set;var Qg=12,Bn=new Set,gr=null,Do=null,ch=0,Lo=-1e9,hh=0,uh=0,hd=!1,ud=!1,bM=()=>{let i=Do?.timeline?.currentTime;return typeof i=="number"?i:null};var fd=()=>typeof performance<"u"?performance.now():Date.now(),bd=()=>typeof innerHeight=="number"?innerHeight:0;function dh(i,e=i.getBoundingClientRect()){if(i.isConnected===!1||typeof i.getClientRects=="function"&&i.getClientRects().length===0)return 1/0;let t=e.bottom<0?-e.bottom:e.top-bd();return t>0?t:0}function yM(){try{let i=Do?.querySelectorAll?.("dialog:modal");return i?.length?i[i.length-1]:null}catch{return null}}var _M=1e8;function a0(i,e){if(i.eager)return void(i.wanted=!0);let t=bd(),n=dh(i.host,e);!t||n<=2*t?i.wanted=!0:n>3*t&&(i.wanted=!1)}function MM(i){let e=!1;for(let t of i)if(t?.target)for(let n of Bn)n.host===t.target&&(a0(n,t.boundingClientRect??void 0),e=!0);e&&ba()}var e0=()=>ba(),ph=0,fh=0,t0=()=>{let i=typeof scrollY=="number"?scrollY:0;i!==fh&&(ph=i>fh?1:-1),fh=i};function wM(i,e){return!e||!ph||i.getBoundingClientRect().top>0==ph>0?e:2*e}var lh=null,o0=i=>{lh!==i&&(lh?.removeEventListener?.("close",e0,!0),lh?.removeEventListener?.("scroll",t0,!0),i?.addEventListener?.("close",e0,!0),i?.addEventListener?.("scroll",t0,{capture:!0,passive:!0}),lh=i)},pd=new WeakSet,xa=0;function yd(){xa||typeof requestIdleCallback!="function"||(xa=requestIdleCallback(SM,{timeout:2e3}))}function SM(i){xa=0;let e=[...Bn].filter(t=>!t.live&&t.prewarm&&!pd.has(t)).sort((t,n)=>dh(t.host)-dh(n.host));for(let t of e){if(i.timeRemaining()<2&&!i.didTimeout)return void yd();pd.add(t);try{t.prewarm()}catch{}}}function TM(i){Do!==i.doc&&(Do=i.doc,Bn.clear(),ch=hh=uh=ph=0,Lo=-1e9,fh=typeof scrollY=="number"?scrollY:0),o0(Do),Bn.add(i);let e=(function(){let t=typeof IntersectionObserver=="function"?IntersectionObserver:null;if(!t)return null;if(gr?.ctor!==t){gr?.list.forEach(n=>n.disconnect()),gr={ctor:t,list:["200% 0px","300% 0px","0px"].map(n=>new t(MM,{rootMargin:n}))};for(let n of Bn)gr.list.forEach(r=>r.observe(n.host))}return gr.list})();e?.forEach(t=>t.observe(i.host)),e?a0(i):i.wanted=!0,ba(),i.live||yd()}function ba(i=!1){if(hd)ud=!0;else{hd=!0;try{do{ud=!1;let e=fd(),t=bM();(i||(t===null?e-Lo>16||e<Lo:t!==Lo))&&(Lo=t??e,hh=uh=0);for(let m of Bn)m.host.isConnected===!1&&(m.wanted=!1);for(let m of Bn)m.live&&!m.wanted&&m.release();let n=[...Bn].filter(m=>m.live&&!m.shared),r=yM(),s=m=>!!r&&!r.contains(m.host),a=m=>dh(m.host)+(s(m)?_M:0),o=m=>m.eager&&!s(m),c=()=>n.filter(m=>m.live&&!m.shared).map(m=>[m,a(m)+(o(m)?0:1e9)]).sort((m,x)=>x[1]-m[1]);for(let m=n.length-Qg,x=m>0?c():[];m>0;m--)x.shift()?.[0].release();let h=Gg(),u=1*bd(),f=()=>[...Bn].filter(m=>m.live&&m.shared&&a(m)>u).sort((m,x)=>a(x)-a(m));if(h?.overBudget)for(let m of f()){if(!h.overBudget)break;m.release()}let d=[...Bn].filter(m=>m.wanted&&!m.live).map(m=>[m,m.eager?-1:a(m)]).map(([m,x])=>[m,x,x>0?wM(m.host,x):x]).sort((m,x)=>m[2]-x[2]),p=0;for(let[m,x]of d){if(!Bn.has(m)||m.live)continue;if(h&&!h.roomy){let l=f()[0];if(!l||a(l)<=a(m)||(l.release(),!h.roomy))break}if(!m.eager&&(hh>=4||uh>=2)&&(!i||p)){ch||(ch=requestAnimationFrame(()=>{ch=0,ba(!0)}));break}if(n.filter(l=>l.live&&!l.shared).length>=Qg){let l=c()[0]?.[0];if(!l||(o(l)?!m.eager||a(l)<=a(m):!m.eager&&a(l)<=x))break;l.release()}let g=fd();m.mount(),hh+=fd()-g,p++,m.eager||uh++,m.live&&!m.shared&&n.push(m)}}while(ud)}finally{hd=!1}}}var l0='ui-monospace, "SF Mono", Menlo, Consolas, monospace',n0=new Map,EM=".:-=+*#%@";function AM(i,e=l0){let t=`${e}\0${i}`,n=n0.get(t);if(n)return n;let r={max:1,mean:1};try{let s=typeof document>"u"?null:Object.assign(document.createElement("canvas"),{width:48,height:48}).getContext("2d",{willReadFrequently:!0});if(s&&typeof s.getImageData=="function"){s.font=`500 36px ${e}`,s.textAlign="center",s.textBaseline="middle";let a=d=>{s.clearRect(0,0,48,48),s.fillStyle="#000",s.fillText(d,24,25);let p=s.getImageData(0,0,48,48).data,m=0;for(let x=3;x<p.length;x+=4)m+=p[x];return m/255},o=d=>[...d].filter(p=>p.trim()).map(a),c=d=>d.reduce((p,m)=>p+m,0)/Math.max(1,d.length),h=o(i),u=o(EM),f=a("@");h.length&&f>0&&c(u)>0&&(r={max:Math.max(...h)/f,mean:c(h)/c(u)})}}catch{}return n0.set(t,r),r}function md(i,e){let{max:t,mean:n}=AM(i,e.font??l0),r=e.glyphScale??.8,s=e.gamma??1,a=e.fontWeight??500;return t>1.15?{glyphScale:Math.max(.3,r*Math.max(.62,t**-.36)),gamma:s,fontWeight:a}:n>1.5?{glyphScale:Math.max(.3,r*n**-.25),gamma:s,fontWeight:a}:t<.85?{glyphScale:Math.min(1.6,r*Math.min(1.3,t**-.3)),gamma:s,fontWeight:t<.6?Math.max(a,700):a}:{glyphScale:r,gamma:s,fontWeight:a}}var va=new WeakMap;function _d(i,e){for(let t of va.get(i)?.keys()??[])t.getAttribute("src")!==e&&(t.src=e)}function Md(i){let e=va.get(i);va.delete(i),e?.forEach(t=>t())}function wd(i,e,t,n,r){let s=document.createElement("img");s.alt="",s.decoding="async",s.setAttribute("aria-hidden","true"),s.setAttribute("style",`${t};object-fit:cover`),s.style.opacity="1",s.dataset.asciiPoster="",s.src=e;let a=i.style.getPropertyValue("position"),o=typeof getComputedStyle=="function"&&getComputedStyle(i).position==="static";o&&i.style.setProperty("position","relative");let c=i.style.getPropertyValue("isolation"),h=/z-index:\s*-1/.test(t)&&typeof getComputedStyle=="function"&&getComputedStyle(i).isolation==="auto";h&&i.style.setProperty("isolation","isolate"),r?.parentElement===i?i.insertBefore(s,r):i.appendChild(s);let u=!1,f=()=>{u||(u=!0,s.remove(),va.get(n)?.delete(s),o&&(a?i.style.setProperty("position",a):i.style.removeProperty("position")),h&&(c?i.style.setProperty("isolation",c):i.style.removeProperty("isolation")))},d=va.get(n)??new Map;return d.set(s,f),va.set(n,d),{show(p){s.style.opacity=p?"1":"0"},remove:f}}function i0(i){let e=document.createElement("canvas");for(let t of i.getAttributeNames?.()??[])t!=="width"&&t!=="height"&&e.setAttribute(t,i.getAttribute(t));return e.style.cssText=i.style.cssText,Object.assign(e.dataset,i.dataset),i.replaceWith?i.replaceWith(e):i.parentElement&&(i.parentElement.insertBefore(e,i),i.remove()),e}function c0(i){let{host:e,kit:t}=i,n,r=i.canvas,s=null,a=!1,o=!1,c=!1,h=!1,u={},f={},d=i.source,p=!1,m={},x=null,g=null,l=!1,w=null,T=()=>{},y=!i.ownPoster&&t?.current.poster?wd(e,t.current.poster,i.place,t,r):null,E=()=>{if(!oh||t?.current.globalLook===!1||t?.current.charset||!Fo(f.mark)&&!i.glyphs||f.glyphOrder!=="scatter"&&!gM.has(f.charset??"")&&mM.test(f.charset??""))return;let L=oh.style?pM[oh.style]:void 0,D=L?.mark??(Fo(f.mark)?f.mark??"glyph":"glyph"),H=Fo(D)?oh.charset||(L&&"charset"in L?L.charset:void 0):void 0;return L||H?{mark:D,charset:H}:void 0},R=()=>({...i.glyphs?Object.fromEntries(Object.keys(i.glyphs()).map(L=>[L,f[L]]).filter(([,L])=>L!==void 0)):{},mark:f.mark??"glyph",charset:f.charset??" .,:-=+*#%@",glyphScale:f.glyphScale??.8,gamma:f.gamma??1,fontWeight:f.fontWeight??500}),P=L=>{if(!L.charset)return{...R(),mark:L.mark};let D=i.glyphs&&!Fo(f.mark)?i.glyphs():{};return{...D,mark:L.mark,charset:L.charset,...md(L.charset,{...f,...D})}},B=()=>{let L=E(),D=L&&`${L.mark}\0${L.charset??""}`;return D===n?null:(n=D,L?P(L):R())},M={host:e,doc:document,eager:t?.current.lazy===!1,wanted:!1,live:!1,poster:!!y||!!i.ownPoster,mount(){if(o||s)return;a&&(r=i.canvas=i0(r)),a=!0,f={...i.options(),...u},n=void 0;let L=B(),D;try{D=ah(r,{...f,...L,...d===void 0?{}:{source:d},onError:()=>{s===D&&_()}})}catch{return void _()}s=D,M.live=!0,M.shared=Vg(r);let H=r;if(M.shared)T=()=>{};else{let Y=0,G=()=>{s===D&&(y?.show(!0),clearTimeout(Y),Y=setTimeout(()=>{s===D&&r===H&&(M.release(),ba())},1e3))},re=()=>{clearTimeout(Y),requestAnimationFrame(()=>requestAnimationFrame(()=>{s===D&&y?.show(!1)}))};H.addEventListener?.("webglcontextlost",G),H.addEventListener?.("webglcontextrestored",re),T=()=>{clearTimeout(Y),H.removeEventListener?.("webglcontextlost",G),H.removeEventListener?.("webglcontextrestored",re)}}p&&D.pause(),D.ready.then(()=>{s===D&&(l=!0,y?.show(!1),x?.(),x=g=null)},()=>{}),i.onMount?.(D,r)},release(){if(!s)return;let L=s;s=null,M.live=!1,l=!1,T(),w?.clear(),w=null,m=L.settings,L.destroy(),M.shared?o||(r.width=r.width,a=!1):((D=>{try{let H=D.getContext("webgl2");H&&!H.isContextLost?.()&&H.getExtension("WEBGL_lose_context")?.loseContext()}catch{}})(r),o||(r=i.canvas=i0(r),a=!1)),y?.show(!0),i.onRelease?.()},prewarm(){if(o||s)return;f={...i.options(),...u};let L=E();$g(r,{...f,...L?P(L):{}})}};function _(){c||(c=!0,F(),h||i.onFail())}function F(){o||(o=!0,M.release(),(function(L){Bn.delete(L)&&([...Bn].some(D=>D.host===L.host)||gr?.list.forEach(D=>D.unobserve(L.host)),!Bn.size&&gr&&(gr.list.forEach(D=>D.disconnect()),gr=null),Bn.size||(o0(null),xa&&typeof cancelIdleCallback=="function"&&cancelIdleCallback(xa),xa=0),ba())})(M),Zg.delete(z),r.remove(),c?y?.show(!0):y?.remove())}let z={relook(){s||(G=>{pd.delete(G),Bn.has(G)&&yd()})(M);let L=B();if(!L||!s)return;let D=s,H=l&&!(t?.current.reducedMotion??(typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches));w?.clear(),w=null,H&&(D.redraw(),w=(function(G,re){if(!G.width||!G.height||typeof document>"u")return null;let fe=document.createElement("canvas");fe.width=G.width,fe.height=G.height;let ge=fe.getContext("2d");if(!ge||typeof fe.animate!="function")return null;try{ge.drawImage(G,0,0)}catch{return null}fe.setAttribute("aria-hidden","true"),fe.dataset.asciiSweep="",fe.setAttribute("style",re);let Te=document.createElement("span"),qe,Re;Te.setAttribute("aria-hidden","true"),Te.dataset.asciiSweep="",Te.setAttribute("style",`${re};right:auto;width:2px;margin-left:-1px;opacity:0;background:var(--ascii-sweep, #f3ba32);box-shadow:0 0 10px 1px color-mix(in srgb, var(--ascii-sweep, #f3ba32) 40%, transparent)`),G.after(fe,Te);let Q=()=>{qe?.cancel(),Re?.cancel(),fe.remove(),Te.remove()};return{clear:Q,reveal(){if(!fe.isConnected)return;let we={duration:200,delay:40,easing:"cubic-bezier(.23,1,.32,1)",fill:"both"};qe=fe.animate([{clipPath:"inset(0% 0% 0% 0%)"},{clipPath:"inset(0% 0% 0% 100%)"}],we);let j=G.clientWidth||G.getBoundingClientRect().width;Re=Te.animate([{transform:"translateX(0px)",opacity:.35},{opacity:.35,offset:.7},{transform:`translateX(${j}px)`,opacity:0}],we),qe.onfinish=Q}}})(r,i.place)),D.update(L);let Y=w;Y&&requestAnimationFrame(()=>requestAnimationFrame(()=>{w===Y&&s===D?Y.reveal():Y.clear()}))}};return{field:{get canvas(){return r},get ready(){return s?s.ready:g??(g=new Promise(L=>{x=L}))},get settings(){return s?.settings??m},update(L){if(u={...u,...L},f={...f,...L},!s)return;let D=B(),H=E();s.update(H?{...L,...P(H)}:D?{...L,...D}:L)},setSource:L=>(d=L,s?s.setSource(L):Promise.resolve()),pointer(L,D){s?.pointer(L,D)},redraw(){s?.redraw()},pulse(L){s?.pulse(L)},play(){p=!1,s?.play()},pause(){p=!0,s?.pause()},resize(){s?.resize()},destroy(){F()}},get canvas(){return r},get live(){return!!s},get failed(){return c},start(){Zg.add(z),h=!0;try{TM(M)}finally{h=!1}},destroy:F}}var RM=(i,e=0,t=1)=>Math.min(t,Math.max(e,i));var xr,mh=()=>typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;var Sd={scene:"none",background:"transparent",color:"ink",levels:"none",fit:"cover",focus:{x:.5,y:.5},vignette:0,drift:0,hover:"none",shade:0,contrast:1,brightness:0,gamma:1,maxPixelRatio:2,clear:!1};function ko(i,e,t){let n=(i??"").trim(),r=/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(n);if(r?n=h0(e,r[1])||(r[2]??"").trim():n.startsWith("--")&&(n=h0(e,n)),!n)return t?ko(t,e):null;if(/^#[\da-f]{6}$/i.test(n))return n.toLowerCase();if(/^#[\da-f]{3}$/i.test(n))return`#${[...n.slice(1)].map(h=>h+h).join("")}`.toLowerCase();let s=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(n);if(s)return u0([+s[1],+s[2],+s[3]]);if(xr===void 0)try{xr=typeof document>"u"?null:Object.assign(document.createElement("canvas"),{width:1,height:1}).getContext("2d",{willReadFrequently:!0})}catch{xr=null}if(!xr)return t?ko(t,e):null;xr.clearRect(0,0,1,1),xr.fillStyle="#000",xr.fillStyle=n,xr.fillRect(0,0,1,1);let[a,o,c]=xr.getImageData(0,0,1,1).data;return u0([a,o,c])}var h0=(i,e)=>typeof getComputedStyle=="function"?getComputedStyle(i).getPropertyValue(e).trim():"",u0=i=>`#${i.map(e=>Math.round(RM(e,0,255)).toString(16).padStart(2,"0")).join("")}`,CM=i=>{let e=parseInt(i.slice(1,7),16);return[e>>16&255,e>>8&255,255&e]};function Td(i){let e=typeof getComputedStyle=="function"?getComputedStyle(i):null,t=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?/i.exec(e?.backgroundColor??"");if(t&&(t[4]===void 0?1:t[4].endsWith("%")?parseFloat(t[4])/100:parseFloat(t[4]))>=.5)return .2126*+t[1]+.7152*+t[2]+.0722*+t[3]<128;let n=ko(e?.color??"",i);if(!n)return typeof matchMedia=="function"&&matchMedia("(prefers-color-scheme: dark)").matches;let[r,s,a]=CM(n);return .2126*r+.7152*s+.0722*a>140}function f0(){let i=[];return{set(e,t,n){i.some(([r,s])=>r===e&&s===t)||i.push([e,t,e.style.getPropertyValue(t)]),e.style.setProperty(t,n)},restore(){for(let[e,t,n]of i.reverse())n?e.style.setProperty(t,n):e.style.removeProperty(t);i.length=0}}}function Ed(i,e){let t={...i,...e},n=i.look,r=e.look;return r&&(t.look=Object.fromEntries(Object.entries({...n,...r}).filter(([,s])=>s!==void 0))),t}var bs=(i,e,t,n)=>typeof i=="number"&&Number.isFinite(i)?Math.min(n,Math.max(t,i)):e;function d0(i){return i==="dots"?" \xB7\u2219\u2022\u25CF":gd(i)}function Ad(i,e){if(!e||!e.preset||typeof e.preset.mount!="function")throw new TypeError("background() needs a preset, such as `aurora` imported from asciify-engine/kit.");let t=e.preset,n=e.poster,r=y=>({...y,poster:y.preset===t?n:void 0}),s={current:r({...e})};s0(s);let a=null,o=!1,c=!1,h=new Set,u=()=>{let y=s.current,E=y.preset;return{speed:bs(y.speed,E.speed,0,5),cellSize:bs(y.cellSize,E.cellSize,3,96),charset:d0(y.charset),cursor:y.look?.hover!=="none"&&(y.cursor??E.cursor),tap:y.tap==="ring"||y.tap==="surface"?y.tap:void 0,mark:y.mark==="glyph"||y.mark==="dot"?y.mark:void 0,clear:y.clear??!1,clearMap:{padding:bs(y.clearPadding,8,0,400),softness:bs(y.clearSoftness,28,0,600),strength:bs(y.clearStrength,.85,0,1)},dither:bs(y.dither,0,0,1),accent:y.accent,text:y.text?.trim()||"ASCIIFY",look:y.look}},f=y=>{let E=s.current,R=E.palette;return(typeof R=="string"?R:R?.[y?"dark":"light"])??E.color??E.ink},d=()=>String(bs(s.current.opacity,s.current.preset.opacity??1,0,1)),p=()=>!!(s.current.reducedMotion??mh()),m=y=>{let E=null;if(E=s.current.preset.mount({host:i,kit:s,settings:u,ink:f,reducedMotion:()=>s.current.reducedMotion,onFail:()=>{a===E&&(a=null)}}),!E)return null;let R=E.canvas.style;return y&&(R.opacity="0",R.transition="opacity 320ms cubic-bezier(.16, 1, .3, 1)",E.canvas.offsetWidth),R.opacity=d(),o&&E.pause(),E},x={position:i.style.getPropertyValue("position"),isolation:i.style.getPropertyValue("isolation")},g=(y,E)=>{E?i.style.setProperty(y,E):i.style.removeProperty(y)},l=!1,w=y=>{l=!0,y.destroy(),a&&!c&&(typeof getComputedStyle=="function"&&getComputedStyle(i).position==="static"&&i.style.setProperty("position","relative"),i.style.setProperty("isolation","isolate"))},T=y=>{if(c||!y||typeof y.mount!="function"||y===s.current.preset)return;s.current=r({...s.current,preset:y});let E=a;a=m(!!E&&!p()),E&&(R=>{if(p())return void w(R);R.canvas.style.transition="opacity 320ms cubic-bezier(.16, 1, .3, 1)",R.canvas.style.opacity="0";let P={run:R,timer:setTimeout(()=>{h.delete(P),w(R)},340)};h.add(P)})(E)};return a=m(!1),{get supported(){return!!a&&!c},get field(){return c?null:a?.field??null},get preset(){return s.current.preset},update(y){if(c||!y)return;let{preset:E,...R}=y;"poster"in R&&(n=R.poster),s.current=r(Ed(s.current,R)),R.poster&&s.current.poster&&_d(s,R.poster),E&&E!==s.current.preset?T(E):a&&(a.canvas.style.opacity=d(),a.refresh())},play(){!c&&o&&(o=!1,a?.play())},pause(){c||(o=!0,a?.pause())},setPreset:T,destroy(){if(!c){c=!0;for(let y of h)clearTimeout(y.timer),y.run.destroy(),l=!0;h.clear(),a?.destroy(),a=null,l&&(g("position",x.position),g("isolation",x.isolation)),Md(s)}}}}function p0(i,e,t=!1){let n=i.clear;return typeof n=="function"||Array.isArray(n)?{rects:n,...i.clearMap}:n?{element:n,...e}:t}function m0(i){let{host:e,layer:t="under",kit:n}=i;if(typeof document>"u")return null;let r=`position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;z-index:${t==="under"?-1:"auto"}`;if(!sh())return n?.current.poster&&!i.ownPoster&&wd(e,n.current.poster,r,n),null;let s=f0(),a=document.createElement("canvas");getComputedStyle(e).position==="static"&&s.set(e,"position","relative"),t==="under"&&s.set(e,"isolation","isolate"),a.dataset.asciiKit="",a.setAttribute("style",r),e.appendChild(a);let o=Td(e),c=!1,h=()=>{let w=i.reducedMotion();return w===!0?{speed:0,drift:0,respectReducedMotion:!0}:{respectReducedMotion:w!==!1}},u=()=>ko(i.ink(o),e,o?"#d8d6cf":"#1d1d1b")??"#888888",f=c0({host:e,canvas:a,kit:n,place:r,ownPoster:i.ownPoster,glyphs:i.glyphs,source:i.source??null,options:()=>({...vd({...Sd,...i.look(o)},xd(n)),...h(),ink:u(),interactionTarget:e,label:i.label??""}),onMount:(w,T)=>{i.label||(T.removeAttribute("role"),T.removeAttribute("aria-label"),T.setAttribute("aria-hidden","true")),i.onMount?.()},onRelease:i.onRelease,onFail:()=>{l(),i.onFail?.()}}),d=f.field,p=!1,m=()=>{c||(o=Td(e),d.update({...vd({...Sd,...i.look(o)},xd(n)),...h(),ink:u()}))},x=()=>{p=!1,m()},g=sd(()=>{p||c||(p=!0,th(x))});function l(){c||(c=!0,p&&nh(x),g(),f.destroy(),s.restore())}return f.start(),f.failed?(l(),null):{field:d,get canvas(){return f.canvas},get live(){return f.live},dark:()=>o,still:()=>!!(i.reducedMotion()??mh()),refresh:m,destroy:l}}var PM=(i,e)=>i.cursor===!1?"none":typeof i.cursor=="string"?i.cursor:e;function IM(i,e,t,n){let r=null;if(r=m0({host:i.host,kit:i.kit,layer:"under",glyphs:n&&(()=>n(i.settings())),look:a=>{let o=i.settings();return{...e(o,a),...o.look}},ink:a=>i.ink(a)??(a?t.dark:t.light),reducedMotion:i.reducedMotion,onFail:()=>{r=null,i.onFail()}}),!r)return null;let s=r.canvas;return{get field(){return r?.field??null},get canvas(){return r?.canvas??s},refresh(){r?.refresh()},play(){r?.field.play()},pause(){r?.field.pause()},destroy(){r?.destroy(),r=null}}}var x0=()=>typeof innerWidth=="number"&&innerWidth<760,FM={light:"#86847e",dark:"#7c7a74"},v0={light:"#8f8d86",dark:"#64625d"},LM=(i,e)=>i.mark??(i.charset||i.look?.charset?"glyph":e),g0=i=>({font:'"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace',fontWeight:400,cellSize:i.cellSize,cellAspect:.62,glyphScale:.86}),DM=i=>({cellSize:i.cellSize,cellAspect:1,dotScale:.68}),kM={x:.18,y:.2,width:.64,height:.6,feather:.3,shape:"ellipse",pointer:.8};function b0(i){let{scene:e,charset:t,hover:n,middle:r=kM,feather:s=.3,graphite:a=FM}=i,o=i.mark??"glyph";return{id:i.id,name:i.name,description:i.description,cellSize:i.cellSize,speed:i.speed??1,cursor:i.cursor??!0,opacity:i.opacity,mount(c){let h=IM(c,(d,p)=>{let m=LM(d,o);return{scene:e,color:"ink",shade:0,background:"transparent",vignette:0,speed:d.speed,maxPixelRatio:2,levels:"none",blend:"on",...m==="dot"?{mark:"dot",...DM(d)}:{mark:"glyph",charset:d.charset??t,...g0(d)},hover:PM(d,n),lantern:{radius:.16,strength:.75,trail:.9,follow:9},trail:{strength:1,radius:.42},fluid:{radius:.09,refraction:.03,glow:.6},clear:p0(d,{padding:0,feather:s,shape:"ellipse",pointer:.8},r),...i.tune?.(d,p)}},a,o==="dot"?d=>({...g0(d),charset:t}):void 0);if(!h||!i.extra)return h;let u=i.extra(c,h),f=h.destroy.bind(h);return Object.assign(h,{destroy(){u(),f()}})}}}var Rd=b0({id:"swell",name:"Swell",description:"A fine grid that swells in slow rolling waves, quiet in the middle. Dots by default, or characters.",cellSize:10,opacity:.6,scene:"swell",mark:"dot",charset:" .:-=+*#",hover:"lantern",graphite:v0,tune:()=>({scale:x0()?1.5:1,contrast:.62,brightness:-.19,blend:"auto",lantern:{radius:.12,strength:.5,trail:1,follow:8},trail:{strength:.7,radius:.35}})});var y0="#C7CDD0",UM="#080A0B",Cd=Math.PI*2;function SE({motorElement:i,waveElement:e,pauseButton:t,posterElement:n,modelData:r,assetBase:s=new URL("./assets/",import.meta.url).href}){if(!i)throw new Error("The motor viewport is required.");let a=v=>new URL(v,s.endsWith("/")?s:`${s}/`).href,o=document.createElement("canvas");o.className="hero-motor-canvas",o.setAttribute("aria-hidden","true"),Object.assign(o.style,{position:"absolute",inset:"0",width:"100%",height:"100%",pointerEvents:"none"}),i.append(o);let c=matchMedia("(prefers-reduced-motion: reduce)"),h=matchMedia("(hover: hover) and (pointer: fine)"),u,f,d,p,m,x,g,l,w=[],T=0,y=0,E=0,R=0,P=!1,B=!1,M=0,_=0,F=!1,z=!1,L=null,D=2,H=30,Y="unknown",G=!1,re=0,fe=0,ge=0,Te=0,qe=0,Re=null,Q={started:performance.now()},we=!1,j=c.matches,ee=!0,be=null,Ne=640,Ee=340,rt=0,Pe=0,Mt=null,Et=null,st=100,ht=null,Bt={x:0,y:0},I={x:0,y:0},Ft=new In,wt=new IntersectionObserver(([v])=>{ee=v.isIntersecting,b()},{rootMargin:"40px"});wt.observe(i);let vt=new ResizeObserver(()=>{M||(M=requestAnimationFrame(()=>{M=0,ue()}))});vt.observe(i);function Oe(){return P&&!B&&!we&&!j&&ee&&!document.hidden}function C(){if(!t)return;let v=we||j;t.textContent=v?"Resume animation":"Pause animation",t.setAttribute("aria-pressed",String(v)),t.disabled=!P}function b(){C(),Oe()?(F&&!G&&(m.play(),G=!0),Xe(),T||(y=0,E=0,T=requestAnimationFrame(le))):(cancelAnimationFrame(T),T=0,y=0,p?.pause(),m?.pause(),G=!1,clearTimeout(_),_=0)}function U(v=R,q=!1){if(!u||!p||!x||B)return;let k=performance.now();g.rotation.y=v%20/20*Cd;let oe=1+.012*Math.sin(v%20/20*Cd);for(let ie of w)ie.node.position.y=ie.y*oe;q?(I.x=0,I.y=0):(I.x+=(Bt.x-I.x)*.08,I.y+=(Bt.y-I.y)*.08),d.position.set(I.x*35,I.y*35,700),d.lookAt(0,0,0),u.render(f,d),p.redraw(),rt++,Pe=performance.now()-k}function le(v){T=0,Oe()&&(y&&(R+=Math.min((v-y)/1e3,.1)),y=v,(!E||v-E>=1e3/H-.5)&&(U(),E=v),T=requestAnimationFrame(le))}function ue(){let v=i.getBoundingClientRect();if(Re=v,Ne=Math.max(1,Math.round(v.width)),Ee=Math.max(1,Math.round(v.height)),!u||!d)return;let q=Math.min(devicePixelRatio||1,2);if(ge===Ne&&Te===Ee&&qe===q)return;ge=Ne,Te=Ee,qe=q;let k=2/q;o.style.width=`${k*100}%`,o.style.height=`${k*100}%`,o.style.transformOrigin="0 0",o.style.transform=k===1?"none":`scale(${1/k})`,u.setPixelRatio(D),u.setSize(Ne,Ee,!1);let oe=Ne<600;if(x&&ht!==oe){ht=oe,l.position.set(0,0,0),l.rotation.set(.55,0,oe?-1.02:-Math.PI/2+.06,"ZXY"),Ft.makeEmpty();let J=g.rotation.y;for(let De=0;De<24;De++)g.rotation.y=Cd*De/24,f.updateMatrixWorld(!0),Ft.union(new In().setFromObject(x));g.rotation.y=J;let de=Ft.getCenter(new W);l.position.sub(de),Ft.translate(de.negate()),Et={...Et,min:Ft.min.toArray(),max:Ft.max.toArray()}}let ie=Ne/Ee;if(!Ft.isEmpty()){let J=Ft.getSize(new W);st=Math.max(J.y,J.x/ie)*1.1}d.left=-st*ie/2,d.right=st*ie/2,d.top=st/2,d.bottom=-st/2,d.updateProjectionMatrix(),p?.update({cellSize:4*k}),p?.resize(),p&&P&&(u.render(f,d),p.setSource(u.domElement).then(()=>{P&&!B&&U(R,!0)}).catch(mt))}function se(v){if(!h.matches||j||we)return;let q=Re||i.getBoundingClientRect();Bt.x=sa.clamp(((v.clientX-q.left)/q.width-.5)*2,-1,1),Bt.y=sa.clamp(-((v.clientY-q.top)/q.height-.5)*2,-1,1)}function je(){Bt.x=0,Bt.y=0}function ye(){Re=i.getBoundingClientRect()}let Le=i.closest(".hero")||i.parentElement;Le?.addEventListener("pointermove",se),Le?.addEventListener("pointerenter",ye),Le?.addEventListener("pointerleave",je),window.addEventListener("scroll",ye,{passive:!0});function at(){b()}function ce(v){j=v.matches,m?.update({reducedMotion:j}),j&&P&&(R=0,U(0,!0)),b()}function Se(){we||j?Ae.resume():Ae.pause()}document.addEventListener("visibilitychange",at),c.addEventListener("change",ce),t?.addEventListener("click",Se);let Ae={canvas:o,get waveCanvas(){return e?.querySelector("canvas")||null},get status(){return{ready:P,disposed:B,error:be,paused:we||j,active:Oe(),reducedMotion:j,visible:ee&&!document.hidden,time:R,renderCount:rt,lastFrameMs:Pe,framePending:!1,pendingPose:!1,width:Ne,height:Ee,dpr:Math.min(devicePixelRatio||1,2),renderingPixelRatio:D,sourcePixelRatio:D,glyphPixelRatio:2,targetFps:H,tier:Y,workerRequested:!1,wavesReady:F,waveError:L,timings:{...Q},visibleGlyphCellPx:4,sourceClip:Mt,sourcePose:0,loopSeconds:20,sourceGeometryCount:fe,sourceTriangles:973838,renderedTriangles:re,bounds:Et,engine:"asciify-engine@4.33.0"}},pause(){we=!0,b()},resume(){we=!1,j=!1,m?.update({reducedMotion:!1}),b()},renderAt(v){return we=!0,b(),R=Number(v)||0,U(R,!0),m?.field?.redraw(),Ae.status},async whenFrameSubmitted(){return Ae.status},snapshot({paper:v=!1}={}){U(R,!0);let q=document.createElement("canvas");q.width=o.width,q.height=o.height;let k=q.getContext("2d");return v&&(k.fillStyle=UM,k.fillRect(0,0,q.width,q.height)),k.drawImage(o,0,0),q.toDataURL("image/png")},resize:ue,dispose(){B=!0,b(),wt.disconnect(),vt.disconnect(),cancelAnimationFrame(M),clearTimeout(_),document.removeEventListener("visibilitychange",at),c.removeEventListener("change",ce),Le?.removeEventListener("pointermove",se),Le?.removeEventListener("pointerleave",je),Le?.removeEventListener("pointerenter",ye),window.removeEventListener("scroll",ye),t?.removeEventListener("click",Se),p?.destroy(),m?.destroy(),x?.traverse(v=>{v.isMesh&&(v.geometry.dispose(),(Array.isArray(v.material)?v.material:[v.material]).forEach(k=>k.dispose()))}),u?.dispose(),o.remove()}};function Xe(){!e||m||z||_||!Oe()||(_=setTimeout(()=>{_=0,Oe()&&_e()},1500))}async function _e(){z=!0,Q.wavesStarted=performance.now();try{if(m=Ad(e,{preset:Rd,palette:y0,speed:.2,cellSize:12,cursor:"fluid",mark:"glyph",opacity:.08,lazy:!1,clear:i,look:{font:'"IBM Plex Mono", monospace',fontWeight:400,glyphScale:1,cellAspect:.6,charset:" .,:-=+*#%@",hover:"fluid",tap:"none",fluid:{radius:.12,force:.3,dissipation:1.3,refraction:.012,glow:.15,curl:12,resolution:96},post:{bloom:0,scanlines:0,grain:0,chroma:0,curvature:0}}}),await m.field?.ready,B)return;F=!0,Q.wavesReady=performance.now(),b()}catch(v){L=v instanceof Error?v.message:String(v),m?.destroy(),m=null,console.warn("Robotics background:",v)}}function mt(v){return P=!1,be=v instanceof Error?v.message:String(v),i.dataset.error=be,o.hidden=!0,n&&(n.hidden=!1),p?.pause(),m?.pause(),u?.dispose(),t&&(t.hidden=!0),b(),console.error("Robotics hero:",v),Ae}return Ae.ready=(async()=>{if(C(),!sh())throw new Error("Hardware-accelerated WebGL2 is unavailable; displaying the sourced ASCII poster.");Y=ld();let v=document.fonts.load('400 12px "IBM Plex Mono"').then(async me=>{if(!me.length){let Ye=new FontFace("IBM Plex Mono",`url("${a("IBMPlexMono-Regular.woff2")}") format("woff2")`,{weight:"400",style:"normal"});await Ye.load(),document.fonts.add(Ye)}Q.fontLoaded=performance.now()}),q=new Bc().setMeshoptDecoder(ig),k=(r?Promise.resolve(r).then(me=>q.parseAsync(me,s)):q.loadAsync(a("actuator.meshopt.glb"))).then(me=>(Q.modelLoaded=performance.now(),me)),[oe]=await Promise.all([k,v]);if(B)return Ae;u=new Uc({alpha:!0,antialias:!0,powerPreference:"high-performance"}),u.setClearColor(0,0),u.outputColorSpace=un,u.toneMapping=lo,u.toneMappingExposure=1.3,f=new Wa,d=new Vi(-100,100,50,-50,.1,1500),d.position.set(0,0,700),d.lookAt(0,0,0);let ie=new ur(16777215,3.2);ie.position.set(-45,65,90),f.add(ie);let J=new ur(16777215,.8);J.position.set(70,-20,40),f.add(J);let de=new ur(16777215,1.5);de.position.set(10,50,-60),f.add(de),f.add(new so(16777215,.35)),x=oe.scene,Mt="Published CAD / exploded presentation",x.traverse(me=>{if(!me.isMesh)return;w.push({node:me,y:me.position.y}),fe++,re+=(me.geometry.index?.count??me.geometry.attributes.position.count)/3;let Ye=Array.isArray(me.material)?me.material:[me.material];for(let gt of Ye)gt.roughness=.62,gt.metalness=.12}),x.updateMatrixWorld(!0);let De=new In().setFromObject(x,!0),ve=De.getCenter(new W);return x.position.sub(ve),l=new jn,g=new jn,g.add(x),l.add(g),f.add(l),Et={source:{min:De.min.toArray(),max:De.max.toArray()}},ue(),u.render(f,d),Q.threeFirstFrame=performance.now(),p=ah(o,{source:u.domElement,live:!0,worker:!1,fit:"contain",color:"ink",ink:y0,shade:0,ramp:[],background:"transparent",backdrop:0,font:'"IBM Plex Mono", monospace',fontWeight:400,glyphScale:1,charset:qg,mark:"glyph",glyphOrder:"tone",sample:"shape",cellSize:8/Math.min(devicePixelRatio||1,2),cellAspect:.6,cellFit:"pixel",maxPixelRatio:2,brightness:0,contrast:1,gamma:1,invert:!1,levels:"none",blend:"off",hover:"none",tap:"none",fluid:!1,vignette:0,drift:0,accents:0,shuffle:0,sparkle:0,effects:[],post:{bloom:0,scanlines:0,grain:0,chroma:0,curvature:0},respectReducedMotion:!0}),await p.ready,p.pause(),Q.fieldReady=performance.now(),B||(P=!0,U(0,!0),Q.motorReady=performance.now(),t&&(t.hidden=!1),i.dataset.ready="true",o.style.opacity="1",n&&(n.hidden=!0),b()),Ae})().catch(mt),window.__robotHero=Ae,Ae}export{SE as mountHero};
/*! For license information please see hero-renderer.js.LEGAL.txt */
//# sourceMappingURL=hero-renderer.js.map
