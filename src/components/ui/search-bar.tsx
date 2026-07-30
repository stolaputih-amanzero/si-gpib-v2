import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchBarProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, wrapperClassName, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", wrapperClassName)}>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <Search className="h-5 w-5 text-ink-tertiary" />
        </div>
        <input
          type="search"
          className={cn(
            "field pl-11 pr-4 text-base min-h-[48px]",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
SearchBar.displayName = "SearchBar"

export { SearchBar }
