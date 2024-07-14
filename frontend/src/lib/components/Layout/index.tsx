import { Footer } from "../../../components/Footer"
import Header from "../../../components/Header"
import { Outlet } from "react-router-dom"

export const Layout = () => {
  return (
    <>
    <Header />
    <main className="pt-[6rem] w-full mx-auto px-4">
      <Outlet />
    </main>
    <Footer />
    </>
  )
}