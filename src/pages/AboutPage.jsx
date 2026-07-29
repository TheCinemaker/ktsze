import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Crown, Mail, Phone, Building2, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

import { ORGANIZATION, formattedAddress, BOARD_MEMBERS_BIO } from '../config/organization';
import { listPublicBoardMembers } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { PageHeader, Spinner, DetailRow, FormattedText } from '../components/ui';
import { SEO } from '../components/ui/SEO';

const getMemberKey = (member) => {
  const nameLower = (member.full_name || '').toLowerCase();
  const emailLower = (member.private_email || '').toLowerCase();

  if (nameLower.includes('szilveszter') || emailLower.includes('szilveszter')) {
    return 'szilveszter';
  }
  if (nameLower.includes('adrienn') || nameLower.includes('szalók') || emailLower.includes('adrienn')) {
    return 'adrienn';
  }
  if (nameLower.includes('róbert') || nameLower.includes('vörös') || emailLower.includes('robert')) {
    return 'robert';
  }
  if (nameLower.includes('péter') || nameLower.includes('farkas') || emailLower.includes('peter')) {
    return 'peter';
  }
  if (member.custom_title?.toLowerCase().includes('elnök') || nameLower.includes('gábor') || nameLower.includes('drescher')) {
    return 'elnok';
  }
  return null;
};

const getMemberBio = (member) => {
  if (member.bio) return member.bio;
  const key = getMemberKey(member);
  if (key && BOARD_MEMBERS_BIO[key]?.bio) {
    return BOARD_MEMBERS_BIO[key].bio;
  }
  return 'Az egyesület elnökségi tagja, aki aktív szerepet vállal Kőszeg turisztikai és szakmai fejlődésének támogatásában.';
};

const getMemberPhoto = (member) => {
  if (member.avatar_url) return member.avatar_url;
  const key = getMemberKey(member);
  if (key && BOARD_MEMBERS_BIO[key]?.photoUrl) {
    return BOARD_MEMBERS_BIO[key].photoUrl;
  }
  return null;
};

const getMemberMotto = (member) => {
  if (member.motto) return member.motto;
  const key = getMemberKey(member);
  if (key && BOARD_MEMBERS_BIO[key]?.motto) {
    return BOARD_MEMBERS_BIO[key].motto;
  }
  return null;
};

const getMemberPhone = (member) => {
  if (member.phone) return { phone: member.phone, formatted: member.phone };
  const key = getMemberKey(member);
  if (key && BOARD_MEMBERS_BIO[key]?.phone) {
    return {
      phone: BOARD_MEMBERS_BIO[key].phone,
      formatted: BOARD_MEMBERS_BIO[key].phoneFormatted || BOARD_MEMBERS_BIO[key].phone
    };
  }
  return null;
};

// Nyilvános partnerek és csatlakozási felhívások
const PUBLIC_PARTNERS = [
  {
    name: 'visitkoszeg.hu',
    category: 'Digitális Turisztikai Platform & Látogatói Portál',
    description: 'A város digitális motorja, ahol mindent megtalál az ideérkező vendég: látnivalók, szálláshelyek, borászatok és aktuális kőszegi programok egy helyen.',
    badge: 'Kiemelt Szövetségi Partner',
    url: 'https://visitkoszeg.hu',
    isPrimary: true
  },
  {
    name: 'Itt a Te Helyed!',
    category: 'Szálláshely / Vendéglátás / Borászat',
    description: 'Jelenjen meg vállalkozásával a Kőszegi Turisztikai Szövetség hivatalos felületén és vegyen részt a város közös turisztikai fejlesztéseiben.',
    badge: 'Legyél Támogató Partnertag',
    url: '/tagsag',
    isCta: true
  },
  {
    name: 'Csatlakozz Vállalkozásoddal!',
    category: 'Kulturális & Szabadidős Szolgáltató',
    description: 'Legyen része a kőszegi turisztikai összefogásnak! A szövetség tagjaként közös hangon, megerősítve jelenhet meg.',
    badge: 'Lépj be a Szövetségbe',
    url: '/tagsag',
    isCta: true
  },
  {
    name: 'Támogasd Kőszeg Turizmusát!',
    category: 'Pártoló & Szakmai Partnertag',
    description: 'Dolgozzunk együtt a kőszegi turizmus jövőjén. Vegye fel velünk a kapcsolatot és csatlakozzon az egyesülethez!',
    badge: 'Városi Összefogás',
    url: '/kapcsolat',
    isCta: true
  }
];

