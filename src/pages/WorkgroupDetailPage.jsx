import React, { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Flower2 } from 'lucide-react';

import { getWorkgroupBySlug, getWorkgroupStats, listMyWorkgroupMemberships } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { useAuth } from '../context/AuthContext';
import { PageHeader, EmptyState, LoadingBlock, ErrorBlock, FormattedText } from '../components/ui';
import { JoinWorkgroupButton } from '../components/workgroups/JoinWorkgroupButton';

export const WorkgroupDetailPage = () => {
  const { slug } = useParams();
  const { profile } = useAuth();

  const group = useAsyncData(() => getWorkgroupBySlug(slug), [slug]);
  const stats = useAsyncData(getWorkgroupStats, [], { initialData: {} });
  const memberships = useAsyncData(
    () => listMyWorkgroupMemberships(profile.id),
    [profile?.id],
    { enabled: Boolean(profile?.id), initialData: [] }
  );

  const reloadAll = useCallback(async () => {
    await Promise.all([stats.reload(), memberships.reload()]);
  }, [stats, memberships]);

  if (group.loading) return <LoadingBlock />;

  if (group.error) {
    return (
      <div className="container-page py-16">
        <ErrorBlock message={group.error} onRetry={group.reload} />
      </div>
    );
  }

  if (!group.data) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={Flower2}
          title="Ez a munkacsoport nem található"
          description="Elképzelhető, hogy a hivatkozás elavult, vagy a csoportot azóta elrejtették."
          action={
            <Link to="/munkacsoportok" className="btn-secondary">
              Vissza a munkacsoportokhoz
            </Link>
          }
        />
      </div>
    );
  }

  const workgroup = group.data;
  const memberCount = (stats.data || {})[workgroup.id]?.approved ?? 0;
  const membership = (memberships.data || []).find((m) => m.workgroup_id === workgroup.id);

  return (
    <div className="container-page py-12 sm:py-16">
      <Link to="/munkacsoportok" className="btn-ghost btn-sm -ml-3">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Munkacsoportok
      </Link>

      <div className="mt-6">
        <PageHeader
          eyebrow="Munkacsoport"
          title={workgroup.name}
          description={workgroup.description ? <FormattedText>{workgroup.description}</FormattedText> : undefined}
          actions={
            <JoinWorkgroupButton workgroup={workgroup} membership={membership} onChanged={reloadAll} />
          }
        />
      </div>

      {!workgroup.is_active && (
        <p className="mt-6 rounded-xl border border-caution-300 bg-caution-50 p-4 text-sm text-ink-800">
          Ez a munkacsoport jelenleg nem aktív, ezért a nyilvános listában nem szerepel.
        </p>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {workgroup.latest_updates && (
            <section>
              <h2 className="font-display text-xl text-ink-900">Friss információk</h2>
              <div className="prose-body mt-3">
                {workgroup.latest_updates.split(/\n{2,}/).map((paragraph, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <p key={index} className={index > 0 ? 'mt-4' : undefined}>
                    <FormattedText>{paragraph}</FormattedText>
                  </p>
                ))}
              </div>
            </section>
          )}

          {!workgroup.description && !workgroup.latest_updates && (
            <EmptyState
              icon={Flower2}
              title="Ehhez a csoporthoz még nincs leírás"
              description="A csoport vezetője vagy az elnökség a belső felületen tud leírást és friss információkat hozzáadni."
            />
          )}
        </div>

        <aside className="space-y-5">
          <div className="surface p-5">
            <h2 className="font-display text-base text-ink-900">A csoportról</h2>
            <dl className="mt-3 space-y-3 text-sm">
              {workgroup.leader_name && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink-500">Vezető</dt>
                  <dd className="mt-0.5 text-ink-900">{workgroup.leader_name}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-500">Létszám</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-ink-900">
                  <Users className="h-4 w-4 text-wine-600" aria-hidden="true" />
                  {memberCount} jóváhagyott tag
                </dd>
              </div>
            </dl>

            <p className="mt-4 border-t border-sand-300 pt-3 text-xs text-ink-500">
              A tagok névsora nem nyilvános. A jelentkezésedet csak a csoport vezetője és az elnökség látja.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
