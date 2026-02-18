import { Link } from 'react-router-dom'

export const NotFoundPage = () => (
  <div className="min-h-screen bg-(--color-primary)">
    <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">The page you're looking for doesn't exist.</p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold  text-slate-90 border bg-(--color-light) hover:bg-(--color-primary) hover:text-(--color-text) transition-all hover:border-white"
          to="/"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  </div>
)