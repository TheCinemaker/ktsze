import React from 'react';
import { FolderLock } from 'lucide-react';

import { listDocuments } from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, LoadingBlock, ErrorBlock } from '../ui';
import { DocumentList } from '../public/DocumentList';

/*
  A tag azt a dokumentumkészletet látja, amit a szerepköre megenged. A szűrés
  nem itt dől el: az RLS a `documents` táblán akkor sem adja ki az elnökségi
  iratokat, ha a kliens elkérné őket.

  A korábbi verzióban a feltöltés csak a fájl NEVÉT rögzítette, magát a fájlt
  nem tárolta el, a letöltés pedig egy alert volt. Most valódi Storage-fájlok
  nyílnak meg aláírt, időlimitált linken.
*/

export const DocumentVault = () => {
  const { can } = useAuth();

  // A tag a tagi szintet látja; az elnökségi tagok a belső szintet is.
  const levels = can('documents.viewBoard')
    ? ['public', 'members', 'board', 'admin']
    : ['public', 'members'];

  const { data, loading, error, reload } = useAsyncData(() => listDocuments(levels), [levels.join(',')]);
  const documents = data || [];

  return (
    <div className="space-y-5">
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {!loading && !error && (
        <DocumentList
          documents={documents}
          showAccessLevel
          emptyState={
            <EmptyState
              icon={FolderLock}
              title="Az irattár még üres"
              description="Ide a közgyűlési jegyzőkönyvek, szabályzatok és beszámolók kerülnek. A dokumentumokat az elnökség tölti fel."
            />
          }
        />
      )}
    </div>
  );
};
