import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Flower2, Heart, CreditCard, Sparkles, Phone, Mail } from 'lucide-react';

import { getWorkgroupBySlug, getWorkgroupStats, listMyWorkgroupMemberships, listApprovedWorkgroupMembers } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { useAuth } from '../context/AuthContext';
import { PageHeader, EmptyState, LoadingBlock, ErrorBlock, FormattedText } from '../components/ui';
import { JoinWorkgroupButton } from '../components/workgroups/JoinWorkgroupButton';
import { DonationModal } from '../components/workgroups/DonationModal';
import { WorkgroupProjectsSection } from '../components/workgroups/WorkgroupProjectsSection';
import { getWorkgroupDonationStats, fetchWorkgroupDonationStats } from '../lib/barion';
import { formatHuf } from '../lib/format';
import { supabase } from '../lib/supabaseClient';

export const WorkgroupDetailPage = () => {
  const { slug } = useParams();
  const { profile, can } = useAuth();
  const [donationOpen, setDonationOpen] = useState(false);

  const group = useAsyncData(() => getWorkgroupBySlug(slug), [slug]);
  const stats = useAsyncData(getWorkgroupStats, [], { initialData: {} });
  const memberships = useAsyncData(
    () => listMyWorkgroupMemberships(profile.id),
    [profile?.id],
    { enabled: Boolean(profile?.id), initialData: [] }
  );

  const workgroup = group.data;
  const isCrowdfundingEnabled = Boolean(workgroup?.enable_crowdfunding);
  const [donationStats, setDonationStats] = useState(null);

  const approvedMembersData = useAsyncData(
    () => (workgroup?.id ? listApprovedWorkgroupMembers(workgroup.id) : Promise.resolve([])),
    [workgroup?.id],
    { enabled: Boolean(workgroup?.id), initialData: [] }
  );

  const reloadDonationStats = useCallback(async () => {
    if (!workgroup || !isCrowdfundingEnabled) return;
    const fresh = await fetchWorkgroupDonationStats(workgroup.id, workgroup.target_amount || 250000);
    setDonationStats(fresh);
  }, [workgroup, isCrowdfundingEnabled]);

  // Realtime Supabase Adatbázis ÉLŐ Frissítés!
  useEffect(() => {
    if (!workgroup || !isCrowdfundingEnabled) return;
    reloadDonationStats();

    const channel = supabase
      .channel(`realtime_detail_donations_${workgroup.id}`)
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
  }, [workgroup, isCrowdfundingEnabled, reloadDonationStats]);

  const reloadAll = useCallback(async () => {
    await Promise.all([stats.reload(), memberships.reload(), reloadDonationStats(), approvedMembersData.reload()]);
  }, [stats, memberships, reloadDonationStats, approvedMembersData]);

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

  const memberCount = (stats.data || {})[workgroup.id]?.approved ?? 0;
  const membership = (memberships.data || []).find((m) => m.workgroup_id === workgroup.id);
  const approvedMembers = approvedMembersData.data || [];

  const isLeader = Boolean(
    can('admin.access') || can('board.access') ||
    (profile?.full_name && workgroup?.leader_name &&
      (profile.full_name.toLowerCase().includes(workgroup.leader_name.toLowerCase()) ||
       workgroup.leader_name.toLowerCase().includes(profile.full_name.toLowerCase())))
  );
  const isApprovedOrLeader = Boolean(membership?.status === 'approved' || membership?.status === 'active' || isLeader);

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
            <div className="flex flex-wrap items-center gap-2">
              {isCrowdfundingEnabled && (
                <button
                  type="button"
                  onClick={() => setDonationOpen(true)}
                  className="btn-primary py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2"
                >
                  <Heart className="h-4 w-4 fill-white" />
                  Támogatom a projektet
                </button>
              )}
              <JoinWorkgroupButton workgroup={workgroup} membership={membership} onChanged={reloadAll} />
            </div>
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

          {/* Munkacsoport Projektek, Feladatlisták & Fájlcsatolmányok */}
          <section className="pt-6 border-t border-sand-300">
            <WorkgroupProjectsSection workgroup={workgroup} />
          </section>
        </div>

        <aside className="space-y-5">
          {/* Barion Közösségi Finanszírozás Kártya — csak ha be van kapcsolva */}
          {isCrowdfundingEnabled && donationStats && (
            <div className={`surface p-5 border-l-4 space-y-4 ${
              donationStats.percentage >= 100 ? 'border-l-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-300' : 'border-l-emerald-500'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-ink-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Közösségi Finanszírozás
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Barion Sandbox
                </span>
              </div>

              {/* 100% SIKERES GYŰJTÉS BANNER */}
              {donationStats.percentage >= 100 && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white space-y-1 shadow-md animate-fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <Sparkles className="h-4 w-4 animate-bounce shrink-0" />
                    <span>🎉 A cél teljesítve, köszönjük a támogatást!</span>
                  </div>
                  <p className="text-xs text-emerald-100 leading-snug">
                    A kitűzött célösszeget elértük! Köszönjük a közösség összefogását és minden támogatónknak!
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {workgroup.campaign_goal && (
                  <p className="text-xs font-medium text-ink-800 bg-sand-100 p-2.5 rounded-lg border border-sand-300">
                    <strong>A támogatás célja:</strong> {workgroup.campaign_goal}
                  </p>
                )}

                <div className="flex justify-between text-xs font-medium text-ink-700 pt-1">
                  <span>Célösszeg:</span>
                  <span className="font-bold text-ink-900">{formatHuf(donationStats.targetAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-ink-700">
                  <span>Összegyűlt:</span>
                  <span className="font-bold text-emerald-700">{formatHuf(donationStats.currentAmount)} ({donationStats.percentage}%)</span>
                </div>
                <div className="h-3 w-full rounded-full bg-sand-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      donationStats.percentage >= 100
                        ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400'
                        : 'bg-gradient-to-r from-wine-600 via-emerald-500 to-emerald-400'
                    }`}
                    style={{ width: `${donationStats.percentage}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                disabled
                className="btn-primary w-full py-2.5 bg-sand-300 text-ink-500 font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-75 border border-sand-400"
              >
                <Heart className="h-4 w-4 fill-ink-400 text-ink-400" />
                Adományozás hamarosan
              </button>
              <p className="text-[11px] text-ink-500 text-center italic">
                A funkció az egyesületi bankszámla megnyitása után válik elérhetővé.
              </p>

              {donationStats.recentDonations.length > 0 && (
                <div className="pt-3 border-t border-sand-300 space-y-2">
                  <h3 className="text-xs font-bold text-ink-800 uppercase tracking-wider">Legutóbbi Támogatók:</h3>
                  <ul className="space-y-1.5 text-xs text-ink-600">
                    {donationStats.recentDonations.map((item) => (
                      <li key={item.id} className="flex justify-between items-center py-1 border-b border-sand-200 last:border-0">
                        <span className="font-medium text-ink-800">{item.donorName}</span>
                        <span className="font-bold text-emerald-700">{formatHuf(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="surface p-5 break-words space-y-4">
            <div className="flex items-center justify-between border-b border-sand-300 pb-3">
              <h2 className="font-display text-base font-bold text-ink-900">A csoportról</h2>
              <span className="badge-neutral text-xs font-bold flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-wine-700" />
                {memberCount} tag
              </span>
            </div>

            <dl className="space-y-3 text-sm">
              {workgroup.leader_name && (
                <div>
                  <dt className="text-xs uppercase font-bold tracking-wide text-ink-500">Vezető</dt>
                  <dd className="mt-0.5 font-semibold text-ink-900 break-words">{workgroup.leader_name}</dd>
                </div>
              )}
            </dl>

            {/* Zárt Tagok Névsora & Elérhetőségei */}
            {isApprovedOrLeader ? (
              <div className="pt-3 border-t border-sand-300 space-y-3">
                <h3 className="text-xs font-bold text-wine-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-wine-700" />
                  Csoporttagok &amp; Elérhetőségek:
                </h3>

                {approvedMembers.length === 0 ? (
                  <p className="text-xs italic text-ink-500 py-1">Még nincsenek jóváhagyott tagok.</p>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {approvedMembers.map((m) => {
                      const p = m.profiles || {};
                      const phone = p.phone;
                      const mail = p.private_email || p.account_email;
                      return (
                        <div key={m.id} className="p-2.5 rounded-xl bg-white border border-sand-300 space-y-1 shadow-2xs">
                          <div className="font-bold text-ink-900 text-xs flex items-center justify-between">
                            <span className="truncate">{p.full_name || 'Egyesületi Tag'}</span>
                          </div>
                          {(p.service_location_name || p.business_activity) && (
                            <p className="text-[11px] font-medium text-wine-700 truncate">
                              {p.service_location_name || p.business_activity}
                            </p>
                          )}
                          <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-600">
                            {phone && (
                              <a href={`tel:${phone}`} className="flex items-center gap-1 font-bold text-wine-800 hover:underline">
                                <Phone className="h-3 w-3 text-wine-600" />
                                {phone}
                              </a>
                            )}
                            {mail && (
                              <a href={`mailto:${mail}`} className="flex items-center gap-1 text-ink-600 hover:text-wine-800 hover:underline">
                                <Mail className="h-3 w-3 text-ink-400" />
                                {mail}
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 border-t border-sand-300 pt-3 text-xs text-ink-600 break-words leading-relaxed">
                A tagok elérhetőségei és kapcsolattartási adatai kizárólag a csoport bejelentkezett tagjai számára érhetők el.
              </p>
            )}
          </div>
        </aside>
      </div>

      <DonationModal
        open={donationOpen}
        onClose={() => setDonationOpen(false)}
        workgroup={workgroup}
        onSuccess={() => setDonationVersion((v) => v + 1)}
      />
    </div>
  );
};
