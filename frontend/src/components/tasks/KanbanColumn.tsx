import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, MoreVertical, X } from 'lucide-react';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: any[];
  count: number;
  color: string;
  onEditTask?: (task: any) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddTask?: (status: string) => void;
  onClearColumn?: (status: string) => void;
}

export function KanbanColumn({ id, title, tasks, count, color, onEditTask, onDeleteTask, onAddTask, onClearColumn }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
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
    <div 
      ref={setNodeRef}
      className={`kanban-col transition-colors duration-200 ${isOver ? 'bg-violet-50/50 ring-2 ring-violet-200' : ''}`}
    >
      <div className="kanban-col-header">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
          <span className="text-xs font-bold text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded-lg">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onAddTask?.(id)}
            className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in duration-150">
                <button 
                  onClick={() => {
                    onClearColumn?.(id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Column
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pb-4 scroll-smooth pr-0.5">
        {tasks.map((task) => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
        {tasks.length === 0 && !isOver && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 opacity-50">
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">No tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
