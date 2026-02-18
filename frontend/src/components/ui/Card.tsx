import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={`rounded-2xl border border-slate-200 bg-(--color-text) p-6 text-(--color-dark) shadow-sm ${className}`}
    {...props}
  />
)