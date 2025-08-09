"use client";

import layoutData from '@/data/kk-titiwangsa';
import { sanitizeLayout } from '@/lib/layout';

// Single sanitized layout instance shared across scene, player, minimap, etc.
const { layout, cfg } = sanitizeLayout(layoutData);

export { layout, cfg };
