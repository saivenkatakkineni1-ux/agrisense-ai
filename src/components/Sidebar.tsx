/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Enterprise Workspace Navigation Sidebar
 * Dual Interface Support: User (Farmer/Buyer) & Executive Administrator
 * Prominently Highlighting Lead Architect & Owner: Sai Venkat Akkineni
 */

import React from 'react';
import {
  Sprout,
  ShieldCheck,
  Landmark,
  CloudSun,
  TrendingUp,
  FlaskConical,
  Microscope,
  Calculator,
  ShoppingBag,
  ScrollText,
  UserCheck,
  LogIn,
  LogOut,
  User,
  Award,
  Activity,
  Sliders,
  Server,
  Key,
  Users,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

export type ActiveTab =
  | 'hero'
  | 'location'
  | 'farms'
  | 'weather'
  | 'mandi'
  | 'soil'
  | 'disease'
  | 'yield'
  | 'marketplace'
  | 'governance'
  | 'admin_console';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: FirebaseUser | null;
  userRole: string;
  onRoleChange: (role: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  isAdmin: boolean;
  activeView: 'user' | 'admin';
  onViewChange: (view: 'user' | 'admin') => void;
  onOpenAuthModal: (defaultTab?: 'user' | 'admin') => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  userRole,
  onRoleChange,
  mobileOpen,
  onMobileClose,
  isAdmin,
  activeView,
  onViewChange,
  onOpenAuthModal,
  onSignOut,
}) => {
  // User navigation items (Farmer / Produce Buyer)
  const userNavItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'hero', label: 'Executive Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'mandi', label: 'Agmarknet APMC Mandi', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'weather', label: 'Weather Telemetry', icon: <CloudSun className="w-4 h-4" /> },
    { id: 'farms', label: 'Farm Cadastre & Map', icon: <Sprout className="w-4 h-4" /> },
    { id: 'soil', label: 'Soil Health & RDF', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'disease', label: 'Crop Foliage Pathology', icon: <Microscope className="w-4 h-4" /> },
    { id: 'yield', label: 'Biometric Yield', icon: <Calculator className="w-4 h-4" /> },
    { id: 'marketplace', label: 'Produce Marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'location', label: 'Village Directory', icon: <Landmark className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 ${
          activeView === 'admin' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        } border-r flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className={`p-5 border-b ${activeView === 'admin' ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-100'}`}>
            <div className="flex items-center space-x-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${
                  activeView === 'admin' ? 'bg-emerald-500' : 'bg-emerald-600'
                }`}
              >
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h1 className={`text-base font-bold tracking-tight leading-none ${activeView === 'admin' ? 'text-white' : 'text-slate-900'}`}>
                  AgriSense AI
                </h1>
                <span className={`text-[11px] font-medium ${activeView === 'admin' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {activeView === 'admin' ? 'Institutional Admin Console' : 'National Agricultural Platform'}
                </span>
              </div>
            </div>

            {/* Owner Lockup */}
            <div
              className={`mt-4 p-3 rounded-xl border ${
                activeView === 'admin'
                  ? 'bg-slate-900/80 border-slate-700/80 text-white'
                  : 'bg-emerald-50/70 border-emerald-100 text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Award className={`w-4 h-4 shrink-0 ${activeView === 'admin' ? 'text-amber-400' : 'text-emerald-700'}`} />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    activeView === 'admin' ? 'text-amber-400' : 'text-emerald-800'
                  }`}
                >
                  Platform Architect &amp; Owner
                </span>
              </div>
              <div className="mt-1 font-bold text-sm tracking-tight">Sai Venkat Akkineni</div>
              <div
                className={`text-[11px] font-mono truncate ${
                  activeView === 'admin' ? 'text-slate-400' : 'text-emerald-700/80'
                }`}
              >
                saivenkatakkineni00@gmail.com
              </div>
            </div>
          </div>

          {/* ADMINISTRATOR DUAL-INTERFACE SWITCHER (Only visible to Administrator) */}
          {isAdmin && (
            <div className="p-3 border-b border-slate-200/80 bg-slate-100/60 dark:bg-slate-900/60 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                Interface Mode (Admin Privileged)
              </div>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    onViewChange('user');
                    if (activeTab === 'admin_console') onTabChange('hero');
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeView === 'user'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>User View</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onViewChange('admin');
                    onTabChange('admin_console');
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeView === 'admin'
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Console</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1">
            <div
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                activeView === 'admin' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {activeView === 'admin' ? 'Administration & Governance' : 'Kisan & Produce Modules'}
            </div>

            {/* If in Admin view, show Admin console link */}
            {activeView === 'admin' ? (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('admin_console');
                    onMobileClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition text-left bg-emerald-600 text-white shadow-sm"
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>Administrator Console</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onTabChange('governance');
                    onMobileClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition text-left ${
                    activeTab === 'governance'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ScrollText className="w-4 h-4 text-slate-400" />
                    <span>Data Provenance Registry</span>
                  </div>
                </button>

                <div className="pt-3 px-3">
                  <button
                    type="button"
                    onClick={() => {
                      onViewChange('user');
                      onTabChange('mandi');
                      onMobileClose();
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Inspect User / Farmer Modules &rarr;</span>
                  </button>
                </div>
              </div>
            ) : (
              /* User Navigation List */
              userNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onTabChange(item.id);
                      onMobileClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </button>
                );
              })
            )}

            {/* Admin shortcut if user view but logged in as admin */}
            {activeView === 'user' && isAdmin && (
              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onViewChange('admin');
                    onTabChange('admin_console');
                    onMobileClose();
                  }}
                  className="w-full p-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center justify-between transition hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Open Admin Settings</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Footer Account & Dual Login Controls */}
        <div
          className={`p-4 border-t ${
            activeView === 'admin' ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/50'
          } space-y-3`}
        >
          {/* User Sign-In / Account Status */}
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2 truncate">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isAdmin ? 'A' : currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                  <div className="truncate">
                    <div
                      className={`text-xs font-semibold truncate ${
                        activeView === 'admin' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {currentUser.displayName || currentUser.email}
                    </div>
                    <div
                      className={`text-[10px] truncate ${
                        isAdmin ? 'text-amber-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {isAdmin ? 'Executive Administrator' : `${userRole} Session`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Role Indicator */}
              <div
                className={`p-1.5 rounded text-[11px] flex items-center justify-between ${
                  activeView === 'admin' ? 'bg-slate-800 text-slate-300' : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                  <UserCheck className="w-3 h-3 text-emerald-500" />
                  Role:
                </span>
                <span className="font-semibold text-emerald-600 text-xs">
                  {isAdmin ? 'SYSTEM_ADMIN' : userRole}
                </span>
              </div>
            </div>
          ) : (
            /* Dual Logins Trigger */
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onOpenAuthModal('user')}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in as Farmer / User</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuthModal('admin')}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Administrator Login</span>
              </button>
            </div>
          )}

          {/* Zero Demo Data Assurance Text */}
          <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Strict Zero Demo Data Policy Enforced</span>
          </div>
        </div>
      </aside>
    </>
  );
};
