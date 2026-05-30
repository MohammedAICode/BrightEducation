import {
  FiGrid,
  FiUsers,
  FiUser,
  FiX,
  FiClipboard,
  FiCalendar,
  FiBell,
} from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';
import type { MenuItem } from '../../types';
import logo from '/logo.svg';

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
    { id: 'students', label: 'Students', icon: <FiUser className="w-5 h-5" /> },
    { id: 'staff', label: 'Staff', icon: <FiUsers className="w-5 h-5" /> },
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

/**
 * Unified sidebar component that displays role-based menu items.
 * Uses Redux for authentication state.
 */
export function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const user = useAppSelector((state) => state.auth.user);

  const menuItems = user ? (menuConfig[user.role] || []) : [];
  const dashboardTitle = user && user.role ? `${user.role.charAt(0) + user.role.slice(1).toLowerCase()} Dashboard` : 'Dashboard';

  const handleMenuClick = (id: string) => {
    setActiveTab(id);
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
            <MenuButton
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={() => handleMenuClick(item.id)}
            />
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
  onClick: () => void;
}

function MenuButton({ item, isActive, onClick }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
        isActive ? 'bg-white text-blue-900 shadow-lg' : 'text-blue-100 hover:bg-blue-700'
      }`}
    >
      {item.icon}
      <span className="font-medium">{item.label}</span>
    </button>
  );
}
