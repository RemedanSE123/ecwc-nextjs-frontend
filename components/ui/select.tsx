"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
  /** When set, dropdown is at least this wide (e.g. for long names). Trigger stays in its cell. */
  dropdownMinWidth?: number
}

const Select = ({ value, onValueChange, disabled, children, className, dropdownMinWidth }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })

  React.useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [open])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }

    const handleScroll = (e: Event) => {
      const target = e.target as Node
      if (dropdownRef.current && dropdownRef.current.contains(target)) return
      setOpen(false)
    }

    const handleResize = () => setOpen(false)

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("scroll", handleScroll, true)
      window.addEventListener("resize", handleResize)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleResize)
    }
  }, [open])

  const contentChild = React.Children.toArray(children).find(
    (c) => React.isValidElement(c) && (c as React.ReactElement<{ children?: React.ReactNode }>).type === SelectContent
  )
  const items = React.isValidElement(contentChild) && contentChild.props.children
    ? React.Children.toArray((contentChild as React.ReactElement<{ children: React.ReactNode }>).props.children)
    : React.Children.toArray(children)
  const selectedLabel = items
    .filter((child) => {
      if (React.isValidElement(child) && child.type === SelectItem) {
        return (child.props as { value: string }).value === value
      }
      return false
    })
    .map((child) => {
      if (React.isValidElement(child)) {
        return (child.props as { children: React.ReactNode }).children
      }
      return null
    })[0]

  const dropdownWidth = dropdownMinWidth != null ? Math.max(position.width, dropdownMinWidth) : position.width
  const dropdownContent = open && typeof document !== "undefined" && (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] overflow-x-auto overflow-y-auto rounded-md border border-[#16A34A]/30 bg-popover text-popover-foreground shadow-lg max-h-[280px] min-w-[var(--select-width,120px)]"
      style={{
        top: position.top,
        left: position.left,
        width: 'max-content',
        minWidth: dropdownWidth,
        maxWidth: 'min(90vw, 400px)',
      }}
    >
      <div className="p-1">
        {items.map((child) => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            const itemProps = child.props as { value: string; children: React.ReactNode }
            return React.cloneElement(child as React.ReactElement<SelectItemProps>, {
              onClick: () => {
                onValueChange(itemProps.value)
                setOpen(false)
              },
              isSelected: itemProps.value === value,
            })
          }
          return null
        })}
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
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
      {typeof document !== "undefined" && dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  )
}

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
  id?: string
}

const SelectTrigger = ({ className, children, id }: SelectTriggerProps) => {
  return <div id={id} className={className}>{children}</div>
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
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap",
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
