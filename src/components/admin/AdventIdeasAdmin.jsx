import React, { useState, useMemo } from 'react';
import {
  Sparkles, Search, Phone, Mail, User, Calendar,
  Download, Trash2, HeartHandshake, Eye, Copy, Check
} from 'lucide-react';

import { listAllAdventIdeasForAdmin, updateAdventIdeaStatus, deleteAdventIdea } from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useToast } from '../../context/ToastContext';
import { Spinner, EmptyState, ConfirmDialog, Modal } from '../ui';
import { formatDateShort } from '../../lib/format';

const STATUS_CONFIG = {
  uj: { label: 'Új ötlet', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300' },
  egyeztetes: { label: 'Egyeztetés alatt', badgeClass: 'bg-blue-100 text-blue-900 border-blue-300' },
  elfogadva: { label: 'Betervezve / Elfogadva', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  archiv: { label: 'Archivált / Nem megvalósítható', badgeClass: 'bg-sand-200 text-ink-600 border-sand-300' }
};

export const AdventIdeasAdmin = () => {
  const toast = useToast();
  const { data: rawIdeas, loading, error, reload } = useAsyncData(listAllAdventIdeasForAdmin, [], { initialData: [] });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWeekend, setSelectedWeekend] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [readingIdea, setReadingIdea] = useState(null);
  const [copied, setCopied] = useState(false);

  // Szűrés
  const filteredIdeas = useMemo(() => {
    let list = rawIdeas || [];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((item) =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.submitter_name || '').toLowerCase().includes(q) ||
        (item.submitter_email || '').toLowerCase().includes(q) ||
        (item.contact_name || '').toLowerCase().includes(q) ||
        (item.price_or_cost || '').toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (selectedWeekend !== 'all') {
      list = list.filter((item) => item.target_weekend === selectedWeekend);
    }

    if (selectedStatus !== 'all') {
      list = list.filter((item) => (item.status || 'uj') === selectedStatus);
    }

    return list;
  }, [rawIdeas, search, selectedCategory, selectedWeekend, selectedStatus]);

  // Statisztikák
  const stats = useMemo(() => {
    const total = (rawIdeas || []).length;
    const ujCount = (rawIdeas || []).filter((i) => !i.status || i.status === 'uj').length;
    const sponsorCount = (rawIdeas || []).filter((i) => i.willing_to_sponsor).length;
    const acceptedCount = (rawIdeas || []).filter((i) => i.status === 'elfogadva').length;
    return { total, ujCount, sponsorCount, acceptedCount };
  }, [rawIdeas]);

  // Státusz váltás
  const handleStatusChange = async (id, newStatus) => {
    setStatusUpdatingId(id);
    try {
      await updateAdventIdeaStatus(id, newStatus);
      toast.success('Státusz sikeresen frissítve.');
      await reload();
    } catch (err) {
      toast.error(`Hiba a státusz mentésekor: ${err.message}`);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Törlés
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteAdventIdea(deleteConfirmId);
      toast.success('Ötlet sikeresen törölve.');
      setDeleteConfirmId(null);
      await reload();
    } catch (err) {
      toast.error(`Hiba a törléskor: ${err.message}`);
    }
  };

  // CSV Exportálás Excelhez
  const handleExportCsv = () => {
    if (!rawIdeas || rawIdeas.length === 0) {
      toast.error('Nincs exportálható adat.');
      return;
    }

    const headers = [
      'Beküldés ideje',
      'Beküldő neve',
      'Beküldő e-mailje',
      'Beküldő telefonja',
      'Ötlet címe',
      'Kategória',
      'Célhétvége',
      'Leírás / Információ',
      'Kontakt személy neve',
      'Kontakt telefon',
      'Kontakt e-mail',
      'Ár / Költség',
      'Támogatási hajlandóság',
      'Státusz'
    ];

    const rows = rawIdeas.map((i) => [
      i.created_at ? new Date(i.created_at).toLocaleString('hu-HU') : '',
      `"${(i.submitter_name || '').replace(/"/g, '""')}"`,
      `"${(i.submitter_email || '').replace(/"/g, '""')}"`,
      `"${(i.submitter_phone || '').replace(/"/g, '""')}"`,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      `"${(i.category || '').replace(/"/g, '""')}"`,
      `"${(i.target_weekend || '').replace(/"/g, '""')}"`,
      `"${(i.description || '').replace(/"/g, '""')}"`,
      `"${(i.contact_name || '').replace(/"/g, '""')}"`,
      `"${(i.contact_phone || '').replace(/"/g, '""')}"`,
      `"${(i.contact_email || '').replace(/"/g, '""')}"`,
      `"${(i.price_or_cost || '').replace(/"/g, '""')}"`,
      i.willing_to_sponsor ? 'Igen' : 'Nem',
      STATUS_CONFIG[i.status]?.label || i.status || 'Új'
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KTSZE_Adventi_Otletek_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV táblázat sikeresen letöltve!');
  };

  // Vágólapra másolás megosztáshoz
  const handleCopyIdea = (idea) => {
    if (!idea) return;
    const text = `🎄 KTSZE ADVENTI ÖTLET
Cím: ${idea.title}
Kategória: ${idea.category}
Időpont: ${idea.target_weekend || 'Nincs megadva'}
Beküldő: ${idea.submitter_name} (${idea.submitter_phone || 'Nincs tel.'}, ${idea.submitter_email})
Becsült költség / ár: ${idea.price_or_cost || 'Nincs megadva'}
Támogatást vállal: ${idea.willing_to_sponsor ? 'Igen' : 'Nem'}

Leírás:
${idea.description}

Külső kapcsolat / fellépő:
${idea.contact_name ? `${idea.contact_name} (${idea.contact_phone || ''}, ${idea.contact_email || ''})` : 'Nincs külön megadva'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Ötlet összefoglalója vágólapra másolva!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Fejléc és export */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-900 border border-gold-300">
            <Sparkles className="h-3.5 w-3.5 text-gold-700" />
            Advent 2026 Tagi Ötletbörze
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink-900">
            Beérkezett tagi programötletek és felajánlások
          </h2>
          <p className="mt-1 text-xs text-ink-600">
            A tagságnak kiküldött zárt űrlapon (belépőkód: <span className="font-mono font-bold text-wine-700">99118822</span>) beérkezett összes javaslat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!rawIdeas || rawIdeas.length === 0}
            className="btn-secondary btn-sm"
            title="Adatok letöltése Excel-kompatibilis CSV formátumban"
          >
            <Download className="h-4 w-4" />
            CSV Exportálás
          </button>
        </div>
      </div>

      {/* Statisztikai kártyák */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4 border-sand-300 bg-white">
          <span className="text-xs font-medium text-ink-500">Összes ötlet</span>
          <p className="font-display text-2xl font-bold text-ink-900 mt-1">{stats.total}</p>
        </div>
        <div className="card p-4 border-amber-300 bg-amber-50/50">
          <span className="text-xs font-semibold text-amber-800">Új / Elbírálásra vár</span>
          <p className="font-display text-2xl font-bold text-amber-900 mt-1">{stats.ujCount}</p>
        </div>
        <div className="card p-4 border-emerald-300 bg-emerald-50/50">
          <span className="text-xs font-semibold text-emerald-800">Elfogadva / Betervezve</span>
          <p className="font-display text-2xl font-bold text-emerald-900 mt-1">{stats.acceptedCount}</p>
        </div>
        <div className="card p-4 border-wine-300 bg-wine-50/50">
          <span className="text-xs font-semibold text-wine-800">Támogatást is vállal</span>
          <p className="font-display text-2xl font-bold text-wine-900 mt-1">{stats.sponsorCount}</p>
        </div>
      </div>

      {/* Szűrősáv */}
      <div className="card p-4 border-sand-300 bg-white space-y-3">
        <div className="grid gap-3 sm:grid-cols-5">
          {/* Kereső */}
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Keresés név, e-mail, cím, fellépő vagy leírás szerint…"
              className="input pl-9 text-xs"
            />
          </div>

          {/* Hétvége szűrő */}
          <select
            value={selectedWeekend}
            onChange={(e) => setSelectedWeekend(e.target.value)}
            className="input text-xs"
          >
            <option value="all">Minden hétvége</option>
            <option value="December 12–13.">December 12–13.</option>
            <option value="December 19–20.">December 19–20.</option>
            <option value="Mindkét hétvége">Mindkét hétvége</option>
            <option value="Egyéb nap">Egyéb nap</option>
          </select>

          {/* Kategória szűrő */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input text-xs"
          >
            <option value="all">Minden kategória</option>
            <option value="Kultúra / Fellépő">Kultúra / Fellépő</option>
            <option value="Gasztronómia / Faház">Gasztronómia / Faház</option>
            <option value="Jótékonysági ételosztás">Jótékonysági ételosztás</option>
            <option value="Kézműves vásár">Kézműves vásár</option>
            <option value="Kapcsolat / Partner">Kapcsolat / Partner</option>
            <option value="Egyéb javaslat">Egyéb javaslat</option>
          </select>

          {/* Státusz szűrő */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input text-xs"
          >
            <option value="all">Minden státusz</option>
            <option value="uj">Új ötletek</option>
            <option value="egyeztetes">Egyeztetés alatt</option>
            <option value="elfogadva">Elfogadva / Betervezve</option>
            <option value="archiv">Archivált</option>
          </select>
        </div>
      </div>


      {/* Tartalom / Eredmények */}
      {loading && (
        <div className="py-16 text-center">
          <Spinner />
          <p className="mt-2 text-xs text-ink-500">Ötletek betöltése az adatbázisból…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800">
          <p className="font-bold">Hiba történt az ötletek lekérésekor:</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-[11px] text-ink-600">
            (Ha az adatbázis tábla még nem létezik, futtasd le a <span className="font-mono font-bold">supabase/23_advent_ideas_table.sql</span> fájlt a Supabase SQL editorban!)
          </p>
        </div>
      )}

      {!loading && !error && filteredIdeas.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Nincs megjeleníthető ötlet"
          description={
            rawIdeas.length === 0
              ? 'Még nem érkezett be adventi programötlet. Amint a tagok beküldenek javaslatokat a /advent-otletborze felületen, itt fognak megjelenni.'
              : 'A megadott szűrési feltételeknek egyetlen ötlet sem felel meg.'
          }
        />
      )}

      {/* Ötlet kártyák listája */}
      {!loading && !error && filteredIdeas.length > 0 && (
        <div className="space-y-4">
          {filteredIdeas.map((item) => {
            const statusInfo = STATUS_CONFIG[item.status || 'uj'] || STATUS_CONFIG.uj;

            return (
              <article
                key={item.id}
                className="card p-5 sm:p-6 border-sand-300 bg-white hover:border-gold-300 transition-colors shadow-sm space-y-4"
              >
                {/* Fejléc sor: Cím, Kategória, Hétvége, Olvasó gomb, Státusz váltó és Törlés */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                      <span className="rounded-full bg-sand-100 text-ink-700 text-xs px-2.5 py-0.5 font-medium">
                        {item.category}
                      </span>
                      {item.target_weekend && (
                        <span className="text-xs font-semibold text-wine-800 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.target_weekend}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-ink-900 pt-1">
                      {item.title}
                    </h3>
                  </div>

                  {/* Akciógombok */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setReadingIdea(item)}
                      className="btn-secondary btn-sm py-1.5 px-3 text-xs flex items-center gap-1.5 font-semibold text-wine-800 border-wine-300 hover:bg-wine-50"
                      title="Összes adat megnyitása olvasó nézetben"
                    >
                      <Eye className="h-3.5 w-3.5 text-wine-600" />
                      Részletes olvasás
                    </button>

                    <select
                      value={item.status || 'uj'}
                      disabled={statusUpdatingId === item.id}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="input py-1 px-2.5 text-xs font-semibold bg-sand-50"
                      title="Státusz módosítása"
                    >
                      <option value="uj">Új ötlet</option>
                      <option value="egyeztetes">Egyeztetés alatt</option>
                      <option value="elfogadva">Elfogadva / Betervezve</option>
                      <option value="archiv">Archivált</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="btn-ghost p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Ötlet törlése"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Beküldő adatai (Kiemelt sáv) */}
                <div className="rounded-xl border border-sand-200 bg-sand-50/70 p-3 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="font-bold text-ink-900 flex items-center gap-1.5">
                      <User className="h-4 w-4 text-wine-700" />
                      {item.submitter_name}
                    </span>

                    {item.submitter_email && (
                      <a
                        href={`mailto:${item.submitter_email}?subject=KTSZE Advent: ${encodeURIComponent(item.title)}`}
                        className="text-wine-800 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Mail className="h-3.5 w-3.5 text-wine-600" />
                        {item.submitter_email}
                      </a>
                    )}

                    {item.submitter_phone && (
                      <a
                        href={`tel:${item.submitter_phone}`}
                        className="text-wine-800 hover:underline flex items-center gap-1 font-medium font-mono"
                      >
                        <Phone className="h-3.5 w-3.5 text-wine-600" />
                        {item.submitter_phone}
                      </a>
                    )}
                  </div>

                  <span className="text-[11px] text-ink-500">
                    Beküldve: {item.created_at ? formatDateShort(item.created_at) : 'Nemrég'}
                  </span>
                </div>

                {/* Leírás */}
                <div className="text-xs sm:text-sm text-ink-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-sand-200">
                  {item.description}
                </div>

                {/* Esetleges külső kontakt személy & Ár / Támogatás doboz */}
                <div className="grid gap-3 sm:grid-cols-2 text-xs pt-1">
                  {/* Kontakt adatok */}
                  <div className="rounded-lg border border-sand-200 p-3 bg-sand-50/40">
                    <span className="font-bold text-ink-700 block mb-1">
                      Kapcsolattartó / Fellépő elérhetősége:
                    </span>
                    {item.contact_name || item.contact_phone || item.contact_email ? (
                      <div className="space-y-1 text-ink-800">
                        {item.contact_name && <p><span className="text-ink-500">Név:</span> {item.contact_name}</p>}
                        {item.contact_phone && (
                          <p>
                            <span className="text-ink-500">Telefon:</span>{' '}
                            <a href={`tel:${item.contact_phone}`} className="text-wine-700 hover:underline font-mono">
                              {item.contact_phone}
                            </a>
                          </p>
                        )}
                        {item.contact_email && (
                          <p>
                            <span className="text-ink-500">E-mail:</span>{' '}
                            <a href={`mailto:${item.contact_email}`} className="text-wine-700 hover:underline">
                              {item.contact_email}
                            </a>
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-ink-400 italic">Nincs külön megadva (a beküldő a kapcsolattartó).</p>
                    )}
                  </div>

                  {/* Költség & Támogatás */}
                  <div className="rounded-lg border border-sand-200 p-3 bg-sand-50/40 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-ink-700 block mb-1">
                        Becsült költség / Tiszteletdíj / Ár:
                      </span>
                      {item.price_or_cost ? (
                        <p className="text-sm font-bold text-gold-900 bg-gold-50 border border-gold-200 rounded px-2 py-1 inline-block">
                          {item.price_or_cost}
                        </p>
                      ) : (
                        <p className="text-ink-400 italic">Nincs feltüntetve.</p>
                      )}
                    </div>

                    {item.willing_to_sponsor && (
                      <div className="mt-2 flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 rounded p-1.5 text-[11px]">
                        <HeartHandshake className="h-4 w-4 text-emerald-600 shrink-0" />
                        A beküldő szívesen segíti a megvalósítást önkéntes munkával vagy támogatással!
                      </div>
                    )}
                  </div>
                </div>

              </article>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* RÉSZLETES OLVASÓ MODAL (Fókuszált elnökségi betekintő) */}
      {/* -------------------------------------------------------------------- */}
      {readingIdea && (
        <Modal
          open={Boolean(readingIdea)}
          onClose={() => setReadingIdea(null)}
          title={readingIdea.title}
          description={`Beküldő: ${readingIdea.submitter_name} • ${readingIdea.created_at ? formatDateShort(readingIdea.created_at) : 'Nemrég'}`}
          size="lg"
          footer={
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={() => handleCopyIdea(readingIdea)}
                className="btn-secondary btn-sm flex items-center gap-1.5"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Másolva!' : 'Adatok másolása vágólapra'}
              </button>

              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => setReadingIdea(null)}
              >
                Bezárás
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-ink-900">

            {/* Fejléc címkék és státusz állító */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-sand-100 rounded-xl border border-sand-300">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${STATUS_CONFIG[readingIdea.status || 'uj']?.badgeClass}`}>
                  {STATUS_CONFIG[readingIdea.status || 'uj']?.label}
                </span>
                <span className="rounded-full bg-white text-ink-800 text-xs px-3 py-1 font-semibold border border-sand-300">
                  {readingIdea.category}
                </span>
                <span className="text-xs font-bold text-wine-900 bg-white border border-sand-300 rounded-full px-3 py-1">
                  📅 {readingIdea.target_weekend || 'Mindkét hétvége'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink-600">Státusz:</span>
                <select
                  value={readingIdea.status || 'uj'}
                  onChange={async (e) => {
                    const newSt = e.target.value;
                    await handleStatusChange(readingIdea.id, newSt);
                    setReadingIdea((prev) => ({ ...prev, status: newSt }));
                  }}
                  className="input py-1 px-2 text-xs font-bold"
                >
                  <option value="uj">Új ötlet</option>
                  <option value="egyeztetes">Egyeztetés alatt</option>
                  <option value="elfogadva">Elfogadva / Betervezve</option>
                  <option value="archiv">Archivált</option>
                </select>
              </div>
            </div>

            {/* Beküldő doboz */}
            <div className="rounded-xl border border-sand-300 bg-sand-50/80 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-wine-800">Beküldő személy és elérhetőségek</h4>
              <div className="grid gap-2 sm:grid-cols-3 text-sm">
                <div>
                  <span className="text-xs text-ink-500 block">Név / Cég:</span>
                  <span className="font-bold text-ink-900">{readingIdea.submitter_name}</span>
                </div>
                <div>
                  <span className="text-xs text-ink-500 block">E-mail cím:</span>
                  <a href={`mailto:${readingIdea.submitter_email}`} className="font-semibold text-wine-700 hover:underline">
                    {readingIdea.submitter_email}
                  </a>
                </div>
                <div>
                  <span className="text-xs text-ink-500 block">Telefonszám:</span>
                  {readingIdea.submitter_phone ? (
                    <a href={`tel:${readingIdea.submitter_phone}`} className="font-mono font-bold text-wine-700 hover:underline">
                      {readingIdea.submitter_phone}
                    </a>
                  ) : (
                    <span className="text-ink-400 italic">Nincs megadva</span>
                  )}
                </div>
              </div>
            </div>

            {/* Részletes leírás */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700">Részletes leírás & információ</h4>
              <div className="rounded-xl border border-sand-300 bg-white p-4 text-sm leading-relaxed text-ink-800 whitespace-pre-wrap max-h-72 overflow-y-auto">
                {readingIdea.description}
              </div>
            </div>

            {/* Költség és Külső fellépő/kontakt */}
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-sand-300 bg-sand-50/50 p-3.5 space-y-1">
                <span className="font-bold text-ink-700 block">Fellépő / Külső kapcsolattartó:</span>
                {readingIdea.contact_name || readingIdea.contact_phone || readingIdea.contact_email ? (
                  <div className="space-y-1 text-ink-800 pt-1">
                    {readingIdea.contact_name && <p><span className="text-ink-500">Név:</span> <strong>{readingIdea.contact_name}</strong></p>}
                    {readingIdea.contact_phone && (
                      <p>
                        <span className="text-ink-500">Telefon:</span>{' '}
                        <a href={`tel:${readingIdea.contact_phone}`} className="font-mono font-bold text-wine-700 hover:underline">
                          {readingIdea.contact_phone}
                        </a>
                      </p>
                    )}
                    {readingIdea.contact_email && (
                      <p>
                        <span className="text-ink-500">E-mail:</span>{' '}
                        <a href={`mailto:${readingIdea.contact_email}`} className="font-semibold text-wine-700 hover:underline">
                          {readingIdea.contact_email}
                        </a>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-ink-400 italic pt-1">Nincs megadva külső kapcsolattartó.</p>
                )}
              </div>

              <div className="rounded-xl border border-sand-300 bg-sand-50/50 p-3.5 space-y-1 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-ink-700 block">Várható költség / Ár:</span>
                  <p className="font-display text-base font-bold text-gold-900 mt-1">
                    {readingIdea.price_or_cost || 'Nem lett megadva ár'}
                  </p>
                </div>

                {readingIdea.willing_to_sponsor && (
                  <div className="mt-2 text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[11px] flex items-center gap-1.5">
                    <HeartHandshake className="h-4 w-4 text-emerald-600 shrink-0" />
                    A beküldő szívesen segít a megvalósításban vagy támogatással is!
                  </div>
                )}
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* Törlés megerősítő modál */}
      <ConfirmDialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Ötlet törlése"
        description="Biztosan törölni szeretnéd ezt az adventi ötletet a nyilvántartásból? Ez a művelet nem vonható vissza."
        confirmLabel="Törlés"
        danger
      />

    </div>
  );
};

