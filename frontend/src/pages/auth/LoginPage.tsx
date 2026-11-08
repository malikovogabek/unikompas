import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router'
import { login } from '@/api/auth'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { queryClient } from '@/lib/queryClient'
import { homePathFor } from '@/lib/routes'
import { useAuthStore } from '@/store/authStore'
import { loginSchema, type LoginForm } from './authSchemas'
import { PasswordField } from './PasswordField'
import { useFieldError } from './useFieldError'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const apiError = useApiErrorMessage()
  const fieldError = useFieldError()
  const { register, handleSubmit, formState } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (auth) => {
      setSession(auth)
      const from = (location.state as { from?: string } | null)?.from
      queryClient.setQueryData(['me'], auth.user)
      void navigate(from ?? homePathFor(auth.user.role), { replace: true })
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-text">{t('auth.login.title')}</h1>
      <p className="mt-2 text-muted">{t('auth.login.subtitle')}</p>

      <form className="mt-8 flex flex-col gap-5" noValidate onSubmit={handleSubmit((v) => mutation.mutate(v), () => mutation.reset())}>
        {mutation.isError && <Alert tone="error">{apiError.message(mutation.error)}</Alert>}
        <TextField
          label={t('auth.fields.email')}
          type="email"
          autoComplete="email"
          error={fieldError('email', formState.errors.email)}
          {...register('email')}
        />
        <PasswordField
          label={t('auth.fields.password')}
          autoComplete="current-password"
          error={fieldError('password', formState.errors.password)}
          {...register('password')}
        />
        <Button type="submit" size="lg" loading={mutation.isPending}>
          {t('auth.login.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          {t('auth.login.registerLink')}
        </Link>
      </p>
      {import.meta.env.DEV && <p className="mt-4 text-center text-xs text-muted">{t('auth.demoHint')}</p>}
    </div>
  )
}
