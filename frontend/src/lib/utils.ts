export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function isOverdue(dueDate: string | null | undefined, status: string): boolean {
  if (!dueDate || status === 'DONE') return false;
  return new Date(dueDate) < new Date();
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelative(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function getActionLabel(action: string): string {
  const map: Record<string, string> = {
    CREATED_TASK: 'created task',
    UPDATED_TASK: 'updated task',
    ASSIGNED_TASK: 'assigned task',
    COMPLETED_TASK: 'completed task',
    DELETED_TASK: 'deleted task',
    CREATED_PROJECT: 'created project',
    UPDATED_PROJECT: 'updated project',
    ADDED_MEMBER: 'added member to',
    REMOVED_MEMBER: 'removed member from',
  };
  return map[action] || action.toLowerCase().replace('_', ' ');
}
