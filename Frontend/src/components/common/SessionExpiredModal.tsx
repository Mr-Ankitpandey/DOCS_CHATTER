import { useNavigate } from "react-router-dom"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { dismissSessionExpired } from "@/features/auth/authSlice"

export default function SessionExpiredModal() {
  const sessionExpired = useAppSelector((s) => s.auth.sessionExpired)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const close = () => dispatch(dismissSessionExpired())

  const goToLogin = () => {
    close()
    navigate("/login")
  }

  return (
    <AlertDialog open={sessionExpired} onOpenChange={(open) => !open && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your session has expired</AlertDialogTitle>
          <AlertDialogDescription>
            For your security, you've been signed out. Please log in again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={close}>Close</AlertDialogCancel>
          <AlertDialogAction
            onClick={goToLogin}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90"
          >
            Log in
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
