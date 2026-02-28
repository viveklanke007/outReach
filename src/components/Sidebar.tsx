"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Mail, 
  Send, 
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Template", href: "/template", icon: Mail },
  { name: "Send", href: "/preview", icon: Send },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-white border-t border-slate-200 md:relative md:h-full md:w-64 md:border-t-0 md:border-r flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto">
      <div className="hidden md:block p-8">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Send className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            outReach
          </span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-row md:flex-col px-2 md:px-4 space-x-2 md:space-x-0 md:space-y-1 items-center justify-around md:justify-start w-full">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col md:flex-row items-center justify-center md:justify-between px-2 md:px-4 py-2 md:py-3 rounded-lg transition-all text-[10px] md:text-sm font-medium flex-1 md:flex-none h-16 md:h-auto",
                isActive 
                  ? "md:bg-[#F3F5EB] bg-transparent text-[#41431B]" 
                  : "text-[#696750] hover:bg-[#F8F3E1] hover:text-[#41431B]"
              )}
            >
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                <item.icon className={cn("h-5 w-5 md:h-4 md:w-4 mb-1 md:mb-0", isActive ? "text-[#41431B]" : "text-[#B8AF87]")} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="hidden md:block h-4 w-4 text-[#41431B]" />}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:block p-4 border-t border-slate-100">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
