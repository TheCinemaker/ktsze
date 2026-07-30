import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Adatbetöltés Supabase-ből, hibakezeléssel.
 *
 * Állapotok, és a felületnek mindet kezelnie kell:
 *   loading    -> az ELSŐ töltés folyik, még nincs mit mutatni  ->  vázlat/spinner
 *   refreshing -> már van adat, a háttérben frissül  ->  a lista MARAD a helyén
 *   error      -> a betöltés elhasalt, van mit kiírni a felhasználónak
 *   data       -> megjött, de lehet üres tömb  ->  üres állapot kell, nem kitalált tartalom
 *   reload     -> újratöltés mentés után
 *
 * A `loading` szándékosan csak az első körben igaz: ha minden újratöltésre
 * spinnerre cserélnénk a kész listát (mentés után, realtime eseménynél), a
 * felület villogna, és a művelet sokkal lassabbnak tűnne, mint amennyi.
 *
 * @param {() => Promise<any>} fetcher
 * @param {any[]} deps
 * @param {{enabled?: boolean, initialData?: any}} options
 */
export const useAsyncData = (fetcher, deps = [], { enabled = true, initialData = null } = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // A legfrissebb fetcher referenciája, hogy ne kelljen a deps-be tenni.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // A `data` aktuális értéke a run() belsejéből, a callback újraépítése nélkül.
  const hasData = useRef(initialData !== null);

  // Csak a legutolsó kérés eredményét fogadjuk el (verseny elkerülése).
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const id = requestId.current + 1;
    requestId.current = id;

    // Ha már van kész adat, azt a helyén hagyjuk, és csak a `refreshing`-et
    // jelezzük — így a lista nem tűnik el minden újratöltésnél.
    if (hasData.current) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (!mounted.current || requestId.current !== id) return;
      hasData.current = result !== null && result !== undefined;
      setData(result);
    } catch (err) {
      if (!mounted.current || requestId.current !== id) return;
      setError(err.message || 'Nem sikerült betölteni az adatokat.');
    } finally {
      if (mounted.current && requestId.current === id) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    run();
    // A deps-et a hívó adja meg; a run maga stabil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, ...deps]);

  return { data, loading, refreshing, error, reload: run, setData };
};

/**
 * Mentés/törlés futtatása: közben `pending`, végén toast.
 * A `catch` ág SOHA nem néma — ez volt a korábbi verzió fő hibája, ahol a
 * "Sikeres mentés!" akkor is felugrott, ha az adatbázis visszadobta a kérést.
 *
 * @param {(...args:any[]) => Promise<any>} action
 * @param {{toast: any, success?: string, onDone?: (result:any)=>void}} options
 */
export const useAction = (action, { toast, success, onDone } = {}) => {
  const [pending, setPending] = useState(false);

  const execute = useCallback(
    async (...args) => {
      setPending(true);
      try {
        const result = await action(...args);
        if (success && toast) toast.success(success);
        if (onDone) await onDone(result);
        return { ok: true, result };
      } catch (err) {
        if (toast) toast.error(err.message || 'A művelet nem sikerült.');
        else console.error(err);
        return { ok: false, error: err };
      } finally {
        setPending(false);
      }
    },
    [action, toast, success, onDone]
  );

  return { execute, pending };
};
