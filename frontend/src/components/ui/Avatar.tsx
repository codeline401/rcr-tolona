import { cn } from '../../lib/cn'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

interface AvatarProps {
  src?: string
  name?: string
  size?: AvatarSize
  className?: string
}

const sizeMap: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

function getInitials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export default function Avatar({ src, name = '', size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('avatar', !src && 'placeholder')}>
      <div
        className={cn(
          'rounded-full',
          !src && 'bg-primary text-primary-content',
          sizeMap[size],
          className,
        )}
      >
        {src ? (
          <img src={src} alt={name} />
        ) : (
          <span>{getInitials(name) || '?'}</span>
        )}
      </div>
    </div>
  )
}
