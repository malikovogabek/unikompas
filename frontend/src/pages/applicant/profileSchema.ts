import { z } from 'zod'

/** Form values are strings (native inputs); they are converted to the API shape on submit. */
export const profileSchema = z
  .object({
    regionId: z.string().min(1, 'validation.required'),
    firstSubjectId: z.string().min(1, 'validation.required'),
    secondSubjectId: z.string().min(1, 'validation.required'),
    expectedScore: z
      .string()
      .trim()
      .min(1, 'validation.required')
      .refine((v) => /^\d{1,3}([.,]\d)?$/.test(v), 'validation.Digits')
      .refine((v) => Number(v.replace(',', '.')) <= 189, 'validation.DecimalMax'),
    preferredLanguage: z.enum(['', 'UZ', 'RU', 'EN']),
    preferredStudyForm: z.enum(['', 'FULL_TIME', 'PART_TIME', 'EVENING', 'DISTANCE']),
    financing: z.enum(['GRANT_ONLY', 'CONTRACT_OK']),
    maxContractFee: z.string().trim().refine((v) => v === '' || /^\d{1,12}$/.test(v.replace(/\s/g, '')), 'validation.PositiveOrZero'),
    willingToRelocate: z.boolean(),
    fieldIds: z.array(z.string()).max(5, 'validation.Max'),
  })
  .refine((v) => !v.firstSubjectId || v.firstSubjectId !== v.secondSubjectId, {
    path: ['secondSubjectId'],
    message: 'validation.DistinctSubjects',
  })

export type ProfileForm = z.infer<typeof profileSchema>
