"use client";
import React, { useState } from "react";
import Link from "next/link";
import { IconHome, IconMessage, IconUser, IconMenu2, IconX, IconLogout, IconChartArcs, IconMeterCube, IconDeviceVisionPro, IconDashboard } from "@tabler/icons-react";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

export function Header({
    children,
}: Readonly<{
    children?: React.ReactNode;
}>) {
    const [open, setOpen] = useState(false);

    const navItems = [
        { name: "Dashboard", link: "/", icon: <IconDashboard className="h-4 w-4" /> },
        { name: "Labs", link: "/labs", icon: <IconDeviceVisionPro className="h-4 w-4" /> },
        { name: "Progress", link: "/progress", icon: <IconChartArcs className="h-4 w-4" /> },
    ];

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 bg-background backdrop-blur border-b border-border">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between">
                        {/* Brand */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
                                M
                            </div>
                            <span className="hidden text-sm font-medium md:inline">
                                Metal Lab
                            </span>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center space-x-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.link}
                                    className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-neutral-700 hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <span className="text-neutral-500 dark:text-neutral-400">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            ))}

                        </nav>
                            <SignOutButton>
                                    <Button variant={
                                        "ghost"
                                    }>
                                        <IconLogout className="mr-2 h-4 w-4" />
                                    Signout
                                    </Button>
                                    </SignOutButton>

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

            {/* push page content below fixed header */}
            <div className="pt-14">
                {children}
            </div>
        </>
    );
}