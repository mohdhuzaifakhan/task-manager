interface BadgeProps {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  label?: string;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    TODO:        { cls: 'badge-todo',       label: 'To Do' },
    IN_PROGRESS: { cls: 'badge-inprogress', label: 'In Progress' },
    DONE:        { cls: 'badge-done',       label: 'Done' },
  };
  const { cls, label } = map[status] || { cls: 'badge-todo', label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { cls: string; dot: string }> = {
    LOW:    { cls: 'badge-low',    dot: 'bg-emerald-400' },
    MEDIUM: { cls: 'badge-medium', dot: 'bg-amber-400'   },
    HIGH:   { cls: 'badge-high',   dot: 'bg-red-400'     },
  };
  const { cls, dot } = map[priority] || { cls: 'badge-low', dot: 'bg-slate-400' };
  return (
    <span className={`badge ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}
