// =============================================================================
//  Belépés és munkamenet — kizárólag Supabase Auth.
//
//  Amit ez a fájl SZÁNDÉKOSAN nem tartalmaz:
//    - jelszót vagy bármilyen titkot (az a Supabase Auth-ban van, hashelve)
//    - localStorage-ot (a munkamenetet a supabase-js kezeli, lapfrissítés után
//      is megmarad)
//    - "belépés jelszó nélkül" utat
// =============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, describeError, resolveLoginIdentifier } from '../lib/supabaseClient';
import { getProfile, updateOwnProfile as dbUpdateOwnProfile } from '../lib/db';
import { can as checkPermission, primaryRoleLabel } from '../lib/permissions';

const AuthContext = createContext(null);

/** A profilra ráaggatott user_roles(role) tömbből sima string tömb. */
const extractRoles = (profile) =>
  Array.isArray(profile?.user_roles) ? profile.user_roles.map((r) => r.role).filter(Boolean) : [];

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);

  // `true`, amíg nem tudjuk, van-e érvényes munkamenet. Ezalatt nem szabad
  // "nincs belépve" felületet mutatni, mert az villogást és téves
  // átirányítást okoz lapfrissítéskor.
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Ha a profil betöltése elhasal, a szövegét megjelenítjük a felületen —
  // nem kell konzolt nyitni ahhoz, hogy kiderüljön, mi a baj.
  const [profileError, setProfileError] = useState(null);

  // A Supabase PASSWORD_RECOVERY eseményt küld, amikor a felhasználó a
  // jelszó-visszaállító linkről érkezik. Ilyenkor van munkamenete, de új
  // jelszót kell adnia — a belépőoldal erre külön űrlapot mutat.
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      setRoles([]);
      setProfileError(null);
      return null;
    }
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await getProfile(userId);
      setProfile(data || null);
      setRoles(extractRoles(data));
      if (!data) {
        setProfileError(
          'A belépés sikeres, de ehhez a fiókhoz nincs profil sor az adatbázisban. Futtasd le a supabase/04_fix_embed.sql szkriptet — az pótolja a hiányzó profilokat.'
        );
      }
      return data;
    } catch (err) {
      // A munkamenet érvényes, csak a profil nem jött meg. Ne dobjuk ki a
      // felhasználót, de mondjuk meg neki, mi a baj.
      console.error('[auth] A profil betöltése nem sikerült:', err.message);
      setProfile(null);
      setRoles([]);
      setProfileError(err.message);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      if (data.session?.user) await loadProfile(data.session.user.id);
      if (active) setInitializing(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession ?? null);

      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (event === 'SIGNED_OUT') setPasswordRecovery(false);

      if (nextSession?.user) {
        // Ne blokkoljuk a callbacket await-tel — a supabase-js ezt nem szereti.
        loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
        setRoles([]);
        setProfileError(null);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  // ---------------------------------------------------------------------------
  //  Műveletek
  // ---------------------------------------------------------------------------

  /** Belépés. "admin" rövid névvel is megy, e-mailre oldjuk fel. */
  const login = useCallback(async (identifier, password) => {
    const email = resolveLoginIdentifier(identifier);
    if (!email || !password) {
      throw new Error('Adj meg e-mail címet (vagy felhasználónevet) és jelszót.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(describeError(error));
    if (data.user) await loadProfile(data.user.id);
    return data;
  }, [loadProfile]);

  /**
   * Regisztráció. A profil és az alap szerepkör az adatbázis-oldali
   * handle_new_user() triggerben jön létre a metaadatokból — így a kliens
   * nem tud magának admint adni.
   *
   * @returns {{needsEmailConfirmation: boolean}}
   */
  const register = useCallback(async ({ email, password, ...profileData }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Az e-mail cím és a jelszó megadása kötelező.');
    }
    if (password.length < 8) {
      throw new Error('A jelszó legyen legalább 8 karakter.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: profileData }
    });
    if (error) throw new Error(describeError(error));

    if (data.session?.user) {
      await loadProfile(data.session.user.id);
      return { needsEmailConfirmation: false };
    }
    // Nincs session -> a Supabase e-mail megerősítést kér.
    return { needsEmailConfirmation: true };
  }, [loadProfile]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(describeError(error));
    setProfile(null);
    setRoles([]);
    setProfileError(null);
    setPasswordRecovery(false);
  }, []);

  const requestPasswordReset = useCallback(async (identifier) => {
    const email = resolveLoginIdentifier(identifier);
    if (!email) throw new Error('Adj meg egy e-mail címet.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/belepes`
    });
    if (error) throw new Error(describeError(error));
    return true;
  }, []);

  /** Új jelszó beállítása a visszaállító linkről érkezve. */
  const updatePassword = useCallback(async (newPassword) => {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('A jelszó legyen legalább 8 karakter.');
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(describeError(error));
    setPasswordRecovery(false);
    return true;
  }, []);

  const updateOwnProfile = useCallback(async (patch) => {
    if (!session?.user) throw new Error('Ehhez be kell lépned.');
    const updated = await dbUpdateOwnProfile(session.user.id, patch);
    setProfile(updated);
    setRoles(extractRoles(updated));
    return updated;
  }, [session]);

  const refreshProfile = useCallback(
    () => loadProfile(session?.user?.id),
    [loadProfile, session]
  );

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    roles,
    isAuthenticated: Boolean(session?.user),
    initializing,
    profileLoading,
    profileError,
    passwordRecovery,
    roleLabel: primaryRoleLabel(roles),
    /** Jogosultság-ellenőrzés, pl. can('news.manage') */
    can: (action) => checkPermission(roles, action),
    login,
    register,
    logout,
    requestPasswordReset,
    updatePassword,
    updateOwnProfile,
    refreshProfile
  }), [
    session, profile, roles, initializing, profileLoading, profileError, passwordRecovery,
    login, register, logout, requestPasswordReset, updatePassword, updateOwnProfile, refreshProfile
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth csak AuthProvider-en belül használható.');
  return ctx;
};
