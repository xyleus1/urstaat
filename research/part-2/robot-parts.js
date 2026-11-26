// Part IDs also identify the nine independently selectable manufacturing networks.
export const robotParts = {
  overview: {
    label: 'Torso enclosure',
    tab: 'Torso',
    study: 'panel',
    node: 'panel',
  },
  side: {
    label: 'Lower support pivot',
    tab: 'Lower pivot',
    node: 'plain',
    info: 'The lower pivot connects the folding support to the wheeled base. Its supply network includes sliding and rolling bearings.',
  },
  face: {
    label: 'Head optics',
    tab: 'Optics',
    study: 'optics',
    node: 'window',
  },
  shoulder: {
    label: 'Shoulder actuator',
    tab: 'Shoulder',
    study: 'actuator',
    node: 'sealed-joint',
    bilateral: true,
  },
  elbow: {
    label: 'Elbow actuator cap',
    tab: 'Elbow',
    study: 'actuator',
    node: 'cap',
    bilateral: true,
  },
  wrist: {
    label: 'Wrist bearing cartridge',
    tab: 'Wrist',
    study: 'wrist',
    node: 'bearing',
    bilateral: true,
  },
  claw: {
    label: 'DynaClaw fingers',
    tab: 'DynaClaw',
    node: 'gripper',
    bilateral: true,
    info: 'Two guided fingers close around the object. Follow the inputs for the jaw guides, contact pads and electric drive.',
  },
  waist: {
    label: 'Folding waist linkage',
    tab: 'Folding waist',
    node: 'linkage',
    info: 'The waist linkage folds around a load-bearing pivot. Its supply network includes the pivot, ball screw and electric drive.',
  },
  base: {
    label: 'Wheel assembly',
    tab: 'Wheel base',
    node: 'wheel',
    info: 'The wheeled base combines a rolling surface and a powered hub. Follow the inputs for the tread, wheel centre and drive.',
  },
};

