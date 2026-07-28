import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Heart } from 'lucide-react';
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
    <article className="card-hover flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg bg-wine-50 p-2">
          <Users className="h-5 w-5 text-wine-600" aria-hidden="true" />
        </div>
        {memberCount > 0 && (
          <span className="badge-neutral">
            {memberCount} {memberCount === 1 ? 'tag' : 'tag'}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-xl text-ink-900">
        <Link to={`/munkacsoportok/${workgroup.slug}`} className="rounded transition-colors hover:text-wine-600">
          {workgroup.name}
        </Link>
      </h3>

      {workgroup.leader_name && (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-wine-600">
          Vezető: {workgroup.leader_name}
        </p>
      )}

      {workgroup.description && (
        <div className="mt-3 flex-1 text-sm text-ink-600">
          <FormattedText>{workgroup.description}</FormattedText>
        </div>
      )}

      {/* Barion Közösségi Finanszírozási Haladási Sáv — csak ha be van kapcsolva az adminon */}
      {isCrowdfundingEnabled && donationStats && (
        <div className={`mt-4 p-3.5 rounded-xl border space-y-2 transition-all ${
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
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>🎉 Cél teljesülve! Köszönjük a támogatásokat!</span>
            </div>
          )}

          {/* Mire fordítjuk az összeget */}
          {workgroup.campaign_goal && (
            <p className="text-[11px] font-medium text-ink-700 leading-snug">
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

          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setDonationOpen(true)}
              className={`btn-secondary btn-sm py-1 px-2.5 text-xs font-bold flex items-center gap-1 ${
                donationStats.percentage >= 100
                  ? 'text-emerald-800 border-emerald-400 bg-white hover:bg-emerald-100'
                  : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <Heart className="h-3 w-3 text-emerald-600 fill-emerald-600" />
              {donationStats.percentage >= 100 ? 'További támogatás' : 'Támogatom'}
            </button>
            <span className="text-[10px] text-ink-500">Barion Sandbox</span>
          </div>
        </div>
      )}

      {workgroup.latest_updates && (
        <div className="mt-3 border-t border-sand-300 pt-3 text-sm text-ink-500">
          <FormattedText>{workgroup.latest_updates}</FormattedText>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-sand-300 pt-4">
        <JoinWorkgroupButton
          workgroup={workgroup}
          membership={membership}
          onChanged={onChanged}
          size="small"
        />

        <Link
          to={`/munkacsoportok/${workgroup.slug}`}
          className="inline-flex items-center gap-1 rounded text-sm font-medium text-wine-600 hover:underline"
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
