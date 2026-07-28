import React, { useState } from 'react';
import { Heart, CreditCard, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Modal, Spinner, TextInput } from '../ui';
import { formatHuf } from '../../lib/format';
import { executeBarionDonation, BARION_CONFIG } from '../../lib/barion';

const PRESETS = [1000, 2500, 5000, 10000];

export const DonationModal = ({ open, onClose, workgroup, onSuccess, defaultDonorName = '' }) => {
  const [amount, setAmount] = useState(2500);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(defaultDonorName);
  const [pending, setPending] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState(null);

  if (!workgroup) return null;

  const selectedAmount = customAmount ? Number(customAmount) : amount;
  const commission = Math.round((selectedAmount || 0) * BARION_CONFIG.commissionRate);
  const netAmount = Math.max(0, (selectedAmount || 0) - commission);

  const handlePresetClick = (val) => {
    setCustomAmount('');
    setAmount(val);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedAmount || selectedAmount < 500) {
      setError('A minimális támogatási összeg 500 Ft.');
      return;
    }

    setPending(true);
    try {
      const result = await executeBarionDonation({
        workgroupId: workgroup.id,
        workgroupName: workgroup.name,
        amount: selectedAmount,
        donorName
      });

      setSuccessResult(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message || 'Hiba történt a Barion tesztfizetés indításakor.');
    } finally {
      setPending(false);
    }
  };

  const handleModalClose = () => {
    setSuccessResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      title={successResult ? 'Köszönjük a támogatást!' : `Támogatás — ${workgroup.name}`}
      size="md"
    >
      {successResult ? (
        <div className="py-6 text-center space-y-4 animate-slide-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-2xl font-bold text-ink-900">
              {formatHuf(successResult.amount)} sikeresen elküldve!
            </h3>
            <p className="text-sm text-ink-600">
              Köszönjük, hogy támogatod a <strong>{workgroup.name}</strong> projektemet!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sand-100 border border-sand-300 text-xs space-y-1 text-ink-700 max-w-sm mx-auto">
            <p><strong>Tranzakció azonosító:</strong> {successResult.id}</p>
            <p><strong>Fizetési kapu:</strong> Barion Smart Gateway (Sandbox)</p>
            <p><strong>Támogató:</strong> {successResult.donorName}</p>
          </div>

          <div className="pt-4">
            <button type="button" onClick={handleModalClose} className="btn-primary w-full sm:w-auto">
              Rendben, bezárás
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-6">
          {/* Előre beállított adomány összegek */}
          <div>
            <label className="label">Válassz támogatási összeget:</label>
            <div className="grid grid-cols-4 gap-2.5 mt-2">
              {PRESETS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePresetClick(val)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                    !customAmount && amount === val
                      ? 'border-wine-600 bg-wine-50 text-wine-800 shadow-sm ring-2 ring-wine-200'
                      : 'border-sand-300 bg-white text-ink-700 hover:border-wine-400'
                  }`}
                >
                  {formatHuf(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Egyedi összeg */}
          <TextInput
            label="Vagy adj meg egyedi összeget (Ft):"
            type="number"
            min="500"
            step="100"
            placeholder="pl. 15000"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
          />

          {/* Támogató neve */}
          <TextInput
            label="Támogató neve (opcionális):"
            placeholder="pl. Kovács István (vagy hagyd üresen ha névtelen)"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
          />

          {/* Átlátható pénzügyi lebontás (SA Software jutalék) */}
          <div className="p-4 rounded-xl bg-sand-100 border border-sand-300 text-xs space-y-2">
            <div className="flex justify-between text-ink-700">
              <span>Teljes támogatási összeg:</span>
              <span className="font-bold text-ink-900">{formatHuf(selectedAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-ink-500">
              <span>SA Software platform &amp; tranzakciós díj (5%):</span>
              <span>{formatHuf(commission)}</span>
            </div>
            <div className="flex justify-between text-wine-800 font-bold border-t border-sand-300 pt-2 text-sm">
              <span>Munkacsoportnak jóváírt összeg:</span>
              <span>{formatHuf(netAmount)}</span>
            </div>
          </div>

          {error && <p className="text-xs text-wine-600 font-medium">{error}</p>}

          {/* Fizetés gomb Barion brandinggel */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
            >
              {pending ? (
                <Spinner label="Barion Sandbox csatlakozás…" className="text-white" />
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Fizetés Barion Sandbox-szal ({formatHuf(selectedAmount || 0)})
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-ink-500 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Biztonságos Barion Smart Gateway tesztkörnyezet (Apple Pay &amp; Bankkártya)
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
