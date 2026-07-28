import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LogIn, UserPlus, MailCheck, KeyRound } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { HeaderLogo } from '../components/layout/HeaderLogo';
import { TextInput, Select, Spinner, LoadingBlock } from '../components/ui';

/*
  A korábbi verzió három súlyos hibája, amit ez a fájl megszüntet:

    1. A jelszó be volt égetve a kliens kódba, tehát a böngésző forrásában
       bárki elolvashatta.
    2. A hibaüzenet KIÍRTA a helyes belépési adatokat.
    3. A tagoknál a jelszót egyáltalán nem ellenőrizte a rendszer — elég volt
       egy létező e-mail cím, bármilyen jelszóval bejutott.

  Most a jelszót a Supabase Auth ellenőrzi, hashelve tárolva. A kliens kódban
  nincs semmilyen titok, és a hibaüzenet nem ad támpontot a helyes adatokhoz.
*/

const CATEGORY_OPTIONS = [
  { value: 'Rendes tag', label: 'Rendes tag (vállalkozás, szolgáltató)' },
  { value: 'Pártoló tag', label: 'Pártoló tag (magánszemély)' }
];

const ACTIVITY_OPTIONS = [
  { value: 'szállásadó', label: 'Szállásadó' },
  { value: 'vendéglős', label: 'Vendéglátás' },
  { value: 'borász', label: 'Borászat' },
  { value: 'szolgáltató', label: 'Egyéb szolgáltatás' },
  { value: 'kulturális', label: 'Kulturális' },
  { value: 'egyéb', label: 'Egyéb' }
];

const LoginForm = ({ onSwitch }) => {
  const { login, requestPasswordReset } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [resetPending, setResetPending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    try {
      await login(identifier, password);
      toast.success('Sikeres belépés.');
      navigate(location.state?.from || '/tagi', { replace: true });
    } catch (err) {
      // A hibaüzenet szándékosan semmilyen támpontot nem ad.
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  const handleReset = async () => {
    if (!identifier.trim()) {
      toast.info('Írd be az e-mail címedet, és utána kérj jelszó-visszaállítást.');
      return;
    }
    setResetPending(true);
    try {
      await requestPasswordReset(identifier);
      toast.success('Elküldtük a jelszó-visszaállító levelet. Nézd meg a postafiókodat.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResetPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <TextInput
        label="E-mail cím vagy felhasználónév"
        type="text"
        required
        autoComplete="username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="pelda@szallas.hu"
      />

      <TextInput
        label="Jelszó"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? <Spinner label="Belépés…" className="text-current" /> : (
          <>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Belépés
          </>
        )}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-sand-300 pt-4">
        <button type="button" onClick={handleReset} disabled={resetPending} className="btn-ghost btn-sm -ml-3">
          {resetPending ? 'Küldés…' : 'Elfelejtett jelszó'}
        </button>
        <button type="button" onClick={onSwitch} className="btn-ghost btn-sm -mr-3">
          Nincs még fiókom
        </button>
      </div>
    </form>
  );
};

const RegisterForm = ({ onSwitch, onNeedsConfirmation }) => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    full_name: '',
    phone: '',
    private_email: '',
    home_address: '',
    member_category: 'Rendes tag',
    business_activity: 'szolgáltató',
    service_location_name: '',
    service_street: '',
    service_house_number: ''
  });
  const [pending, setPending] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const isPatron = form.member_category === 'Pártoló tag';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.passwordConfirm) {
      toast.error('A két jelszó nem egyezik.');
      return;
    }

    setPending(true);
    try {
      const { passwordConfirm: _unused, email, password, ...profileData } = form;
      const result = await register({ email, password, ...profileData });

      if (result.needsEmailConfirmation) {
        onNeedsConfirmation(email);
        return;
      }

      toast.success('A fiókod elkészült. A tagságot az elnökség hagyja jóvá.');
      navigate('/tagi', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Select
        label="Tagsági forma"
        required
        value={form.member_category}
        onChange={set('member_category')}
        options={CATEGORY_OPTIONS}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Teljes név" required value={form.full_name} onChange={set('full_name')} autoComplete="name" />
        <TextInput label="Telefonszám" required value={form.phone} onChange={set('phone')} autoComplete="tel" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="E-mail cím (belépéshez)"
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
        />
        <TextInput
          label="Privát e-mail"
          type="email"
          value={form.private_email}
          onChange={set('private_email')}
          hint="Nem kötelező."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Jelszó"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={set('password')}
          autoComplete="new-password"
          hint="Legalább 8 karakter."
        />
        <TextInput
          label="Jelszó megerősítése"
          type="password"
          required
          value={form.passwordConfirm}
          onChange={set('passwordConfirm')}
          autoComplete="new-password"
        />
      </div>

      <TextInput label="Lakcím" value={form.home_address} onChange={set('home_address')} autoComplete="street-address" />

      {/* Szolgáltatás adatai csak vállalkozói tagságnál értelmesek */}
      {!isPatron && (
        <fieldset className="surface space-y-4 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-wine-600">
            A szolgáltatás adatai
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Tevékenység"
              value={form.business_activity}
              onChange={set('business_activity')}
              options={ACTIVITY_OPTIONS}
            />
            <TextInput
              label="Szolgáltatás neve"
              value={form.service_location_name}
              onChange={set('service_location_name')}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <TextInput label="Utca" value={form.service_street} onChange={set('service_street')} />
            </div>
            <TextInput label="Házszám" value={form.service_house_number} onChange={set('service_house_number')} />
          </div>
        </fieldset>
      )}

      <p className="text-xs text-ink-500">
        A regisztráció fiókot hoz létre, de önmagában nem jelent egyesületi tagságot — azt az elnökség hagyja jóvá.
      </p>

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? <Spinner label="Fiók létrehozása…" className="text-current" /> : (
          <>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Fiók létrehozása
          </>
        )}
      </button>

      <div className="border-t border-sand-300 pt-4 text-center">
        <button type="button" onClick={onSwitch} className="btn-ghost btn-sm">
          Van már fiókom — belépés
        </button>
      </div>
    </form>
  );
};

