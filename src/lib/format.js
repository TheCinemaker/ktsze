// =============================================================================
//  Formázók — egy helyen, hogy ne legyen négy különböző pénz- és dátumformátum
//  az alkalmazásban.
// =============================================================================

import { supabase } from './supabaseClient';

/** Publikus Storage-kép URL-je, vagy null. */
export const coverUrl = (path) => {
  if (!path) return null;
  const { data } = supabase.storage.from('public-media').getPublicUrl(path);
  return data?.publicUrl || null;
};

/** 2026. július 27. */
export const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
};

/** 2026. 07. 27. — táblázatokba, ahol kevés a hely. */
export const formatDateShort = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('hu-HU');
};

const HUF = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0
});

/** 24 000 Ft. `null`-t ad vissza, ha nincs összeg — így nem írunk ki 0 Ft-ot. */
export const formatHuf = (amount) => (amount == null || amount === '' ? null : HUF.format(amount));

/** Bájt -> 1,2 MB */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return null;
  const units = ['B', 'kB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value < 10 && exponent > 0 ? 1 : 0)} ${units[exponent]}`;
};
