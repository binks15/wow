import type { ReactNode } from 'react'

type HeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export const Header = ({ title, description, action }: HeaderProps) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
    {action ? <div>{action}</div> : null}
  </div>
)