export const AboutPage = () => {
  const { data: boardMembers, loading: boardLoading } = useAsyncData(listPublicBoardMembers);
  const address = formattedAddress();

  const hasLegalData = Boolean(
    address || ORGANIZATION.taxNumber || ORGANIZATION.registrationNumber || ORGANIZATION.courtRegistration
  );

  return (
    <div className="container-page py-12 sm:py-16 space-y-16">
      <SEO
        title="Egyesületünkről &amp; Vezetőség"
        description="Ismerje meg a Kőszegi Turisztikai Szövetség Egyesület elnökségét, tisztségviselőit, támogató tagjait és hivatalos adatait."
      />

      <PageHeader eyebrow="Egyesületünkről" title={ORGANIZATION.legalName} description={ORGANIZATION.mission} />

      {/* 1. Elnökség & Vezetőség */}
      <section>
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-wine-600" aria-hidden="true" />
          <h2 className="font-display text-2xl text-ink-900">Elnökség &amp; Tisztségviselők</h2>
        </div>
        <p className="mt-1 text-sm text-ink-600">
          Az egyesület hivatalosan megválasztott elnöksége és tisztségviselői.
        </p>

        <div className="mt-6">
          {boardLoading && <Spinner />}

          {!boardLoading && (!boardMembers || boardMembers.length === 0) && (
            <div className="rounded-xl border border-dashed border-sand-400 p-6 text-center text-sm text-ink-600">
              Az elnökségi és tisztségviselői adatok frissítés alatt.
            </div>
          )}

          {boardMembers && boardMembers.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {boardMembers.map((member) => (
                <article
                  key={member.id}
                  className="card overflow-hidden flex flex-col justify-between p-0 transition-all duration-300 hover:shadow-xl border border-sand-300 bg-white group h-[520px]"
                >
                  {/* Egységes, elegáns 1/4 méretű portré kép */}
                  <div className="relative h-40 sm:h-44 w-full bg-sand-200 overflow-hidden flex items-center justify-center border-b border-sand-300 shrink-0">
                    {getMemberPhoto(member) ? (
                      <img
                        src={getMemberPhoto(member)}
                        alt={member.full_name}
                        className="h-full w-full object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center space-y-1.5 text-wine-800/70">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-wine-100 text-wine-800 text-xl font-bold font-display shadow-inner">
                          {member.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'TK'}
                        </div>
                        <span className="text-[11px] font-semibold text-ink-500">Portré feltöltésre vár</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5 rounded-full bg-wine-700/90 text-white p-1.5 shadow-md">
                      <Award className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Tartalom & Bemutatkozás */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="inline-block rounded-full bg-wine-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-wine-800">
                        {member.custom_title || 'Elnökségi Tag'}
                      </span>
                      <h3 className="font-display text-xl font-bold text-ink-900">
                        {member.full_name}
                      </h3>
                      {(member.service_location_name || member.business_activity) && (
                        <p className="text-xs font-medium text-wine-700">
                          {member.service_location_name || member.business_activity}
                        </p>
                      )}

                      {getMemberMotto(member) && (
                        <blockquote className="text-xs italic font-medium text-wine-900 bg-sand-100 p-2.5 rounded-lg border-l-2 border-wine-600 my-2">
                          {getMemberMotto(member)}
                        </blockquote>
                      )}

                      <div className="text-xs leading-relaxed text-ink-600 pt-2 border-t border-sand-200 h-32 overflow-y-auto pr-1 custom-scrollbar">
                        <FormattedText>{getMemberBio(member)}</FormattedText>
                      </div>
                    </div>

                    {/* Elérhetőség */}
                    {(member.private_email || getMemberPhone(member)) && (
                      <div className="pt-3 border-t border-sand-200 space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Elérhetőség:</div>
                        {member.private_email && (
                          <div>
                            <a
                              href={`mailto:${member.private_email}`}
                              className="inline-flex items-center gap-2 text-xs font-medium text-wine-700 hover:text-wine-900 transition-colors"
                            >
                              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              {member.private_email}
                            </a>
                          </div>
                        )}

                        {getMemberPhone(member) && (
                          <div>
                            <a
                              href={`tel:${getMemberPhone(member).phone}`}
                              className="inline-flex items-center gap-2 text-xs font-medium text-wine-700 hover:text-wine-900 transition-colors"
                            >
                              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              {getMemberPhone(member).formatted}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. Támogató Vállalkozások & Nyilvános Partnereink */}
      <section className="pt-8 border-t border-sand-300 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow text-wine-700">Fogjunk össze Kőszegért</div>
            <h2 className="mt-1 font-display text-2xl text-ink-900 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-wine-600" />
              Támogató Vállalkozások &amp; Szövetségi Tagjaink
            </h2>
            <p className="mt-1 text-sm text-ink-600 max-w-2xl">
              A Kőszegi Turisztikai Szövetség mögött álló helyi szálláshelyek, borászatok, vendéglátók és kulturális szolgáltatók, akik közösen dolgoznak a város turizmusán.
            </p>
          </div>

          <Link to="/tagsag" className="btn-primary btn-sm rounded-xl font-bold shadow-xs">
            Csatlakozzon Vállalkozásával
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PUBLIC_PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className={`card p-6 flex flex-col justify-between space-y-4 transition-all duration-300 ${
                partner.isPrimary
                  ? 'bg-gradient-to-b from-wine-50/90 via-white to-sand-50 border-2 border-gold-400 shadow-md ring-1 ring-gold-400/30'
                  : 'bg-white border border-dashed border-sand-400 hover:border-wine-400 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold border ${
                    partner.isPrimary
                      ? 'bg-wine-700 text-white border-wine-800'
                      : 'bg-sand-100 text-wine-800 border-sand-300'
                  }`}
                >
                  {partner.badge}
                </span>

                <h3 className="font-display text-xl font-bold text-ink-900">{partner.name}</h3>
                <p className="text-xs font-bold text-wine-700">{partner.category}</p>
                <p className="text-xs text-ink-600 leading-relaxed">{partner.description}</p>
              </div>

              <div className="pt-3 border-t border-sand-200">
                {partner.isPrimary ? (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold btn-sm w-full font-bold flex items-center justify-center gap-1.5"
                  >
                    visitkoszeg.hu
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <Link
                    to={partner.url}
                    className="btn-secondary btn-sm w-full text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-wine-50 hover:text-wine-700"
                  >
                    Csatlakozási Hely
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Felhívás Kőszegi Vállalkozóknak */}
        <div className="card p-8 bg-gradient-to-r from-sand-100 via-sand-50 to-sand-100 border border-gold-300/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-display text-xl font-bold text-ink-900">
              „Egy város akkor erős, ha a szereplői egy irányba néznek.”
            </h3>
            <p className="text-sm text-ink-600 max-w-xl leading-relaxed">
              Szálláshely, vendéglátóhely, borászat vagy kulturális szolgáltató: a szövetség tagjaként közös felületen, közös hanggal jelenhet meg.
            </p>
          </div>
          <Link to="/tagsag" className="btn-gold btn-md whitespace-nowrap font-bold shrink-0 shadow-md">
            Tagsági Feltételek &amp; Csatlakozás
          </Link>
        </div>
      </section>

      {/* 3. Hivatalos adatok */}
      {hasLegalData && (
        <section className="pt-8 border-t border-sand-300">
          <h2 className="font-display text-2xl text-ink-900">Hivatalos egyesületi adatok</h2>
          <dl className="mt-4 max-w-2xl divide-y divide-sand-300 border-y border-sand-300">
            <DetailRow label="Székhely" value={address} />
            <DetailRow label="Adószám" value={ORGANIZATION.taxNumber} />
            <DetailRow label="Nyilvántartási szám" value={ORGANIZATION.registrationNumber} />
            <DetailRow label="Bejegyző bíróság" value={ORGANIZATION.courtRegistration} />
          </dl>
        </section>
      )}
    </div>
  );
};
