import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeaderLogo } from '../components/layout/HeaderLogo';
import { Lock, Mail, Key, ShieldCheck, ArrowRight, UserCheck, Building2, Crown, UserPlus, Phone, MapPin, Building, HeartHandshake } from 'lucide-react';

export const LoginPage = ({ setActiveTab }) => {
  const { loginWithEmail, registerMember } = useAuth();
  
  const [activeTabMode, setActiveTabMode] = useState('login'); // 'login' | 'register'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration form state
  const [regAccountEmail, setRegAccountEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regHomeAddress, setRegHomeAddress] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPrivateEmail, setRegPrivateEmail] = useState('');
  const [regCategory, setRegCategory] = useState('Rendes tag'); // 'Rendes tag' | 'Pártoló tag'
  const [regActivity, setRegActivity] = useState('szolgáltató');
  const [regServiceName, setRegServiceName] = useState('');
  const [regStreet, setRegStreet] = useState('');
  const [regHouseNum, setRegHouseNum] = useState('');
  const [regContacts, setRegContacts] = useState('');

  const handleCustomLogin = (e) => {
    e.preventDefault();
    const result = loginWithEmail(email);
    if (result.success) {
      if (result.user.role === 'admin') {
        setActiveTab('admin-dashboard');
      } else {
        setActiveTab('member-dashboard');
      }
    } else {
      alert(result.message || 'Hiba a bejelentkezés során.');
    }
  };

  const handleCustomRegister = (e) => {
    e.preventDefault();
    if (!regAccountEmail || !regFullName || !regPhone) {
      alert("Kérjük töltse ki a kötelező mezőket!");
      return;
    }

    const createdProfile = registerMember({
      account_email: regAccountEmail,
      private_email: regPrivateEmail,
      full_name: regFullName,
      home_address: regHomeAddress,
      phone: regPhone,
      member_category: regCategory,
      business_activity: regActivity,
      service_location_name: regServiceName || regFullName,
      service_street: regStreet,
      service_house_number: regHouseNum,
      service_contacts: regContacts || regPhone
    });

    alert(`Sikeres regisztráció! Üdvözöljük a KTSZE ${regCategory} soraiban!`);
    setActiveTab('member-dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-[#FAF6F0]">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="inline-block p-3 bg-[#F3ECE0] rounded-2xl border border-[#C5A880] mb-2">
            <HeaderLogo />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C221E]">
            Egyesületi Tagi & Pártolói Portál
          </h2>
          <p className="text-xs text-[#63534B]">
            Bejelentkezés & Online Regisztráció a Supabase mentéssel rendelkező zárt KTSZE rendszerbe
          </p>
        </div>

        {/* Main Card with Toggle Tabs */}
        <div className="bg-white rounded-2xl border border-[#E2D7C7] shadow-sm overflow-hidden">
          
          {/* Tab Controls */}
          <div className="flex border-b border-[#E2D7C7]">
            <button
              onClick={() => setActiveTabMode('login')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                activeTabMode === 'login'
                  ? 'bg-white text-[#6B1D2F] border-b-2 border-[#6B1D2F]'
                  : 'bg-[#F3ECE0] text-[#63534B] hover:text-[#2C221E]'
              }`}
            >
              <Lock className="w-4 h-4" /> Bejelentkezés
            </button>
            <button
              onClick={() => setActiveTabMode('register')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                activeTabMode === 'register'
                  ? 'bg-white text-[#6B1D2F] border-b-2 border-[#6B1D2F]'
                  : 'bg-[#F3ECE0] text-[#63534B] hover:text-[#2C221E]'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Új Tag Regisztráció
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {activeTabMode === 'login' ? (
              
              /* Login Form */
              <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Fiók E-mail Cím *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#63534B] absolute left-3 top-3" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tag@jurisicsvarhotel.hu"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Jelszó *</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-[#63534B] absolute left-3 top-3" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-wine w-full justify-center py-3 text-xs uppercase font-bold tracking-wider">
                  Bejelentkezés
                </button>
              </form>

            ) : (

              /* Registration Form */
              <form onSubmit={handleCustomRegister} className="space-y-4 text-xs">
                
                {/* Category Selection */}
                <div className="p-3 bg-[#FAF3E8] rounded-xl border border-[#E5D2B8] space-y-1.5">
                  <label className="block font-bold text-[#6B1D2F] uppercase text-[0.68rem]">Tagság Típusa *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegCategory('Rendes tag')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        regCategory === 'Rendes tag'
                          ? 'bg-[#6B1D2F] text-white border-[#6B1D2F]'
                          : 'bg-white text-[#2C221E] border-[#E2D7C7]'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" /> Rendes Tag (Vállalkozás)
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegCategory('Pártoló tag')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        regCategory === 'Pártoló tag'
                          ? 'bg-[#6B1D2F] text-white border-[#6B1D2F]'
                          : 'bg-white text-[#2C221E] border-[#E2D7C7]'
                      }`}
                    >
                      <HeartHandshake className="w-3.5 h-3.5" /> Pártoló Tag (Magánszemély)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#2C221E] mb-1">Teljes Név *</label>
                    <input 
                      type="text" 
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Pl. Kovács István"
                      className="w-full p-2.5 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2C221E] mb-1">Telefonszám *</label>
                    <input 
                      type="text" 
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+36 30 123 4567"
                      className="w-full p-2.5 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#2C221E] mb-1">Fiók E-mail Cím (Belépéshez) *</label>
                    <input 
                      type="email" 
                      required
                      value={regAccountEmail}
                      onChange={(e) => setRegAccountEmail(e.target.value)}
                      placeholder="kovacs@partner.hu"
                      className="w-full p-2.5 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2C221E] mb-1">Privát E-mail (Nem kötelező)</label>
                    <input 
                      type="email" 
                      value={regPrivateEmail}
                      onChange={(e) => setRegPrivateEmail(e.target.value)}
                      placeholder="kovacs.magan@gmail.com"
                      className="w-full p-2.5 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Személyes / Otthoni Cím</label>
                  <input 
                    type="text" 
                    value={regHomeAddress}
                    onChange={(e) => setRegHomeAddress(e.target.value)}
                    placeholder="9730 Kőszeg, Várkör 12."
                    className="w-full p-2.5 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E]"
                  />
                </div>

                {/* Service Details for Business / Service Providers */}
                <div className="p-3 bg-[#F3ECE0] rounded-xl border border-[#E2D7C7] space-y-3">
                  <div className="font-bold text-[0.68rem] text-[#6B1D2F] uppercase tracking-wider">
                    Szolgáltatás / Üzlet Helyszínének Adatai
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#2C221E] mb-1">Tevékenység Típusa</label>
                      <select 
                        value={regActivity}
                        onChange={(e) => setRegActivity(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-[#E2D7C7] bg-white text-[#2C221E]"
                      >
                        <option value="szállásadó">Szállásadó</option>
                        <option value="vendéglős">Vendéglős / Étterem</option>
                        <option value="borász">Borászat</option>
                        <option value="szolgáltató">Szolgáltató</option>
                        <option value="kulturális">Kulturális</option>
                        <option value="egyéb">Egyéb magánszemély / civil</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#2C221E] mb-1">Szolgáltatás Neve</label>
                      <input 
                        type="text" 
                        value={regServiceName}
                        onChange={(e) => setRegServiceName(e.target.value)}
                        placeholder="Pl. Kovács Panzió"
                        className="w-full p-2.5 rounded-lg border border-[#E2D7C7] bg-white text-[#2C221E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-[#2C221E] mb-1">Utca</label>
                      <input 
                        type="text" 
                        value={regStreet}
                        onChange={(e) => setRegStreet(e.target.value)}
                        placeholder="Rajnis utca"
                        className="w-full p-2 rounded-lg border border-[#E2D7C7] bg-white text-[#2C221E]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#2C221E] mb-1">Házszám</label>
                      <input 
                        type="text" 
                        value={regHouseNum}
                        onChange={(e) => setRegHouseNum(e.target.value)}
                        placeholder="14."
                        className="w-full p-2 rounded-lg border border-[#E2D7C7] bg-white text-[#2C221E]"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-wine w-full justify-center py-3 text-xs uppercase font-bold tracking-wider">
                  Regisztráció Mentése (Supabase)
                </button>
              </form>

            )}
          </div>

        </div>

      </div>
    </div>
  );
};
