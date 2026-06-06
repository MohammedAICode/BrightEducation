import { useMemo } from 'react';
import {
  FiGrid,
  FiUsers,
  FiUser,
  FiX,
  FiClipboard,
  FiCalendar,
  FiBell,
  FiChevronDown,
  FiChevronRight,
  FiSettings,
} from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';
import type { MenuItem } from '../../types';
import logo from '/logo.svg';
import { useState, useEffect } from 'react';
import axiosInstance from '../../lib/axios';

/**
 * Menu configuration per role.
 * Defines which menu items are visible for each user role.
 * Icon config uses string IDs to avoid recreating JSX on every render.
 */
const iconMap: Record<string, React.ReactNode> = {
  grid: <FiGrid className="w-5 h-5" />,
  bell: <FiBell className="w-5 h-5" />,
  calendar: <FiCalendar className="w-5 h-5" />,
  clipboard: <FiClipboard className="w-5 h-5" />,
  users: <FiUsers className="w-5 h-5" />,
  user: <FiUser className="w-5 h-5" />,
  settings: <FiSettings className="w-5 h-5" />,
};

const menuConfig: Partial<Record<string, MenuItem[]>> = {
  ADMIN: [
    { id: 'overview', label: 'Overview', icon: iconMap.grid },
    { id: 'notifications', label: 'Notifications', icon: iconMap.bell },
    { id: 'academic-year', label: 'Academic Year', icon: iconMap.calendar },
    { id: 'attendance', label: 'Attendance', icon: iconMap.clipboard },
    { id: 'management', label: 'Management', icon: iconMap.users },
    { id: 'teachers', label: 'Teachers', icon: iconMap.users },
    { id: 'students', label: 'Students', icon: iconMap.user },
    { id: 'staff', label: 'Staff', icon: iconMap.users },
    { id: 'profile-update-requests', label: 'Profile Updates', icon: iconMap.user },
    { id: 'settings', label: 'Settings', icon: iconMap.settings },
  ],
  MANAGEMENT: [
    { id: 'overview', label: 'Overview', icon: iconMap.grid },
    { id: 'notifications', label: 'Notifications', icon: iconMap.bell },
    { id: 'academic-year', label: 'Academic Year', icon: iconMap.calendar },
    { id: 'teachers', label: 'Teachers', icon: iconMap.users },
    { id: 'students', label: 'Students', icon: iconMap.user },
  ],
  TEACHER: [
    { id: 'overview', label: 'Overview', icon: iconMap.grid },
    { id: 'notifications', label: 'Notifications', icon: iconMap.bell },
    { id: 'academic-year', label: 'Academic Year', icon: iconMap.calendar },
    { id: 'students', label: 'Students', icon: iconMap.user },
  ],
  STUDENT: [
    { id: 'overview', label: 'Overview', icon: iconMap.grid },
    { id: 'notifications', label: 'Notifications', icon: iconMap.bell },
    { id: 'academic-year', label: 'Academic Year', icon: iconMap.calendar },
  ],
  STAFF: [
    { id: 'overview', label: 'Overview', icon: iconMap.grid },
    { id: 'notifications', label: 'Notifications', icon: iconMap.bell },
    { id: 'academic-year', label: 'Academic Year', icon: iconMap.calendar },
  ],
};

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface AcademicYear {
  id: string;
  name: string;
  isActive: boolean;
}

/**
 * Unified sidebar component that displays role-based menu items.
 * Uses Redux for authentication state.
 */
export function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const user = useAppSelector((state) => state.auth.user) as any;
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isAcademicYearExpanded, setIsAcademicYearExpanded] = useState(false);

  const menuItems = useMemo(() => {
    return user ? (menuConfig[user.role] || []) : [];
  }, [user?.role]);

  const dashboardTitle = useMemo(() => {
    return user && user.role ? `${user.role.charAt(0) + user.role.slice(1).toLowerCase()} Dashboard` : 'Dashboard';
  }, [user?.role]);

  useEffect(() => {
    fetchAcademicYears();
    
    // Listen for academic year refresh events
    const handleRefresh = () => {
      fetchAcademicYears();
    };
    
    window.addEventListener('academic-year-refresh', handleRefresh);
    
    return () => {
      window.removeEventListener('academic-year-refresh', handleRefresh);
    };
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await axiosInstance.get('/academic-year');
      setAcademicYears(response.data.body || []);
    } catch (error) {
      // Silent fail - don't show error for sidebar fetch
    }
  };

  const handleMenuClick = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  const handleToggleExpand = () => {
    setIsAcademicYearExpanded(!isAcademicYearExpanded);
  };

  const handleAcademicYearClick = (yearId: string) => {
    setActiveTab(`academic-year-${yearId}`);
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <SidebarHeader dashboardTitle={dashboardTitle} onClose={() => setIsMobileOpen(false)} />

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.id}>
              <MenuButton
                item={item}
                isActive={activeTab === item.id}
                isExpanded={item.id === 'academic-year' ? isAcademicYearExpanded : false}
                onClick={() => handleMenuClick(item.id)}
                onToggleExpand={item.id === 'academic-year' ? handleToggleExpand : undefined}
              />
              {item.id === 'academic-year' && isAcademicYearExpanded && academicYears.length > 0 && (
                <div className="ml-6 mt-1 space-y-0.5">
                  {academicYears.map((year) => (
                    <button
                      key={year.id}
                      onClick={() => handleAcademicYearClick(year.id)}
                      className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                        activeTab === `academic-year-${year.id}`
                          ? 'bg-white/15 text-white font-medium shadow-sm'
                          : 'text-blue-200/70 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <FiCalendar className="w-3.5 h-3.5" />
                      <span>{year.name}</span>
                      {year.isActive && (
                        <span className="ml-auto w-2 h-2 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/50"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Decorative bottom element */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-2 text-blue-300/50 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div>
            <span>System Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}

interface SidebarHeaderProps {
  dashboardTitle: string;
  onClose: () => void;
}

function SidebarHeader({ dashboardTitle, onClose }: SidebarHeaderProps) {
  return (
    <div className="p-6 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/95 p-2 rounded-xl shadow-lg shadow-blue-900/20">
            <img
              src={logo}
              alt="Bright Academy Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">Bright</h2>
            <p className="text-xs text-blue-300/60">{dashboardTitle}</p>
          </div>
        </div>
        <button className="lg:hidden text-white/70 hover:text-white transition-colors" onClick={onClose}>
          <FiX className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

interface MenuButtonProps {
  item: MenuItem;
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
  onToggleExpand?: () => void;
}

function MenuButton({ item, isActive, isExpanded = false, onClick, onToggleExpand }: MenuButtonProps) {
  const hasExpandableChildren = item.id === 'academic-year';

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={onClick}
        className={`flex-1 flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-white text-blue-950 shadow-lg shadow-blue-900/20 font-semibold'
            : 'text-blue-100/70 hover:bg-white/8 hover:text-white'
        }`}
      >
        <div className={`flex items-center space-x-3 ${isActive ? '' : 'group-hover:translate-x-0.5 transition-transform duration-200'}`}>
          <span className={isActive ? 'text-blue-600' : ''}>{item.icon}</span>
          <span className="font-medium text-sm">{item.label}</span>
        </div>
      </button>
      {hasExpandableChildren && onToggleExpand && (
        <button
          onClick={onToggleExpand}
          className="p-2.5 rounded-xl transition-all duration-200 text-blue-100/70 hover:bg-white/8 hover:text-white"
        >
          {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
