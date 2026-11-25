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

The head study isolates the left optical surround from Dyna’s Apache-2.0-licensed `head_roll_link_surface_3` and reuses the fitted cover authored for this site. The rear carrier, populated sensor board, IR-cut plate, objective barrel and two glass elements are original illustrations. The two apertures in the public exterior model do not identify the optical prescription or camera supplier. The Basler example documents a Sony IMX900 sensor and IR-cut filter, and UQG describes polished protective windows. [Dyna CAD at the pinned revision](https://github.com/dyna-robotics/dyna_robot_description/tree/afa61685f434a9a2a61e255711788bcfe2f42f92) · [Dyna Apache 2.0 license](../../research/part-2/assets/LICENSE-Dyna.txt) · [Basler camera example](https://docs.baslerweb.com/a2a2048-114mgc) · [UQG optical windows](https://www.uqgoptics.com/catalogue/optical-windows/optical-glasses/bk7-windows/)

The generator works in millimeters. Each gzip payload contains indexed, 1/160 mm quantized geometry with octahedral normals. WebGL and the worker-backed Canvas 2D renderer draw the same triangles and depth-pick the same component groups. Both support assembly spacing, orbit, zoom, selection and supply-step links. Holding the assembly or a control temporarily suspends automatic rotation. Releasing it resumes the reader’s previous setting. Reduced-motion preferences start rotation paused. A local still and the labeled parts list also work if the selected mesh cannot load.

Pass a single study name to either generator to rebuild just its files, for example `node tools/taku/cutaway-models.mjs optics` and `node tools/taku/cutaway-stills.mjs optics`. Run `node site/tests/taku-optics-browser.mjs` for both renderer paths and the rotation interaction checks.

| Study | Triangles | Compressed geometry |
|---|---:|---:|
| Rotary actuator | 96,162 | 698,645 bytes |
| Wrist bearing cartridge | 42,080 | 306,917 bytes |
| Formed enclosure panel | 34,424 | 319,234 bytes |
| Head optical assembly | 26,246 | 185,433 bytes |
