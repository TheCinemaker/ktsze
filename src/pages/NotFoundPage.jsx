import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui';

export const NotFoundPage = () => (
  <div className="container-page py-20">
    <EmptyState
      icon={Compass}
      title="Ez az oldal nem található"
      description="Elképzelhető, hogy a hivatkozás elavult, vagy elírás történt a címben."
      action={
        <Link to="/" className="btn-primary">
          Vissza a főoldalra
        </Link>
      }
    />
  </div>
);
