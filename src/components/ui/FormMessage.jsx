/** The API's own message, shown inside the modal rather than as a toast, because
 *  the rule for a failed login is: keep the modal open, keep the email, and put
 *  the message where the user is already looking. */

export function FormMessage({ children }) {
  return (
    <p role="alert" className="rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand">
      {children}
    </p>
  )
}
