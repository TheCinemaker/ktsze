import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { JoinWorkgroupButton } from './JoinWorkgroupButton';
import { FormattedText } from '../ui';

/**
 * Munkacsoport csempe. A csatlakozás gomb közvetlenül itt van, hogy ne kelljen
 * előbb aloldalra navigálni.
 *
 * A taglétszám az összesítő függvényből jön — a tagok NEVE nyilvánosan nem
 * látszik, mert az személyes adat.
 */
export const WorkgroupCard = ({ workgroup, stats, membership, onChanged }) => {
  const memberCount = stats?.approved ?? 0;

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
    </article>
  );
};
