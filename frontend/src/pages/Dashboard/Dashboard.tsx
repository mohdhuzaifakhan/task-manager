import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Calendar, 
  Layout, 
  Users, 
  ArrowUpRight,
  TrendingUp,
  Activity as ActivityIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { dashboardAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { formatRelative, getActionLabel } from '../../lib/utils';
import { Avatar } from '../../components/ui/Avatar';

export function Dashboard() {
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardAPI.get();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Tasks', value: dashboardData?.totalTasks, icon: Layout, color: 'bg-violet-50 text-violet-600' },
    { label: 'Completed', value: dashboardData?.completedTasks, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'My Tasks', value: dashboardData?.myTasks, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Overdue', value: dashboardData?.overdueTasks, icon: Clock, color: 'bg-red-50 text-red-600' },
  ];

  const statusData = [
    { name: 'To Do', value: dashboardData?.tasksByStatus.todo, color: '#94a3b8' },
    { name: 'In Progress', value: dashboardData?.tasksByStatus.inProgress, color: '#3b82f6' },
    { name: 'Done', value: dashboardData?.tasksByStatus.done, color: '#10b981' },
  ];

  const priorityData = [
    { name: 'Low', value: dashboardData?.tasksByPriority.low, color: '#10b981' },
    { name: 'Medium', value: dashboardData?.tasksByPriority.medium, color: '#f59e0b' },
    { name: 'High', value: dashboardData?.tasksByPriority.high, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title text-3xl">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle text-lg">Here's what's happening with your projects today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-bold text-slate-800">Task Completion Overview</h2>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                <span>{dashboardData?.completionRate}% Rate</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none'}}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="card p-6">
                <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  Tasks by Priority
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {priorityData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                      <span className="text-xs font-medium text-slate-500">{item.name}</span>
                    </div>
                  ))}
                </div>
             </div>

             <div className="card p-6 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">{dashboardData?.completedTasks}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Tasks completed to date</p>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-6 overflow-hidden">
                  <div 
                    className="h-full bg-violet-500 transition-all duration-1000" 
                    style={{ width: `${dashboardData?.completionRate}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-violet-600 mt-3 uppercase tracking-wider">
                  Keep it up! You're {dashboardData?.completionRate}% there.
                </p>
             </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card p-0 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-violet-600" />
              <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
            </div>
            <Link 
              to="/activity" 
              className="text-xs font-bold text-violet-600 uppercase tracking-wider hover:text-violet-700"
            >
              View All
            </Link>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[700px] divide-y divide-slate-50">
            {dashboardData?.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity: any) => (
                <div key={activity._id} className="py-4 first:pt-0 last:pb-0 flex gap-4 group">
                  <Avatar name={activity.userId?.name || 'User'} size="md" className="group-hover:ring-2 ring-violet-100 transition-all" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 leading-snug">
                      <span className="font-bold text-slate-800">{activity.userId?.name}</span>
                      {' '}{getActionLabel(activity.action)}{' '}
                      <span className="font-semibold text-slate-900">
                        {activity.metadata?.taskTitle || activity.metadata?.projectName || 'an item'}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{formatRelative(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-400">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
