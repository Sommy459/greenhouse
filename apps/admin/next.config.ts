import type { NextConfig } from "next";

/**
 * The external Fysi API (separate repo). API_PROXY_TARGET is its base URL, e.g. https://api.example.com/api/v1.
 * The browser calls this app's same-origin `/api/v1` proxy below, so CORS never applies in dev, on the LAN or on
 * previews. NEXT_PUBLIC_API_URL forces direct calls instead (the API must then allow this origin).
 */
const API_ORIGIN = process.env.API_PROXY_TARGET;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const nextConfig: NextConfig = {
	// VERCEL_ENV inlined for client code too (lib/site.ts picks production URLs with it).
	env: { NEXT_PUBLIC_API_URL: API_URL, NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "" },
	// A separate output dir for one-off verification builds (`NEXT_DIST_DIR=.next-verify next build`)
	// so they never overwrite the `.next` a running `pnpm dev` is serving from.
	distDir: process.env.NEXT_DIST_DIR || ".next",
	reactCompiler: true,
	transpilePackages: ["@repo/ui"],
	// Dev only: let a phone on the LAN load dev assets / HMR (mobile web is a first-class target).
	allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
	async rewrites() {
		return API_ORIGIN ? [{ source: "/api/v1/:path*", destination: `${API_ORIGIN}/:path*` }] : [];
	},
};

export default nextConfig;
