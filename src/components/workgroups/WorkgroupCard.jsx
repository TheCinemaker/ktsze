import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Heart } from 'lucide-react';
import { JoinWorkgroupButton } from './JoinWorkgroupButton';
import { DonationModal } from './DonationModal';
import { FormattedText } from '../ui';
import { getWorkgroupDonationStats } from '../../lib/barion';
import { formatHuf } from '../../lib/format';

export const WorkgroupCard = ({ workgroup, stats, membership, onChanged }) => {
  const [donationOpen, setDonationOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const memberCount = stats?.approved ?? 0;
  const donationStats = getWorkgroupDonationStats(workgroup.id);

  const handleDonationSuccess = () => {
    setReloadKey((k) => k + 1);
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

      {/* Barion Közösségi Finanszírozási Haladási Sáv */}
      <div className="mt-4 p-3 rounded-xl bg-sand-100 border border-sand-300 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-ink-700">
          <span className="flex items-center gap-1 text-wine-700 font-bold">
            <Heart className="h-3.5 w-3.5 fill-wine-600 text-wine-600" />
            Projekt támogatás:
          </span>
          <span className="font-mono text-ink-900 font-bold">
            {formatHuf(donationStats.currentAmount)} / {formatHuf(donationStats.targetAmount)} ({donationStats.percentage}%)
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-sand-300 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-wine-600 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${donationStats.percentage}%` }}
          />
        </div>

        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setDonationOpen(true)}
            className="btn-secondary btn-sm py-1 px-2.5 text-xs font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1"
          >
            <Heart className="h-3 w-3 text-emerald-600 fill-emerald-600" />
            Támogatom
          </button>
          <span className="text-[10px] text-ink-500">Barion Sandbox</span>
        </div>
      </div>

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
