"use client";

// Catches errors in the root layout itself; must render its own <html>/<body>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fff7ed", color: "#0B0B0F" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Something glitched</h1>
          <p style={{ marginTop: "0.5rem", color: "rgba(11,11,15,0.6)" }}>Please try again.</p>
          <button
            onClick={() => reset()}
            style={{ marginTop: "1.5rem", border: "3px solid #0B0B0F", boxShadow: "0 6px 0 0 #0B0B0F", borderRadius: "1rem", background: "#0B0B0F", color: "#fff", padding: "0.75rem 1.25rem", fontWeight: 700, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
