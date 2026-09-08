import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mail, Send, CheckCircle2, ImagePlus, Link2, Eye, X } from 'lucide-react';
import { listMembers, listWorkgroups, listAllWorkgroupMemberships, sendNewsletterViaResend } from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../ui';

const parseEmails = (value) => value.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
const escapeHtml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export const NewsletterBroadcaster = () => {
  const toast = useToast();
  const membersData = useAsyncData(listMembers);
  const workgroupsData = useAsyncData(listWorkgroups);
  const membershipsData = useAsyncData(listAllWorkgroupMemberships);
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);

  const [fromEmail, setFromEmail] = useState('Kőszegi Turisztikai Szövetség <info@ktsze.hu>');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [selectedWorkgroupId, setSelectedWorkgroupId] = useState('');
  const [manualEmails, setManualEmails] = useState('');
  const [subject, setSubject] = useState('[KTSZE] Tájékoztató a Kőszegi Turisztikai Szövetség tagjainak');
  const [content, setContent] = useState('Kedves {{NAME}}!\n\nEzúton tájékoztatunk a Kőszegi Turisztikai Szövetség legfrissebb híreiről és aktuális feladatairól.\n\nÜdvözlettel,\nKőszegi Turisztikai Szövetség Egyesület Elnöksége');
  const [sending, setSending] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [lastReport, setLastReport] = useState(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.setAttribute('dir', 'ltr');
    editor.style.setProperty('direction', 'ltr', 'important');
    editor.style.setProperty('text-align', 'left', 'important');
    editor.style.setProperty('unicode-bidi', 'isolate', 'important');
    editor.style.setProperty('writing-mode', 'horizontal-tb', 'important');
  }, []);

  const targetRecipients = useMemo(() => {
    const members = membersData.data || [];
    let filtered = members;
    if (audienceFilter === 'rendes') filtered = members.filter((m) => m.member_category === 'Rendes tag');
    else if (audienceFilter === 'partolo') filtered = members.filter((m) => m.member_category === 'Pártoló tag');
    else if (audienceFilter === 'workgroup' && selectedWorkgroupId) {
      const ids = (membershipsData.data || []).filter((ms) => ms.workgroup_id === selectedWorkgroupId && ms.status === 'approved').map((ms) => ms.profile_id);
      filtered = members.filter((m) => ids.includes(m.id));
    }
    const map = new Map();
    filtered.forEach((m) => {
      const email = (m.private_email || m.account_email || '').trim().toLowerCase();
      if (email && !map.has(email)) map.set(email, { name: m.full_name || 'Egyesületi Tag', email });
    });
    parseEmails(manualEmails).forEach((email) => { if (!map.has(email)) map.set(email, { name: 'Címzett', email }); });
    return Array.from(map.values());
  }, [membersData.data, membershipsData.data, audienceFilter, selectedWorkgroupId, manualEmails]);

  const htmlBody = useMemo(() => {
    const safeContent = content
      .replace(/\n/g, '<br>')
      .replace(/{{NAME}}/g, '<span data-name-placeholder="true">{{NAME}}</span>')
      .replace(/\[\[IMAGE:(https?:\\/\\/[^\]]+)\]\]/g, '<p style="text-align:center;margin:20px 0;direction:ltr;"><img src="$1" alt="Flyer" style="display:block;max-width:100%;height:auto;margin:0 auto;border-radius:8px;" /></p>');
    return `<div style="font-family:Arial,sans-serif;line-height:1.6;direction:ltr;text-align:left;color:#1e1b26;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e0d8;border-radius:16px;background:#faf7f1;"><div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #701a2e;"><h2 style="color:#701a2e;margin:0;font-size:20px;">Kőszegi Turisztikai Szövetség Egyesület</h2><p style="font-size:12px;color:#666;margin-top:4px;">Hivatalos Egyesületi Tájékoztató &amp; Hírlevél</p></div><div style="padding:24px 0;font-size:15px;color:#2d2838;">${safeContent}</div><div style="border-top:1px solid #e5e0d8;padding-top:16px;text-align:center;font-size:11px;color:#888;"><p>© ${new Date().getFullYear()} Kőszegi Turisztikai Szövetség Egyesület | <a href="https://ktsze.hu" style="color:#701a2e;">ktsze.hu</a></p></div></div>`;
  }, [content]);

  const editorRef = useRef(null);
  const imageInputRef = useRef(null);

  const insertAtCursor = (text) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) {
      editor.appendChild(document.createTextNode(text));
      syncEditor();
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    syncEditor();
  };

  const wrapSelection = (before, after = before) => {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = before + selected + after;
    setContent(content.slice(0, start) + replacement + content.slice(end));
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const exec = (command) => {
    if (command === 'bold') return wrapSelection('<strong>', '</strong>');
    if (command === 'italic') return wrapSelection('<em>', '</em>');
    if (command === 'underline') return wrapSelection('<u>', '</u>');
    if (command === 'formatBlock') return wrapSelection('<h2>', '</h2>');
    if (command === 'insertUnorderedList') return wrapSelection('<ul><li>', '</li></ul>');
    if (command === 'createLink') return wrapSelection('<a href="' + command + '">', '</a>');
  };

  const insertImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Csak JPG, PNG vagy WebP kép tölthető fel.');
    if (file.size > 4 * 1024 * 1024) return toast.error('A kép legfeljebb 4 MB lehet.');
    try {
      toast.info('Kép feltöltése...');
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.onerror = () => reject(new Error('Nem sikerült beolvasni a képfájlt.'));
        reader.readAsDataURL(file);
      });
      const response = await fetch('/.netlify/functions/upload-newsletter-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, data: base64 })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'A kép feltöltése sikertelen.');
      const editor = editorRef.current;
      if (!editor) return;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const token = `[[IMAGE:${data.url}]]`;
      setContent(content.slice(0, start) + token + content.slice(end));
      requestAnimationFrame(() => {
        editor.focus();
        editor.setSelectionRange(start + token.length, start + token.length);
      });
      toast.success('Kép beszúrva.');
    } catch (err) { toast.error(err.message); }
  };

  const insertLink = () => {
    const url = window.prompt('Link URL-je:', 'https://');
    if (url && /^https?:\/\//i.test(url)) {
      const editor = editorRef.current;
      if (!editor) return;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selected = content.slice(start, end) || url;
      const replacement = `<a href="${url}" target="_blank" rel="noopener noreferrer">${selected}</a>`;
      setContent(content.slice(0, start) + replacement + content.slice(end));
    }
  };


  if (membersData.loading) return <Spinner />;
  const previewHtml = htmlBody.replace(/<span data-name-placeholder="true">{{NAME}}<\/span>/g, 'Kedves Teszt Címzett!');

  return (
    <div className="space-y-8">
      <div className="card p-6 bg-white space-y-6 border border-sand-300 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-200 pb-4">
          <div><h3 className="font-display text-2xl font-bold text-ink-900 flex items-center gap-2.5"><Mail className="h-6 w-6 text-wine-600" />Egyesületi Hírlevél Küldése</h3><p className="text-sm text-ink-600 mt-1">Hírlevél, meghívó vagy flyer küldése tagoknak és egyedi címzetteknek.</p></div>
          <span className="text-xs font-bold text-wine-800 bg-wine-50 px-3.5 py-2 rounded-xl border border-wine-200">👥 Címzettek: {targetRecipients.length} fő</span>
        </div>
        <form onSubmit={handleSendNewsletter} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div><label className="label text-xs font-bold text-ink-800">Célcsoport</label><select value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value)} className="input py-2.5 px-3.5 text-sm rounded-xl font-medium"><option value="all">Minden tag ({membersData.data?.length || 0} fő)</option><option value="rendes">Csak Rendes Tagok</option><option value="partolo">Csak Pártoló Tagok</option><option value="workgroup">Adott Munkacsoport Tagjai</option></select></div>
            {audienceFilter === 'workgroup' && <div><label className="label text-xs font-bold text-ink-800">Munkacsoport</label><select value={selectedWorkgroupId} onChange={(e) => setSelectedWorkgroupId(e.target.value)} className="input py-2.5 px-3.5 text-sm rounded-xl font-medium"><option value="">-- Válassz csoportot --</option>{(workgroupsData.data || []).map((wg) => <option key={wg.id} value={wg.id}>{wg.name}</option>)}</select></div>}
          </div>
          <div><label className="label text-xs font-bold text-ink-800">Egyedi címzettek <span className="font-normal text-ink-500">(opcionális)</span></label><textarea rows={3} value={manualEmails} onChange={(e) => setManualEmails(e.target.value)} placeholder="email1@ceg.hu&#10;email2@gmail.com&#10;Elválasztó lehet vessző, pontosvessző vagy új sor." className="input py-3 px-4 text-sm rounded-xl font-medium" /><p className="text-[11px] text-ink-500 mt-1.5">Az egyedi címzettek hozzáadódnak a kiválasztott csoporthoz. Duplikációk automatikusan kiszűrve.</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div><label className="label text-xs font-bold text-ink-800">Feladó</label><input type="text" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="input py-2.5 px-3.5 text-sm rounded-xl font-medium" /></div>
            <div><label className="label text-xs font-bold text-ink-800">Levél tárgya *</label><input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} className="input py-2.5 px-3.5 text-sm rounded-xl font-medium" /></div>
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5"><label className="label text-xs font-bold text-ink-800">Üzenet</label><span className="text-[11px] text-ink-500">Használható változó: <strong>{'{{NAME}}'}</strong></span></div>
            <div className="flex flex-wrap items-center gap-1 p-2 rounded-t-xl border border-sand-300 border-b-0 bg-sand-50">
              <button type="button" onClick={() => exec('bold')} className="px-2.5 py-1.5 rounded-lg hover:bg-white font-bold text-sm">B</button>
              <button type="button" onClick={() => exec('italic')} className="px-2.5 py-1.5 rounded-lg hover:bg-white italic text-sm">I</button>
              <button type="button" onClick={() => exec('underline')} className="px-2.5 py-1.5 rounded-lg hover:bg-white underline text-sm">U</button>
              <span className="w-px h-6 bg-sand-300 mx-1" />
              <button type="button" onClick={() => exec('formatBlock', 'h2')} className="px-2.5 py-1.5 rounded-lg hover:bg-white font-bold text-xs">H2</button>
              <button type="button" onClick={() => exec('insertUnorderedList')} className="px-2.5 py-1.5 rounded-lg hover:bg-white text-sm">• Lista</button>
              <button type="button" onClick={insertLink} className="px-2.5 py-1.5 rounded-lg hover:bg-white text-sm flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> Link</button>
              <button type="button" onClick={() => imageInputRef.current?.click()} className="px-2.5 py-1.5 rounded-lg hover:bg-white text-sm flex items-center gap-1 font-semibold text-wine-700"><ImagePlus className="h-3.5 w-3.5" /> Flyer / kép</button>
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; insertImage(f); }} className="hidden" />
              <span className="flex-1" />
              <button type="button" onClick={() => setShowPreview(true)} className="px-2.5 py-1.5 rounded-lg hover:bg-white text-sm flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Előnézet</button>
            </div>
            <div className="relative">
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                dir="ltr"
                spellCheck="true"
                className="min-h-[280px] input rounded-t-none rounded-b-xl p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-wine-200 text-left"
                style={{ direction: 'ltr', textAlign: 'left', unicodeBidi: 'plaintext', writingMode: 'horizontal-tb' }}
                placeholder="Írd ide az email szövegét..."
              />
            </div>
            <p className="text-[11px] text-ink-500 mt-1.5">Képeket közvetlenül ide szúrhatsz be. A feltöltött képek weben elérhető tárhelyre kerülnek, így az email kliensek is be tudják tölteni őket.</p>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 pt-3 border-t border-sand-200">
            <div className="flex flex-wrap gap-2 items-end"><div><label className="label text-[11px] font-bold text-ink-700">Tesztküldés ide</label><input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="sajat@email.hu" className="input py-2 px-3 text-sm rounded-xl w-56" /></div><button type="button" onClick={handleTestSend} disabled={testSending || !testEmail.trim()} className="btn-secondary btn-md rounded-xl font-bold flex items-center gap-2"><Send className="h-4 w-4" />{testSending ? 'Küldés...' : 'Tesztküldés'}</button></div>
            <button type="submit" disabled={sending || targetRecipients.length === 0} className="btn-primary btn-md rounded-xl font-bold flex items-center gap-2 shadow-sm px-7"><Send className="h-4.5 w-4.5" />{sending ? 'Kiküldés folyamatban...' : `Hírlevél kiküldése (${targetRecipients.length} fő)`}</button>
          </div>
        </form>
        {lastReport && <div className="p-4 rounded-2xl bg-sand-100 border border-sand-300 space-y-2 text-xs"><h4 className="font-bold text-ink-900 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Kiküldési eredmény</h4><p className="text-ink-700">Összesen: <strong>{lastReport.total}</strong> | Sikeres: <strong>{lastReport.success}</strong> | Sikertelen: <strong>{lastReport.failed}</strong></p>{lastReport.errors?.length > 0 && <ul className="list-disc list-inside text-rose-700 space-y-1 pt-1">{lastReport.errors.map((err, i) => <li key={i}>{err}</li>)}</ul>}</div>}
      </div>
      {showPreview && <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center" onClick={() => setShowPreview(false)}><div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-5" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between mb-4"><div><h4 className="font-display text-xl font-bold">Email előnézet</h4><p className="text-xs text-ink-500 mt-1">{subject}</p></div><button type="button" onClick={() => setShowPreview(false)} className="p-2 rounded-lg hover:bg-sand-100"><X className="h-5 w-5" /></button></div><div className="border border-sand-200 rounded-xl p-4 bg-sand-50"><div dangerouslySetInnerHTML={{ __html: previewHtml }} /></div></div></div>}
    </div>
  );
};