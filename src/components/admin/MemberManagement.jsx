import React, { useState, useMemo } from 'react';
import { Search, Users, Pencil, Wallet, Trash2, FileCheck2, Flower2 } from 'lucide-react';

import {
  listMembers,
  listDues,
  listWorkgroups,
  listAllWorkgroupMemberships,
  updateMemberProfile,
  setMemberRoles,
  upsertDues,
  deleteMemberProfile,
  getDuesProofUrl
} from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLE_LABELS, assignableRoles } from '../../lib/permissions';
import {
  EmptyState,
  LoadingBlock,
  ErrorBlock,
  Modal,
  ConfirmDialog,
  TextInput,
  Select,
  Checkbox,
  Spinner
} from '../ui';

const CATEGORY_OPTIONS = [
  { value: 'Rendes tag', label: 'Rendes tag' },
  { value: 'Pártoló tag', label: 'Pártoló tag' },
  { value: 'Elnökségi tag', label: 'Elnökségi tag' }
];

const DUES_STATUS_OPTIONS = [
  { value: 'pending', label: 'Függőben' },
  { value: 'paid', label: 'Rendezve' },
  { value: 'overdue', label: 'Késedelmes' },
  { value: 'waived', label: 'Elengedve' }
];

const rolesOf = (member) => (Array.isArray(member.user_roles) ? member.user_roles.map((r) => r.role) : []);

/* -------------------------------------------------------------------------- */
/*  Adatlap és szerepkör szerkesztése                                          */
/* -------------------------------------------------------------------------- */

