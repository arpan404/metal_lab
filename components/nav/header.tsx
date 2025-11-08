"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu2, IconX, IconLogout, IconChartArcs, IconDeviceVisionPro, IconLayoutDashboard, IconChevronsUp, IconChevronsDown, IconFlask, IconSparkles, IconBell, IconSearch } from "@tabler/icons-react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useNavbar } from "@/lib/contexts/navbar-context";
import { NotificationDialog } from "./notification-dialog";
import { UserMenu } from "./user-menu";

export function Header({
    children,
}: Readonly<{
    children?: React.ReactNode;
}>) {
    const [open, setOpen] = useState(false);
    const { isNavbarVisible, setIsNavbarVisible } = useNavbar();
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", link: "/", icon: <IconLayoutDashboard className="h-4 w-4" /> },
        { name: "Labs", link: "/labs", icon: <IconFlask className="h-4 w-4" /> },
        { name: "Progress", link: "/progress", icon: <IconChartArcs className="h-4 w-4" /> },
    ];

    return (
        <>
            {/* Toggle button when header is hidden */}
            {!isNavbarVisible && (
                <button
                    onClick={() => setIsNavbarVisible(true)}
                    className="fixed top-0 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-b-lg shadow-lg transition-all duration-300 z-50 opacity-70 hover:opacity-100"
                    aria-label="Show navbar"
                >
                    <IconChevronsDown className="h-4 w-4" />
                </button>
            )}

            <header className={`fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 transition-transform duration-300 ${
                isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
            }`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Brand */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                                <IconFlask className="h-5 w-5" />
                                <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 opacity-0 blur transition-opacity duration-300 group-hover:opacity-30 -z-10" />
                            </div>
                            <div className="hidden md:block">
                                <div className="text-base font-bold text-slate-900 tracking-tight">Metal Lab</div>
                                <div className="text-xs text-slate-500">Physics Experiments</div>
                            </div>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.link;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.link}
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                            isActive 
                                                ? 'bg-slate-900 text-white shadow-md' 
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right side actions */}
                        <div className="flex items-center gap-3">
                            {/* Search - Desktop only */}
                            <Button variant="ghost" size="icon" className="hidden lg:flex text-slate-600 hover:text-slate-900">
                                <IconSearch className="h-5 w-5" />
                            </Button>

                            {/* Notifications - All devices */}
                            <NotificationDialog />

                            {/* Hide navbar button - Desktop only */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsNavbarVisible(false)}
                                className="hidden md:flex text-slate-600 hover:text-slate-900"
                                aria-label="Hide navbar"
                                title="Hide navbar"
                            >
                                <IconChevronsUp className="h-5 w-5" />
                            </Button>

                            {/* User menu - Desktop */}
                            <div className="hidden md:flex items-center gap-3">
                                <div className="h-8 w-px bg-gray-200" />
                                <UserMenu />
                            </div>
                        </div>

                        {/* Mobile toggle */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setOpen((s) => !s)}
                                aria-label="Toggle menu"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                            >
                                {open ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {open && (
                    <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60">
                        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                            <div className="flex flex-col space-y-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.link}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
                                    >
                                        <span className="text-accent-foreground">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                                <SignOutButton>
                                    <Button variant={
                                        "ghost"
                                    }>
                                        <IconLogout className="mr-2 h-4 w-4" />
                                    Signout
                                    </Button>
                                    </SignOutButton>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* push page content below fixed header - only when visible */}
            <div className={`transition-all duration-300 ${isNavbarVisible ? 'pt-14' : 'pt-0'}`}>
                {children}
            </div>
        </>
    );
}