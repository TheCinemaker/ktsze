import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingBlock, EmptyState, ErrorBlock } from '../ui';
import { ShieldAlert } from 'lucide-react';

/**
 * Védett útvonal.
 *
 * FONTOS: ez csak felhasználói kényelem — a valódi védelmet a Supabase RLS
 * adja. Aki kikapcsolja a JavaScriptet vagy átírja a kliens kódot, az sem lát
 * több adatot, mert a szerver nem adja ki.
 *
 * @param {string} [permission] pl. 'admin.access'
 */
export const RequireAuth = ({ permission, children }) => {
  const { isAuthenticated, initializing, profileLoading, profileError, profile, can, refreshProfile } = useAuth();
  const location = useLocation();

  // Amíg a munkamenetet ellenőrizzük, ne irányítsunk át — különben
  // lapfrissítéskor a belépett felhasználót is kidobná a belépőoldalra.
  if (initializing) {
    return <LoadingBlock label="Munkamenet ellenőrzése…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/belepes" replace state={{ from: location.pathname }} />;
  }

  // A jogosultság a profilhoz csatolt szerepkörökből jön — várjuk meg.
  if (permission && profileLoading) {
    return <LoadingBlock label="Jogosultságok ellenőrzése…" />;
  }

  // FONTOS: ha a profil be sem töltött, a szerepkörök üresek — ilyenkor NEM
  // szabad "nincs jogosultságod"-ot írni, mert az félrevezető. A tényleges
  // adatbázishibát kell megmutatni, különben a rendszergazda azt hiszi, hogy
  // elvesztette a hozzáférését.
  if (permission && !profile) {
    return (
      <div className="container-page py-16">
        <ErrorBlock
          message={
            profileError ||
            'A profil nem tölthető be az adatbázisból, ezért a jogosultságokat sem tudjuk ellenőrizni.'
          }
          onRetry={refreshProfile}
        />
      </div>
    );
  }

  if (permission && !can(permission)) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShieldAlert}
          title="Ehhez nincs jogosultságod"
          description="Ez a felület az elnökség számára készült. Ha úgy gondolod, hogy hozzáférésre lenne szükséged, jelezd a rendszergazdának."
        />
      </div>
    );
  }

  return children;
};
