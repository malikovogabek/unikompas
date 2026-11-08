import { z } from 'zod'

/**
 * Client-side validation mirroring the backend rules (RegisterRequest / LoginRequest).
 * Messages are i18n keys; the form translates them.
 */
export const loginSchema = z.object({
  email: z.string().trim().min(1, 'validation.required').email('validation.email'),
  password: z.string().min(1, 'validation.required'),
})

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'validation.minLength').max(120, 'validation.maxLength'),
  email: z.string().trim().min(1, 'validation.required').email('validation.email').max(160, 'validation.maxLength'),
  password: z
    .string()
    .min(8, 'validation.minLength')
    .max(72, 'validation.maxLength')
    .refine((v) => new TextEncoder().encode(v).length <= 72, 'validation.MaxBytes')
    .refine((v) => /\p{L}/u.test(v) && /\d/.test(v), 'validation.passwordRule'),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>

/** Interpolation values for length messages. */
export const LIMITS: Record<string, Record<string, number>> = {
  fullName: { min: 2, max: 120 },
  email: { max: 160 },
  password: { min: 8, max: 72 },
}
