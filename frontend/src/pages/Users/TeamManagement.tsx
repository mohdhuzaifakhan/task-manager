import { useQuery } from '@tanstack/react-query';
import { Users, Search, Filter, UserPlus, MoreVertical, Mail, Shield, UserCog, UserMinus } from 'lucide-react';
import { usersAPI } from '../../services/api';
import { Avatar } from '../../components/ui/Avatar';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export function TeamManagement() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await usersAPI.getAll();
      return res.data.data;
    },
  });

  const filteredUsers = users?.filter((u: any) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                         u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title text-3xl">Team Management</h1>
          <p className="page-subtitle text-lg text-slate-500">Manage user roles, permissions, and platform access.</p>
        </div>
        <button 
          className="btn-primary px-6 py-3"
          onClick={() => toast.success('Invite system coming soon!')}
        >
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-11 bg-slate-50 border-transparent focus:bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={filterRole || ''} 
            onChange={(e) => setFilterRole(e.target.value || null)}
            className="bg-transparent text-xs font-bold text-slate-500 outline-none cursor-pointer uppercase tracking-widest"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers?.map((user: any) => (
              <tr key={user._id} className="group hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <Avatar name={user.name} size="lg" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-0.5">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    user.role === 'ADMIN' ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-wide">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     Active
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="relative inline-block" ref={activeMenu === user._id ? menuRef : null}>
                    <button 
                      onClick={() => setActiveMenu(activeMenu === user._id ? null : user._id)}
                      className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeMenu === user._id && (
                      <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in duration-150 text-left">
                        <button 
                          onClick={() => {
                            toast.success('Role editing coming soon!');
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-colors"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          Change Role
                        </button>
                        <button 
                          onClick={() => {
                            toast.success('User suspension coming soon!');
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          Deactivate User
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
