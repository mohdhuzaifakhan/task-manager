import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronRight, 
  Trash2, 
  UserPlus, 
  Plus, 
  Layout, 
  Search, 
  Filter, 
  ArrowLeft,
  Share2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import { projectsAPI, tasksAPI } from '../../services/api';
import { KanbanColumn } from '../../components/tasks/KanbanColumn';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskModal } from '../../components/tasks/TaskModal';
import { MemberModal } from '../../components/projects/MemberModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { toast } from 'react-hot-toast';
import { Avatar } from '../../components/ui/Avatar';

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [prefilledStatus, setPrefilledStatus] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean; 
    type: 'TASK' | 'PROJECT' | 'COLUMN' | null;
    id?: string;
  }>({
    isOpen: false,
    type: null,
  });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await projectsAPI.getById(id!);
      return res.data.data;
    },
    enabled: !!id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const res = await tasksAPI.getAll({ projectId: id });
      return res.data.data;
    },
    enabled: !!id,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) => 
      tasksAPI.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => tasksAPI.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      toast.success('Task deleted');
      setConfirmModal({ isOpen: false, type: null });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  });

  const clearColumnMutation = useMutation({
    mutationFn: async (status: string) => {
      const tasksToClear = tasks?.filter((t: any) => t.status === status) || [];
      return Promise.all(tasksToClear.map((t: any) => tasksAPI.delete(t._id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      toast.success('Column cleared');
      setConfirmModal({ isOpen: false, type: null });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsAPI.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
      navigate('/projects');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: any) => {
    setActiveTask(event.active.data.current.task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasks?.find((t: any) => t._id === taskId);

    if (task && task.status !== newStatus) {
      updateTaskMutation.mutate({ taskId, data: { status: newStatus } });
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleEditTask = (task: any) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setConfirmModal({ isOpen: true, type: 'TASK', id: taskId });
  };

  const handleAddTaskToColumn = (status: string) => {
    setPrefilledStatus(status);
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleClearColumn = (status: string) => {
    setConfirmModal({ isOpen: true, type: 'COLUMN', id: status });
  };

  const handleDeleteProject = () => {
    setConfirmModal({ isOpen: true, type: 'PROJECT' });
  };

  const confirmAction = () => {
    switch (confirmModal.type) {
      case 'TASK':
        if (confirmModal.id) deleteTaskMutation.mutate(confirmModal.id);
        break;
      case 'COLUMN':
        if (confirmModal.id) clearColumnMutation.mutate(confirmModal.id);
        break;
      case 'PROJECT':
        deleteProjectMutation.mutate();
        break;
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  if (projectLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredTasks = tasks?.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-slate-400' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'DONE', title: 'Done', color: 'bg-emerald-500' },
  ];

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in">
      {/* Breadcrumbs & Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
           <Link to="/projects" className="hover:text-violet-600 transition-colors">Projects</Link>
           <ChevronRight className="w-3 h-3" />
           <span className="text-slate-600 truncate max-w-[200px]">{project?.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 text-white flex items-center justify-center text-2xl font-bold">
              {project?.name.charAt(0)}
            </div>
            <div>
               <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{project?.name}</h1>
               <div className="flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                    <Layout className="w-4 h-4" />
                    <span>Kanban Board</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Updated {new Date(project?.updatedAt).toLocaleDateString()}</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-3 mr-3">
              {project?.members?.map((member: any) => (
                <div key={member._id} className="ring-4 ring-slate-50 rounded-full">
                   <Avatar name={member.name} size="md" />
                </div>
              ))}
              <button 
                onClick={() => setIsMemberModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-violet-600 hover:border-violet-300 transition-all"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
            <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block" />
            <button 
              className="btn-secondary px-4 h-11"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button 
              className="btn-primary px-6 h-11"
              onClick={() => {
                setTaskToEdit(null);
                setPrefilledStatus(null);
                setIsTaskModalOpen(true);
              }}
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Board Controls */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search board..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-violet-300 transition-all outline-none" 
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterPriority || ''} 
              onChange={(e) => setFilterPriority(e.target.value || null)}
              className="bg-transparent text-sm font-bold text-slate-500 hover:text-slate-800 outline-none cursor-pointer uppercase tracking-widest"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
        
        <button 
          className="p-2.5 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors group"
          onClick={handleDeleteProject}
          title="Delete Project"
        >
          <Trash2 className="w-5 h-5 text-slate-500 group-hover:text-red-600" />
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 min-h-0">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-8 overflow-x-auto pb-8 h-full scrollbar-hide">
            {columns.map((col) => (
              <KanbanColumn 
                key={col.id}
                id={col.id}
                title={col.title}
                color={col.color}
                tasks={filteredTasks?.filter((t: any) => t.status === col.id) || []}
                count={filteredTasks?.filter((t: any) => t.status === col.id).length || 0}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTaskToColumn}
                onClearColumn={handleClearColumn}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 scale-105 ring-2 ring-violet-500 rounded-2xl pointer-events-none">
                <TaskCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
          setPrefilledStatus(null);
        }} 
        projectId={id!}
        members={project?.members || []}
        task={taskToEdit}
        initialStatus={prefilledStatus || undefined}
      />

      <MemberModal 
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        projectId={id!}
        currentMembers={project?.members || []}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onConfirm={confirmAction}
        title={
          confirmModal.type === 'TASK' ? 'Delete Task' :
          confirmModal.type === 'COLUMN' ? 'Clear Column' : 'Delete Project'
        }
        message={
          confirmModal.type === 'TASK' ? 'Are you sure you want to delete this task?' :
          confirmModal.type === 'COLUMN' ? `Are you sure you want to clear all tasks from this column?` :
          'Are you sure you want to delete this project? This action cannot be undone.'
        }
        isLoading={
          deleteTaskMutation.isPending || 
          clearColumnMutation.isPending || 
          deleteProjectMutation.isPending
        }
      />
    </div>
  );
}
