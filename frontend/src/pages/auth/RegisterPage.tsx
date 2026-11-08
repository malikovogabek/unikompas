import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { register as registerUser } from '@/api/auth'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { queryClient } from '@/lib/queryClient'
import { homePathFor } from '@/lib/routes'
import { useAuthStore } from '@/store/authStore'
import { registerSchema, type RegisterForm } from './authSchemas'
import { PasswordField } from './PasswordField'
import { useFieldError } from './useFieldError'

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const apiError = useApiErrorMessage()
  const fieldError = useFieldError()
  const { register, handleSubmit, formState } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (auth) => {
      setSession(auth)
      queryClient.setQueryData(['me'], auth.user)
      void navigate(homePathFor(auth.user.role), { replace: true })
    },
  })
  const server = mutation.isError ? apiError.fields(mutation.error) : {}

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-text">{t('auth.register.title')}</h1>
      <p className="mt-2 text-muted">{t('auth.register.subtitle')}</p>

      <form className="mt-8 flex flex-col gap-5" noValidate onSubmit={handleSubmit((v) => mutation.mutate(v), () => mutation.reset())}>
        {mutation.isError && <Alert tone="error">{apiError.message(mutation.error)}</Alert>}
        <TextField
          label={t('auth.fields.fullName')}
          autoComplete="name"
          error={fieldError('fullName', formState.errors.fullName, server.fullName)}
          {...register('fullName')}
        />
        <TextField
          label={t('auth.fields.email')}
          type="email"
          autoComplete="email"
          error={fieldError('email', formState.errors.email, server.email)}
          {...register('email')}
        />
        <PasswordField
          label={t('auth.fields.password')}
          autoComplete="new-password"
          hint={t('auth.fields.passwordHint')}
          error={fieldError('password', formState.errors.password, server.password)}
          {...register('password')}
        />
        <Button type="submit" size="lg" loading={mutation.isPending}>
          {t('auth.register.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t('auth.register.hasAccount')}{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          {t('auth.register.loginLink')}
        </Link>
      </p>
    </div>
  )
}
