import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Bookmark,
  Code2,
  Crown,
  Settings,
  LogOut,
  User,
  Lock,
  CreditCard,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { toast } from 'sonner';
import { useSidebar } from '@/contexts/SidebarContext';
import logodatacareer from '../../../public/logoDataCareer.png';
import favicon from '../../../public/favicon.png';


const Sidebar: React.FC = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Mock user data - replace with actual user data from Redux/context
  const userPlan = 'free'; // or 'premium'

  const handleLogout = async () => {
    try {
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      name: 'Job Database',
      icon: Database,
      path: '/job-database',
    },
    {
      name: 'Saved Jobs',
      icon: Bookmark,
      path: '/',
    },
    {
      name: 'SQL Practice',
      icon: Code2,
      path: '/sql-practice',
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
       {/* Logo Section */}
       <div className="p-4 border-b border-gray-200">
         <Link to="/" className="flex items-center justify-start">
           {isCollapsed ? (
             <img src={favicon} alt="DCA" className="h-8 w-8 object-contain" />
           ) : (
             <img src={logodatacareer} alt="DataCareer App" className="h-12 w-[180px] object-contain" />
           )}
         </Link>
       </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-datacareer-darkBlue text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}

        {/* Upgrade Button - Show only if user is on free plan */}
        {userPlan === 'free' && (
          <Button
            variant="outline"
            className={`w-full justify-start gap-3 px-3 py-2.5   ${
              isCollapsed ? 'px-2' : ''
            }`}
            onClick={() => {
              setIsMobileOpen(false);
              navigate('/upgrade');
            }}
          >
            <Crown className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Upgrade</span>}
          </Button>
        )}
      </nav>

      {/* Bottom Section - Settings & Logout */}
      <div className="p-3 border-t border-gray-200 space-y-1">
        {/* User Account Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 ${
                isCollapsed ? 'px-2' : ''
              }`}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Account Settings</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setIsMobileOpen(false);
                navigate('/settings/subscription');
              }}
              className="cursor-pointer"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Manage Subscription</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsMobileOpen(false);
                navigate('/settings/password');
              }}
              className="cursor-pointer"
            >
              <Lock className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsMobileOpen(false);
                navigate('/settings/profile');
              }}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Change Name</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 ${
            isCollapsed ? 'px-2' : ''
          }`}
          onClick={() => {
            setIsMobileOpen(false);
            handleLogout();
          }}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </Button>
      </div>

      {/* Collapse/Expand Button - Desktop Only */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-7 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-full transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;