const EditMemberModal = ({ member, open, onClose, onSaved }) => {
  const { roles: actorRoles, profile: actor } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    full_name: member.full_name || '',
    phone: member.phone || '',
    member_category: member.member_category || '',
    custom_title: member.custom_title || '',
    service_location_name: member.service_location_name || ''
  });
  const [selectedRoles, setSelectedRoles] = useState(rolesOf(member));
  const [pending, setPending] = useState(false);

  const canManageRoles = actorRoles.some((r) => ['admin', 'president'].includes(r));
  const options = assignableRoles(actorRoles);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const toggleRole = (role) =>
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));

  const handleSave = async () => {
    setPending(true);
    try {
      await updateMemberProfile(member.id, form);
      if (canManageRoles) {
        await setMemberRoles(member.id, selectedRoles, actor?.id || null);
      }
      toast.success('A tag adatait elmentettük.');
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tag adatai"
      description={member.account_email}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Mégsem
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={pending}>
            {pending ? <Spinner label="Mentés…" className="text-white" /> : 'Mentés'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Teljes név" value={form.full_name} onChange={set('full_name')} />
          <TextInput label="Telefonszám" value={form.phone} onChange={set('phone')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tagsági kategória"
            value={form.member_category}
            onChange={set('member_category')}
            options={CATEGORY_OPTIONS}
            placeholder="Nincs beállítva"
          />
          <TextInput
            label="Szolgáltatás neve"
            value={form.service_location_name}
            onChange={set('service_location_name')}
          />
        </div>

        <TextInput
          label="Tisztség megnevezése"
          value={form.custom_title}
          onChange={set('custom_title')}
          hint="Például: Digitális Kőszeg alelnök. Ez csak kiírt megnevezés — jogosultságot a szerepkör ad."
        />

        {canManageRoles ? (
          <fieldset className="rounded-xl border border-sand-400 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-wine-600">
              Jogosultságok
            </legend>
            <div className="mt-1 space-y-2.5">
              {options.map((role) => (
                <Checkbox
                  key={role}
                  label={ROLE_LABELS[role]}
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-500">
              A szerepkör dönti el, mit érhet el a felhasználó. Az adatbázis ugyanezt érvényesíti, tehát a kliens
              megkerülésével sem lát többet.
            </p>
          </fieldset>
        ) : (
          <p className="text-xs text-ink-500">
            A szerepkörök módosítása rendszergazdai vagy elnöki jogosultságot igényel.
          </p>
        )}
      </div>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/*  Tagdíj rögzítése                                                           */
/* -------------------------------------------------------------------------- */

const DuesModal = ({ member, dues, open, onClose, onSaved }) => {
  const toast = useToast();
  const currentYear = new Date().getFullYear();
  const existing = dues.find((d) => d.profile_id === member.id && d.year === currentYear);

  const [form, setForm] = useState({
    year: existing?.year || currentYear,
    amount_huf: existing?.amount_huf ?? '',
    status: existing?.status || 'pending',
    due_date: existing?.due_date || '',
    payment_method: existing?.payment_method || '',
    notes: existing?.notes || ''
  });
  const [pending, setPending] = useState(false);
  const [openingProof, setOpeningProof] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSave = async () => {
    setPending(true);
    try {
      await upsertDues(member.id, form.year, form);
      toast.success('A tagdíjat elmentettük.');
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  const openProof = async () => {
    setOpeningProof(true);
    try {
      const url = await getDuesProofUrl(existing.proof_path);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOpeningProof(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tagdíj rögzítése"
      description={member.full_name || member.account_email}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Mégsem
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={pending}>
            {pending ? <Spinner label="Mentés…" className="text-white" /> : 'Mentés'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {existing?.proof_path && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-positive-300 bg-positive-50 p-3">
            <p className="text-sm text-ink-800">A tag feltöltött egy átutalási igazolást.</p>
            <button type="button" onClick={openProof} disabled={openingProof} className="btn-secondary btn-sm">
              <FileCheck2 className="h-4 w-4 text-positive-600" aria-hidden="true" />
              Megnyitom
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput label="Év" type="number" value={form.year} onChange={set('year')} required />
          <TextInput
            label="Összeg (Ft)"
            type="number"
            min="0"
            value={form.amount_huf}
            onChange={set('amount_huf')}
            hint="Üresen hagyható."
          />
          <Select label="Állapot" value={form.status} onChange={set('status')} options={DUES_STATUS_OPTIONS} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Fizetési határidő" type="date" value={form.due_date || ''} onChange={set('due_date')} />
          <TextInput label="Fizetés módja" value={form.payment_method} onChange={set('payment_method')} />
        </div>

        <TextInput label="Megjegyzés" value={form.notes} onChange={set('notes')} />
      </div>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/*  Lista                                                                      */
/* -------------------------------------------------------------------------- */

export const MemberManagement = () => {
  const { can } = useAuth();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [duesFor, setDuesFor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const members = useAsyncData(listMembers);
  const dues = useAsyncData(() => listDues(), [], { enabled: can('dues.view'), initialData: [] });
  const groups = useAsyncData(listWorkgroups, [], { initialData: [] });
  const wgMemberships = useAsyncData(listAllWorkgroupMemberships, [], { initialData: [] });

  const list = useMemo(() => members.data || [], [members.data]);
  const duesList = dues.data || [];

  // Kinek melyik munkacsoportja van (csak a jovahagyott tagsagok).
  const groupsByProfile = useMemo(() => {
    const map = new Map();
    (wgMemberships.data || [])
      .filter((m) => m.status === 'approved' && m.workgroups)
      .forEach((m) => {
        const current = map.get(m.profile_id) || [];
        current.push(m.workgroups);
        map.set(m.profile_id, current);
      });
    return map;
  }, [wgMemberships.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((m) => {
      if (groupFilter === 'none') {
        if ((groupsByProfile.get(m.id) || []).length > 0) return false;
      } else if (groupFilter !== 'all') {
        const mine = groupsByProfile.get(m.id) || [];
        if (!mine.some((g) => g.id === groupFilter)) return false;
      }
      if (!q) return true;
      return [m.full_name, m.account_email, m.service_location_name, m.custom_title]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q));
    });
  }, [list, query, groupFilter, groupsByProfile]);

  const currentYear = new Date().getFullYear();
  const duesOf = (memberId) => duesList.find((d) => d.profile_id === memberId && d.year === currentYear);

  const handleDelete = async () => {
    setDeletePending(true);
    try {
      await deleteMemberProfile(deleting.id);
      toast.success('A tag adatlapját töröltük.');
      await members.reload();
      setDeleting(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletePending(false);
    }
  };

  if (members.loading) return <LoadingBlock />;
  if (members.error) return <ErrorBlock message={members.error} onRetry={members.reload} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keresés név, e-mail vagy szolgáltatás szerint"
            aria-label="Keresés a tagok között"
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="member-group-filter" className="text-sm text-ink-600">
            Munkacsoport:
          </label>
          <select
            id="member-group-filter"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="input w-auto py-1.5 text-sm"
          >
            <option value="all">Mindegyik</option>
            <option value="none">Nincs csoportja</option>
            {(groups.data || []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <p className="text-sm text-ink-500">
            {filtered.length} / {list.length} tag
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Még nincs egyetlen regisztrált tag sem"
          description="A tagok a nyilvános oldalon regisztrálnak. A regisztráció után itt tudod beállítani a kategóriájukat és a jogosultságukat."
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nincs találat" description="Próbálj más keresőszót." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-sand-400 bg-white">
          <table className="w-full min-w-[64rem] border-collapse text-sm">
            <caption className="sr-only">Tagnyilvántartás</caption>
            <thead className="bg-sand-50">
              <tr className="border-b border-sand-400 text-left">
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                  Tag
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                  Kategória
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                  Jogosultság
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                  Munkacsoportok
                </th>
                {can('dues.view') && (
                  <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                    {currentYear}. tagdíj
                  </th>
                )}
                <th scope="col" className="px-4 py-3 text-right font-medium text-ink-600">
                  Műveletek
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => {
                const memberRoles = rolesOf(member);
                const memberDues = duesOf(member.id);

                return (
                  <tr key={member.id} className="border-b border-sand-300 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-900">{member.full_name || '— nincs név —'}</div>
                      <div className="text-xs text-ink-500">{member.account_email}</div>
                      {member.custom_title && (
                        <div className="mt-0.5 text-xs text-wine-600">{member.custom_title}</div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-ink-600">{member.member_category || '—'}</td>

                    <td className="px-4 py-3">
                      {memberRoles.length === 0 ? (
                        <span className="badge-caution">Nincs szerepkör</span>
                      ) : (
                        <span className="flex flex-wrap gap-1">
                          {memberRoles.map((role) => (
                            <span key={role} className="badge-neutral">
                              {ROLE_LABELS[role] || role}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {(groupsByProfile.get(member.id) || []).length === 0 ? (
                        <span className="text-xs text-ink-400">—</span>
                      ) : (
                        <span className="flex flex-wrap gap-1">
                          {(groupsByProfile.get(member.id) || []).map((g) => (
                            <span key={g.id} className="badge-wine">
                              <Flower2 className="h-3 w-3" aria-hidden="true" />
                              {g.name}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>

                    {can('dues.view') && (
                      <td className="px-4 py-3">
                        {!memberDues ? (
                          <span className="text-xs text-ink-500">Nincs kiírva</span>
                        ) : memberDues.status === 'paid' ? (
                          <span className="badge-positive">Rendezve</span>
                        ) : (
                          <span className="badge-caution">
                            {DUES_STATUS_OPTIONS.find((o) => o.value === memberDues.status)?.label ||
                              memberDues.status}
                          </span>
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {can('members.edit') && (
                          <button
                            type="button"
                            onClick={() => setEditing(member)}
                            className="btn-secondary btn-sm"
                            aria-label={`${member.full_name || member.account_email} szerkesztése`}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Adatlap
                          </button>
                        )}

                        {can('dues.manage') && (
                          <button
                            type="button"
                            onClick={() => setDuesFor(member)}
                            className="btn-secondary btn-sm"
                            aria-label={`${member.full_name || member.account_email} tagdíja`}
                          >
                            <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                            Tagdíj
                          </button>
                        )}

                        {can('members.delete') && (
                          <button
                            type="button"
                            onClick={() => setDeleting(member)}
                            className="btn-danger btn-sm"
                            aria-label={`${member.full_name || member.account_email} törlése`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditMemberModal
          key={editing.id}
          member={editing}
          open
          onClose={() => setEditing(null)}
          onSaved={members.reload}
        />
      )}

      {duesFor && (
        <DuesModal
          key={duesFor.id}
          member={duesFor}
          dues={duesList}
          open
          onClose={() => setDuesFor(null)}
          onSaved={dues.reload}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        pending={deletePending}
        title="Adatlap törlése"
        message={`Biztosan törlöd ${
          deleting?.full_name || deleting?.account_email
        } adatlapját? A tagdíjai és a feltöltött igazolásai is törlődnek. A művelet nem vonható vissza.`}
      />
    </div>
  );
};
