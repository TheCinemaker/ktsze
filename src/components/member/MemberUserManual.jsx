import React from 'react';
import { Key, CreditCard, Flower2, FileText, UserCog, HelpCircle, CheckCircle2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export const MemberUserManual = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Fejléc üdvözlő kártya */}
      <div className="card p-6 sm:p-8 bg-wine-900 text-white border-2 border-gold-400/40 shadow-xl rounded-3xl relative overflow-hidden space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-gold-400 border border-white/20">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400">KTSZE Tagi Felület</span>
            <h2 className="font-display text-2xl font-bold text-white">Felhasználói Útmutató Tagjaink Részére</h2>
          </div>
        </div>
        <p className="text-sm text-sand-100 leading-relaxed font-medium">
          Kedves Tagunk! Ezen az oldalon lépésről lépésre, egyszerűen elmagyarázzuk a tagi portál működését. 
          Semmi bonyolult szaknyelv — pontosan látni fogod, mit hol találsz és hogyan intézheted az egyesületi ügyeidet!
        </p>
      </div>

      {/* Lépések / Funkciók Rácsa */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* 1. Belépés & Jelszó */}
        <div className="card p-6 bg-white border border-sand-300 space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
            <div className="h-10 w-10 rounded-xl bg-wine-100 text-wine-800 flex items-center justify-center font-bold">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-wine-700">1. Lépés</span>
              <h3 className="font-display text-lg font-bold text-ink-900">Belépés &amp; Jelszó Módosítása</h3>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-ink-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Az első belépés:</strong> Használd az elnökségtől e-mailben kapott ideiglenes jelszavadat a <a href="/belepes" className="text-wine-800 font-bold underline">ktsze.hu/belepes</a> oldalon.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Saját jelszó beállítása:</strong> Belépés után nyisd meg az <strong className="text-ink-900 font-bold">„Adatlapom”</strong> fület. Alul a <strong className="text-wine-800">„Jelszó Módosítása”</strong> dobozban írd be a saját új jelszavadat, amit könnyen megjegyzel.</span>
            </li>
          </ul>
        </div>

        {/* 2. Tagdíj */}
        <div className="card p-6 bg-white border border-sand-300 space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
            <div className="h-10 w-10 rounded-xl bg-wine-100 text-wine-800 flex items-center justify-center font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-wine-700">2. Lépés</span>
              <h3 className="font-display text-lg font-bold text-ink-900">Tagdíj Befizetése &amp; Igazolása</h3>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-ink-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Tagdíj ellenőrzése:</strong> A <strong className="text-ink-900">„Tagdíj”</strong> fülre kattintva látod az esedékes éves tagdíjadat és az egyesület banki adatait.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Igazolás feltöltése:</strong> Miután elutaltad az összeget, a <strong className="text-wine-800">„Fájl kiválasztása”</strong> gombra kattintva töltsd fel az átutalási bizonylatot (PDF vagy fotó). Az elnökség ezután jóváhagyja.</span>
            </li>
          </ul>
        </div>

        {/* 3. Munkacsoportok */}
        <div className="card p-6 bg-white border border-sand-300 space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
            <div className="h-10 w-10 rounded-xl bg-wine-100 text-wine-800 flex items-center justify-center font-bold">
              <Flower2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-wine-700">3. Lépés</span>
              <h3 className="font-display text-lg font-bold text-ink-900">Munkacsoportok &amp; Projektek</h3>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-ink-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Csatlakozás csoportokhoz:</strong> A <strong className="text-ink-900">„Munkacsoportjaim”</strong> fülön vagy a főmenü <strong className="text-wine-800">„Munkacsoportok”</strong> pontjában kattints a <strong className="text-emerald-700">„Jelentkezés a csoportba”</strong> gombra.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zárt feladatok &amp; Ötletelés:</strong> A jóváhagyás után belátsz a csoport belső feladataiba, felelősökbe, és te is küldhetsz ötleteket vagy csatolhatsz fájlokat.</span>
            </li>
          </ul>
        </div>

        {/* 4. Dokumentumok & Adatlap */}
        <div className="card p-6 bg-white border border-sand-300 space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
            <div className="h-10 w-10 rounded-xl bg-wine-100 text-wine-800 flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-wine-700">4. Lépés</span>
              <h3 className="font-display text-lg font-bold text-ink-900">Iratok &amp; Saját Adatlap</h3>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-ink-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Hivatalos Iratok:</strong> A <strong className="text-ink-900">„Dokumentumok”</strong> fül alatt egy helyen megtalálod a közgyűlési jegyzőkönyveket, alapszabályt és letölthető nyomtatványokat.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Adatok frissítése:</strong> Az <strong className="text-ink-900">„Adatlapom”</strong> fülön bármikor átírhatod a telefonszámodat, címeidet vagy a szolgáltatásod nevét.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Segítségkérés kártya */}
      <div className="card p-6 bg-sand-100/90 border border-sand-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-wine-700 shrink-0" />
          <div>
            <h4 className="font-display text-base font-bold text-ink-900">Segítségre van szükséged?</h4>
            <p className="text-xs text-ink-600">Ha elakadtál vagy kérdésed van, írj bátran az egyesület elnökségének!</p>
          </div>
        </div>
        <a href="mailto:info@ktsze.hu" className="btn-primary btn-sm font-bold flex items-center gap-1.5 shrink-0">
          <span>Kapcsolat az Elnökséggel</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};
