import { cn } from '../../lib/cn'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

const sizeMap: Record<SpinnerSize, string> = {
  xs: 'loading-xs',
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      className={cn('loading loading-spinner text-primary', sizeMap[size], className)}
      role="status"
      aria-label="Chargement..."
    />
  )
}
