import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">EduForge</h1>
        <p className="text-center mb-8 text-lg">
          Transform any learning goal into a complete, adaptive learning experience
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/signin"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}

