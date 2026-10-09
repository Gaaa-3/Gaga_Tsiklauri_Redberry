import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ApiError } from '../../lib/http'
import { zodResolver } from '../../lib/zodResolver'
import { FormMessage } from '../ui/FormMessage'
import { SubmitButton } from '../ui/SubmitButton'
import { TextField } from '../ui/TextField'

/** Payment is simulated by the API — only the last four digits are kept — but
 *  the card fields are still validated properly, because an obviously fake
 *  checkout reads as unfinished. */
const schema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  mobileNumber: z
    .string()
    .regex(/^5\d{8}$/, 'Enter a Georgian mobile number: 9 digits starting with 5'),
  cardNumber: z
    .string()
    .transform((value) => value.replace(/\s+/g, ''))
    .pipe(z.string().regex(/^\d{16}$/, 'Card number must be 16 digits')),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
})

export function CheckoutForm({ user, holdId, subtotal, onPaid, createOrder }) {
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
      // Prefilled from the profile — the account already knows these.
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      mobileNumber: user?.mobileNumber ?? '',
      cardNumber: '',
      expiry: '',
      cvv: '',
    },
  })

  const isValid = (name) =>
    touchedFields[name] === true && !errors[name] && (getValues(name) ?? '').length > 0

  async function onSubmit(values) {
    try {
      const order = await createOrder({ holdId, ...values })
      onPaid(order)
    } catch (error) {
      if (error instanceof ApiError && error.isFieldError) {
        for (const field of Object.keys(schema.shape)) {
          const message = error.fieldError(field)
          if (message) setError(field, { type: 'server', message })
        }
        return
      }
      // 409 (a seat went while paying), 422 rule errors and anything else are
      // handed back to the modal, which owns recovery.
      onPaid(null, error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <TextField
        label="Full name"
        error={errors.fullName?.message}
        valid={isValid('fullName')}
        {...register('fullName')}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Email"
          type="email"
          error={errors.email?.message}
          valid={isValid('email')}
          {...register('email')}
        />
        <TextField
          label="Mobile number"
          error={errors.mobileNumber?.message}
          valid={isValid('mobileNumber')}
          {...register('mobileNumber')}
        />
      </div>

      <div className="border-t border-line/60 pt-5">
        <p className="text-[11px] font-bold tracking-[0.14em] text-ink-dim uppercase">Payment</p>
        <TextField
          label="Card number"
          inputMode="numeric"
          placeholder="4242 4242 4242 4242"
          className="mt-3"
          error={errors.cardNumber?.message}
          valid={isValid('cardNumber')}
          {...register('cardNumber')}
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <TextField
            label="Expiry"
            placeholder="MM/YY"
            error={errors.expiry?.message}
            valid={isValid('expiry')}
            {...register('expiry')}
          />
          <TextField
            label="CVV"
            inputMode="numeric"
            placeholder="123"
            error={errors.cvv?.message}
            valid={isValid('cvv')}
            {...register('cvv')}
          />
        </div>
      </div>

      {!user?.profileComplete && (
        <FormMessage>Complete your profile before buying tickets.</FormMessage>
      )}

      <SubmitButton
        pending={isSubmitting}
        disabled={!user?.profileComplete}
        pendingLabel="Paying…"
      >
        Pay ₾{subtotal}
      </SubmitButton>
    </form>
  )
}
