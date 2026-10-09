import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../lib/http'
import { zodResolver } from '../../lib/zodResolver'
import { FormMessage } from '../ui/FormMessage'
import { Modal } from '../ui/Modal'
import { SubmitButton } from '../ui/SubmitButton'
import { TextField } from '../ui/TextField'

/** Mirrors what the API enforces: a valid email and a password of at least 3. */

const schema = z.object({
  email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(3, 'Password must be at least 3 characters'),
})

export function LoginModal() {
  const { signIn, closeModal, openRegister } = useAuth()
  /** A failure that belongs to the form as a whole — wrong credentials, or the
   *  server being unreachable — as opposed to one field. */
  const [formError, setFormError] = useState(null)
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm({
    // This is the "errors appear ON BLUR" rule, and once a field has been
    // corrected it re-validates as the user types.
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })
  /** Green only once the field has been left and is both filled and passing. */
  const isValid = (name) =>
    touchedFields[name] === true && !errors[name] && getValues(name).length > 0
  async function onSubmit(values) {
    setFormError(null)
    try {
      await signIn(values)
      // On success the provider closes the modal, so there is nothing to do.
    } catch (error) {
      if (error instanceof ApiError && error.isFieldError) {
        // 422 with `errors`: drop each message under its own input.
        for (const field of ['email', 'password']) {
          const message = error.fieldError(field)
          if (message) setError(field, { type: 'server', message })
        }
        return
      }
      // 401 (wrong credentials), 500, or no connection: the modal stays open and
      // keeps what was typed, which is exactly what the spec asks for.
      setFormError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      )
    }
  }
  return (
    <Modal title="Log in" subtitle="Welcome back to Kino XII" onClose={closeModal}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-6">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          error={errors.email?.message}
          valid={isValid('email')}
          {...register('email')}
        />

        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          valid={isValid('password')}
          {...register('password')}
        />

        {formError && <FormMessage>{formError}</FormMessage>}

        <SubmitButton pending={isSubmitting} pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={openRegister}
          className="font-bold text-brand transition-opacity hover:opacity-80"
        >
          Sign up
        </button>
      </p>
    </Modal>
  )
}
