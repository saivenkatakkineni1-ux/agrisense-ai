/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Lead Architect & Executive Owner: Sai Venkat Akkineni
 * Modern Enterprise Precision Architecture
 * STRICT ZERO DEMO DATA ENFORCEMENT
 * Dual Interfaces: User / Farmer Portal & Executive Administrator Console
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { IndiaLocationSelector, SelectedLocationData } from './components/IndiaLocationSelector';
import { FarmRegistryModule, FarmRecord } from './components/FarmRegistryModule';
import { WeatherModule } from './components/WeatherModule';
import { MandiModule } from './components/MandiModule';
import { SoilModule } from './components/SoilModule';
import { DiseaseModule } from './components/DiseaseModule';
import { YieldModule } from './components/YieldModule';
import { MarketplaceModule } from './components/MarketplaceModule';
import { GovernanceAuditModule } from './components/GovernanceAuditModule';
import { LandingHero } from './components/LandingHero';
import { AdminConsole } from './components/AdminConsole';
import { AuthModal } from './components/AuthModal';
import { auth, testFirestoreConnection } from './firebase/config';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  MapPin,
  Menu,
  ChevronRight,
  ShieldCheck,
  Award,
  ExternalLink,
  Sliders,
  LogIn,
  Eye,
  Lock,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('hero');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('FARMER');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Dual Interface State: 'user' for Kisan/Farmer portal, 'admin' for Executive Console
  const [activeView, setActiveView] = useState<'user' | 'admin'>('user');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<'user' | 'admin'>('user');

  const isAdmin =
    userRole === 'SYSTEM_ADMIN' || currentUser?.email === 'saivenkatakkineni00@gmail.com';

  const [activeLocation, setActiveLocation] = useState<SelectedLocationData>({
    state: 'Andhra Pradesh',
    district: 'Guntur',
    village: 'Guntur H.O',
    pincode: '522002',
    latitude: 16.3067,
    longitude: 80.4365,
    provenance: {
      sourceName: 'Department of Posts, Ministry of Communications, Government of India',
      sourceUrl: 'https://api.postalpincode.in/pincode/522002',
      retrievalTimestamp: new Date().toISOString(),
      verificationLevel: 'OFFICIAL_GOVERNMENT_DIRECTORY',
    },
  });

  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user?.email === 'saivenkatakkineni00@gmail.com') {
        setUserRole('SYSTEM_ADMIN');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLocationSelected = (loc: SelectedLocationData) => {
    setActiveLocation(loc);
  };

  const handleSelectFarmForAnalysis = (farm: FarmRecord) => {
    setActiveLocation({
      state: farm.state,
      district: farm.district,
      village: farm.village,
      pincode: farm.pincode,
      latitude: farm.latitude,
      longitude: farm.longitude,
      provenance: {
        sourceName: 'Cloud Firestore Registered Parcel',
        sourceUrl: '',
        retrievalTimestamp: farm.createdAt,
        verificationLevel: 'AUTHENTIC_LOCAL_GOV_RECORD',
      },
    });
    setActiveTab('weather');
  };

  const handleOpenAuth = (tab: 'user' | 'admin' = 'user') => {
    setAuthModalDefaultTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (
    role: 'FARMER' | 'SYSTEM_ADMIN' | 'BUYER_FPO',
    userDetails?: any
  ) => {
    setUserRole(role);
    if (userDetails) {
      setCurrentUser(userDetails as any);
    }
    if (role === 'SYSTEM_ADMIN') {
      setActiveView('admin');
      setActiveTab('admin_console');
    } else {
      setActiveView('user');
      setActiveTab('mandi');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole('FARMER');
      setActiveView('user');
      setActiveTab('hero');
    } catch (e) {
      console.error(e);
    }
  };

  const tabTitles: Record<ActiveTab, { title: string; category: string }> = {
    hero: { title: 'Executive Intelligence Overview', category: 'National Platform Briefing' },
    location: { title: 'Administrative Directory & Villages', category: 'Geospatial Registry' },
    farms: { title: 'Farm Cadastre & GIS Map', category: 'Land Management' },
    weather: { title: 'Agro-Meteorological Telemetry', category: 'Climate & Atmosphere' },
    mandi: { title: 'Agmarknet APMC Mandi Prices', category: 'Market Intelligence' },
    soil: { title: 'Soil Fertility & RDF (ICAR)', category: 'Agronomic Soil Health' },
    disease: { title: 'Crop Foliage Pathology', category: 'Plant Diagnostics' },
    yield: { title: 'Biometric Yield Estimation', category: 'Crop Science' },
    marketplace: { title: 'Produce Marketplace', category: 'Direct Trade' },
    governance: { title: 'Data Provenance & Audit', category: 'System Compliance' },
    admin_console: { title: 'Administrator Command Console', category: 'Executive Governance' },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Enterprise Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'admin_console' && !isAdmin) {
            // Block user from opening admin console
            return;
          }
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        userRole={userRole}
        onRoleChange={(role) => setUserRole(role)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        isAdmin={isAdmin}
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        onOpenAuthModal={handleOpenAuth}
        onSignOut={handleSignOut}
      />

      {/* Main Workspace Frame (offset by sidebar on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Administrator Global Bar (Visible only when an Admin is viewing User interface) */}
        {isAdmin && activeView === 'user' && (
          <div className="bg-slate-900 text-slate-200 px-4 sm:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-400 text-[11px] font-bold">
                ROOT ADMIN PRIVILEGE:
              </span>
              <strong className="text-white">Sai Venkat Akkineni</strong>
              <span className="hidden sm:inline text-slate-400">
                &mdash; Testing User / Farmer Interface
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setActiveView('admin');
                  setActiveTab('admin_console');
                }}
                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Return to Administrator Console</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 truncate">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 truncate">
              <span className="font-medium text-slate-600">
                {activeView === 'admin' ? 'Root Administration' : 'AgriSense Network'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900 truncate">
                {activeView === 'admin'
                  ? 'Administrator Command Console'
                  : tabTitles[activeTab]?.title || 'Workspace'}
              </span>
            </div>
          </div>

          {/* Right Status Lockup: Active Jurisdiction & Authentication */}
          <div className="flex items-center space-x-3 shrink-0 text-xs">
            {/* Administrator View Switcher Button (Admin only) */}
            {isAdmin && (
              <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('user');
                    if (activeTab === 'admin_console') setActiveTab('mandi');
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition flex items-center gap-1 ${
                    activeView === 'user'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>User View</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('admin');
                    setActiveTab('admin_console');
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition flex items-center gap-1 ${
                    activeView === 'admin'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>Admin Console</span>
                </button>
              </div>
            )}

            {/* User territory focus (when in user view) */}
            {activeView === 'user' && (
              <div className="hidden md:flex items-center space-x-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium truncate max-w-[180px]">
                  {activeLocation.village}, {activeLocation.district}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('location')}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px] underline ml-1 cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}

            <span className="hidden md:inline text-slate-300" aria-hidden="true">
              &bull;
            </span>

            {/* Owner Credit */}
            <div className="hidden lg:flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-slate-500 text-[11px]">Lead Architect:</span>
              <strong className="text-slate-900 font-bold text-xs">Sai Venkat Akkineni</strong>
            </div>

            {/* Login / Auth Trigger Button if not signed in */}
            {!currentUser && (
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenAuth('user')}
                  className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition"
                >
                  User Login
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAuth('admin')}
                  className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition hidden sm:inline-block"
                >
                  Admin Login
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Sub-Header Context Bar (User view only) */}
        {activeView === 'user' && (
          <div className="bg-slate-100/70 border-b border-slate-200 px-4 sm:px-8 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  {tabTitles[activeTab]?.category}
                </span>
                <span>&bull;</span>
                <span>
                  Coordinates:{' '}
                  <strong className="text-slate-700 font-mono">
                    {activeLocation.latitude.toFixed(4)}° N, {activeLocation.longitude.toFixed(4)}° E
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Demo Data Guarantee</span>
              </div>
            </div>
          </div>
        )}

        {/* Viewport Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* ==================== 1. ADMINISTRATOR INTERFACE ==================== */}
          {(activeView === 'admin' || activeTab === 'admin_console') && (
            isAdmin ? (
              <AdminConsole
                onSwitchToUserView={() => {
                  setActiveView('user');
                  setActiveTab('mandi');
                }}
                currentUserEmail={currentUser?.email}
              />
            ) : (
              <div className="bg-white border border-red-200 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-sm my-12">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Administrator Access Restricted</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    The Administrator interface and settings are reserved exclusively for executive administrators (Sai Venkat Akkineni). User accounts cannot access platform settings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('user');
                    setActiveTab('hero');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  Return to Farmer Dashboard
                </button>
              </div>
            )
          )}

          {/* ==================== 2. USER / FARMER INTERFACE ==================== */}
          {activeView === 'user' && activeTab !== 'admin_console' && (
            <>
              {activeTab === 'hero' && (
                <LandingHero
                  onNavigate={(tab) => setActiveTab(tab as ActiveTab)}
                  dbConnected={true}
                />
              )}

              {activeTab === 'mandi' && (
                <MandiModule
                  initialState={activeLocation.state}
                  initialDistrict={activeLocation.district}
                  isAdmin={isAdmin}
                />
              )}

              {activeTab === 'location' && (
                <div className="space-y-6">
                  <IndiaLocationSelector
                    onLocationSelected={handleLocationSelected}
                    defaultState={activeLocation.state}
                    defaultDistrict={activeLocation.district}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setActiveTab('farms')}
                      className="p-5 bg-white border border-slate-200 hover:border-emerald-600 rounded-xl cursor-pointer transition shadow-sm group"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          Map Farm Land Parcel in {activeLocation.village} &rarr;
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">02</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Draw verified field boundaries on ESRI satellite imagery and compute exact geodesic acreage.
                      </p>
                    </div>

                    <div
                      onClick={() => setActiveTab('weather')}
                      className="p-5 bg-white border border-slate-200 hover:border-emerald-600 rounded-xl cursor-pointer transition shadow-sm group"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          Inspect Live Weather for {activeLocation.village} &rarr;
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">03</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Query real-time meteorological observations and 7-day WMO forecast for this exact GPS coordinate.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'farms' && (
                <FarmRegistryModule
                  currentUserRole={userRole}
                  onSelectFarmForAnalysis={handleSelectFarmForAnalysis}
                />
              )}

              {activeTab === 'weather' && (
                <WeatherModule
                  latitude={activeLocation.latitude}
                  longitude={activeLocation.longitude}
                  locationName={`${activeLocation.village}, ${activeLocation.district}, ${activeLocation.state}`}
                />
              )}

              {activeTab === 'soil' && <SoilModule />}

              {activeTab === 'disease' && <DiseaseModule />}

              {activeTab === 'yield' && <YieldModule initialState={activeLocation.state} />}

              {activeTab === 'marketplace' && <MarketplaceModule currentUserRole={userRole} />}

              {activeTab === 'governance' && <GovernanceAuditModule />}
            </>
          )}
        </main>

        {/* Clean Institutional Footer with Owner Credit */}
        <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <strong className="text-slate-900 font-bold">AgriSense AI</strong>
                <span>&bull;</span>
                <span>Government-Grade Real-Data Platform</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Platform Architect &amp; Owner:{' '}
                <strong className="text-slate-900 font-semibold">Sai Venkat Akkineni</strong> (
                <span className="font-mono text-emerald-700">saivenkatakkineni00@gmail.com</span>)
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('admin');
                      setActiveTab('admin_console');
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-bold transition flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Administrator Settings</span>
                  </button>
                  <span>&bull;</span>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveView('user');
                  setActiveTab('governance');
                }}
                className="hover:text-slate-900 transition font-medium"
              >
                Data Provenance Inventory
              </button>
              <span>&bull;</span>
              <a
                href="https://data.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 transition flex items-center gap-1 font-medium"
              >
                <span>data.gov.in</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <span>&bull;</span>
              <a
                href="https://agmarknet.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 transition flex items-center gap-1 font-medium"
              >
                <span>Agmarknet</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Dual Login Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />
    </div>
  );
}
