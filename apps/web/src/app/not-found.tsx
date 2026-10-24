import Link from "next/link";
export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", padding: "15vh 8vw", background: "#0d1312", color: "#ecf6eb" }}>
      <p style={{ color: "#b6f05d" }}>IFTECH / 404</p>
      <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}>Page not available.</h1>
      <p>This workspace is not publicly available.</p>
      <Link href="/en" style={{ color: "#b6f05d" }}>Return to homepage →</Link>
    </main>
  );
}
