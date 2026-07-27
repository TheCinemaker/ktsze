import React from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Clock, Check, X, ArrowRight } from 'lucide-react';

import { listMyWorkgroupMemberships } from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, LoadingBlock, ErrorBlock } from '../ui';
import { JoinWorkgroupButton } from '../workgroups/JoinWorkgroupButton';
import { formatDateShort } from '../../lib/format';

const STATUS = {
  approved: { label: 'Jóváhagyott tag', cls: 'badge-positive', Icon: Check },
  pending: { label: 'Elbírálás alatt', cls: 'badge-caution', Icon: Clock },
  rejected: { label: 'Elutasítva', cls: 'badge-neutral', Icon: X }
};

/** A belépett felhasználó csoporttagságai és folyamatban lévő jelentkezései. */
export const MyWorkgroups = () => {
  const { profile } = useAuth();
  const { data, loading, error, reload } = useAsyncData(
    () => listMyWorkgroupMemberships(profile.id),
    [profile?.id],
    { enabled: Boolean(profile?.id) }
  );

  const memberships = data || [];

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  if (memberships.length === 0) {
    return (
      <EmptyState
        icon={Flower2}
        title="Még nem jelentkeztél munkacsoportba"
        description="Az egyesület munkája munkacsoportokban zajlik. Nézd meg, melyikben vennél részt szívesen."
        action={
          <Link to="/munkacsoportok" className="btn-primary">
            Munkacsoportok megtekintése
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <ul className="divide-y divide-sand-300 overflow-hidden rounded-xl border border-sand-400 bg-white">
        {memberships.map((membership) => {
          const group = membership.workgroups;
          const status = STATUS[membership.status] || STATUS.pending;
          const { Icon } = status;

          return (
            <li key={membership.id} className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg text-ink-900">
                    {group ? (
                      <Link
                        to={`/munkacsoportok/${group.slug}`}
                        className="rounded transition-colors hover:text-wine-600"
                      >
                        {group.name}
                      </Link>
                    ) : (
                      'Törölt munkacsoport'
                    )}
                  </h3>
                  <span className={status.cls}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {status.label}
                  </span>
                </div>

                <p className="mt-1 text-xs text-ink-500">
                  Jelentkezés: {formatDateShort(membership.requested_at)}
                  {membership.decided_at ? ` • Elbírálva: ${formatDateShort(membership.decided_at)}` : ''}
                </p>

                {group?.leader_name && (
                  <p className="mt-1 text-sm text-ink-600">Vezető: {group.leader_name}</p>
                )}

                {membership.decision_note && (
                  <p className="mt-2 rounded-lg bg-sand-100 p-2.5 text-sm text-ink-600">
                    {membership.decision_note}
                  </p>
                )}
              </div>

              {group && (
                <div className="shrink-0">
                  <JoinWorkgroupButton
                    workgroup={group}
                    membership={membership}
                    onChanged={reload}
                    size="small"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Link to="/munkacsoportok" className="btn-secondary btn-sm">
        További munkacsoportok
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
};
