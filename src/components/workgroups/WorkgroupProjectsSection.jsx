import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Clock, MessageSquare, Paperclip, Send, Image, FileText, FolderKanban, User } from 'lucide-react';
import { 
  listProjectsByWorkgroup, 
  createWorkgroupProject, 
  listProjectTasks, 
  createProjectTask, 
  updateTaskStatus, 
  listProjectComments, 
  addProjectComment, 
  uploadWorkgroupAttachment 
} from '../../lib/db';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Spinner, EmptyState } from '../ui';
import { formatDate } from '../../lib/format';

export const WorkgroupProjectsSection = ({ workgroupId }) => {
  const { profile, isAuthenticated } = useAuth();
  const toast = useToast();
  
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Új projekt form modal állapota
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  // Kiválasztott projekt adatai
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  // Új megjegyzés állapota
  const [commentText, setCommentText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  // 1. Projektek betöltése
  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await listProjectsByWorkgroup(workgroupId);
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      console.error('[Projects] Hiba a projektek betöltésekor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workgroupId) loadProjects();
  }, [workgroupId]);

  // 2. Kiválasztott projekt feladatainak és megjegyzéseinek betöltése + Realtime szinkron
  const loadProjectDetails = async (projId) => {
    if (!projId) return;
    try {
      const [taskData, commentData] = await Promise.all([
        listProjectTasks(projId),
        listProjectComments(projId)
      ]);
      setTasks(taskData);
      setComments(commentData);
    } catch (err) {
      console.error('[ProjectDetails] Hiba a feladatok/megjegyzések betöltésekor:', err);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);

      // Realtime előfizetés a feladatokra és megjegyzésekre
      const channel = supabase
        .channel(`project-${selectedProjectId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'project_tasks', filter: `project_id=eq.${selectedProjectId}` },
          () => loadProjectDetails(selectedProjectId)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'project_comments', filter: `project_id=eq.${selectedProjectId}` },
          () => loadProjectDetails(selectedProjectId)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedProjectId]);

  // Új projekt létrehozása
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;
    try {
      setCreatingProject(true);
      const newProj = await createWorkgroupProject({
        workgroup_id: workgroupId,
        title: projectTitle,
        description: projectDesc,
        created_by: profile?.id
      });
      toast.success('Projekt sikeresen elindítva!');
      setProjectTitle('');
      setProjectDesc('');
      setShowNewProject(false);
      await loadProjects();
      setSelectedProjectId(newProj.id);
    } catch (err) {
      toast.error(`Nem sikerült a projekt létrehozása: ${err.message}`);
    } finally {
      setCreatingProject(false);
    }
  };

  // Új feladat hozzáadása
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProjectId) return;
    try {
      await createProjectTask({
        project_id: selectedProjectId,
        title: newTaskTitle,
        due_date: newTaskDate || null,
        created_by: profile?.id
      });
      setNewTaskTitle('');
      setNewTaskDate('');
      await loadProjectDetails(selectedProjectId);
      toast.success('Feladat hozzáadva!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Feladat státusz váltása
  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await updateTaskStatus(task.id, nextStatus);
      await loadProjectDetails(selectedProjectId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Fájl kiválasztása csatolmányként
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFile(true);
      const uploaded = await uploadWorkgroupAttachment(file);
      setAttachment(uploaded);
      toast.info(`Fájl csatolva: ${file.name}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  // Megjegyzés / Jegyzet küldése
  const handleSendComment = async (e) => {
    e.preventDefault();
    if ((!commentText.trim() && !attachment) || !selectedProjectId) return;
    try {
      setSendingComment(true);
      await addProjectComment({
        project_id: selectedProjectId,
        user_id: profile?.id,
        comment_text: commentText || (attachment ? `Csatolt fájl: ${attachment.name}` : ''),
        attachment_url: attachment?.url || null,
        attachment_name: attachment?.name || null
      });
      setCommentText('');
      setAttachment(null);
      await loadProjectDetails(selectedProjectId);
      toast.success('Bejegyzés közzétéve!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingComment(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      {/* Fejléc és Projektválasztó Fülek */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-300 pb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-ink-900 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-wine-600" />
            Munkacsoport Projektek &amp; Feladatok
          </h3>
          <p className="text-xs text-ink-600 mt-0.5">
            A csoport folyamatban lévő kezdeményezései, feladatlistái és ötletelő jegyzetei.
          </p>
        </div>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => setShowNewProject(true)}
            className="btn-primary btn-sm rounded-xl font-bold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Új Projekt Indítása
          </button>
        )}
      </div>

      {/* Új Projekt Létrehozása Modal */}
      {showNewProject && (
        <form onSubmit={handleCreateProject} className="card p-6 bg-sand-50/90 space-y-4 border-wine-300">
          <h4 className="font-display text-lg font-bold text-wine-900">Új Projekt Indítása</h4>
          <div>
            <label className="label">Projekt Címe *</label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="pl. VisitKőszeg Mobilapp 2026 vagy QR-kódos Információs Táblák"
              className="input"
            />
          </div>

          <div>
            <label className="label">Leírás &amp; Célkitűzés</label>
            <textarea
              rows={3}
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              placeholder="A projekt rövid leírása, hogy mit szeretnénk megvalósítani..."
              className="input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewProject(false)}
              className="btn-secondary btn-sm"
            >
              Mégse
            </button>
            <button type="submit" disabled={creatingProject} className="btn-primary btn-sm">
              {creatingProject ? 'Létrehozás...' : 'Projekt Indítása'}
            </button>
          </div>
        </form>
      )}

      {/* Projektek Üres Állapot */}
      {projects.length === 0 && !showNewProject && (
        <EmptyState
          icon={FolderKanban}
          title="Még nincs indított projekt"
          description="A munkacsoport tagjai hozzhatnak létre új projekteket, feladatlistákat és ötletelő bejegyzéseket."
        />
      )}

      {/* Projekt Választó Gombok */}
      {projects.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {projects.map((proj) => (
            <button
              key={proj.id}
              type="button"
              onClick={() => setSelectedProjectId(proj.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                selectedProjectId === proj.id
                  ? 'bg-wine-700 text-white border-wine-700 shadow-md'
                  : 'bg-white text-ink-700 border-sand-300 hover:bg-sand-100'
              }`}
            >
              {proj.title}
            </button>
          ))}
        </div>
      )}

      {/* Kiválasztott Projekt Részletei (Feladatok + Activity Feed) */}
      {selectedProject && (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Bal Oszlop: Feladatok & Checklist (7 oszlop) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card p-6 bg-white space-y-4">
              <div>
                <h4 className="font-display text-xl font-bold text-ink-900">{selectedProject.title}</h4>
                {selectedProject.description && (
                  <p className="text-sm text-ink-600 mt-1">{selectedProject.description}</p>
                )}
                {selectedProject.profiles?.full_name && (
                  <p className="text-xs text-wine-700 font-medium mt-2">
                    Kezdeményező: {selectedProject.profiles.full_name}
                  </p>
                )}
              </div>

              {/* Feladat Hozzáadása Form */}
              {isAuthenticated && (
                <form onSubmit={handleAddTask} className="flex flex-wrap gap-2 pt-2 border-t border-sand-200">
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="+ Új feladat hozzáadása..."
                    className="input flex-1 py-1.5 text-xs"
                  />
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="input w-36 py-1.5 text-xs"
                  />
                  <button type="submit" className="btn-primary btn-sm font-bold">
                    Hozzáadás
                  </button>
                </form>
              )}

              {/* Feladatok Listája */}
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-ink-500">Feladatlista:</h5>
                {tasks.length === 0 ? (
                  <p className="text-xs italic text-ink-400 py-2">Még nincsenek feladatok a projekthez.</p>
                ) : (
                  tasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTaskStatus(t)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        t.status === 'done'
                          ? 'bg-emerald-50/60 border-emerald-200 text-ink-500 line-through'
                          : 'bg-sand-50/60 border-sand-300 text-ink-900 hover:border-wine-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {t.status === 'done' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-sand-400 shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">{t.title}</span>
                      </div>

                      {t.due_date && (
                        <div className="flex items-center gap-1 text-xs text-ink-500 shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{t.due_date}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Jobb Oszlop: Közösségi Ötletelő Chat & Fájlfeltöltés (5 oszlop) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6 bg-white space-y-4 flex flex-col h-[520px]">
              <h4 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2 border-b border-sand-200 pb-3 shrink-0">
                <MessageSquare className="h-4 w-4 text-wine-600" />
                Ötletelő &amp; Fájlok
              </h4>

              {/* Megjegyzések Folyama */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {comments.length === 0 ? (
                  <p className="text-xs italic text-ink-400 py-4 text-center">
                    Még nincsenek hozzászólások. Írd meg az első ötletedet vagy csatolj egy képet!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-sand-100/80 border border-sand-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-ink-500">
                        <span className="font-bold text-wine-800">{c.user?.full_name || 'Tag'}</span>
                        <span className="text-[10px]">{formatDate(c.created_at)}</span>
                      </div>
                      <p className="text-ink-800 leading-relaxed">{c.comment_text}</p>
                      
                      {/* Csatolt fájl vagy kép */}
                      {c.attachment_url && (
                        <div className="pt-1.5">
                          {c.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                            <a href={c.attachment_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-sand-300">
                              <img src={c.attachment_url} alt="" className="h-32 w-full object-cover" />
                            </a>
                          ) : (
                            <a
                              href={c.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-wine-700 font-bold hover:underline"
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                              {c.attachment_name || 'Csatolt dokumentum'}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Új Hozzászólás & Fájlcsatolás Form */}
              {isAuthenticated ? (
                <form onSubmit={handleSendComment} className="pt-3 border-t border-sand-200 space-y-2 shrink-0">
                  {attachment && (
                    <div className="flex items-center justify-between text-xs bg-wine-50 text-wine-800 p-2 rounded-lg border border-wine-200">
                      <span className="truncate font-medium">📎 {attachment.name}</span>
                      <button type="button" onClick={() => setAttachment(null)} className="text-wine-600 font-bold hover:text-wine-900">
                        ×
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Írj egy megjegyzést..."
                      className="input flex-1 py-2 text-xs"
                    />

                    <label className="btn-secondary btn-sm cursor-pointer shrink-0" title="Kép / Fájl csatolása">
                      <Paperclip className="h-4 w-4 text-ink-600" />
                      <input type="file" onChange={handleFileSelect} className="sr-only" />
                    </label>

                    <button type="submit" disabled={sendingComment || uploadingFile} className="btn-primary btn-sm shrink-0">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-ink-500 italic text-center pt-2 shrink-0">
                  A hozzászóláshoz és fájlcsatoláshoz bejelentkezés szükséges.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
