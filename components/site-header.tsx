import type { ReactNode } from "react"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

type SiteHeaderProps = {
  title?: string
  action?: ReactNode
}

export function SiteHeader({
  title = "Dashboard",
  action,
}: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex h-full w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-5 data-vertical:self-auto"
        />
        <h1 className="truncate text-sm font-medium">{title}</h1>
        {action && <div className="ml-auto">{action}</div>}
      </div>
    </header>
  )
}
