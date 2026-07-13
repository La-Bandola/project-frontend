import { useAuthSubmission } from './useAuthSubmission'

describe('useAuthSubmission', () => {
  it('returns the fallback error message for non-401 failures', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('boom'))
    const { error, submit } = useAuthSubmission({
      onSubmit,
      fallbackError: 'Error de ejemplo',
    })

    const result = await submit({ username: 'demo' })

    expect(result).toBe(false)
    expect(error.value).toBe('Error de ejemplo')
  })

  it('returns the invalid-credentials message for 401 responses', async () => {
    const onSubmit = jest.fn().mockRejectedValue({ response: { status: 401 } })
    const { error, submit } = useAuthSubmission({
      onSubmit,
      fallbackError: 'Error de ejemplo',
    })

    const result = await submit({ username: 'demo' })

    expect(result).toBe(false)
    expect(error.value).toBe('Credenciales incorrectas')
  })
})
