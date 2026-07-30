import React, { useState, useMemo } from 'react';
import { Search, Users, Pencil, Wallet, Trash2, FileCheck2, Flower2 } from 'lucide-react';

import {
  listMembers,
  listDues,
  listWorkgroups,
  listAllWorkgroupMemberships,
  updateMemberProfile,
  setMemberRoles,
  upsertDues,
  deleteMemberProfile,
  getDuesProofUrl,
  registerMemberByAdmin
} from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLE_LABELS, assignableRoles } from '../../lib/permissions';
import {
  EmptyState,
  LoadingBlock,
  ErrorBlock,
  Modal,
  ConfirmDialog,
  TextInput,
  Select,
  Checkbox,
  Spinner
} from '../ui';
import { UserPlus, Key, Copy, Check, Send, CheckCircle2, Sparkles, Upload } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Tömeges Tag Regisztráció & Meghívó Modal                                  */
/* -------------------------------------------------------------------------- */

const parseMemberLines = (text) => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.map((line, idx) => {
    let name = '';
    let email = '';

    const angleMatch = line.match(/^(.*?)\s*<([^>]+)>$/);
    if (angleMatch) {
      name = angleMatch[1].trim();
      email = angleMatch[2].trim();
    } else if (line.includes(',') || line.includes(';')) {
      const parts = line.split(/[,;]/).map((p) => p.trim());
      const emailIdx = parts.findIndex((p) => p.includes('@'));
      if (emailIdx !== -1) {
        email = parts[emailIdx];
        name = parts.filter((_, i) => i !== emailIdx).join(' ');
      } else {
        name = parts[0] || '';
        email = parts[1] || '';
      }
    } else if (line.includes('\t')) {
      const parts = line.split('\t').map((p) => p.trim());
      const emailIdx = parts.findIndex((p) => p.includes('@'));
      if (emailIdx !== -1) {
        email = parts[emailIdx];
        name = parts.filter((_, i) => i !== emailIdx).join(' ');
      }
    } else if (line.includes('@')) {
      const parts = line.split(/\s+/);
      const emailPart = parts.find((p) => p.includes('@'));
      email = emailPart || line;
      name = parts.filter((p) => p !== emailPart).join(' ');
    } else {
      name = line;
    }

    name = name.replace(/^["']|["']$/g, '').trim();
    email = email.replace(/^["']|["']$/g, '').trim().toLowerCase();

    const isValid = Boolean(email && email.includes('@') && email.includes('.'));

    return {
      id: idx,
      raw: line,
      full_name: name || (email ? email.split('@')[0] : 'Tag'),
      account_email: email,
      isValid
    };
  });
};

const BulkRegisterModal = ({ open, onClose, onSaved }) => {
  const toast = useToast();
  const { data: existingMembersList } = useAsyncData(listMembers);
  const [rawText, setRawText] = useState('');
  const [memberCategory, setMemberCategory] = useState('Rendes tag');
  const [step, setStep] = useState('input');
  const [parsedList, setParsedList] = useState([]);
  const [filterMissingOnly, setFilterMissingOnly] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, activeName: '' });
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState(false);

  // Regisztrált e-mailek halmaza a Supabase adatbázisból
  const registeredEmailsSet = useMemo(() => {
    const set = new Set();
    (existingMembersList || []).forEach((m) => {
      if (m.account_email) set.add(m.account_email.toLowerCase());
      if (m.private_email) set.add(m.private_email.toLowerCase());
    });
    return set;
  }, [existingMembersList]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setRawText(val);
    setParsedList(parseMemberLines(val));
  };

  const validItems = parsedList.filter((item) => item.isValid);
  const invalidItems = parsedList.filter((item) => !item.isValid);

  // Hiányzó tagok (akik még NINCSENEK a Supabase profilok között)
  const missingItems = validItems.filter((item) => !registeredEmailsSet.has(item.account_email));
  const alreadyRegisteredCount = validItems.length - missingItems.length;

  const targetItemsToRegister = filterMissingOnly ? missingItems : validItems;

  const handleStartBulkRegister = async () => {
    if (targetItemsToRegister.length === 0) {
      toast.error('Nincs regisztrálandó tag a kijelölt listában!');
      return;
    }

    setStep('processing');
    setProgress({ current: 0, total: targetItemsToRegister.length, activeName: '' });
    const runResults = [];

    for (let i = 0; i < targetItemsToRegister.length; i++) {
      const item = targetItemsToRegister[i];
      setProgress({
        current: i + 1,
        total: targetItemsToRegister.length,
        activeName: `${item.full_name} (${item.account_email})`
      });

      const tempPassword = `Koszeg${Math.floor(1000 + Math.random() * 9000)}!`;
      try {
        const res = await registerMemberByAdmin({
          full_name: item.full_name,
          account_email: item.account_email,
          member_category: memberCategory,
          temp_password: tempPassword
        });

        runResults.push({
          name: item.full_name,
          email: item.account_email,
          tempPassword: res.tempPassword || tempPassword,
          emailSent: res.emailSent,
          success: true
        });
      } catch (err) {
        runResults.push({
          name: item.full_name,
          email: item.account_email,
          tempPassword,
          success: false,
          error: err.message
        });
      }

      // 800ms szünet a Supabase & Resend e-mail szerver Rate Limit megakadályozására
      await new Promise((r) => setTimeout(r, 800));
    }

    setResults(runResults);
    setStep('done');
    const successCount = runResults.filter((r) => r.success).length;
    toast.success(`Tömeges regisztráció kész! ${successCount}/${runResults.length} tag feldolgozva.`);
    await onSaved();
  };

  const handleCloseAll = () => {
    setRawText('');
    setParsedList([]);
    setResults([]);
    setStep('input');
    setFilterMissingOnly(false);
    onClose();
  };

  const handleCopySummary = () => {
    const lines = results.map(
      (r) => `${r.name}\t${r.email}\t${r.success ? 'SIKERES' : 'HIBA: ' + r.error}\t${r.tempPassword}`
    );
    const summaryText = `Név\tE-mail\tStátusz\tIdeiglenes Jelszó\n` + lines.join('\n');
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info('Összegző lista a vágólapra másolva!');
  };

  return (
    <Modal
      open={open}
      onClose={step === 'processing' ? () => {} : handleCloseAll}
      title="Tömeges Tag Regisztráció & Meghívás"
      description="Másold be a tagok e-mail címeit. A rendszer automatikusan összeveti az adatbázissal, és kiszűri a még hiányzó tagokat!"
    >
      {step === 'input' && (
        <div className="space-y-4">
          <div>
            <label className="label text-xs font-bold text-ink-800">
              E-mail címek (és nevek) beillesztése *
            </label>
            <p className="text-xs text-ink-500 mb-1.5">
              Soronként 1 cím. Elfogadott: <code>Kovács Péter, kovacs@gmail.com</code> vagy <code>Kovács Péter &lt;kovacs@gmail.com&gt;</code> vagy simán <code>kovacs@gmail.com</code>
            </p>
            <textarea
              rows={6}
              value={rawText}
              onChange={handleTextChange}
              placeholder="Kovács Péter, kovacs.peter@gmail.com&#10;Nagy Anna <nagy.anna@vallalkozas.hu>&#10;minta.elek@koszeg.hu"
              className="input text-xs font-mono p-3 w-full rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label text-xs font-bold text-ink-800">Tagsági kategória a teljes csoportnak</label>
              <select
                value={memberCategory}
                onChange={(e) => setMemberCategory(e.target.value)}
                className="input py-2 px-3 text-sm rounded-xl"
              >
                <option value="Rendes tag">Rendes tag</option>
                <option value="Pártoló tag">Pártoló tag</option>
                <option value="Elnökségi tag">Elnökségi tag</option>
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-xs text-ink-600 font-medium">
                Sikeres regisztráció után mindegyik tag automatikusan megkapja az <strong>egyedi belépési adatait</strong> e-mailben!
              </p>
            </div>
          </div>

          {parsedList.length > 0 && (
            <div className="rounded-xl border border-sand-400 bg-sand-50 p-3 space-y-3">
              {/* Adatbázis összehasonlító jelvények */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ {alreadyRegisteredCount} Már regisztrálva (Adatbázisban)
                  </span>
                  <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    🎯 {missingItems.length} Hiányzó tag (Még nincs fiókja)
                  </span>
                </div>

                {invalidItems.length > 0 && (
                  <span className="text-caution-700">{invalidItems.length} érvénytelen sorminta</span>
                )}
              </div>

              {/* Szűrő gombok */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMissingOnly(false)}
                  className={`btn-xs rounded-lg px-3 py-1 text-xs font-bold ${
                    !filterMissingOnly ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  Összes érvényes cím ({validItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMissingOnly(true)}
                  className={`btn-xs rounded-lg px-3 py-1 text-xs font-bold ${
                    filterMissingOnly ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  🎯 Csak a hiányzó tagok ({missingItems.length})
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1 text-xs font-mono">
                {targetItemsToRegister.map((item) => {
                  const isRegistered = registeredEmailsSet.has(item.account_email);
                  return (
                    <div
                      key={item.id}
                      className={`p-1.5 rounded-lg flex justify-between items-center ${
                        isRegistered
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-white border border-sand-300'
                      }`}
                    >
                      <span className="truncate max-w-[200px]">
                        <strong>{item.full_name}</strong>
                      </span>
                      <span className="text-ink-500 truncate max-w-[180px]">{item.account_email}</span>
                      <span className={isRegistered ? 'text-emerald-700 font-bold text-[11px]' : 'text-amber-700 font-bold text-[11px]'}>
                        {isRegistered ? '✓ Már Tag' : '🎯 Regisztrálandó'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-sand-200">
            <button type="button" onClick={handleCloseAll} className="btn-secondary btn-sm">
              Mégsem
            </button>
            <button
              type="button"
              onClick={handleStartBulkRegister}
              disabled={targetItemsToRegister.length === 0}
              className="btn-primary btn-sm font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Send className="h-4 w-4" />
              {targetItemsToRegister.length} Tag Regisztrálása &amp; Kiküldése
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="space-y-5 py-4 text-center">
          <Spinner className="mx-auto h-8 w-8 text-wine-700" />
          <div className="space-y-1">
            <h4 className="font-bold text-ink-900 text-base">Fiókok létrehozása és üdvözlő e-mailek küldése…</h4>
            <p className="text-xs text-ink-600 font-mono">{progress.activeName}</p>
          </div>

          <div className="w-full bg-sand-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-wine-700 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
            />
          </div>

          <p className="text-xs text-ink-500 font-bold">
            {progress.current} / {progress.total} kész ({Math.round((progress.current / progress.total) * 100)}%)
          </p>
        </div>
      )}

      {step === 'done' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            Tömeges feldolgozás befejeződött! Összesen {results.length} fiók feldolgozva.
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 text-xs font-mono">
            {results.map((r, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                  r.success ? 'bg-white border-emerald-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-bold text-ink-900 truncate">{r.name}</div>
                  <div className="text-ink-500 truncate">{r.email}</div>
                  {r.error && <div className="text-rose-700 font-semibold">{r.error}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  {r.success ? (
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {r.emailSent ? '📧 Email Kiküldve' : '✓ Regisztrálva'}
                      </span>
                      <div className="text-[11px] text-wine-800 font-bold mt-0.5">{r.tempPassword}</div>
                    </div>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded bg-rose-200 text-rose-800 font-bold text-[10px]">
                      Hiba
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-sand-200">
            <button
              type="button"
              onClick={handleCopySummary}
              className="btn-secondary btn-sm font-bold flex items-center gap-1.5 text-xs"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Kimásolva!' : 'Összegzés Másolása (Excel / TXT)'}
            </button>

            <button type="button" onClick={handleCloseAll} className="btn-primary btn-sm font-bold">
              Kész / Bezárás
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/*  Új Tag Kézi Regisztrálása (Elnökségi ideiglenes jelszóval)                  */
/* -------------------------------------------------------------------------- */

const RegisterMemberModal = ({ open, onClose, onSaved }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    full_name: '',
    account_email: '',
    private_email: '',
    phone: '',
    home_address: '',
    member_category: 'Rendes tag',
    service_location_name: '',
    temp_password: `Koszeg${Math.floor(1000 + Math.random() * 9000)}!`
  });
  const [pending, setPending] = useState(false);
  const [createdData, setCreatedData] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.account_email.trim()) return;

    setPending(true);
    try {
      const res = await registerMemberByAdmin(form);
      setCreatedData(res);
      toast.success('Tag sikeresen regisztrálva!');
      await onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdData) return;
    const text = `Tisztelt ${createdData.fullName}!\n\nElkészült a fiókod a Kőszegi Turisztikai Szövetség Egyesület tagi portálján:\n\nBelépési oldal: https://ktsze.netlify.app/belepes\nE-mail cím: ${createdData.email}\nIdeiglenes jelszó: ${createdData.tempPassword}\n\nKérjük, az első belépés után változtasd meg a jelszavadat!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info('Belépési adatok a vágólapra másolva!');
  };

  const handleCloseAll = () => {
    setCreatedData(null);
    setForm({
      full_name: '',
      account_email: '',
      private_email: '',
      phone: '',
      home_address: '',
      member_category: 'Rendes tag',
      service_location_name: '',
      temp_password: `Koszeg${Math.floor(1000 + Math.random() * 9000)}!`
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseAll}
      title="Új Tag Kézi Regisztrálása"
      description="Regisztráld az egyesület új tagját ideiglenes jelszóval."
    >
      {createdData ? (
        <div className="space-y-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-300">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
            <Check className="h-5 w-5 text-emerald-600" />
            Fiók Sikeresen Létrehozva!
          </div>

          <div className="space-y-2 text-xs font-mono bg-white p-3 rounded-xl border border-emerald-200">
            <div><strong>Név:</strong> {createdData.fullName}</div>
            <div><strong>E-mail:</strong> {createdData.email}</div>
            <div><strong>Ideiglenes jelszó:</strong> <span className="text-wine-800 font-bold">{createdData.tempPassword}</span></div>
          </div>

          <p className="text-xs text-emerald-800 font-semibold bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-200">
            📧 Az üdvözlő e-mailt a belépési adatokkal és az ideiglenes jelszóval automatikusan kiküldtük az új tag e-mail címére!
          </p>

          <p className="text-xs text-ink-600">
            Szükség esetén a lentebbi gombbal ki is másolhatod a belépési adatokat.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={handleCopyCredentials} className="btn-primary btn-sm font-bold flex items-center gap-1.5">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Másolva!' : 'Adatok Másolása'}
            </button>
            <button type="button" onClick={handleCloseAll} className="btn-secondary btn-sm">
              Bezárás
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label text-xs font-bold text-ink-800">Teljes Név *</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={set('full_name')}
                placeholder="pl. Kovács Péter"
                className="input py-2 px-3 text-sm rounded-xl"
              />
            </div>
            <div>
              <label className="label text-xs font-bold text-ink-800">Bejelentkezési E-mail *</label>
              <input
                type="email"
                required
                value={form.account_email}
                onChange={set('account_email')}
                placeholder="kovacs.peter@gmail.com"
                className="input py-2 px-3 text-sm rounded-xl"
              />
            </div>
            <div>
              <label className="label text-xs font-bold text-ink-800">Telefonszám</label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+36 70 123 4567"
                className="input py-2 px-3 text-sm rounded-xl"
              />
            </div>
            <div>
              <label className="label text-xs font-bold text-ink-800">Tagsági Kategória</label>
              <select
                value={form.member_category}
                onChange={set('member_category')}
                className="input py-2 px-3 text-sm rounded-xl"
              >
                <option value="Rendes tag">Rendes tag</option>
                <option value="Pártoló tag">Pártoló tag</option>
                <option value="Elnökségi tag">Elnökségi tag</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label text-xs font-bold text-ink-800">Szervezet / Cég / Szolgáltatás Megnevezése</label>
            <input
              type="text"
              value={form.service_location_name}
              onChange={set('service_location_name')}
              placeholder="pl. Kőszegi Vár Vendégház vagy Jurisics Pincészet"
              className="input py-2 px-3 text-sm rounded-xl"
            />
          </div>

          <div>
            <label className="label text-xs font-bold text-ink-800 flex items-center gap-1">
              <Key className="h-3.5 w-3.5 text-wine-600" /> Generált Ideiglenes Jelszó
            </label>
            <input
              type="text"
              required
              value={form.temp_password}
              onChange={set('temp_password')}
              className="input py-2 px-3 text-sm rounded-xl font-mono text-wine-800 font-bold bg-sand-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-sand-200">
            <button type="button" onClick={onClose} className="btn-secondary btn-sm" disabled={pending}>
              Mégsem
            </button>
            <button type="submit" className="btn-primary btn-sm font-bold px-5" disabled={pending}>
              {pending ? 'Regisztráció...' : 'Tag Regisztrálása'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

const CATEGORY_OPTIONS = [
  { value: 'Rendes tag', label: 'Rendes tag' },
  { value: 'Pártoló tag', label: 'Pártoló tag' },
  { value: 'Elnökségi tag', label: 'Elnökségi tag' }
];

const DUES_STATUS_OPTIONS = [
  { value: 'pending', label: 'Függőben' },
  { value: 'paid', label: 'Rendezve' },
  { value: 'overdue', label: 'Késedelmes' },
  { value: 'waived', label: 'Elengedve' }
];

const rolesOf = (member) => (Array.isArray(member.user_roles) ? member.user_roles.map((r) => r.role) : []);

/* -------------------------------------------------------------------------- */
/*  Adatlap és szerepkör szerkesztése                                          */
/* -------------------------------------------------------------------------- */

const EditMemberModal = ({ member, open, onClose, onSaved }) => {
  const { roles: actorRoles, profile: actor } = useAuth();
  const isSelf = actor?.id === member.id;
  const toast = useToast();

  const [form, setForm] = useState({
    full_name: member.full_name || '',
    phone: member.phone || '',
    member_category: member.member_category || '',
    custom_title: member.custom_title || '',
    service_location_name: member.service_location_name || ''
  });
  const [selectedRoles, setSelectedRoles] = useState(rolesOf(member));
  const [pending, setPending] = useState(false);

  const canManageRoles = actorRoles.some((r) => ['admin', 'president'].includes(r));
  const options = assignableRoles(actorRoles);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const toggleRole = (role) =>
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));

  const handleSave = async () => {
    setPending(true);
    try {
      await updateMemberProfile(member.id, form);
      if (canManageRoles) {
        await setMemberRoles(member.id, selectedRoles);
      }
      toast.success('A tag adatait elmentettük.');
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tag adatai"
      description={member.account_email}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Mégsem
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={pending}>
            {pending ? <Spinner label="Mentés…" className="text-white" /> : 'Mentés'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Teljes név" value={form.full_name} onChange={set('full_name')} />
          <TextInput label="Telefonszám" value={form.phone} onChange={set('phone')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tagsági kategória"
            value={form.member_category}
            onChange={set('member_category')}
            options={CATEGORY_OPTIONS}
            placeholder="Nincs beállítva"
          />
          <TextInput
            label="Szolgáltatás neve"
            value={form.service_location_name}
            onChange={set('service_location_name')}
          />
        </div>

        <TextInput
          label="Tisztség megnevezése"
          value={form.custom_title}
          onChange={set('custom_title')}
          hint="Például: Digitális Kőszeg alelnök. Ez csak kiírt megnevezés — jogosultságot a szerepkör ad."
        />

        {canManageRoles ? (
          <fieldset className="rounded-xl border border-sand-400 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-wine-600">
              Jogosultságok
            </legend>
            <div className="mt-1 space-y-2.5">
              {options.map((role) => (
                <Checkbox
                  key={role}
                  label={ROLE_LABELS[role]}
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
              ))}
            </div>
            {isSelf && (
              <p className="mt-3 rounded-lg border border-caution-300 bg-caution-50 p-2.5 text-xs text-ink-800">
                A saját adatlapodat szerkeszted. Az utolsó rendszergazdától az adatbázis nem engedi elvenni az
                admin jogot — így nem tudod véletlenül kizárni magadat.
              </p>
            )}

            <p className="mt-3 text-xs text-ink-500">
              A szerepkör dönti el, mit érhet el a felhasználó. Az adatbázis ugyanezt érvényesíti, tehát a kliens
              megkerülésével sem lát többet.
            </p>
          </fieldset>
        ) : (
          <p className="text-xs text-ink-500">
            A szerepkörök módosítása rendszergazdai vagy elnöki jogosultságot igényel.
          </p>
        )}
      </div>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/*  Tagdíj rögzítése                                                           */
/* -------------------------------------------------------------------------- */

const DuesModal = ({ member, dues, open, onClose, onSaved }) => {
  const toast = useToast();
  const currentYear = new Date().getFullYear();
  const existing = dues.find((d) => d.profile_id === member.id && d.year === currentYear);

  const [form, setForm] = useState({
    year: existing?.year || currentYear,
    amount_huf: existing?.amount_huf ?? '',
    status: existing?.status || 'pending',
    due_date: existing?.due_date || '',
    payment_method: existing?.payment_method || '',
    notes: existing?.notes || ''
  });
  const [pending, setPending] = useState(false);
  const [openingProof, setOpeningProof] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSave = async () => {
    setPending(true);
    try {
      await upsertDues(member.id, form.year, form);
      toast.success('A tagdíjat elmentettük.');
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  const openProof = async () => {
    setOpeningProof(true);
    try {
      const url = await getDuesProofUrl(existing.proof_path);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOpeningProof(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tagdíj rögzítése"
      description={member.full_name || member.account_email}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Mégsem
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={pending}>
            {pending ? <Spinner label="Mentés…" className="text-white" /> : 'Mentés'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {existing?.proof_path && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-positive-300 bg-positive-50 p-3">
            <p className="text-sm text-ink-800">A tag feltöltött egy átutalási igazolást.</p>
            <button type="button" onClick={openProof} disabled={openingProof} className="btn-secondary btn-sm">
              <FileCheck2 className="h-4 w-4 text-positive-600" aria-hidden="true" />
              Megnyitom
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput label="Év" type="number" value={form.year} onChange={set('year')} required />
          <TextInput
            label="Összeg (Ft)"
            type="number"
            min="0"
            value={form.amount_huf}
            onChange={set('amount_huf')}
            hint="Üresen hagyható."
          />
          <Select label="Állapot" value={form.status} onChange={set('status')} options={DUES_STATUS_OPTIONS} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Fizetési határidő" type="date" value={form.due_date || ''} onChange={set('due_date')} />
          <TextInput label="Fizetés módja" value={form.payment_method} onChange={set('payment_method')} />
        </div>

        <TextInput label="Megjegyzés" value={form.notes} onChange={set('notes')} />
      </div>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/*  Lista                                                                      */
/* -------------------------------------------------------------------------- */

export const MemberManagement = () => {
  const { can } = useAuth();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [duesFor, setDuesFor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const members = useAsyncData(listMembers);
  const dues = useAsyncData(() => listDues(), [], { enabled: can('dues.view'), initialData: [] });
  const groups = useAsyncData(listWorkgroups, [], { initialData: [] });
  const wgMemberships = useAsyncData(listAllWorkgroupMemberships, [], { initialData: [] });

  const list = useMemo(() => members.data || [], [members.data]);
  const duesList = dues.data || [];

  // Kinek melyik munkacsoportja van (csak a jovahagyott tagsagok).
  const groupsByProfile = useMemo(() => {
    const map = new Map();
    (wgMemberships.data || [])
      .filter((m) => m.status === 'approved' && m.workgroups)
      .forEach((m) => {
        const current = map.get(m.profile_id) || [];
        current.push(m.workgroups);
        map.set(m.profile_id, current);
      });
    return map;
  }, [wgMemberships.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((m) => {
      if (groupFilter === 'none') {
        if ((groupsByProfile.get(m.id) || []).length > 0) return false;
      } else if (groupFilter !== 'all') {
        const mine = groupsByProfile.get(m.id) || [];
        if (!mine.some((g) => g.id === groupFilter)) return false;
      }
      if (!q) return true;
      return [m.full_name, m.account_email, m.service_location_name, m.custom_title]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q));
    });
  }, [list, query, groupFilter, groupsByProfile]);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBulkRegisterModal, setShowBulkRegisterModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const duesOf = (memberId) => duesList.find((d) => d.profile_id === memberId && d.year === currentYear);

  const handleDelete = async () => {
    setDeletePending(true);
    try {
      await deleteMemberProfile(deleting.id);
      toast.success('A tag adatlapját töröltük.');
      await members.reload();
      setDeleting(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletePending(false);
    }
  };

  if (members.loading) return <LoadingBlock />;
  if (members.error) return <ErrorBlock message={members.error} onRetry={members.reload} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keresés név, e-mail vagy szolgáltatás szerint"
            aria-label="Keresés a tagok között"
            className="input pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowBulkRegisterModal(true)}
            className="btn-secondary btn-sm rounded-xl font-bold flex items-center gap-1.5 shadow-xs text-wine-800 border-wine-300 bg-wine-50/50 hover:bg-wine-100/50"
          >
            <Send className="h-4 w-4 text-wine-700" />
            + Tömeges Meghívás (E-mail lista)
          </button>

          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary btn-sm rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            + 1 Új Tag Regisztrálása
          </button>

          <label htmlFor="member-group-filter" className="text-sm text-ink-600">
            Munkacsoport:
          </label>
          <select
            id="member-group-filter"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="input w-auto py-1.5 text-sm"
          >
            <option value="all">Mindegyik</option>
            <option value="none">Nincs csoportja</option>
            {(groups.data || []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-wine-100 text-wine-800 border border-wine-200 px-3 py-1 text-xs font-bold">
              👥 Összesen: {list.length} tag
            </span>
            <p className="text-sm text-ink-500">
              ({filtered.length} megjelenítve)
            </p>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Még nincs egyetlen regisztrált tag sem"
          description="A tagok a nyilvános oldalon regisztrálnak. A regisztráció után itt tudod beállítani a kategóriájukat és a jogosultságukat."
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nincs találat" description="Próbálj más keresőszót." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-sand-400 bg-white">
          <table className="w-full min-w-[64rem] border-collapse text-sm">
            <caption className="sr-only">Tagnyilvántartás</caption>
            <thead className="bg-sand-50">
              <tr className="border-b border-sand-400 text-left">
                <th scope="col" className="w-12 px-3 py-3 text-center font-bold text-ink-500">
                  #
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                  Tag
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                  Kategória
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                  Jogosultság
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                  Munkacsoportok
                </th>
                {can('dues.view') && (
                  <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                    {currentYear}. tagdíj
                  </th>
                )}
                <th scope="col" className="px-4 py-3 text-right font-medium text-ink-600">
                  Műveletek
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member, index) => {
                const memberRoles = rolesOf(member);
                const memberDues = duesOf(member.id);

                return (
                  <tr key={member.id} className="border-b border-sand-300 last:border-0 hover:bg-sand-50/50">
                    <td className="px-3 py-3 text-center font-mono text-xs font-bold text-ink-500 bg-sand-50/30">
                      {index + 1}.
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-900">{member.full_name || '— nincs név —'}</div>
                      <div className="text-xs text-ink-500">{member.account_email}</div>
                      {member.custom_title && (
                        <div className="mt-0.5 text-xs text-wine-600">{member.custom_title}</div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-ink-600">{member.member_category || '—'}</td>

                    <td className="px-4 py-3">
                      {memberRoles.length === 0 ? (
                        <span className="badge-caution">Nincs szerepkör</span>
                      ) : (
                        <span className="flex flex-wrap gap-1">
                          {memberRoles.map((role) => (
                            <span key={role} className="badge-neutral">
                              {ROLE_LABELS[role] || role}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {(groupsByProfile.get(member.id) || []).length === 0 ? (
                        <span className="text-xs text-ink-400">—</span>
                      ) : (
                        <span className="flex flex-wrap gap-1">
                          {(groupsByProfile.get(member.id) || []).map((g) => (
                            <span key={g.id} className="badge-wine">
                              <Flower2 className="h-3 w-3" aria-hidden="true" />
                              {g.name}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>

                    {can('dues.view') && (
                      <td className="px-4 py-3">
                        {!memberDues ? (
                          <span className="text-xs text-ink-500">Nincs kiírva</span>
                        ) : memberDues.status === 'paid' ? (
                          <span className="badge-positive">Rendezve</span>
                        ) : (
                          <span className="badge-caution">
                            {DUES_STATUS_OPTIONS.find((o) => o.value === memberDues.status)?.label ||
                              memberDues.status}
                          </span>
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {can('members.edit') && (
                          <button
                            type="button"
                            onClick={() => setEditing(member)}
                            className="btn-secondary btn-sm"
                            aria-label={`${member.full_name || member.account_email} szerkesztése`}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Adatlap
                          </button>
                        )}

                        {can('dues.manage') && (
                          <button
                            type="button"
                            onClick={() => setDuesFor(member)}
                            className="btn-secondary btn-sm"
                            aria-label={`${member.full_name || member.account_email} tagdíja`}
                          >
                            <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                            Tagdíj
                          </button>
                        )}

                        {can('members.delete') && (
                          <button
                            type="button"
                            onClick={() => setDeleting(member)}
                            className="btn-danger btn-sm"
                            aria-label={`${member.full_name || member.account_email} törlése`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditMemberModal
          key={editing.id}
          member={editing}
          open
          onClose={() => setEditing(null)}
          onSaved={members.reload}
        />
      )}

      {duesFor && (
        <DuesModal
          key={duesFor.id}
          member={duesFor}
          dues={duesList}
          open
          onClose={() => setDuesFor(null)}
          onSaved={dues.reload}
        />
      )}

      <RegisterMemberModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSaved={members.reload}
      />

      <BulkRegisterModal
        open={showBulkRegisterModal}
        onClose={() => setShowBulkRegisterModal(false)}
        onSaved={members.reload}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        pending={deletePending}
        title="Adatlap törlése"
        message={`Biztosan törlöd ${
          deleting?.full_name || deleting?.account_email
        } adatlapját? A tagdíjai és a feltöltött igazolásai is törlődnek. A művelet nem vonható vissza.`}
      />
    </div>
  );
};
