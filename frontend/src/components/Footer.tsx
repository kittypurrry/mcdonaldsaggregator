import { Logo } from "./Icons/Logo"

export const Footer = () => {
  return (
    <footer className="mt-6 px-4 md:px-10 py-6 bg-brightYellow flex gap-x-4 text-black items-center justify-between">
        <div className="flex gap-x-8 items-center">
            <Logo color="black" />
            <h1 className="font-bold text-black text-lg mt-1 t">Mcdonalds Aggregator</h1>
        </div>
     <span className="text-gray-900 text-xs">© 2024 McDonalds Aggregator. All rights reserved.</span>
    </footer>
  )
}