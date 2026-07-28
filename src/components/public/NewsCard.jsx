import React from 'react';
import { Link } from 'react-router-dom';
import { coverUrl, formatDate } from '../../lib/format';
import { FormattedText } from '../ui';

export const NewsCard = ({ item }) => {
  const cover = coverUrl(item.cover_path);
  const timestamp = item.published_at || item.created_at;
  const published = formatDate(timestamp);

  return (
    <article className="glass-card rounded-2xl flex flex-col overflow-hidden group hover:-translate-y-1 hover:border-wine-300 transition-all duration-300">
      {cover && (
        <div className="relative h-48 w-full overflow-hidden bg-sand-200">
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {item.category && <span className="badge-wine font-bold shadow-2xs">{item.category}</span>}
          {published && (
            <time dateTime={timestamp} className="text-xs font-medium text-ink-500">
              {published}
            </time>
          )}
        </div>

        <h3 className="font-display text-lg sm:text-xl font-bold text-ink-900 leading-snug">
          <Link to={`/hirek/${item.slug}`} className="rounded transition-colors hover:text-wine-600">
            {item.title}
          </Link>
        </h3>

        {item.excerpt && (
          <div className="text-sm text-ink-600 line-clamp-3 leading-relaxed">
            <FormattedText>{item.excerpt}</FormattedText>
          </div>
        )}

        <div className="pt-2">
          <Link
            to={`/hirek/${item.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-wine-600 hover:text-wine-800 transition-colors"
          >
            Tovább olvasom →
          </Link>
        </div>
      </div>
    </article>
  );
};
