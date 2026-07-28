import React from 'react';
import { Link } from 'react-router-dom';
import { coverUrl, formatDate } from '../../lib/format';
import { FormattedText } from '../ui';

export const NewsCard = ({ item }) => {
  const cover = coverUrl(item.cover_path);
  const timestamp = item.published_at || item.created_at;
  const published = formatDate(timestamp);

  return (
    <article className="card-hover flex flex-col overflow-hidden">
      {cover && (
        <img src={cover} alt="" loading="lazy" className="h-44 w-full border-b border-sand-400 object-cover" />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {item.category && <span className="badge-wine">{item.category}</span>}
          {published && (
            <time dateTime={timestamp} className="text-xs text-ink-500">
              {published}
            </time>
          )}
        </div>

        <h3 className="mt-2.5 font-display text-lg text-ink-900">
          <Link to={`/hirek/${item.slug}`} className="rounded transition-colors hover:text-wine-600">
            {item.title}
          </Link>
        </h3>

        {item.excerpt && (
          <div className="mt-2 text-sm text-ink-600">
            <FormattedText>{item.excerpt}</FormattedText>
          </div>
        )}

        <Link
          to={`/hirek/${item.slug}`}
          className="mt-4 inline-block self-start rounded text-sm font-medium text-wine-600 hover:underline"
        >
          Tovább olvasom
        </Link>
      </div>
    </article>
  );
};
