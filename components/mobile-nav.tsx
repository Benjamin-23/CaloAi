"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Dumbbell,
    Apple,
    Brain,
    Stethoscope,
    LayoutDashboard,
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
    },
    {
        title: "Opik Monitor",
        href: "/monitor",
        icon: Activity,
        color: "text-orange-500",
    }
]

export function MobileNav() {
    const [open, setOpen] = React.useState(false)
    const pathname = usePathname()

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden p-0 w-10 h-10 ml-2 mt-2">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background border-r pr-0">
                <div className="px-7">
                    <Link
                        href="/"
                        className="flex items-center"
                        onClick={() => setOpen(false)}
                    >
                        <span className="font-bold text-2xl">CaloAi</span>
                    </Link>
                </div>
                <div className="flex flex-col gap-4 py-4 mt-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center gap-2 text-lg font-medium p-2 hover:bg-secondary rounded-lg transition-colors",
                                pathname === item.href ? "bg-secondary" : "transparent"
                            )}
                        >
                            <item.icon className={cn("mr-2 h-5 w-5", item.color)} />
                            {item.title}
                        </Link>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}
