import { useEffect } from 'react';

/**
 * Dinamikus SEO Meta Címke Frissítő Komponens.
 * Beállítja az oldal egyedi böngészőcímét és meta leírását a Google kereső számára.
 */
export const SEO = ({ title, description }) => {
  useEffect(() => {
    const baseTitle = 'Kőszegi Turisztikai Szövetség Egyesület';
    if (title) {
      document.title = `${title} | ${baseTitle}`;
    } else {
      document.title = `${baseTitle} | Hivatalos Turisztikai Portál`;
    }

    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return null;
};
