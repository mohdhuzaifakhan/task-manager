import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Search, Filter, Clock } from 'lucide-react';
import { tasksAPI } from '../../services/api';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskModal } from '../../components/tasks/TaskModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

export function MyTasks() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null
  });
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['my-tasks', sortBy],
    queryFn: async () => {
      const res = await tasksAPI.getAll({ assignedTo: user?._id, sortBy });
      return res.data.data;
    },
    enabled: !!user?._id,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => tasksAPI.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Task deleted');
      setConfirmModal({ isOpen: false, taskId: null });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  });

  const handleEditTask = (task: any) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setConfirmModal({ isOpen: true, taskId });
  };

  const confirmDelete = () => {
    if (confirmModal.taskId) {
      deleteTaskMutation.mutate(confirmModal.taskId);
    }
  };

  const filteredTasks = tasks?.filter((t: any) => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const todo = filteredTasks?.filter((t: any) => t.status === 'TODO') || [];
  const inProgress = filteredTasks?.filter((t: any) => t.status === 'IN_PROGRESS') || [];
  const done = filteredTasks?.filter((t: any) => t.status === 'DONE') || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title text-3xl">My Tasks</h1>
          <p className="page-subtitle text-lg text-slate-500">Personal workspace for your assigned items.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search your tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-11 bg-slate-50 border-transparent focus:bg-white"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">
             <Clock className="w-3.5 h-3.5" />
             <span>{filteredTasks?.length || 0} Total Tasks</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-500 outline-none cursor-pointer uppercase tracking-widest"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="priority:desc">High Priority</option>
              <option value="dueDate:asc">Soonest Due</option>
              <option value="title:asc">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* To Do Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">To Do</h3>
            <span className="text-xs font-bold text-slate-400 ml-auto">{todo.length}</span>
          </div>
          <div className="flex flex-col gap-4">
            {todo.map((task: any) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
            {todo.length === 0 && <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-xs font-medium">Clear!</div>}
          </div>
        </div>

        {/* In Progress Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">In Progress</h3>
            <span className="text-xs font-bold text-slate-400 ml-auto">{inProgress.length}</span>
          </div>
          <div className="flex flex-col gap-4">
            {inProgress.map((task: any) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
            {inProgress.length === 0 && <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-xs font-medium">Nothing active</div>}
          </div>
        </div>

        {/* Done Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Done</h3>
            <span className="text-xs font-bold text-slate-400 ml-auto">{done.length}</span>
          </div>
          <div className="flex flex-col gap-4">
            {done.map((task: any) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
            {done.length === 0 && <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-xs font-medium">Complete tasks to see them here</div>}
          </div>
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        projectId={taskToEdit?.projectId?._id || taskToEdit?.projectId || ''}
        members={[]}
        task={taskToEdit}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, taskId: null })}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
}
