import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
)