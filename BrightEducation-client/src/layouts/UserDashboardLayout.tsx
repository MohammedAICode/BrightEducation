import React, { useState, useRef, useEffect } from 'react';
import { FiMenu, FiUser, FiLogOut } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/authSlice';
import Overview from '../components/dashboard/Overview';
import Profile from '../components/dashboard/Profile';
import AcademicYear from '../components/dashboard/AcademicYear';
import UserAvatar from '../components/common/UserAvatar';
import NotificationBell from '../components/common/NotificationBell';
import Notifications from '../components/dashboard/Notifications';

/**
 * Content renderer for user dashboard tabs.
 * Maps tab IDs to their corresponding components.
 */
function renderContent(activeTab: string): React.ReactNode {
  switch (activeTab) {
    case 'overview':
      return <Overview />;
    case 'notifications':
      return <Notifications />;
    case 'academic-year':
      return <AcademicYear />;
    case 'profile':
      return <Profile />;
    default:
      return <Overview />;
  }
}

/**
 * User Dashboard layout component.
 * Displays the sidebar and main content area for non-admin users (TEACHER, STUDENT, STAFF, MANAGEMENT).
 */
export default function UserDashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute activeTab from current path
  const lastSegment = location.pathname.split('/').filter(Boolean).pop();
  const activeTab = lastSegment && lastSegment !== 'dashboard' ? lastSegment : 'overview';
  
  const setActiveTab = (tab: string) => {
    navigate(`/dashboard/${tab}`);
  };

  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
      navigate('/dashboard/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50/80">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-6 py-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors" 
                onClick={() => setIsMobileOpen(true)}
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationBell />

              <div className="h-6 w-px bg-gray-200/60"></div>

              {/* User Profile Dropdown Card */}
              {user && (
                <div className="relative pl-1" ref={dropdownRef}>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="hidden sm:flex flex-col text-right select-none">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{user.fullName}</span>
                      <span className="text-xs font-medium text-blue-600 tracking-wide uppercase px-2 py-0.5 bg-blue-50 rounded-md border border-blue-100 self-end mt-0.5 transition-all group-hover:bg-blue-100/50">
                        {user.role}
                      </span>
                    </div>
                    <UserAvatar
                      profileImg={user.profileImg}
                      alt={user.fullName}
                      size="md"
                    />
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100/80 py-1.5 z-50 animate-fade-in-up">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors font-medium text-left rounded-lg mx-1"
                      >
                        <FiUser className="w-4 h-4 text-gray-400" />
                        My Profile
                      </button>
                      <div className="h-px bg-gray-100 my-1 mx-3"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium text-left rounded-lg mx-1"
                      >
                        <FiLogOut className="w-4 h-4 text-red-400" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderContent(activeTab)}
          </div>
        </main>
      </div>
    </div>
  );
}
