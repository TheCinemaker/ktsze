import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Plus, Pin, Trash2, CheckCircle2, Clock, Sparkles, Tag, User, Calendar, Rocket } from 'lucide-react';
import { listBoardIdeas, createBoardIdea, updateBoardIdea, deleteBoardIdea, listWorkgroups, createWorkgroupProject } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal, TextInput, TextArea, Select, Spinner, ConfirmDialog } from '../ui';
import { supabase } from '../../lib/supabaseClient';

const CATEGORY_OPTIONS = [
  { value: 'Általános ötlet', label: 'Általános ötlet' },
  { value: 'Városi Turizmus', label: 'Városi Turizmus & Marketing' },
  { value: 'Pályázat & Finanszírozás', label: 'Pályázat & Finanszírozás' },
  { value: 'Rendezvény & Programok', label: 'Rendezvény & Programok' },
  { value: 'Munkacsoport Kezdeményezés', label: 'Munkacsoport Kezdeményezés' }
];

const STATUS_LABELS = {
  idea: { label: '💡 Új Ötlet', bg: 'bg-amber-50 border-amber-300 text-amber-900' },
  in_progress: { label: '⚙️ Folyamatban', bg: 'bg-blue-50 border-blue-300 text-blue-900' },
  completed: { label: '✅ Megvalósítva', bg: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
  converted: { label: '🚀 Munkacsoport Projekt', bg: 'bg-purple-50 border-purple-300 text-purple-900' }
};

export const BoardIdeasAdmin = () => {
  const { profile } = useAuth();
  const toast = useToast();

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [workgroups, setWorkgroups] = useState([]);
  const [convertIdea, setConvertIdea] = useState(null);
  const [targetWorkgroupId, setTargetWorkgroupId] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Általános ötlet'
  });

  const loadData = useCallback(async () => {
    try {
      const res = await listBoardIdeas();
      setIdeas(res || []);
    } catch (err) {
      toast.error('Hiba az ötletek betöltésekor: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    listWorkgroups().then((data) => {
      const active = (data || []).filter((g) => g.is_active);
      setWorkgroups(active);
      if (active.length > 0) setTargetWorkgroupId(active[0].id);
    });
  }, []);

  const openConvertModal = (idea) => {
    setConvertIdea(idea);
    setProjectTitle(idea.title);
    setProjectDescription(idea.description || '');
  };

  const handleConvertToProject = async () => {
    if (!targetWorkgroupId) {
      toast.info('Kérjük, válassz egy munkacsoportot!');
      return;
    }
    if (!projectTitle.trim()) {
      toast.info('Kérjük, ad meg a projekt címét!');
      return;
    }

    setPending(true);
    try {
      await createWorkgroupProject({
        workgroup_id: targetWorkgroupId,
        title: projectTitle,
        description: projectDescription,
        status: 'active',
        created_by: profile?.id
      });

      await updateBoardIdea(convertIdea.id, { status: 'converted' });
      toast.success('🚀 Az ötlet sikeresen átalakítva hivatalos Munkacsoport Projektté!');
      setConvertIdea(null);
      await loadData();
    } catch (err) {
      toast.error('Hiba a projekt létrehozásakor: ' + err.message);
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    loadData();

    // Realtime élő frissítés elnökségi tagok között!
    const channel = supabase
      .channel('realtime_board_ideas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'board_ideas' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.info('Kérjük, add meg az ötlet címét!');
      return;
    }

    setPending(true);
    try {
      await createBoardIdea({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        author_name: profile?.full_name || 'Elnökségi Tag',
        author_id: profile?.id || null
      });

      toast.success('🎉 Ötlet sikeresen rögzítve az Elnökségi Jegyzetfalon!');
      setModalOpen(false);
      setFormData({ title: '', description: '', category: 'Általános ötlet' });
      await loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  const handleTogglePin = async (idea) => {
    try {
      await updateBoardIdea(idea.id, { is_pinned: !idea.is_pinned });
      toast.info(idea.is_pinned ? 'Kitűzés eltávolítva.' : '📌 Ötlet kitűzve az oldal tetejére!');
      await loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (idea, newStatus) => {
    try {
      await updateBoardIdea(idea.id, { status: newStatus });
      toast.success('Státusz frissítve!');
      await loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setPending(true);
    try {
      await deleteBoardIdea(deleteId);
      toast.info('Ötlet törölve.');
      setDeleteId(null);
      await loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  // Szűrt ötletek listája
  const filteredIdeas = ideas.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus === 'pinned') return item.is_pinned;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* FEJLÉC ÉS GOMB ZÓNA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-wine-900 via-wine-800 to-wine-950 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Lightbulb className="h-6 w-6 text-amber-300 animate-pulse" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold">Elnökségi Ötletelő &amp; Jegyzetfal</h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-sand-200 max-w-2xl leading-relaxed">
            Zárt felület az elnökségi tagok számára. Rögzítsd gondolataidat, ötleteidet vagy a következő megbeszélés témáit, hogy semmi se vesszen el!
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-ink-950 font-bold flex items-center justify-center gap-2 shadow-lg shrink-0 transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5 text-ink-950 stroke-[3]" />
          <span>Új Ötlet Hozzáadása</span>
        </button>
      </div>

      {/* SZŰRŐK ÉS STATISZTIKA */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-sand-100 border border-sand-300">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`btn-sm py-1 px-3 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'all' ? 'bg-wine-700 text-white shadow-sm' : 'bg-white text-ink-700 hover:bg-sand-200'
            }`}
          >
            Összes ({ideas.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('pinned')}
            className={`btn-sm py-1 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterStatus === 'pinned' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Pin className="h-3.5 w-3.5 fill-current" />
            Kitűzöttek ({ideas.filter((i) => i.is_pinned).length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('idea')}
            className={`btn-sm py-1 px-3 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'idea' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-ink-700 hover:bg-sand-200'
            }`}
          >
            💡 Új ({ideas.filter((i) => i.status === 'idea').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('in_progress')}
            className={`btn-sm py-1 px-3 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'in_progress' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-ink-700 hover:bg-sand-200'
            }`}
          >
            ⚙️ Folyamatban ({ideas.filter((i) => i.status === 'in_progress').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`btn-sm py-1 px-3 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'completed' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-ink-700 hover:bg-sand-200'
            }`}
          >
            ✅ Megvalósítva ({ideas.filter((i) => i.status === 'completed').length})
          </button>
        </div>

        <div className="w-full sm:w-auto">
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={[{ value: 'all', label: 'Minden Kategória' }, ...CATEGORY_OPTIONS]}
            className="text-xs"
          />
        </div>
      </div>

      {/* ÖTLETEK LISTÁJA */}
      {loading ? (
        <div className="py-12 text-center text-ink-500 font-medium">Ötletek betöltése…</div>
      ) : filteredIdeas.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-sand-300 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="font-bold text-ink-900 text-base">Még nincs rögzített ötlet ebben a nézetben</h3>
          <p className="text-xs text-ink-500 max-w-md mx-auto">
            Kattints az <strong>„Új Ötlet Hozzáadása”</strong> gombra a képernyő tetején, és írd meg az első gondolatot!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => {
            const statusConfig = STATUS_LABELS[idea.status] || STATUS_LABELS.idea;
            return (
              <div
                key={idea.id}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 ${
                  idea.is_pinned
                    ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-200 shadow-md'
                    : 'bg-white border-sand-300 hover:border-sand-400 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  {/* KÁRTYA FEJLÉC */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sand-200 text-ink-700">
                      <Tag className="h-3 w-3 text-wine-700" />
                      {idea.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleTogglePin(idea)}
                      title={idea.is_pinned ? 'Kitűzés megszüntetése' : '📌 Ötlet kitűzése a tetejére'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        idea.is_pinned
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-ink-400 hover:bg-sand-100 hover:text-amber-600'
                      }`}
                    >
                      <Pin className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  {/* CÍM ÉS LEÍRÁS */}
                  <div>
                    <h3 className="font-display font-bold text-base text-ink-900 leading-snug break-words">
                      {idea.title}
                    </h3>
                    {idea.description && (
                      <p className="mt-1.5 text-xs text-ink-600 leading-relaxed whitespace-pre-line break-words max-h-36 overflow-y-auto custom-scrollbar">
                        {idea.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* KÁRTYA LÁBLÉC ÉS AKCIÓK */}
                <div className="mt-4 pt-3 border-t border-sand-200 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-ink-500">
                    <span className="flex items-center gap-1 font-medium text-ink-800">
                      <User className="h-3 w-3 text-wine-600" />
                      {idea.author_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(idea.created_at).toLocaleDateString('hu-HU')}
                    </span>
                  </div>

                  {/* PROJEKTTÉ ÁTALAKÍTÓ AKCIÓ GOMB */}
                  <div className="pt-2 border-t border-sand-200">
                    {idea.status === 'converted' ? (
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-800 bg-purple-50 p-2 rounded-lg border border-purple-200">
                        <span className="flex items-center gap-1.5">
                          <Rocket className="h-3.5 w-3.5 text-purple-600" />
                          Munkacsoport Projektté Alakítva
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openConvertModal(idea)}
                        className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-700 to-wine-800 hover:from-purple-800 hover:to-wine-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98"
                      >
                        <Rocket className="h-3.5 w-3.5 text-amber-300" />
                        <span>Átalakítás Munkacsoport Projektté</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {/* STÁTUSZ VÁLASZTÓ GOMBOK */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idea, 'idea')}
                        title="Beállítás: 💡 Új Ötlet"
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          idea.status === 'idea'
                            ? 'bg-amber-500 text-white ring-1 ring-amber-400'
                            : 'bg-sand-100 text-ink-600 hover:bg-sand-200'
                        }`}
                      >
                        💡 Új
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idea, 'in_progress')}
                        title="Beállítás: ⚙️ Folyamatban"
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          idea.status === 'in_progress'
                            ? 'bg-blue-600 text-white ring-1 ring-blue-500'
                            : 'bg-sand-100 text-ink-600 hover:bg-sand-200'
                        }`}
                      >
                        ⚙️ Folyamatban
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idea, 'completed')}
                        title="Beállítás: ✅ Megvalósítva"
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          idea.status === 'completed'
                            ? 'bg-emerald-600 text-white ring-1 ring-emerald-500'
                            : 'bg-sand-100 text-ink-600 hover:bg-sand-200'
                        }`}
                      >
                        ✅ Megvalósítva
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteId(idea.id)}
                      className="p-1 rounded text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Ötlet törlése"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PROJEKTTÉ ÁTALAKÍTÓ MODAL */}
      <Modal
        open={Boolean(convertIdea)}
        onClose={() => setConvertIdea(null)}
        title="🚀 Ötlet Átalakítása Munkacsoport Projektté"
        description="Ezzel az akcióval az ötletből éles Munkacsoport Projekt jön létre, amit a csoport tagjai feladatokra bonthatnak!"
        size="md"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setConvertIdea(null)} disabled={pending}>
              Mégsem
            </button>
            <button type="button" className="btn-primary bg-purple-700 hover:bg-purple-800" onClick={handleConvertToProject} disabled={pending}>
              {pending ? <Spinner label="Létrehozás…" className="text-white" /> : '🚀 Projekt Létrehozása'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Cél Munkacsoport"
            required
            value={targetWorkgroupId}
            onChange={(e) => setTargetWorkgroupId(e.target.value)}
            options={workgroups.map((g) => ({ value: g.id, label: g.name }))}
            hint="Válaszd ki, melyik szakmai munkacsoport égisze alatt valósuljon meg ez a projekt!"
          />

          <TextInput
            label="Projekt Címe"
            required
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
          />

          <TextArea
            label="Projekt Leírása / Céljai"
            rows={4}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
        </div>
      </Modal>

      {/* ÚJ ÖTLET MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="💡 Új Elnökségi Ötlet / Gondolat Rögzítése"
        description="Ez a jegyzet kizárólag az elnökségi felületen jelenik meg."
        size="md"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)} disabled={pending}>
              Mégsem
            </button>
            <button type="button" className="btn-primary" onClick={handleCreate} disabled={pending}>
              {pending ? <Spinner label="Mentés…" className="text-white" /> : 'Ötlet Mentése'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <TextInput
            label="Ötlet / Gondolat Címe"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Pl. Új turisztikai kiadvány nyomtatása tavaszra"
          />

          <Select
            label="Kategória"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={CATEGORY_OPTIONS}
          />

          <TextArea
            label="Részletes leírás / Gondolatok"
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Írd le a részleteket, mit érdemes megbeszélni a következő elnökségi ülésen…"
          />
        </form>
      </Modal>

      {/* TÖRLÉS MEGERŐSÍTŐ */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        pending={pending}
        title="Ötlet törlése"
        message="Biztosan törölni szeretnéd ezt az ötletet az Elnökségi Jegyzetfalról?"
        confirmLabel="Törlés"
      />
    </div>
  );
};
