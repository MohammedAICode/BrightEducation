import React, { useState, useRef, useEffect, useMemo } from 'react';

import { FiMenu, FiUser, FiLogOut, FiClock, FiAlertTriangle } from 'react-icons/fi';

import { useNavigate, useLocation } from 'react-router-dom';

import { Sidebar } from '../components/common/Sidebar';

import { useAppSelector, useAppDispatch } from '../store/hooks';

import { logout } from '../store/authSlice';

import Overview from '../components/dashboard/Overview';

import Students from '../components/dashboard/Students';

import Teachers from '../components/dashboard/Teachers';

import Profile from '../components/dashboard/Profile';

import ProfileUpdateRequests from '../components/dashboard/ProfileUpdateRequests';

import Attendance from '../components/dashboard/Attendance';

import AcademicYear from '../components/dashboard/AcademicYear';

import AcademicYearDetail from '../components/dashboard/AcademicYearDetail';

import Management from '../components/dashboard/Management';

import Staff from '../components/dashboard/Staff';

import UserAvatar from '../components/common/UserAvatar';

import NotificationBell from '../components/common/NotificationBell';

import Notifications from '../components/dashboard/Notifications';

import { Settings } from '../components/dashboard/Settings';

import axiosInstance from '../lib/axios';

import { useSystemSettings } from '../contexts/SystemSettingsContext';



/**

 * Generate page title from active tab

 */

function getPageTitle(activeTab: string): string {

  if (activeTab.startsWith('academic-year-')) {

    return 'Academic Year Details';

  }

  return activeTab.replace('-', ' ');

}



/**

 * Content renderer for dashboard tabs.

 * Maps tab IDs to their corresponding components.

 */

function renderContent(activeTab: string): React.ReactNode {

  // Handle specific academic year tabs (e.g., academic-year-123)

  if (activeTab.startsWith('academic-year-')) {

    const yearId = activeTab.replace('academic-year-', '');

    return <AcademicYearDetail yearId={yearId} />;

  }



  switch (activeTab) {

    case 'overview':

      return <Overview />;

    case 'notifications':

      return <Notifications />;

    case 'attendance':

      return <Attendance />;

    case 'management':

      return <Management />;

    case 'teachers':

      return <Teachers />;

    case 'students':

      return <Students />;

    case 'staff':

      return <Staff />;

    case 'academic-year':

      return <AcademicYear />;

    case 'profile':

      return <Profile />;

    case 'profile-update-requests':

      return <ProfileUpdateRequests />;

    case 'settings':

      return <Settings />;

    default:

      return <Overview />;

  }

}


/**
 * Isolated Clock component — re-renders every second
 * without triggering re-render of the entire dashboard layout.
 */
function Clock({ timezone }: { timezone: string }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(currentTime);
  }, [currentTime, timezone]);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(currentTime);
  }, [currentTime, timezone]);

  return (
    <div className="flex items-center space-x-3 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100/50 shadow-sm">
      <div className="flex items-center space-x-2">
        <FiClock className="w-4 h-4 text-blue-600" />
        <span className="font-semibold text-gray-900 tabular-nums">{formattedTime}</span>
      </div>
      <div className="h-4 w-px bg-blue-200/50"></div>
      <span className="text-xs text-gray-500 font-medium">{formattedDate}</span>
    </div>
  );
}


/**

 * Admin Dashboard layout component.

 * Displays the sidebar and main content area for admin users.

 */

export default function AdminDashboardLayout() {

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [systemTimezone, setSystemTimezone] = useState('Asia/Kolkata');

  const { isLoading: settingsLoading, isConfigured } = useSystemSettings();



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



  // Fetch system timezone on mount

  useEffect(() => {

    const fetchSystemTimezone = async () => {

      try {

        const response = await axiosInstance.get('/system-settings');

        setSystemTimezone(response.data.body.timezone);

      } catch (error) {

        console.error('Failed to fetch system timezone:', error);

      }

    };

    fetchSystemTimezone();

  }, []);



  const handleLogout = () => {

    dispatch(logout());

    navigate('/login');

  };



  // Show fallback message if system not configured

  if (settingsLoading) {

    return (

      <div className="flex h-screen bg-gray-50 items-center justify-center">

        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

      </div>

    );

  }



  if (!isConfigured) {

    return (

      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center max-w-md">

          <FiAlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />

          <h2 className="text-xl font-semibold text-gray-900 mb-2">

            System Not Configured

          </h2>

          <p className="text-gray-600 mb-4">

            Please contact the administrator to configure the system timezone.

          </p>

          <p className="text-sm text-gray-500 mb-6">

            This is required for fee calculations and notifications to work correctly.

          </p>

          {user?.role === 'ADMIN' && (

            <button

              onClick={() => setActiveTab('settings')}

              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20"

            >

              Configure Now

            </button>

          )}

        </div>

      </div>

    );

  }



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

                <h1 className="text-xl font-bold text-gray-900 capitalize tracking-tight">{getPageTitle(activeTab)}</h1>

              </div>

            </div>



            <div className="flex items-center gap-3">

              {/* System Time Display — isolated to avoid full layout re-renders */}
              <Clock timezone={systemTimezone} />

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

                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors font-medium text-left rounded-lg mx-1 first:mt-0"

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
