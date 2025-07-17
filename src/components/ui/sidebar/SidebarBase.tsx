
import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarProps } from "./SidebarTypes";
import { TooltipProvider } from "@/components/ui/tooltip";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3.5rem";

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ side = "left", className, children, ...props }, ref) => {
    const { isMobile, open, openMobile, setOpenMobile } = useSidebar();

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side}
            className="w-[var(--sidebar-width-mobile)] bg-slate-900 p-0 text-white"
            style={{ "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
          >
            <div className="flex h-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <aside
        ref={ref}
        className={cn(
          "fixed top-0 z-30 h-full transition-all duration-300 ease-in-out",
          side === "left" ? "left-0" : "right-0",
          open ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-icon)]",
          className
        )}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className="flex h-full flex-col bg-slate-900 text-white">
          {children}
        </div>
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

export const SidebarWrapper = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, style, children, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn("min-h-screen w-full", className)}
        ref={ref}
        {...props}
      >
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            open
              ? "ml-[var(--sidebar-width)]"
              : "pl-[var(--sidebar-width-icon)]"
          )}
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
});
SidebarWrapper.displayName = "SidebarWrapper";
