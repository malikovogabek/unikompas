import { AxiosError, AxiosHeaders } from 'axios'
import i18n from '@/i18n'
import { errorMessage, fieldErrors } from './useApiErrorMessage'

function axiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError('fail', 'ERR', undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  })
  return err
}

describe('API error mapping', () => {
  beforeAll(() => i18n.changeLanguage('en'))

  it('translates backend error codes', () => {
    const t = i18n.t.bind(i18n)
    expect(errorMessage(t, axiosError(409, { error: 'EMAIL_TAKEN', status: 409 }))).toBe(
      'An account with this email already exists',
    )
  })

  it('falls back for unknown codes and reports network errors', () => {
    const t = i18n.t.bind(i18n)
    expect(errorMessage(t, axiosError(418, { error: 'SOMETHING_NEW', status: 418 }))).toBe('An unexpected error occurred')
    expect(errorMessage(t, new AxiosError('Network Error', 'ERR_NETWORK'))).toBe('Cannot reach the server. Check your connection')
  })

  it('translates field constraint codes', () => {
    const t = i18n.t.bind(i18n)
    const err = axiosError(400, { error: 'VALIDATION_ERROR', fieldErrors: { email: 'Email', shortName: 'Unique' } })
    expect(fieldErrors(t, err)).toEqual({ email: 'Invalid email address', shortName: 'This value is already taken' })
  })
})
