import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'dark'
}

export const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => (
  <button
    className={`inline-flex cursor-pointer items-center justify-center gap-1 rounded-md border px-4 py-2 text-sm font-semibold transition
      focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:ring-offset-2
      ${variant === 'primary'
        ? 'bg-(--color-primary) text-(--color-text) hover:bg-(--color-light) border-transparent'
        : 'bg-(--color-dark) text-(--color-text) hover:bg-slate-900 border-transparent'}
      ${className}`}
    {...props}
  />
)