import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Layout, AlignLeft, Loader2 } from 'lucide-react';
import { projectsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: any; // If provided, we are in Edit Mode
}

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const isEditMode = !!project;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (project && isOpen) {
      setName(project.name || '');
      setDescription(project.description || '');
    } else if (!project && isOpen) {
      setName('');
      setDescription('');
    }
  }, [project, isOpen]);

  const createProjectMutation = useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => projectsAPI.update(project._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (isEditMode) {
      updateProjectMutation.mutate({ name, description });
    } else {
      createProjectMutation.mutate({ name, description });
    }
  };

  const isPending = createProjectMutation.isPending || updateProjectMutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <Layout className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{isEditMode ? 'Edit Project' : 'Create New Project'}</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                {isEditMode ? 'Modify project details' : 'Start a new collaboration'}
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
            <label className="label">Project Name</label>
            <div className="relative">
              <Layout className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input pl-11"
                placeholder="e.g. Website Redesign"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label">Description (Optional)</label>
            <div className="relative">
              <AlignLeft className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input pl-11 min-h-[120px] py-2.5 resize-none"
                placeholder="What is this project about?"
              />
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
                isEditMode ? 'Update Project' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
