"use client";

/** The root layout itself failed: a bare page (no app styles are guaranteed here). */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
	return (
		<html lang="en">
			<body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, padding: 16 }}>
				<div style={{ textAlign: "center", maxWidth: 420 }}>
					<h1 style={{ fontSize: 24, color: "#002c17" }}>Something went wrong</h1>
					<p style={{ color: "#696969" }}>Fysi couldn’t load. Try again in a moment.</p>
					<button
						type="button"
						onClick={retry}
						style={{ marginTop: 16, padding: "12px 24px", borderRadius: 999, border: 0, background: "#003e20", color: "#fff", fontSize: 16, cursor: "pointer" }}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	);
}
