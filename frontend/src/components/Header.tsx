import { ReactNode } from "react"

export const Header = ({ children }: { children: ReactNode}) => {
  return (
    <header className="bg-red fixed px-8 py-4 top-0 left-0 w-screen h-[5rem] flex justify-end items-center">
      {children}
    </header>
  )
}