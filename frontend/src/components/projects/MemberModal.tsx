import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, UserPlus, Search, Loader2, UserMinus, User } from 'lucide-react';
import { projectsAPI, usersAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Avatar } from '../ui/Avatar';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentMembers: any[];
}

export function MemberModal({ isOpen, onClose, projectId, currentMembers }: MemberModalProps) {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await usersAPI.getAll();
      return res.data.data;
    },
    enabled: isOpen,
  });

  const addMemberMutation = useMutation({
    mutationFn: (memberIds: string[]) => projectsAPI.addMembers(projectId, memberIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Member added successfully');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => projectsAPI.removeMember(projectId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Member removed successfully');
    },
  });

  if (!isOpen) return null;

  const filteredUsers = allUsers?.filter((u: any) => 
    (u.name.toLowerCase().includes(search.toLowerCase()) || 
     u.email.toLowerCase().includes(search.toLowerCase())) &&
    !currentMembers.some(m => m._id === u._id)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Project Members</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Manage access to this project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Members */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Team</h3>
            <div className="space-y-2">
              {currentMembers.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-2 rounded-xl border border-slate-50 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size="md" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{member.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{member.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeMemberMutation.mutate(member._id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Add New Members */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Add New Member</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
              {usersLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-violet-600" /></div>
              ) : filteredUsers?.length > 0 ? (
                filteredUsers.map((user: any) => (
                  <button
                    key={user._id}
                    onClick={() => addMemberMutation.mutate([user._id])}
                    className="w-full flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-violet-100 hover:bg-violet-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="md" />
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{user.email}</p>
                      </div>
                    </div>
                    <UserPlus className="w-4 h-4 text-slate-300 group-hover:text-violet-600 transition-colors" />
                  </button>
                ))
              ) : (
                <p className="text-center py-4 text-sm text-slate-400">No users found</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary w-full justify-center">Done</button>
        </div>
      </div>
    </div>
  );
}
