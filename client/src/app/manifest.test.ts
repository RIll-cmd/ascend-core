import { expect, it } from "vitest";
import manifest from "./manifest";

it("keeps the installed PWA branded as Ascend OS and opening at the root", () => {
  expect(manifest()).toEqual({
    name: "Ascend OS - Continuous Progression Platform",
    short_name: "Ascend OS",
    description: "Gamified SaaS architecture and personal progression life operating system.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1020",
    theme_color: "#06b6d4",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  });
});
