import { useLocation, useNavigate, type Location } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

import { useLogin } from '../hooks/useLogin'

type LoginFormValues = {
  email: string
  password: string
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const state = location.state as { from?: Location }
  const redirectTo = state?.from?.pathname ?? '/'

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values)
      navigate(redirectTo, { replace: true })
    } catch {
      setError('root', { message: 'Invalid email or password.' })
    }
  }

  return (
    <div className="min-h-screen bg-(--color-primary)">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-(--color-bg) p-8">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-600">HRMS</p>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="email"
              type="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address.'
                }
              })}
            />
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required.',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters.'
                }
              })}
            />

            {errors.root?.message ? (
              <div className="rounded-md border  bg-red-50 px-3 py-2 text-xs text-red-600">
                {errors.root.message}
              </div>
            ) : null}

            <Button type="submit" className="w-50  border p-2 rounded bg-(--color-light) hover:bg-(--color-primary) transition-colors hover:text-(--color-text) cursor-pointer" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}