/**
 * Új jelszó megadása a visszaállító linkről érkezve.
 *
 * Ez korábban hiányzott: a rendszer kiküldte a levelet, de nem volt hova
 * megérkezni — a felhasználó nem tudott új jelszót beállítani.
 */
const SetNewPasswordForm = () => {
  const { updatePassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      toast.error('A két jelszó nem egyezik.');
      return;
    }
    setPending(true);
    try {
      await updatePassword(password);
      toast.success('Az új jelszavad elmentve.');
      navigate('/tagi', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="rounded-lg border border-caution-300 bg-caution-50 p-3">
        <p className="text-sm text-ink-800">
          A visszaállító linkről érkeztél. Adj meg egy új jelszót a folytatáshoz.
        </p>
      </div>

      <TextInput
        label="Új jelszó"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        hint="Legalább 8 karakter."
      />

      <TextInput
        label="Új jelszó megerősítése"
        type="password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
      />

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? <Spinner label="Mentés…" className="text-current" /> : (
          <>
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Új jelszó mentése
          </>
        )}
      </button>
    </form>
  );
};

const ConfirmationNotice = ({ email }) => (
  <div className="text-center">
    <MailCheck className="mx-auto mb-4 h-9 w-9 text-positive-600" aria-hidden="true" />
    <h2 className="font-display text-xl text-ink-900">Nézd meg a postafiókodat</h2>
    <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600">
      Küldtünk egy megerősítő levelet a <strong className="text-ink-900">{email}</strong> címre. A belépés a
      megerősítés után lehetséges.
    </p>
    <p className="mx-auto mt-4 max-w-sm text-xs text-ink-500">
      Ha nem szeretnél e-mail megerősítést kérni a tagoktól, azt a Supabase Dashboard → Authentication → Sign In /
      Providers → „Confirm email” beállításnál lehet kikapcsolni.
    </p>
  </div>
);

export const LoginPage = () => {
  const { isAuthenticated, initializing, passwordRecovery } = useAuth();
  const [mode, setMode] = useState('login');
  const [confirmationEmail, setConfirmationEmail] = useState(null);
  const location = useLocation();

  if (initializing) return <LoadingBlock label="Munkamenet ellenőrzése…" />;

  // Jelszó-visszaállításnál van munkamenet, de itt kell maradni: új jelszót
  // kell megadni. Ezért ez a vizsgálat megelőzi az átirányítást.
  if (passwordRecovery) {
    return (
      <div className="container-page flex justify-center py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex justify-center">
              <HeaderLogo variant="mark" />
            </div>
            <h1 className="font-display text-2xl text-ink-900">Új jelszó beállítása</h1>
          </div>
          <div className="card p-6 sm:p-8">
            <SetNewPasswordForm />
          </div>
        </div>
      </div>
    );
  }

  // Belépve nincs mit keresni a belépőoldalon.
  if (isAuthenticated) return <Navigate to={location.state?.from || '/tagi'} replace />;

  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex justify-center">
            <HeaderLogo variant="mark" />
          </div>
          <h1 className="font-display text-2xl text-ink-900">Tagi és elnökségi belépés</h1>
          <p className="mt-1.5 text-sm text-ink-600">
            A zárt felületek eléréséhez lépj be, vagy hozz létre új fiókot.
          </p>
        </div>

        <div className="card overflow-hidden">
          {confirmationEmail ? (
            <div className="p-6 sm:p-8">
              <ConfirmationNotice email={confirmationEmail} />
            </div>
          ) : (
            <>
              <div className="tabbar bg-sand-50">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  aria-current={mode === 'login'}
                  className={`tab flex-1 justify-center ${mode === 'login' ? 'tab-active bg-paper' : ''}`}
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Belépés
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  aria-current={mode === 'register'}
                  className={`tab flex-1 justify-center ${mode === 'register' ? 'tab-active bg-paper' : ''}`}
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Regisztráció
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {mode === 'login' ? (
                  <LoginForm onSwitch={() => setMode('register')} />
                ) : (
                  <RegisterForm onSwitch={() => setMode('login')} onNeedsConfirmation={setConfirmationEmail} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
