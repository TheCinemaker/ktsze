import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles, Lock, KeyRound, CheckCircle2, Send,
  Calendar, Phone, Mail, User, Tag, Coins, HeartHandshake,
  Music, Utensils, Gift, Store, Users, ArrowRight, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { submitAdventIdea } from '../lib/db';
import { Spinner } from '../components/ui';

const VALID_ACCESS_CODE = '99118822';
const STORAGE_KEY = 'ktsze_advent_unlocked';

const CATEGORIES = [
  { id: 'Kultúra / Fellépő', label: 'Zenei / Kulturális program, fellépő', icon: Music },
  { id: 'Gasztronómia / Faház', label: 'Faház étel- és ital felajánlás', icon: Utensils },
  { id: 'Jótékonysági ételosztás', label: 'Jótékonysági ételosztás (Dec. 19–20.)', icon: HeartHandshake },
  { id: 'Kézműves vásár', label: 'Kézműves / Termelői kitelepülés', icon: Store },
  { id: 'Kapcsolat / Partner', label: 'Kapcsolat / Külső partner ajánlása', icon: Users },
  { id: 'Egyéb javaslat', label: 'Egyéb fejlesztési ötlet, javaslat', icon: Gift }
];

const WEEKENDS = [
  { id: 'December 12–13.', label: 'December 12–13.' },
  { id: 'December 19–20.', label: 'December 19–20.' },
  { id: 'Mindkét hétvége', label: 'Mindkét hétvége' },
  { id: 'Egyéb nap', label: 'Egyéb nap' }
];

