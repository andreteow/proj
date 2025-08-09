export type FurnitureType =
  | 'bench' | 'counter' | 'kiosk' | 'desk' | 'chair' | 'cabinet' | 'shelf' | 'screen' | 'bed' | 'table' | 'partition' | 'carpet' | 'benchLab' | 'sign' | '__unknown__';

export interface Door {
  side: 'N' | 'S' | 'E' | 'W';
  offset: number; // meters from negative axis corner along the wall
  width: number;  // width of opening in meters
}

export interface Furniture {
  type: FurnitureType;
  x: number; z: number; // local center coords within room
  w?: number; h?: number; y?: number; label?: string;
}

export interface Room {
  key?: string;
  name: string;
  x: number; z: number; // center position in world meters
  w: number; h: number; // width (x) and depth (z)
  doors?: Door[];
  furniture?: Furniture[];
}

export interface Layout {
  name?: string;
  floorSize?: { w: number; h: number };
  wallHeight?: number;
  wallThickness?: number;
  rooms: Room[];
  corridors?: { x: number; z: number; w: number; h: number }[];
}

export interface WorldConfig {
  wallHeight: number;
  wallThickness: number;
  floorSize: { w: number; h: number };
}
