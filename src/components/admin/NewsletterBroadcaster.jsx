import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Mail, Send, CheckCircle2, AlertTriangle, Users, Sparkles, Paperclip, FileText, Trash2, Link as LinkIcon, Download } from 'lucide-react';
import { listMembers, listWorkgroups, listAllWorkgroupMemberships, sendNewsletterViaResend } from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useToast } from '../../context/ToastContext';
import { Spinner, EmptyState } from '../ui';

const DRAFT_KEY = 'ktsze_newsletter_draft_v1';

export const NewsletterBroadcaster = () => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const membersData = useAsyncData(listMembers);
  const workgroupsData = useAsyncData(listWorkgroups);
  const membershipsData = useAsyncData(listAllWorkgroupMemberships);

  const [fromEmail, setFromEmail] = useState('Kőszegi Turisztikai Szövetség <info@ktsze.hu>');
  const [audienceFilter, setAudienceFilter] = useState('all'); // 'all', 'rendes', 'partolo', 'workgroup'
  const [selectedWorkgroupId, setSelectedWorkgroupId] = useState('');

  const [subject, setSubject] = useState('[KTSZE] Tájékoztató a Kőszegi Turisztikai Szövetség tagjainak');
  const [content, setContent] = useState(`Kedves {{NAME}}!\n\nEzúton tájékoztatunk a Kőszegi Turisztikai Szövetség Egyesület legfrissebb híreiről és aktuális feladatairól.\n\nÜdvözlettel,\nKőszegi Turisztikai Szövetség Egyesület Elnöksége`);

  // Csatolmányok tömbje (Base64 vagy előre gyártott PDF)
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [lastReport, setLastReport] = useState(null);
  const [draftSavedTime, setDraftSavedTime] = useState(null);

  // Vázlat betöltése indításkor
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.content) setContent(parsed.content);
        if (parsed.audienceFilter) setAudienceFilter(parsed.audienceFilter);
        if (parsed.fromEmail) setFromEmail(parsed.fromEmail);
      }
    } catch (err) {
      console.warn('[Draft] Vázlat betöltési hiba:', err);
    }
  }, []);

  // Vázlat automatikus mentése változáskor
  useEffect(() => {
    try {
      const draft = { subject, content, audienceFilter, fromEmail };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setDraftSavedTime(new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('[Draft] Vázlat mentési hiba:', err);
    }
  }, [subject, content, audienceFilter, fromEmail]);

  // Vázlat törlése
  const handleClearDraft = () => {
    if (!window.confirm('Biztosan törlöd a piszkozatot és visszaállítod az alapértelmezett sablont?')) return;
    localStorage.removeItem(DRAFT_KEY);
    setSubject('[KTSZE] Tájékoztató a Kőszegi Turisztikai Szövetség tagjainak');
    setContent(`Kedves {{NAME}}!\n\nEzúton tájékoztatunk a Kőszegi Turisztikai Szövetség Egyesület legfrissebb híreiről és aktuális feladatairól.\n\nÜdvözlettel,\nKőszegi Turisztikai Szövetség Egyesület Elnöksége`);
    setAttachments([]);
    toast.success('Piszkozat törölve, alapértelmezett szöveg visszaállítva.');
  };

  // Csatolmány hozzáadása géphez tartozó fájlból
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`A(z) ${file.name} fájl túl nagy (max. 10 MB).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Content = reader.result.split(',')[1];
        setAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            content: base64Content,
            sizeStr: `${(file.size / 1024).toFixed(0)} KB`
          }
        ]);
        toast.success(`Csatolva: ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Előre gyártott jelentkezési lapok csatolása (Base64 letöltéssel)
  const attachPresetPDF = async (type) => {
    const filename = type === 'termeszetes' 
      ? 'ktsze-tagfelveteli-kerelem-termeszetes-szemely.pdf' 
      : 'ktsze-tagfelveteli-kerelem-jogi-szemely.pdf';
    
    const label = type === 'termeszetes' ? 'Tagfelvételi kérelem (Magánszemély).pdf' : 'Tagfelvételi kérelem (Cég / Jogi személy).pdf';

    try {
      const res = await fetch(`/documents/${filename}`);
      if (!res.ok) throw new Error('A PDF fájl nem érhető el a szerveren.');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const base64Content = reader.result.split(',')[1];
        setAttachments((prev) => {
          if (prev.some((a) => a.filename === label)) return prev;
          return [
            ...prev,
            {
              filename: label,
              content: base64Content,
              sizeStr: `${(blob.size / 1024).toFixed(0)} KB`
            }
          ];
        });
        toast.success(`Sikeresen csatolva: ${label}`);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      toast.error(`Hiba a fájl csatolásakor: ${err.message}`);
    }
  };

  // Csatolmány törlése
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Jelentkezési lapok nyilvános linkjeinek beszúrása a levél szövegébe
  const insertLinksToContent = () => {
    const linkText = `\n\n📌 Letölthető Jelentkezési Lapok:\n- Természetes személyek részére: https://ktsze.hu/documents/ktsze-tagfelveteli-kerelem-termeszetes-szemely.pdf\n- Jogi személyek / Cégek részére: https://ktsze.hu/documents/ktsze-tagfelveteli-kerelem-jogi-szemely.pdf\n`;
    setContent((prev) => prev + linkText);
    toast.success('Jelentkezési lapok nyilvános linkjei beillesztve a levél szövegébe!');
  };

  // Minden tag kiválasztása a profiles táblából
  const targetRecipients = useMemo(() => {
    const members = membersData.data || [];
    let filtered = members;

    if (audienceFilter === 'rendes') {
      filtered = members.filter((m) => m.member_category === 'Rendes tag');
    } else if (audienceFilter === 'partolo') {
      filtered = members.filter((m) => m.member_category === 'Pártoló tag');
    } else if (audienceFilter === 'workgroup' && selectedWorkgroupId) {
      const activeMemberIds = (membershipsData.data || [])
        .filter((ms) => ms.workgroup_id === selectedWorkgroupId && ms.status === 'approved')
        .map((ms) => ms.profile_id);

      filtered = members.filter((m) => activeMemberIds.includes(m.id));
    }

    // Egyedi e-mail címek kiszűrése (mindig a profiles táblából)
    const recipientMap = new Map();
    filtered.forEach((m) => {
      const email = (m.private_email || m.account_email || '').trim();
      if (email && !recipientMap.has(email)) {
        recipientMap.set(email, {
          name: m.full_name || 'Egyesületi Tag',
          email: email
        });
      }
    });

    return Array.from(recipientMap.values());
  }, [membersData.data, membershipsData.data, audienceFilter, selectedWorkgroupId]);

  // Hírlevél kiküldése
  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (targetRecipients.length === 0) {
      toast.error('Nincs egyetlen elérhető e-mail cím sem a kiválasztott szűrő alapján.');
      return;
    }

    if (!window.confirm(`Biztosan kiküldöd a hírlevelet ${targetRecipients.length} tagunknak${attachments.length > 0 ? ` (${attachments.length} csatolmánnyal)` : ''}?`)) {
      return;
    }

    try {
      setSending(true);
      setLastReport(null);

      // HTML sablon formázása
      const htmlBody = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1e1b26; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e0d8; border-radius: 16px; background-color: #faf7f1;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #701a2e;">
            <h2 style="color: #701a2e; margin: 0; font-size: 20px;">Kőszegi Turisztikai Szövetség Egyesület</h2>
            <p style="font-size: 12px; color: #666; margin-top: 4px;">Hivatalos Egyesületi Tájékoztató & Hírlevél</p>
          </div>
          <div style="padding: 24px 0; font-size: 15px; white-space: pre-line; color: #2d2838;">
            ${content}
          </div>
          <div style="border-top: 1px solid #e5e0d8; pt: 16px; text-align: center; font-size: 11px; color: #888;">
            <p>© ${new Date().getFullYear()} Kőszegi Turisztikai Szövetség Egyesület | <a href="https://ktsze.hu" style="color: #701a2e; text-decoration: underline;">ktsze.hu</a></p>
          </div>
        </div>
      `;

      const result = await sendNewsletterViaResend({
        fromEmail,
        recipients: targetRecipients,
        subject,
        htmlContent: htmlBody,
        attachments: attachments.map((a) => ({ filename: a.filename, content: a.content }))
      });

      setLastReport(result);
      if (result.success > 0) {
        toast.success(`Hírlevél sikeresen kiküldve ${result.success} tagunknak!`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  if (membersData.loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <div className="card p-6 bg-white space-y-6 border border-sand-300 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-200 pb-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-ink-900 flex items-center gap-2.5">
              <Mail className="h-6 w-6 text-wine-600" />
              Egyesületi Hírlevél &amp; Köremail Küldése
            </h3>
            <p className="text-sm text-ink-600 mt-1">
              Küldj hivatalos tájékoztatót vagy fájlmellékleteket az egyesület tagjainak.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {draftSavedTime && (
              <span className="text-xs text-ink-500 bg-sand-100 px-3 py-1.5 rounded-lg border border-sand-300">
                💾 Vázlat mentve ({draftSavedTime})
              </span>
            )}
            <button
              type="button"
              onClick={handleClearDraft}
              className="btn-secondary btn-sm text-rose-700 hover:bg-rose-50"
              title="Vázlat törlése"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Piszkozat törlése
            </button>
            <span className="text-xs font-bold text-wine-800 bg-wine-50 px-3.5 py-2 rounded-xl border border-wine-200">
              👥 Címzettek: {targetRecipients.length} fő
            </span>
          </div>
        </div>

        {/* Hírlevél Küldő Form */}
        <form onSubmit={handleSendNewsletter} className="space-y-5">
          {/* Célcsoport & Feladó */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label text-xs font-bold text-ink-800">Célcsoport Szűrése</label>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="input py-2.5 px-3.5 text-sm rounded-xl font-medium"
              >
                <option value="all">Minden Tag a Profiles táblából ({membersData.data?.length || 0} fő)</option>
                <option value="rendes">Csak Rendes Tagok</option>
                <option value="partolo">Csak Pártoló Tagok</option>
                <option value="workgroup">Adott Munkacsoport Tagjai</option>
              </select>
            </div>

            {audienceFilter === 'workgroup' && (
              <div>
                <label className="label text-xs font-bold text-ink-800">Munkacsoport Kiválasztása</label>
                <select
                  value={selectedWorkgroupId}
                  onChange={(e) => setSelectedWorkgroupId(e.target.value)}
                  className="input py-2.5 px-3.5 text-sm rounded-xl font-medium"
                >
                  <option value="">-- Válassz csoportot --</option>
                  {(workgroupsData.data || []).map((wg) => (
                    <option key={wg.id} value={wg.id}>{wg.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label text-xs font-bold text-ink-800">Feladó Neve &amp; E-mail Címe</label>
              <input
                type="text"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="Kőszegi Turisztikai Szövetség <info@ktsze.hu>"
                className="input py-2.5 px-3.5 text-sm rounded-xl font-medium"
              />
            </div>

            <div className={audienceFilter === 'workgroup' ? 'lg:col-span-3' : 'sm:col-span-2 lg:col-span-1'}>
              <label className="label text-xs font-bold text-ink-800">Levél Tárgya (Subject) *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input py-2.5 px-3.5 text-sm rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Gyors Csatolás & Link Eszköztár */}
          <div className="p-3.5 bg-sand-100 rounded-2xl border border-sand-300 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-wine-900 flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-wine-600" />
                Mellékletek &amp; Dokumentum Csatolás
              </span>
              <span className="text-[11px] text-ink-500">Csatolhatsz Word, PDF vagy kép fájlokat a gépedről</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary btn-sm text-xs font-bold bg-white hover:bg-sand-200 border-sand-400"
              >
                <Paperclip className="h-3.5 w-3.5 text-wine-600" />
                Fájl csatolása gépemről
              </button>

              <button
                type="button"
                onClick={() => attachPresetPDF('termeszetes')}
                className="btn-secondary btn-sm text-xs font-semibold bg-white hover:bg-sand-200 border-sand-400"
              >
                📄 Jelentkezési Lap Csatolása (Magánszemély PDF)
              </button>

              <button
                type="button"
                onClick={() => attachPresetPDF('jogi')}
                className="btn-secondary btn-sm text-xs font-semibold bg-white hover:bg-sand-200 border-sand-400"
              >
                🏢 Jelentkezési Lap Csatolása (Cég / Jogi személy PDF)
              </button>

              <button
                type="button"
                onClick={insertLinksToContent}
                className="btn-secondary btn-sm text-xs font-semibold bg-white hover:bg-sand-200 border-sand-400 text-ink-800"
              >
                <LinkIcon className="h-3.5 w-3.5 text-wine-600" />
                Linkek beillesztése a levélbe
              </button>
            </div>

            {/* Csatolt fájlok listája */}
            {attachments.length > 0 && (
              <div className="pt-2 border-t border-sand-200 flex flex-wrap gap-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-wine-200 text-xs text-ink-900 shadow-2xs"
                  >
                    <FileText className="h-3.5 w-3.5 text-wine-600 shrink-0" />
                    <span className="font-semibold truncate max-w-[200px]">{att.filename}</span>
                    <span className="text-[10px] text-ink-500">({att.sizeStr})</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="ml-1 text-rose-600 hover:text-rose-800 font-bold p-0.5 rounded"
                      title="Melléklet eltávolítása"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tartalom Szerkesztő */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label text-xs font-bold text-ink-800">Hírlevél Üzenet Törzse *</label>
              <span className="text-[11px] text-ink-500 italic">Használható dinamikus változó: <strong>&#123;&#123;NAME&#123;&#123;</strong> (a tag neve)</span>
            </div>
            <textarea
              rows={10}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input py-3 px-4 text-sm rounded-xl font-medium leading-relaxed"
            />
          </div>

          {/* Kiküldés Gomb */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-sand-200">
            <span className="text-xs text-ink-600 font-medium">
              A kiküldés az egyesületi e-mail küldő rendszeren keresztül történik minden rögzített tag részére.
            </span>

            <button
              type="submit"
              disabled={sending || targetRecipients.length === 0}
              className="btn-primary btn-md rounded-xl font-bold flex items-center gap-2 shadow-sm px-7"
            >
              <Send className="h-4.5 w-4.5" />
              {sending ? 'Kiküldés folyamatban...' : `Hírlevél Kiküldése (${targetRecipients.length} fő)`}
            </button>
          </div>
        </form>

        {/* Kiküldési Riport */}
        {lastReport && (
          <div className="p-4 rounded-2xl bg-sand-100 border border-sand-300 space-y-2 text-xs">
            <h4 className="font-bold text-ink-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Kiküldési Eredmény:
            </h4>
            <p className="text-ink-700">
              Összesen: <strong>{lastReport.total}</strong> | Sikeres: <strong className="text-emerald-700">{lastReport.success}</strong> | Sikertelen: <strong className="text-rose-700">{lastReport.failed}</strong>
            </p>
            {lastReport.errors?.length > 0 && (
              <ul className="list-disc list-inside text-rose-700 space-y-1 pt-1">
                {lastReport.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
