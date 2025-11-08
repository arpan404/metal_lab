"use client";
import React, { useState } from "react";
import Link from "next/link";
import { IconHome, IconMessage, IconUser, IconMenu2, IconX, IconLogout } from "@tabler/icons-react";

export function FloatingNavDemo({
    children,
}: Readonly<{
    children?: React.ReactNode;
}>) {
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        // Add your logout logic here
        console.log("Logging out...");
    };

    const navItems = [
        { name: "Home", link: "/", icon: <IconHome className="h-4 w-4" /> },
        { name: "About", link: "/about", icon: <IconUser className="h-4 w-4" /> },
        { name: "Contact", link: "/contact", icon: <IconMessage className="h-4 w-4" /> },
    ];

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between">
                        {/* Brand */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
                                A
                            </div>
                            <span className="hidden text-sm font-medium text-neutral-900 dark:text-white md:inline">
                                AppName
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
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            >
                                <IconLogout className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </nav>

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
                                        <span className="text-neutral-500 dark:text-neutral-400">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-neutral-100 dark:text-red-400 dark:hover:bg-neutral-800 transition"
                                >
                                    <IconLogout className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
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