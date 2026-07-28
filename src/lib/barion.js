// =============================================================================
//  Barion Smart Gateway — Sandbox Tesztkörnyezet & Adományozási Szimulátor
// =============================================================================

import { supabase } from './supabaseClient';

export const BARION_CONFIG = {
  environment: 'SANDBOX',
  posKey: 'barion-sandbox-ktsze-pos-key-demo',
  sandboxPayUrl: 'https://pos.test.barion.com/Pay',
  commissionRate: 0.05, // 5% SA Software platform jutalék
};

const DONATIONS_STORAGE_KEY = 'ktsze_barion_donations_sandbox_v1';

/** Beolvassa a Barion teszt adományokat a tárolóból (localStorage tartalék). */
export const getStoredDonations = () => {
  try {
    const raw = localStorage.getItem(DONATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Hiba a Barion adományok beolvasásakor:', err);
    return {};
  }
};

/**
 * Szinkron számláló (azonnali megjelenítéshez).
 */
export const getWorkgroupDonationStats = (workgroupId, defaultTarget = 250000) => {
  const allDonations = getStoredDonations();
  const groupDonations = allDonations[workgroupId] || [];

  const addedTotal = groupDonations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const target = Number(defaultTarget) || 250000;
  const percentage = Math.min(Math.round((addedTotal / target) * 100), 100);

  return {
    targetAmount: target,
    currentAmount: addedTotal,
    percentage,
    donationCount: groupDonations.length,
    recentDonations: groupDonations.slice(-5).reverse()
  };
};

/**
 * Közvetlenül a Supabase `workgroup_donations` táblából kérdezi le az adományokat.
 * Ha törölnek egy sort a Supabase-ben, EZ a függvény pontosan a törölt állapot szerinti összeget adja vissza!
 */
export const fetchWorkgroupDonationStats = async (workgroupId, targetAmount = 250000) => {
  const target = Number(targetAmount) || 250000;

  try {
    const { data, error } = await supabase
      .from('workgroup_donations')
      .select('id, amount, donor_name, created_at')
      .eq('workgroup_id', workgroupId)
      .eq('status', 'Succeeded')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const dbTotal = data.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const dbPercentage = Math.min(Math.round((dbTotal / target) * 100), 100);
      const dbRecent = data.slice(0, 5).map((item) => ({
        id: item.id,
        donorName: item.donor_name || 'Névtelen Támogató',
        amount: Number(item.amount)
      }));

      // Helyi tároló szinkronizálása a Supabase valódi adataival!
      try {
        const allDonations = getStoredDonations();
        allDonations[workgroupId] = dbRecent.map((d) => ({
          id: d.id,
          amount: d.amount,
          donorName: d.donorName
        }));
        localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(allDonations));
      } catch (e) {
        // ignore
      }

      return {
        targetAmount: target,
        currentAmount: dbTotal,
        percentage: dbPercentage,
        donationCount: data.length,
        recentDonations: dbRecent
      };
    }
  } catch (err) {
    console.warn('Supabase workgroup_donations lekérdezési hiba, tartalékolás:', err);
  }

  return getWorkgroupDonationStats(workgroupId, target);
};

/**
 * Barion Sandbox Fizetés Indítása.
 * Elmenti a tranzakciót a Supabase `workgroup_donations` táblába ÉS a helyi tárolóba is.
 */
export const executeBarionDonation = async ({ workgroupId, workgroupName, amount, donorName }) => {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new Error('Kérjük, adjon meg érvényes támogatási összeget!');
  }

  const commission = Math.round(numericAmount * BARION_CONFIG.commissionRate);
  const netAmount = numericAmount - commission;
  const barionPaymentId = `BARION-TEST-${Date.now()}`;
  const finalDonorName = donorName?.trim() || 'Névtelen Támogató';

  // 1. Mentés Supabase Adatbázisba (ha fel van állítva a 13. migrációs tábla)
  try {
    await supabase.from('workgroup_donations').insert({
      workgroup_id: workgroupId,
      donor_name: finalDonorName,
      amount: numericAmount,
      commission_amount: commission,
      net_amount: netAmount,
      barion_payment_id: barionPaymentId,
      status: 'Succeeded'
    });
  } catch (err) {
    console.warn('Supabase workgroup_donations mentés tartalékolásra váltott:', err);
  }

  // 2. Mentés Helyi Tárolóba (azonnali UI frissítéshez)
  const newDonation = {
    id: barionPaymentId,
    workgroupId,
    workgroupName,
    amount: numericAmount,
    commission,
    netAmount,
    donorName: finalDonorName,
    createdAt: new Date().toISOString(),
    status: 'Succeeded',
    gateway: 'Barion Sandbox'
  };

  const allDonations = getStoredDonations();
  const groupList = allDonations[workgroupId] || [];
  allDonations[workgroupId] = [...groupList, newDonation];

  localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(allDonations));

  return newDonation;
};
