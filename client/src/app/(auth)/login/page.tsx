"use client";

import React from "react";
import { LoginForm } from "@/components/ui/8bit";

export default function LoginPage() {
  return (
    <div suppressHydrationWarning className="w-full flex justify-center py-4 sm:py-6">
      <LoginForm />
    </div>
  );
}
