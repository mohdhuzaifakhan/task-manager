import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, CheckSquare, AlignLeft, Loader2, Flag, User, Calendar as CalendarIcon } from 'lucide-react';
import { tasksAPI, projectsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members?: any[]; // Optional now
  task?: any; // If provided, we are in Edit Mode
  initialStatus?: string;
}

export function TaskModal({ isOpen, onClose, projectId, members: initialMembers, task, initialStatus }: TaskModalProps) {
  const isEditMode = !!task;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const queryClient = useQueryClient();

  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getById(projectId),
    enabled: !!projectId && (!initialMembers || initialMembers.length === 0) && isOpen,
  });

  const members = initialMembers && initialMembers.length > 0 
    ? initialMembers 
    : projectData?.data?.data?.members || [];

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'TODO');
      setPriority(task.priority || 'MEDIUM');
      setAssignedTo(task.assignedTo?._id || task.assignedTo || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    } else if (!task && isOpen) {
      resetForm();
      if (initialStatus) setStatus(initialStatus);
    }
  }, [task, isOpen, initialStatus]);

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task created successfully!');
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => tasksAPI.update(task._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setPriority('MEDIUM');
    setAssignedTo('');
    setDueDate('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const payload = {
      title,
      description,
      status,
      priority,
      projectId,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null
    };

    if (isEditMode) {
      updateTaskMutation.mutate(payload);
    } else {
      createTaskMutation.mutate(payload);
    }
  };

  const isPending = createTaskMutation.isPending || updateTaskMutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{isEditMode ? 'Edit Task' : 'Add New Task'}</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                {isEditMode ? 'Modify task details' : 'Define a new work item'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="label">Task Title</label>
            <div className="relative">
              <CheckSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input pl-11"
                placeholder="e.g. Design system audit"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label">Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input pl-11 min-h-[100px] py-2.5 resize-none"
                placeholder="Describe what needs to be done..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="label">Priority</label>
              <div className="relative">
                <Flag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input pl-11"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label">Assign To</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="input pl-11"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label">Due Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input pl-11"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex-1 justify-center py-2.5"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isEditMode ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
