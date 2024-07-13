import Header from "../../../components/Header"
import { Outlet } from "react-router-dom"

export const Layout = () => {
  return (
    <>
    <Header />
    <main className="pt-[5rem] w-full mx-auto px-4">
      <Outlet />
    </main>
    </>
  )
}