import React, { useState } from 'react';
import { CreditCard, FileText, UserCog, Flower2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { MembershipDues } from '../components/member/MembershipDues';
import { DocumentVault } from '../components/member/DocumentVault';
import { ProfileForm } from '../components/member/ProfileForm';
import { MyWorkgroups } from '../components/member/MyWorkgroups';
import { PageHeader, LoadingBlock } from '../components/ui';

/*
  A Google Drive fül eltávolítva. Nem volt mögötte integráció: sem OAuth, sem
  API-hívás — csak egy felület, ami alert-tel azt állította, hogy feltöltötte a
  fájlt a megosztott mappába. A csatolási pont az adatbázisban elő van
  készítve (documents.drive_file_id, documents.drive_url), így ha később
  bekötjük, nem kell újra migrálni.
*/

const TABS = [
  { id: 'dues', label: 'Tagdíj', icon: CreditCard },
  { id: 'workgroups', label: 'Munkacsoportjaim', icon: Flower2 },
  { id: 'documents', label: 'Dokumentumok', icon: FileText },
  { id: 'profile', label: 'Adatlapom', icon: UserCog }
];

export const MemberDashboardPage = () => {
  const { profile, roleLabel, profileLoading, profileError, refreshProfile } = useAuth();
  const [active, setActive] = useState('dues');

  if (profileLoading && !profile) return <LoadingBlock label="Adatlap betöltése…" />;

  const displayName = profile?.service_location_name || profile?.full_name || profile?.account_email;

  return (
    <div className="container-page space-y-8 py-12">
      <PageHeader
        eyebrow={roleLabel ? `Tagi portál — ${roleLabel}` : 'Tagi portál'}
        title={displayName || 'Tagi portál'}
        description={
          profile?.full_name && profile?.service_location_name ? profile.full_name : undefined
        }
      />

      {!profile && !profileLoading && (
        <div className="card border-caution-300 bg-caution-50 p-5" role="alert">
          <h2 className="font-display text-lg text-ink-900">Az adatlap nem tölthető be</h2>
          <p className="mt-1.5 text-sm text-ink-600">
            A belépés sikerült, de a profil nem jött meg az adatbázisból.
          </p>

          {profileError && (
            <p className="mt-3 rounded-lg border border-sand-400 bg-paper p-3 font-mono text-xs text-ink-800">
              {profileError}
            </p>
          )}

          <button type="button" onClick={refreshProfile} className="btn-secondary btn-sm mt-4">
            Újrapróbálom
          </button>
        </div>
      )}

      {profile && (
        <>
          <div className="tabbar" role="tablist" aria-label="Tagi portál szakaszai">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={active === id}
                aria-controls={`panel-${id}`}
                onClick={() => setActive(id)}
                className={`tab ${active === id ? 'tab-active' : ''}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <div id={`panel-${active}`} role="tabpanel" aria-labelledby={`tab-${active}`}>
            {active === 'dues' && <MembershipDues />}
            {active === 'workgroups' && <MyWorkgroups />}
            {active === 'documents' && <DocumentVault />}
            {active === 'profile' && <ProfileForm />}
          </div>
        </>
      )}
    </div>
  );
};
