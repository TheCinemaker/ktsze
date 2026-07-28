// =============================================================================
//  Barion Smart Gateway — Sandbox Tesztkörnyezet & Adományozási Szimulátor
// =============================================================================

export const BARION_CONFIG = {
  environment: 'SANDBOX',
  posKey: 'barion-sandbox-ktsze-pos-key-demo',
  sandboxPayUrl: 'https://pos.test.barion.com/Pay',
  commissionRate: 0.05, // 5% SA Software platform jutalék
};

const DONATIONS_STORAGE_KEY = 'ktsze_barion_donations_sandbox_v1';

/** Beolvassa a Barion teszt adományokat a tárolóból. */
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
export const getWorkgroupDonationStats = (workgroupId, defaultTarget = 250000, defaultCurrent = 115000) => {
  const allDonations = getStoredDonations();
  const groupDonations = allDonations[workgroupId] || [];

  const addedTotal = groupDonations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalRaised = defaultCurrent + addedTotal;
  const percentage = Math.min(Math.round((totalRaised / defaultTarget) * 100), 100);

  return {
    targetAmount: defaultTarget,
    currentAmount: totalRaised,
    percentage,
    donationCount: groupDonations.length,
    recentDonations: groupDonations.slice(-5).reverse()
  };
};

/**
 * Barion Sandbox Fizetés Indítása.
 * Szimulálja a Barion Smart Gateway Payment/Start folyamatát és sikeres visszatérését.
 */
export const executeBarionDonation = async ({ workgroupId, workgroupName, amount, donorName }) => {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new Error('Kérjük, adjon meg érvényes támogatási összeget!');
  }

  const commission = Math.round(numericAmount * BARION_CONFIG.commissionRate);
  const netAmount = numericAmount - commission;

  // Szimuláljuk a Barion API válaszidőt (0.8s)
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newDonation = {
    id: `BARION-TEST-${Date.now()}`,
    workgroupId,
    workgroupName,
    amount: numericAmount,
    commission,
    netAmount,
    donorName: donorName?.trim() || 'Névtelen Támogató',
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
