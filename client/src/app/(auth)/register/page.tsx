"use client";

import React from "react";
import { AuthCard } from "@/components/v2/auth/AuthCard";

export default function RegisterPage() {
  return (
    <div suppressHydrationWarning className="w-full flex justify-center">
      <AuthCard initialTab="register" diamondSpinner />
    </div>
  );
}
