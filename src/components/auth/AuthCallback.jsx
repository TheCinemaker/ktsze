import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

/*
  A Supabase e-mail linkjei (megerősítés, jelszó-visszaállítás, meghívó) a
  Site URL-re dobnak vissza, a tokent pedig az URL hash részébe teszik:

      https://.../#access_token=...&type=signup

  A supabase-js a `detectSessionInUrl: true` beállítás miatt magától kiolvassa
  és beváltja ezt. Két dolgot viszont nem tesz meg helyettünk:

    1. nem takarítja el a hash-t a címsorból — így a token ott marad, és a
       felhasználó véletlenül tovább is küldheti valakinek,
    2. nem mond semmit a felhasználónak arról, hogy mi történt.

  Ez a komponens mindkettőt elintézi. Nem jelenít meg semmit.
*/

const parseHash = (hash) => {
  const params = new URLSearchParams((hash || '').replace(/^#/, ''));
  return {
    hasToken: params.has('access_token'),
    type: params.get('type'),
    error: params.get('error'),
    errorCode: params.get('error_code'),
    errorDescription: params.get('error_description')
  };
};

const ERROR_MESSAGES = {
  otp_expired: 'A link lejárt. Kérj újat — a megerősítő és a jelszó-visszaállító linkek csak korlátozott ideig érvényesek.',
  access_denied: 'A link már fel lett használva, vagy érvénytelen.'
};

export const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  // Egy hash-t csak egyszer dolgozunk fel (StrictMode kétszer futtatja az effektet).
  const handled = useRef(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2 || handled.current) return;

    const { hasToken, type, error, errorCode, errorDescription } = parseHash(hash);
    if (!hasToken && !error) return;

    handled.current = true;

    // A tokent azonnal tüntessük el a címsorból, hogy ne maradjon ott.
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (error) {
      toast.error(
        ERROR_MESSAGES[errorCode] || errorDescription?.replace(/\+/g, ' ') || 'A hivatkozás nem érvényes.',
        { title: 'A link nem működött' }
      );
      navigate('/belepes', { replace: true });
      return;
    }

    if (type === 'recovery') {
      // A jelszó-visszaállításnál a belépőoldal új jelszó űrlapot mutat.
      navigate('/belepes', { replace: true });
      return;
    }

    if (type === 'signup' || type === 'invite' || type === 'magiclink') {
      toast.success('Az e-mail címed megerősítve. Üdv a rendszerben!');
      navigate('/', { replace: true });
      return;
    }

    // Ismeretlen típus, de van érvényes munkamenet — ne hagyjuk a főoldalon.
    if (isAuthenticated) navigate('/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, isAuthenticated]);

  return null;
};
