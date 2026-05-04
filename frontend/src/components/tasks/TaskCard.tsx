import { Calendar, MessageSquare, Paperclip, MoreHorizontal, Clock, AlertCircle, Edit2, Trash2, Users } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge } from '../ui/Badge';
import { formatDate, isOverdue } from '../../lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { useState, useRef, useEffect } from 'react';

interface TaskCardProps {
  task: any;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : undefined;

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`task-card group relative ${isDragging ? 'opacity-40 ring-2 ring-violet-500' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <PriorityBadge priority={task.priority} />
        <div className="relative" ref={menuRef}>
          <button 
            {...listeners}
            {...attributes}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 group-hover:opacity-100 opacity-0 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-[1100] animate-in fade-in zoom-in duration-150">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(task);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Task
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(task._id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>

      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-violet-600 transition-colors mb-2 leading-snug">
          {task.title}
        </h4>
        
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {task.description}
          </p>
        )}

        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {task.tags.map((tag: string) => (
              <span key={tag} className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${overdue ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                <Clock className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </div>
            )}
            {overdue && <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-300">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">2</span>
            </div>
            {task.assignedTo ? (
               <Avatar name={task.assignedTo.name} size="sm" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                <Users className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
