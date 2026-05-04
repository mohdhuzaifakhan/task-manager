import { Bell, Search, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';

export function Navbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-500 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-100 mx-1"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
            <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{user?.role}</p>
          </div>
          <Avatar name={user?.name || 'User'} size="md" />
        </div>
      </div>
    </header>
  );
}
