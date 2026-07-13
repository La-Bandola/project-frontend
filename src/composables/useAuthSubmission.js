import { ref } from 'vue'

import { getAuthErrorMessage } from '@/utils/authErrors.js'

/**
 * @typedef {{
 *   onSubmit: () => Promise<unknown>,
 *   fallbackError: string,
 * }} UseAuthSubmissionOptions
 */

/**
 * Shared submission handler for auth forms.
 *
 * @param {UseAuthSubmissionOptions} options
 * @returns {{ error: import('vue').Ref<string | null>, submit: (payload?: unknown) => Promise<boolean> }}
 */
export const useAuthSubmission = ({ onSubmit, fallbackError }) => {
  const error = ref(null)

  const submit = async (payload) => {
    try {
      await onSubmit(payload)
      error.value = null
      return true
    } catch (err) {
      error.value = getAuthErrorMessage(fallbackError, err)
      return false
    }
  }

  return {
    error,
    submit,
  }
}
