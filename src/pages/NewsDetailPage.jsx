import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Newspaper } from 'lucide-react';

import { supabase, unwrap } from '../lib/supabaseClient';
import { useAsyncData } from '../lib/useAsyncData';
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/ui';
import { coverUrl, formatDate } from '../lib/format';

const fetchBySlug = (slug) => async () =>
  unwrap(await supabase.from('news').select('*').eq('slug', slug).maybeSingle());

export const NewsDetailPage = () => {
  const { slug } = useParams();
  const { data: item, loading, error, reload } = useAsyncData(fetchBySlug(slug), [slug]);

  if (loading) return <LoadingBlock />;

  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorBlock message={error} onRetry={reload} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={Newspaper}
          title="Ez a hír nem található"
          description="Elképzelhető, hogy a hivatkozás elavult, vagy a bejegyzés még nincs közzétéve."
          action={
            <Link to="/hirek" className="btn-secondary">
              Vissza a hírekhez
            </Link>
          }
        />
      </div>
    );
  }

  const cover = coverUrl(item.cover_path);
  const published = formatDate(item.published_at || item.created_at);

  return (
    <article className="container-page py-12 sm:py-16">
      <Link to="/hirek" className="btn-ghost btn-sm -ml-3">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Vissza a hírekhez
      </Link>

      <header className="mt-6 max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {item.category && <span className="badge-wine">{item.category}</span>}
          {published && (
            <time dateTime={item.published_at || item.created_at} className="text-sm text-ink-500">
              {published}
            </time>
          )}
          {!item.is_published && <span className="badge-caution">Nem publikált — előnézet</span>}
        </div>

        <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{item.title}</h1>

        {item.excerpt && <p className="text-lg text-ink-600">{item.excerpt}</p>}
      </header>

      {cover && (
        <img
          src={cover}
          alt=""
          className="mt-8 w-full rounded-xl border border-sand-400 object-cover"
        />
      )}

      {item.body && (
        <div className="prose-body mt-8">
          {item.body.split(/\n{2,}/).map((paragraph, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <p key={index} className={index > 0 ? 'mt-4' : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </article>
  );
};
