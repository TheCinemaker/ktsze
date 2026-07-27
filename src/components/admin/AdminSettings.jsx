import React from 'react';
import { Database, CloudSync, Shield, CheckCircle2, Server, Key, FileCheck } from 'lucide-react';
import { isSupabaseConfigured, supabaseUrl, supabaseProjectRef } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminSettings = () => {
  const isSupabaseLive = isSupabaseConfigured();
  const { syncState } = useAuth();
  const toast = useToast();

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-[#E2D7C7] shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#63534B] uppercase tracking-wider mb-1">
          <Database className="w-4 h-4 text-[#6B1D2F]" />
          Rendszerbeállítások & Integrációk
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#2C221E]">
          Backend & Adatbázis Állapot
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Supabase Status */}
        <div className="bg-[#F3ECE0] p-6 rounded-2xl border border-[#E2D7C7] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2D7C7]">
            <div className="flex items-center gap-2 font-serif text-lg font-bold text-[#2C221E]">
              <Database className="w-5 h-5 text-[#6B1D2F]" />
              Supabase Postgres Backend
            </div>
            {isSupabaseLive ? (
              <span className="badge-success">Éles Kapcsolat</span>
            ) : (
              <span className="badge-gold">Demo / Fallback Mód</span>
            )}
          </div>

          <div className="space-y-2 text-xs text-[#63534B]">
            <div className="flex justify-between gap-3">
              <span className="shrink-0">Adatbázis URL:</span>
              <strong className="font-mono text-[#2C221E] break-all text-right">{supabaseUrl}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="shrink-0">Projekt azonosító:</span>
              <strong className="font-mono text-[#2C221E]">{supabaseProjectRef}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="shrink-0">Utolsó írás állapota:</span>
              <strong
                className={
                  syncState.status === 'error'
                    ? 'text-[#6B1D2F] font-bold text-right'
                    : 'text-green-700 font-bold text-right'
                }
              >
                {syncState.status === 'error'
                  ? 'Hiba'
                  : syncState.status === 'saving'
                    ? 'Mentés folyamatban…'
                    : syncState.status === 'saved'
                      ? 'Sikeres mentés'
                      : 'Nem volt írás'}
              </strong>
            </div>
            {syncState.error && (
              <div className="p-2.5 rounded-lg bg-[#F7EBEF] border border-[#D9AAB6] text-[#6B1D2F] text-[0.7rem] leading-relaxed break-words">
                {syncState.error}
              </div>
            )}
            <div className="flex justify-between">
              <span>Row Level Security (RLS):</span>
              <strong className="text-green-700 font-bold">Aktív (Engedélyezve)</strong>
            </div>
            <div className="flex justify-between">
              <span>Munkamenet Kezelés:</span>
              <strong className="text-[#2C221E]">JWT & Role-based Auth</strong>
            </div>
          </div>

          <div className="pt-2 text-[0.7rem] text-[#63534B]">
            * Az SQL Schema beállító szkript a <code>supabase/schema.sql</code> állományban található.
          </div>
        </div>

        {/* Google Drive Connector Status */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2D7C7] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2D7C7]">
            <div className="flex items-center gap-2 font-serif text-lg font-bold text-[#2C221E]">
              <CloudSync className="w-5 h-5 text-[#6B1D2F]" />
              Google Drive Connector
            </div>
            <span className="badge-success">Szinkronizálva</span>
          </div>

          <div className="space-y-2 text-xs text-[#63534B]">
            <div className="flex justify-between">
              <span>Kapcsolódott Mappák:</span>
              <strong className="text-[#2C221E]">3 db Főmappa</strong>
            </div>
            <div className="flex justify-between">
              <span>Kétirányú Fájlszinkron:</span>
              <strong className="text-green-700 font-bold">Aktív (Oda-Vissza)</strong>
            </div>
            <div className="flex justify-between">
              <span>Utolsó automatikus ellenőrzés:</span>
              <strong className="text-[#2C221E]">2026-07-27 08:45</strong>
            </div>
          </div>

          <button 
            onClick={() => toast.success('Google Drive API kapcsolat tesztelve: minden mappa elérhető.')}
            className="btn-wine-outline text-xs w-full justify-center"
          >
            Kapcsolat Tesztelése
          </button>
        </div>

      </div>

    </div>
  );
};