export const AdventIdeaPage = () => {
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const toast = useToast();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  // Űrlap állapot
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    submitter_name: '',
    submitter_email: '',
    submitter_phone: '',
    title: '',
    category: 'Kultúra / Fellépő',
    target_weekend: 'December 12–13.',
    description: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    price_or_cost: '',
    willing_to_sponsor: false
  });

  // Automatikus kód-ellenőrzés URL paraméterből (?kod=99118822) vagy session tárolóból
  useEffect(() => {
    const urlCode = searchParams.get('kod') || searchParams.get('code');
    const storedCode = sessionStorage.getItem(STORAGE_KEY);

    if (urlCode === VALID_ACCESS_CODE || storedCode === VALID_ACCESS_CODE) {
      setIsUnlocked(true);
      sessionStorage.setItem(STORAGE_KEY, VALID_ACCESS_CODE);
    }
  }, [searchParams]);

  // Ha be van lépve a felhasználó, előre kitöltjük a nevét és e-mailjét
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        submitter_name: prev.submitter_name || profile.full_name || profile.service_location_name || '',
        submitter_email: prev.submitter_email || profile.account_email || profile.private_email || '',
        submitter_phone: prev.submitter_phone || profile.phone || profile.public_phone || ''
      }));
    }
  }, [profile]);

  // Kézi belépőkód ellenőrzés
  const handleUnlock = (e) => {
    e.preventDefault();
    const cleanCode = codeInput.trim();
    if (cleanCode === VALID_ACCESS_CODE) {
      setIsUnlocked(true);
      setCodeError('');
      sessionStorage.setItem(STORAGE_KEY, VALID_ACCESS_CODE);
      toast.success('Sikeres azonosítás! Üdvözlünk az Adventi Ötletbörzén!');
    } else {
      setCodeError('Érvénytelen belépőkód. Kérjük, ellenőrizd a tagi e-mailben kapott 8 számjegyű kódot!');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.submitter_name || !formData.submitter_email || !formData.title || !formData.description) {
      toast.error('Kérjük töltsd ki a kötelező mezőket (Név, E-mail, Cím, Leírás)!');
      return;
    }

    setSubmitting(true);
    try {
      await submitAdventIdea({
        ...formData,
        access_code: VALID_ACCESS_CODE
      });
      toast.success('Hálásan köszönjük az ötletedet! Sikeresen rögzítettük.');
      setSubmittedSuccess(true);
      setFormData((prev) => ({
        ...prev,
        title: '',
        description: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        price_or_cost: '',
        willing_to_sponsor: false
      }));
    } catch (err) {
      toast.error(`Nem sikerült rögzíteni az ötletet: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. ZÁRT BELÉPŐ KÉPERNYŐ (ha nincs még kód)
  // ---------------------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="min-h-[75vh] bg-sand-100 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gold-400/50 bg-white p-6 sm:p-8 shadow-xl">
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-wine-50 text-wine-700 ring-4 ring-wine-100/50">
                <Lock className="h-6 w-6 text-wine-600" />
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-gold-900">
                <Sparkles className="h-3 w-3 text-gold-600" />
                Zárt tagi felület
              </span>
              <h1 className="mt-2 font-display text-xl sm:text-2xl font-bold text-ink-900">
                KTSZE Adventi Ötletbörze
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed">
                Ez az oldal a Kőszegi Turisztikai Szövetség Egyesület tagjai számára érhető el az e-mailben kapott belépőkóddal.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="mt-6 space-y-4">
              <div>
                <label htmlFor="accessCode" className="block text-xs font-bold uppercase tracking-wider text-ink-700">
                  8 számjegyű belépőkód
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="accessCode"
                    type="password"
                    inputMode="numeric"
                    maxLength={12}
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="99118822"
                    className="input pl-10 text-center font-mono text-base tracking-widest text-ink-900"
                    autoFocus
                  />
                </div>
                {codeError && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {codeError}
                  </p>
                )}
              </div>

              <button type="submit" className="btn-primary w-full py-2.5 text-sm shadow-md">
                Belépés az Ötletbörzére
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-[11px] text-ink-500 text-center mt-3">
                Kérdés esetén keresd Szalay Beátát (+36 70 601 9096) vagy írj az{' '}
                <a href="mailto:info@ktsze.hu" className="text-wine-700 underline font-semibold">
                  info@ktsze.hu
                </a>{' '}
                címre.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. FELOLDOTT ÖTLETBÖRZE ÉS KÉRDŐÍV OLDAL (MOBIL-OPTIMALIZÁLT)
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-sand-50 py-6 sm:py-10">
      <div className="container-page max-w-4xl space-y-6">

        {/* Letisztult, mobilbarát fejléc és cél */}
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-wine-100 text-wine-900 px-3 py-0.5 text-xs font-bold border border-wine-200">
              <Sparkles className="h-3.5 w-3.5 text-wine-700" />
              Zárt Tagi Ötletbörze
            </span>
            <span className="text-xs font-bold text-gold-700">KTSZE Advent 2026</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 leading-tight">
            Tervezzük meg együtt Kőszeg adventi hétvégéit!
          </h1>

          <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
            Az Orsolya-napon a tagok és önkéntesek segítségével összegyűlt <strong>1 400 000 Ft</strong> adományból
            közösen valósítjuk meg az idei adventi programokat. Oszd meg velünk az ötleteidet, fellépőidet,
            kapcsolataidat vagy felajánlásodat!
          </p>

          {/* Dátumok és célok kompakt kártyákban */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="rounded-xl border border-gold-300 bg-gold-50/70 p-3 text-xs text-ink-800">
              <div className="font-bold text-wine-900 text-sm flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-wine-600 shrink-0" />
                December 12–13.
              </div>
              <p className="mt-1 text-ink-600 text-[12px] leading-snug">
                Kiemelt hétvége: Szulák Andrea koncert a Fő téren, kézműves- és termelői vásár, egyesületi adomány faház.
              </p>
            </div>

            <div className="rounded-xl border border-wine-200 bg-wine-50/60 p-3 text-xs text-ink-800">
              <div className="font-bold text-wine-900 text-sm flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-wine-600 shrink-0" />
                December 19–20.
              </div>
              <p className="mt-1 text-ink-600 text-[12px] leading-snug">
                Jótékonysági hétvége: közös ételosztás rászorulóknak, civil szervezetek és helyi iskolák karácsonyi vására.
              </p>
            </div>
          </div>
        </header>


        {/* Sikeres beküldési visszaigazolás */}
        {submittedSuccess && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900 shadow-sm">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold">Köszönjük a felajánlásodat és javaslatodat!</h3>
                <p className="text-sm text-emerald-800">
                  Az ötletedet elmentettük a rendszerbe, és a programszervező munkacsoport (Szalay Beáta vezetésével)
                  rövidesen áttekinti. Ha további ötleted vagy kapcsolatod van, nyugodtan küldhetsz be újabb űrlapot is!
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="mt-3 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
                >
                  Újabb ötlet beküldése
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fő tartalom: Űrlap és Kapcsolat */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Űrlap (2 oszlop) */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card p-4 sm:p-7 space-y-5 border border-sand-300 shadow-card">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-900">Ötlet vagy felajánlás beküldése</h2>
                <p className="mt-1 text-xs text-ink-500">
                  A csillaggal (<span className="text-rose-500">*</span>) jelölt mezők kitöltése kötelező.
                </p>
              </div>

              {/* 1. Beküldő adatai */}
              <div className="space-y-4 rounded-xl border border-sand-200 bg-sand-50/70 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-wine-800 flex items-center gap-1.5">
                  <User className="h-4 w-4" /> 1. Beküldő adatai
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label">
                      Neved / Vállalkozásod neve <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="submitter_name"
                      required
                      value={formData.submitter_name}
                      onChange={handleChange}
                      placeholder="Pl. Kovács Péter (Portré Étterem)"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">
                      E-mail címed <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="submitter_email"
                      required
                      value={formData.submitter_email}
                      onChange={handleChange}
                      placeholder="nev@pelda.hu"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Telefonszámod</label>
                    <input
                      type="tel"
                      name="submitter_phone"
                      value={formData.submitter_phone}
                      onChange={handleChange}
                      placeholder="+36 30 123 4567"
                      className="input"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Az ötlet kategóriája és időpontja */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-wine-600" /> Kategória <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-wine-600" /> Időpont / Hétvége
                  </label>
                  <select
                    name="target_weekend"
                    value={formData.target_weekend}
                    onChange={handleChange}
                    className="input text-sm"
                  >
                    {WEEKENDS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Ötlet címe és leírása */}
              <div className="space-y-3">
                <div>
                  <label className="label">
                    Ötlet / Javaslat címe <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Pl. Gyerek mézeskalács-díszítő műhely, forralt bor alapanyag felajánlás, stb."
                    className="input font-semibold"
                  />
                </div>

                <div>
                  <label className="label">
                    Részletes leírás, információ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Írd le az elképzelésedet: miről szólna a program, milyen alapanyagot vagy felajánlást tudsz biztosítani, milyen technikai igény van, hogyan képzeled el a megvalósítást…"
                    className="input leading-relaxed"
                  />
                </div>
              </div>

              {/* 4. Kapcsolat és költség / ár */}
              <div className="rounded-xl border border-sand-200 bg-sand-50/50 p-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-gold-600" /> 2. Költségek és esetleges fellépő / kontakt személy
                </h3>

                <div>
                  <label className="label">
                    Becsült költség / Fellépői tiszteletdíj / Ár
                  </label>
                  <input
                    type="text"
                    name="price_or_cost"
                    value={formData.price_or_cost}
                    onChange={handleChange}
                    placeholder="Pl. Ingyenes felajánlás / Önköltségi ár / Kb. 80.000 Ft"
                    className="input"
                  />
                  <p className="mt-1 text-[11px] text-ink-500">
                    Ha saját felajánlás, írd be: "Ingyenes felajánlás". Ha külső előadóról van szó, tüntesd fel a várható árat!
                  </p>
                </div>

                <div className="pt-2 border-t border-sand-200">
                  <p className="text-xs font-semibold text-ink-700 mb-2">
                    Külső fellépő vagy partner esetén az ő elérhetősége (ha van):
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <input
                        type="text"
                        name="contact_name"
                        value={formData.contact_name}
                        onChange={handleChange}
                        placeholder="Fellépő / Partner neve"
                        className="input text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        placeholder="Telefonszáma"
                        className="input text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        placeholder="E-mail címe"
                        className="input text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink-800">
                    <input
                      type="checkbox"
                      name="willing_to_sponsor"
                      checked={formData.willing_to_sponsor}
                      onChange={handleChange}
                      className="rounded border-sand-400 text-wine-600 focus:ring-wine-500 h-4 w-4"
                    />
                    <span>Szívesen segítek a megvalósításban személyesen vagy egyéb támogatással is</span>
                  </label>
                </div>
              </div>

              {/* Beküldés gomb */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-3 px-6 shadow-md text-sm font-semibold"
                >
                  {submitting ? (
                    <>
                      <Spinner className="h-4 w-4 text-white" />
                      Rögzítés folyamatban…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Ötlet beküldése
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Oldalsáv: Kapcsolattartó & Tájékoztató */}
          <div className="space-y-6">

            {/* Szalay Beáta kártya */}
            <div className="card p-6 border-gold-300/80 bg-gradient-to-b from-white to-gold-50/40 shadow-card">
              <span className="text-xs font-bold uppercase tracking-wider text-wine-700">
                Közvetlen egyeztetés
              </span>
              <h3 className="mt-1 font-display text-lg font-bold text-ink-900">
                Szalay Beáta
              </h3>
              <p className="text-xs text-ink-600">Adventi programkoordináció & kapcsolat</p>

              <div className="mt-4 space-y-2.5 text-xs text-ink-800">
                <a
                  href="tel:+36706019096"
                  className="flex items-center gap-2 rounded-lg p-2 bg-white border border-sand-300 font-semibold text-wine-800 hover:border-wine-400 transition-colors"
                >
                  <Phone className="h-4 w-4 text-wine-600 shrink-0" />
                  +36 70 601 9096
                </a>
                <a
                  href="mailto:b.szalay@ktsze.hu"
                  className="flex items-center gap-2 rounded-lg p-2 bg-white border border-sand-300 font-semibold text-wine-800 hover:border-wine-400 transition-colors"
                >
                  <Mail className="h-4 w-4 text-wine-600 shrink-0" />
                  b.szalay@ktsze.hu
                </a>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-ink-500">
                Bármilyen kérdésed, egyedi javaslatod vagy kitelepülési szándékod van, Beátát közvetlenül is elérheted a fenti számokon!
              </p>
            </div>

            {/* Hogyan használjuk a forrást? */}
            <div className="card p-6 border-sand-300 bg-white">
              <h4 className="font-display text-base font-bold text-ink-900">
                Hogyan dönt az elnökség?
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-ink-600 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-gold-600 font-bold">•</span>
                  Minden beküldött ötletet a programszervező munkacsoport összegez.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-gold-600 font-bold">•</span>
                  Elsőbbséget élveznek azok a kezdeményezések, amelyek minél több kőszegi szolgáltatót fognak össze.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-gold-600 font-bold">•</span>
                  A végleges programtervet e-mailben és a weboldalon is megosztjuk Veletek!
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* A beküldött ötletek NEM nyilvánosak — kizárólag az elnökség látja és dolgozza fel őket. */}
        <section className="pt-6 border-t border-sand-300">
          <div className="card bg-sand-50/70 border-sand-300 p-6 text-center">
            <p className="font-display text-base text-ink-900">Köszönjük a javaslatokat! 🎄</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-ink-600">
              A beküldött ötleteket kizárólag az egyesület elnöksége látja és dolgozza fel —
              nem jelennek meg nyilvánosan.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};
