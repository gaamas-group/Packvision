import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Scan,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useAuth } from "@/auth/AuthContext"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    title: "Packager Management",
    path: "/admin/packagers",
    icon: Package,
  },
  {
    title: "Package Scanner",
    path: "/admin/scanner",
    icon: Scan,
  },
]

export function AdminSidebar() {
  const location = useLocation()
  const { logout, user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <aside className={cn(
      "flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
        {!isCollapsed && <h2 className="text-xl font-bold">Admin</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto rounded-md p-1 hover:bg-sidebar-accent/50 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer with user info and logout */}
      <div className="border-t border-sidebar-border p-4">
        {!isCollapsed && (
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-medium truncate">{user?.username || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role || "admin"}</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mb-3 flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
