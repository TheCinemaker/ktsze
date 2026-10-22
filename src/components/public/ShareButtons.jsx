import React, { useState } from 'react';
import { Link2, Check, Share2 } from 'lucide-react';

/** Facebook „f" — a lucide márkaikonok megszűntek, ezért saját, egyszerű SVG. */
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
  </svg>
);

const btnCls =
  'inline-flex h-7 w-7 items-center justify-center rounded-full border border-sand-300 text-wine-700 transition-colors hover:border-wine-400 hover:bg-wine-50';

/**
 * Megosztás gombok: Facebook, link másolása, és (ha a böngésző támogatja)
 * natív megosztás. A `url` a megosztandó cím; ha nincs, az aktuális oldal.
 */
export const ShareButtons = ({ url, title = '', showLabel = true, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const openShare = (href) =>
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=520');

  const shareFacebook = () =>
    openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* csendes: a felhasználó a Facebook gombot is használhatja */
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url: shareUrl });
    } catch {
      /* a felhasználó megszakította — nincs teendő */
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {showLabel && <span className="text-xs font-medium text-ink-400">Megosztás:</span>}

      <button type="button" onClick={shareFacebook} className={btnCls} aria-label="Megosztás Facebookon" title="Megosztás Facebookon">
        <FacebookIcon className="h-3.5 w-3.5" />
      </button>

      <button type="button" onClick={copyLink} className={btnCls} aria-label="Hivatkozás másolása" title="Hivatkozás másolása">
        {copied ? <Check className="h-3.5 w-3.5 text-positive-600" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>

      {canNativeShare && (
        <button type="button" onClick={nativeShare} className={btnCls} aria-label="Megosztás" title="Megosztás…">
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
