import { DynamicWidget } from "@dynamic-labs/sdk-react-core"
import { Header } from "../../../components/Header"
import { ReactNode } from "react"

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
    <Header>
      <DynamicWidget />
    </Header>

    <main className="mt-[6rem] w-full mx-auto px-4">
      {children}
    </main>
    </>
  )
}