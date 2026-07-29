import React from 'react';
import { ShieldCheck, UserPlus, Mail, FolderKanban, Newspaper, FileText, CreditCard, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const AdminUserManual = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Fejléc üdvözlő kártya */}
      <div className="card p-6 sm:p-8 bg-wine-900 text-white border-2 border-gold-400/40 shadow-xl rounded-3xl relative overflow-hidden space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-gold-400 border border-white/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400">KTSZE Elnökségi Portál</span>
            <h2 className="font-display text-2xl font-bold text-white">Elnökségi Kezelési Útmutató &amp; Kézikönyv</h2>
          </div>
        </div>
        <p className="text-sm text-sand-100 leading-relaxed font-medium">
          Kedves Elnökségi Tagunk! Ez a kézikönyv az egyesületi vezetőség feladatait és az elnökségi rendszer használatát magyarázza el érthető, emberi nyelven.
        </p>
      </div>

      {/* Lépések / Funkciók Rácsa */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* 1. Tagok Kezelése */}
        <div className="card p-6 bg-white border border-sand-300 space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
            <div className="h-10 w-10 rounded-xl bg-wine-100 text-wine-800 flex items-center justify-center font-bold">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-wine-700">1. Feladat</span>
              <h3 className="font-display text-lg font-bold text-ink-900">Tagok Felvétele &amp; Jóváhagyása</h3>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-ink-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Új tag felvétele:</strong> A <strong className="text-ink-900">„Tagnyilvántartás”</strong> fülön kattints a <strong className="text-wine-800">„+ Új Tag Regisztrálása”</strong> gombra. Add meg a nevét és e-mail címét.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Automata üdvözlő levél:</strong> A mentéskor a rendszer automatikusan kiküldi az új tag e-mail címére a belépési oldalt és a generált ideiglenes jelszavát.</span>
            </li>
          </ul>
        </div>

        {/* 2. Hírlevél Küldés */}
        <div className="card p-6 bg-white border border-sand-300 space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
            <div className="h-10 w-10 rounded-xl bg-wine-100 text-wine-800 flex items-center justify-center font-bold">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-wine-700">2. Feladat</span>
              <h3 className="font-display text-lg font-bold text-ink-900">Hírlevél Küldése a Tagoknak</h3>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-ink-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Tájékoztató levél írása:</strong> Nyisd meg a <strong className="text-ink-900">„Hírlevél Küldése”</strong> fület. Írd be a tárgyat és a megfogalmazott üzenetet.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>1-kattintásos kiküldés:</strong> Kattints a <strong className="text-wine-800">„Hírlevél Kiküldése”</strong> gombra. A rendszer minden regisztrált tag e-mail fiókjába eljuttatja a levelet az hivatalos egyesületi feladótól.</span>
            </li>
          </ul>
        </div>

        {/* 3. Munkacsoportok & Projektek */}
        <div className="card p-6 bg-white border border-sand-300 space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
            <div className="h-10 w-10 rounded-xl bg-wine-100 text-wine-800 flex items-center justify-center font-bold">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-wine-700">3. Feladat</span>
              <h3 className="font-display text-lg font-bold text-ink-900">Munkacsoportok &amp; Projektek</h3>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-ink-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Projektek kiírása:</strong> A munkacsoportok oldalán kattints az <strong className="text-wine-800">„Új Projekt Kiírása”</strong> gombra. Adj neki címet, írj ki feladatokat és jelölj ki felelősöket!</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Elnökségi projekt törlés:</strong> Ha egy projekt lezárult vagy téves, az elnökségi tagok piros <strong className="text-rose-700">„Projekt Törlése”</strong> gombjával véglegesen törölhetik azt.</span>
            </li>
          </ul>
        </div>

        {/* 4. Hírek & Események */}
        <div className="card p-6 bg-white border border-sand-300 space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
            <div className="h-10 w-10 rounded-xl bg-wine-100 text-wine-800 flex items-center justify-center font-bold">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-wine-700">4. Feladat</span>
              <h3 className="font-display text-lg font-bold text-ink-900">Hírek &amp; Események Közzététele</h3>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-ink-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Hír publikálása:</strong> A <strong className="text-ink-900">„Hírek &amp; Események”</strong> fülön közzétehetsz szakmai híreket, fotókat és közgyűlési meghívókat.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Azonnali megjelenés:</strong> A beküldött cikkek azonnal kikerülnek a főoldalra és a lakossági hírek közé.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
