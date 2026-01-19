import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Code2,
  Crown,
  Settings,
  LogOut,
  User,
  Lock,
  CreditCard,
  Menu,
  X,
  Clock,
  FileText,
  Target,
  Mail,
  ShoppingBag,
  Bot
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { toast } from 'sonner';
import { useSidebar } from '@/contexts/SidebarContext';
import { paymentService } from '@/redux/services/payment';
import logodatacareer from '../../../public/logoDataCareer.png';
import favicon from '../../../public/DCA - Full Colour Logo Only (1).svg';


const Sidebar: React.FC = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, trialStatus, trialDaysRemaining } = useAppSelector((state) => state.auth);

  // Read user from localStorage (fresher data after payment success, like ProtectedRoute)
  const readUserFromStorage = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // Prefer freshest user data (localStorage may be newer than Redux after payment success)
  const userFromStorage = readUserFromStorage();
  const effectiveUser = userFromStorage || user;

  // Check if user has active subscription (same logic as ProtectedRoute)
  const subscriptionStatus = (effectiveUser?.subscriptionStatus || '').toString().toLowerCase();
  const hasActiveSubscription =
    effectiveUser?.paymentDone === true ||
    trialStatus === 'paid' ||
    subscriptionStatus === 'active' ||
    subscriptionStatus === 'trialing' ||
    subscriptionStatus === 'trial';

  // Determine user plan based on payment status
  const userPlan = hasActiveSubscription ? 'premium' : 'free';

  const handleLogout = async () => {
    try {
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleUpgrade = async () => {
    setIsMobileOpen(false);
    setIsUpgrading(true);

    try {
      // Create Stripe checkout session and redirect
      const response = await paymentService.createCheckoutSession();

      if (response.success && response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      const errorMessage = error.message || 'Failed to start checkout. Please try again.';
      toast.error(errorMessage);
      setIsUpgrading(false);
    }
  };

  const isActiveRoute = (path: string) => {
    // For SQL Practice (path === '/sql-questions'), also match question detail pages
    if (path === '/sql-questions') {
      return location.pathname === '/sql-questions' || location.pathname.startsWith('/question/');
    }
    return location.pathname === path;
  };

  const getTrialInfo = () => {
    const TRIAL_DAYS = 7;
    // Prefer trialDaysRemaining from Redux
    if (typeof trialDaysRemaining === 'number') {
      const remaining = Math.max(0, Math.min(TRIAL_DAYS, trialDaysRemaining));
      const used = Math.max(0, Math.min(TRIAL_DAYS, TRIAL_DAYS - remaining));
      return { used, remaining, total: TRIAL_DAYS };
    }

    // Fallback to calculation from trialStart
    const trialStartRaw = (user as any)?.trialStart;
    if (trialStartRaw) {
      const start = new Date(trialStartRaw);
      if (!Number.isNaN(start.getTime())) {
        const msPerDay = 1000 * 60 * 60 * 24;
        const days = Math.floor((Date.now() - start.getTime()) / msPerDay);
        const used = Math.max(0, Math.min(TRIAL_DAYS, days + 1));
        const remaining = Math.max(0, TRIAL_DAYS - used);
        return { used, remaining, total: TRIAL_DAYS };
      }
    }

    if ((user as any)?.trialUsed === true) {
      return { used: TRIAL_DAYS, remaining: 0, total: TRIAL_DAYS };
    }

    return null;
  };

  const trialInfo = getTrialInfo();

  const navigationItems = [
    {
      name: 'Job Database',
      icon: Database,
      path: '/',
    },
    {
      name: 'SQL Practice',
      icon: Code2,
      path: '/sql-questions',
    },
    {
      name: 'Resume AI',
      icon: FileText,
      path: '/resume-ai',
      comingSoon: true,
    },
    {
      name: 'Data Skill Radar',
      icon: Target,
      path: '/skill-radar',
      comingSoon: true,
    },
    {
      name: 'Cover Letter AI',
      icon: Mail,
      path: '/cover-letter-ai',
      comingSoon: true,
    },
    {
      name: 'Dataset Marketplace',
      icon: ShoppingBag,
      path: '/marketplace',
      comingSoon: true,
    },
    {
      name: 'Interview Prep AI',
      icon: Bot,
      path: '/interview-prep',
      comingSoon: true,
    },

  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center justify-center">
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

          if ((item as any).comingSoon) {
            return (
              <div
                key={item.name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 cursor-not-allowed ${isCollapsed ? 'justify-center' : 'justify-start'}`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="text-sm font-medium mr-2">{item.name}</span>
                    <span className="text-[9px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                     Coming Soon
                    </span>
                  </div>
                )}
              </div>
            );
          }

          const isActive = isActiveRoute(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : 'justify-start'} ${isActive
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

      </nav>
      {/* User Account Settings Dropdown */}
      {/* Trial Status Section */}
      {trialStatus === 'trial-active' && trialInfo && (
        <div className={`mx-3 mb-2 p-3 rounded-xl border border-blue-100 bg-blue-50/50 ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              {!isCollapsed && <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Trial Active</span>}
            </div>
            {!isCollapsed && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-blue-800 font-medium">
                  <span>{trialInfo.remaining} days left</span>
                  <span>{Math.round((trialInfo.used / trialInfo.total) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${(trialInfo.used / trialInfo.total) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-blue-600 font-medium">
                  {trialInfo.used}/{trialInfo.total} days used
                </p>
              </div>
            )}
            {isCollapsed && (
              <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(trialInfo.used / trialInfo.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Section - Settings & Logout */}
      <div className="p-3 border-t border-gray-200 space-y-1">


        <div>
          {userPlan === 'free' && (
            <Button
              variant="outline"
              className={`w-full justify-center gap-3 px-3 py-2.5 bg-datacareer-darkBlue text-white hover:bg-datacareer-darkBlue/90 hover:text-white border-none shadow-md ${isCollapsed ? 'px-2' : ''
                }`}
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              <Crown className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">
                  {isUpgrading ? 'Redirecting...' : 'Upgrade to Pro'}
                </span>
              )}
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 ${isCollapsed ? 'px-2' : ''
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
          className={`w-full justify-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 ${isCollapsed ? 'px-2' : ''
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
        className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-full transition-all duration-300 z-30 ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;

