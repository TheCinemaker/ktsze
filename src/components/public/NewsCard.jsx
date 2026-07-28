import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { coverUrl, formatDate } from '../../lib/format';
import { FormattedText } from '../ui';
import { useSpotlight } from '../../lib/motion';

export const NewsCard = ({ item }) => {
  const cover = coverUrl(item.cover_path);
  const timestamp = item.published_at || item.created_at;
  const published = formatDate(timestamp);
  const spotlightRef = useSpotlight();

  return (
    <article
      ref={spotlightRef}
      className="card-hover spotlight group relative flex flex-col overflow-hidden"
    >
      {cover && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand-200">
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-lux group-hover:scale-[1.06]"
          />
          {/* Alulról felszívódó sötétedés: a képen ülő szöveg így akkor is
              olvasható marad, ha a fotó világos. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-noir-950/55 via-noir-950/5 to-transparent"
          />
          {item.category && (
            <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-noir-950/55 px-3 py-1 font-mono text-2xs uppercase tracking-[0.16em] text-ivory-100 backdrop-blur-md">
              {item.category}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-3">
          {!cover && item.category && <span className="badge-wine">{item.category}</span>}
          {published && (
            <time
              dateTime={timestamp}
              className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-400"
            >
              {published}
            </time>
          )}
        </div>

        <h3 className="mt-3 font-display text-xl leading-snug text-ink-900">
          <Link to={`/hirek/${item.slug}`} className="transition-colors hover:text-wine-600">
            {/* Kiterjesztett kattintófelület: az egész kártya visz a hírhez,
                de a fókuszálható elem továbbra is egyetlen, valódi link marad. */}
            <span className="absolute inset-0" aria-hidden="true" />
            {item.title}
          </Link>
        </h3>

        {/* relative z-10: a kivonatban felismert URL-ek a kártyát lefedő
            kattintófelület FÖLÖTT maradjanak, különben elnyelné őket. */}
        {item.excerpt && (
          <div className="relative z-10 mt-3 line-clamp-3 text-sm leading-relaxed text-ink-500">
            <FormattedText>{item.excerpt}</FormattedText>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-wine-600">
            Tovább olvasom
            <span className="h-px w-6 bg-wine-500/50 transition-all duration-500 ease-lux group-hover:w-12" />
          </span>
          <ArrowUpRight
            className="h-4 w-4 text-ink-300 transition-all duration-500 ease-lux group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-wine-600"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
};
