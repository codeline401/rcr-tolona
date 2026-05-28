import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="form-control w-full">
        {label && (
          <label className="label" htmlFor={inputId}>
            <span className="label-text font-medium">{label}</span>
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'input input-bordered w-full',
            error && 'input-error',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={(error || helpText) ? `${inputId}-desc` : undefined}
          {...props}
        />
        {(error || helpText) && (
          <label className="label">
            {error ? (
              <span id={`${inputId}-desc`} className="label-text-alt text-error">{error}</span>
            ) : (
              <span id={`${inputId}-desc`} className="label-text-alt text-base-content/60">{helpText}</span>
            )}
          </label>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
