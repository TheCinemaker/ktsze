import { useEffect } from 'react';

/**
 * Dinamikus SEO Meta Címke Frissítő Komponens.
 * Beállítja az oldal egyedi böngészőcímét, meta leírását, Open Graph (szociális média megosztási) és Twitter Card meta adatait,
 * valamint a Canonical linket is szinkronizálja.
 */
export const SEO = ({ title, description, url, image, type = 'website' }) => {
  useEffect(() => {
    const baseTitle = 'Kőszegi Turisztikai Szövetség Egyesület';
    const siteUrl = 'https://ktsze.hu';
    
    const currentTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} | Hivatalos Turisztikai Portál`;
    const currentDescription = description || 'A Kőszegi Turisztikai Szövetség Egyesület hivatalos szakmai és tájékoztató portálja. Kőszeg szálláshelyeinek, vendéglátóinak, borászatainak összefogása, okosturisztikai hírek, munkacsoportok és a Digitális Kőszeg program.';
    const currentUrl = url ? `${siteUrl}${url}` : `${siteUrl}${window.location.pathname}`;
    const currentImage = image ? `${siteUrl}${image}` : `${siteUrl}/favicon.svg`;

    // 1. Böngésző Cím (Title)
    document.title = currentTitle;

    // Segédfüggvény a meta címkék frissítéséhez vagy létrehozásához
    const updateMeta = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const parts = selector.replace('meta[', '').replace(']', '').split('=');
        if (parts.length === 2) {
          const attrName = parts[0];
          const attrVal = parts[1].replace(/"/g, '');
          element.setAttribute(attrName, attrVal);
          document.head.appendChild(element);
        }
      }
      element.setAttribute(attribute, value);
    };

    // 2. Keresőmotor Leírás (Description)
    updateMeta('meta[name="description"]', 'content', currentDescription);

    // 3. Open Graph (Facebook / Messenger)
    updateMeta('meta[property="og:title"]', 'content', currentTitle);
    updateMeta('meta[property="og:description"]', 'content', currentDescription);
    updateMeta('meta[property="og:url"]', 'content', currentUrl);
    updateMeta('meta[property="og:image"]', 'content', currentImage);
    updateMeta('meta[property="og:type"]', 'content', type);

    // 4. Twitter Card
    updateMeta('meta[name="twitter:title"]', 'content', currentTitle);
    updateMeta('meta[name="twitter:description"]', 'content', currentDescription);
    updateMeta('meta[name="twitter:image"]', 'content', currentImage);

    // 5. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

  }, [title, description, url, image, type]);

  return null;
};
