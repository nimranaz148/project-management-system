import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "h-11 w-full min-w-0 rounded-lg border px-4 py-2.5 text-sm text-slate-900",
        // Clean white background - no tint
        "bg-white",
        // Solid, visible border
        "border-slate-300",
        // Placeholder style
        "placeholder:text-slate-400",
        // Smooth focus ring in indigo
        "outline-none transition-all duration-200",
        "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
