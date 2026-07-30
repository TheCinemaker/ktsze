import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addFlowerLog } from '../../lib/db';

// Kőszeg Belváros koordinátái
const KOSZEG_CENTER = [47.3891, 16.5408];

// Egyedi SVG jelölők generálása (Zöld = Ma megöntözve, Sárga = Tegnap megöntözve, Piros = Öntözni kell)
const createCustomIcon = (statusColor) => {
  const isRed = statusColor === 'rose';
  const colorHex = isRed ? '#e11d48' : statusColor === 'amber' ? '#d97706' : '#059669';
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.16 24.84 0 16 0 Z" fill="${colorHex}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="16" cy="15" r="7" fill="#ffffff" />
        <path d="M16 11 C16 11 13 14.5 13 16.5 C13 18.15 14.35 19.5 16 19.5 C17.65 19.5 19 18.15 19 16.5 C19 14.5 16 11 16 11 Z" fill="${colorHex}"/>
      </g>
    </svg>
  `;

  return L.divIcon({
    html: `<div class="${isRed ? 'animate-bounce' : ''}">${svg}</div>`,
    className: 'custom-tree-pin',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38]
  });
};

// GPS Felhasználói pozíció jelölő (Kék kör)
const createUserLocationIcon = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <circle cx="12" cy="12" r="10" fill="#2563eb" fill-opacity="0.3" stroke="#2563eb" stroke-width="2"/>
      <circle cx="12" cy="12" r="5" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'user-gps-pin',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export const FlowerSpotMap = ({ spots = [], userCoords = null, onLogAdded, onOpenLogModal }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);

  // Térkép inicializálása
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: KOSZEG_CENTER,
        zoom: 15,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap közösség'
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Jelölők frissítése a fáknak
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Régi pin-ek törlése
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    spots.forEach((spot) => {
      // Ha nincs megadva koordináta, próbálunk alapértelmezettet adni vagy kihagyjuk
      const lat = spot.latitude || (spot.location_name?.includes('Jurisics') ? 47.3895 : 47.3888);
      const lng = spot.longitude || (spot.location_name?.includes('Jurisics') ? 16.5412 : 16.5402);

      // Státusz szín kiszámítása
      let statusColor = 'emerald';
      let statusText = 'Ma már megöntözve';

      if (!spot.last_watered_at) {
        statusColor = 'rose';
        statusText = 'Öntözni kellene!';
      } else {
        const date = new Date(spot.last_watered_at);
        const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
        const isToday = new Date().toDateString() === date.toDateString();

        if (!isToday) {
          statusColor = diffHours < 36 ? 'amber' : 'rose';
          statusText = diffHours < 36 ? 'Tegnap megöntözve' : 'Sürgős vízadásra vár!';
        }
      }

      const icon = createCustomIcon(statusColor);
      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // PopUp tartalom építése
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 space-y-2 text-xs font-sans max-w-[220px]';
      popupDiv.innerHTML = `
        <div class="font-bold text-slate-900 text-sm border-b pb-1">${spot.title || 'Kőszegi Fa'}</div>
        ${spot.photo_url ? `<img src="${spot.photo_url}" class="h-24 w-full object-cover rounded-lg border" />` : ''}
        <div class="text-slate-600">${spot.description || ''}</div>
        <div class="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
          ${statusText}
        </div>
      `;

      const btnContainer = document.createElement('div');
      btnContainer.className = 'space-y-1.5 pt-1';

      // 1. Részletes Öntözés & Szelfi Feltöltése Gomb (HA RÁKATTINTANAK A TÉRKÉPEN)
      if (onOpenLogModal) {
        const detailBtn = document.createElement('button');
        detailBtn.className = 'w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2 px-3 rounded-xl shadow text-xs transition-all active:scale-95 flex items-center justify-center gap-1';
        detailBtn.innerText = '📸 Részletes öntözés & Szelfi';
        detailBtn.onclick = () => {
          marker.closePopup();
          onOpenLogModal(spot);
        };
        btnContainer.appendChild(detailBtn);
      }

      // 2. 1-Tap Gyors Öntözés Gomb
      const waterBtn = document.createElement('button');
      waterBtn.className = 'w-full bg-sand-200 hover:bg-sand-300 text-ink-900 font-bold py-1.5 px-3 rounded-xl text-[11px] transition-all border border-sand-300';
      waterBtn.innerText = 'Gyors vízadás (1 kattintás)';
      waterBtn.onclick = async () => {
        try {
          waterBtn.innerText = 'Mentés…';
          waterBtn.disabled = true;
          await addFlowerLog({
            spot_id: spot.id,
            user_name: 'Kőszegi Önkéntes',
            action_type: 'locsolas',
            water_liters: 30,
            notes: 'Térképes 1-kattintásos locsolás',
            water_count_this_month: spot.water_count_this_month || 0
          });
          waterBtn.innerText = 'Köszönjük! Elmentve!';
          waterBtn.className = 'w-full bg-emerald-800 text-white font-extrabold py-1.5 px-3 rounded-xl text-[11px]';
          if (onLogAdded) onLogAdded();
          setTimeout(() => marker.closePopup(), 1500);
        } catch (err) {
          alert('Hiba: ' + err.message);
          waterBtn.disabled = false;
          waterBtn.innerText = 'Gyors vízadás (1 kattintás)';
        }
      };

      btnContainer.appendChild(waterBtn);
      popupDiv.appendChild(btnContainer);
      marker.bindPopup(popupDiv);
      markersRef.current.push(marker);
    });
  }, [spots, onLogAdded, onOpenLogModal]);

  // GPS felhasználói pozíció beállítása a térképen
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userCoords) return;

    map.setView([userCoords.lat, userCoords.lng], 17, { animate: true });
    const userMarker = L.marker([userCoords.lat, userCoords.lng], {
      icon: createUserLocationIcon()
    }).addTo(map);
    userMarker.bindPopup('<div class="font-bold text-xs">📍 Az Ön pozíciója</div>').openPopup();

    markersRef.current.push(userMarker);
  }, [userCoords]);

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border-2 border-sand-300 shadow-md z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
