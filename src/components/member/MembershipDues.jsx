import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, CheckCircle2, Clock, Upload, AlertCircle, FileCheck, Copy, Check } from 'lucide-react';

export const MembershipDues = () => {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);

  const duesInfo = currentUser?.dues_2026 || { status: 'pending', amount: 24000, paid_at: null };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("11747051-20019948");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleUploadProof = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofUploaded(true);
      setTimeout(() => setProofUploaded(false), 5000);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2D7C7] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#63534B] uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4 text-[#6B1D2F]" />
            Tagdíj Állapot • 2026. Év
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E]">
            {currentUser?.organization_name || "Egyesületi Tag"}
          </h2>
          <p className="text-xs text-[#63534B] mt-1">
            Tagsági kategória: <span className="font-semibold text-[#2C221E]">{currentUser?.member_type || "Szolgáltató"}</span>
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {duesInfo.status === 'paid' ? (
            <div className="bg-[#E8F5E9] border border-[#C8E6C9] px-4 py-2 rounded-xl flex items-center gap-2 text-[#2E7D32]">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <div className="font-bold text-xs uppercase">2026. Évi Tagdíj Rendezve</div>
                <div className="text-[0.68rem]">Befizetve: {duesInfo.paid_at || "2026.01.15"}</div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFF8E1] border border-[#FFE082] px-4 py-2 rounded-xl flex items-center gap-2 text-[#F57F17]">
              <Clock className="w-5 h-5" />
              <div>
                <div className="font-bold text-xs uppercase">Befizetésre Vár</div>
                <div className="text-[0.68rem]">Esedékesség: 2026. március 31.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dues Details & Bank Transfer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Transfer Details Card */}
        <div className="bg-[#F3ECE0] rounded-2xl p-6 border border-[#E2D7C7] space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#2C221E] pb-2 border-b border-[#E2D7C7]">
            Átutalási Adatok Tagdíjbe fizetéshez
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#FAF6F0]">
              <span className="text-[#63534B]">Kedvezményezett Név:</span>
              <strong className="text-[#2C221E]">Kőszegi Turisztikai Szövetség Egyesület</strong>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#FAF6F0]">
              <span className="text-[#63534B]">Számlavezető Bank:</span>
              <strong className="text-[#2C221E]">OTP Bank Nyrt.</strong>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#FAF6F0]">
              <span className="text-[#63534B]">Bankszámlaszám:</span>
              <div className="flex items-center gap-2">
                <strong className="text-[#6B1D2F] font-mono text-sm">11747051-20019948</strong>
                <button 
                  onClick={handleCopyAccount}
                  className="p-1 text-[#63534B] hover:text-[#6B1D2F] rounded border-0 bg-transparent cursor-pointer"
                  title="Másolás"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between py-1 border-b border-[#FAF6F0]">
              <span className="text-[#63534B]">Éves Éves Tagdíj Összege:</span>
              <strong className="text-[#6B1D2F] text-base font-serif">{duesInfo.amount.toLocaleString()} Ft</strong>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-[#63534B]">Közleménybe írandó:</span>
              <strong className="text-[#2C221E] font-mono">Tagdíj 2026 - {currentUser?.organization_name || "Tag neve"}</strong>
            </div>
          </div>

          <div className="p-3 bg-[#FAF6F0] rounded-lg border border-[#C5A880] text-[0.7rem] text-[#63534B] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#6B1D2F] shrink-0 mt-0.5" />
            <span>Kérjük, hogy az utalás közleményében pontosan tüntesse fel a vállalkozása nevét a gyors beazonosítás érdekében!</span>
          </div>

        </div>

        {/* Upload Proof Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2D7C7] space-y-4 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-[#2C221E] pb-2 border-b border-[#E2D7C7]">
            Befizetési Igazolás Feltöltése
          </h3>

          <p className="text-xs text-[#63534B]">
            Amennyiben banki átutalással egyenlítette ki a tagdíjat, itt feltöltheti az utalási bizonylatot (PDF/Kép formatum), hogy az egyesület könyvelése azonnal rögzíthesse.
          </p>

          {proofUploaded ? (
            <div className="p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl flex items-center gap-3 text-[#2E7D32] text-xs">
              <FileCheck className="w-6 h-6 shrink-0" />
              <div>
                <strong className="block">Bizonylat sikeresen feltöltve!</strong>
                <span>Munkatársunk ellenőrzi a befizetést. Köszönjük!</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#E2D7C7] hover:border-[#6B1D2F] rounded-xl p-6 text-center bg-[#FAF6F0] transition-colors cursor-pointer relative">
              <input 
                type="file" 
                onChange={handleUploadProof}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <Upload className="w-8 h-8 text-[#6B1D2F] mx-auto mb-2" />
              <div className="font-semibold text-xs text-[#2C221E]">Kattintson ide a fájl feltöltéséhez</div>
              <div className="text-[0.68rem] text-[#63534B] mt-1">PDF, JPG vagy PNG (Max. 5 MB)</div>
            </div>
          )}

          <div className="pt-2 text-xs text-[#63534B]">
            <strong>Számlázással kapcsolatos kérdés?</strong><br />
            Lépjen kapcsolatba az egyesület könyvelésével: <a href="mailto:penzugy@koszegiturizmus.hu" className="text-[#6B1D2F] font-semibold hover:underline">penzugy@koszegiturizmus.hu</a>
          </div>

        </div>

      </div>

    </div>
  );
};
