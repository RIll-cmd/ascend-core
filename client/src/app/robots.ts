import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ascend-os.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/landing", "/login", "/register", "/privacy", "/terms", "/refund"],
        disallow: ["/api/*", "/dashboard/*", "/inventory/*", "/tower/*", "/workouts/*", "/habits/*", "/profile/*", "/settings/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
