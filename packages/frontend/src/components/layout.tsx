import Header from "@/front/components/header/Header"
import SignupModal from '@/front/components/modal/SignupModal';
import type { ReactNode } from "react"

//Import font
import '@fontsource/comfortaa';
import '@fontsource/montserrat';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen">
      <SignupModal />
      <Header />
      <main className="py-3 px-5 max-w-screen-2xl mx-auto">{children}</main>
    </div>
  )
}