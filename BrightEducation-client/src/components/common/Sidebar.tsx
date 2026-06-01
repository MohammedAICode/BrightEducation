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
} from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';
import type { MenuItem } from '../../types';
import logo from '/logo.svg';
import { useState, useEffect } from 'react';
import axiosInstance from '../../lib/axios';

/**
 * Menu configuration per role.
 * Defines which menu items are visible for each user role.
 */
const menuConfig: Partial<Record<string, MenuItem[]>> = {
  ADMIN: [
    { id: 'overview', label: 'Overview', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell className="w-5 h-5" /> },
    { id: 'academic-year', label: 'Academic Year', icon: <FiCalendar className="w-5 h-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <FiClipboard className="w-5 h-5" /> },
    { id: 'management', label: 'Management', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'teachers', label: 'Teachers', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'students', label: 'Students', icon: <FiUser className="w-5 h-5" /> },
    { id: 'staff', label: 'Staff', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'profile-update-requests', label: 'Profile Updates', icon: <FiUser className="w-5 h-5" /> },
  ],
  MANAGEMENT: [
    { id: 'overview', label: 'Overview', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell className="w-5 h-5" /> },
    { id: 'academic-year', label: 'Academic Year', icon: <FiCalendar className="w-5 h-5" /> },
    { id: 'teachers', label: 'Teachers', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'students', label: 'Students', icon: <FiUser className="w-5 h-5" /> },
  ],
  TEACHER: [
    { id: 'overview', label: 'Overview', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell className="w-5 h-5" /> },
    { id: 'academic-year', label: 'Academic Year', icon: <FiCalendar className="w-5 h-5" /> },
    { id: 'students', label: 'Students', icon: <FiUser className="w-5 h-5" /> },
  ],
  STUDENT: [
    { id: 'overview', label: 'Overview', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell className="w-5 h-5" /> },
    { id: 'academic-year', label: 'Academic Year', icon: <FiCalendar className="w-5 h-5" /> },
  ],
  STAFF: [
    { id: 'overview', label: 'Overview', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell className="w-5 h-5" /> },
    { id: 'academic-year', label: 'Academic Year', icon: <FiCalendar className="w-5 h-5" /> },
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
  const user = useAppSelector((state) => state.auth.user);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isAcademicYearExpanded, setIsAcademicYearExpanded] = useState(false);

  const menuItems = user ? (menuConfig[user.role] || []) : [];
  const dashboardTitle = user && user.role ? `${user.role.charAt(0) + user.role.slice(1).toLowerCase()} Dashboard` : 'Dashboard';

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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-linear-to-b from-blue-900 to-blue-800 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <SidebarHeader dashboardTitle={dashboardTitle} onClose={() => setIsMobileOpen(false)} />

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                <div className="ml-6 mt-1 space-y-1">
                  {academicYears.map((year) => (
                    <button
                      key={year.id}
                      onClick={() => handleAcademicYearClick(year.id)}
                      className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm ${
                        activeTab === `academic-year-${year.id}`
                          ? 'bg-blue-700 text-white'
                          : 'text-blue-200 hover:bg-blue-700/50'
                      }`}
                    >
                      <FiCalendar className="w-4 h-4" />
                      <span>{year.name}</span>
                      {year.isActive && (
                        <span className="ml-auto w-2 h-2 bg-green-400 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
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
    <div className="p-6 border-b border-blue-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg">
            <img
              src={logo}
              alt="Bright Academy Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg">Bright</h2>
            <p className="text-xs text-blue-300">{dashboardTitle}</p>
          </div>
        </div>
        <button className="lg:hidden" onClick={onClose}>
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
        className={`flex-1 flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
          isActive ? 'bg-white text-blue-900 shadow-lg' : 'text-blue-100 hover:bg-blue-700'
        }`}
      >
        <div className="flex items-center space-x-3">
          {item.icon}
          <span className="font-medium">{item.label}</span>
        </div>
      </button>
      {hasExpandableChildren && onToggleExpand && (
        <button
          onClick={onToggleExpand}
          className="p-3 rounded-lg transition-all text-blue-100 hover:bg-blue-700"
        >
          {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
