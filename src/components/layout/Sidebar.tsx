import React from 'react';
import { LayoutDashboard, FolderKanban, Users, FileText, Settings, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logOut } from '../../firebase/auth';

export type ActiveTab = 'dashboard' | 'projects' | 'clients' | 'invoices' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { user, isGuestMode, settings } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  const handleLogout = async () => {
    await logOut();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E7EB] w-64 selection:bg-gray-100">
      {/* Brand & Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center shrink-0">
          {settings?.businessLogoUrl ? (
            <img src={settings.businessLogoUrl} alt="Logo" className="h-full w-full object-cover rounded-lg" />
          ) : (
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          )}
        </div>
        <span className="font-bold text-lg tracking-tight text-[#111827]">
          Client Ledger
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 mt-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-[#F3F4F6] text-[#111827]'
                  : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Demo / Guest Banner if active */}
      {isGuestMode && (
        <div className="mx-4 my-2 p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Demo Mode</p>
            <p className="text-[11px] opacity-80">Explore freely or log in to sync.</p>
          </div>
        </div>
      )}

      {/* User Profile Card & Sign Out */}
      <div className="p-4 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-3 p-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-[#111827] shrink-0">
              {user?.displayName
                ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                : user?.email
                ? user.email.substring(0, 2).toUpperCase()
                : 'JD'}
            </div>
          )}
          <div className="flex-1 overflow-hidden min-w-0">
            <p className="text-sm font-semibold text-[#111827] truncate">
              {user?.displayName || (isGuestMode ? 'John Doe Design' : 'Designer Account')}
            </p>
            <p className="text-xs text-[#6B7280] truncate">
              {user?.email || (isGuestMode ? 'john@studio.com' : '')}
            </p>
          </div>

          {user && (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Developer Credit */}
        <div className="mt-2 pt-2.5 border-t border-gray-100 text-center">
          <p className="text-[11px] text-[#6B7280]">
            Developed by{' '}
            <a
              href="https://v0-musasohel.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#111827] hover:underline hover:text-blue-600 transition-colors"
            >
              Mohammad Sohel
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Slide-over */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setIsOpenMobile(false)}
          />
          <div className="relative flex-1 max-w-xs w-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
