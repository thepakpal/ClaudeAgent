export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-paper px-4">
      <form
        action="/api/login"
        method="POST"
        className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-ink mb-1">Job Match Board</h1>
        <p className="text-sm text-slate-500 mb-5">Enter your password to continue.</p>
        {searchParams?.error && (
          <p className="text-sm text-red-600 mb-3">Wrong password. Try again.</p>
        )}
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="w-full bg-accent text-white rounded-lg py-2 text-sm font-semibold hover:opacity-90"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
