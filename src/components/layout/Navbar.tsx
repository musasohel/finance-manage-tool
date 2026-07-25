import React from 'react';
import { Menu, Plus, Search, UserCheck, UserPlus, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from './Sidebar';

interface NavbarProps {
  activeTab: ActiveTab;
  setIsOpenMobile: (open: boolean) => void;
  onOpenAddClient: () => void;
  onOpenAddProject: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setIsOpenMobile,
  onOpenAddClient,
  onOpenAddProject,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
}) => {
  const { user, isGuestMode } = useAuth();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview & Recent Payments';
      case 'projects':
        return 'Projects Management';
      case 'clients':
        return 'Clients Directory';
      case 'invoices':
        return 'Invoices & Billing';
      case 'settings':
        return 'Business Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-16 border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-8 bg-white sticky top-0 z-30">
      {/* Left: Mobile Toggle & Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="md:hidden p-2 text-[#111827] hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#111827] tracking-tight">
            {getTitle()}
          </h1>
        </div>
      </div>

      {/* Middle: Search Bar */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-full text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#111827] bg-gray-50 text-[#111827]"
          />
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'clients' && (
            <button
              onClick={onOpenAddClient}
              className="bg-[#111827] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Client</span>
            </button>
          )}

          {(activeTab === 'dashboard' || activeTab === 'projects' || activeTab === 'invoices') && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddClient}
                className="hidden lg:flex items-center gap-1.5 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#111827] font-medium py-2 px-3 rounded-lg text-sm transition-all"
              >
                <UserPlus className="h-4 w-4 text-[#6B7280]" />
                <span>Add Client</span>
              </button>
              <button
                onClick={onOpenAddProject}
                className="bg-[#111827] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>+ New Project</span>
              </button>
            </div>
          )}

          {!user && isGuestMode && (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 border border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-medium py-2 px-3 rounded-lg text-sm transition-all"
            >
              <UserCheck className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
