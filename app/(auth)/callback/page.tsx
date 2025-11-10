"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if there's an error in the query params
        const error = searchParams.get("error");
        if (error) {
          setStatus("error");
          setMessage("Authentication failed. Please try again.");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          return;
        }

        // Get accessToken from query params
        const accessToken = searchParams.get("accessToken");
        if (accessToken) {
          // Set the token as a cookie for the API interceptor to use
          const expiryDate = new Date();
          expiryDate.setTime(expiryDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
          document.cookie = `accessToken=${encodeURIComponent(
            accessToken
          )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

          // Clean up URL by removing query params
          window.history.replaceState({}, "", "/auth/callback");

          // Use hard redirect to ensure cookie is sent
          window.location.href = "/dashboard";
          return;
        }

        // If no token, check if already authenticated (cookie might be set by backend)
        await new Promise((resolve) => setTimeout(resolve, 500));
        const { authenticated } = await isAuthenticated();

        if (authenticated) {
          setStatus("success");
          setMessage("Authentication successful! Redirecting...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
        } else {
          setStatus("error");
          setMessage("Authentication failed. Please try again.");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      } catch (error) {
        console.error("Callback error:", error);
        setStatus("error");
        setMessage("An error occurred. Please try again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}
        {status === "success" && (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center p-6">
          <div className="w-full max-w-sm text-center">
            <div className="space-y-4">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
