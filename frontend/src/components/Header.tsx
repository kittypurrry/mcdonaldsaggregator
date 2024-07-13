import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Logo } from './Icons/Logo'
import { DynamicWidget, useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { useEffect, useState } from 'react';
import { UserSelectionModal } from './User/UserSelectionModal';

export default function Header() {

  const isLoggedIn = useIsLoggedIn();
  const { handleLogOut } = useDynamicContext();
  const { user } = useDynamicContext();

  const [showUserSelectionModal, setShowUserSelectionModal] = useState<boolean>(false)

  useEffect(() => {
    // @ts-ignore
    if (user && !user?.metadata?.userType) {
      setShowUserSelectionModal(true)
    } else {
      setShowUserSelectionModal(false)
    }
  }, [user])


  return (
    <>
    <Disclosure as="nav" className="bg-white">
      <div className="bg-red fixed top-0 left-0 w-screen px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex gap-x-8 items-center">
              <Logo />
              <h1 className="font-bold text-[#FFF] text-lg mt-1">Mcdonalds Aggregator</h1>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:block">
            <div className="flex items-center">

              {/* Profile dropdown */}
              { isLoggedIn ?
              <Menu as="div" className="relative ml-3">
                <div>
                  <MenuButton className="relative flex rounded-full ring-0 ring-red border-0 bg-red text-sm outline-none focus:outline-none hover:outline-none">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <Bars3Icon width={24} color="white" />
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md border border-red bg-white py-1 shadow-lg ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <MenuItem>
                    <a href="#" className="block px-4 py-2 text-sm text-black data-[focus]:bg-accentYellow data-[focus]:text-black">
                      Edit Profile
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a onClick={handleLogOut} className="cursor-pointer block px-4 py-2 text-sm text-black  data-[focus]:bg-accentYellow data-[focus]:text-black">
                      Sign out
                    </a>
                  </MenuItem>
                </MenuItems>
              </Menu> :
              <DynamicWidget />
              }
            </div>
          </div>
          <div className="-mr-2 flex sm:hidden">
            {/* Mobile menu button */}
            <DisclosureButton className="group border-0 ring-0 outline-0 relative text-white bg-transparent inline-flex items-center justify-center rounded-md p-2">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              {/* Profile dropdown */}
              { isLoggedIn ?
                <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
                : 
                <div className="block h-6 w-6 group-data-[open]:hidden">
                  <DynamicWidget />
                </div>
              }
              <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
            </DisclosureButton>
          </div>
        </div>
      </div>

      {/** Mobile dropdown */}
      <DisclosurePanel className="sm:hidden">
        <div>
          <div className="fixed top-0 left-0 w-full mt-[4rem] bg-white border-b border-red space-y-1 px-2 rounded-md py-4">
            <DisclosureButton
              as="a"
              href="#"
              className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-accentYellow hover:text-black"
            >
              Your Profile
            </DisclosureButton>
            <DisclosureButton
              as="a"
              onClick={handleLogOut}
              className="cursor-pointer block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-accentYellow hover:text-black"
            >
              Sign out
            </DisclosureButton>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>

    { showUserSelectionModal && 
      <UserSelectionModal setCloseSelection={setShowUserSelectionModal} />
    }
    </>
  )
}
