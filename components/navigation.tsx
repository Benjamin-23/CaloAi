"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dumbbell,
    Apple,
    Brain,
    Stethoscope,
    LayoutDashboard,
    Settings,
    Activity
} from "lucide-react"

const navItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        color: "text-sky-500",
    },
    {
        title: "Exercise",
        href: "/exercise",
        icon: Dumbbell,
        color: "text-violet-500",
    },
    {
        title: "Nutrition",
        href: "/nutrition",
        icon: Apple,
        color: "text-emerald-500",
    },
    {
        title: "Mindfulness",
        href: "/mindfulness",
        icon: Brain,
        color: "text-pink-500",
    },
    {
        title: "Medical",
        href: "/medical",
        icon: Stethoscope,
        color: "text-blue-500",
    }
]

interface NavigationProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Navigation({ className, ...props }: NavigationProps) {
    const pathname = usePathname()

    return (
        <div className={cn("pb-12 w-64 border-r min-h-screen bg-background hidden md:block fixed left-0 top-0", className)} {...props}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
                        CaloAi
                    </h2>
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href} passHref>
                                <Button
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start",
                                        pathname === item.href && "bg-secondary font-medium"
                                    )}
                                >
                                    <item.icon className={cn("mr-2 h-4 w-4", item.color)} />
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
