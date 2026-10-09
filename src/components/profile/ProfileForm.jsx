import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { updateProfile } from '../../api/profile'
import { useFilterOptions } from '../../hooks/useFilterOptions'
import { ApiError } from '../../lib/http'
import { zodResolver } from '../../lib/zodResolver'
import { initials } from '../../lib/initials'
import { FormMessage } from '../ui/FormMessage'
import { SubmitButton } from '../ui/SubmitButton'
import { TextField } from '../ui/TextField'

const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** fullName, mobileNumber and dateOfBirth are what `profileComplete` is made
 *  of, so all three are required — booking stays blocked until they are set. */
const schema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  // The API requires a Georgian mobile: 9 digits starting with 5. Checking it
  // here means the user is told before a round trip, in the same words.
  mobileNumber: z
    .string()
    .regex(/^5\d{8}$/, 'Enter a Georgian mobile number: 9 digits starting with 5'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  preferredVenueId: z.string().optional(),
})

export function ProfileForm({ user, onSaved }) {
  const options = useFilterOptions()
  const [avatar, setAvatar] = useState(null)
  const [avatarError, setAvatarError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef(null)

  const preview = useMemo(() => (avatar ? URL.createObjectURL(avatar) : null), [avatar])
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
    defaultValues: {
      fullName: user.fullName ?? '',
      mobileNumber: user.mobileNumber ?? '',
      dateOfBirth: user.dateOfBirth ?? '',
      preferredVenueId: user.preferredVenue?.id ? String(user.preferredVenue.id) : '',
    },
  })

  const isValid = (name) =>
    touchedFields[name] === true && !errors[name] && (getValues(name) ?? '').length > 0

  function onPickAvatar(event) {
    const file = event.target.files?.[0] ?? null
    if (!file) return
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Avatar must be a JPG, PNG or WEBP image')
      setAvatar(null)
      event.target.value = ''
      return
    }
    setAvatarError(null)
    setAvatar(file)
  }

  async function onSubmit(values) {
    setFormError(null)
    setSaved(false)
    try {
      const updated = await updateProfile({
        ...values,
        preferredVenueId: values.preferredVenueId || null,
        avatar,
      })
      // Render from the server's response, which carries the refreshed
      // profileComplete and the derived age.
      onSaved(updated)
      setSaved(true)
      setAvatar(null)
    } catch (error) {
      if (error instanceof ApiError && error.isFieldError) {
        for (const field of ['fullName', 'mobileNumber', 'dateOfBirth', 'preferredVenueId']) {
          const message = error.fieldError(field)
          if (message) setError(field, { type: 'server', message })
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Change avatar"
          className="size-16 shrink-0 overflow-hidden rounded-xl bg-surface"
        >
          {preview || user.avatar ? (
            <img src={preview ?? user.avatar} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-base font-bold">
              {initials(user.fullName ?? user.username)}
            </span>
          )}
        </button>
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-bold transition-opacity hover:opacity-80"
          >
            Change avatar
          </button>
          <p className="text-xs text-ink-muted">{avatar ? avatar.name : 'JPG, PNG or WEBP'}</p>
          {avatarError && (
            <p role="alert" className="mt-1 text-xs text-brand">
              {avatarError}
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPickAvatar}
          className="hidden"
        />
      </div>

      <TextField
        label="Full name"
        error={errors.fullName?.message}
        valid={isValid('fullName')}
        {...register('fullName')}
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Mobile number"
          placeholder="5XXXXXXXX"
          error={errors.mobileNumber?.message}
          valid={isValid('mobileNumber')}
          {...register('mobileNumber')}
        />
        <TextField
          label="Date of birth"
          type="date"
          error={errors.dateOfBirth?.message}
          valid={isValid('dateOfBirth')}
          {...register('dateOfBirth')}
        />
      </div>

      <div>
        <label htmlFor="preferredVenueId" className="block text-sm font-semibold">
          Preferred venue
        </label>
        <select
          id="preferredVenueId"
          {...register('preferredVenueId')}
          className="mt-2 h-11 w-full rounded-xl bg-surface px-4 text-sm outline-none"
        >
          <option value="">No preference</option>
          {(options.data?.venues ?? []).map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name} — {venue.city}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-ink-dim">
        Email is fixed at registration and cannot be changed: {user.email}
      </p>

      {formError && <FormMessage>{formError}</FormMessage>}
      {saved && (
        <p role="status" className="rounded-xl bg-available/10 px-4 py-3 text-sm text-available">
          Profile saved.
        </p>
      )}

      <SubmitButton pending={isSubmitting} pendingLabel="Saving…">
        Save changes
      </SubmitButton>
    </form>
  )
}
