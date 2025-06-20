import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorColor?: string;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorColor, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={`relative h-4 w-full overflow-hidden rounded-full bg-slate-100 ${className || ""}`}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={`h-full w-full flex-1 transition-all ${indicatorClassName || indicatorColor || "bg-primary"}`}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }