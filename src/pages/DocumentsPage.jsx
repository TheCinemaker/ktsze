import React from 'react';
import { FileText } from 'lucide-react';

import { listDocuments } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { PageHeader, EmptyState, LoadingBlock, ErrorBlock } from '../components/ui';
import { DocumentList } from '../components/public/DocumentList';

export const DocumentsPage = () => {
  const { data, loading, error, reload } = useAsyncData(() => listDocuments(['public']));
  const documents = data || [];

  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Nyilvánosság"
        title="Nyilvános dokumentumok"
        description="Az egyesület nyilvánosan közzétett iratai. A tagoknak szóló belső anyagok a tagi portálon érhetők el."
      />

      <div className="mt-8">
        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error} onRetry={reload} />}

        {!loading && !error && (
          <DocumentList
            documents={documents}
            emptyState={
              <EmptyState
                icon={FileText}
                title="Még nincs közzétett dokumentum"
                description="A dokumentumokat az elnökség tölti fel a belső felületen, és ott állítja be, melyik legyen nyilvános."
              />
            }
          />
        )}
      </div>
    </div>
  );
};
