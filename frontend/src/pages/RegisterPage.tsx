import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { usePublicRoles } from '../hooks/useRoles'
import { useRegister } from '../hooks/useRegister'

type RegisterFormValues = {
  fullName: string
  email: string
  password: string
  roleId: number
}

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const rolesQuery = usePublicRoles()
  const registerMutation = useRegister()

  const roleOptions = rolesQuery.data ?? []

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      roleId: undefined
    }
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setError('')
    try {
      await registerMutation.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        roleId: Number(values.roleId)
      })
      navigate('/login', { replace: true })
    } catch {
      setError('Unable to register with provided details.')
    }
  }

  return (
    <div className="min-h-screen bg-(--color-primary)">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-600">HRMS</p>
            <h1 className="text-2xl font-semibold text-slate-900">Create an account</h1>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full name"
              error={errors.fullName?.message}
              {...register('fullName', {
                required: 'Full name is required.',
                validate: (value) => value.trim().length > 0 || 'Full name is required.'
              })}
            />
            <Input
              label="email"
              type="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required.',
                pattern: {
                  value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
                  message: 'Use a valid lowercase email address.'
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
            <Select
              label="Role"
              error={errors.roleId?.message}
              {...register('roleId', { required: 'Role is required.', valueAsNumber: true })}
            >
              <option value="">Select role</option>
              {roleOptions.map((role:any) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.name}
                </option>
              ))}
            </Select>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            ) : null}

            <Button type="submit"  className="w-50  border p-2 rounded bg-(--color-light) hover:bg-(--color-primary) transition-colors hover:text-(--color-text) cursor-pointer" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link className="font-semibold text-brand-600 hover:text-brand-700" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}