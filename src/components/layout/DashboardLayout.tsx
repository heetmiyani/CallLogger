import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Phone,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  PhoneCall,
  UserCog,
  BellRing, // ✅ NEW
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ Navigation items
  const navItems =
    user?.role === 'admin'
      ? [
          {
            icon: LayoutDashboard,
            label: 'Dashboard',
            path: '/dashboard',
          },
          {
            icon: PhoneCall,
            label: 'Call Logs',
            path: '/call-logs',
          },

          // 🔔 ADMIN REMINDER CALLS (NEW)
          {
            icon: BellRing,
            label: 'Reminder Calls',
            path: '/admin/reminder-calls',
          },

          {
            icon: Users,
            label: 'Staff Activity',
            path: '/staff-activity',
          },
          {
            icon: UserCog,
            label: 'Manage Users',
            path: '/manage-users',
          },
        ]
      : [
          {
            icon: PhoneCall,
            label: 'Log Calls',
            path: '/dashboard',
          },
          {
            icon: LayoutDashboard,
            label: 'My Logs',
            path: '/my-logs',
          },
        ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <div className="flex items-center gap-2 ml-4">
          <Phone className="w-6 h-6 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">
            CallLogger
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
            <Phone className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">
              CallLogger
            </h1>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {user?.role} Panel
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-semibold text-sidebar-foreground">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {user?.role}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
