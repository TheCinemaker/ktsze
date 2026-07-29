import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Clock, MessageSquare, Paperclip, Send, Image, FileText, FolderKanban, User, Phone, Mail, UserPlus, ShieldAlert, Award } from 'lucide-react';
import { 
  listProjectsByWorkgroup, 
  createWorkgroupProject, 
  listProjectTasks, 
  createProjectTask, 
  updateTaskStatus, 
  listProjectContacts,
  createProjectContact,
  listProjectComments, 
  addProjectComment, 
  uploadWorkgroupAttachment 
} from '../../lib/db';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Spinner, EmptyState } from '../ui';
import { formatDate } from '../../lib/format';

export const WorkgroupProjectsSection = ({ workgroup }) => {
  const workgroupId = workgroup?.id;
  const { profile, isAuthenticated, can } = useAuth();
  const toast = useToast();
  
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Projekt vezetői jogosultság ellenőrzése (Vezető / Elnökség / Admin indíthat projekteket)
  const isLeaderOrBoard = Boolean(
    can('admin.access') ||
    can('board.access') ||
    (profile?.full_name && workgroup?.leader_name && profile.full_name.toLowerCase().includes(workgroup.leader_name.toLowerCase())) ||
    (workgroup?.leader_name && profile?.full_name && workgroup.leader_name.toLowerCase().includes(profile.full_name.toLowerCase()))
  );

  // Új projekt modal
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  // Kiválasztott projekt elemei
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [comments, setComments] = useState([]);
  
  // Feladat form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  // Külső partner / elérhetőség form
  const [showNewContact, setShowNewContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  // Megjegyzés form
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

  // 2. Kiválasztott projekt adatai (Feladatok, Partnerek, Megjegyzések)
  const loadProjectDetails = async (projId) => {
    if (!projId) return;
    try {
      const [taskData, contactData, commentData] = await Promise.all([
        listProjectTasks(projId),
        listProjectContacts(projId),
        listProjectComments(projId)
      ]);
      setTasks(taskData);
      setContacts(contactData);
      setComments(commentData);
    } catch (err) {
      console.error('[ProjectDetails] Hiba a részletek betöltésekor:', err);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);

      const channel = supabase
        .channel(`project-${selectedProjectId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'project_tasks', filter: `project_id=eq.${selectedProjectId}` }, () => loadProjectDetails(selectedProjectId))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'project_contacts', filter: `project_id=eq.${selectedProjectId}` }, () => loadProjectDetails(selectedProjectId))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'project_comments', filter: `project_id=eq.${selectedProjectId}` }, () => loadProjectDetails(selectedProjectId))
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedProjectId]);

  // Új projekt indítása
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
      toast.success('Projekt sikeresen kiírva!');
      setProjectTitle('');
      setProjectDesc('');
      setShowNewProject(false);
      await loadProjects();
      setSelectedProjectId(newProj.id);
    } catch (err) {
      toast.error(`A projekt létrehozása nem sikerült: ${err.message}`);
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
        assignee_name: newTaskAssignee || null,
        due_date: newTaskDate || null,
        created_by: profile?.id
      });
      setNewTaskTitle('');
      setNewTaskAssignee('');
      setNewTaskDate('');
      await loadProjectDetails(selectedProjectId);
      toast.success('Feladat hozzáadva!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Feladat státusz váltás
  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await updateTaskStatus(task.id, nextStatus);
      await loadProjectDetails(selectedProjectId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Külső partner hozzáadása
  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !selectedProjectId) return;
    try {
      await createProjectContact({
        project_id: selectedProjectId,
        name: contactName,
        role_title: contactRole,
        phone: contactPhone,
        email: contactEmail,
        notes: contactNotes
      });
      setContactName('');
      setContactRole('');
      setContactPhone('');
      setContactEmail('');
      setContactNotes('');
      setShowNewContact(false);
      await loadProjectDetails(selectedProjectId);
      toast.success('Külső partner hozzáadva!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Fájl feltöltése Supabase Storage-ba
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

  // Megjegyzés küldése
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
      {/* Fejléc */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-300 pb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-ink-900 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-wine-600" />
            Munkacsoport Projektek &amp; Feladatok
          </h3>
          <p className="text-xs text-ink-600 mt-0.5">
            A csoportvezető által kiírt projektek, feladatlisták és külső partnerek.
          </p>
        </div>

        {isAuthenticated && isLeaderOrBoard ? (
          <button
            type="button"
            onClick={() => setShowNewProject(true)}
            className="btn-primary btn-sm rounded-xl font-bold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Új Projekt Kiírása (Vezetői Jog)
          </button>
        ) : (
          <span className="text-xs font-semibold text-wine-700 bg-wine-50 px-3 py-1.5 rounded-xl border border-wine-200 inline-flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" />
            Projektek kiírása: Munkacsoport Vezető / Elnökség
          </span>
        )}
      </div>

      {/* Új Projekt Form Modal */}
      {showNewProject && (
        <form onSubmit={handleCreateProject} className="card p-6 bg-sand-50/90 space-y-4 border-wine-300">
          <h4 className="font-display text-lg font-bold text-wine-900">Új Projekt Kiírása</h4>
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
              placeholder="A projekt feladatának és céljának részletes leírása..."
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
              {creatingProject ? 'Kiírás...' : 'Projekt Kiírása'}
            </button>
          </div>
        </form>
      )}

      {/* Projektek Üres Állapot */}
      {projects.length === 0 && !showNewProject && (
        <EmptyState
          icon={FolderKanban}
          title="Még nincs kiírt projekt"
          description="A munkacsoport vezetője írhat ki új projekteket, feladatokat és csatolhat külső partnereket."
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

      {/* Kiválasztott Projekt Részletei */}
      {selectedProject && (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Bal Oszlop: Feladatok & Külső Partnerek (7 oszlop) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card p-6 bg-white space-y-6">
              <div>
                <h4 className="font-display text-xl font-bold text-ink-900">{selectedProject.title}</h4>
                {selectedProject.description && (
                  <p className="text-sm text-ink-600 mt-1 leading-relaxed">{selectedProject.description}</p>
                )}
                {selectedProject.profiles?.full_name && (
                  <p className="text-xs text-wine-700 font-medium mt-2">
                    Kiíró: {selectedProject.profiles.full_name}
                  </p>
                )}
              </div>

              {/* Feladat Hozzáadása */}
              {isAuthenticated && (
                <form onSubmit={handleAddTask} className="flex flex-wrap gap-2 pt-2 border-t border-sand-200">
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="+ Új feladat kiírása..."
                    className="input flex-1 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    placeholder="Felelős (pl. Kovács Péter)"
                    className="input w-44 py-1.5 text-xs"
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
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-ink-500">Feladatlista &amp; Felelősök:</h5>
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
                        <div>
                          <span className="text-sm font-medium block truncate">{t.title}</span>
                          {(t.assignee_name || t.assignee?.full_name) && (
                            <span className="text-[11px] font-semibold text-wine-700 block">
                              👤 Felelős: {t.assignee_name || t.assignee?.full_name}
                            </span>
                          )}
                        </div>
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

              {/* Külső Partnerek / Elérhetőségek Szekció */}
              <div className="pt-4 border-t border-sand-300 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4 text-wine-600" />
                    Külső Partnerek &amp; Elérhetőségek (Főkertész, Polgármester stb.)
                  </h5>

                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => setShowNewContact(true)}
                      className="btn-secondary btn-sm text-xs font-bold"
                    >
                      + Partner Csatolása
                    </button>
                  )}
                </div>

                {/* Partner Hozzáadása Form */}
                {showNewContact && (
                  <form onSubmit={handleAddContact} className="p-4 rounded-xl bg-sand-100/90 border border-sand-300 space-y-3">
                    <h6 className="text-xs font-bold text-wine-900">Új Külső Partner Hozzáadása</h6>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Név (pl. Nagy István) *"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="input py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Titulus / Szerepkör (pl. Főkertész)"
                        value={contactRole}
                        onChange={(e) => setContactRole(e.target.value)}
                        className="input py-1.5 text-xs"
                      />
                      <input
                        type="tel"
                        placeholder="Telefonszám (pl. +36701234567)"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="input py-1.5 text-xs"
                      />
                      <input
                        type="email"
                        placeholder="E-mail cím"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="input py-1.5 text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Megjegyzés / Részletek..."
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      className="input py-1.5 text-xs"
                    />

                    <div className="flex justify-end gap-2 pt-1">
                      <button type="button" onClick={() => setShowNewContact(false)} className="btn-secondary btn-sm text-xs">
                        Mégse
                      </button>
                      <button type="submit" className="btn-primary btn-sm text-xs font-bold">
                        Partner Mentése
                      </button>
                    </div>
                  </form>
                )}

                {/* Partnerek Listája */}
                {contacts.length === 0 ? (
                  <p className="text-xs italic text-ink-400">Még nincsenek csatolt külső partnerek.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {contacts.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-sand-50 border border-sand-300 space-y-1 text-xs">
                        <div className="font-bold text-ink-900">{c.name}</div>
                        {c.role_title && <div className="text-wine-700 font-semibold">{c.role_title}</div>}
                        {c.phone && (
                          <div>
                            <a href={`tel:${c.phone}`} className="text-wine-700 hover:underline inline-flex items-center gap-1 font-medium">
                              <Phone className="h-3 w-3" /> {c.phone}
                            </a>
                          </div>
                        )}
                        {c.email && (
                          <div>
                            <a href={`mailto:${c.email}`} className="text-wine-700 hover:underline inline-flex items-center gap-1 font-medium">
                              <Mail className="h-3 w-3" /> {c.email}
                            </a>
                          </div>
                        )}
                        {c.notes && <p className="text-[11px] text-ink-500 pt-1 italic">{c.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Jobb Oszlop: Megjegyzések & Csatolt Fájlok (5 oszlop) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6 bg-white space-y-4 flex flex-col h-[600px]">
              <h4 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2 border-b border-sand-200 pb-3 shrink-0">
                <MessageSquare className="h-4 w-4 text-wine-600" />
                Ötletelő &amp; Fájlcsatolmányok
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

              {/* Megjegyzés & Fájl Form */}
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
