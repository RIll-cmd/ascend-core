import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      suppressHydrationWarning
      data-mobile-shell="public"
      className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-cyan-950"
    >
      <main suppressHydrationWarning className="flex-1 flex flex-col w-full">
        {children}
      </main>
    </div>
  );
}
