import type { Layout } from '@/lib/types';

// Approximate single-floor layout. Units: meters. Origin at world center.
const layout: Layout = {
  name: 'KK Titiwangsa (Approx)',
  floorSize: { w: 56, h: 36 },
  wallHeight: 3,
  wallThickness: 0.2,
  corridors: [
    { x: 0, z: 0, w: 40, h: 4 }, // main corridor
    { x: 0, z: -8, w: 40, h: 3 }, // secondary corridor
  ],
  rooms: [
    { key: 'registration', name: 'Pendaftaran', x: -18, z: 8, w: 10, h: 6, doors: [{ side: 'S', offset: 5, width: 2 }],
      furniture: [ { type: 'counter', x: 0, z: 1.7, w: 9, h: 0.6, label: 'Kaunter' }, { type: 'kiosk', x: -3, z: -1.5, w: 1, h: 1, label: 'Kiosk' } ] },
    { key: 'waitingA', name: 'Ruang Menunggu A', x: -18, z: -0.5, w: 10, h: 7, doors: [{ side: 'N', offset: 5, width: 2 }],
      furniture: [ { type: 'bench', x: 0, z: 0, w: 2, h: 0.6 }, { type: 'bench', x: 0, z: -1.2, w: 2, h: 0.6 } ] },
    { key: 'triage', name: 'Triage', x: -4, z: -1, w: 8, h: 6, doors: [{ side: 'N', offset: 4, width: 1.6 }] },

    { key: 'consult1', name: 'Bilik Konsultasi 1', x: 9, z: 8, w: 6, h: 5, doors: [{ side: 'S', offset: 3, width: 1.2 }] },
    { key: 'consult2', name: 'Bilik Konsultasi 2', x: 16, z: 8, w: 6, h: 5, doors: [{ side: 'S', offset: 3, width: 1.2 }] },
    { key: 'consult3', name: 'Bilik Konsultasi 3', x: 9, z: 1, w: 6, h: 5, doors: [{ side: 'N', offset: 3, width: 1.2 }] },
    { key: 'consult4', name: 'Bilik Konsultasi 4', x: 16, z: 1, w: 6, h: 5, doors: [{ side: 'N', offset: 3, width: 1.2 }] },

    { key: 'treatment', name: 'Rawatan', x: -4, z: 8, w: 8, h: 5, doors: [{ side: 'S', offset: 3, width: 1.4 }] },
    { key: 'pharmacy', name: 'Farmasi', x: -18, z: -9, w: 10, h: 6, doors: [{ side: 'N', offset: 5, width: 2 }],
      furniture: [ { type: 'counter', x: 0, z: 2, w: 9, h: 0.6, label: 'Kaunter Farmasi' }, { type: 'shelf', x: 0, z: -1.5, w: 8, h: 0.5, label: 'Rak' } ] },

    { key: 'lab', name: 'Makmal', x: 9, z: -8, w: 6, h: 5, doors: [{ side: 'N', offset: 3, width: 1.2 }] },
    { key: 'immun', name: 'Imunisasi', x: 16, z: -8, w: 6, h: 5, doors: [{ side: 'N', offset: 3, width: 1.2 }] },
    { key: 'mch', name: 'Klinik Ibu & Anak', x: 2.5, z: -8, w: 6, h: 5, doors: [{ side: 'N', offset: 3, width: 1.2 }] },

    { key: 'cafeteria', name: 'Kafetaria', x: -4, z: -15, w: 16, h: 6, doors: [{ side: 'N', offset: 8, width: 3 }],
      furniture: [ { type: 'table', x: -3, z: 0, w: 1.6, h: 1 }, { type: 'table', x: 0, z: 0, w: 1.6, h: 1 }, { type: 'table', x: 3, z: 0, w: 1.6, h: 1 } ] },

    { key: 'toilets', name: 'Tandas', x: 16, z: -15, w: 6, h: 6, doors: [{ side: 'N', offset: 3, width: 1.6 }] },
    { key: 'surau', name: 'Surau', x: 9, z: -15, w: 6, h: 6, doors: [{ side: 'N', offset: 3, width: 1.6 }] },
  ]
};

export default layout;
