import { defineRule, configure } from 'vee-validate'
import { all } from '@vee-validate/rules'

/**
 * Configure Vee-Validate with standard validation rules and user-friendly messages.
 */
export function setupVeeValidate() {
  // Register all official rules from @vee-validate/rules (required, email, min, max, etc.)
  Object.entries(all).forEach(([ruleName, ruleFn]) => {
    defineRule(ruleName, ruleFn)
  })

  // Global Vee-Validate configuration
  configure({
    generateMessage: (context) => {
      const params = Array.isArray(context.rule?.params)
        ? context.rule.params
        : Object.values(context.rule?.params || {})
      const limit = params[0] ?? ''

      const messages: Record<string, string> = {
        required: `This field is required.`,
        email: `Please enter a valid email address.`,
        min: `This field must have at least ${limit} characters.`,
        max: `This field cannot exceed ${limit} characters.`,
      }

      return messages[context.rule?.name || ''] || `The ${context.field} field is invalid.`
    },
    validateOnInput: true,
  })
}
