"use client";

import { useAppStore } from "@/lib/app-store";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { initialize } = useAppStore();

  useEffect(() => {
    if (isLoaded && user) {
      // Initialize the app store with the Clerk user ID
      initialize(user.id);
    } else if (isLoaded && !user) {
      // Clear the store if user is not authenticated
      initialize(undefined);
    }
  }, [user, isLoaded, initialize]);

  return <>{children}</>;
}