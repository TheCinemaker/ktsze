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

/** Kiszámolja egy munkacsoport gyűjtési egyenlegét és legutóbbi támogatóit. */
export const getWorkgroupDonationStats = (workgroupId, defaultTarget = 250000, defaultCurrent = 0) => {
  const allDonations = getStoredDonations();
  const groupDonations = allDonations[workgroupId] || [];

  const addedTotal = groupDonations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalRaised = defaultCurrent + addedTotal;
  const target = Number(defaultTarget) || 250000;
  const percentage = Math.min(Math.round((totalRaised / target) * 100), 100);

  return {
    targetAmount: target,
    currentAmount: totalRaised,
    percentage,
    donationCount: groupDonations.length,
    recentDonations: groupDonations.slice(-5).reverse()
  };
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
