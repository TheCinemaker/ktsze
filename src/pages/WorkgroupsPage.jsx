import React, { useCallback } from 'react';
import { Flower2 } from 'lucide-react';

import { listWorkgroups, getWorkgroupStats, listMyWorkgroupMemberships } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { useAuth } from '../context/AuthContext';
import { PageHeader, EmptyState, LoadingBlock, ErrorBlock } from '../components/ui';
import { WorkgroupCard } from '../components/workgroups/WorkgroupCard';

export const WorkgroupsPage = () => {
  const { profile, isAuthenticated } = useAuth();

  const groups = useAsyncData(listWorkgroups);
  const stats = useAsyncData(getWorkgroupStats, [], { initialData: {} });
  const memberships = useAsyncData(
    () => listMyWorkgroupMemberships(profile.id),
    [profile?.id],
    { enabled: Boolean(profile?.id), initialData: [] }
  );

  const reloadAll = useCallback(async () => {
    await Promise.all([stats.reload(), memberships.reload()]);
  }, [stats, memberships]);

  const active = (groups.data || []).filter((g) => g.is_active);
  const myMemberships = memberships.data || [];
  const membershipOf = (workgroupId) => myMemberships.find((m) => m.workgroup_id === workgroupId);

  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Szakmai munka"
        title="Munkacsoportok"
        description="Az egyesület munkája munkacsoportokban zajlik. Válaszd ki, amelyikben szívesen részt vennél, és jelentkezz — a csoport vezetője vagy az elnökség bírálja el."
      />

      {!isAuthenticated && (
        <p className="mt-6 max-w-prose rounded-xl border border-sand-400 bg-sand-50 p-4 text-sm text-ink-600">
          A jelentkezéshez fiók kell. Ha még nincs, a belépési oldalon pár perc alatt létrehozható — egyesületi
          tagság nem előfeltétele annak, hogy egy munkacsoportba jelentkezz.
        </p>
      )}

      <div className="mt-10">
        {groups.loading && <LoadingBlock />}
        {groups.error && <ErrorBlock message={groups.error} onRetry={groups.reload} />}

        {!groups.loading && !groups.error && (
          <>
            {active.length === 0 ? (
              <EmptyState
                icon={Flower2}
                title="Még nincs aktív munkacsoport"
                description="A munkacsoportokat az elnökség hozza létre a belső felületen. Amint az első elindul, itt fog megjelenni, csatlakozási lehetőséggel."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {active.map((group) => (
                  <WorkgroupCard
                    key={group.id}
                    workgroup={group}
                    stats={(stats.data || {})[group.id]}
                    membership={membershipOf(group.id)}
                    onChanged={reloadAll}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
