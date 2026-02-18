import { Link } from 'react-router-dom'

export const AccessDeniedPage = () => (
  <div className="min-h-screen bg-(--color-primary)">
    <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
        <p className="mt-2 text-sm text-slate-500">You don't have permission to view this page.</p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold bg-(--color-primary) hover:bg-brand-700"
          to="/"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  </div>
)