export const studyCatalog = {
  optics: {
    title: 'Head optical assembly',
    summary:
      'Light enters through the protective window and lens, passes a filter and reaches the CMOS sensor.',
    parts: [
      {
        name: 'Camera carrier',
        detail: 'A pocketed rear carrier locates the sensor board on four mounting posts.',
        node: 'camera',
        trace: 'Trace the camera module',
      },
      {
        name: 'CMOS sensor board',
        detail:
          'A ceramic package surrounds the light-sensitive die. Gold contacts and board traces carry its signals.',
        node: 'imager',
        trace: 'Trace the CMOS image sensor',
      },
      {
        name: 'IR-cut filter',
        detail:
          'This plate sits ahead of the sensor. An IR-cut coating limits the infrared light reaching a color imager.',
        node: 'camera',
        trace: 'Trace the camera module',
      },
      {
        name: 'Objective barrel',
        detail: 'A stepped bore and retaining shoulders locate the lens elements along the optical axis.',
        node: 'camera',
        trace: 'Trace the camera module',
      },
      {
        name: 'Lens elements',
        detail:
          'Curved glass surfaces focus light onto the sensor. A spacer sets the gap between the elements.',
        node: 'glass',
        trace: 'Trace optical glass',
      },
      {
        name: 'Protective window',
        detail:
          'The tall optical surround comes from Taku’s published head geometry. The crowned window illustrates the cover over one aperture.',
        node: 'window',
        trace: 'Trace the polished optical window',
      },
    ],
    caption:
      'The surround comes from Dyna’s public head CAD. The camera inside is an illustrative optical stack. Its supplier and lens prescription are unconfirmed for Taku.',
    links: [
      [
        'Dyna head CAD',
        'https://github.com/dyna-robotics/dyna_robot_description/tree/afa61685f434a9a2a61e255711788bcfe2f42f92',
      ],
      ['Machine-vision camera example', 'https://docs.baslerweb.com/a2a2048-114mgc'],
      [
        'Polished protective windows',
        'https://www.uqgoptics.com/catalogue/optical-windows/optical-glasses/bk7-windows/',
      ],
    ],
  },
  actuator: {
    title: 'Rotary actuator',
    summary: 'The electric motor turns the sun gear. Three planets transfer torque to the output carrier.',
    parts: [
      {
        name: 'Rear housing',
        detail: 'The casting supports the motor and provides a mounting face for the joint.',
        node: 'motor',
        trace: 'Trace the motor assembly',
      },
      {
        name: 'Stator & windings',
        detail:
          'Copper windings surround the stationary teeth. Current in the windings creates a rotating magnetic field.',
        node: 'wire',
        trace: 'Trace winding wire',
      },
      {
        name: 'Motor rotor',
        detail:
          'Magnet segments line the outer rotor. It turns around the stator and drives the central sun gear.',
        node: 'magnet',
        trace: 'Trace rotor magnets',
      },
      {
        name: 'Sun & planet gears',
        detail: 'The central sun drives three planet gears spaced around it.',
        node: 'planetary',
        trace: 'Trace planetary gearing',
      },
      {
        name: 'Internal ring gear',
        detail: 'In this example the planets mesh with a fixed, internally toothed ring.',
        node: 'planetary',
        trace: 'Trace planetary gearing',
      },
      {
        name: 'Output carrier',
        detail:
          'Two plates and three pins support the planet gears and carry their reduced-speed motion to the output.',
        node: 'planetary',
        trace: 'Trace the planetary assembly',
      },
    ],
    caption:
      'Dyna documents low-ratio planetary arm actuators. This example uses Mini-Cheetah replica CAD by Saketh vegesna, with illustrative windings and magnets.',
    links: [
      ['Dyna’s hardware', 'https://www.dyna.co/dyna-2.1'],
      [
        'Replica CAD',
        'https://github.com/SakethGG/Mini-Cheetah-Actuator/tree/b328c3cb0a57462f9913feda79b7f9047c63cd43',
      ],
      ['MIT license', new URL('../../hero/assets/LICENSE-MiniCheetah.txt', import.meta.url).href],
    ],
  },
  wrist: {
    title: 'Wrist bearing cartridge',
    summary: 'Alternating roller axes allow one compact bearing to carry radial, axial and moment loads.',
    parts: [
      {
        name: 'Mounting body',
        detail: 'The base locates the bearing and connects its fixed side to the wrist housing.',
        node: 'bearing',
        trace: 'Trace the bearing cartridge',
      },
      {
        name: 'Inner race',
        detail: 'A ground V-shaped track guides one side of each cylindrical roller.',
        node: 'race',
        trace: 'Trace bearing races',
      },
      {
        name: 'Crossed rollers',
        detail: 'Adjacent rollers alternate their axes by 90°. Small separators maintain their spacing.',
        node: 'rollers',
        trace: 'Trace bearing rollers',
      },
      {
        name: 'Outer race & seal',
        detail: 'A second V-shaped track closes around the rollers. A seal protects the running surfaces.',
        node: 'race',
        trace: 'Trace the outer race',
      },
      {
        name: 'Tool flange',
        detail:
          'The output face centers a tool on a raised pilot. Its six through-holes form the mounting pattern.',
        node: 'sealed-joint',
        trace: 'Trace the assembled joint',
      },
      {
        name: 'Socket screws',
        detail:
          'Six threaded screws secure the mating tool plate. Their recessed hex sockets accept a driver.',
        node: 'sealed-joint',
        trace: 'Trace the assembled joint',
      },
    ],
    caption:
      'Illustrative wrist assembly. The crossed-roller arrangement follows a published bearing principle. Dyna has not identified Taku’s wrist-bearing design.',
    links: [
      ['Crossed-roller principle', 'https://www.thk.com/us/en/products/cross_roller_ring/cross_roller_ring/'],
    ],
  },
  panel: {
    title: 'Formed enclosure panel',
    summary: 'The cover, gasket and inserts meet on the same four-hole pattern.',
    parts: [
      {
        name: 'Mounting frame',
        detail: 'The open frame supports the cover and locates four fasteners around its perimeter.',
        node: 'panel',
        trace: 'Trace the enclosure assembly',
      },
      {
        name: 'Threaded inserts',
        detail:
          'Four flanged inserts provide reusable threads in the frame. Their knurling resists rotation.',
        node: 'panel',
        trace: 'Trace the enclosure assembly',
      },
      {
        name: 'Perimeter gasket',
        detail:
          'A thin, continuous gasket follows the cover perimeter; holes register it on the screw pattern.',
        node: 'panel',
        trace: 'Trace the enclosure assembly',
      },
      {
        name: 'Formed cover',
        detail:
          'The constant-thickness aluminum sheet turns through four radiused bends. Three pressed louvers rise above pierced openings.',
        node: 'al-sheet',
        trace: 'Trace rolled aluminium sheet',
      },
      {
        name: 'Cover screws',
        detail: 'The four socket screws pass through the formed cover and gasket into the captive inserts.',
        node: 'panel',
        trace: 'Trace the enclosure assembly',
      },
    ],
    caption:
      'An original sheet-metal example shows how a service cover can be formed, sealed and fastened. Taku’s enclosure material and forming process are unconfirmed.',
    links: [],
  },
};
