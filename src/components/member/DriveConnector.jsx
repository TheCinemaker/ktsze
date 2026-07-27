import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FolderGit2, HardDrive, RefreshCw, ExternalLink, File, Upload, CheckCircle2, CloudSync, Sparkles } from 'lucide-react';

export const DriveConnector = () => {
  const { driveFolders, addFileToDriveFolder } = useAuth();
  const toast = useToast();
  const [selectedFolder, setSelectedFolder] = useState(driveFolders[0]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  };

  const handleUploadToDrive = (e) => {
    e.preventDefault();
    if (!uploadFileName || !selectedFolder) return;
    addFileToDriveFolder(selectedFolder.id, uploadFileName, '2.4 MB');
    setUploadFileName('');
    setShowUploadModal(false);
    toast.success(`A(z) „${uploadFileName}” fájl felkerült a megosztott Google Drive mappába.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#2C221E] text-white rounded-2xl p-6 sm:p-8 border-2 border-[#6B1D2F] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A880] uppercase tracking-wider mb-1">
            <CloudSync className="w-4 h-4 text-[#C5A880]" />
            Google Drive Felhő Integráció (Kétirányú Szinkronizáció)
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0]">
            Egyesületi Közös Drive Mappák
          </h2>
          <p className="text-xs text-[#A39288] mt-1">
            Közvetlen hozzáférés az egyesület élő felhőtárhelyéhez (Mappák, beszámolók, nagy felbontású fotótárak oda-vissza elérése).
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-outline-brown text-xs bg-[#5D4037] text-white border-[#C5A880] hover:bg-[#3E2723]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Szinkronizálás...' : 'Frissítés'}
          </button>
          
          <a 
            href={selectedFolder.web_link}
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-wine text-xs text-white uppercase tracking-wider font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Megnyitás Google Drive-on
          </a>
        </div>
      </div>

      {/* Main Drive Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Folder Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#2C221E] px-1">
            Szinkronizált Mappák
          </h3>

          <div className="space-y-2">
            {driveFolders.map((folder) => {
              const isSelected = selectedFolder.id === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#6B1D2F] text-white border-[#6B1D2F] shadow-md'
                      : 'bg-white text-[#2C221E] border-[#E2D7C7] hover:bg-[#F3ECE0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FolderGit2 className={`w-5 h-5 ${isSelected ? 'text-[#C5A880]' : 'text-[#6B1D2F]'}`} />
                    <div>
                      <div className="font-semibold text-xs leading-snug">{folder.name}</div>
                      <div className={`text-[0.65rem] ${isSelected ? 'text-[#D9AAB6]' : 'text-[#63534B]'}`}>
                        {folder.files_count} fájl • Szinkronizálva
                      </div>
                    </div>
                  </div>
                  <span className={`text-[0.65rem] ${isSelected ? 'text-white' : 'text-[#63534B]'}`}>→</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: File Browser inside Selected Folder */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E2D7C7] shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2D7C7]">
            <div>
              <div className="text-[0.68rem] text-[#6B1D2F] font-bold uppercase tracking-wider">
                Mappa Kiválasztva
              </div>
              <h3 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-[#6B1D2F]" />
                {selectedFolder.name}
              </h3>
              <div className="text-[0.7rem] text-[#63534B] mt-0.5">
                Utolsó szinkronizálás ideje: {selectedFolder.last_synced}
              </div>
            </div>

            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn-wine text-xs uppercase tracking-wider font-semibold self-start sm:self-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              Fájl Feltöltése a Drive-ba
            </button>
          </div>

          {/* Files List */}
          <div className="space-y-2">
            {selectedFolder.files.map((file, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#E2D7C7] hover:border-[#C5A880] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <File className="w-4 h-4 text-[#6B1D2F] shrink-0" />
                  <div>
                    <div className="font-semibold text-xs text-[#2C221E]">{file.name}</div>
                    <div className="text-[0.65rem] text-[#63534B]">Módosítva: {file.modified} • {file.size}</div>
                  </div>
                </div>

                <a 
                  href={selectedFolder.web_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-wine-outline text-[0.7rem] py-1 px-2.5"
                >
                  Megnyitás
                </a>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full p-6 border-2 border-[#C5A880] shadow-2xl relative">
            <h3 className="font-serif text-xl font-bold text-[#2C221E] mb-2">
              Fájl Feltöltése a Google Drive-ba
            </h3>
            <p className="text-xs text-[#63534B] mb-4">
              Célmappa: <strong className="text-[#6B1D2F]">{selectedFolder.name}</strong>
            </p>

            <form onSubmit={handleUploadToDrive} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Fájl Neve</label>
                <input 
                  type="text" 
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="Pl. 2026_Tavaszi_Kozgyules_Prezentacio.pdf"
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                />
              </div>

              <div className="border-2 border-dashed border-[#E2D7C7] rounded-lg p-6 text-center bg-white cursor-pointer">
                <Upload className="w-8 h-8 text-[#6B1D2F] mx-auto mb-2" />
                <span className="text-xs font-semibold text-[#2C221E]">Húzza ide vagy tallózza ki a fájlt</span>
                <div className="text-[0.65rem] text-[#63534B] mt-1">Automatikus kétirányú Google Drive szinkronizáció</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-outline-brown text-xs">
                  Mégse
                </button>
                <button type="submit" className="btn-wine text-xs">
                  Feltöltés Indítása
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
