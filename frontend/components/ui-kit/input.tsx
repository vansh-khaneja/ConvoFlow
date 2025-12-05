import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  helperText?: string;
  errorText?: string;
  maxLength?: number;
  showCharCount?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, helperText, errorText, maxLength, showCharCount, leftIcon, rightIcon, ...props }, ref) => {
    const [valueLength, setValueLength] = React.useState(
      typeof props.value === 'string' ? props.value.length : 
      typeof props.defaultValue === 'string' ? props.defaultValue.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showCharCount && maxLength) {
        setValueLength(e.target.value.length);
      }
      props.onChange?.(e);
    };

    const hasError = error || !!errorText;
    const hasSuccess = success && !hasError;

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-[5px] border bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)]",
              "focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--muted)]/30",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              hasError && "border-red-500/50 focus:ring-red-500/30 focus:border-red-500",
              hasSuccess && "border-green-500/50 focus:ring-green-500/30 focus:border-green-500",
              !hasError && !hasSuccess && "border-[var(--input-border)] focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]",
              className
            )}
            ref={ref}
            maxLength={maxLength}
            onChange={handleChange}
            {...props}
          />
          {rightIcon && !hasError && !hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
              {rightIcon}
            </div>
          )}
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none z-10">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          {hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none z-10">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>
        
        {/* Helper/Error Text and Character Count */}
        {(helperText || errorText || showCharCount) && (
          <div className="flex items-center justify-between mt-1.5 px-1">
            <div className="text-xs">
              {errorText && (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errorText}
                </span>
              )}
              {!errorText && helperText && (
                <span className="text-[var(--text-muted)]">{helperText}</span>
              )}
            </div>
            {showCharCount && maxLength && (
              <span className={cn(
                "text-xs font-mono",
                valueLength > maxLength * 0.9 ? "text-amber-400" : "text-[var(--text-muted)]"
              )}>
                {valueLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
