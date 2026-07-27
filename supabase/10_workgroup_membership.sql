-- =============================================================================
--  MUNKACSOPORT-JELENTKEZÉS JÓVÁHAGYÁSSAL
--
--  Mit ad hozzá:
--    - a workgroup_members tábla kap egy állapotot: pending / approved / rejected
--    - a bejelentkezett felhasználó jelentkezhet, és visszavonhatja a
--      jelentkezését, de saját magát NEM tudja jóváhagyni
--    - jóváhagyni a csoport vezetője vagy az elnökség tud
--    - a nyilvános oldalon látszik a taglétszám, de a tagok NEVE nem
--
--  ADATOT NEM TÖRÖL. Újrafuttatható.
--  Futtatás: Supabase Dashboard -> SQL Editor -> RUN (egészben).
-- =============================================================================

-- -----------------------------------------------------------------------------
--  1. Állapot típus
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'membership_status') then
    create type public.membership_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

-- -----------------------------------------------------------------------------
--  2. A tábla kibővítése
-- -----------------------------------------------------------------------------
alter table public.workgroup_members
  add column if not exists status       public.membership_status not null default 'pending',
  add column if not exists message      text,          -- amit a jelentkező írt magáról
  add column if not exists requested_at timestamptz not null default now(),
  add column if not exists decided_at   timestamptz,
  add column if not exists decided_by   uuid references auth.users(id) on delete set null,
  add column if not exists decision_note text;

-- A korábban (jóváhagyás előtti időkben) felvitt sorok maradjanak érvényesek:
update public.workgroup_members set status = 'approved' where status is null;

create index if not exists workgroup_members_status_idx
  on public.workgroup_members (workgroup_id, status);
create index if not exists workgroup_members_profile_idx
  on public.workgroup_members (profile_id);

-- -----------------------------------------------------------------------------
--  3. Jóváhagyási jog: a csoport vezetője VAGY a tartalomkezelők
--
--  SECURITY DEFINER, mert a workgroups táblát olvassa, amin RLS van.
-- -----------------------------------------------------------------------------
create or replace function public.can_decide_workgroup(target_workgroup uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    public.can_manage_content()
    or exists (
      select 1 from public.workgroups w
      where w.id = target_workgroup
        and w.leader_user_id = auth.uid()
    );
$$;

alter function public.can_decide_workgroup(uuid) owner to postgres;
grant execute on function public.can_decide_workgroup(uuid) to authenticated;

-- -----------------------------------------------------------------------------
--  4. Publikus taglétszám
--
--  A nyilvános oldalon a LÉTSZÁM látszik, a nevek nem — azok személyes adatok.
--  Ezért nem közvetlen táblaolvasás, hanem ez a függvény adja az összesítést.
-- -----------------------------------------------------------------------------
create or replace function public.workgroup_stats()
returns table (workgroup_id uuid, approved_count bigint, pending_count bigint)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    w.id,
    count(m.id) filter (where m.status = 'approved') as approved_count,
    count(m.id) filter (where m.status = 'pending')  as pending_count
  from public.workgroups w
  left join public.workgroup_members m on m.workgroup_id = w.id
  group by w.id;
$$;

alter function public.workgroup_stats() owner to postgres;
grant execute on function public.workgroup_stats() to anon, authenticated;

-- -----------------------------------------------------------------------------
--  5. RLS újraépítése a workgroup_members táblán
-- -----------------------------------------------------------------------------
alter table public.workgroup_members enable row level security;

drop policy if exists "csoporttag: olvasás"            on public.workgroup_members;
drop policy if exists "csoporttag: szerkesztés"        on public.workgroup_members;
drop policy if exists "csoporttag: saját jelentkezés"  on public.workgroup_members;
drop policy if exists "csoporttag: saját visszavonás"  on public.workgroup_members;
drop policy if exists "csoporttag: elbírálás"          on public.workgroup_members;
drop policy if exists "csoporttag: elnökségi olvasás"  on public.workgroup_members;

-- Olvasás: a saját jelentkezéseit mindenki látja...
create policy "csoporttag: olvasás" on public.workgroup_members
  for select to authenticated
  using (profile_id = auth.uid());

-- ...a teljes listát a csoportvezető és az elnökség.
create policy "csoporttag: elnökségi olvasás" on public.workgroup_members
  for select to authenticated
  using (public.is_board() or public.can_decide_workgroup(workgroup_id));

-- Jelentkezés: csak SAJÁT magát, és csak 'pending' állapotban.
-- Így senki nem tudja magát azonnal jóváhagyottként felvenni.
create policy "csoporttag: saját jelentkezés" on public.workgroup_members
  for insert to authenticated
  with check (profile_id = auth.uid() and status = 'pending');

-- Visszavonás / kilépés: a saját sorát törölheti.
create policy "csoporttag: saját visszavonás" on public.workgroup_members
  for delete to authenticated
  using (profile_id = auth.uid());

-- Elbírálás és minden más módosítás: csoportvezető vagy elnökség.
create policy "csoporttag: elbírálás" on public.workgroup_members
  for all to authenticated
  using (public.can_decide_workgroup(workgroup_id))
  with check (public.can_decide_workgroup(workgroup_id));

-- -----------------------------------------------------------------------------
--  6. A döntés időpontját és a döntéshozót a rendszer állítja be
-- -----------------------------------------------------------------------------
create or replace function public.stamp_membership_decision()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.status is distinct from old.status and new.status <> 'pending' then
    new.decided_at := now();
    new.decided_by := auth.uid();
  end if;
  return new;
end $$;

alter function public.stamp_membership_decision() owner to postgres;

drop trigger if exists workgroup_members_decision on public.workgroup_members;
create trigger workgroup_members_decision
  before update on public.workgroup_members
  for each row execute function public.stamp_membership_decision();

-- -----------------------------------------------------------------------------
--  7. Ellenőrzés
-- -----------------------------------------------------------------------------
select
  policyname as szabaly,
  cmd        as muvelet,
  roles      as szerepek
from pg_policies
where schemaname = 'public' and tablename = 'workgroup_members'
order by cmd, policyname;
