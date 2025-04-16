'use client'

import Link from "next/link";

export default function Home() {

  return (
    <main style={{ display: 'flex', flexDirection: 'column' }}>
      <h1>Welcome!</h1>
      <div style={{ marginTop: '2rem' }}>
          <Link href="/chat" style={{ padding: '10px 20px', border: '1px solid grey' }}>
              Go to Chat -&gt;
          </Link>
      </div>
    </main>
  );
}