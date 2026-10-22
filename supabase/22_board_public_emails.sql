-- =============================================================================
--  22. Elnökségi tagok nyilvános e-mail címei — hivatalos @ktsze.hu címekre
--
--  Futtatás: Supabase Dashboard -> SQL Editor. Idempotens, bármikor újrafuttatható.
--  Csak a MÁR LÉTEZŐ profilokat frissíti (név szerint). Akinek még nincs
--  profilja a DB-ben, annál a kliensoldali tartalék (src/lib/db.js BOARD_FALLBACK)
--  mutatja ugyanezt a @ktsze.hu címet.
--
--  A címek forrása a Cloudflare Email Routing beállítás (ktsze.hu).
-- =============================================================================

update public.profiles set public_email = 'g.drescher@ktsze.hu' where full_name = 'Drescher Gábor';
update public.profiles set public_email = 's.avar@ktsze.hu'      where full_name = 'Avar Szilveszter';
update public.profiles set public_email = 'p.farkas@ktsze.hu'    where full_name = 'Farkas Péter';
update public.profiles set public_email = 'a.szalok@ktsze.hu'    where full_name = 'Kovács-Szalók Adrienn';
update public.profiles set public_email = 'r.voros@ktsze.hu'     where full_name = 'Vörös Róbert';
