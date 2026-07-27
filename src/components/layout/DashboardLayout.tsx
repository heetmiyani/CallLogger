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
  BellRing,
  FileEdit,
  Building,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

  const [pendingCount, setPendingCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ================= FETCH PENDING REQUESTS =================
  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchPending = async () => {
      try {
        const res = await fetch('/api/change-requests');
        const data = await res.json();

        const pending = data.filter(
          (req: any) => req.status === 'PENDING'
        );

        setPendingCount(pending.length);
      } catch (error) {
        console.error('Pending fetch failed', error);
      }
    };

    fetchPending();

    // Optional auto-refresh every 20 seconds
    const interval = setInterval(fetchPending, 20000);
    return () => clearInterval(interval);
  }, [user]);

  // ================= NAV ITEMS =================
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
          {
            icon: Building,
            label: 'Manage Clients',
            path: '/admin/manage-clients',
          },
          {
            icon: FileEdit,
            label: 'Manage Data',
            path: '/admin/manage-data',
            showBadge: true,
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
          {
            icon: FileEdit,
            label: 'Change Request',
            path: '/staff/change-request',
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
            const isActive = location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">
                    {item.label}
                  </span>
                </div>

                {/* Pending Badge */}
                {item.showBadge && pendingCount > 0 && (
                  <Badge variant="destructive">
                    {pendingCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
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
