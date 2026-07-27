import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, CheckCircle2, Clock, ShieldAlert, Mail, Phone, MapPin, Edit, Plus, Check } from 'lucide-react';

export const MemberManagement = () => {
  const { members, updateMemberDuesStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Minden');

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.organization_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Minden' || 
                          (filterStatus === 'Rendezett' && m.dues_2026.status === 'paid') ||
                          (filterStatus === 'Függőben' && m.dues_2026.status === 'pending');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2D7C7] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#63534B] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-[#6B1D2F]" />
            Adminisztrációs Kezelőfelület
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C221E]">
            Tagnyilvántartó & Tagdíj Rendezés
          </h2>
        </div>

        <div className="text-xs text-[#63534B]">
          Összes tag: <strong className="text-[#6B1D2F] font-serif text-lg">{members.length} fő</strong>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#F3ECE0] p-4 rounded-xl border border-[#E2D7C7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#63534B] absolute left-3 top-3" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tag vagy szervezet keresése..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E2D7C7] bg-white text-xs text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
          />
        </div>

        <div className="flex gap-2">
          {['Minden', 'Rendezett', 'Függőben'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#6B1D2F] text-white border-[#6B1D2F]'
                  : 'bg-white text-[#2C221E] border-[#E2D7C7]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table / List */}
      <div className="bg-white rounded-2xl border border-[#E2D7C7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3ECE0] text-[#63534B] uppercase tracking-wider font-semibold border-b border-[#E2D7C7]">
                <th className="p-4">Szervezet / Tag Neve</th>
                <th className="p-4">Kategória</th>
                <th className="p-4">Elérhetőség</th>
                <th className="p-4">2026. Évi Tagdíj</th>
                <th className="p-4 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D7C7]">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#FAF6F0] transition-colors">
                  
                  {/* Name */}
                  <td className="p-4">
                    <div className="font-bold text-[#2C221E]">{member.organization_name}</div>
                    <div className="text-[0.7rem] text-[#63534B]">{member.full_name}</div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="badge-wine uppercase text-[0.65rem]">
                      {member.member_type}
                    </span>
                  </td>

                  {/* Contacts */}
                  <td className="p-4 text-[#63534B] space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#C5A880]" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#C5A880]" />
                      <span>{member.phone}</span>
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
                  <td className="p-4 text-right">
                    {member.dues_2026?.status === 'pending' ? (
                      <button 
                        onClick={() => updateMemberDuesStatus(member.id, 'paid')}
                        className="btn-wine text-[0.7rem] py-1 px-2.5"
                      >
                        <Check className="w-3 h-3" />
                        Jóváhagyás: Befizetve
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateMemberDuesStatus(member.id, 'pending')}
                        className="btn-wine-outline text-[0.7rem] py-1 px-2.5"
                      >
                        Módosítás: Függőben
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
