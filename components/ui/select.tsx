"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

const Select = ({ value, onValueChange, disabled, children, className }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const selectedLabel = React.Children.toArray(children)
    .filter((child) => {
      if (React.isValidElement(child) && child.type === SelectItem) {
        return child.props.value === value
      }
      return false
    })
    .map((child) => {
      if (React.isValidElement(child)) {
        return child.props.children
      }
      return null
    })[0]

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !selectedLabel && "text-muted-foreground"
        )}
      >
        <span>{selectedLabel || "Select..."}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === SelectItem) {
                return React.cloneElement(child as React.ReactElement, {
                  onClick: () => {
                    onValueChange(child.props.value)
                    setOpen(false)
                  },
                  isSelected: child.props.value === value,
                })
              }
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

const SelectTrigger = ({ className, children }: SelectTriggerProps) => {
  return <div className={className}>{children}</div>
}

interface SelectValueProps {
  placeholder?: string
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  return <span>{placeholder}</span>
}

interface SelectContentProps {
  className?: string
  children: React.ReactNode
}

const SelectContent = ({ className, children }: SelectContentProps) => {
  return <div className={className}>{children}</div>
}

interface SelectItemProps {
  value: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
  isSelected?: boolean
}

const SelectItem = ({ className, children, onClick, isSelected }: SelectItemProps) => {
  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
