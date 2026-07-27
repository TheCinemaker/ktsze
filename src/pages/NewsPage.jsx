import React, { useState, useMemo } from 'react';
import { Newspaper } from 'lucide-react';

import { listPublishedNews } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { PageHeader, EmptyState, LoadingBlock, ErrorBlock } from '../components/ui';
import { NewsCard } from '../components/public/NewsCard';

export const NewsPage = () => {
  const { data, loading, error, reload } = useAsyncData(listPublishedNews);
  const [category, setCategory] = useState('all');

  const items = useMemo(() => data || [], [data]);

  // A szűrő a tényleges adatból épül — nincs előre kitalált kategórialista.
  const categories = useMemo(() => {
    const found = [...new Set(items.map((i) => i.category).filter(Boolean))];
    return found.sort((a, b) => a.localeCompare(b, 'hu'));
  }, [items]);

  const visible = category === 'all' ? items : items.filter((i) => i.category === category);

  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Egyesületi tájékoztatás"
        title="Hírek és programok"
        description="Az egyesület közzétett közleményei, felhívásai és programjai."
      />

      {loading && <LoadingBlock />}
      {error && (
        <div className="mt-8">
          <ErrorBlock message={error} onRetry={reload} />
        </div>
      )}

      {!loading && !error && (
        <>
          {categories.length > 1 && (
            <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Szűrés kategória szerint">
              <button
                type="button"
                onClick={() => setCategory('all')}
                aria-pressed={category === 'all'}
                className={category === 'all' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
              >
                Összes
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={category === c ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            {visible.length === 0 ? (
              <EmptyState
                icon={Newspaper}
                title={items.length === 0 ? 'Még nincs közzétett hír' : 'Ebben a kategóriában nincs hír'}
                description={
                  items.length === 0
                    ? 'Az elnökség a belső felületen tud híreket, felhívásokat és programokat közzétenni. Amint az első bekerül, itt fog megjelenni.'
                    : 'Válassz másik kategóriát, vagy nézd meg az összes hírt.'
                }
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visible.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
