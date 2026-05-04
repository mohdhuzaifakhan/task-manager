import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, LayoutGrid, List, MoreVertical, ArrowRight, Calendar } from 'lucide-react';
import { projectsAPI } from '../../services/api';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectModal } from '../../components/projects/ProjectModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/ui/Avatar';

export function Projects() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; projectId: string | null }>({
    isOpen: false,
    projectId: null
  });
  
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await projectsAPI.getAll();
      return res.data.data;
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => projectsAPI.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
      setConfirmModal({ isOpen: false, projectId: null });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  });

  const handleEditProject = (project: any) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setConfirmModal({ isOpen: true, projectId });
  };

  const confirmDelete = () => {
    if (confirmModal.projectId) {
      deleteProjectMutation.mutate(confirmModal.projectId);
    }
  };

  const filteredProjects = projects?.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title text-3xl">Projects</h1>
          <p className="page-subtitle text-lg text-slate-500">Manage your team's workspace and collaboration.</p>
        </div>
        <button 
          className="btn-primary px-6 py-3"
          onClick={() => {
            setProjectToEdit(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-11 bg-slate-50 border-transparent focus:bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterStatus || ''} 
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className="bg-transparent text-xs font-bold text-slate-500 outline-none cursor-pointer uppercase tracking-widest"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredProjects?.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project: any) => (
              <ProjectCard 
                key={project._id} 
                project={project} 
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Members</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProjects.map((project: any) => (
                  <tr key={project._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center font-bold">
                          {project.name.charAt(0)}
                        </div>
                        <div>
                          <Link to={`/projects/${project._id}`} className="text-sm font-bold text-slate-800 hover:text-violet-600 transition-colors">
                            {project.name}
                          </Link>
                          <p className="text-[10px] text-slate-500 font-medium line-clamp-1">{project.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {project.members?.slice(0, 3).map((m: any) => (
                          <Avatar key={m._id} name={m.name} size="xs" ring />
                        ))}
                        {project.members?.length > 3 && (
                          <div className="w-5 h-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/projects/${project._id}`} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-violet-600 transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <LayoutGrid className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No projects found</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            You haven't been added to any projects yet or your search query didn't match.
          </p>
          <button 
            className="mt-8 text-violet-600 font-bold hover:underline"
            onClick={() => setIsModalOpen(true)}
          >
            Create your first project
          </button>
        </div>
      )}

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setProjectToEdit(null);
        }} 
        project={projectToEdit}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, projectId: null })}
        onConfirm={confirmDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks and data will be permanently removed."
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
}
