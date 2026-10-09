/** React Hook Form speaks to a schema through a "resolver". @hookform/resolvers
 *  exists for this, but it is a whole dependency for the twelve lines below and
 *  zod is already in the project, so this bridges the two directly. */

export function zodResolver(schema) {
  return (values) => {
    const result = schema.safeParse(values)
    if (result.success) return { values: result.data, errors: {} }
    // First message per field wins — that is the one shown under the input.
    const errors = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (path && !(path in errors)) errors[path] = { type: issue.code, message: issue.message }
    }
    return { values: {}, errors: errors }
  }
}
