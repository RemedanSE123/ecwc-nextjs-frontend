"use client"

import { usePathname } from "next/navigation"
import { useLayoutEffect, useEffect } from "react"

/**
 * On the landing page (/), disable browser scroll restoration and keep scroll at top
 * so refresh and "Back to Home" always show the overview, not Sites & Locations.
 */
export default function ScrollRestoration() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    if (typeof window === "undefined" || pathname !== "/") return
    window.history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
    window.history.replaceState(null, "", "/#overview")
  }, [pathname])

  // After full page load (e.g. on refresh), scroll to top again in case browser restored late
  useEffect(() => {
    if (pathname !== "/") return
    const onLoad = () => {
      window.scrollTo(0, 0)
      window.history.replaceState(null, "", "/#overview")
    }
    if (document.readyState === "complete") onLoad()
    else window.addEventListener("load", onLoad)
    return () => window.removeEventListener("load", onLoad)
  }, [pathname])

  return null
}
