import React from 'react';
import { ShieldCheck, Lock, FileText, Server, Eye, ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { ORGANIZATION, formattedAddress } from '../config/organization';

export const PrivacyPolicyPage = () => {
  const address = formattedAddress();

  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Jogi nyilatkozat &amp; GDPR"
        title="Adatkezelési Tájékoztató"
        description="A Kőszegi Turisztikai Szövetség Egyesület tájékoztatója a weboldalon és a zárt tagi portálon történő adatkezelésről, a GDPR rendelet és a magyar jogszabályok alapján."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-4">
        {/* Tartalomjegyzék / Navigáció */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 surface p-5 space-y-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-900 border-b border-sand-300 pb-2">
              Tartalomjegyzék
            </h2>
            <nav className="space-y-1.5 text-xs text-ink-600">
              <a href="#adatkezelo" className="block hover:text-wine-600 transition-colors">1. Az Adatkezelő kiléte</a>
              <a href="#jogalap" className="block hover:text-wine-600 transition-colors">2. Az adatkezelés célja és jogalapja</a>
              <a href="#kezelt-adatok" className="block hover:text-wine-600 transition-colors">3. A kezelt adatok köré</a>
              <a href="#adatfeldolgozok" className="block hover:text-wine-600 transition-colors">4. Adatfeldolgozók &amp; Felhő tárhely</a>
              <a href="#sutik" className="block hover:text-wine-600 transition-colors">5. Sütik (Cookie-k) használata</a>
              <a href="#erintett-jogok" className="block hover:text-wine-600 transition-colors">6. Az Érintettek jogai &amp; NAIH</a>
            </nav>
          </div>
        </aside>

        {/* Részletes jogi szöveg */}
        <div className="lg:col-span-3 space-y-10 prose-body text-ink-800 text-sm leading-relaxed">
          {/* 1. Adatkezelő */}
          <section id="adatkezelo" className="surface p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-100 text-wine-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl text-ink-900">1. Az Adatkezelő adatai</h2>
            </div>
            <p>
              A <strong>{ORGANIZATION.legalName}</strong> (a továbbiakban: <em>Adatkezelő</em> vagy <em>Egyesület</em>) elkötelezett a tagok, tisztségviselők és a weboldal látogatóinak személyes adatai védelme iránt. Az adatkezelés során az Európai Parlament és a Tanács (EU) 2016/679 Rendelete (GDPR), valamint az információönrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény (Infotv.) rendelkezéseit 100%-ban betartjuk.
            </p>
            <dl className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-sand-300 text-xs">
              <div>
                <dt className="font-bold text-ink-900">Hivatalos név:</dt>
                <dd className="text-ink-600">{ORGANIZATION.legalName}</dd>
              </div>
              {address && (
                <div>
                  <dt className="font-bold text-ink-900">Székhely:</dt>
                  <dd className="text-ink-600">{address}</dd>
                </div>
              )}
              {ORGANIZATION.email && (
                <div>
                  <dt className="font-bold text-ink-900">E-mail kapcsolat:</dt>
                  <dd className="text-ink-600">{ORGANIZATION.email}</dd>
                </div>
              )}
              {ORGANIZATION.taxNumber && (
                <div>
                  <dt className="font-bold text-ink-900">Adószám:</dt>
                  <dd className="text-ink-600">{ORGANIZATION.taxNumber}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* 2. Jogalap */}
          <section id="jogalap" className="surface p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-100 text-wine-700">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl text-ink-900">2. Az adatkezelés célja és jogalapja</h2>
            </div>
            <p>
              Az Egyesület az alábbi célokból és jogalapok alapján kezel adatokat:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Egyesületi tagsági jogviszony és nyilvántartás (GDPR 6. cikk (1) b) pont)</strong>: A tagok azonosítása, a tagdíjbefizetések nyilvántartása, a közgyűlési meghívók és egyesületi iratok eljuttatása.
              </li>
              <li>
                <strong>Zárt tagi portál és jogosultságkezelés (GDPR 6. cikk (1) f) pont - Jogos érdek)</strong>: A zárt dokumentumtár és az elnökségi adminisztrációs felület biztonságos elérésének biztosítása, illetéktelen hozzáférések megakadályozása.
              </li>
              <li>
                <strong>Munkacsoport-jelentkezések kezelése (GDPR 6. cikk (1) a) pont - Hozzájárulás)</strong>: Az egyesületi munkacsoportokhoz való önkéntes csatlakozási kérelmek elbírálása és a szakmai munkaszervezés.
              </li>
            </ul>
          </section>

          {/* 3. Kezelt adatok */}
          <section id="kezelt-adatok" className="surface p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-100 text-wine-700">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl text-ink-900">3. A kezelt adatok köré</h2>
            </div>
            <p>
              A rendszer kizárólag a feladatok ellátásához elengedhetetlenül szükséges adatokat kezeli:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2 text-xs">
              <div className="rounded-lg bg-sand-100 p-4 border border-sand-300">
                <h3 className="font-bold text-ink-900 mb-1">Tagi és Elnökségi Profilok:</h3>
                <p className="text-ink-600">Név, e-mail cím, telefonszám, székhely/telephely cím, vállalkozási tevékenység megnevezése, egyedi tisztségnév.</p>
              </div>
              <div className="rounded-lg bg-sand-100 p-4 border border-sand-300">
                <h3 className="font-bold text-ink-900 mb-1">Pénzügyi &amp; Tagdíj Adatok:</h3>
                <p className="text-ink-600">Tagdíjfizetési státusz, összegek, befizetés dátuma, feltöltött banki átutalási igazolások (kizárólag zárt tárolóban).</p>
              </div>
            </div>
          </section>

          {/* 4. Adatfeldolgozók */}
          <section id="adatfeldolgozok" className="surface p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-100 text-wine-700">
                <Server className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl text-ink-900">4. Adatfeldolgozók és technológiai partnerek</h2>
            </div>
            <p>
              Az Egyesület a Platform biztonságos üzemeltetéséhez az alábbi minősített adatfeldolgozókat veszi igénybe. Minden partner megfelel a GDPR szigorú követelményeinek:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl border border-sand-300 bg-paper">
                <h3 className="font-bold text-ink-900 text-sm">1. Supabase Inc. (Adatbázis, Autentikáció &amp; Felhő Tárhely)</h3>
                <p className="text-xs text-ink-600 mt-1">
                  Szolgáltatás: Felhőalapú PostgreSQL adatbázis, jelszó-hashing és zárt dokumentumtároló (EU Frankfurt régió / SOC2 Type 2 tanúsítvány).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-sand-300 bg-paper">
                <h3 className="font-bold text-ink-900 text-sm">2. Netlify Inc. (Weboldal tárhely &amp; CDN hálózat)</h3>
                <p className="text-xs text-ink-600 mt-1">
                  Szolgáltatás: Globális biztonságos webszerver hálózat, HTTPS SSL titkosítás.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-sand-300 bg-paper">
                <h3 className="font-bold text-ink-900 text-sm">3. SA Software &amp; Network Solutions (Informatikai Rendszergazda)</h3>
                <p className="text-xs text-ink-600 mt-1">
                  Képviselő: Avar Szilveszter | Szolgáltatás: Rendszerfejlesztés, technikai karbantartás és üzemeltetési SLA felügyelet.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Sütik */}
          <section id="sutik" className="surface p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-100 text-wine-700">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl text-ink-900">5. Sütik (Cookie-k) és Munkamenet Tárolás</h2>
            </div>
            <p>
              A weboldal <strong>NEM HASZNÁL reklámcélú, analitikai vagy harmadik féltől származó nyomkövető sütiket</strong>.
            </p>
            <p>
              Kizárólag <strong>technikai szempontból elengedhetetlen (munkamenet) sütiket és tárolókat</strong> használunk:
            </p>
            <ul className="list-disc pl-5 text-xs text-ink-600 space-y-1">
              <li><strong>Supabase Auth Token (localStorage/sessionStorage)</strong>: A belépett tag munkamenetének megőrzése böngészés közben. Kijelentkezéskor automatikusan törlődik.</li>
              <li><strong>Süti hozzájárulás állapota</strong>: Annak tárolása, hogy a látogató elfogadta a tájékoztatót.</li>
            </ul>
          </section>

          {/* 6. Jogok & NAIH */}
          <section id="erintett-jogok" className="surface p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-100 text-wine-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl text-ink-900">6. Az Érintettek jogai és Jogorvoslati lehetőségek</h2>
            </div>
            <p>
              Az Egyesület tagjai és a weboldal használói bármikor élhetnek az alábbi jogaikkal:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong>Tájékoztatáshoz és hozzáféréshez való jog</strong>: Kérheti a róla kezelt adatok másolatát.</li>
              <li><strong>Helyesbítéshez való jog</strong>: Kérheti a pontatlan adatok javítását (a tagi felületen közvetlenül is módosítható).</li>
              <li><strong>Törléshez való jog („elfeledtetés”)</strong>: A tagsági jogviszony megszűnése után kérheti adatainak törlését.</li>
              <li><strong>Adatkezelés korlátozása és tiltakozás</strong>.</li>
            </ul>

            <div className="mt-6 p-4 rounded-xl bg-sand-100 border border-sand-300 space-y-2">
              <h3 className="font-bold text-ink-900 text-sm">Felügyeleti Hatóság (NAIH) Panaszkezelés:</h3>
              <p className="text-xs text-ink-600">
                Amennyiben úgy érzi, hogy az Adatkezelő megsértette a jogait, panaszt tehet a Nemzeti Adatvédelmi és Információszabadság Hatóságnál:
              </p>
              <div className="text-xs text-ink-800 space-y-0.5 font-mono pt-1">
                <p><strong>NAIH</strong> | 1055 Budapest, Falk Miksa utca 9-11.</p>
                <p>Postacím: 1363 Budapest, Pf. 9.</p>
                <p>Weboldal: <a href="https://naih.hu" target="_blank" rel="noopener noreferrer" className="text-wine-600 underline">https://naih.hu</a></p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
