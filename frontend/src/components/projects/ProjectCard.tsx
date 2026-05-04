import { Link } from 'react-router-dom';
import { MoreHorizontal, Users, Calendar, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useState, useRef, useEffect } from 'react';

interface ProjectCardProps {
  project: any;
  onEdit?: (project: any) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="card group relative">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
            <span className="text-lg font-bold">{project.name.charAt(0)}</span>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in duration-150">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(project);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Project
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(project._id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>

        <Link to={`/projects/${project._id}`}>
          <h3 className="text-lg font-bold text-slate-800 hover:text-violet-600 transition-colors line-clamp-1">{project.name}</h3>
        </Link>
        <p className="text-sm text-slate-500 mt-2 line-clamp-2 min-h-[40px] leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 4).map((member: any) => (
              <div key={member._id} className="ring-2 ring-white rounded-full">
                <Avatar name={member.name} size="sm" />
              </div>
            ))}
            {project.members?.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
             <Calendar className="w-3.5 h-3.5" />
             {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${project.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
           <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{project.status}</span>
        </div>
        <Link to={`/projects/${project._id}`} className="text-xs font-bold text-violet-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
          View Board <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
