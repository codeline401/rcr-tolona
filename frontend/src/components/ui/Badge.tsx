import { cn } from '../../lib/cn'

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'error' | 'warning' | 'success' | 'neutral'
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  outline?: boolean
  className?: string
  children: React.ReactNode
}

const variantMap: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  ghost: 'badge-ghost',
  error: 'badge-error',
  warning: 'badge-warning',
  success: 'badge-success',
  neutral: 'badge-neutral',
}

const sizeMap: Record<BadgeSize, string> = {
  xs: 'badge-xs',
  sm: 'badge-sm',
  md: '',
  lg: 'badge-lg',
}

export default function Badge({ variant = 'neutral', size = 'md', outline, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        variantMap[variant],
        sizeMap[size],
        outline && 'badge-outline',
        className,
      )}
    >
      {children}
    </span>
  )
}
