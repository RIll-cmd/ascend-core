"use client";

import React from "react";
import { LoginForm } from "@/components/ui/8bit";
import "@/components/v2/landing/brutstack/EightBitScope.css";

export default function LoginPage() {
  return (
    <div suppressHydrationWarning className="eightbitcn-login-scope w-full flex justify-center py-4 sm:py-6">
      <LoginForm />
    </div>
  );
}
