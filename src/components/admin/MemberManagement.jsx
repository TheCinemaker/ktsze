import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, CheckCircle2, Clock, Mail, Phone, MapPin, Edit3, Save, X, Plus, Building2, UserCheck, ShieldCheck } from 'lucide-react';

export const MemberManagement = () => {
  const { members, updateMemberDuesStatus, updateMemberProfile, workgroups } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Minden');
  const [filterStatus, setFilterStatus] = useState('Minden');

  // Edit Modal State
  const [editingMember, setEditingMember] = useState(null);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.service_location_name && m.service_location_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          m.account_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Minden' || m.member_category === filterCategory;
    const matchesStatus = filterStatus === 'Minden' || 
                          (filterStatus === 'Rendezett' && m.dues_2026?.status === 'paid') ||
                          (filterStatus === 'Függőben' && m.dues_2026?.status === 'pending');
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingMember) return;
    updateMemberProfile(editingMember.id, editingMember);
    setEditingMember(null);
    alert("Tag adatai sikeresen frissítve!");
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2D7C7] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B1D2F] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-[#6B1D2F]" />
            Elnökségi Adminisztráció
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C221E]">
            Tagok & Pártoló Tagok Kezelője
          </h2>
          <p className="text-xs text-[#63534B] mt-0.5">
            Minden tagi adat, elérhetőség, szolgáltatás cím és tagdíjbe fizetés teljes körűen szerkeszthető.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[0.7rem] text-[#63534B] uppercase tracking-wider font-semibold">Összes Regisztrált Tag</div>
            <div className="font-serif text-2xl font-bold text-[#6B1D2F]">{members.length} fő</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#F3ECE0] p-4 rounded-xl border border-[#E2D7C7] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#63534B] absolute left-3 top-3" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Keresés név, szolgáltatás vagy e-mail szerint..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E2D7C7] bg-white text-xs text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Member Category Filter */}
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 rounded-lg border border-[#E2D7C7] bg-white text-xs text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
          >
            <option value="Minden">Minden Tagsági Típus</option>
            <option value="Rendes tag">Rendes Tagok</option>
            <option value="Pártoló tag">Pártoló Tagok</option>
            <option value="Elnökségi tag">Elnökségi Tagok</option>
          </select>

          {/* Dues Status Filter */}
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 rounded-lg border border-[#E2D7C7] bg-white text-xs text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
          >
            <option value="Minden">Minden Tagdíj Státusz</option>
            <option value="Rendezett">Rendezett (Befizetve)</option>
            <option value="Függőben">Függőben</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-[#E2D7C7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3ECE0] text-[#63534B] uppercase tracking-wider font-bold border-b border-[#E2D7C7]">
                <th className="p-4">Tag Neve / Szolgáltatás</th>
                <th className="p-4">Tagsági Típus & Tevékenység</th>
                <th className="p-4">Szolgáltatás Címe & Elérhetőség</th>
                <th className="p-4">Munkacsoportok</th>
                <th className="p-4">2026. Évi Tagdíj</th>
                <th className="p-4 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D7C7]">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#FAF6F0] transition-colors">
                  
                  {/* Name & Service Name */}
                  <td className="p-4">
                    <div className="font-bold text-[#2C221E] text-sm">{member.full_name}</div>
                    <div className="text-xs text-[#6B1D2F] font-semibold flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {member.service_location_name || "Nincs megadva"}
                    </div>
                  </td>

                  {/* Category & Activity */}
                  <td className="p-4 space-y-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[0.68rem] font-bold uppercase ${
                      member.member_category === 'Pártoló tag' ? 'bg-[#FAF3E8] text-[#7A5B2E] border border-[#E5D2B8]' :
                      member.member_category === 'Elnökségi tag' ? 'bg-[#6B1D2F] text-white' : 'bg-[#F7EBEF] text-[#6B1D2F] border border-[#D9AAB6]'
                    }`}>
                      {member.member_category}
                    </span>
                    <div className="text-[0.7rem] text-[#63534B] capitalize">
                      Tevékenység: <strong>{member.business_activity}</strong>
                    </div>
                  </td>

                  {/* Address & Contacts */}
                  <td className="p-4 text-[#63534B] space-y-1">
                    <div className="flex items-center gap-1 text-[#2C221E] font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                      <span>9730 Kőszeg, {member.service_street || ""} {member.service_house_number || ""}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[0.68rem]">
                      <Mail className="w-3 h-3 text-[#C5A880]" />
                      <span>{member.account_email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[0.68rem]">
                      <Phone className="w-3 h-3 text-[#C5A880]" />
                      <span>{member.phone}</span>
                    </div>
                  </td>

                  {/* Workgroups */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {member.workgroups && member.workgroups.length > 0 ? (
                        member.workgroups.map((wg, idx) => (
                          <span key={idx} className="bg-[#FAF6F0] text-[#6B1D2F] border border-[#E2D7C7] px-2 py-0.5 rounded text-[0.65rem] font-semibold">
                            {wg}
                          </span>
                        ))
                      ) : (
                        <span className="text-[0.65rem] text-[#A39288]">Nincs csatlakozva</span>
                      )}
                    </div>
                  </td>

                  {/* Dues Status */}
                  <td className="p-4">
                    {member.dues_2026?.status === 'paid' ? (
                      <span className="badge-success inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Rendezve ({member.dues_2026.amount.toLocaleString()} Ft)
                      </span>
                    ) : (
                      <span className="badge-warning inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Függőben ({member.dues_2026.amount.toLocaleString()} Ft)
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right space-y-1">
                    <button 
                      onClick={() => setEditingMember({...member})}
                      className="btn-wine-outline text-[0.7rem] py-1 px-2.5 w-full justify-center"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Szerkesztés
                    </button>

                    {member.dues_2026?.status === 'pending' ? (
                      <button 
                        onClick={() => updateMemberDuesStatus(member.id, 'paid')}
                        className="btn-wine text-[0.7rem] py-1 px-2.5 w-full justify-center"
                      >
                        Befizetve
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateMemberDuesStatus(member.id, 'pending')}
                        className="btn-outline-brown text-[0.7rem] py-1 px-2.5 w-full justify-center"
                      >
                        Függőben
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Member Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-2xl w-full p-6 sm:p-8 border-2 border-[#C5A880] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setEditingMember(null)}
              className="absolute top-4 right-4 p-2 text-[#63534B] hover:text-[#6B1D2F] rounded-full hover:bg-[#F3ECE0] border-0 bg-transparent cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#2C221E] mb-2">
              Tag Adatainak Módosítása
            </h3>
            <p className="text-xs text-[#63534B] mb-6">
              Minden személyes, szolgáltatási és munkacsoporti adat közvetlenül szerkeszthető.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Teljes Név *</label>
                  <input 
                    type="text" 
                    required
                    value={editingMember.full_name}
                    onChange={(e) => setEditingMember({...editingMember, full_name: e.target.value})}
                    className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Tagsági Kategória</label>
                  <select 
                    value={editingMember.member_category}
                    onChange={(e) => setEditingMember({...editingMember, member_category: e.target.value})}
                    className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                  >
                    <option value="Rendes tag">Rendes tag</option>
                    <option value="Pártoló tag">Pártoló tag</option>
                    <option value="Elnökségi tag">Elnökségi tag</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Fiók E-mail (Bejelentkezéshez) *</label>
                  <input 
                    type="email" 
                    required
                    value={editingMember.account_email}
                    onChange={(e) => setEditingMember({...editingMember, account_email: e.target.value})}
                    className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Privát E-mail (Nem kötelező)</label>
                  <input 
                    type="email" 
                    value={editingMember.private_email || ""}
                    onChange={(e) => setEditingMember({...editingMember, private_email: e.target.value})}
                    className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Telefonszám *</label>
                  <input 
                    type="text" 
                    required
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                    className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Tevékenységi Kör</label>
                  <select 
                    value={editingMember.business_activity}
                    onChange={(e) => setEditingMember({...editingMember, business_activity: e.target.value})}
                    className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                  >
                    <option value="szállásadó">Szállásadó</option>
                    <option value="vendéglős">Vendéglős / Étterem</option>
                    <option value="borász">Borászat</option>
                    <option value="szolgáltató">Szolgáltató</option>
                    <option value="kulturális">Kulturális</option>
                    <option value="egyéb">Egyéb magánszemély / civil</option>
                  </select>
                </div>
              </div>

              {/* Service Location Details */}
              <div className="p-4 bg-[#F3ECE0] rounded-xl border border-[#E2D7C7] space-y-3">
                <div className="font-bold text-xs text-[#6B1D2F] uppercase tracking-wider">
                  Szolgáltatás / Üzlet Adatai
                </div>

                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Szolgáltatás Neve</label>
                  <input 
                    type="text" 
                    value={editingMember.service_location_name || ""}
                    onChange={(e) => setEditingMember({...editingMember, service_location_name: e.target.value})}
                    className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#2C221E] mb-1">Utca</label>
                    <input 
                      type="text" 
                      value={editingMember.service_street || ""}
                      onChange={(e) => setEditingMember({...editingMember, service_street: e.target.value})}
                      className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2C221E] mb-1">Házszám</label>
                    <input 
                      type="text" 
                      value={editingMember.service_house_number || ""}
                      onChange={(e) => setEditingMember({...editingMember, service_house_number: e.target.value})}
                      className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Szolgáltatás Elérhetőségei</label>
                  <input 
                    type="text" 
                    value={editingMember.service_contacts || ""}
                    onChange={(e) => setEditingMember({...editingMember, service_contacts: e.target.value})}
                    className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setEditingMember(null)} className="btn-outline-brown text-xs">
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
