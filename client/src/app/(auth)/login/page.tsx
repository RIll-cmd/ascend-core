"use client";

import { LoginForm } from "@/components/ui/8bit";
import styles from "./login.module.css";

const STATUS_ITEMS = [
  { value: "ENCRYPTED", label: "SESSION CHANNEL", color: "#00ff88" },
  { value: "19", label: "SYSTEMS ONLINE", color: "#14b6e5" },
  { value: "GUEST", label: "PROTOCOL READY", color: "#fcba28" },
] as const;

export default function LoginPage() {
  return (
    <div
      suppressHydrationWarning
      data-login-block="gateway"
      data-login-fonts="8bitcn"
      className={`${styles.login} flex min-h-full w-full flex-col items-center justify-center gap-5 px-3 py-5 sm:gap-7 sm:px-6 sm:py-8`}
    >
      <div
        data-login-block="status"
        className="grid w-full max-w-4xl grid-cols-1 border-2 border-black bg-[#141414] text-[#f9f4da] shadow-[4px_4px_0_0_#000] sm:grid-cols-3"
      >
        {STATUS_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 border-b-2 border-black px-4 py-3 last:border-b-0 sm:block sm:border-r-2 sm:border-b-0 sm:text-center sm:last:border-r-0"
          >
            <strong className="text-[11px]" style={{ color: item.color }}>
              {item.value}
            </strong>
            <span className="text-[8px] text-neutral-400 sm:mt-1 sm:block">{item.label}</span>
          </div>
        ))}
      </div>

      <LoginForm
        title="WELCOME BACK, HUNTER"
        subtitle="Authenticate your operative credentials to resume the ascension protocol"
        imageSrc="/ancient_library_pixel.png"
      />
    </div>
  );
}
