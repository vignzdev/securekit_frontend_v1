"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const result = await isAuthenticated();
        if (!mounted) return;
        if (result?.authenticated) {
          router.replace("/dashboard"); // user is logged in
        } else {
          router.replace("/login"); // not logged in
        }
      } catch (err) {
        if (mounted) router.replace("/login");
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Avoid flicker: render nothing until redirect happens
  return null;
}
