import { Route, Routes } from "react-router-dom"

import ProtectedRoute from "@/components/common/ProtectedRoute"
import SessionExpiredModal from "@/components/common/SessionExpiredModal"
import AppLayout from "@/components/layout/AppLayout"
import LoginPage from "@/features/auth/pages/LoginPage"
import SignupPage from "@/features/auth/pages/SignupPage"
import ChatPage from "@/features/chats/pages/ChatPage"
import EmptyChatPage from "@/features/chats/pages/EmptyChatPage"
import LandingPage from "@/features/landing/pages/LandingPage"

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<EmptyChatPage />} />
            <Route path="/dashboard/chats/:chatId" element={<ChatPage />} />
          </Route>
        </Route>
      </Routes>

      <SessionExpiredModal />
    </>
  )
}
