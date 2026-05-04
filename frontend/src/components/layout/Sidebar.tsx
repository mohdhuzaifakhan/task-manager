import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  LogOut, 
  History, 
  Settings, 
  Users 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function Sidebar() {
  const { logout, user } = useAuthStore();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: Briefcase },
    { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/activity', label: 'Activity', icon: History },
  ];

  if (user?.role === 'ADMIN') {
    links.push({ to: '/users', label: 'Team', icon: Users });
  }

  return (
    <div className="sidebar">
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TaskFlow</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <button
          onClick={logout}
          className="sidebar-link w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
