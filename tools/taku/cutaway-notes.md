# Exploded studies

Run these commands from the repository root. The first generator uses the same locked Three.js and glTF dependencies as the homepage. The second captures the resulting WebGL scenes as local WebP fallbacks using the site’s Puppeteer installation.

```sh
npm ci --prefix hero
npm ci --prefix site
node tools/taku/cutaway-models.mjs
node tools/taku/cutaway-stills.mjs
```

The motor housing, stator, rotor, sun gear, three planet gears, ring gear, carrier plates and pins come from the homepage’s registered Mini-Cheetah replica assembly by Saketh vegesna. The generator decodes the checked-in CAD-derived glTF, preserves its tooth shapes, and adds illustrative copper windings and magnet segments. Their positions follow the replica’s 36 stator teeth and rotor clearance. Dyna identifies low-ratio planetary arm actuators. Dyna has not published Taku’s internal actuator drawings. [Dyna hardware](https://www.dyna.co/dyna-2.1) · [Replica CAD at the pinned revision](https://github.com/SakethGG/Mini-Cheetah-Actuator/tree/b328c3cb0a57462f9913feda79b7f9047c63cd43) · [MIT license](../../hero/assets/LICENSE-MiniCheetah.txt)

The wrist cartridge is an independently drawn example of crossed rollers and two V-grooved races. The enclosure is an independently drawn aluminum sheet with radiused return bends, pierced louvers, a die-cut gasket and captive inserts. Both demonstrate possible mechanisms. Manufacturing route, suppliers, dimensions and materials in the illustrations are unconfirmed for Taku. [Crossed-roller bearing principle](https://www.thk.com/us/en/products/cross_roller_ring/cross_roller_ring/)

The generator works in millimeters. Each gzip payload contains indexed, 1/160 mm quantized geometry with octahedral normals. WebGL and the worker-backed Canvas 2D renderer draw the same triangles and depth-pick the same component groups. Both support assembly spacing, orbit, zoom, selection and supply-step links. The assembly turns slowly until the reader pauses or selects a part. Reduced-motion preferences start it paused. A local still and the labeled parts list also work if the selected mesh cannot load.

| Study | Triangles | Compressed geometry |
|---|---:|---:|
| Rotary actuator | 96,162 | 698,645 bytes |
| Wrist bearing cartridge | 42,080 | 306,917 bytes |
| Formed enclosure panel | 34,424 | 319,234 bytes |
