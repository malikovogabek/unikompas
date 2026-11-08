import { profileSchema } from './profileSchema'

const base = {
  regionId: '1', firstSubjectId: '1', secondSubjectId: '2', expectedScore: '150,5',
  preferredLanguage: '' as const, preferredStudyForm: '' as const, willingToRelocate: true, fieldIds: [],
}

describe('profileSchema', () => {
  it('ignores a leftover invalid budget when contract is not an option', () => {
    expect(profileSchema.safeParse({ ...base, financing: 'GRANT_ONLY', maxContractFee: 'abc' }).success).toBe(true)
  })

  it('validates the budget for contract financing', () => {
    const r = profileSchema.safeParse({ ...base, financing: 'CONTRACT_OK', maxContractFee: 'abc' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0]?.path).toEqual(['maxContractFee'])
  })

  it('rejects the same subject twice', () => {
    const r = profileSchema.safeParse({ ...base, secondSubjectId: '1', financing: 'GRANT_ONLY', maxContractFee: '' })
    expect(r.error?.issues[0]?.message).toBe('validation.DistinctSubjects')
  })
})
