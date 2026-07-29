import React, { useState, useEffect } from 'react';
import { Save, Key, Lock, CheckCircle2 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TextInput, Select, Spinner } from '../ui';

const ACTIVITY_OPTIONS = [
  { value: 'szállásadó', label: 'Szállásadó' },
  { value: 'vendéglős', label: 'Vendéglátás' },
  { value: 'borász', label: 'Borászat' },
  { value: 'szolgáltató', label: 'Egyéb szolgáltatás' },
  { value: 'kulturális', label: 'Kulturális' },
  { value: 'egyéb', label: 'Egyéb' }
];

const EDITABLE = [
  'full_name',
  'phone',
  'private_email',
  'home_address',
  'business_activity',
  'service_location_name',
  'service_street',
  'service_house_number',
  'service_contacts'
];

export const ProfileForm = () => {
  const { profile, roleLabel, updateOwnProfile, updatePassword } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({});
  const [pending, setPending] = useState(false);

  // Jelszó módosítás állapota
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordPending, setPasswordPending] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const next = {};
    EDITABLE.forEach((key) => {
      next[key] = profile[key] ?? '';
    });
    setForm(next);
  }, [profile]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    try {
      await updateOwnProfile(form);
      toast.success('Az adataidat elmentettük.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error('Az új jelszónak legalább 8 karakterből kell állnia.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('A két megadott jelszó nem egyezik.');
      return;
    }

    setPasswordPending(true);
    try {
      await updatePassword(newPassword);
      toast.success('A jelszavadat sikeresen megváltoztattad!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPasswordPending(false);
    }
  };

  if (!profile) return <Spinner label="Adatlap betöltése…" />;

  return (
    <div className="max-w-3xl space-y-8">
      {/* 1. Adatlap Szerkesztése */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nem szerkeszthető, tájékoztató blokk */}
        <div className="surface p-4">
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-500">Belépési e-mail</dt>
              <dd className="mt-0.5 break-words text-sm text-ink-900">{profile.account_email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-500">Tagsági kategória</dt>
              <dd className="mt-0.5 text-sm text-ink-900">{profile.member_category || 'Még nincs beállítva'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-500">Szerepkör</dt>
              <dd className="mt-0.5 text-sm text-ink-900">{roleLabel || 'Elbírálás alatt'}</dd>
            </div>
          </dl>
          {profile.custom_title && (
            <p className="mt-3 border-t border-sand-300 pt-3 text-sm text-ink-600">
              Tisztség: <strong className="text-ink-900">{profile.custom_title}</strong>
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Teljes név" value={form.full_name || ''} onChange={set('full_name')} autoComplete="name" />
          <TextInput label="Telefonszám" value={form.phone || ''} onChange={set('phone')} autoComplete="tel" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Privát e-mail"
            type="email"
            value={form.private_email || ''}
            onChange={set('private_email')}
            hint="Nem kötelező. Nem ezzel lépsz be."
          />
          <TextInput
            label="Lakcím"
            value={form.home_address || ''}
            onChange={set('home_address')}
            autoComplete="street-address"
          />
        </div>

        <fieldset className="space-y-4 rounded-xl border border-sand-400 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-wine-600">
            A szolgáltatás adatai
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Tevékenység"
              value={form.business_activity || ''}
              onChange={set('business_activity')}
              options={ACTIVITY_OPTIONS}
              placeholder="Nincs megadva"
            />
            <TextInput
              label="Szolgáltatás neve"
              value={form.service_location_name || ''}
              onChange={set('service_location_name')}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <TextInput label="Utca" value={form.service_street || ''} onChange={set('service_street')} />
            </div>
            <TextInput
              label="Házszám"
              value={form.service_house_number || ''}
              onChange={set('service_house_number')}
            />
          </div>

          <TextInput
            label="Nyilvános elérhetőség"
            value={form.service_contacts || ''}
            onChange={set('service_contacts')}
            hint="Telefonszám, weboldal vagy nyitvatartás, amit vállalsz nyilvánosan."
          />
        </fieldset>

        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? (
            <Spinner label="Mentés…" className="text-white" />
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Adatok mentése
            </>
          )}
        </button>
      </form>

      {/* 2. Jelszó Módosítása (Supabase Auth) */}
      <form onSubmit={handlePasswordChange} className="card p-6 sm:p-7 bg-sand-50/90 border border-sand-300 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-sand-300 pb-3">
          <Key className="h-5 w-5 text-wine-700" />
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900">Jelszó Módosítása</h3>
            <p className="text-xs text-ink-500">Itt cserélheted le az ideiglenes jelszavadat saját egyedi jelszóra.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label text-xs font-bold text-ink-800">Új Jelszó *</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Legalább 8 karakter..."
              className="input py-2.5 px-3.5 text-sm rounded-xl"
            />
          </div>

          <div>
            <label className="label text-xs font-bold text-ink-800">Új Jelszó Megerősítése *</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Jelszó ismét..."
              className="input py-2.5 px-3.5 text-sm rounded-xl"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={passwordPending} className="btn-secondary btn-sm font-bold flex items-center gap-2">
            <Lock className="h-4 w-4 text-wine-700" />
            {passwordPending ? 'Jelszó frissítése...' : 'Új Jelszó Beállítása'}
          </button>
        </div>
      </form>
    </div>
  );
};
