import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCog,
  FileText,
  LogOut,
  Coffee,
  Menu,
  X,
  Images,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { path: '/carousel', icon: Images, label: 'Home Carousel', roles: ['OWNER', 'MANAGER'] },
  { path: '/premium-beans', icon: Coffee, label: 'Premium Beans', roles: ['OWNER', 'MANAGER'] },
  { path: '/products', icon: Package, label: 'Products', roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { path: '/customers', icon: Users, label: 'Customers', roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { path: '/users', icon: UserCog, label: 'Admin Users', roles: ['OWNER'] },
  { path: '/audit-logs', icon: FileText, label: 'Audit Logs', roles: ['OWNER', 'MANAGER'] },
];

export function Layout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-amber-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-amber-800">
          <div className="flex items-center gap-2">
            <Coffee className="h-8 w-8" />
            <span className="font-bold text-lg">CBW Admin</span>
          </div>
          <button
            className="lg:hidden p-1 hover:bg-amber-800 rounded"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-700 text-white'
                    : 'text-amber-100 hover:bg-amber-800'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-amber-800">
          <div className="mb-3 px-4">
            <p className="text-sm text-amber-200">{user?.fullName}</p>
            <p className="text-xs text-amber-300">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-amber-100 hover:bg-amber-800 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <Coffee className="h-6 w-6 text-amber-700" />
              <span className="font-bold text-amber-900">CBW Admin</span>
            </div>
            <div className="hidden lg:block" />
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-AE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
