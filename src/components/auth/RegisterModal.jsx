import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../lib/http'
import { zodResolver } from '../../lib/zodResolver'
import { FormMessage } from '../ui/FormMessage'
import { Modal } from '../ui/Modal'
import { SubmitButton } from '../ui/SubmitButton'
import { TextField } from '../ui/TextField'

const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const schema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
    password: z.string().min(3, 'Password must be at least 3 characters'),
    passwordConfirmation: z.string().min(1, 'Please confirm your password'),
  })
  // The API calls this one password_confirmation — the single snake_case field
  // in the whole API — and api/auth.ts does that renaming on the way out.
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Passwords do not match',
  })

/** Field names the API can send 422 messages for, mapped onto this form. */

const SERVER_FIELDS = {
  username: 'username',
  email: 'email',
  password: 'password',
  password_confirmation: 'passwordConfirmation',
}

export function RegisterModal() {
  const { signUp, closeModal, openLogin } = useAuth()
  const [formError, setFormError] = useState(null)
  // The avatar sits outside react-hook-form: it is a File with its own preview
  // and its own format rule, not a text input.
  const [avatar, setAvatar] = useState(null)
  const [avatarError, setAvatarError] = useState(null)
  const fileInputRef = useRef(null)
  // Derived rather than held in state, so picking a file is a single render.
  const preview = useMemo(() => (avatar ? URL.createObjectURL(avatar) : null), [avatar])
  // Whichever URL is current gets revoked when it is replaced and when the
  // modal closes, so repeated picks do not leak blobs.
  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '', passwordConfirmation: '' },
  })
  const isValid = (name) =>
    touchedFields[name] === true && !errors[name] && getValues(name).length > 0
  function onPickAvatar(event) {
    const file = event.target.files?.[0] ?? null
    if (!file) return
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Avatar must be a JPG, PNG or WEBP image')
      setAvatar(null)
      // Clear the input so picking the same bad file again still fires onChange.
      event.target.value = ''
      return
    }
    setAvatarError(null)
    setAvatar(file)
  }
  async function onSubmit(values) {
    setFormError(null)
    try {
      await signUp({ ...values, avatar })
    } catch (error) {
      if (error instanceof ApiError && error.isFieldError) {
        for (const [apiField, formField] of Object.entries(SERVER_FIELDS)) {
          const message = error.fieldError(apiField)
          if (message) setError(formField, { type: 'server', message })
        }
        const avatarMessage = error.fieldError('avatar')
        if (avatarMessage) setAvatarError(avatarMessage)
        return
      }
      setFormError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      )
    }
  }
  return (
    <Modal
      title="Sign up"
      subtitle="Welcome to Kino XII"
      onClose={closeModal}
      widthClass="w-[528px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-6">
        <div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload avatar"
              className="size-11 shrink-0 overflow-hidden rounded-xl bg-surface text-ink-muted transition-colors hover:text-ink"
            >
              {preview ? (
                <img src={preview} alt="" className="size-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="mx-auto size-5">
                  <path
                    d="M12 16V4m0 0L8 8m4-4 4 4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <div className="min-w-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="block text-left text-base font-bold transition-opacity hover:opacity-80"
              >
                Upload avatar (optional)
              </button>
              <p className="truncate text-sm text-ink-muted">
                {avatar ? avatar.name : 'JPG, PNG or WEBP'}
              </p>
            </div>

            {avatar && (
              <button
                type="button"
                onClick={() => {
                  setAvatar(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="ml-auto text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
              >
                Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPickAvatar}
            className="hidden"
          />

          {avatarError && (
            <p role="alert" className="mt-2 text-xs text-brand">
              {avatarError}
            </p>
          )}
        </div>

        <TextField
          label="Username"
          autoComplete="username"
          placeholder="User"
          error={errors.username?.message}
          valid={isValid('username')}
          {...register('username')}
        />

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          error={errors.email?.message}
          valid={isValid('email')}
          {...register('email')}
        />

        {/* The design puts these two side by side, 12px apart. */}
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            valid={isValid('password')}
            {...register('password')}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.passwordConfirmation?.message}
            valid={isValid('passwordConfirmation')}
            {...register('passwordConfirmation')}
          />
        </div>

        {formError && <FormMessage>{formError}</FormMessage>}

        <SubmitButton pending={isSubmitting} pendingLabel="Creating account…">
          Sign up
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <button
          type="button"
          onClick={openLogin}
          className="font-bold text-brand transition-opacity hover:opacity-80"
        >
          Log in
        </button>
      </p>
    </Modal>
  )
}
