"use client";

import {
  RequestResetForm,
  ResetPasswordForm,
} from "@/components/auth/resetPasswordForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="w-full max-w-sm">
      {token ? <ResetPasswordForm token={token} /> : <RequestResetForm />}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Suspense
        fallback={
          <div className="w-full max-w-sm">
            <RequestResetForm />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
