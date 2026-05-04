import { getAvatarColor, getInitials } from '../../lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : size === 'lg' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  return (
    <div className={`${sizeClass} ${getAvatarColor(name)} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
}
