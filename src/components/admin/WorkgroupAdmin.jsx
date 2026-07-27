import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Flower2, Plus, Edit3, Save, X, Users, Image, Sparkles, Check } from 'lucide-react';

export const WorkgroupAdmin = () => {
  const { workgroups, addWorkgroup, updateWorkgroup, members } = useAuth();

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLeader, setNewLeader] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUpdates, setNewUpdates] = useState('');

  // Edit Modal
  const [editingGroup, setEditingGroup] = useState(null);

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newName) return;
    addWorkgroup({
      name: newName,
      leader_name: newLeader || "Elnökség",
      description: newDesc,
      latest_updates: newUpdates,
      image_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80"
    });
    setShowCreateModal(false);
    setNewName('');
    setNewLeader('');
    setNewDesc('');
    setNewUpdates('');
    alert("Új munkacsoport sikeresen létrehozva!");
  };

  const handleSaveEditGroup = (e) => {
    e.preventDefault();
    if (!editingGroup) return;
    updateWorkgroup(editingGroup.id, editingGroup);
    setEditingGroup(null);
    alert("Munkacsoport adatai frissítve!");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2D7C7] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B1D2F] uppercase tracking-wider mb-1">
            <Flower2 className="w-4 h-4 text-[#6B1D2F]" />
            Elnökségi Csoportkezelő
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C221E]">
            Munkacsoportok Kezelése & Új Csoportok Indítása
          </h2>
          <p className="text-xs text-[#63534B] mt-0.5">
            A csoportok nevei, feladatai, friss hírei és vezetői bármikor módosíthatók.
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-wine text-xs uppercase tracking-wider font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Új Munkacsoport Létrehozása
        </button>
      </div>

      {/* Workgroups List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workgroups.map((group) => {
          // Count members in this group
          const assignedMembers = members.filter(m => m.workgroups && m.workgroups.includes(group.name));

          return (
            <div key={group.id} className="bg-white rounded-2xl border border-[#E2D7C7] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#C5A880] transition-all">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="badge-wine uppercase text-[0.65rem]">
                    Munkacsoport
                  </span>
                  <span className="text-[0.68rem] font-bold text-[#2C221E] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#6B1D2F]" /> {assignedMembers.length} tag
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#2C221E]">
                  {group.name}
                </h3>

                <div className="text-xs text-[#6B1D2F] font-semibold">
                  Vezető: {group.leader_name || "Nincs megadva"}
                </div>

                <p className="text-xs text-[#63534B] leading-relaxed line-clamp-3">
                  {group.description}
                </p>

                {group.latest_updates && (
                  <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E2D7C7] text-xs">
                    <strong className="text-[#6B1D2F] block text-[0.68rem] uppercase font-bold mb-0.5">Legfrissebb Info / Hírek:</strong>
                    <span className="text-[#2C221E]">{group.latest_updates}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E2D7C7] flex items-center justify-between">
                <button 
                  onClick={() => setEditingGroup({...group})}
                  className="btn-wine-outline text-xs py-1.5 px-3 w-full justify-center"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Csoport Szerkesztése
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-lg w-full p-6 border-2 border-[#C5A880] shadow-2xl relative">
            
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-[#63534B] hover:text-[#6B1D2F] rounded-full border-0 bg-transparent cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#2C221E] mb-2">
              Új Munkacsoport Indítása
            </h3>
            <p className="text-xs text-[#63534B] mb-4">
              Hozz be új kezdeményezést az egyesületi munkatervbe.
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Munkacsoport Neve *</label>
                <input 
                  type="text" 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Pl. Kőszegi Gasztronómiai Munkacsoport"
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Munkacsoport Vezetője</label>
                <input 
                  type="text" 
                  value={newLeader}
                  onChange={(e) => setNewLeader(e.target.value)}
                  placeholder="Pl. Vörös Róbert Alelnök"
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Mivel foglalkozik a csoport? *</label>
                <textarea 
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Részletezze a feladatokat és a célokat..."
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Friss Hírek / Aktuális Info</label>
                <textarea 
                  rows={2}
                  value={newUpdates}
                  onChange={(e) => setNewUpdates(e.target.value)}
                  placeholder="Legújabb eredmények vagy felhívás..."
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-outline-brown text-xs">
                  Mégse
                </button>
                <button type="submit" className="btn-wine text-xs">
                  Csoport Létrehozása
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-lg w-full p-6 border-2 border-[#C5A880] shadow-2xl relative">
            
            <button 
              onClick={() => setEditingGroup(null)}
              className="absolute top-4 right-4 p-2 text-[#63534B] hover:text-[#6B1D2F] rounded-full border-0 bg-transparent cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#2C221E] mb-2">
              Munkacsoport Módosítása
            </h3>

            <form onSubmit={handleSaveEditGroup} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Munkacsoport Neve (Bármikor módosítható!)</label>
                <input 
                  type="text" 
                  required
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Munkacsoport Vezetője</label>
                <input 
                  type="text" 
                  value={editingGroup.leader_name || ""}
                  onChange={(e) => setEditingGroup({...editingGroup, leader_name: e.target.value})}
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Mivel foglalkozik a csoport?</label>
                <textarea 
                  rows={3}
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})}
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Friss Infók / Legújabb Eredmények</label>
                <textarea 
                  rows={3}
                  value={editingGroup.latest_updates || ""}
                  onChange={(e) => setEditingGroup({...editingGroup, latest_updates: e.target.value})}
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingGroup(null)} className="btn-outline-brown text-xs">
                  Mégse
                </button>
                <button type="submit" className="btn-wine text-xs">
                  <Save className="w-4 h-4" /> Módosítások Mentése
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
