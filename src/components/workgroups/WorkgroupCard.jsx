import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { JoinWorkgroupButton } from './JoinWorkgroupButton';
import { DonationModal } from './DonationModal';
import { FormattedText } from '../ui';
import { getWorkgroupDonationStats, fetchWorkgroupDonationStats } from '../../lib/barion';
import { formatHuf } from '../../lib/format';
import { supabase } from '../../lib/supabaseClient';

export const WorkgroupCard = ({ workgroup, stats, membership, onChanged }) => {
  const [donationOpen, setDonationOpen] = useState(false);
  const isCrowdfundingEnabled = Boolean(workgroup.enable_crowdfunding);
  const [donationStats, setDonationStats] = useState(() =>
    isCrowdfundingEnabled ? getWorkgroupDonationStats(workgroup.id, workgroup.target_amount || 250000) : null
  );

  const reloadDonationStats = useCallback(async () => {
    if (!isCrowdfundingEnabled) return;
    const fresh = await fetchWorkgroupDonationStats(workgroup.id, workgroup.target_amount || 250000);
    setDonationStats(fresh);
  }, [workgroup.id, workgroup.target_amount, isCrowdfundingEnabled]);

  // Realtime Supabase Adatbázis Feliratkozás (Élő frissítés!)
  useEffect(() => {
    if (!isCrowdfundingEnabled) return;
    reloadDonationStats();

    const channel = supabase
      .channel(`realtime_donations_${workgroup.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workgroup_donations',
          filter: `workgroup_id=eq.${workgroup.id}`
        },
        () => {
          reloadDonationStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workgroup.id, isCrowdfundingEnabled, reloadDonationStats]);

  const memberCount = stats?.approved ?? 0;

  const handleDonationSuccess = () => {
    reloadDonationStats();
    if (onChanged) onChanged();
  };

  return (
    <article className="card-hover flex flex-col justify-between p-6 h-[540px] rounded-2xl border border-sand-300 bg-white shadow-sm transition-all overflow-hidden">
      {/* 1. Fejléc és Leírás Zóna (rugalmas magasságú, ha hosszú akkor görgethető) */}
      <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-hidden">
        <div className="flex items-start justify-between gap-3 shrink-0">
          <div className="rounded-lg bg-wine-50 p-2">
            <Users className="h-5 w-5 text-wine-600" aria-hidden="true" />
          </div>
          {memberCount > 0 && (
            <span className="badge-neutral shrink-0">
              {memberCount} {memberCount === 1 ? 'tag' : 'tag'}
            </span>
          )}
        </div>

        <div className="shrink-0">
          <h3 className="font-display text-lg sm:text-xl text-ink-900 line-clamp-1">
            <Link to={`/munkacsoportok/${workgroup.slug}`} className="rounded transition-colors hover:text-wine-600">
              {workgroup.name}
            </Link>
          </h3>

          {workgroup.leader_name && (
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-wine-600">
              Vezető: {workgroup.leader_name}
            </p>
          )}
        </div>

        {/* Görgethető Leírás Szövegdoboz */}
        {workgroup.description ? (
          <div className="flex-1 overflow-y-auto pr-1 text-sm text-ink-600 leading-relaxed custom-scrollbar">
            <FormattedText>{workgroup.description}</FormattedText>
          </div>
        ) : (
          <div className="flex-1 text-xs italic text-ink-400">Nincs leírás megadva.</div>
        )}
      </div>

      {/* 2. Barion Közösségi Finanszírozási Zóna (Fix elrendezésű csempe) */}
      {isCrowdfundingEnabled && donationStats ? (
        <div className={`shrink-0 my-3 p-3.5 rounded-xl border space-y-2 transition-all ${
          donationStats.percentage >= 100
            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200'
            : 'bg-sand-100 border-sand-300'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium text-ink-700">
            <span className="flex items-center gap-1 text-wine-700 font-bold">
              <Heart className="h-3.5 w-3.5 fill-wine-600 text-wine-600" />
              Projekt támogatás:
            </span>
            <span className={`font-mono font-bold ${donationStats.percentage >= 100 ? 'text-emerald-800' : 'text-ink-900'}`}>
              {formatHuf(donationStats.currentAmount)} / {formatHuf(donationStats.targetAmount)} ({donationStats.percentage}%)
            </span>
          </div>

          {/* Siker Jelzés ha elértük a 100%-ot! */}
          {donationStats.percentage >= 100 && (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm">
              <Sparkles className="h-3.5 w-3.5 animate-pulse shrink-0" />
              <span className="truncate">🎉 A cél teljesítve, köszönjük a támogatást!</span>
            </div>
          )}

          {/* Mire fordítjuk az összeget — max 2 soros görgethető leírás */}
          {workgroup.campaign_goal && (
            <p className="text-[11px] font-medium text-ink-700 leading-snug max-h-10 overflow-y-auto pr-1 custom-scrollbar">
              <strong>Cél:</strong> {workgroup.campaign_goal}
            </p>
          )}

          <div className="h-2.5 w-full rounded-full bg-sand-300 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                donationStats.percentage >= 100
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 shadow-md'
                  : 'bg-gradient-to-r from-wine-600 to-emerald-500'
              }`}
              style={{ width: `${donationStats.percentage}%` }}
            />
          </div>

          <div className="pt-0.5 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              disabled
              className="btn-secondary btn-sm py-1 px-2.5 text-xs font-bold flex items-center gap-1 opacity-60 cursor-not-allowed border-sand-400 bg-sand-200 text-ink-500"
            >
              <Heart className="h-3 w-3 text-ink-400 fill-ink-400" />
              Hamarosan
            </button>
            <span className="text-[10px] text-ink-500 italic">Fejlesztés alatt</span>
          </div>
        </div>
      ) : null}

      {/* 3. Görgethető Hírek / Frissítések Zóna */}
      {workgroup.latest_updates && (
        <div className="shrink-0 max-h-16 overflow-y-auto pr-1 custom-scrollbar border-t border-sand-300 pt-2 text-xs text-ink-500">
          <FormattedText>{workgroup.latest_updates}</FormattedText>
        </div>
      )}

      {/* 4. Alsó Akciók Zóna */}
      <div className="shrink-0 border-t border-sand-300 pt-3 flex items-center justify-between gap-3">
        <JoinWorkgroupButton
          workgroup={workgroup}
          membership={membership}
          onChanged={onChanged}
          size="small"
        />

        <Link
          to={`/munkacsoportok/${workgroup.slug}`}
          className="inline-flex items-center gap-1 rounded text-xs font-bold text-wine-600 hover:underline"
        >
          Részletek
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <DonationModal
        open={donationOpen}
        onClose={() => setDonationOpen(false)}
        workgroup={workgroup}
        onSuccess={handleDonationSuccess}
      />
    </article>
  );
};
