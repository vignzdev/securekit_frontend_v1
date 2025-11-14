"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasAuthTokenSync } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Lightweight check - only checks if token exists in cookies (no API call)
    const hasToken = hasAuthTokenSync();

    if (hasToken) {
      router.replace("/dashboard"); // user has token, redirect to dashboard
    } else {
      router.replace("/login"); // no token, redirect to login
    }
  }, [router]);

  // Avoid flicker: render nothing until redirect happens
  return null;
}
