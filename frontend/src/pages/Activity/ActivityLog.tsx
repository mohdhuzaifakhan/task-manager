import { useQuery } from '@tanstack/react-query';
import { History, Search, Filter, Calendar } from 'lucide-react';
import { activityAPI } from '../../services/api';
import { formatRelative, getActionLabel } from '../../lib/utils';
import { Avatar } from '../../components/ui/Avatar';
import { useState } from 'react';

export function ActivityLog() {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', dateRange],
    queryFn: async () => {
      const res = await activityAPI.getRecent(dateRange.start, dateRange.end);
      return res.data.data;
    },
  });

  const filteredActivities = activities?.filter((a: any) => 
    a.userId?.name.toLowerCase().includes(search.toLowerCase()) ||
    a.metadata?.taskTitle?.toLowerCase().includes(search.toLowerCase()) ||
    a.metadata?.projectName?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title text-3xl">Activity Feed</h1>
          <p className="page-subtitle text-lg text-slate-500">Track all changes and collaboration across the platform.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-11 bg-slate-50 border-transparent focus:bg-white"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-violet-200 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-violet-200 transition-all"
            />
          </div>
          {(dateRange.start || dateRange.end) && (
            <button 
              onClick={() => setDateRange({ start: '', end: '' })}
              className="text-[10px] font-bold text-violet-600 hover:text-violet-700 uppercase"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filteredActivities?.length > 0 ? (
            filteredActivities.map((activity: any) => (
              <div key={activity._id} className="p-6 hover:bg-slate-50/50 transition-colors flex gap-5 items-start">
                <Avatar name={activity.userId?.name || 'User'} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-base text-slate-600">
                      <span className="font-bold text-slate-900">{activity.userId?.name}</span>
                      {' '}{getActionLabel(activity.action)}{' '}
                      <span className="font-semibold text-violet-600">
                        {activity.metadata?.taskTitle || activity.metadata?.projectName || 'an item'}
                      </span>
                    </p>
                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{formatRelative(activity.timestamp)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                     <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-md">
                       {activity.entityType}
                     </span>
                     {activity.metadata?.projectName && (
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          in project: <span className="text-slate-800">{activity.metadata.projectName}</span>
                        </span>
                     )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 text-center">
               <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-500">No activity found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
