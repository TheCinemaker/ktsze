import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowUpRight, Heart, Sparkles } from 'lucide-react';
import { JoinWorkgroupButton } from './JoinWorkgroupButton';
import { DonationModal } from './DonationModal';
import { FormattedText } from '../ui';
import { getWorkgroupDonationStats, fetchWorkgroupDonationStats } from '../../lib/barion';
import { formatHuf } from '../../lib/format';
import { supabase } from '../../lib/supabaseClient';
import { useSpotlight } from '../../lib/motion';

/* ---------------------------------------------------------------------------
   Támogatottsági mérő

   A százalék a sáv FÖLÖTT áll, nagy, tabuláris számként — a haladás így egy
   pillantásra leolvasható, nem kell a sáv hosszát szemmel becsülni. A vékony
   sáv csak megerősíti, amit a szám már elmondott.
   --------------------------------------------------------------------------- */
const DonationMeter = ({ stats, goal, onDonate }) => {
  const complete = stats.percentage >= 100;

  return (
    <div
      className={`shrink-0 space-y-3 rounded-2xl border p-4 transition-colors duration-500 ${
        complete ? 'border-jade-400/50 bg-jade-50' : 'border-sand-300 bg-sand-50'
      }`}
    >
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-[0.16em] text-ink-400">
            <Heart
              className={`h-3 w-3 ${complete ? 'fill-jade-500 text-jade-500' : 'fill-wine-500 text-wine-500'}`}
              aria-hidden="true"
            />
            Támogatás
          </div>
          <div className="mt-1 truncate font-mono text-xs text-ink-600">
            {formatHuf(stats.currentAmount)}
            <span className="text-ink-300"> / </span>
            {formatHuf(stats.targetAmount)}
          </div>
        </div>

        <div
          className={`shrink-0 font-display text-2xl font-semibold tabular-nums ${
            complete ? 'text-jade-600' : 'text-wine-600'
          }`}
        >
          {stats.percentage}
          <span className="text-base text-ink-300">%</span>
        </div>
      </div>

      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-sand-300">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-lux ${
            complete
              ? 'bg-gradient-to-r from-jade-600 to-jade-400'
              : 'bg-gradient-to-r from-wine-600 via-wine-500 to-gold-500'
          }`}
          style={{ width: `${Math.min(stats.percentage, 100)}%` }}
        />
      </div>

      {complete && (
        <div className="flex items-center gap-2 rounded-xl bg-jade-500/15 px-3 py-1.5 text-xs font-medium text-jade-700">
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">A cél teljesítve, köszönjük a támogatást!</span>
        </div>
      )}

      {goal && (
        <p className="custom-scrollbar max-h-10 overflow-y-auto pr-1 text-xs leading-snug text-ink-500">
          <span className="font-medium text-ink-700">Cél:</span> {goal}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onDonate}
          className={`btn btn-sm rounded-full border-transparent font-medium transition-all duration-300 ${
            complete
              ? 'bg-jade-500/15 text-jade-700 hover:bg-jade-500/25'
              : 'bg-wine-500/12 text-wine-600 hover:bg-wine-500/25'
          }`}
        >
          <Heart className="h-3 w-3 fill-current" aria-hidden="true" />
          {complete ? 'További támogatás' : 'Támogatom'}
        </button>
        <span className="font-mono text-2xs uppercase tracking-[0.14em] text-ink-300">Barion</span>
      </div>
    </div>
  );
};

export const WorkgroupCard = ({ workgroup, stats, membership, onChanged }) => {
  const [donationOpen, setDonationOpen] = useState(false);
  const spotlightRef = useSpotlight();
  const isCrowdfundingEnabled = Boolean(workgroup.enable_crowdfunding);
  const [donationStats, setDonationStats] = useState(() =>
    isCrowdfundingEnabled ? getWorkgroupDonationStats(workgroup.id, workgroup.target_amount || 250000) : null
  );

  const reloadDonationStats = useCallback(async () => {
    if (!isCrowdfundingEnabled) return;
    const fresh = await fetchWorkgroupDonationStats(workgroup.id, workgroup.target_amount || 250000);
    setDonationStats(fresh);
  }, [workgroup.id, workgroup.target_amount, isCrowdfundingEnabled]);

  // Realtime Supabase feliratkozás — a támogatottság magától frissül.
  useEffect(() => {
    if (!isCrowdfundingEnabled) return undefined;
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
        () => reloadDonationStats()
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
    <article
      ref={spotlightRef}
      className="card-hover spotlight group relative flex h-[560px] flex-col overflow-hidden p-6"
    >
      {/* A kártya „megvilágított" felső éle — halk derengés, ami mélységet ad. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(70%_100%_at_50%_0%,oklch(var(--wine-500)/0.07),transparent_75%)]"
      />

      {/* 1. Fejléc és leírás */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-start justify-between gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-sand-300 bg-sand-100
                       text-wine-600 transition-colors duration-500 group-hover:border-gold-400/50 group-hover:bg-wine-50"
          >
            <Users className="h-5 w-5" aria-hidden="true" />
          </span>

          {memberCount > 0 && (
            <span className="badge-neutral shrink-0 font-mono text-2xs tracking-[0.12em]">
              {memberCount} tag
            </span>
          )}
        </div>

        <div className="mt-4 shrink-0">
          <h3 className="line-clamp-1 font-display text-xl leading-snug text-ink-900">
            <Link
              to={`/munkacsoportok/${workgroup.slug}`}
              className="transition-colors hover:text-wine-600"
            >
              {workgroup.name}
            </Link>
          </h3>

          {workgroup.leader_name && (
            <p className="mt-1.5 font-mono text-2xs uppercase tracking-[0.16em] text-wine-600">
              Vezető · {workgroup.leader_name}
            </p>
          )}
        </div>

        <div aria-hidden="true" className="rule-gold my-4 shrink-0 opacity-60" />

        {workgroup.description ? (
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-ink-500">
            <FormattedText>{workgroup.description}</FormattedText>
          </div>
        ) : (
          <div className="min-h-0 flex-1 text-sm italic text-ink-300">Nincs leírás megadva.</div>
        )}
      </div>

      {/* 2. Közösségi finanszírozás */}
      {isCrowdfundingEnabled && donationStats && (
        <div className="relative mt-4">
          <DonationMeter
            stats={donationStats}
            goal={workgroup.campaign_goal}
            onDonate={() => setDonationOpen(true)}
          />
        </div>
      )}

      {/* 3. Frissítések */}
      {workgroup.latest_updates && (
        <div className="custom-scrollbar relative mt-4 max-h-14 shrink-0 overflow-y-auto border-t border-sand-300 pt-3 text-xs leading-relaxed text-ink-400">
          <FormattedText>{workgroup.latest_updates}</FormattedText>
        </div>
      )}

      {/* 4. Akciók */}
      <div className="relative mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-sand-300 pt-4">
        <JoinWorkgroupButton
          workgroup={workgroup}
          membership={membership}
          onChanged={onChanged}
          size="small"
        />

        <Link
          to={`/munkacsoportok/${workgroup.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-wine-600 transition-colors hover:text-wine-500"
        >
          Részletek
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
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
