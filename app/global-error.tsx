"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0e0d0a", color: "#f3ecdb", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: 32, margin: 0 }}>Oryz hit a problem</h1>
            <p style={{ opacity: 0.6, margin: "12px 0 24px" }}>Please reload the page.</p>
            <button onClick={reset} style={{ background: "#d9a441", color: "#0e0d0a", border: 0, borderRadius: 6, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
