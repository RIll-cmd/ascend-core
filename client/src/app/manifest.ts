import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ascend OS - Continuous Progression Platform",
    short_name: "Ascend OS",
    description: "Gamified SaaS architecture and personal progression life operating system.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1020",
    theme_color: "#06b6d4",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
